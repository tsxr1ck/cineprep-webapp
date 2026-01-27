import { Router, Request, Response } from 'express';
import { Pool } from 'pg';

const router = Router();

// Asumiendo que tienes un pool de PostgreSQL configurado
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// ============================================
// TYPES
// ============================================

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}

// ============================================
// MIDDLEWARE: Authenticate (Supabase JWT)
// ============================================

async function authenticate(req: AuthenticatedRequest, res: Response, next: Function) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'No authentication token provided'
            });
        }

        const token = authHeader.substring(7);

        // Verify Supabase JWT token
        // Opción 1: Usando Supabase Admin SDK
        const { createClient } = require('@supabase/supabase-js');
        const supabaseAdmin = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key
        );

        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid or expired token'
            });
        }

        // Verificar que el usuario existe en nuestra DB
        const userQuery = await pool.query(
            'SELECT id, email FROM users WHERE email = $1 AND is_active = true',
            [user.email]
        );

        if (userQuery.rows.length === 0) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not found in database'
            });
        }

        req.user = userQuery.rows[0];
        next();

    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication failed'
        });
    }
}

// ============================================
// GET /api/user/membership
// Returns user's membership, plan, and current usage
// ============================================

router.get('/membership', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id;

        // Query membership with plan details and current usage
        const query = `
            WITH current_membership AS (
                SELECT 
                    m.id as membership_id,
                    m.status,
                    m.billing_cycle,
                    m.current_period_start,
                    m.current_period_end,
                    m.cancel_at_period_end,
                    p.id as plan_id,
                    p.name as plan_name,
                    p.slug as plan_slug,
                    p.description as plan_description,
                    p.price_monthly,
                    p.price_yearly,
                    p.max_analyses_per_month,
                    p.max_audio_generations_per_month,
                    p.can_access_premium_voices,
                    p.can_force_regenerate,
                    p.priority_queue,
                    p.features
                FROM memberships m
                JOIN plans p ON m.plan_id = p.id
                WHERE m.user_id = $1
                  AND m.status = 'active'
                ORDER BY m.created_at DESC
                LIMIT 1
            ),
            current_usage AS (
                SELECT 
                    analyses_generated,
                    audio_generated,
                    tokens_consumed,
                    period_start,
                    period_end
                FROM usage_tracking
                WHERE user_id = $1
                  AND period_start <= CURRENT_DATE
                  AND period_end >= CURRENT_DATE
            )
            SELECT 
                cm.*,
                COALESCE(cu.analyses_generated, 0) as analyses_generated,
                COALESCE(cu.audio_generated, 0) as audio_generated,
                COALESCE(cu.tokens_consumed, 0) as tokens_consumed,
                cu.period_start,
                cu.period_end
            FROM current_membership cm
            LEFT JOIN current_usage cu ON true;
        `;

        const result = await pool.query(query, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'No active membership found for user'
            });
        }

        const row = result.rows[0];

        // Format response
        const response = {
            membership: {
                id: row.membership_id,
                status: row.status,
                billing_cycle: row.billing_cycle,
                current_period_start: row.current_period_start,
                current_period_end: row.current_period_end,
                cancel_at_period_end: row.cancel_at_period_end,
                plan: {
                    id: row.plan_id,
                    name: row.plan_name,
                    slug: row.plan_slug,
                    description: row.plan_description,
                    price_monthly: parseFloat(row.price_monthly),
                    price_yearly: parseFloat(row.price_yearly),
                    max_analyses_per_month: row.max_analyses_per_month,
                    max_audio_generations_per_month: row.max_audio_generations_per_month,
                    can_access_premium_voices: row.can_access_premium_voices,
                    can_force_regenerate: row.can_force_regenerate,
                    priority_queue: row.priority_queue,
                    features: row.features
                }
            },
            usage: {
                analyses_generated: row.analyses_generated,
                audio_generated: row.audio_generated,
                tokens_consumed: row.tokens_consumed,
                period_start: row.period_start,
                period_end: row.period_end
            }
        };

        res.json(response);

    } catch (error) {
        console.error('Error fetching membership:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch membership data'
        });
    }
});

// ============================================
// GET /api/user/usage
// Returns only current usage for the month
// (Lighter endpoint for frequent polling)
// ============================================

router.get('/usage', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id;

        const query = `
            SELECT 
                analyses_generated,
                audio_generated,
                tokens_consumed,
                period_start,
                period_end,
                last_reset_at
            FROM usage_tracking
            WHERE user_id = $1
              AND period_start <= CURRENT_DATE
              AND period_end >= CURRENT_DATE;
        `;

        const result = await pool.query(query, [userId]);

        if (result.rows.length === 0) {
            // Create usage tracking if it doesn't exist
            const createQuery = `
                INSERT INTO usage_tracking (
                    user_id,
                    period_start,
                    period_end,
                    analyses_generated,
                    audio_generated,
                    tokens_consumed
                )
                VALUES (
                    $1,
                    DATE_TRUNC('month', CURRENT_DATE),
                    DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day',
                    0,
                    0,
                    0
                )
                RETURNING *;
            `;

            const createResult = await pool.query(createQuery, [userId]);
            const usage = createResult.rows[0];

            return res.json({
                usage: {
                    analyses_generated: usage.analyses_generated,
                    audio_generated: usage.audio_generated,
                    tokens_consumed: usage.tokens_consumed,
                    period_start: usage.period_start,
                    period_end: usage.period_end,
                    last_reset_at: usage.last_reset_at
                }
            });
        }

        const usage = result.rows[0];

        res.json({
            usage: {
                analyses_generated: usage.analyses_generated,
                audio_generated: usage.audio_generated,
                tokens_consumed: usage.tokens_consumed,
                period_start: usage.period_start,
                period_end: usage.period_end,
                last_reset_at: usage.last_reset_at
            }
        });

    } catch (error) {
        console.error('Error fetching usage:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch usage data'
        });
    }
});

// ============================================
// HELPER: Check if user can perform action
// (Can be used as middleware for protected routes)
// ============================================

export async function checkUsageLimits(
    action: 'analysis' | 'audio'
) {
    return async (req: AuthenticatedRequest, res: Response, next: Function) => {
        try {
            const userId = req.user!.id;

            // Get membership and usage in one query
            const query = `
                WITH membership_info AS (
                    SELECT 
                        p.max_analyses_per_month,
                        p.max_audio_generations_per_month,
                        p.slug as plan_slug
                    FROM memberships m
                    JOIN plans p ON m.plan_id = p.id
                    WHERE m.user_id = $1
                      AND m.status = 'active'
                    LIMIT 1
                ),
                usage_info AS (
                    SELECT 
                        analyses_generated,
                        audio_generated
                    FROM usage_tracking
                    WHERE user_id = $1
                      AND period_start <= CURRENT_DATE
                      AND period_end >= CURRENT_DATE
                )
                SELECT 
                    mi.max_analyses_per_month,
                    mi.max_audio_generations_per_month,
                    mi.plan_slug,
                    COALESCE(ui.analyses_generated, 0) as analyses_generated,
                    COALESCE(ui.audio_generated, 0) as audio_generated
                FROM membership_info mi
                LEFT JOIN usage_info ui ON true;
            `;

            const result = await pool.query(query, [userId]);

            if (result.rows.length === 0) {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'No active membership found'
                });
            }

            const data = result.rows[0];

            // Check limits based on action type
            if (action === 'analysis') {
                const limit = data.max_analyses_per_month;
                const used = data.analyses_generated;

                if (limit !== -1 && used >= limit) {
                    return res.status(403).json({
                        error: 'Limit Reached',
                        message: `You've used all ${limit} analyses this month. Upgrade to continue.`,
                        usage: {
                            used,
                            limit,
                            remaining: 0
                        },
                        upgrade_url: '/pricing',
                        current_plan: data.plan_slug
                    });
                }
            } else if (action === 'audio') {
                const limit = data.max_audio_generations_per_month;
                const used = data.audio_generated;

                if (limit !== -1 && used >= limit) {
                    return res.status(403).json({
                        error: 'Limit Reached',
                        message: `You've used all ${limit} audio generations this month. Upgrade to Pro.`,
                        usage: {
                            used,
                            limit,
                            remaining: 0
                        },
                        upgrade_url: '/pricing',
                        current_plan: data.plan_slug
                    });
                }
            }

            // Attach limits to request for use in route handler
            (req as any).userLimits = data;

            next();

        } catch (error) {
            console.error('Error checking usage limits:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to check usage limits'
            });
        }
    };
}

// ============================================
// POST /api/user/usage/increment
// Increment usage counter (called after successful action)
// ============================================

router.post('/usage/increment', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const { action, amount = 1 } = req.body;

        if (!['analysis', 'audio'].includes(action)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid action. Must be "analysis" or "audio"'
            });
        }

        const column = action === 'analysis' ? 'analyses_generated' : 'audio_generated';

        const query = `
            UPDATE usage_tracking
            SET ${column} = ${column} + $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $2
              AND period_start <= CURRENT_DATE
              AND period_end >= CURRENT_DATE
            RETURNING *;
        `;

        const result = await pool.query(query, [amount, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Usage tracking record not found'
            });
        }

        const usage = result.rows[0];

        res.json({
            success: true,
            usage: {
                analyses_generated: usage.analyses_generated,
                audio_generated: usage.audio_generated,
                tokens_consumed: usage.tokens_consumed
            }
        });

    } catch (error) {
        console.error('Error incrementing usage:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to increment usage'
        });
    }
});

// ============================================
// GET /api/user/stats
// Get user's overall statistics
// ============================================

router.get('/stats', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id;

        const query = `
            SELECT 
                -- Total analyses
                (SELECT COUNT(*) FROM user_analyses WHERE user_id = $1) as total_analyses,
                
                -- Favorite count
                (SELECT COUNT(*) FROM user_analyses WHERE user_id = $1 AND is_favorite = true) as favorite_analyses,
                
                -- Total audio generated
                (SELECT COUNT(*) FROM audio_generations WHERE user_id = $1 AND status = 'ready') as total_audio_generated,
                
                -- Total tokens consumed (all time)
                (SELECT COALESCE(SUM(tokens_consumed), 0) FROM usage_tracking WHERE user_id = $1) as total_tokens_consumed,
                
                -- Current month usage
                (SELECT analyses_generated FROM usage_tracking 
                 WHERE user_id = $1 
                 AND period_start <= CURRENT_DATE 
                 AND period_end >= CURRENT_DATE) as current_month_analyses,
                
                (SELECT audio_generated FROM usage_tracking 
                 WHERE user_id = $1 
                 AND period_start <= CURRENT_DATE 
                 AND period_end >= CURRENT_DATE) as current_month_audio,
                
                -- Most analyzed movie
                (SELECT movie_title FROM user_analyses 
                 WHERE user_id = $1 
                 GROUP BY movie_title 
                 ORDER BY COUNT(*) DESC 
                 LIMIT 1) as most_analyzed_movie;
        `;

        const result = await pool.query(query, [userId]);
        const stats = result.rows[0];

        res.json({
            stats: {
                total_analyses: parseInt(stats.total_analyses),
                favorite_analyses: parseInt(stats.favorite_analyses),
                total_audio_generated: parseInt(stats.total_audio_generated),
                total_tokens_consumed: parseInt(stats.total_tokens_consumed),
                current_month: {
                    analyses: stats.current_month_analyses || 0,
                    audio: stats.current_month_audio || 0
                },
                most_analyzed_movie: stats.most_analyzed_movie
            }
        });

    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch user statistics'
        });
    }
});

export default router;
// Lore generation routes - ALWAYS CHARGE VERSION
// Deducts credits even for cached results + simulates generation delay
import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import { generateLoreWithQwen, calculateCost } from '../services/qwen.service';
import type { LoreAnalysis, Movie } from '../types';

const router = Router();

// PostgreSQL pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Token usage tracking (in-memory for stats endpoint)
let totalTokensUsed = 0;
let requestCount = 0;

// ============================================
// CONFIG: Simulated delay for cached results
// ============================================
const CACHE_SIMULATION_DELAY_MS = 2500; // 2.5 seconds feels natural

/**
 * Simulate AI generation delay for cached results
 * This makes the UX consistent and users won't know about caching
 */
function simulateGenerationDelay(ms: number = CACHE_SIMULATION_DELAY_MS): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// TYPES
// ============================================

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}

interface GenerateRequestBody {
    currentMovie: Movie & { belongs_to_collection?: { id: number; name: string } };
    previousMovies: Movie[];
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
        const { createClient } = require('@supabase/supabase-js');
        const supabaseAdmin = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid or expired token'
            });
        }

        // Verify user exists in our DB
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
// HELPER: Check user credits/limits
// ============================================

async function checkUserCredits(userId: string): Promise<{
    canGenerate: boolean;
    membership: any;
    usage: any;
    error?: string;
}> {
    const query = `
        WITH membership_info AS (
            SELECT 
                m.id as membership_id,
                p.max_analyses_per_month,
                p.slug as plan_slug,
                p.name as plan_name
            FROM memberships m
            JOIN plans p ON m.plan_id = p.id
            WHERE m.user_id = $1
              AND m.status = 'active'
            LIMIT 1
        ),
        usage_info AS (
            SELECT 
                id as usage_id,
                analyses_generated,
                tokens_consumed,
                period_start,
                period_end
            FROM usage_tracking
            WHERE user_id = $1
              AND period_start <= CURRENT_DATE
              AND period_end >= CURRENT_DATE
        )
        SELECT 
            mi.membership_id,
            mi.max_analyses_per_month,
            mi.plan_slug,
            mi.plan_name,
            COALESCE(ui.usage_id, NULL) as usage_id,
            COALESCE(ui.analyses_generated, 0) as analyses_generated,
            COALESCE(ui.tokens_consumed, 0) as tokens_consumed,
            ui.period_start,
            ui.period_end
        FROM membership_info mi
        LEFT JOIN usage_info ui ON true;
    `;

    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
        return {
            canGenerate: false,
            membership: null,
            usage: null,
            error: 'No active membership found'
        };
    }

    const data = result.rows[0];
    const limit = data.max_analyses_per_month;
    const used = data.analyses_generated;

    // -1 means unlimited
    if (limit !== -1 && used >= limit) {
        return {
            canGenerate: false,
            membership: data,
            usage: { used, limit, remaining: 0 },
            error: `Has usado todos tus ${limit} análisis este mes. Mejora tu plan para continuar.`
        };
    }

    return {
        canGenerate: true,
        membership: data,
        usage: {
            used,
            limit,
            remaining: limit === -1 ? Infinity : limit - used,
            usage_id: data.usage_id
        }
    };
}

// ============================================
// HELPER: Check lore_cache for existing analysis
// ============================================

async function checkLoreCache(
    tmdbMovieId: number,
    collectionId: number | null,
    language: string = 'es'
): Promise<{ cached: boolean; data?: any; cacheId?: string; timesUsed?: number }> {
    const query = `
        SELECT id, analysis_data, times_used
        FROM lore_cache
        WHERE tmdb_movie_id = $1
          AND ($2::integer IS NULL OR tmdb_collection_id = $2)
          AND language = $3
        ORDER BY created_at DESC
        LIMIT 1;
    `;

    const result = await pool.query(query, [tmdbMovieId, collectionId, language]);

    if (result.rows.length > 0) {
        // Update times_used and last_used_at
        await pool.query(`
            UPDATE lore_cache 
            SET times_used = times_used + 1, 
                last_used_at = CURRENT_TIMESTAMP 
            WHERE id = $1
        `, [result.rows[0].id]);

        return {
            cached: true,
            data: result.rows[0].analysis_data,
            cacheId: result.rows[0].id,
            timesUsed: result.rows[0].times_used
        };
    }

    return { cached: false };
}

// ============================================
// HELPER: Save to lore_cache
// ============================================

async function saveLoreCache(
    tmdbMovieId: number,
    movieTitle: string,
    collectionId: number | null,
    collectionName: string | null,
    analysisData: LoreAnalysis,
    tokensUsed: number,
    language: string = 'es'
): Promise<string> {
    const query = `
        INSERT INTO lore_cache (
            tmdb_movie_id,
            movie_title,
            tmdb_collection_id,
            collection_name,
            language,
            detail_level,
            tone,
            analysis_data,
            tokens_used,
            generation_cost
        )
        VALUES ($1, $2, $3, $4, $5, 'standard', 'engaging', $6, $7, $8)
        RETURNING id;
    `;

    const cost = analysisData.token_usage?.estimated_cost
        ? parseFloat(analysisData.token_usage.estimated_cost.replace(' USD', ''))
        : 0;

    const result = await pool.query(query, [
        tmdbMovieId,
        movieTitle,
        collectionId,
        collectionName,
        language,
        JSON.stringify(analysisData),
        tokensUsed,
        cost
    ]);

    return result.rows[0].id;
}

// ============================================
// HELPER: Save to user_analyses
// ============================================

async function saveUserAnalysis(
    userId: string,
    loreCacheId: string | null,
    tmdbMovieId: number,
    movieTitle: string,
    moviePosterPath: string | null,
    analysisData: LoreAnalysis,
    wasFromCache: boolean,
    generationParams: object
): Promise<string> {
    const query = `
        INSERT INTO user_analyses (
            user_id,
            lore_cache_id,
            tmdb_movie_id,
            movie_title,
            movie_poster_path,
            analysis_data,
            was_from_cache,
            generation_params
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id;
    `;

    const result = await pool.query(query, [
        userId,
        loreCacheId,
        tmdbMovieId,
        movieTitle,
        moviePosterPath,
        JSON.stringify(analysisData),
        wasFromCache,
        JSON.stringify(generationParams)
    ]);

    return result.rows[0].id;
}

// ============================================
// HELPER: Update usage_tracking
// ============================================

async function updateUsageTracking(
    userId: string,
    tokensConsumed: number = 0
): Promise<void> {
    // First try to update existing record
    const updateQuery = `
        UPDATE usage_tracking
        SET analyses_generated = analyses_generated + 1,
            tokens_consumed = tokens_consumed + $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
          AND period_start <= CURRENT_DATE
          AND period_end >= CURRENT_DATE
        RETURNING id;
    `;

    const result = await pool.query(updateQuery, [userId, tokensConsumed]);

    // If no record exists, create one
    if (result.rows.length === 0) {
        // Get membership_id for the user
        const membershipQuery = await pool.query(
            `SELECT id FROM memberships WHERE user_id = $1 AND status = 'active' LIMIT 1`,
            [userId]
        );

        const membershipId = membershipQuery.rows[0]?.id || null;

        const insertQuery = `
            INSERT INTO usage_tracking (
                user_id,
                membership_id,
                period_start,
                period_end,
                analyses_generated,
                tokens_consumed
            )
            VALUES (
                $1,
                $2,
                DATE_TRUNC('month', CURRENT_DATE),
                DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day',
                1,
                $3
            );
        `;

        await pool.query(insertQuery, [userId, membershipId, tokensConsumed]);
    }
}

// ============================================
// POST /api/lore/generate
// ALWAYS DEDUCT CREDIT (cache or not) + simulate delay
// ============================================

router.post('/generate', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const { currentMovie, previousMovies } = req.body as GenerateRequestBody;

        // Validate request body
        if (!currentMovie || !previousMovies) {
            return res.status(400).json({
                error: 'Missing required fields: currentMovie and previousMovies'
            });
        }

        console.log(`🎬 Generating lore for: ${currentMovie.title}`);
        console.log(`👤 User ID: ${userId}`);
        console.log(`📚 Analyzing ${previousMovies.length} previous movies`);

        // ============================================
        // STEP 1: Check user credits FIRST (always)
        // ============================================
        const creditCheck = await checkUserCredits(userId);

        if (!creditCheck.canGenerate) {
            console.log(`❌ User ${userId} has no credits remaining`);
            return res.status(403).json({
                error: 'Limit Reached',
                message: creditCheck.error,
                usage: creditCheck.usage,
                upgrade_url: '/pricing'
            });
        }

        console.log(`✅ User has credits: ${creditCheck.usage.remaining} remaining`);

        // ============================================
        // STEP 2: Check lore_cache for existing analysis
        // ============================================
        const collectionId = currentMovie.belongs_to_collection?.id || null;
        const collectionName = currentMovie.belongs_to_collection?.name || null;

        const cacheCheck = await checkLoreCache(currentMovie.id, collectionId);

        let analysis: LoreAnalysis;
        let loreCacheId: string;
        let wasFromCache: boolean;
        let actualTokensUsed = 0;

        if (cacheCheck.cached) {
            // ============================================
            // CACHE HIT: Use cached but STILL charge + simulate delay
            // ============================================
            console.log(`💰 Cache hit for movie ${currentMovie.id} (${cacheCheck.timesUsed} uses) - CHARGING credit + simulating delay`);

            // CRITICAL: Simulate "generation" delay so user thinks we're generating
            await simulateGenerationDelay(1800);

            analysis = cacheCheck.data;
            loreCacheId = cacheCheck.cacheId!;
            wasFromCache = true;
            actualTokensUsed = 0; // No actual tokens used (saved!)

            console.log(`💸 Cache hit saved AI cost but still charged user`);

        } else {
            // ============================================
            // CACHE MISS: Generate with Qwen AI
            // ============================================
            console.log(`🤖 No cache found, generating with Qwen AI...`);

            analysis = await generateLoreWithQwen(currentMovie, previousMovies);

            // Track token usage
            actualTokensUsed = analysis.token_usage?.total_tokens || 0;
            if (actualTokensUsed > 0) {
                totalTokensUsed += actualTokensUsed;
                requestCount++;
            }

            // Save to lore_cache for future users
            loreCacheId = await saveLoreCache(
                currentMovie.id,
                currentMovie.title,
                collectionId,
                collectionName,
                analysis,
                actualTokensUsed
            );

            wasFromCache = false;
            console.log(`📦 Saved to lore_cache: ${loreCacheId}`);
        }

        // ============================================
        // STEP 3: ALWAYS deduct credit (cache or not)
        // ============================================
        await updateUsageTracking(userId, actualTokensUsed);
        console.log(`💳 Credit deducted for user. Was cached: ${wasFromCache}, Actual tokens: ${actualTokensUsed}`);

        // ============================================
        // STEP 4: Save to user_analyses
        // ============================================
        const userAnalysisId = await saveUserAnalysis(
            userId,
            loreCacheId,
            currentMovie.id,
            currentMovie.title,
            currentMovie.poster_path || null,
            analysis,
            wasFromCache,
            {
                source: wasFromCache ? 'cache' : 'qwen',
                previous_movies_count: previousMovies.length,
                tokens_used: actualTokensUsed,
                tokens_saved: wasFromCache ? (analysis.token_usage?.total_tokens || 1500) : 0
            }
        );

        console.log(`💾 Saved user analysis: ${userAnalysisId}`);

        // ============================================
        // STEP 5: Return response (don't expose cache status)
        // ============================================
        // NOTE: We don't tell the user it was cached
        // This creates a consistent UX
        res.json({
            ...analysis,
            // from_cache: false, // Hide this from user
            user_analysis_id: userAnalysisId,
            lore_cache_id: loreCacheId
            // Don't expose: wasFromCache, actualTokensUsed, etc.
        });

    } catch (error) {
        console.error('❌ Error generating lore:', error);

        res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});

// ============================================
// GET /api/lore/stats
// Get token usage statistics (internal)
// ============================================

router.get('/stats', (_req: Request, res: Response) => {
    res.json({
        total_requests: requestCount,
        total_tokens_used: totalTokensUsed,
        average_tokens_per_request: requestCount > 0 ? Math.round(totalTokensUsed / requestCount) : 0,
        estimated_total_cost: calculateCost(totalTokensUsed, 'qwen-plus')
    });
});

// ============================================
// GET /api/lore/cache-efficiency (NEW)
// Track cache effectiveness for business intelligence
// ============================================

router.get('/cache-efficiency', async (_req: Request, res: Response) => {
    try {
        const query = `
            SELECT 
                COUNT(*) as total_analyses,
                SUM(CASE WHEN was_from_cache THEN 1 ELSE 0 END) as from_cache,
                SUM(CASE WHEN NOT was_from_cache THEN 1 ELSE 0 END) as generated,
                ROUND(100.0 * SUM(CASE WHEN was_from_cache THEN 1 ELSE 0 END) / COUNT(*), 2) as cache_hit_rate
            FROM user_analyses
            WHERE created_at > CURRENT_DATE - INTERVAL '30 days';
        `;

        const result = await pool.query(query);
        const stats = result.rows[0];

        // Estimate savings (assuming 1500 tokens per generation at $0.05)
        const estimatedTokensSaved = parseInt(stats.from_cache) * 1500;
        const estimatedCostSaved = estimatedTokensSaved * 0.05 / 1000;

        res.json({
            period: 'last_30_days',
            total_analyses: parseInt(stats.total_analyses),
            from_cache: parseInt(stats.from_cache),
            generated: parseInt(stats.generated),
            cache_hit_rate: parseFloat(stats.cache_hit_rate) + '%',
            estimated_tokens_saved: estimatedTokensSaved,
            estimated_cost_saved: `$${estimatedCostSaved.toFixed(2)}`,
            note: 'Users were charged for all analyses, but cache hits saved AI costs'
        });

    } catch (error) {
        console.error('Error fetching cache efficiency:', error);
        res.status(500).json({ error: 'Failed to fetch cache efficiency' });
    }
});

// ============================================
// GET /api/lore/history
// Get user's lore generation history
// ============================================

router.get('/history', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;

        const query = `
            SELECT 
                ua.id,
                ua.tmdb_movie_id,
                ua.movie_title,
                ua.movie_poster_path,
                ua.is_favorite,
                ua.user_rating,
                ua.created_at
            FROM user_analyses ua
            WHERE ua.user_id = $1
            ORDER BY ua.created_at DESC
            LIMIT $2 OFFSET $3;
        `;

        const result = await pool.query(query, [userId, limit, offset]);

        // Get total count
        const countResult = await pool.query(
            'SELECT COUNT(*) FROM user_analyses WHERE user_id = $1',
            [userId]
        );

        res.json({
            analyses: result.rows,
            total: parseInt(countResult.rows[0].count),
            limit,
            offset
        });

    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch analysis history'
        });
    }
});

// ============================================
// GET /api/lore/:id
// Get a specific analysis by ID
// ============================================

router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const analysisId = req.params.id;

        console.log('🔍 Fetching analysis:', analysisId, 'for user:', userId);

        const query = `
            SELECT ua.*
            FROM user_analyses ua
            WHERE ua.id = $1 AND ua.user_id = $2;
        `;

        const result = await pool.query(query, [analysisId, userId]);

        if (result.rows.length === 0) {
            console.log('❌ Analysis not found');
            return res.status(404).json({
                error: 'Not Found',
                message: 'Analysis not found'
            });
        }

        const analysisRecord = result.rows[0];
        console.log('✅ Analysis found, sending response');

        // Return in the format the frontend expects
        res.json({
            id: analysisRecord.id,
            tmdb_movie_id: analysisRecord.tmdb_movie_id,
            movie_title: analysisRecord.movie_title,
            movie_poster_path: analysisRecord.movie_poster_path,
            is_favorite: analysisRecord.is_favorite,
            user_rating: analysisRecord.user_rating,
            analysis: analysisRecord.analysis_data, // 👈 Using your actual column name
            created_at: analysisRecord.created_at
        });

    } catch (error) {
        console.error('❌ Error fetching analysis:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch analysis'
        });
    }
});

export default router;
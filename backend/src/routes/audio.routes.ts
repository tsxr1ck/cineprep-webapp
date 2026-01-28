// Audio generation routes
import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// PostgreSQL pool for credit management
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Supabase client for auth verification
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
// HELPER: Check audio credits and deduct
// ============================================

async function checkAndDeductAudioCredits(userId: string): Promise<{
    allowed: boolean;
    message?: string;
    remaining?: number;
    limit?: number;
}> {
    try {
        // Get membership and usage in one query
        const query = `
            WITH membership_info AS (
                SELECT 
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
                    audio_generated,
                    id as usage_id
                FROM usage_tracking
                WHERE user_id = $1
                  AND period_start <= CURRENT_DATE
                  AND period_end >= CURRENT_DATE
            )
            SELECT 
                mi.max_audio_generations_per_month,
                mi.plan_slug,
                COALESCE(ui.audio_generated, 0) as audio_generated,
                ui.usage_id
            FROM membership_info mi
            LEFT JOIN usage_info ui ON true;
        `;

        const result = await pool.query(query, [userId]);

        if (result.rows.length === 0) {
            return {
                allowed: false,
                message: 'No active membership found'
            };
        }

        const data = result.rows[0];
        const limit = data.max_audio_generations_per_month;
        const used = data.audio_generated;

        // Check if limit reached (-1 means unlimited)
        if (limit !== -1 && used >= limit) {
            return {
                allowed: false,
                message: `You've used all ${limit} audio generations this month. Upgrade to Pro for more.`,
                remaining: 0,
                limit
            };
        }

        // Deduct credit (increment usage)
        if (data.usage_id) {
            await pool.query(`
                UPDATE usage_tracking
                SET audio_generated = audio_generated + 1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
            `, [data.usage_id]);
        } else {
            // Create usage tracking if it doesn't exist
            await pool.query(`
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
                    1,
                    0
                )
            `, [userId]);
        }

        const remaining = limit === -1 ? -1 : (limit - used - 1);

        return {
            allowed: true,
            remaining,
            limit
        };

    } catch (error) {
        console.error('Error checking audio credits:', error);
        return {
            allowed: false,
            message: 'Failed to verify credits'
        };
    }
}

/**
 * POST /api/audio/generate
 * Generate audio from narrative using Qwen TTS
 * Requires authentication and deducts credits
 */
router.post('/generate', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { narrative, movieTitle } = req.body;
        const userId = req.user!.id;

        if (!narrative || !movieTitle) {
            return res.status(400).json({
                error: 'Missing required fields: narrative and movieTitle'
            });
        }

        // Check and deduct credits BEFORE generating
        const creditCheck = await checkAndDeductAudioCredits(userId);

        if (!creditCheck.allowed) {
            return res.status(403).json({
                error: 'Limit Reached',
                message: creditCheck.message,
                usage: {
                    remaining: creditCheck.remaining || 0,
                    limit: creditCheck.limit
                },
                upgrade_url: '/pricing'
            });
        }

        console.log(`🎙️ Generating audio for: ${movieTitle} (User: ${req.user!.email})`);
        console.log(`💳 Credits remaining: ${creditCheck.remaining === -1 ? 'Unlimited' : creditCheck.remaining}`);

        // Truncate narrative to meet API limit (600 chars)
        let processedNarrative = narrative;
        if (processedNarrative.length > 590) {
            console.warn(`⚠️ Narrative too long (${processedNarrative.length} chars), truncating...`);
            const truncated = processedNarrative.substring(0, 590);
            const lastPeriod = truncated.lastIndexOf('.');
            const lastExclamation = truncated.lastIndexOf('!');
            const lastQuestion = truncated.lastIndexOf('?');

            const cutIndex = Math.max(lastPeriod, lastExclamation, lastQuestion);

            if (cutIndex > 0) {
                processedNarrative = truncated.substring(0, cutIndex + 1);
            } else {
                const lastSpace = truncated.lastIndexOf(' ');
                processedNarrative = lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
            }
            console.log(`✂️ Truncated narrative to ${processedNarrative.length} chars`);
        } else {
            console.log(`✅ Narrative length explicitly checks out: ${processedNarrative.length} chars`);
        }

        const QWEN_API_KEY = process.env.QWEN_API_KEY;

        if (!QWEN_API_KEY) {
            throw new Error('QWEN_API_KEY not configured');
        }

        const apiUrl = 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${QWEN_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'qwen3-tts-flash',
                input: {
                    text: processedNarrative
                },
                parameters: {
                    voice: 'Chelsie',
                    language_type: 'Latino',
                    format: 'mp3',
                    sample_rate: 24000
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('TTS Error:', errorText);
            throw new Error(`TTS API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('TTS Response:', JSON.stringify(data, null, 2));

        // Extract audio URL from response
        if (data.output?.audio_url) {
            res.json({
                success: true,
                audio_url: data.output.audio_url,
                duration: data.output?.audio_duration || 'unknown',
                format: 'mp3',
                credits_remaining: creditCheck.remaining
            });
        } else if (data.output?.audio) {
            res.json({
                success: true,
                audio_base64: data.output.audio,
                format: 'mp3',
                note: 'Audio returned as base64',
                credits_remaining: creditCheck.remaining
            });
        } else {
            throw new Error('No audio data in response');
        }

    } catch (error) {
        console.error('❌ Audio generation error:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Failed to generate audio',
            fallback_available: true
        });
    }
});

/**
 * POST /api/audio/generate-stream
 * Streaming audio generation for longer text
 * Requires authentication and deducts credits
 */
router.post('/generate-stream', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { narrative, movieTitle } = req.body;
        const userId = req.user!.id;

        if (!narrative || !movieTitle) {
            return res.status(400).json({
                error: 'Missing required fields'
            });
        }

        // Check and deduct credits
        const creditCheck = await checkAndDeductAudioCredits(userId);

        if (!creditCheck.allowed) {
            return res.status(403).json({
                error: 'Limit Reached',
                message: creditCheck.message,
                upgrade_url: '/pricing'
            });
        }

        const QWEN_API_KEY = process.env.QWEN_API_KEY;

        if (!QWEN_API_KEY) {
            throw new Error('QWEN_API_KEY not configured');
        }

        const apiUrl = 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${QWEN_API_KEY}`,
                'Content-Type': 'application/json',
                'X-DashScope-SSE': 'enable'
            },
            body: JSON.stringify({
                model: 'qwen3-tts-flash',
                input: {
                    text: narrative
                },
                parameters: {
                    voice: 'Cherry',
                    language_type: 'Spanish',
                    format: 'mp3',
                    sample_rate: 24000,
                    incremental_output: true
                }
            })
        });

        if (!response.ok) {
            throw new Error(`TTS Error: ${response.status}`);
        }

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        if (response.body) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                res.write(chunk);
            }
        }

        res.end();

    } catch (error) {
        console.error('Streaming error:', error);
        res.status(500).json({ error: 'Streaming failed' });
    }
});

/**
 * POST /api/audio/generate-fallback
 * Browser-based fallback (no API required, no credits needed)
 */
router.post('/generate-fallback', async (req: Request, res: Response) => {
    try {
        const { narrative } = req.body;

        if (!narrative) {
            return res.status(400).json({ error: 'Missing narrative' });
        }

        res.json({
            success: true,
            script: narrative,
            method: 'browser_synthesis',
            instructions: {
                lang: 'es-MX',
                rate: 1.0,
                pitch: 1.0,
                volume: 0.8
            },
            note: 'Use Web Speech API for synthesis'
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to prepare audio' });
    }
});

/**
 * GET /api/audio/voices
 * Available voices endpoint (for reference)
 */
router.get('/voices', (_req: Request, res: Response) => {
    res.json({
        available_voices: [
            { name: 'Cherry', language: 'English', gender: 'Female' },
            { name: 'Chelsie', language: 'English', gender: 'Female' },
            { name: 'Ethan', language: 'English', gender: 'Male' },
            { name: 'Serena', language: 'English', gender: 'Female' },
            { name: 'Dylan', language: 'English', gender: 'Male' },
            { name: 'Jada', language: 'English', gender: 'Female' },
            { name: 'Sunny', language: 'English', gender: 'Male' }
        ],
        note: 'Qwen3-TTS supports 49 character voices and 10 languages',
        supported_languages: [
            'English', 'Spanish', 'Chinese', 'Japanese', 'Korean',
            'French', 'German', 'Russian', 'Arabic', 'Portuguese'
        ]
    });
});

export default router;

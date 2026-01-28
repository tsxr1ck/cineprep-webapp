// Favorites and Taste Profile Routes
import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import { TasteService } from '../services/taste.service';
import type {
    AddFavoriteRequest,
    UpdateTasteProfileRequest,
    RegisterNotificationTokenRequest,
    UserFavorite,
    FavoritesListResponse,
    TasteProfileResponse,
    RecommendationsResponse
} from '../types';

const router = Router();

// PostgreSQL pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize taste service
const tasteService = new TasteService(pool);

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
// FAVORITES ENDPOINTS
// ============================================

/**
 * GET /api/favorites
 * Get user's favorite lore analyses
 */
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;

        const query = `
            SELECT 
                uf.id,
                uf.user_id,
                uf.user_analysis_id,
                uf.tmdb_movie_id,
                uf.movie_title,
                uf.movie_poster_path,
                uf.genres,
                uf.vote_average,
                uf.release_year,
                uf.created_at,
                ua.analysis_data
            FROM user_favorites uf
            JOIN user_analyses ua ON uf.user_analysis_id = ua.id
            WHERE uf.user_id = $1
            ORDER BY uf.created_at DESC
            LIMIT $2 OFFSET $3;
        `;

        const countQuery = `
            SELECT COUNT(*) FROM user_favorites WHERE user_id = $1;
        `;

        const [result, countResult] = await Promise.all([
            pool.query(query, [userId, limit, offset]),
            pool.query(countQuery, [userId])
        ]);

        const response: FavoritesListResponse = {
            favorites: result.rows as UserFavorite[],
            total: parseInt(countResult.rows[0].count),
            limit,
            offset
        };

        res.json(response);

    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch favorites'
        });
    }
});

/**
 * POST /api/favorites
 * Add a lore analysis to favorites
 */
router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const {
            user_analysis_id,
            tmdb_movie_id,
            movie_title,
            movie_poster_path,
            genres,
            vote_average,
            release_year
        } = req.body as AddFavoriteRequest;

        // Validate required fields
        if (!user_analysis_id || !tmdb_movie_id || !movie_title) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Missing required fields: user_analysis_id, tmdb_movie_id, movie_title'
            });
        }

        // Verify the analysis belongs to the user
        const analysisCheck = await pool.query(
            'SELECT id FROM user_analyses WHERE id = $1 AND user_id = $2',
            [user_analysis_id, userId]
        );

        if (analysisCheck.rows.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Analysis not found or does not belong to user'
            });
        }

        // Insert favorite
        const insertQuery = `
            INSERT INTO user_favorites (
                user_id,
                user_analysis_id,
                tmdb_movie_id,
                movie_title,
                movie_poster_path,
                genres,
                vote_average,
                release_year
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (user_id, user_analysis_id) DO NOTHING
            RETURNING *;
        `;

        const result = await pool.query(insertQuery, [
            userId,
            user_analysis_id,
            tmdb_movie_id,
            movie_title,
            movie_poster_path || null,
            JSON.stringify(genres || []),
            vote_average || null,
            release_year || null
        ]);

        // Also update the is_favorite flag on user_analyses
        await pool.query(
            'UPDATE user_analyses SET is_favorite = true WHERE id = $1',
            [user_analysis_id]
        );

        if (result.rows.length === 0) {
            return res.status(409).json({
                error: 'Conflict',
                message: 'This analysis is already in favorites'
            });
        }

        // Update taste profile after adding favorite
        await tasteService.updateTasteProfile(userId);

        res.status(201).json({
            success: true,
            favorite: result.rows[0]
        });

    } catch (error) {
        console.error('Error adding favorite:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to add favorite'
        });
    }
});

/**
 * DELETE /api/favorites/:id
 * Remove a favorite
 */
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const favoriteId = req.params.id;

        // Get the user_analysis_id before deleting
        const favoriteQuery = await pool.query(
            'SELECT user_analysis_id FROM user_favorites WHERE id = $1 AND user_id = $2',
            [favoriteId, userId]
        );

        if (favoriteQuery.rows.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Favorite not found'
            });
        }

        const userAnalysisId = favoriteQuery.rows[0].user_analysis_id;

        // Delete the favorite
        await pool.query(
            'DELETE FROM user_favorites WHERE id = $1 AND user_id = $2',
            [favoriteId, userId]
        );

        // Update the is_favorite flag on user_analyses
        await pool.query(
            'UPDATE user_analyses SET is_favorite = false WHERE id = $1',
            [userAnalysisId]
        );

        res.json({
            success: true,
            message: 'Favorite removed successfully'
        });

    } catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to remove favorite'
        });
    }
});

/**
 * POST /api/favorites/toggle/:analysisId
 * Toggle favorite status for an analysis
 */
router.post('/toggle/:analysisId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const analysisId = req.params.analysisId;

        // Get analysis details
        const analysisQuery = await pool.query(`
            SELECT 
                ua.id,
                ua.tmdb_movie_id,
                ua.movie_title,
                ua.movie_poster_path,
                ua.is_favorite
            FROM user_analyses ua
            WHERE ua.id = $1 AND ua.user_id = $2
        `, [analysisId, userId]);

        if (analysisQuery.rows.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Analysis not found'
            });
        }

        const analysis = analysisQuery.rows[0];
        const newFavoriteStatus = !analysis.is_favorite;

        if (newFavoriteStatus) {
            // Add to favorites
            await pool.query(`
                INSERT INTO user_favorites (
                    user_id,
                    user_analysis_id,
                    tmdb_movie_id,
                    movie_title,
                    movie_poster_path
                )
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (user_id, user_analysis_id) DO NOTHING;
            `, [
                userId,
                analysisId,
                analysis.tmdb_movie_id,
                analysis.movie_title,
                analysis.movie_poster_path
            ]);
        } else {
            // Remove from favorites
            await pool.query(
                'DELETE FROM user_favorites WHERE user_analysis_id = $1 AND user_id = $2',
                [analysisId, userId]
            );
        }

        // Update is_favorite flag
        await pool.query(
            'UPDATE user_analyses SET is_favorite = $1 WHERE id = $2',
            [newFavoriteStatus, analysisId]
        );

        res.json({
            success: true,
            is_favorite: newFavoriteStatus
        });

    } catch (error) {
        console.error('Error toggling favorite:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to toggle favorite'
        });
    }
});

// ============================================
// TASTE PROFILE ENDPOINTS
// ============================================

/**
 * GET /api/favorites/taste-profile
 * Get user's taste profile
 */
router.get('/taste-profile', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id;

        const profile = await tasteService.getTasteProfile(userId);

        if (!profile) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Taste profile not found. Generate some lore analyses first!'
            });
        }

        // Format response with top genres and franchises
        const genrePrefs = profile.genre_preferences as Record<string, number>;
        const topGenres = Object.entries(genrePrefs)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, score]) => ({ name, score }));

        const response: TasteProfileResponse = {
            profile,
            top_genres: topGenres,
            top_franchises: (profile.franchise_preferences as any[]).slice(0, 5)
        };

        res.json(response);

    } catch (error) {
        console.error('Error fetching taste profile:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch taste profile'
        });
    }
});

/**
 * PUT /api/favorites/taste-profile
 * Update taste profile settings (notifications, etc.)
 */
router.put('/taste-profile', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const { notification_enabled, notification_frequency } = req.body as UpdateTasteProfileRequest;

        const updates: string[] = [];
        const values: any[] = [userId];
        let paramIndex = 2;

        if (notification_enabled !== undefined) {
            updates.push(`notification_enabled = $${paramIndex++}`);
            values.push(notification_enabled);
        }

        if (notification_frequency !== undefined) {
            if (!['daily', 'weekly', 'monthly', 'never'].includes(notification_frequency)) {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: 'Invalid notification_frequency. Must be: daily, weekly, monthly, or never'
                });
            }
            updates.push(`notification_frequency = $${paramIndex++}`);
            values.push(notification_frequency);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'No valid fields to update'
            });
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');

        const query = `
            UPDATE user_taste_profile
            SET ${updates.join(', ')}
            WHERE user_id = $1
            RETURNING *;
        `;

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Taste profile not found'
            });
        }

        res.json({
            success: true,
            profile: result.rows[0]
        });

    } catch (error) {
        console.error('Error updating taste profile:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to update taste profile'
        });
    }
});

/**
 * POST /api/favorites/taste-profile/refresh
 * Force refresh of taste profile
 */
router.post('/taste-profile/refresh', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id;

        const profile = await tasteService.updateTasteProfile(userId);

        if (!profile) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'No analyses found to build taste profile'
            });
        }

        res.json({
            success: true,
            profile
        });

    } catch (error) {
        console.error('Error refreshing taste profile:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to refresh taste profile'
        });
    }
});

// ============================================
// RECOMMENDATIONS ENDPOINTS
// ============================================

/**
 * GET /api/favorites/recommendations
 * Get personalized movie recommendations
 */
router.get('/recommendations', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = parseInt(req.query.offset as string) || 0;

        const { recommendations, total } = await tasteService.getRecommendations(userId, limit, offset);

        const response: RecommendationsResponse = {
            recommendations,
            total
        };

        res.json(response);

    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch recommendations'
        });
    }
});

/**
 * POST /api/favorites/recommendations/:id/view
 * Mark a recommendation as viewed
 */
router.post('/recommendations/:id/view', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const recommendationId = req.params.id;

        await tasteService.markRecommendationViewed(userId, recommendationId);

        res.json({
            success: true,
            message: 'Recommendation marked as viewed'
        });

    } catch (error) {
        console.error('Error marking recommendation as viewed:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to mark recommendation as viewed'
        });
    }
});

/**
 * POST /api/favorites/recommendations/:id/dismiss
 * Dismiss a recommendation
 */
router.post('/recommendations/:id/dismiss', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const recommendationId = req.params.id;

        await tasteService.dismissRecommendation(userId, recommendationId);

        res.json({
            success: true,
            message: 'Recommendation dismissed'
        });

    } catch (error) {
        console.error('Error dismissing recommendation:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to dismiss recommendation'
        });
    }
});

// ============================================
// NOTIFICATION TOKEN ENDPOINTS
// ============================================

/**
 * POST /api/favorites/notification-token
 * Register a push notification token
 */
router.post('/notification-token', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const { token, platform, device_name } = req.body as RegisterNotificationTokenRequest;

        if (!token || !platform) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Missing required fields: token, platform'
            });
        }

        if (!['web', 'ios', 'android'].includes(platform)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid platform. Must be: web, ios, or android'
            });
        }

        const query = `
            INSERT INTO user_notification_tokens (
                user_id,
                token,
                platform,
                device_name
            )
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id, token) DO UPDATE SET
                is_active = true,
                last_used_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *;
        `;

        const result = await pool.query(query, [
            userId,
            token,
            platform,
            device_name || null
        ]);

        res.status(201).json({
            success: true,
            token: result.rows[0]
        });

    } catch (error) {
        console.error('Error registering notification token:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to register notification token'
        });
    }
});

/**
 * DELETE /api/favorites/notification-token/:token
 * Deactivate a notification token
 */
router.delete('/notification-token/:token', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const token = req.params.token;

        await pool.query(`
            UPDATE user_notification_tokens
            SET is_active = false, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $1 AND token = $2;
        `, [userId, token]);

        res.json({
            success: true,
            message: 'Notification token deactivated'
        });

    } catch (error) {
        console.error('Error deactivating notification token:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to deactivate notification token'
        });
    }
});

export default router;

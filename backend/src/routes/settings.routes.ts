// Settings Routes - Manage user preferences (FIXED)

import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import type { UpdatePreferencesRequest, UserPreferences } from '../types';

const router = Router();

// ============================================
// DATABASE CONNECTION
// ============================================
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// ============================================
// MIDDLEWARE: Authenticate (Supabase JWT)
// ============================================
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}

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
// ROUTES
// ============================================

// GET /api/settings - Get user preferences
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id; // From authenticate middleware

        console.log('📚 Fetching preferences for user:', userId);

        const result = await pool.query(
            'SELECT * FROM user_preferences WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            // No preferences found, return default values
            const defaultPreferences: UserPreferences = {
                user_id: userId,
                default_language: 'es',
                default_detail_level: 'standard',
                default_tone: 'engaging',
                preferred_voice_id: null,
                auto_generate_audio: false,
                theme: 'dark',
                email_notifications: true,
                new_features_newsletter: true,
                updated_at: null,
            };

            console.log('✅ Returning default preferences');
            return res.json({ preferences: defaultPreferences, success: true });
        }

        console.log('✅ Preferences found');
        return res.json({ preferences: result.rows[0], success: true });

    } catch (error) {
        console.error('❌ Error in get settings:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/settings - Update user preferences
router.put('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id; // From authenticate middleware
        const updates: UpdatePreferencesRequest = req.body;

        console.log('📝 Updating preferences for user:', userId);

        // Validate update fields
        const allowedFields = [
            'default_language',
            'default_detail_level',
            'default_tone',
            'preferred_voice_id',
            'auto_generate_audio',
            'theme',
            'email_notifications',
            'new_features_newsletter',
        ];

        const invalidFields = Object.keys(updates).filter(
            (key) => !allowedFields.includes(key)
        );

        if (invalidFields.length > 0) {
            return res.status(400).json({
                error: `Invalid fields: ${invalidFields.join(', ')}`,
            });
        }

        // Check if preferences exist
        const existingPrefs = await pool.query(
            'SELECT user_id FROM user_preferences WHERE user_id = $1',
            [userId]
        );

        if (existingPrefs.rows.length > 0) {
            // Update existing preferences
            const updateFields = Object.keys(updates)
                .map((key, index) => `${key} = $${index + 2}`)
                .join(', ');

            const values = [userId, ...Object.values(updates)];

            const result = await pool.query(
                `UPDATE user_preferences 
                 SET ${updateFields}, updated_at = NOW() 
                 WHERE user_id = $1 
                 RETURNING *`,
                values
            );

            console.log('✅ Preferences updated');
            return res.json({ preferences: result.rows[0], success: true });
        } else {
            // Create new preferences
            const fields = ['user_id', ...Object.keys(updates)];
            const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
            const values = [userId, ...Object.values(updates)];

            const result = await pool.query(
                `INSERT INTO user_preferences (${fields.join(', ')}) 
                 VALUES (${placeholders}) 
                 RETURNING *`,
                values
            );

            console.log('✅ Preferences created');
            return res.json({ preferences: result.rows[0], success: true });
        }
    } catch (error) {
        console.error('❌ Error in update settings:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/settings - Reset preferences to defaults
router.delete('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id; // From authenticate middleware

        console.log('🔄 Resetting preferences for user:', userId);

        const defaultPreferences = {
            user_id: userId,
            default_language: 'es',
            default_detail_level: 'standard',
            default_tone: 'engaging',
            preferred_voice_id: null,
            auto_generate_audio: false,
            theme: 'dark',
            email_notifications: true,
            new_features_newsletter: true,
        };

        // Upsert (update or insert)
        const result = await pool.query(
            `INSERT INTO user_preferences (
                user_id, default_language, default_detail_level, default_tone,
                preferred_voice_id, auto_generate_audio, theme,
                email_notifications, new_features_newsletter
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (user_id) 
            DO UPDATE SET
                default_language = $2,
                default_detail_level = $3,
                default_tone = $4,
                preferred_voice_id = $5,
                auto_generate_audio = $6,
                theme = $7,
                email_notifications = $8,
                new_features_newsletter = $9,
                updated_at = NOW()
            RETURNING *`,
            [
                userId,
                defaultPreferences.default_language,
                defaultPreferences.default_detail_level,
                defaultPreferences.default_tone,
                defaultPreferences.preferred_voice_id,
                defaultPreferences.auto_generate_audio,
                defaultPreferences.theme,
                defaultPreferences.email_notifications,
                defaultPreferences.new_features_newsletter
            ]
        );

        console.log('✅ Preferences reset to defaults');
        return res.json({ preferences: result.rows[0], success: true });

    } catch (error) {
        console.error('❌ Error in reset settings:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
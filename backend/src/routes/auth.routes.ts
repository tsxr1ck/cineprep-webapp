// Authentication routes - Firebase to Supabase
import { Router, Request, Response } from 'express';
import { admin } from '../config/firebase';
import { supabase } from '../config/supabase';

const router = Router();

/**
 * POST /api/auth/firebase-to-supabase
 * Authenticates a Firebase user and creates/updates their Supabase session
 */
router.post('/firebase-to-supabase', async (req: Request, res: Response): Promise<any> => {
    try {
        const { firebaseToken, email, displayName, photoURL } = req.body;

        if (!firebaseToken || !email) {
            return res.status(400).json({ error: 'Faltan datos.' });
        }

        // Verify Firebase token
        const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
        if (decodedToken.email !== email) {
            return res.status(403).json({ error: 'Email mismatch.' });
        }

        console.log(`[AUTH] Usuario: ${email}`);

        // Create or Update user in Supabase Auth
        let supabaseUserId: string | undefined;
        const { data: createData, error: createError } = await supabase.auth.admin.createUser({
            email,
            email_confirm: true,
            user_metadata: {
                full_name: displayName,
                avatar_url: photoURL,
                firebase_uid: decodedToken.uid,
                provider: 'google'
            }
        });

        if (createError && createError.message.includes('already registered')) {
            // User exists in auth.users, find them
            const { data: searchData } = await supabase.auth.admin.listUsers();
            const existingUser = searchData.users.find((u) => u.email === email);
            if (existingUser) {
                supabaseUserId = existingUser.id;
                await supabase.auth.admin.updateUserById(existingUser.id, {
                    user_metadata: {
                        full_name: displayName,
                        avatar_url: photoURL,
                        firebase_uid: decodedToken.uid
                    }
                });
            }
        } else if (createData?.user) {
            supabaseUserId = createData.user.id;
        }

        // Create or Update user in public.users table
        if (supabaseUserId) {
            const { error: upsertError } = await supabase
                .from('users')
                .upsert({
                    id: supabaseUserId,
                    email,
                    password_hash: 'oauth_google', // Placeholder for OAuth users
                    full_name: displayName || null,
                    avatar_url: photoURL || null,
                    email_verified: true,
                    is_active: true,
                    last_login_at: new Date().toISOString()
                }, {
                    onConflict: 'email',
                    ignoreDuplicates: false
                });

            if (upsertError) {
                console.error('[AUTH] Error upserting to public.users:', upsertError.message);
            } else {
                console.log(`[AUTH] User synced to public.users: ${email}`);
            }
        }

        // Generate Magic Link for session
        const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email
        });

        if (linkError) throw linkError;

        const otpToken = linkData.properties?.email_otp ||
            new URL(linkData.properties?.action_link).searchParams.get('token');

        if (!otpToken) throw new Error('Error generando token');

        const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
            token: otpToken,
            type: 'magiclink',
            email
        });

        if (sessionError) throw sessionError;

        return res.json({
            access_token: sessionData.session?.access_token,
            refresh_token: sessionData.session?.refresh_token,
            user: sessionData.user,
        });
    } catch (error: any) {
        console.error('[AUTH ERROR]:', error.message);
        return res.status(500).json({ error: error.message });
    }
});

export default router;

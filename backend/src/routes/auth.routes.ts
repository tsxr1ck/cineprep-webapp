// Authentication routes - Firebase to Supabase (IMPROVED VERSION)
import { Router, Request, Response } from 'express';
import { admin } from '../config/firebase';
import { supabase } from '../config/supabase';

const router = Router();

/**
 * POST /api/auth/firebase-to-supabase
 * Authenticates a Firebase user and creates/updates their Supabase session
 * Now includes automatic free plan membership creation
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

        if (!supabaseUserId) {
            throw new Error('No se pudo obtener el ID del usuario');
        }

        // ========== STEP 1: Create/Update user in public.users table ==========
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
            throw upsertError;
        }

        console.log(`[AUTH] User synced to public.users: ${email}`);

        // ========== STEP 2: Get or Create Free Plan ==========
        let { data: freePlan, error: planError } = await supabase
            .from('plans')
            .select('*')
            .eq('slug', 'free')
            .eq('is_active', true)
            .single();

        // If free plan doesn't exist, create it
        if (planError || !freePlan) {
            console.log('[AUTH] Free plan not found, creating one...');
            const { data: newPlan, error: createPlanError } = await supabase
                .from('plans')
                .insert({
                    name: 'Plan Gratuito',
                    slug: 'free',
                    description: 'Plan gratuito para nuevos usuarios',
                    price_monthly: 0,
                    price_yearly: 0,
                    max_analyses_per_month: 5,
                    max_audio_generations_per_month: 0,
                    can_access_premium_voices: false,
                    can_force_regenerate: false,
                    priority_queue: false,
                    features: ['5 análisis mensuales', 'Acceso básico a películas'],
                    is_active: true
                })
                .select()
                .single();

            if (createPlanError) {
                console.error('[AUTH] Error creating free plan:', createPlanError.message);
                throw createPlanError;
            }

            freePlan = newPlan;
            console.log('[AUTH] Free plan created successfully');
        }

        // ========== STEP 3: Check if user already has a membership ==========
        const { data: existingMembership } = await supabase
            .from('memberships')
            .select('*')
            .eq('user_id', supabaseUserId)
            .eq('status', 'active')
            .single();

        // ========== STEP 4: Create membership if user doesn't have one ==========
        if (!existingMembership) {
            console.log(`[AUTH] Creating free membership for user: ${email}`);

            const now = new Date();
            const oneYearFromNow = new Date();
            oneYearFromNow.setFullYear(now.getFullYear() + 1);

            const { error: membershipError } = await supabase
                .from('memberships')
                .insert({
                    user_id: supabaseUserId,
                    plan_id: freePlan.id,
                    status: 'active',
                    billing_cycle: 'yearly',
                    current_period_start: now.toISOString(),
                    current_period_end: oneYearFromNow.toISOString(),
                    cancel_at_period_end: false
                });

            if (membershipError) {
                console.error('[AUTH] Error creating membership:', membershipError.message);
                throw membershipError;
            }

            console.log(`[AUTH] Free membership created successfully for: ${email}`);
        } else {
            console.log(`[AUTH] User already has an active membership: ${email}`);
        }

        // ========== STEP 5: Initialize usage tracking for current period ==========
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);
        endOfMonth.setDate(0); // Last day of current month
        endOfMonth.setHours(23, 59, 59, 999);

        const { data: existingUsage } = await supabase
            .from('usage_tracking')
            .select('*')
            .eq('user_id', supabaseUserId)
            .eq('period_start', startOfMonth.toISOString().split('T')[0])
            .single();

        if (!existingUsage) {
            const { data: membership } = await supabase
                .from('memberships')
                .select('id')
                .eq('user_id', supabaseUserId)
                .eq('status', 'active')
                .single();

            if (membership) {
                await supabase
                    .from('usage_tracking')
                    .insert({
                        user_id: supabaseUserId,
                        membership_id: membership.id,
                        period_start: startOfMonth.toISOString().split('T')[0],
                        period_end: endOfMonth.toISOString().split('T')[0],
                        analyses_generated: 0,
                        audio_generated: 0,
                        tokens_consumed: 0
                    });

                console.log(`[AUTH] Usage tracking initialized for: ${email}`);
            }
        }

        // ========== STEP 6: Initialize user preferences if they don't exist ==========
        const { data: existingPreferences } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', supabaseUserId)
            .single();

        if (!existingPreferences) {
            await supabase
                .from('user_preferences')
                .insert({
                    user_id: supabaseUserId,
                    default_language: 'es',
                    default_detail_level: 'standard',
                    default_tone: 'engaging',
                    auto_generate_audio: false,
                    theme: 'dark',
                    email_notifications: true,
                    new_features_newsletter: true
                });

            console.log(`[AUTH] User preferences initialized for: ${email}`);
        }

        // ========== STEP 7: Generate Magic Link for session ==========
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

        console.log(`[AUTH] ✅ Complete onboarding successful for: ${email}`);

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
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import supabase from '@/utils/supabase';
import type { Membership, Usage, MembershipResponse, UsageResponse } from '@/types/membership';

// ============================================
// TYPES
// ============================================

interface AuthContextType {
    // Auth
    user: User | null;
    session: Session | null;
    loading: boolean;

    // Membership & Usage
    membership: Membership | null;
    usage: Usage | null;
    membershipLoading: boolean;

    // Actions
    signOut: () => Promise<void>;
    refreshMembership: () => Promise<void>;
    refreshUsage: () => Promise<void>;

    // Helpers
    canGenerateAnalysis: () => boolean;
    canGenerateAudio: () => boolean;
    getRemainingAnalyses: () => number;
    getRemainingAudio: () => number;
    getAnalysisLimitStatus: () => LimitStatus;
    getAudioLimitStatus: () => LimitStatus;
    isUnlimited: (action: 'analysis' | 'audio') => boolean;
}

interface LimitStatus {
    canProceed: boolean;
    remaining: number;
    limit: number;
    used: number;
    percentage: number;
    isUnlimited: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// CONFIGURATION
// ============================================

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3100';

// ============================================
// PROVIDER
// ============================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // Auth state
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    // Membership state
    const [membership, setMembership] = useState<Membership | null>(null);
    const [usage, setUsage] = useState<Usage | null>(null);
    const [membershipLoading, setMembershipLoading] = useState(false);

    // Ref to prevent multiple simultaneous fetches
    const fetchingMembershipRef = useRef(false);

    // ============================================
    // HELPER FUNCTIONS (No dependencies on callbacks)
    // ============================================

    /**
     * Check if user can generate analysis
     */
    const canGenerateAnalysis = useCallback((): boolean => {
        if (!membership || !usage) {
            console.debug('Cannot generate analysis: No membership or usage data');
            return false;
        }

        const limit = membership.plan.max_analyses_per_month;

        // -1 means unlimited
        if (limit === -1) return true;

        const canGenerate = usage.analyses_generated < limit;

        if (!canGenerate) {
            console.warn(`Analysis limit reached: ${usage.analyses_generated}/${limit}`);
        }

        return canGenerate;
    }, [membership, usage]);

    /**
     * Check if user can generate audio
     */
    const canGenerateAudio = useCallback((): boolean => {
        if (!membership || !usage) {
            console.debug('Cannot generate audio: No membership or usage data');
            return false;
        }

        const limit = membership.plan.max_audio_generations_per_month;

        // -1 means unlimited
        if (limit === -1) return true;

        const canGenerate = usage.audio_generated < limit;

        if (!canGenerate) {
            console.warn(`Audio limit reached: ${usage.audio_generated}/${limit}`);
        }

        return canGenerate;
    }, [membership, usage]);

    /**
     * Get remaining analyses count
     */
    const getRemainingAnalyses = useCallback((): number => {
        if (!membership || !usage) return 0;

        const limit = membership.plan.max_analyses_per_month;

        if (limit === -1) return Infinity;

        return Math.max(0, limit - usage.analyses_generated);
    }, [membership, usage]);

    /**
     * Get remaining audio count
     */
    const getRemainingAudio = useCallback((): number => {
        if (!membership || !usage) return 0;

        const limit = membership.plan.max_audio_generations_per_month;

        if (limit === -1) return Infinity;

        return Math.max(0, limit - usage.audio_generated);
    }, [membership, usage]);

    /**
     * Get detailed analysis limit status
     */
    const getAnalysisLimitStatus = useCallback((): LimitStatus => {
        if (!membership || !usage) {
            return {
                canProceed: false,
                remaining: 0,
                limit: 0,
                used: 0,
                percentage: 0,
                isUnlimited: false,
            };
        }

        const limit = membership.plan.max_analyses_per_month;
        const used = usage.analyses_generated;
        const isUnlimited = limit === -1;

        if (isUnlimited) {
            return {
                canProceed: true,
                remaining: Infinity,
                limit: -1,
                used,
                percentage: 0,
                isUnlimited: true,
            };
        }

        const remaining = Math.max(0, limit - used);
        const percentage = limit > 0 ? (used / limit) * 100 : 0;

        return {
            canProceed: remaining > 0,
            remaining,
            limit,
            used,
            percentage,
            isUnlimited: false,
        };
    }, [membership, usage]);

    /**
     * Get detailed audio limit status
     */
    const getAudioLimitStatus = useCallback((): LimitStatus => {
        if (!membership || !usage) {
            return {
                canProceed: false,
                remaining: 0,
                limit: 0,
                used: 0,
                percentage: 0,
                isUnlimited: false,
            };
        }

        const limit = membership.plan.max_audio_generations_per_month;
        const used = usage.audio_generated;
        const isUnlimited = limit === -1;

        if (isUnlimited) {
            return {
                canProceed: true,
                remaining: Infinity,
                limit: -1,
                used,
                percentage: 0,
                isUnlimited: true,
            };
        }

        const remaining = Math.max(0, limit - used);
        const percentage = limit > 0 ? (used / limit) * 100 : 0;

        return {
            canProceed: remaining > 0,
            remaining,
            limit,
            used,
            percentage,
            isUnlimited: false,
        };
    }, [membership, usage]);

    /**
     * Check if action is unlimited
     */
    const isUnlimited = useCallback((action: 'analysis' | 'audio'): boolean => {
        if (!membership) return false;

        const limit = action === 'analysis'
            ? membership.plan.max_analyses_per_month
            : membership.plan.max_audio_generations_per_month;

        return limit === -1;
    }, [membership]);

    // ============================================
    // AUTH STATE MANAGEMENT
    // ============================================

    useEffect(() => {
        let isMounted = true;

        // Local function to fetch membership data (avoids dependency issues)
        const loadMembershipData = async (currentSession: Session) => {
            if (!currentSession?.access_token) {
                console.warn('⚠️ Session exists but no access token available');
                return;
            }

            if (fetchingMembershipRef.current) {
                console.log('⏸️ Membership fetch already in progress, skipping...');
                return;
            }

            fetchingMembershipRef.current = true;
            setMembershipLoading(true);

            try {
                console.log('🔑 Fetching membership data with token:', currentSession.access_token.substring(0, 20) + '...');

                const response = await fetch(`${API_BASE_URL}/api/user/membership`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentSession.access_token}`,
                    },
                });

                console.log('📡 Membership API response status:', response.status);

                if (!response.ok) {
                    if (response.status === 404) {
                        console.warn('⚠️ No active membership found for user');
                        if (isMounted) {
                            setMembership(null);
                            setUsage(null);
                        }
                        return;
                    }

                    if (response.status === 401) {
                        console.error('🔒 Unauthorized - token may be invalid or expired');
                        await supabase.auth.refreshSession();
                        return;
                    }

                    const errorText = await response.text();
                    throw new Error(`Failed to fetch membership: ${response.status} - ${errorText}`);
                }

                const data: MembershipResponse = await response.json();

                if (!data.membership || !data.usage) {
                    console.error('❌ Invalid membership response structure:', data);
                    throw new Error('Invalid membership data received from API');
                }

                if (isMounted) {
                    setMembership(data.membership);
                    setUsage(data.usage);

                    console.log('✅ Membership loaded:', {
                        plan: data.membership.plan.name,
                        analyses: `${data.usage.analyses_generated}/${data.membership.plan.max_analyses_per_month}`,
                        audio: `${data.usage.audio_generated}/${data.membership.plan.max_audio_generations_per_month}`,
                    });
                }

            } catch (error) {
                console.error('❌ Error fetching membership:', error);
                if (isMounted) {
                    setMembership(null);
                    setUsage(null);
                }
            } finally {
                if (isMounted) {
                    setMembershipLoading(false);
                }
                fetchingMembershipRef.current = false;
            }
        };

        // Get initial session
        const initializeAuth = async () => {
            try {
                console.log('🔐 Initializing authentication...');

                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('❌ Error getting initial session:', error);
                    throw error;
                }

                if (!isMounted) return;

                console.log('📍 Initial session:', session ? `Found (user: ${session.user.email})` : 'Not found');

                setSession(session);
                setUser(session?.user ?? null);

                // Fetch membership if logged in
                if (session?.user && session?.access_token) {
                    console.log('👤 User authenticated, fetching membership data...');
                    await loadMembershipData(session);
                } else {
                    console.log('👤 No authenticated user found');
                }
            } catch (error) {
                console.error('❌ Error initializing auth:', error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                    console.log('✅ Auth initialization complete');
                }
            }
        };

        initializeAuth();

        // Listen to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!isMounted) return;

                console.log('🔐 Auth event:', event, session ? `(user: ${session.user.email})` : '(no session)');

                setSession(session);
                setUser(session?.user ?? null);

                if (event === 'SIGNED_IN' && session?.user && session?.access_token) {
                    console.log('✅ User signed in, fetching membership...');
                    await loadMembershipData(session);
                } else if (event === 'SIGNED_OUT') {
                    console.log('👋 User signed out, clearing membership data');
                    setMembership(null);
                    setUsage(null);
                } else if (event === 'TOKEN_REFRESHED' && session?.user && session?.access_token) {
                    console.log('🔄 Token refreshed, refreshing membership...');
                    await loadMembershipData(session);
                } else if (event === 'USER_UPDATED') {
                    console.log('👤 User data updated');
                }

                setLoading(false);
            }
        );

        console.log('👂 Auth state change listener registered');

        return () => {
            isMounted = false;
            subscription.unsubscribe();
            console.log('🔇 Auth state change listener unsubscribed');
        };
    }, []); // ✅ Empty dependencies - only runs once

    // ============================================
    // API HELPERS (Created after useEffect to avoid dependency issues)
    // ============================================

    /**
     * Get authorization headers for API requests
     */
    const getAuthHeaders = useCallback((): HeadersInit => {
        if (!session?.access_token) {
            console.warn('⚠️ Attempting to get auth headers without valid session token');
        }

        return {
            'Content-Type': 'application/json',
            'Authorization': session?.access_token ? `Bearer ${session.access_token}` : '',
        };
    }, [session]);

    /**
     * Manual refresh membership function (uses current session from state)
     */
    const refreshMembership = useCallback(async () => {
        if (!session?.access_token) {
            console.warn('⚠️ Cannot refresh membership - no valid session');
            return;
        }

        if (fetchingMembershipRef.current) {
            console.log('⏸️ Membership fetch already in progress, skipping...');
            return;
        }

        fetchingMembershipRef.current = true;
        setMembershipLoading(true);

        try {
            console.log('🔄 Manually refreshing membership...');

            const response = await fetch(`${API_BASE_URL}/api/user/membership`, {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                if (response.status === 404) {
                    console.warn('⚠️ No active membership found for user');
                    setMembership(null);
                    setUsage(null);
                    return;
                }

                if (response.status === 401) {
                    console.error('🔒 Unauthorized - token may be invalid or expired');
                    await supabase.auth.refreshSession();
                    return;
                }

                throw new Error(`Failed to fetch membership: ${response.status}`);
            }

            const data: MembershipResponse = await response.json();

            if (!data.membership || !data.usage) {
                throw new Error('Invalid membership data received from API');
            }

            setMembership(data.membership);
            setUsage(data.usage);

            console.log('✅ Membership refreshed');

        } catch (error) {
            console.error('❌ Error refreshing membership:', error);
        } finally {
            setMembershipLoading(false);
            fetchingMembershipRef.current = false;
        }
    }, [session, getAuthHeaders]);

    /**
     * Refresh usage only (lighter operation)
     */
    const refreshUsage = useCallback(async () => {
        if (!session?.access_token) {
            console.warn('⚠️ Cannot refresh usage - no valid session');
            return;
        }

        try {
            console.log('🔄 Refreshing usage data...');

            const response = await fetch(`${API_BASE_URL}/api/user/usage`, {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.error('🔒 Unauthorized - token may be invalid or expired');
                    return;
                }
                throw new Error(`Failed to refresh usage: ${response.status}`);
            }

            const data: UsageResponse = await response.json();

            if (!data.usage) {
                console.error('❌ Invalid usage response structure:', data);
                return;
            }

            setUsage(data.usage);

            console.log('✅ Usage refreshed:', {
                analyses: data.usage.analyses_generated,
                audio: data.usage.audio_generated,
            });

        } catch (error) {
            console.error('❌ Error refreshing usage:', error);
        }
    }, [session, getAuthHeaders]);

    // ============================================
    // SIGN OUT
    // ============================================

    const signOut = async () => {
        try {
            console.log('👋 Signing out user...');
            await supabase.auth.signOut();
            setUser(null);
            setSession(null);
            setMembership(null);
            setUsage(null);
            console.log('✅ User signed out successfully');
        } catch (error) {
            console.error('❌ Error signing out:', error);
            throw error;
        }
    };

    // ============================================
    // CONTEXT VALUE
    // ============================================

    const value: AuthContextType = {
        // Auth
        user,
        session,
        loading,

        // Membership
        membership,
        usage,
        membershipLoading,

        // Actions
        signOut,
        refreshMembership,
        refreshUsage,

        // Helpers
        canGenerateAnalysis,
        canGenerateAudio,
        getRemainingAnalyses,
        getRemainingAudio,
        getAnalysisLimitStatus,
        getAudioLimitStatus,
        isUnlimited,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// ============================================
// HOOK
// ============================================

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}

// ============================================
// EXPORT TYPES
// ============================================

export type { AuthContextType, LimitStatus };
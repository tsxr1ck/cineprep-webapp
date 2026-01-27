// client/src/types/membership.types.ts

/**
 * Plan tier types
 */
export type PlanSlug = 'free' | 'pro' | 'premium';

/**
 * Membership status
 */
export type MembershipStatus = 'active' | 'cancelled' | 'expired' | 'suspended';

/**
 * Billing cycle
 */
export type BillingCycle = 'monthly' | 'yearly' | 'lifetime';

/**
 * Plan information
 */
export interface Plan {
    id: string;
    name: string;
    slug: PlanSlug;
    description: string;
    price_monthly: number;
    price_yearly: number;
    max_analyses_per_month: number; // -1 = unlimited
    max_audio_generations_per_month: number; // -1 = unlimited
    can_access_premium_voices: boolean;
    can_force_regenerate: boolean;
    priority_queue: boolean;
    features: string[];
}

/**
 * User membership details
 */
export interface Membership {
    id: string;
    status: MembershipStatus;
    billing_cycle: BillingCycle | null;
    current_period_start: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    plan: Plan;
}

/**
 * Usage tracking for current period
 */
export interface Usage {
    analyses_generated: number;
    audio_generated: number;
    tokens_consumed: number;
    period_start: string;
    period_end: string;
    last_reset_at?: string;
}

/**
 * API Response: /api/user/membership
 */
export interface MembershipResponse {
    membership: Membership;
    usage: Usage;
}

/**
 * API Response: /api/user/usage
 */
export interface UsageResponse {
    usage: Usage;
}

/**
 * API Response: User stats
 */
export interface UserStatsResponse {
    stats: {
        total_analyses: number;
        favorite_analyses: number;
        total_audio_generated: number;
        total_tokens_consumed: number;
        current_month: {
            analyses: number;
            audio: number;
        };
        most_analyzed_movie: string | null;
    };
}

/**
 * API Error Response when limit is reached
 */
export interface LimitReachedError {
    error: 'Limit Reached';
    message: string;
    usage: {
        used: number;
        limit: number;
        remaining: number;
    };
    upgrade_url: string;
    current_plan: PlanSlug;
}

/**
 * Helper type for limit checking
 */
export interface LimitStatus {
    canProceed: boolean;
    remaining: number;
    limit: number;
    used: number;
    percentage: number; // 0-100
}

/**
 * Usage increment request
 */
export interface IncrementUsageRequest {
    action: 'analysis' | 'audio';
    amount?: number;
}

/**
 * Usage increment response
 */
export interface IncrementUsageResponse {
    success: boolean;
    usage: {
        analyses_generated: number;
        audio_generated: number;
        tokens_consumed: number;
    };
}
// Types for the CinePrep API

export interface Movie {
    id: number;
    title: string;
    overview: string;
    release_date: string;
    poster_path?: string;
}

export interface KeyFact {
    id: number;
    text: string;
    importance: 'critical' | 'important';
}

export interface MovieSummary {
    narrative: string;
    tone: string;
    key_facts: KeyFact[];
    emotional_beats: string[];
}

export interface RequiredMovie {
    tmdb_id: number;
    title: string;
    poster_path: string;
    priority: 'essential' | 'recommended';
    watch_time: string;
    summary: MovieSummary;
    audio: {
        status: 'pending' | 'ready';
        duration: string;
        voice_name: string;
    };
}

export interface LoreAnalysis {
    status: 'ready' | 'error';
    generated_at: string;
    required_movies: RequiredMovie[];
    spoiler_free_guarantee: {
        enabled: boolean;
        message: string;
    };
    preparation_time: string;
    token_usage?: {
        input_tokens: number;
        output_tokens: number;
        total_tokens: number;
        estimated_cost?: string;
    };
}

export interface TokenUsage {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    estimated_cost?: string;
}

// ============================================
// FAVORITES & TASTE PROFILE TYPES
// ============================================

export interface UserFavorite {
    id: string;
    user_id: string;
    user_analysis_id: string;
    tmdb_movie_id: number;
    movie_title: string;
    movie_poster_path: string | null;
    genres: Genre[];
    vote_average: number | null;
    release_year: number | null;
    created_at: string;
}

export interface Genre {
    id: number;
    name: string;
}

export interface GenrePreference {
    [genreName: string]: number; // Score 0-100
}

export interface DecadePreference {
    [decade: string]: number; // Score 0-100
}

export interface FranchisePreference {
    collection_id: number;
    name: string;
    score: number;
}

export interface TonePreference {
    [tone: string]: number; // Score 0-100
}

export interface UserTasteProfile {
    id: string;
    user_id: string;
    genre_preferences: GenrePreference;
    decade_preferences: DecadePreference;
    franchise_preferences: FranchisePreference[];
    tone_preferences: TonePreference;
    avg_movie_rating: number;
    total_movies_analyzed: number;
    emotional_keywords: string[];
    notification_enabled: boolean;
    notification_frequency: 'daily' | 'weekly' | 'monthly' | 'never';
    last_recommendation_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface MovieRecommendation {
    id: string;
    user_id: string;
    tmdb_movie_id: number;
    movie_title: string;
    movie_poster_path: string | null;
    movie_backdrop_path: string | null;
    release_date: string | null;
    vote_average: number | null;
    genres: Genre[];
    overview: string | null;
    recommendation_score: number;
    recommendation_reason: string | null;
    matching_factors: {
        genre_match?: number;
        franchise_match?: number;
        tone_match?: number;
        decade_match?: number;
    };
    status: 'pending' | 'sent' | 'viewed' | 'dismissed' | 'converted';
    notification_sent_at: string | null;
    viewed_at: string | null;
    created_at: string;
}

export interface NotificationQueueItem {
    id: string;
    user_id: string;
    notification_type: 'movie_recommendation' | 'new_release' | 'franchise_update';
    title: string;
    body: string;
    data: Record<string, unknown>;
    channels: ('push' | 'email')[];
    status: 'pending' | 'processing' | 'sent' | 'failed';
    scheduled_for: string;
    sent_at: string | null;
    error_message: string | null;
    retry_count: number;
    created_at: string;
    updated_at: string;
}

export interface UserNotificationToken {
    id: string;
    user_id: string;
    token: string;
    platform: 'web' | 'ios' | 'android';
    device_name: string | null;
    is_active: boolean;
    last_used_at: string;
    created_at: string;
    updated_at: string;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface AddFavoriteRequest {
    user_analysis_id: string;
    tmdb_movie_id: number;
    movie_title: string;
    movie_poster_path?: string;
    genres?: Genre[];
    vote_average?: number;
    release_year?: number;
}

export interface UpdateTasteProfileRequest {
    notification_enabled?: boolean;
    notification_frequency?: 'daily' | 'weekly' | 'monthly' | 'never';
}

export interface RegisterNotificationTokenRequest {
    token: string;
    platform: 'web' | 'ios' | 'android';
    device_name?: string;
}

export interface FavoritesListResponse {
    favorites: UserFavorite[];
    total: number;
    limit: number;
    offset: number;
}

export interface TasteProfileResponse {
    profile: UserTasteProfile;
    top_genres: { name: string; score: number }[];
    top_franchises: FranchisePreference[];
}

export interface RecommendationsResponse {
    recommendations: MovieRecommendation[];
    total: number;
}

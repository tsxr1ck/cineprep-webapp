// Types for Favorites and Taste Profile

import type { LoreAnalysis } from './lore';

// ============================================
// FAVORITES TYPES
// ============================================

export interface Genre {
    id: number;
    name: string;
}

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
    analysis_data?: LoreAnalysis;
}

export interface FavoritesListResponse {
    favorites: UserFavorite[];
    total: number;
    limit: number;
    offset: number;
}

// ============================================
// TASTE PROFILE TYPES
// ============================================

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

export type NotificationFrequency = 'daily' | 'weekly' | 'monthly' | 'never';

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
    notification_frequency: NotificationFrequency;
    last_recommendation_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface TasteProfileResponse {
    profile: UserTasteProfile;
    top_genres: { name: string; score: number }[];
    top_franchises: FranchisePreference[];
}

// ============================================
// RECOMMENDATIONS TYPES
// ============================================

export interface MatchingFactors {
    genre_match?: number;
    franchise_match?: number;
    tone_match?: number;
    decade_match?: number;
}

export type RecommendationStatus = 'pending' | 'sent' | 'viewed' | 'dismissed' | 'converted';

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
    matching_factors: MatchingFactors;
    status: RecommendationStatus;
    notification_sent_at: string | null;
    viewed_at: string | null;
    created_at: string;
}

export interface RecommendationsResponse {
    recommendations: MovieRecommendation[];
    total: number;
}

// ============================================
// API REQUEST TYPES
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
    notification_frequency?: NotificationFrequency;
}

export interface RegisterNotificationTokenRequest {
    token: string;
    platform: 'web' | 'ios' | 'android';
    device_name?: string;
}

// ============================================
// HOOK TYPES
// ============================================

export interface UseFavoritesReturn {
    favorites: UserFavorite[];
    loading: boolean;
    error: string | null;
    total: number;
    hasMore: boolean;
    fetchFavorites: (reset?: boolean) => Promise<void>;
    addFavorite: (data: AddFavoriteRequest) => Promise<boolean>;
    removeFavorite: (favoriteId: string) => Promise<boolean>;
    toggleFavorite: (analysisId: string) => Promise<boolean>;
    isFavorite: (analysisId: string) => boolean;
}

export interface UseTasteProfileReturn {
    profile: UserTasteProfile | null;
    topGenres: { name: string; score: number }[];
    topFranchises: FranchisePreference[];
    loading: boolean;
    error: string | null;
    fetchProfile: () => Promise<void>;
    updateSettings: (settings: UpdateTasteProfileRequest) => Promise<boolean>;
    refreshProfile: () => Promise<boolean>;
}

export interface UseRecommendationsReturn {
    recommendations: MovieRecommendation[];
    loading: boolean;
    error: string | null;
    total: number;
    hasMore: boolean;
    fetchRecommendations: (reset?: boolean) => Promise<void>;
    markAsViewed: (recommendationId: string) => Promise<boolean>;
    dismiss: (recommendationId: string) => Promise<boolean>;
}

// ============================================
// USER PREFERENCES TYPES
// ============================================

export type DetailLevel = 'brief' | 'standard' | 'detailed';
export type Tone = 'neutral' | 'engaging' | 'dramatic' | 'humorous';
export type Theme = 'light' | 'dark' | 'system';
export type Language = 'es' | 'en';

export interface UserPreferences {
    user_id: string;
    default_language: Language | null;
    default_detail_level: DetailLevel | null;
    default_tone: Tone | null;
    preferred_voice_id: string | null;
    auto_generate_audio: boolean | null;
    theme: Theme | null;
    email_notifications: boolean | null;
    new_features_newsletter: boolean | null;
    updated_at: string | null;
}

export interface PreferencesResponse {
    preferences: UserPreferences;
    success: boolean;
}

export interface UpdatePreferencesRequest {
    default_language?: Language;
    default_detail_level?: DetailLevel;
    default_tone?: Tone;
    preferred_voice_id?: string;
    auto_generate_audio?: boolean;
    theme?: Theme;
    email_notifications?: boolean;
    new_features_newsletter?: boolean;
}

export interface UseSettingsReturn {
    preferences: UserPreferences | null;
    loading: boolean;
    error: string | null;
    isSaving: boolean;
    fetchPreferences: () => Promise<void>;
    updatePreferences: (settings: UpdatePreferencesRequest) => Promise<boolean>;
    resetPreferences: () => Promise<boolean>;
}

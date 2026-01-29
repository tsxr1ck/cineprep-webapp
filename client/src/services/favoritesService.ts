// Favorites Service - API calls for favorites, taste profile, and recommendations

import type {
    FavoritesListResponse,
    TasteProfileResponse,
    RecommendationsResponse,
    AddFavoriteRequest,
    UpdateTasteProfileRequest,
    RegisterNotificationTokenRequest,
    UserFavorite,
    UserTasteProfile
} from '@/types/favorites';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3100';

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getAuthHeaders(): Promise<HeadersInit> {
    // Get the session from Supabase
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
    );

    const { data: { session } } = await supabase.auth.getSession();

    return {
        'Content-Type': 'application/json',
        'Authorization': session?.access_token ? `Bearer ${session.access_token}` : ''
    };
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
}

// ============================================
// FAVORITES API
// ============================================

export const FavoritesService = {
    /**
     * Get user's favorites list
     */
    async getFavorites(limit: number = 20, offset: number = 0): Promise<FavoritesListResponse> {
        const headers = await getAuthHeaders();
        const response = await fetch(
            `${API_BASE_URL}/api/favorites?limit=${limit}&offset=${offset}`,
            { method: 'GET', headers }
        );
        return handleResponse<FavoritesListResponse>(response);
    },

    /**
     * Add a lore analysis to favorites
     */
    async addFavorite(data: AddFavoriteRequest): Promise<{ success: boolean; favorite: UserFavorite }> {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/api/favorites`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    /**
     * Remove a favorite
     */
    async removeFavorite(favoriteId: string): Promise<{ success: boolean; message: string }> {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/api/favorites/${favoriteId}`, {
            method: 'DELETE',
            headers
        });
        return handleResponse(response);
    },

    /**
     * Toggle favorite status for an analysis
     */
    async toggleFavorite(analysisId: string): Promise<{ success: boolean; is_favorite: boolean }> {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/api/favorites/toggle/${analysisId}`, {
            method: 'POST',
            headers
        });
        return handleResponse(response);
    }
};

// ============================================
// TASTE PROFILE API
// ============================================

export const TasteProfileService = {
    /**
     * Get user's taste profile
     */
    async getProfile(): Promise<TasteProfileResponse> {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/api/favorites/taste-profile`, {
            method: 'GET',
            headers
        });
        return handleResponse<TasteProfileResponse>(response);
    },

    /**
     * Update taste profile settings
     */
    async updateSettings(settings: UpdateTasteProfileRequest): Promise<{ success: boolean; profile: UserTasteProfile }> {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/api/favorites/taste-profile`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(settings)
        });
        return handleResponse(response);
    },

    /**
     * Force refresh taste profile
     */
    async refreshProfile(): Promise<{ success: boolean; profile: UserTasteProfile }> {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/api/favorites/taste-profile/refresh`, {
            method: 'POST',
            headers
        });
        return handleResponse(response);
    }
};

// ============================================
// RECOMMENDATIONS API
// ============================================

export const RecommendationsService = {
    /**
     * Get personalized recommendations
     */
    async getRecommendations(limit: number = 10, offset: number = 0): Promise<RecommendationsResponse> {
        const headers = await getAuthHeaders();
        const response = await fetch(
            `${API_BASE_URL}/api/favorites/recommendations?limit=${limit}&offset=${offset}`,
            { method: 'GET', headers }
        );
        return handleResponse<RecommendationsResponse>(response);
    },

    /**
     * Mark recommendation as viewed
     */
    async markAsViewed(recommendationId: string): Promise<{ success: boolean; message: string }> {
        const headers = await getAuthHeaders();
        const response = await fetch(
            `${API_BASE_URL}/api/favorites/recommendations/${recommendationId}/view`,
            { method: 'POST', headers }
        );
        return handleResponse(response);
    },

    /**
     * Dismiss a recommendation
     */
    async dismiss(recommendationId: string): Promise<{ success: boolean; message: string }> {
        const headers = await getAuthHeaders();
        const response = await fetch(
            `${API_BASE_URL}/api/favorites/recommendations/${recommendationId}/dismiss`,
            { method: 'POST', headers }
        );
        return handleResponse(response);
    }
};

// ============================================
// NOTIFICATION TOKEN API
// ============================================

export const NotificationService = {
    /**
     * Register a push notification token
     */
    async registerToken(data: RegisterNotificationTokenRequest): Promise<{ success: boolean; token: any }> {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/api/favorites/notification-token`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    /**
     * Deactivate a notification token
     */
    async deactivateToken(token: string): Promise<{ success: boolean; message: string }> {
        const headers = await getAuthHeaders();
        const response = await fetch(
            `${API_BASE_URL}/api/favorites/notification-token/${encodeURIComponent(token)}`,
            { method: 'DELETE', headers }
        );
        return handleResponse(response);
    }
};

export default {
    favorites: FavoritesService,
    tasteProfile: TasteProfileService,
    recommendations: RecommendationsService,
    notifications: NotificationService
};

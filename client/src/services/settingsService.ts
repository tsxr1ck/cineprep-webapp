// Settings Service - API calls for user preferences

import type { PreferencesResponse } from '@/types/favorites';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3100';

interface UpdatePreferencesRequest {
    default_language?: string;
    default_detail_level?: string;
    default_tone?: string;
    preferred_voice_id?: string;
    auto_generate_audio?: boolean;
    theme?: string;
    email_notifications?: boolean;
    new_features_newsletter?: boolean;
}

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
// SETTINGS API
// ============================================

export const SettingsService = {
    /**
     * Get user's preferences
     */
    async getPreferences(): Promise<PreferencesResponse> {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/api/settings`, {
            method: 'GET',
            headers
        });
        return handleResponse<PreferencesResponse>(response);
    },

    /**
     * Update user's preferences
     */
    async updatePreferences(data: UpdatePreferencesRequest): Promise<PreferencesResponse> {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/api/settings`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data)
        });
        return handleResponse<PreferencesResponse>(response);
    },

    /**
     * Reset preferences to defaults
     */
    async resetPreferences(): Promise<PreferencesResponse> {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/api/settings`, {
            method: 'DELETE',
            headers
        });
        return handleResponse<PreferencesResponse>(response);
    }
};

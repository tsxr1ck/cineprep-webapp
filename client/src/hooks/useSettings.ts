// useSettings Hook - Manage user settings/preferences

import { useState, useCallback } from 'react';
import { SettingsService } from '@/services/settingsService';
import type {
    UserPreferences,
    UpdatePreferencesRequest,
    UseSettingsReturn
} from '@/types/favorites';

export function useSettings(): UseSettingsReturn {
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const fetchPreferences = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await SettingsService.getPreferences();
            setPreferences(response.preferences);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch preferences');
            console.error('Error fetching preferences:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const updatePreferences = useCallback(async (settings: UpdatePreferencesRequest): Promise<boolean> => {
        setIsSaving(true);
        setError(null);

        try {
            const response = await SettingsService.updatePreferences(settings);
            if (response.success) {
                setPreferences(response.preferences);
                return true;
            }
            return false;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update preferences');
            console.error('Error updating preferences:', err);
            return false;
        } finally {
            setIsSaving(false);
        }
    }, []);

    const resetPreferences = useCallback(async (): Promise<boolean> => {
        setIsSaving(true);
        setError(null);

        try {
            const response = await SettingsService.resetPreferences();
            if (response.success) {
                setPreferences(response.preferences);
                return true;
            }
            return false;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reset preferences');
            console.error('Error resetting preferences:', err);
            return false;
        } finally {
            setIsSaving(false);
        }
    }, []);

    return {
        preferences,
        loading,
        error,
        isSaving,
        fetchPreferences,
        updatePreferences,
        resetPreferences
    };
}

export default useSettings;

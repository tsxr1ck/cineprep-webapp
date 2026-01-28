// useFavorites Hook - Manage user favorites state

import { useState, useCallback, useEffect } from 'react';
import { FavoritesService, TasteProfileService, RecommendationsService } from '@/services/favoritesService';
import type {
    UserFavorite,
    UserTasteProfile,
    MovieRecommendation,
    FranchisePreference,
    AddFavoriteRequest,
    UpdateTasteProfileRequest,
    UseFavoritesReturn,
    UseTasteProfileReturn,
    UseRecommendationsReturn
} from '@/types/favorites';

// ============================================
// useFavorites Hook
// ============================================

export function useFavorites(): UseFavoritesReturn {
    const [favorites, setFavorites] = useState<UserFavorite[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [offset, setOffset] = useState(0);
    const LIMIT = 20;

    const fetchFavorites = useCallback(async (reset: boolean = false) => {
        setLoading(true);
        setError(null);

        try {
            const newOffset = reset ? 0 : offset;
            const response = await FavoritesService.getFavorites(LIMIT, newOffset);

            if (reset) {
                setFavorites(response.favorites);
                setOffset(LIMIT);
            } else {
                setFavorites(prev => [...prev, ...response.favorites]);
                setOffset(prev => prev + LIMIT);
            }

            setTotal(response.total);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch favorites');
            console.error('Error fetching favorites:', err);
        } finally {
            setLoading(false);
        }
    }, [offset]);

    const addFavorite = useCallback(async (data: AddFavoriteRequest): Promise<boolean> => {
        try {
            const response = await FavoritesService.addFavorite(data);
            if (response.success) {
                setFavorites(prev => [response.favorite, ...prev]);
                setTotal(prev => prev + 1);
                return true;
            }
            return false;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add favorite');
            console.error('Error adding favorite:', err);
            return false;
        }
    }, []);

    const removeFavorite = useCallback(async (favoriteId: string): Promise<boolean> => {
        try {
            const response = await FavoritesService.removeFavorite(favoriteId);
            if (response.success) {
                setFavorites(prev => prev.filter(f => f.id !== favoriteId));
                setTotal(prev => prev - 1);
                return true;
            }
            return false;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove favorite');
            console.error('Error removing favorite:', err);
            return false;
        }
    }, []);

    const toggleFavorite = useCallback(async (analysisId: string): Promise<boolean> => {
        try {
            const response = await FavoritesService.toggleFavorite(analysisId);
            if (response.success) {
                if (response.is_favorite) {
                    // Refresh favorites list to get the new favorite
                    await fetchFavorites(true);
                } else {
                    // Remove from local state
                    setFavorites(prev => prev.filter(f => f.user_analysis_id !== analysisId));
                    setTotal(prev => prev - 1);
                }
                return true;
            }
            return false;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to toggle favorite');
            console.error('Error toggling favorite:', err);
            return false;
        }
    }, [fetchFavorites]);

    const isFavorite = useCallback((analysisId: string): boolean => {
        return favorites.some(f => f.user_analysis_id === analysisId);
    }, [favorites]);

    const hasMore = favorites.length < total;

    return {
        favorites,
        loading,
        error,
        total,
        hasMore,
        fetchFavorites,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite
    };
}

// ============================================
// useTasteProfile Hook
// ============================================

export function useTasteProfile(): UseTasteProfileReturn {
    const [profile, setProfile] = useState<UserTasteProfile | null>(null);
    const [topGenres, setTopGenres] = useState<{ name: string; score: number }[]>([]);
    const [topFranchises, setTopFranchises] = useState<FranchisePreference[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await TasteProfileService.getProfile();
            setProfile(response.profile);
            setTopGenres(response.top_genres);
            setTopFranchises(response.top_franchises);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch taste profile');
            console.error('Error fetching taste profile:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateSettings = useCallback(async (settings: UpdateTasteProfileRequest): Promise<boolean> => {
        try {
            const response = await TasteProfileService.updateSettings(settings);
            if (response.success) {
                setProfile(response.profile);
                return true;
            }
            return false;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update settings');
            console.error('Error updating taste profile settings:', err);
            return false;
        }
    }, []);

    const refreshProfile = useCallback(async (): Promise<boolean> => {
        setLoading(true);
        try {
            const response = await TasteProfileService.refreshProfile();
            if (response.success) {
                setProfile(response.profile);
                // Re-fetch to get top genres and franchises
                await fetchProfile();
                return true;
            }
            return false;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to refresh profile');
            console.error('Error refreshing taste profile:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchProfile]);

    return {
        profile,
        topGenres,
        topFranchises,
        loading,
        error,
        fetchProfile,
        updateSettings,
        refreshProfile
    };
}

// ============================================
// useRecommendations Hook
// ============================================

export function useRecommendations(): UseRecommendationsReturn {
    const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [offset, setOffset] = useState(0);
    const LIMIT = 10;

    const fetchRecommendations = useCallback(async (reset: boolean = false) => {
        setLoading(true);
        setError(null);

        try {
            const newOffset = reset ? 0 : offset;
            const response = await RecommendationsService.getRecommendations(LIMIT, newOffset);

            if (reset) {
                setRecommendations(response.recommendations);
                setOffset(LIMIT);
            } else {
                setRecommendations(prev => [...prev, ...response.recommendations]);
                setOffset(prev => prev + LIMIT);
            }

            setTotal(response.total);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
            console.error('Error fetching recommendations:', err);
        } finally {
            setLoading(false);
        }
    }, [offset]);

    const markAsViewed = useCallback(async (recommendationId: string): Promise<boolean> => {
        try {
            const response = await RecommendationsService.markAsViewed(recommendationId);
            if (response.success) {
                setRecommendations(prev =>
                    prev.map(r =>
                        r.id === recommendationId
                            ? { ...r, status: 'viewed' as const, viewed_at: new Date().toISOString() }
                            : r
                    )
                );
                return true;
            }
            return false;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to mark as viewed');
            console.error('Error marking recommendation as viewed:', err);
            return false;
        }
    }, []);

    const dismiss = useCallback(async (recommendationId: string): Promise<boolean> => {
        try {
            const response = await RecommendationsService.dismiss(recommendationId);
            if (response.success) {
                setRecommendations(prev => prev.filter(r => r.id !== recommendationId));
                setTotal(prev => prev - 1);
                return true;
            }
            return false;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to dismiss recommendation');
            console.error('Error dismissing recommendation:', err);
            return false;
        }
    }, []);

    const hasMore = recommendations.length < total;

    return {
        recommendations,
        loading,
        error,
        total,
        hasMore,
        fetchRecommendations,
        markAsViewed,
        dismiss
    };
}

export default useFavorites;

import { useAuth } from "@/contexts/useAuth";
import { useState, useEffect, useCallback } from "react";

interface UserAnalysis {
    id: string;
    tmdb_movie_id: number;
    movie_title: string;
    movie_poster_path: string | null;
    is_favorite: boolean;
    user_rating: number | null;
    created_at: string;
}

interface HistoryResponse {
    analyses: UserAnalysis[];
    total: number;
    limit: number;
    offset: number;
}

interface UseHistoryReturn {
    history: UserAnalysis[];
    isLoading: boolean;
    error: string | null;
    total: number;
    hasAnalysis: (movieId: number) => boolean;
    getAnalysis: (movieId: number) => UserAnalysis | undefined;
    refetch: () => Promise<void>;
    clearCache: () => void;
}

const CACHE_KEY = 'cineprep_history_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CachedHistory {
    data: UserAnalysis[];
    total: number;
    timestamp: number;
}

export function useHistory(limit: number = 100, offset: number = 0): UseHistoryReturn {
    const [history, setHistory] = useState<UserAnalysis[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const { session } = useAuth();
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3100';
    /**
     * Get cached history from localStorage
     */
    const getCachedHistory = useCallback((): CachedHistory | null => {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (!cached) return null;

            const parsed: CachedHistory = JSON.parse(cached);
            const isValid = Date.now() - parsed.timestamp < CACHE_TTL;

            if (!isValid) {
                localStorage.removeItem(CACHE_KEY);
                console.log('🗑️ History cache expired');
                return null;
            }

            console.log('✅ Using cached history');
            return parsed;
        } catch (error) {
            console.error('Error reading history cache:', error);
            return null;
        }
    }, []);

    /**
     * Save history to localStorage
     */
    const setCachedHistory = useCallback((data: UserAnalysis[], total: number): void => {
        try {
            const cacheData: CachedHistory = {
                data,
                total,
                timestamp: Date.now()
            };

            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
            console.log('💾 History cached successfully');
        } catch (error) {
            console.error('Error caching history:', error);

            // If quota exceeded, clear old cache and try again
            if (error instanceof Error && error.name === 'QuotaExceededError') {
                console.warn('⚠️ LocalStorage full, clearing history cache...');
                localStorage.removeItem(CACHE_KEY);
            }
        }
    }, []);

    /**
     * Fetch history from API
     */
    const fetchHistory = useCallback(async (skipCache: boolean = false) => {
        // Try to use cache first unless explicitly skipped
        if (!skipCache) {
            const cached = getCachedHistory();
            if (cached) {
                setHistory(cached.data);
                setTotal(cached.total);
                setIsLoading(false);
                return;
            }
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log('🔄 Fetching history from API...');

            const response = await fetch(
                `${BACKEND_URL}/api/lore/history?limit=${limit}&offset=${offset}`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        'Authorization': `Bearer ${session?.access_token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch history");
            }

            const data: HistoryResponse = await response.json();

            setHistory(data.analyses);
            setTotal(data.total);

            // Cache the results
            setCachedHistory(data.analyses, data.total);

            console.log(`✅ History loaded: ${data.analyses.length} analyses`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            setError(errorMessage);
            console.error("Error fetching history:", err);
        } finally {
            setIsLoading(false);
        }
    }, [limit, offset, getCachedHistory, setCachedHistory]);

    /**
     * Initial fetch on mount
     */
    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    /**
     * Check if a movie has been analyzed
     */
    const hasAnalysis = useCallback(
        (movieId: number): boolean => {
            return history.some((analysis) => analysis.tmdb_movie_id === movieId);
        },
        [history]
    );

    /**
     * Get analysis for a specific movie
     */
    const getAnalysis = useCallback(
        (movieId: number): UserAnalysis | undefined => {
            return history.find((analysis) => analysis.tmdb_movie_id === movieId);
        },
        [history]
    );

    /**
     * Refetch history (bypasses cache)
     */
    const refetch = useCallback(async () => {
        await fetchHistory(true);
    }, [fetchHistory]);

    /**
     * Clear cache manually
     */
    const clearCache = useCallback(() => {
        localStorage.removeItem(CACHE_KEY);
        console.log('🗑️ History cache cleared');
    }, []);

    return {
        history,
        isLoading,
        error,
        total,
        hasAnalysis,
        getAnalysis,
        refetch,
        clearCache,
    };
}
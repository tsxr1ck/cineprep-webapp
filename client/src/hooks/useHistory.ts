import supabase from "@/utils/supabase";
import { useState, useEffect, useCallback } from "react";

interface UserAnalysis {
    id: number;
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
}

export function useHistory(limit: number = 100, offset: number = 0): UseHistoryReturn {
    const [history, setHistory] = useState<UserAnalysis[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3100';

    const fetchHistory = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(
                `${API_BASE_URL}/api/lore/history?limit=${limit}&offset=${offset}`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        'Authorization': session?.access_token ? `Bearer ${session.access_token}` : '',
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
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            setError(errorMessage);
            console.error("Error fetching history:", err);
        } finally {
            setIsLoading(false);
        }
    }, [limit, offset, API_BASE_URL]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const hasAnalysis = useCallback(
        (movieId: number): boolean => {
            return history.some((analysis) => analysis.tmdb_movie_id === movieId);
        },
        [history]
    );

    const getAnalysis = useCallback(
        (movieId: number): UserAnalysis | undefined => {
            return history.find((analysis) => analysis.tmdb_movie_id === movieId);
        },
        [history]
    );

    const refetch = useCallback(async () => {
        await fetchHistory();
    }, [fetchHistory]);

    return {
        history,
        isLoading,
        error,
        total,
        hasAnalysis,
        getAnalysis,
        refetch,
    };
}
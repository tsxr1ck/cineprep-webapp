// src/services/qwenService.ts
import type { LoreAnalysis } from '@/types/app';
import type { Movie, MovieDetails } from 'tmdb-ts';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3100';

export interface LoreGenerationResponse extends LoreAnalysis {
    from_cache?: boolean;
    user_analysis_id?: string;
    lore_cache_id?: string;
}

export class QwenService {

    /**
     * Generate lore analysis for a movie
     * @param currentMovie - The movie the user wants to watch
     * @param previousMovies - Previous movies in the saga
     * @param accessToken - Supabase access token for authentication
     */
    static async generateLoreAnalysis(
        currentMovie: MovieDetails,
        previousMovies: Movie[],
        accessToken?: string
    ): Promise<LoreGenerationResponse> {
        try {
            console.log('🌐 Enviando solicitud al backend...');

            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };

            // Add authorization header if token is provided
            if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`;
            }

            const response = await fetch(`${BACKEND_URL}/api/lore/generate`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    currentMovie: {
                        id: currentMovie.id,
                        title: currentMovie.title,
                        overview: currentMovie.overview,
                        release_date: currentMovie.release_date,
                        poster_path: currentMovie.poster_path,
                        belongs_to_collection: currentMovie.belongs_to_collection,
                    },
                    previousMovies: previousMovies.map(movie => ({
                        id: movie.id,
                        title: movie.title,
                        overview: movie.overview,
                        release_date: movie.release_date,
                        poster_path: movie.poster_path,
                    })),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                // Handle specific error cases
                if (response.status === 401) {
                    throw new Error('No estás autenticado. Por favor, inicia sesión.');
                }

                if (response.status === 403) {
                    throw new Error(
                        errorData.message || 'Has alcanzado el límite de análisis. Actualiza tu plan para continuar.'
                    );
                }

                throw new Error(
                    errorData.error || `Backend Error: ${response.status} - ${response.statusText}`
                );
            }

            const analysis: LoreGenerationResponse = await response.json();

            console.log('✅ Análisis recibido:', {
                movies: analysis.required_movies?.length,
                status: analysis.status,
                from_cache: analysis.from_cache,
                user_analysis_id: analysis.user_analysis_id
            });

            return analysis;

        } catch (error) {
            console.error('❌ Error generando lore:', error);
            throw error instanceof Error ? error : new Error('Error desconocido');
        }
    }

    /**
     * Get user's lore generation history
     * @param accessToken - Supabase access token
     * @param limit - Number of results to return
     * @param offset - Offset for pagination
     */
    static async getHistory(
        accessToken: string,
        limit: number = 20,
        offset: number = 0
    ): Promise<{
        analyses: any[];
        total: number;
        limit: number;
        offset: number;
    }> {
        try {
            const response = await fetch(
                `${BACKEND_URL}/api/lore/history?limit=${limit}&offset=${offset}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch history: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.error('❌ Error fetching history:', error);
            throw error instanceof Error ? error : new Error('Error desconocido');
        }
    }

    /**
     * Get a specific analysis by ID
     * @param accessToken - Supabase access token
     * @param analysisId - The analysis ID
     */
    static async getAnalysis(
        accessToken: string,
        analysisId: string
    ): Promise<any> {
        try {
            const response = await fetch(
                `${BACKEND_URL}/api/lore/${analysisId}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                }
            );

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Análisis no encontrado');
                }
                throw new Error(`Failed to fetch analysis: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.error('❌ Error fetching analysis:', error);
            throw error instanceof Error ? error : new Error('Error desconocido');
        }
    }

    static async checkHealth(): Promise<boolean> {
        try {
            const response = await fetch(`${BACKEND_URL}/health`);
            return response.ok;
        } catch {
            return false;
        }
    }
}

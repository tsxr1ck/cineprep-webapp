// src/services/qwenService.ts
import type { LoreAnalysis } from '@/types/app';
import type { Movie, MovieDetails } from 'tmdb-ts';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export class QwenService {

    static async generateLoreAnalysis(
        currentMovie: MovieDetails,
        previousMovies: Movie[]
    ): Promise<LoreAnalysis> {
        try {
            console.log('🌐 Enviando solicitud al backend...');

            const response = await fetch(`${BACKEND_URL}/api/lore/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentMovie: {
                        id: currentMovie.id,
                        title: currentMovie.title,
                        overview: currentMovie.overview,
                        release_date: currentMovie.release_date,
                        poster_path: currentMovie.poster_path,
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
                throw new Error(
                    errorData.error || `Backend Error: ${response.status} - ${response.statusText}`
                );
            }

            const analysis: LoreAnalysis = await response.json();

            console.log('✅ Análisis recibido:', {
                movies: analysis.required_movies?.length,
                status: analysis.status
            });

            return analysis;

        } catch (error) {
            console.error('❌ Error generando lore:', error);
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
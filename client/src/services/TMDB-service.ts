import { TMDB, type Movie } from 'tmdb-ts';
import type { ExtendedMovie, ExtendedMovieDetails } from '@/types/tmdb';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const tmdb = new TMDB(API_KEY);

export class TMDBService {
    // Obtener películas próximas a estrenar
    static async getUpcomingMovies(region = 'MX', page = 1): Promise<Movie[]> {
        try {
            const data = await tmdb.movies.upcoming({ language: 'es-MX', region, page });
            return (data.results as Movie[]) || [];
        } catch (error) {
            console.error('Error fetching upcoming movies:', error);
            return [];
        }
    }

    // Obtener películas populares
    static async getPopularMovies(page = 1): Promise<Movie[]> {
        try {
            const data = await tmdb.movies.popular({ language: 'es-MX', page });
            return (data.results as Movie[]) || [];
        } catch (error) {
            console.error('Error fetching popular movies:', error);
            return [];
        }
    }

    // Obtener películas en cartelera
    static async getNowPlayingMovies(region = 'MX', page = 1): Promise<Movie[]> {
        try {
            const data = await tmdb.movies.nowPlaying({ language: 'es-MX', region, page });
            return (data.results as Movie[]) || [];
        } catch (error) {
            console.error('Error fetching now playing movies:', error);
            return [];
        }
    }

    // Obtener detalles de una película específica
    static async getMovieDetails(movieId: number): Promise<ExtendedMovieDetails> {
        try {
            // tmdb-ts supports append_to_response as the second argument
            return (await tmdb.movies.details(movieId, ['credits', 'videos', 'recommendations'], 'es-MX')) as unknown as ExtendedMovieDetails;
        } catch (error) {
            console.error('Error fetching movie details:', error);
            return {} as unknown as ExtendedMovieDetails;
        }
    }

    // Obtener colección (para detectar secuelas)
    static async getCollection(collectionId: number) {
        try {
            return await tmdb.collections.details(collectionId, { language: 'es-MX' });
        } catch (error) {
            console.error('Error fetching collection:', error);
            return null;
        }
    }

    // Obtener videos de una película (trailers, teasers, etc.)
    static async getVideos(movieId: number) {
        try {
            return await tmdb.movies.videos(movieId, { language: 'es-MX' });
        } catch (error) {
            console.error('Error fetching movie videos:', error);
            return null;
        }
    }

    // Buscar películas
    static async searchMovies(query: string): Promise<ExtendedMovie[]> {
        if (!query || query.trim().length < 2) return [];
        try {
            const data = await tmdb.search.movies({ query, language: 'es-MX' });
            return (data.results as ExtendedMovie[]) || [];
        } catch (error) {
            console.error('Error searching movies:', error);
            return [];
        }
    }

    // Analizar si necesita lore (secuelas/precuelas)
    static async analyzeMovieForLore(movieId: number) {
        const movie = await this.getMovieDetails(movieId);

        if (!movie || !movie.belongs_to_collection) {
            return { needs_lore: false, movie };
        }

        const collection = await this.getCollection(movie.belongs_to_collection.id);

        if (!collection || !collection.parts) {
            return { needs_lore: false, movie };
        }

        const previousMovies = collection.parts
            .filter((m: any) => m.release_date && new Date(m.release_date) < new Date(movie.release_date))
            .sort((a: any, b: any) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime());

        return {
            needs_lore: previousMovies.length > 0,
            collection_name: collection.name,
            collection_poster: collection.poster_path,
            previous_movies: previousMovies,
            current_movie: movie,
            total_in_collection: collection.parts.length
        };
    }

    // Helper para construir URLs de imágenes
    static getImageUrl(path: string | null, size = 'w500') {
        if (!path) return null;
        return `https://image.tmdb.org/t/p/${size}${path}`;
    }

    // Helper para poster placeholder
    static getPlaceholderPoster() {
        return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750"%3E%3Crect fill="%231C1C2E" width="500" height="750"/%3E%3Ctext fill="%23A0A0AB" font-family="Inter,sans-serif" font-size="24" text-anchor="middle" x="250" y="375"%3ESin imagen%3C/text%3E%3C/svg%3E';
    }
}

export default TMDBService;
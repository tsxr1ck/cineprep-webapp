import type { Movie, MovieDetails, Credits, Videos } from 'tmdb-ts';

export interface Collection {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
}

export interface ExtendedMovie extends Movie {
    belongs_to_collection?: Collection | null;
    genres?: Array<{ id: number; name: string }>;
    runtime?: number;
    videos?: {
        results: Array<{
            id: string;
            key: string;
            name: string;
            site: string;
            type: string;
        }>;
    };
}

export interface ExtendedMovieDetails extends MovieDetails {
    recommendations?: {
        results: Movie[];
    };
    credits?: Credits;
    videos?: Videos;
}

export interface LoreMovie {
    tmdb_id: number;
    title: string;
    poster_path: string | null;
    priority: 'essential' | 'recommended';
    watch_time?: string;
    summary: {
        narrative: string;
        key_facts: Array<{
            id: string | number;
            text: string;
            importance: 'critical' | 'normal';
        }>;
        emotional_beats: string[];
    };
    audio?: {
        status: 'ready' | 'loading' | 'error';
        voice_name: string;
        duration: string;
        url?: string;
    };
}

export interface CollectionAnalysis {
    needs_lore: boolean;
    movie?: Movie | MovieDetails; // MovieDetails from tmdb-ts
    collection_name?: string;
    collection_poster?: string | null;
    previous_movies?: Movie[]; // Array of movies from the collection
    current_movie?: Movie | MovieDetails; // The current MovieDetails
    total_in_collection?: number;
}

export interface LoreAnalysisData {
    required_movies: LoreMovie[];
    preparation_time: string;
    spoiler_free_guarantee?: {
        enabled: boolean;
        message: string;
    };
}

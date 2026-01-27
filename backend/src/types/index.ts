// Types for the CinePrep API

export interface Movie {
    id: number;
    title: string;
    overview: string;
    release_date: string;
    poster_path?: string;
}

export interface KeyFact {
    id: number;
    text: string;
    importance: 'critical' | 'important';
}

export interface MovieSummary {
    narrative: string;
    tone: string;
    key_facts: KeyFact[];
    emotional_beats: string[];
}

export interface RequiredMovie {
    tmdb_id: number;
    title: string;
    poster_path: string;
    priority: 'essential' | 'recommended';
    watch_time: string;
    summary: MovieSummary;
    audio: {
        status: 'pending' | 'ready';
        duration: string;
        voice_name: string;
    };
}

export interface LoreAnalysis {
    status: 'ready' | 'error';
    generated_at: string;
    required_movies: RequiredMovie[];
    spoiler_free_guarantee: {
        enabled: boolean;
        message: string;
    };
    preparation_time: string;
    token_usage?: {
        input_tokens: number;
        output_tokens: number;
        total_tokens: number;
        estimated_cost?: string;
    };
}

export interface TokenUsage {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    estimated_cost?: string;
}

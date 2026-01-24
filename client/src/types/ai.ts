// src/types/ai.types.ts


import type { Movie, MovieDetails } from 'tmdb-ts';

/**
 * Parámetros para construir el prompt de generación de lore
 */
export interface BuildPromptParams {
    /**
     * Película actual que el usuario va a ver (la secuela/nueva película)
     */
    currentMovie: MovieDetails;

    /**
     * Lista de películas previas que necesitan ser resumidas
     * Ordenadas cronológicamente (más antigua primero)
     */
    previousMovies: Movie[];

    /**
     * Idioma del resumen (ISO 639-1)
     * @default 'es' (español)
     */
    language?: string;

    /**
     * Nivel de detalle del resumen
     * - 'brief': Resumen muy corto (1-2 min lectura)
     * - 'standard': Resumen completo (2-3 min lectura)
     * - 'detailed': Resumen extenso (3-5 min lectura)
     * @default 'standard'
     */
    detail_level?: 'brief' | 'standard' | 'detailed';

    /**
     * Tono del resumen
     * - 'neutral': Objetivo y factual
     * - 'engaging': Narrativo y emocionante
     * - 'casual': Conversacional
     * @default 'engaging'
     */
    tone?: 'neutral' | 'engaging' | 'casual';

    /**
     * Si incluir contexto cultural/histórico de la producción
     * @default false
     */
    include_production_context?: boolean;
}

/**
 * Respuesta de Claude/Qwen API
 */
export interface ClaudeAPIResponse {
    id: string;
    type: 'message';
    role: 'assistant';
    content: ClaudeContent[];
    model: string;
    stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence';
    stop_sequence: string | null;
    usage: {
        input_tokens: number;
        output_tokens: number;
    };
}

/**
 * Contenido de la respuesta de Claude
 */
export interface ClaudeContent {
    type: 'text' | 'tool_use';
    text?: string;
    id?: string;
    name?: string;
    input?: Record<string, any>;
}

/**
 * Respuesta de Qwen API
 */
export interface QwenAPIResponse {
    output: {
        text: string;
        finish_reason: string;
    };
    usage: {
        input_tokens: number;
        output_tokens: number;
        total_tokens: number;
    };
    request_id: string;
}

/**
 * Opciones para generación de audio
 */
export interface AudioGenerationOptions {
    text: string;
    voice_id: string;
    stability?: number;
    similarity_boost?: number;
    style?: number;
    language?: string;
}

/**
 * Respuesta de generación de audio
 */
export interface AudioGenerationResponse {
    status: 'success' | 'error';
    audio_url?: string;
    duration?: string;
    error_message?: string;
}

/**
 * Respuesta directa del servicio TTS (DashScope/Qwen)
 */
export interface TTSResponse {
    output: {
        audio: {
            data: string;
            expires_at: number;
            id: string;
            url: string;
        };
        finish_reason: string;
    };
    usage: {
        characters: number;
    };
    request_id: string;
}
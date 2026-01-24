// src/types/lore.types.ts

/**
 * Importancia de un dato clave
 */
export type FactImportance = 'critical' | 'important' | 'optional';

/**
 * Prioridad de una película requerida
 */
export type MoviePriority = 'essential' | 'recommended' | 'optional';

/**
 * Estado del análisis de lore
 */
export type AnalysisStatus = 'not_generated' | 'generating' | 'ready' | 'error';

/**
 * Estado del audio
 */
export type AudioStatus = 'pending' | 'generating' | 'ready' | 'error';

/**
 * Dato clave que el usuario debe recordar
 */
export interface KeyFact {
    id: number;
    text: string;
    importance: FactImportance;
}

/**
 * Resumen de una película previa
 */
export interface MovieSummary {
    /**
     * Resumen narrativo fluido (4-6 oraciones)
     * Debe capturar el arco emocional sin spoilers de la nueva película
     */
    narrative: string;

    /**
     * Tono de la película (2-4 palabras)
     * Ejemplos: "épico, místico, político"
     */
    tone: string;

    /**
     * Lista de 5 hechos clave (mínimo 3 critical)
     */
    key_facts: KeyFact[];

    /**
     * Momentos emocionales memorables (4-6 items)
     * Formato: "🎬 Emoji + descripción corta"
     */
    emotional_beats: string[];
}

/**
 * Información de audio narrado
 */
export interface AudioInfo {
    /**
     * Estado actual del audio
     */
    status: AudioStatus;

    /**
     * URL del archivo de audio (si está disponible)
     */
    url?: string;

    /**
     * Duración en formato "M:SS"
     * Ejemplo: "2:15"
     */
    duration: string;

    /**
     * Nombre de la voz del narrador
     * Ejemplo: "Narrador Premium", "Morgan Freeman (ES)"
     */
    voice_name: string;

    /**
     * ID de voz para el servicio TTS (opcional)
     */
    voice_id?: string;

    /**
     * Tamaño del archivo en formato legible (opcional)
     * Ejemplo: "3.2 MB"
     */
    file_size?: string;
}

/**
 * Película requerida para entender el nuevo estreno
 */
export interface RequiredMovie {
    /**
     * ID de TMDB de la película
     */
    tmdb_id: number;

    /**
     * Título de la película
     */
    title: string;

    /**
     * Path del poster en TMDB
     * Ejemplo: "/d5NXSklXo0qyIYkgV94XAgMIckC.jpg"
     */
    poster_path: string;

    /**
     * Prioridad de ver esta película
     */
    priority: MoviePriority;

    /**
     * Duración de la película
     * Ejemplo: "155 min"
     */
    watch_time: string;

    /**
     * Resumen generado por IA
     */
    summary: MovieSummary;

    /**
     * Información del audio narrado (opcional)
     */
    audio?: AudioInfo;
}

/**
 * Garantía de contenido sin spoilers
 */
export interface SpoilerFreeGuarantee {
    /**
     * Si la garantía está activa
     */
    enabled: boolean;

    /**
     * Mensaje personalizado de garantía
     */
    message: string;
}

/**
 * Análisis completo de lore para una película
 */
export interface LoreAnalysis {
    /**
     * Estado del análisis
     */
    status: AnalysisStatus;

    /**
     * Timestamp de cuándo se generó (ISO 8601)
     */
    generated_at: string;

    /**
     * Lista de películas que el usuario debe conocer
     * Ordenadas por importancia/cronología
     */
    required_movies: RequiredMovie[];

    /**
     * Garantía de contenido sin spoilers
     */
    spoiler_free_guarantee: SpoilerFreeGuarantee;

    /**
     * Tiempo estimado de preparación
     * Ejemplo: "2 min de lectura • 2:15 de audio"
     */
    preparation_time: string;

    /**
     * Mensaje de error (si status es 'error')
     */
    error_message?: string;
}

/**
 * Datos cacheados del análisis
 */
export interface CachedLoreAnalysis {
    /**
     * Datos del análisis
     */
    data: LoreAnalysis;

    /**
     * Timestamp de cuándo se guardó en cache (milliseconds)
     */
    timestamp: number;
}

/**
 * Respuesta de la API de generación de lore
 */
export interface GenerateLoreResponse {
    /**
     * Análisis generado
     */
    analysis: LoreAnalysis;

    /**
     * Si vino del cache o se generó nuevo
     */
    from_cache: boolean;

    /**
     * Tokens consumidos (para tracking de costos)
     */
    tokens_used?: number;
}

/**
 * Parámetros para generar análisis de lore
 */
export interface GenerateLoreParams {
    /**
     * ID de TMDB de la película a analizar
     */
    movie_id: number;

    /**
     * Forzar regeneración aunque exista cache
     */
    force_regenerate?: boolean;

    /**
     * Idioma del análisis (ISO 639-1)
     */
    language?: string;

    /**
     * Incluir generación de audio
     */
    include_audio?: boolean;

    /**
     * ID de voz para el audio (si include_audio es true)
     */
    voice_id?: string;
}
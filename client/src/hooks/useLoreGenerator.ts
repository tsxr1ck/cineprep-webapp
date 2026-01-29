// src/hooks/useLoreGenerator.ts

import { useState, useCallback } from 'react';
import { TMDBService } from '@/services/TMDB-service';
import { QwenService } from '@/services/qwenService';
import type { LoreGenerationResponse } from '@/services/qwenService';
import { useAuth } from '@/contexts/useAuth';
import type { UseLoreGeneratorReturn } from '@/types/hooks';
import type { LoreAnalysis } from '@/types/lore';
import type { LoadingStage } from '@/types/components';

/**
 * Hook para generar análisis de lore de películas
 * @param movieId - ID de TMDB de la película
 * @returns Funciones y estado para generar lore
 */
export function useLoreGenerator(movieId: number): UseLoreGeneratorReturn {
    const [loading, setLoading] = useState<boolean>(false);
    const [stage, setStage] = useState<number>(0);
    const [analysis, setAnalysis] = useState<LoreAnalysis | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [fromCache, setFromCache] = useState<boolean>(false);

    // Get auth context for session and membership
    const { session, canGenerateAnalysis, refreshUsage, getAnalysisLimitStatus } = useAuth();

    /**
     * Etapas de carga con mensajes descriptivos
     */
    const stages: LoadingStage[] = [
        { id: 1, message: "🔍 Identificando películas previas necesarias..." },
        { id: 2, message: "📊 Analizando colección y precuelas..." },
        { id: 3, message: "🤖 Generando resumen con Qwen AI..." },
        { id: 4, message: "✨ Finalizando análisis..." }
    ];

    /**
     * Función principal: Genera el análisis de lore
     */
    const generateLore = useCallback(async (): Promise<void> => {
        setLoading(true);
        setError(null);
        setStage(0);
        setFromCache(false);

        try {
            // ============================================
            // STAGE 0: Check authentication and credits
            // ============================================
            if (!session?.access_token) {
                throw new Error('Debes iniciar sesión para generar análisis.');
            }

            // Check if user can generate (client-side check)
            if (!canGenerateAnalysis()) {
                const limitStatus = getAnalysisLimitStatus();
                throw new Error(
                    `Has alcanzado el límite de ${limitStatus.limit} análisis este mes. Actualiza tu plan para continuar.`
                );
            }

            // ============================================
            // STAGE 1: Verificar cache local
            // ============================================
            setStage(1);
            await sleep(600);

            // const cached = getCachedAnalysis(movieId);
            // if (cached) {
            //     console.log('✅ Usando análisis del cache local');
            //     await simulateProgress();
            //     setAnalysis(cached);
            //     setFromCache(true);
            //     setLoading(false);
            //     return;
            // }

            // ============================================
            // STAGE 2: Obtener datos de TMDB
            // ============================================
            setStage(2);
            await sleep(800);

            console.log(`🎬 Obteniendo detalles de película ${movieId}...`);
            const movieDetails = await TMDBService.getMovieDetails(movieId);

            // Validar que la película pertenece a una colección
            if (!movieDetails.belongs_to_collection) {
                throw new Error(
                    'Esta película no pertenece a una colección/saga. No necesita preparación de lore.'
                );
            }

            console.log(`📦 Película pertenece a: ${movieDetails.belongs_to_collection.name}`);

            // Obtener la colección completa
            const collection = await TMDBService.getCollection(
                movieDetails.belongs_to_collection.id
            );

            // Validar que la colección tenga películas
            if (!collection || !collection.parts) {
                throw new Error(
                    'No se pudo obtener la información de la colección.'
                );
            }

            // Filtrar películas previas (solo las anteriores cronológicamente)
            const previousMovies = collection.parts
                .filter(movie =>
                    new Date(movie.release_date) < new Date(movieDetails.release_date)
                )
                .sort((a, b) =>
                    new Date(a.release_date).getTime() - new Date(b.release_date).getTime()
                );

            if (previousMovies.length === 0) {
                throw new Error(
                    'No hay películas previas para analizar. Esta es la primera de la saga.'
                );
            }

            console.log(
                `📚 Encontradas ${previousMovies.length} película(s) previa(s):`,
                previousMovies.map(m => `${m.title} (${new Date(m.release_date).getFullYear()})`)
            );

            // ============================================
            // STAGE 3: Generar con Qwen AI (con autenticación)
            // ============================================
            setStage(3);
            await sleep(1000); // Dar tiempo para que el usuario vea el mensaje

            console.log('🤖 Enviando solicitud a Qwen AI...');

            // Pass the access token for authentication
            const aiAnalysis: LoreGenerationResponse = await QwenService.generateLoreAnalysis(
                movieDetails,
                previousMovies,
                session.access_token
            );

            console.log('✅ Análisis generado exitosamente:', {
                status: aiAnalysis.status,
                movies_analyzed: aiAnalysis.required_movies.length,
                preparation_time: aiAnalysis.preparation_time,
                from_cache: aiAnalysis.from_cache,
                user_analysis_id: aiAnalysis.user_analysis_id
            });

            // ============================================
            // STAGE 4: Finalizar y guardar
            // ============================================
            setStage(4);
            await sleep(600);

            setAnalysis(aiAnalysis);
            setFromCache(aiAnalysis.from_cache || false);

            // Guardar en cache local (válido por 7 días)
            saveCachedAnalysis(movieId, aiAnalysis);

            console.log('💾 Análisis guardado en cache local');

            // Refresh usage data to update UI
            await refreshUsage();

        } catch (err) {
            console.error('❌ Error generating lore:', err);

            // Manejo de errores específicos
            let errorMessage = 'Error desconocido al generar el análisis';

            if (err instanceof Error) {
                errorMessage = err.message;
            }

            // Errores específicos de la API
            if (errorMessage.includes('Qwen API Error')) {
                errorMessage = 'Error al comunicarse con el servicio de IA. Por favor, intenta de nuevo.';
            } else if (errorMessage.includes('Invalid analysis structure')) {
                errorMessage = 'La IA generó una respuesta inválida. Por favor, intenta de nuevo.';
            } else if (errorMessage.includes('fetch')) {
                errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
            }

            setError(errorMessage);

        } finally {
            setLoading(false);
            setStage(0);
        }
    }, [movieId, session, canGenerateAnalysis, getAnalysisLimitStatus, refreshUsage]);

    /**
     * Carga un análisis guardado previamente (desde la base de datos)
     * Se usa cuando el usuario hace click en "Mostrar Lore"
     */
    const loadSavedAnalysis = useCallback((savedAnalysis: LoreAnalysis): void => {
        console.log('📂 Cargando análisis guardado:', savedAnalysis);

        setAnalysis(savedAnalysis);
        setLoading(false);
        setError(null);
        setStage(stages.length); // Set to final stage
        setFromCache(true); // Mark as from cache/saved

        console.log('✅ Análisis cargado exitosamente');
    }, [stages.length]);

    /**
     * Limpia el análisis actual
     */
    const clearAnalysis = useCallback((): void => {
        setAnalysis(null);
        setError(null);
        setStage(0);
        setFromCache(false);
    }, []);

    /**
     * Simula progreso de stages para datos cacheados/mock
     */


    return {
        generateLore,
        loading,
        stage,
        stages,
        analysis,
        error,
        clearAnalysis,
        loadSavedAnalysis, // Export the new method
        fromCache
    };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Sleep helper para delays
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Tiempo de vida del cache (7 días)
 */
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;



/**
 * Guarda análisis en cache local
 */
function saveCachedAnalysis(movieId: number, analysis: LoreAnalysis): void {
    try {
        const cacheData = {
            data: analysis,
            timestamp: Date.now()
        };

        localStorage.setItem(
            `cineprep_lore_${movieId}`,
            JSON.stringify(cacheData)
        );

    } catch (error) {
        console.error('Error saving to cache:', error);

        // Si falla por quota exceeded, intentar limpiar cache antiguo
        if (error instanceof Error && error.name === 'QuotaExceededError') {
            console.warn('⚠️ LocalStorage lleno, limpiando cache antiguo...');
            clearOldCache();

            // Intentar guardar nuevamente
            try {
                localStorage.setItem(
                    `cineprep_lore_${movieId}`,
                    JSON.stringify({ data: analysis, timestamp: Date.now() })
                );
            } catch (retryError) {
                console.error('No se pudo guardar en cache después de limpiar:', retryError);
            }
        }
    }
}

/**
 * Limpia entradas de cache antiguas (más de 7 días)
 */
function clearOldCache(): void {
    const keys = Object.keys(localStorage);
    const cineprepKeys = keys.filter(key => key.startsWith('cineprep_lore_'));

    let removed = 0;

    cineprepKeys.forEach(key => {
        try {
            const cached = localStorage.getItem(key);
            if (!cached) return;

            const { timestamp } = JSON.parse(cached);
            const isExpired = Date.now() - timestamp > CACHE_TTL;

            if (isExpired) {
                localStorage.removeItem(key);
                removed++;
            }
        } catch (error) {
            // Si hay error parseando, eliminar la entrada
            localStorage.removeItem(key);
            removed++;
        }
    });

    console.log(`🗑️ Eliminadas ${removed} entradas de cache antiguas`);
}
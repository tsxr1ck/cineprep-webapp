// src/types/hooks.types.ts

import type { LoreAnalysis } from '@/types/app';
import type { LoadingStage } from '@/types/components';

/**
 * Return type del hook useLoreGenerator
 */
export interface UseLoreGeneratorReturn {
    /**
     * Función para iniciar la generación de lore
     */
    generateLore: () => Promise<void>;

    /**
     * Si está generando actualmente
     */
    loading: boolean;

    /**
     * Etapa actual de carga (0 = no iniciado)
     */
    stage: number;

    /**
     * Lista de todas las etapas
     */
    stages: LoadingStage[];

    /**
     * Análisis generado (null si aún no se ha generado)
     */
    analysis: LoreAnalysis | null;

    /**
     * Error si ocurrió alguno
     */
    error: string | null;

    /**
     * Limpiar el análisis actual
     */
    clearAnalysis: () => void;

    /**
     * Si el análisis viene del cache
     */
    fromCache: boolean;
}
// src/types/hooks.types.ts

import type { LoreAnalysis } from '@/types/app';
import type { LoadingStage } from '@/types/components';

/**
 * Return type del hook useLoreGenerator
 */
export interface UseLoreGeneratorReturn {
    generateLore: () => Promise<void>;
    loading: boolean;
    stage: number;
    stages: LoadingStage[];
    analysis: LoreAnalysis | null;
    error: string | null;
    clearAnalysis: () => void;
    loadSavedAnalysis: (savedAnalysis: LoreAnalysis) => void; // NEW METHOD
    fromCache: boolean;
}
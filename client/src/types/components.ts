// src/types/components.types.ts

import type { LoreAnalysis, AudioInfo } from '@/types/app';
import type { Movie, MovieDetails } from 'tmdb-ts';

/**
 * Props para MovieCard
 */
export interface MovieCardProps {
    movie: Movie;
    onClick: (movie: Movie) => void;
}

/**
 * Props para MovieHero
 */
export interface MovieHeroProps {
    movie: MovieDetails;
    onAnalyze: () => void;
    hasCollection: boolean;
}

/**
 * Props para LoreAnalysis
 */
export interface LoreAnalysisProps {
    analysis: LoreAnalysis;
}

/**
 * Props para AudioPlayer
 */
export interface AudioPlayerProps {
    audio: AudioInfo;
}

/**
 * Props para LoadingStates
 */
export interface LoadingStatesProps {
    stage: number;
    stages: LoadingStage[];
}

/**
 * Etapa de carga
 */
export interface LoadingStage {
    id: number;
    message: string;
}

/**
 * Props para Navbar
 */
export interface NavbarProps {
    onSearch: (query: string) => void;
}

/**
 * Props para Dashboard
 */
export interface DashboardProps {
    onMovieClick: (movie: Movie) => void;
}

/**
 * Props para MovieDetail
 */
export interface MovieDetailProps {
    movieId: number;
    onBack: () => void;
}
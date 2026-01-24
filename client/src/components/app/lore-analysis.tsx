import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    Sparkles,
    Shield,
    ChevronRight,
    Clock,
    Star,
    AlertCircle,
    Target,
    BookOpen,
    Lightbulb,
    Play,
    ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TMDBService } from '@/services/TMDB-service';
import AudioPlayer from '@/components/app/audio-player';
import type { LoreAnalysis } from '@/types/lore';
import { AudioGenerationButton } from './audio-gen-button';

interface LoreAnalysisProps {
    analysis: LoreAnalysis;
    collectionName: string | undefined;
}
export default function LoreAnalysis({ analysis, collectionName }: LoreAnalysisProps) {
    const [expandedMovie, setExpandedMovie] = useState<number | null>(null);
    const [completedMovies, setCompletedMovies] = useState<number[]>([]);
    const [expandedNarratives, setExpandedNarratives] = useState<number[]>([]);

    if (!analysis) return null;

    // Calculate progress
    const totalMovies = analysis.required_movies.length;
    const completed = completedMovies.length;
    const progress = (completed / totalMovies) * 100;

    // Calculate total watch time
    const totalMinutes = analysis.required_movies.reduce((acc, movie) => {
        const match = movie.watch_time?.match(/(\d+)\s*min/);
        return acc + (match ? parseInt(match[1]) : 0);
    }, 0);
    const remainingMinutes = analysis.required_movies
        .filter((_, idx) => !completedMovies.includes(idx))
        .reduce((acc, movie) => {
            const match = movie.watch_time?.match(/(\d+)\s*min/);
            return acc + (match ? parseInt(match[1]) : 0);
        }, 0);

    const toggleComplete = (index: number) => {
        if (completedMovies.includes(index)) {
            setCompletedMovies(completedMovies.filter(i => i !== index));
        } else {
            setCompletedMovies([...completedMovies, index]);
        }
    };

    const toggleNarrative = (index: number) => {
        if (expandedNarratives.includes(index)) {
            setExpandedNarratives(expandedNarratives.filter(i => i !== index));
        } else {
            setExpandedNarratives([...expandedNarratives, index]);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-8 md:py-12"
        >
            {/* Header with badges */}
            <div className="mb-8">
                <div className="flex flex-wrap gap-3 mb-4">
                    <span className="px-4 py-1.5 text-xs font-medium rounded-full bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/30">
                        Análisis de Preparación
                    </span>
                    {analysis.spoiler_free_guarantee?.enabled && (
                        <span className="px-4 py-1.5 text-xs font-medium rounded-full bg-[#4ECDC4]/20 text-[#4ECDC4] border border-[#4ECDC4]/30">
                            Garantía Sin Spoilers
                        </span>
                    )}
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
                    Preparándote para: {collectionName || 'Esta Película'}
                </h1>

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-4 text-[#A0A0AB]">
                    <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {analysis.preparation_time}
                    </span>
                    <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        {totalMovies} película{totalMovies > 1 ? 's' : ''} previa{totalMovies > 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* Progress Section */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-[#1C1C2E] to-[#14141F] border border-white/10 rounded-2xl p-6 mb-8"
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-[#FF6B35]" />
                        Tu Progreso de Preparación
                    </h2>
                    <span className="text-3xl font-bold text-[#FF6B35]">
                        {Math.round(progress)}%
                    </span>
                </div>

                <Progress value={progress} className="h-3 mb-6 bg-white/5" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Completadas */}
                    <div className="bg-[#0A0A0F]/50 rounded-xl p-4 border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#4ECDC4]/20 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-[#4ECDC4]" />
                            </div>
                            <div>
                                <p className="text-[#6B6B78] text-sm">Completadas</p>
                                <p className="text-white text-xl font-bold">
                                    {completed}/{totalMovies}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tiempo Restante */}
                    <div className="bg-[#0A0A0F]/50 rounded-xl p-4 border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#FFD166]/20 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-[#FFD166]" />
                            </div>
                            <div>
                                <p className="text-[#6B6B78] text-sm">Tiempo Restante</p>
                                <p className="text-white text-xl font-bold">
                                    {Math.floor(remainingMinutes / 60)}h {remainingMinutes % 60}min
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Guardados */}
                    <div className="bg-[#0A0A0F]/50 rounded-xl p-4 border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#FF6B35]/20 flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-[#FF6B35]" />
                            </div>
                            <div>
                                <p className="text-[#6B6B78] text-sm">Guardados</p>
                                <p className="text-white text-xl font-bold">{completed}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Required Movies */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-white">
                            Películas Previas Requeridas
                        </h2>
                        <span className="flex items-center gap-2 text-sm text-[#4ECDC4] font-medium">
                            <Shield className="w-4 h-4" />
                            Sin Spoilers
                        </span>
                    </div>

                    {analysis.required_movies.map((movie, index) => {
                        const isCompleted = completedMovies.includes(index);
                        const isExpanded = expandedMovie === index;

                        return (
                            <motion.div
                                key={movie.tmdb_id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`bg-[#1C1C2E]/80 backdrop-blur-xl border rounded-2xl overflow-hidden transition-all ${isCompleted ? 'border-[#4ECDC4]/30' : 'border-white/10'
                                    }`}
                            >
                                {/* Movie Card Header */}
                                <div className="p-5">
                                    <div className="flex gap-4">
                                        {/* Poster */}
                                        <div className="relative flex-shrink-0">
                                            <img
                                                src={TMDBService.getImageUrl(movie.poster_path, 'w185') || ''}
                                                alt={movie.title}
                                                className={`w-24 h-36 object-cover rounded-lg shadow-lg transition-opacity ${isCompleted ? 'opacity-50' : ''
                                                    }`}
                                            />
                                            {isCompleted && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-12 h-12 rounded-full bg-[#4ECDC4] flex items-center justify-center">
                                                        <CheckCircle2 className="w-7 h-7 text-white" />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-[#FF6B35] flex items-center justify-center text-white text-sm font-bold">
                                                {index + 1}
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            {/* Title and metadata */}
                                            <h3 className="text-xl font-bold text-white mb-2">
                                                {movie.title}
                                            </h3>

                                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${movie.priority === 'essential'
                                                    ? 'bg-[#FF6B35] text-white'
                                                    : 'bg-[#4ECDC4]/20 text-[#4ECDC4] border border-[#4ECDC4]/30'
                                                    }`}>
                                                    {movie.priority === 'essential' ? 'Épico' : 'Recomendada'}
                                                </span>
                                                {movie.watch_time && (
                                                    <span className="flex items-center gap-1 text-[#6B6B78] text-xs">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {movie.watch_time}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1 text-[#6B6B78] text-xs">
                                                    <Star className="w-3.5 h-3.5 fill-[#FFD166] text-[#FFD166]" />
                                                    8.0
                                                </span>
                                            </div>

                                            {/* Brief narrative */}
                                            <div className="mb-4">
                                                <p className={`text-[#A0A0AB] text-sm leading-relaxed ${expandedNarratives.includes(index) ? '' : 'line-clamp-2'}`}>
                                                    {movie.summary.narrative}
                                                </p>
                                                {movie.summary.narrative.length > 100 && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleNarrative(index);
                                                        }}
                                                        className="text-[#FF6B35] text-xs font-medium mt-1 hover:underline focus:outline-none"
                                                    >
                                                        {expandedNarratives.includes(index) ? 'Mostrar menos' : 'Mostrar más'}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Action buttons */}
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => setExpandedMovie(isExpanded ? null : index)}
                                                    className="bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white hover:shadow-lg text-xs"
                                                >
                                                    <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                                                    {isExpanded ? 'Ocultar' : 'Leer Resumen'}
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => toggleComplete(index)}
                                                    className={`text-xs ${isCompleted
                                                        ? 'bg-[#4ECDC4]/20 text-[#4ECDC4] border-[#4ECDC4]/30'
                                                        : 'border-white/20 text-[#A0A0AB] hover:text-white'
                                                        }`}
                                                >
                                                    {isCompleted ? (
                                                        <>
                                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                                            Completada
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                                            Marcar vista
                                                        </>
                                                    )}
                                                </Button>

                                                <AudioGenerationButton
                                                    narrative={movie.summary.narrative}
                                                    movieTitle={movie.title}
                                                    movieId={movie.tmdb_id}
                                                />

                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="border-t border-white/5"
                                        >
                                            <div className="p-5 space-y-6">
                                                {/* Datos Clave */}
                                                {movie.summary.key_facts && movie.summary.key_facts.length > 0 && (
                                                    <div>
                                                        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                            <Target className="w-5 h-5 text-[#FF6B35]" />
                                                            Datos Clave para Recordar
                                                        </h4>
                                                        <div className="space-y-3">
                                                            {movie.summary.key_facts.map((fact, idx) => (
                                                                <motion.div
                                                                    key={fact.id}
                                                                    initial={{ opacity: 0, x: -10 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: idx * 0.05 }}
                                                                    className={`flex gap-3 p-4 rounded-xl transition-all hover:scale-[1.02] ${fact.importance === 'critical'
                                                                        ? 'bg-[#FF6B35]/10 border border-[#FF6B35]/30'
                                                                        : 'bg-white/5 border border-white/5'
                                                                        }`}
                                                                >
                                                                    <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm ${fact.importance === 'critical'
                                                                        ? 'bg-[#FF6B35] text-white'
                                                                        : 'bg-[#4ECDC4]/20 text-[#4ECDC4]'
                                                                        }`}>
                                                                        {idx + 1}
                                                                    </div>
                                                                    <p className="text-[#A0A0AB] text-sm leading-relaxed flex-1">
                                                                        {fact.text}
                                                                    </p>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Momentos Emocionales */}
                                                {movie.summary.emotional_beats && movie.summary.emotional_beats.length > 0 && (
                                                    <div>
                                                        <h4 className="text-lg font-bold text-white mb-4">
                                                            💫 Momentos Emocionales Clave
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {movie.summary.emotional_beats.map((beat, idx) => (
                                                                <motion.div
                                                                    key={idx}
                                                                    initial={{ opacity: 0, x: -10 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: idx * 0.05 }}
                                                                    className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                                                                >
                                                                    <span className="text-lg">{beat.split(' ')[0]}</span>
                                                                    <p className="text-[#A0A0AB] text-sm flex-1">
                                                                        {beat.substring(beat.indexOf(' ') + 1)}
                                                                    </p>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Audio Player */}
                                                {movie.audio && movie.audio.status === 'ready' && (
                                                    <AudioPlayer audio={movie.audio} movieTitle={movie.title} />
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Right Column - Consejos & Tips */}
                <div className="space-y-6">
                    {/* Consejos de Preparación */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-[#1C1C2E]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sticky top-24"
                    >
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-[#FFD166]" />
                            Consejos de Preparación
                        </h3>

                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#FF6B35]/20 flex items-center justify-center flex-shrink-0">
                                    <Lightbulb className="w-4 h-4 text-[#FF6B35]" />
                                </div>
                                <div>
                                    <p className="text-[#A0A0AB] text-sm leading-relaxed">
                                        Escucha los resúmenes de audio mientras realizas otras actividades para optimizar tu tiempo de preparación.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#4ECDC4]/20 flex items-center justify-center flex-shrink-0">
                                    <BookOpen className="w-4 h-4 text-[#4ECDC4]" />
                                </div>
                                <div>
                                    <p className="text-[#A0A0AB] text-sm leading-relaxed">
                                        Guarda las secciones de datos clave para repasarlas justo antes de entrar al cine.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#FFD166]/20 flex items-center justify-center flex-shrink-0">
                                    <Target className="w-4 h-4 text-[#FFD166]" />
                                </div>
                                <div>
                                    <p className="text-[#A0A0AB] text-sm leading-relaxed">
                                        Marca como completadas las películas que ya hayas visto para enfocarte solo en lo que necesitas.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#FF6B35]/20 flex items-center justify-center flex-shrink-0">
                                    <Star className="w-4 h-4 text-[#FF6B35]" />
                                </div>
                                <div>
                                    <p className="text-[#A0A0AB] text-sm leading-relaxed">
                                        Los datos marcados como "críticos" son esenciales para entender la nueva película.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <Button
                            className="w-full mt-6 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white hover:shadow-lg"
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Compartir Preparación
                        </Button>
                    </motion.div>
                </div>
            </div>

            {/* Spoiler Free Message */}
            {analysis.spoiler_free_guarantee?.message && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 p-4 rounded-xl bg-[#4ECDC4]/10 border border-[#4ECDC4]/20 text-center"
                >
                    <p className="text-[#4ECDC4] text-sm">
                        🎭 {analysis.spoiler_free_guarantee.message}
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
}
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    Sparkles,
    Shield,
    Clock,
    Star,
    Target,
    BookOpen,
    Lightbulb,
    Play,
    Heart,
    Zap,
    ChevronDown,
    Share2,
    Volume2,
    Eye,
    Film
} from 'lucide-react';
import { TMDBService } from '@/services/TMDB-service';
import AudioPlayer from '@/components/app/audio-player';
import type { LoreAnalysis } from '@/types/lore';
import { AudioGenerationButton } from './audio-gen-button';

interface LoreAnalysisProps {
    analysis: LoreAnalysis;
    collectionName: string | undefined;
    analysisId?: string;
    isFavorite?: boolean;
    onToggleFavorite?: () => void;
}

export default function LoreAnalysis({ analysis, collectionName, analysisId, isFavorite, onToggleFavorite }: LoreAnalysisProps) {
    const [expandedMovie, setExpandedMovie] = useState<number | null>(0);
    const [completedMovies, setCompletedMovies] = useState<number[]>([]);
    const [expandedNarratives, setExpandedNarratives] = useState<number[]>([]);
    const [activeTab, setActiveTab] = useState<'facts' | 'emotions'>('facts');

    if (!analysis) return null;

    const totalMovies = analysis.required_movies.length;
    const completed = completedMovies.length;
    const progress = (completed / totalMovies) * 100;

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

    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="min-h-screen">
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#FF6B35]/5 via-transparent to-transparent" />
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FF6B35]/10 rounded-full blur-3xl" />
                <div className="absolute top-20 right-1/4 w-80 h-80 bg-[#4ECDC4]/10 rounded-full blur-3xl" />

                <div className="container mx-auto px-4 py-8 relative">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex flex-wrap gap-3 mb-6">
                            <motion.span
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="px-4 py-2 text-xs font-semibold rounded-full bg-gradient-to-r from-[#FF6B35]/20 to-[#F7931E]/20 text-primary border border-[#FF6B35]/30 backdrop-blur-sm flex items-center gap-2"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                Análisis de Preparación
                            </motion.span>
                            {analysis.spoiler_free_guarantee?.enabled && (
                                <motion.span
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="px-4 py-2 text-xs font-semibold rounded-full bg-gradient-to-r from-[#4ECDC4]/20 to-[#4ECDC4]/10 text-teal-500 border border-[#4ECDC4]/30 backdrop-blur-sm flex items-center gap-2"
                                >
                                    <Shield className="w-3.5 h-3.5" />
                                    Garantía Sin Spoilers
                                </motion.span>
                            )}
                            {analysisId && (
                                <motion.button
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.25 }}
                                    onClick={onToggleFavorite}
                                    className={`px-4 py-2 text-xs font-semibold rounded-full border backdrop-blur-sm flex items-center gap-2 transition-all ${isFavorite
                                        ? 'bg-[#FF6B35]/20 text-[#FF6B35] border-[#FF6B35]/50'
                                        : 'bg-muted/50 text-muted-foreground border-border hover:border-[#FF6B35]/50 hover:text-[#FF6B35]'
                                        }`}
                                >
                                    <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-[#FF6B35]' : ''}`} />
                                    {isFavorite ? 'En favoritos' : 'Añadir a favoritos'}
                                </motion.button>
                            )}
                        </div>

                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
                        >
                            <span className="text-foreground">Preparándote para: </span>
                            <span className="bg-gradient-to-r from-[#FF6B35] via-[#F7931E] to-[#FFD166] bg-clip-text text-transparent">
                                {collectionName || 'Esta Película'}
                            </span>
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.25 }}
                            className="flex flex-wrap items-center gap-6 text-muted-foreground"
                        >
                            <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                                <Clock className="w-4 h-4 text-yellow-500" />
                                {analysis.preparation_time}
                            </span>
                            <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                                <Film className="w-4 h-4 text-teal-500" />
                                {totalMovies} película{totalMovies > 1 ? 's' : ''} previa{totalMovies > 1 ? 's' : ''}
                            </span>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="relative bg-card/95 backdrop-blur-xl border border-border rounded-3xl p-8 mb-10 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B35]/5 via-transparent to-[#4ECDC4]/5" />
                        <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF6B35]/10 rounded-full blur-3xl" />

                        <div className="relative flex flex-col lg:flex-row items-center gap-8">
                            <div className="relative flex-shrink-0">
                                <svg className="w-32 h-32 transform -rotate-90">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="45"
                                        stroke="rgba(255,255,255,0.1)"
                                        strokeWidth="8"
                                        fill="none"
                                    />
                                    <motion.circle
                                        cx="64"
                                        cy="64"
                                        r="45"
                                        stroke="url(#progressGradient)"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeDasharray={circumference}
                                        initial={{ strokeDashoffset: circumference }}
                                        animate={{ strokeDashoffset }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                    />
                                    <defs>
                                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#FF6B35" />
                                            <stop offset="100%" stopColor="#FFD166" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <motion.span
                                            key={progress}
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="text-3xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFD166] bg-clip-text text-transparent"
                                        >
                                            {Math.round(progress)}%
                                        </motion.span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                                <motion.div
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    className="group bg-gradient-to-br from-[#4ECDC4]/20 to-[#4ECDC4]/5 rounded-2xl p-5 border border-[#4ECDC4]/20 cursor-pointer transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-[#4ECDC4]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <CheckCircle2 className="w-6 h-6 text-teal-500" />
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-sm mb-0.5">Completadas</p>
                                            <p className="text-foreground text-2xl font-bold">
                                                {completed}<span className="text-muted-foreground text-lg">/{totalMovies}</span>
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    className="group bg-gradient-to-br from-[#FFD166]/20 to-[#FFD166]/5 rounded-2xl p-5 border border-[#FFD166]/20 cursor-pointer transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-[#FFD166]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Clock className="w-6 h-6 text-yellow-500" />
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-sm mb-0.5">Tiempo Restante</p>
                                            <p className="text-foreground text-2xl font-bold">
                                                {Math.floor(remainingMinutes / 60)}h <span className="text-lg">{remainingMinutes % 60}min</span>
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    className="group bg-gradient-to-br from-[#FF6B35]/20 to-[#FF6B35]/5 rounded-2xl p-5 border border-[#FF6B35]/20 cursor-pointer transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-[#FF6B35]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <BookOpen className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-sm mb-0.5">Datos Guardados</p>
                                            <p className="text-foreground text-2xl font-bold">{completed}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                        <div className="xl:col-span-3 space-y-6">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#F7931E] flex items-center justify-center">
                                        <Play className="w-5 h-5 text-foreground" />
                                    </div>
                                    Películas Previas
                                </h2>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#4ECDC4]/10 border border-[#4ECDC4]/30">
                                    <Shield className="w-4 h-4 text-teal-500" />
                                    <span className="text-sm font-medium text-teal-500">Sin Spoilers</span>
                                </div>
                            </div>

                            {analysis.required_movies.map((movie, index) => {
                                const isCompleted = completedMovies.includes(index);
                                const isExpanded = expandedMovie === index;
                                const currentMovie = movie;

                                return (
                                    <motion.div
                                        key={movie.tmdb_id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        layout
                                        className={`group relative bg-card/95 backdrop-blur-xl rounded-3xl overflow-hidden transition-all duration-500 ${isExpanded ? 'ring-2 ring-primary/50 shadow-2xl shadow-primary/10' : 'border border-border hover:border-border'
                                            } ${isCompleted ? 'ring-2 ring-teal-500/50' : ''}`}
                                    >
                                        {isCompleted && (
                                            <div className="absolute top-4 right-4 z-20">
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="w-10 h-10 rounded-full bg-[#4ECDC4] flex items-center justify-center shadow-lg shadow-teal-500/30"
                                                >
                                                    <CheckCircle2 className="w-5 h-5 text-foreground" />
                                                </motion.div>
                                            </div>
                                        )}

                                        <div className="flex flex-col md:flex-row">
                                            <div className="relative md:w-48 lg:w-56 flex-shrink-0">
                                                <img
                                                    src={TMDBService.getImageUrl(movie.poster_path, 'w342') || ''}
                                                    alt={movie.title}
                                                    className={`w-full h-64 md:h-full object-cover transition-all duration-500 ${isCompleted ? 'opacity-60 grayscale-[30%]' : ''}`}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-card" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent md:hidden" />

                                                <div className="absolute top-4 left-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#F7931E] flex items-center justify-center text-foreground font-bold text-lg shadow-lg">
                                                        {index + 1}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1 p-6">
                                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${movie.priority === 'essential'
                                                        ? 'bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-foreground shadow-lg shadow-primary/25'
                                                        : 'bg-[#4ECDC4]/20 text-teal-500 border border-[#4ECDC4]/30'
                                                        }`}>
                                                        {movie.priority === 'essential' ? 'ESENCIAL' : 'RECOMENDADA'}
                                                    </span>
                                                    {movie.watch_time && (
                                                        <span className="flex items-center gap-1.5 px-3 py-1 text-xs text-muted-foreground bg-muted/50 rounded-full">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {movie.watch_time}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1.5 px-3 py-1 text-xs bg-[#FFD166]/10 rounded-full">
                                                        <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                                                        <span className="text-yellow-500 font-semibold">8.0</span>
                                                    </span>
                                                </div>

                                                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                                                    {movie.title}
                                                </h3>

                                                <p className={`text-muted-foreground leading-relaxed mb-5 ${expandedNarratives.includes(index) ? '' : 'line-clamp-2'}`}>
                                                    {movie.summary.narrative}
                                                </p>
                                                {movie.summary.narrative.length > 150 && (
                                                    <button
                                                        onClick={() => toggleNarrative(index)}
                                                        className="text-primary text-sm font-medium hover:underline mb-4 flex items-center gap-1"
                                                    >
                                                        {expandedNarratives.includes(index) ? 'Ver menos' : 'Ver más'}
                                                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedNarratives.includes(index) ? 'rotate-180' : ''}`} />
                                                    </button>
                                                )}

                                                <div className="flex flex-wrap gap-3">
                                                    <motion.button
                                                        whileHover={{ scale: 1.03 }}
                                                        whileTap={{ scale: 0.97 }}
                                                        onClick={() => setExpandedMovie(isExpanded ? null : index)}
                                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${isExpanded
                                                            ? 'bg-muted text-foreground border border-border'
                                                            : 'bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40'
                                                            }`}
                                                    >
                                                        <BookOpen className="w-4 h-4" />
                                                        {isExpanded ? 'Ocultar Detalles' : 'Ver Detalles'}
                                                    </motion.button>

                                                    <motion.button
                                                        whileHover={{ scale: 1.03 }}
                                                        whileTap={{ scale: 0.97 }}
                                                        onClick={() => toggleComplete(index)}
                                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${isCompleted
                                                            ? 'bg-[#4ECDC4]/20 text-teal-500 border border-[#4ECDC4]/30'
                                                            : 'bg-muted/50 text-muted-foreground border border-border hover:border-white/30 hover:text-foreground'
                                                            }`}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        {isCompleted ? 'Vista' : 'Marcar como vista'}
                                                    </motion.button>

                                                    <AudioGenerationButton
                                                        narrative={movie.summary.narrative}
                                                        movieTitle={movie.title}
                                                        movieId={movie.tmdb_id}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.4, ease: "easeInOut" }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="border-t border-border bg-gradient-to-b from-white/5 to-transparent">
                                                        <div className="p-6">
                                                            <div className="flex gap-2 mb-6">
                                                                <button
                                                                    onClick={() => setActiveTab('facts')}
                                                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${activeTab === 'facts'
                                                                        ? 'bg-[#FF6B35] text-foreground shadow-lg shadow-primary/25'
                                                                        : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                                                                        }`}
                                                                >
                                                                    <Target className="w-4 h-4" />
                                                                    Datos Clave
                                                                </button>
                                                                <button
                                                                    onClick={() => setActiveTab('emotions')}
                                                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${activeTab === 'emotions'
                                                                        ? 'bg-[#FF6B35] text-foreground shadow-lg shadow-primary/25'
                                                                        : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                                                                        }`}
                                                                >
                                                                    <Heart className="w-4 h-4" />
                                                                    Momentos Clave
                                                                </button>
                                                            </div>

                                                            <AnimatePresence mode="wait">
                                                                {activeTab === 'facts' && currentMovie.summary.key_facts && (
                                                                    <motion.div
                                                                        key="facts"
                                                                        initial={{ opacity: 0, x: -10 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        exit={{ opacity: 0, x: 10 }}
                                                                        className="space-y-3"
                                                                    >
                                                                        {currentMovie.summary.key_facts.map((fact, idx) => (
                                                                            <motion.div
                                                                                key={fact.id}
                                                                                initial={{ opacity: 0, y: 10 }}
                                                                                animate={{ opacity: 1, y: 0 }}
                                                                                transition={{ delay: idx * 0.05 }}
                                                                                className={`group/fact flex gap-4 p-4 rounded-2xl transition-all hover:scale-[1.01] cursor-default ${fact.importance === 'critical'
                                                                                    ? 'bg-gradient-to-r from-[#FF6B35]/15 to-[#FF6B35]/5 border border-[#FF6B35]/30'
                                                                                    : 'bg-muted/50 border border-border hover:border-border'
                                                                                    }`}
                                                                            >
                                                                                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all group-hover/fact:scale-110 ${fact.importance === 'critical'
                                                                                    ? 'bg-gradient-to-br from-[#FF6B35] to-[#F7931E] text-foreground shadow-lg shadow-primary/25'
                                                                                    : 'bg-[#4ECDC4]/20 text-teal-500'
                                                                                    }`}>
                                                                                    {fact.importance === 'critical' ? <Zap className="w-5 h-5" /> : idx + 1}
                                                                                </div>
                                                                                <div className="flex-1">
                                                                                    {fact.importance === 'critical' && (
                                                                                        <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-1 block">
                                                                                            Crítico
                                                                                        </span>
                                                                                    )}
                                                                                    <p className="text-foreground leading-relaxed">
                                                                                        {fact.text}
                                                                                    </p>
                                                                                </div>
                                                                            </motion.div>
                                                                        ))}
                                                                    </motion.div>
                                                                )}

                                                                {activeTab === 'emotions' && currentMovie.summary.emotional_beats && (
                                                                    <motion.div
                                                                        key="emotions"
                                                                        initial={{ opacity: 0, x: -10 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        exit={{ opacity: 0, x: 10 }}
                                                                        className="grid grid-cols-1 md:grid-cols-2 gap-3"
                                                                    >
                                                                        {currentMovie.summary.emotional_beats.map((beat, idx) => {
                                                                            const emoji = beat.split(' ')[0];
                                                                            const text = beat.substring(beat.indexOf(' ') + 1);
                                                                            return (
                                                                                <motion.div
                                                                                    key={idx}
                                                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                                    transition={{ delay: idx * 0.05 }}
                                                                                    className="group/beat flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-muted/50 to-transparent border border-border hover:border-yellow-500/30 hover:bg-yellow-500/5 transition-all cursor-default"
                                                                                >
                                                                                    <span className="text-2xl group-hover/beat:scale-125 transition-transform">{emoji}</span>
                                                                                    <p className="text-muted-foreground text-sm leading-relaxed group-hover/beat:text-foreground transition-colors">
                                                                                        {text}
                                                                                    </p>
                                                                                </motion.div>
                                                                            );
                                                                        })}
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>

                                                            {movie.audio && movie.audio.status === 'ready' && (
                                                                <div className="mt-6 pt-6 border-t border-border">
                                                                    <AudioPlayer audio={movie.audio} movieTitle={movie.title} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <div className="xl:col-span-1">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="sticky top-24 space-y-6"
                            >
                                <div className="bg-card/95 backdrop-blur-xl border border-border rounded-3xl p-6 overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD166]/10 rounded-full blur-3xl" />

                                    <h3 className="text-xl font-bold text-foreground mb-5 flex items-center gap-3 relative">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD166] to-[#FF6B35] flex items-center justify-center">
                                            <Lightbulb className="w-5 h-5 text-foreground" />
                                        </div>
                                        Tips de Preparación
                                    </h3>

                                    <div className="space-y-4 relative">
                                        <motion.div
                                            whileHover={{ x: 4 }}
                                            className="flex gap-3 p-4 rounded-2xl bg-muted/50 border border-white/5 hover:border-[#FF6B35]/30 transition-all cursor-default"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/20 flex items-center justify-center flex-shrink-0">
                                                <Volume2 className="w-5 h-5 text-primary" />
                                            </div>
                                            <p className="text-muted-foreground text-sm leading-relaxed">
                                                Escucha los resúmenes de audio mientras realizas otras actividades.
                                            </p>
                                        </motion.div>

                                        <motion.div
                                            whileHover={{ x: 4 }}
                                            className="flex gap-3 p-4 rounded-2xl bg-muted/50 border border-white/5 hover:border-[#4ECDC4]/30 transition-all cursor-default"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-[#4ECDC4]/20 flex items-center justify-center flex-shrink-0">
                                                <BookOpen className="w-5 h-5 text-teal-500" />
                                            </div>
                                            <p className="text-muted-foreground text-sm leading-relaxed">
                                                Guarda los datos clave para repasarlos antes de ir al cine.
                                            </p>
                                        </motion.div>

                                        <motion.div
                                            whileHover={{ x: 4 }}
                                            className="flex gap-3 p-4 rounded-2xl bg-muted/50 border border-white/5 hover:border-[#FFD166]/30 transition-all cursor-default"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-[#FFD166]/20 flex items-center justify-center flex-shrink-0">
                                                <CheckCircle2 className="w-5 h-5 text-yellow-500" />
                                            </div>
                                            <p className="text-muted-foreground text-sm leading-relaxed">
                                                Marca las películas completadas para llevar tu progreso.
                                            </p>
                                        </motion.div>

                                        <motion.div
                                            whileHover={{ x: 4 }}
                                            className="flex gap-3 p-4 rounded-2xl bg-muted/50 border border-white/5 hover:border-[#FF6B35]/30 transition-all cursor-default"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/20 flex items-center justify-center flex-shrink-0">
                                                <Zap className="w-5 h-5 text-primary" />
                                            </div>
                                            <p className="text-muted-foreground text-sm leading-relaxed">
                                                Los datos "críticos" son esenciales para entender la nueva película.
                                            </p>
                                        </motion.div>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                                >
                                    <Share2 className="w-5 h-5" />
                                    Compartir Preparación
                                </motion.button>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

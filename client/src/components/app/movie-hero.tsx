// src/components/MovieHero.tsx

import { motion } from 'framer-motion';
import { Calendar, Clock, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TMDBService } from '@/services/TMDB-service';
import type { MovieDetails } from 'tmdb-ts';

interface MovieHeroProps {
    movie: MovieDetails;
    onAnalyze: () => void;
    hasCollection: boolean;
    isAnalyzing?: boolean;
}

export function MovieHero({
    movie,
    onAnalyze,
    hasCollection,
    isAnalyzing = false
}: MovieHeroProps) {
    const backdropUrl = TMDBService.getImageUrl(movie.backdrop_path, 'original');
    const releaseDate = new Date(movie.release_date).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="relative h-[70vh] overflow-hidden">
            {/* Backdrop Image */}
            <img
                src={backdropUrl || ''}
                alt={movie.title}
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-black/20" /> {/* General darkening */}

            {/* Content */}
            <div className="relative container mx-auto px-4 h-full flex items-end pb-12">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-2xl"
                >
                    {/* Genres */}
                    <div className="flex gap-2 mb-4 flex-wrap">
                        {movie.genres?.slice(0, 3).map(genre => (
                            <Badge
                                key={genre.id}
                                variant="outline"
                                className="border-border text-foreground bg-black/40 backdrop-blur-sm"
                            >
                                {genre.name}
                            </Badge>
                        ))}
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-4 tracking-tight drop-shadow-lg">
                        {movie.title}
                    </h1>

                    {/* Metadata */}
                    <div className="flex items-center gap-6 text-foreground mb-6 flex-wrap drop-shadow-md">
                        <span className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            {releaseDate}
                        </span>
                        {movie.runtime && (
                            <span className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                {movie.runtime} min
                            </span>
                        )}
                        <span className="flex items-center gap-2">
                            <Star className="w-5 h-5 fill-cinema-gold text-cinema-gold" />
                            {movie.vote_average?.toFixed(1)}
                        </span>
                    </div>

                    {/* Overview */}
                    <p className="text-lg text-muted-foreground mb-8 line-clamp-3 drop-shadow-md max-w-xl leading-relaxed">
                        {movie.overview}
                    </p>

                    {/* CTA Button - SOLO si tiene colección */}
                    {hasCollection ? (
                        <Button
                            size="lg"
                            className="bg-gradient-hero text-foreground font-semibold px-8 py-6 text-lg hover:shadow-lg transition-all disabled:opacity-50"
                            onClick={onAnalyze}
                            disabled={isAnalyzing}
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Generando...
                                </>
                            ) : (
                                <>
                                    🎬 Preparar Lore
                                </>
                            )}
                        </Button>
                    ) : (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="text-lg">ℹ️ Esta película no requiere conocimiento previo</span>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
import React from 'react';
import { motion } from 'framer-motion';
import MovieCard from '@/components/app/movie-card';
import type { Movie } from 'tmdb-ts';
import { LoadingStates } from './loading-states';

interface MovieGridProps {
    title?: string;
    subtitle?: string;
    movies: Movie[];
    onMovieClick: (movie: Movie) => void;
    isLoading: boolean;
    emptyMessage?: string;
}
export default function MovieGrid({
    title,
    subtitle,
    movies,
    onMovieClick,
    isLoading,
    emptyMessage = "No hay películas disponibles"
}: MovieGridProps) {
    return (
        <section className="py-8 md:py-12">
            {/* Section Header */}
            {title && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 md:mb-8"
                >
                    <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-[#6B6B78] mt-1">{subtitle}</p>
                    )}
                </motion.div>
            )}

            {/* Loading State */}
            {isLoading ? (
                <LoadingStates stage={1} stages={[]} />
            ) : movies && movies.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {movies.map((movie, index) => (
                        <MovieCard
                            key={movie.id}
                            movie={movie}
                            onClick={onMovieClick}
                            index={index}
                        />
                    ))}
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                >
                    <p className="text-[#6B6B78] text-lg">{emptyMessage}</p>
                </motion.div>
            )}
        </section>
    );
}
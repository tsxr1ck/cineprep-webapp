import { motion } from 'framer-motion';
import MovieCard from '@/components/app/movie-card';
import type { Movie } from 'tmdb-ts';
import { Loader2 } from 'lucide-react';

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
  emptyMessage = "No hay peliculas disponibles"
}: MovieGridProps) {
  return (
    <section className="py-4">
      {title && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[#6B6B78] mt-2">{subtitle}</p>
          )}
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B35]/20 to-[#F7931E]/20 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-[#FF6B35] animate-spin" />
            </div>
            <p className="text-[#6B6B78] text-sm">Cargando peliculas...</p>
          </motion.div>
        </div>
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
          className="text-center py-20"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎬</span>
          </div>
          <p className="text-[#6B6B78] text-lg">{emptyMessage}</p>
        </motion.div>
      )}
    </section>
  );
}

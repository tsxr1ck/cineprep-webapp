import { motion } from 'framer-motion';
import { Calendar, Star, Clapperboard, Play } from 'lucide-react';
import { TMDBService } from '@/services/TMDB-service';
import type { ExtendedMovie } from '@/types/tmdb';

interface MovieCardProps {
  movie: ExtendedMovie;
  onClick: (movie: ExtendedMovie) => void;
  index?: number;
}

export default function MovieCard({ movie, onClick, index = 0 }: MovieCardProps) {
  const posterUrl = TMDBService.getImageUrl(movie.poster_path, 'w500');
  const releaseDate = movie.release_date ? new Date(movie.release_date) : null;
  const releaseYear = releaseDate ? releaseDate.getFullYear() : null;
  const isUpcoming = releaseDate && releaseDate > new Date();
  const hasCollection = movie.belongs_to_collection;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.05,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ y: -8 }}
      className="cursor-pointer group"
      onClick={() => onClick(movie)}
    >
      <div className="relative overflow-hidden rounded-2xl bg-[#14141F] border border-white/5 group-hover:border-[#FF6B35]/30 transition-all duration-500 shadow-lg shadow-black/20 group-hover:shadow-2xl group-hover:shadow-[#FF6B35]/10">
        <div className="relative aspect-[2/3] overflow-hidden">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1C1C2E] to-[#14141F] flex items-center justify-center">
              <Clapperboard className="w-16 h-16 text-[#3B3B4F]" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <div className="w-14 h-14 rounded-full bg-[#FF6B35] flex items-center justify-center shadow-lg shadow-[#FF6B35]/30">
              <Play className="w-6 h-6 text-white ml-1" fill="white" />
            </div>
          </motion.div>

          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {isUpcoming && (
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 + 0.2 }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white shadow-lg shadow-[#FF6B35]/30"
              >
                Estreno
              </motion.span>
            )}
            {hasCollection && (
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 + 0.3 }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#4ECDC4] text-white shadow-lg shadow-[#4ECDC4]/30"
              >
                Saga
              </motion.span>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-base md:text-lg font-bold text-white line-clamp-2 mb-3 group-hover:text-[#FF6B35] transition-colors duration-300">
              {movie.title}
            </h3>
            <div className="flex items-center gap-3 text-sm">
              {releaseYear && (
                <span className="flex items-center gap-1.5 text-[#A0A0AB] bg-white/5 px-2 py-1 rounded-lg">
                  <Calendar className="w-3.5 h-3.5" />
                  {releaseYear}
                </span>
              )}
              {movie.vote_average > 0 && (
                <span className="flex items-center gap-1.5 text-[#FFD166] bg-[#FFD166]/10 px-2 py-1 rounded-lg font-medium">
                  <Star className="w-3.5 h-3.5 fill-[#FFD166]" />
                  {movie.vote_average.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      </div>
    </motion.div>
  );
}

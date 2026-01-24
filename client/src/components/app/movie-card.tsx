import { motion } from 'framer-motion';
import { Calendar, Star, Clapperboard } from 'lucide-react';
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={{
                scale: 1.03,
                boxShadow: "0 20px 60px rgba(255, 107, 53, 0.25)"
            }}
            className="cursor-pointer group"
            onClick={() => onClick(movie)}
        >
            <div className="relative overflow-hidden rounded-2xl bg-[#1C1C2E] border border-white/5">
                {/* Poster Image */}
                <div className="relative aspect-[2/3] overflow-hidden">
                    {posterUrl ? (
                        <img
                            src={posterUrl}
                            alt={movie.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full bg-[#1C1C2E] flex items-center justify-center">
                            <Clapperboard className="w-16 h-16 text-[#6B6B78]" />
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                    {/* Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                        {isUpcoming && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white shadow-lg"
                            >
                                🔥 Estreno
                            </motion.span>
                        )}
                        {hasCollection && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1 }}
                                className="px-2.5 py-1 text-xs font-semibold rounded-full bg-[#4ECDC4] text-white shadow-lg"
                            >
                                🎬 Secuela
                            </motion.span>
                        )}
                    </div>

                    {/* Bottom Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-base md:text-lg font-bold text-white line-clamp-2 mb-2 group-hover:text-[#FF6B35] transition-colors">
                            {movie.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-[#A0A0AB]">
                            {releaseYear && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {releaseYear}
                                </span>
                            )}
                            {movie.vote_average > 0 && (
                                <span className="flex items-center gap-1">
                                    <Star className="w-3.5 h-3.5 fill-[#FFD166] text-[#FFD166]" />
                                    {movie.vote_average.toFixed(1)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
import React, { useState, useEffect, useRef } from 'react';
import { Film, Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { TMDBService } from '@/services/TMDB-service';
import type { Movie } from 'tmdb-ts';

interface NavbarProps {
    onMovieSelect: (movie: Movie) => void;
    onHomeClick: () => void;
}

export default function Navbar({ onMovieSelect, onHomeClick }: NavbarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Movie[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<number | null>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && event.target instanceof Node && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (searchQuery.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        setIsSearching(true);
        debounceRef.current = setTimeout(async () => {
            const results = await TMDBService.searchMovies(searchQuery);
            setSearchResults(results.slice(0, 6));
            setShowResults(true);
            setIsSearching(false);
        }, 400);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [searchQuery]);

    const handleSelectMovie = (movie: Movie) => {
        onMovieSelect(movie);
        setSearchQuery('');
        setShowResults(false);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setShowResults(false);
    };

    return (
        <nav className="sticky top-0 z-50 bg-[#14141F]/90 backdrop-blur-xl border-b border-white/10">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
                {/* Logo */}
                <motion.div
                    className="flex items-center gap-2 cursor-pointer flex-shrink-0"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onHomeClick}
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#F7931E] flex items-center justify-center">
                        <Film className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl md:text-2xl font-bold text-white tracking-tight hidden sm:block">
                        CinePrep
                    </span>
                </motion.div>

                {/* Search Bar */}
                <div className="relative flex-1 max-w-xl" ref={searchRef}>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B6B78]" />
                    <Input
                        type="text"
                        value={searchQuery}
                        placeholder="Busca una película, ej: Dune 2..."
                        className="pl-10 pr-10 h-11 bg-[#1C1C2E] border-white/10 text-white placeholder:text-[#6B6B78] focus:border-[#FF6B35]/50 focus:ring-[#FF6B35]/20 rounded-xl"
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchResults.length > 0 && setShowResults(true)}
                    />
                    {isSearching && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FF6B35] animate-spin" />
                    )}
                    {searchQuery && !isSearching && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B78] hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}

                    {/* Search Results Dropdown */}
                    <AnimatePresence>
                        {showResults && searchResults.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-[#1C1C2E] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                            >
                                {searchResults.map((movie: Movie) => (
                                    <motion.div
                                        key={movie.id}
                                        whileHover={{ backgroundColor: 'rgba(255, 107, 53, 0.1)' }}
                                        className="flex items-center gap-3 p-3 cursor-pointer border-b border-white/5 last:border-0"
                                        onClick={() => handleSelectMovie(movie)}
                                    >
                                        <img
                                            src={TMDBService.getImageUrl(movie.poster_path, 'w92') || TMDBService.getPlaceholderPoster()}
                                            alt={movie.title}
                                            className="w-10 h-14 object-cover rounded"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium truncate">{movie.title}</p>
                                            <p className="text-[#6B6B78] text-sm">
                                                {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Próximamente'}
                                            </p>
                                        </div>
                                        {(movie.vote_average ?? 0) > 0 && (
                                            <span className="text-[#FFD166] text-sm font-medium">
                                                ⭐ {movie.vote_average?.toFixed(1)}
                                            </span>
                                        )}
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* User Avatar Placeholder */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFD166] to-[#FF6B35] flex-shrink-0 hidden sm:block" />
            </div>
        </nav>
    );
}
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Film, Calendar, Bell, ArrowRight, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TMDBService } from '@/services/TMDB-service';
import type { Movie } from 'tmdb-ts';

export default function ComingSoon() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        async function fetchMovies() {
            try {
                const [upcoming, nowPlaying] = await Promise.all([
                    TMDBService.getUpcomingMovies(),
                    TMDBService.getNowPlayingMovies()
                ]);
                const combined = [...upcoming.slice(0, 5), ...nowPlaying.slice(0, 5)]
                    .filter(m => m.backdrop_path)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 8);
                setMovies(combined);
            } catch (error) {
                console.error('Error fetching movies:', error);
            }
        }
        fetchMovies();
    }, []);

    useEffect(() => {
        if (movies.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % movies.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [movies.length]);

    const handleNotify = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setIsSubmitted(true);
            setTimeout(() => setIsSubmitted(false), 3000);
            setEmail('');
        }
    };

    const currentMovie = movies[currentIndex];
    const backdropUrl = currentMovie ? TMDBService.getImageUrl(currentMovie.backdrop_path, 'original') : null;

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#0A0A0F]">
            {/* Animated Background */}
            <AnimatePresence mode="wait">
                {backdropUrl && (
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="absolute inset-0"
                    >
                        <img
                            src={backdropUrl}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/60 via-[#0A0A0F]/80 to-[#0A0A0F]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0F]/90 via-transparent to-[#0A0A0F]/90" />

            {/* Animated Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        initial={{
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
                            opacity: 0.2
                        }}
                        animate={{
                            y: [null, Math.random() * window.innerHeight],
                            opacity: [0.2, 0.6, 0.2]
                        }}
                        transition={{
                            duration: 3 + Math.random() * 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: Math.random() * 2
                        }}
                    />
                ))}
            </div>

            {/* Content */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20">
                {/* Logo/Brand */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#F7931E] flex items-center justify-center shadow-2xl shadow-[#FF6B35]/40"
                        >
                            <Film className="w-8 h-8 text-white" />
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white">CinePrep</h1>
                    </div>
                </motion.div>

                {/* Main Headline */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="text-center mb-8 max-w-4xl"
                >
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="inline-flex items-center gap-2 mb-6 px-6 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20"
                    >
                        <Sparkles className="w-5 h-5 text-[#FFD166]" />
                        <span className="text-white font-medium">Algo increíble está por llegar</span>
                        <Sparkles className="w-5 h-5 text-[#FFD166]" />
                    </motion.div>

                    <h2 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-6">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#FF6B35] to-[#F7931E] animate-gradient">
                            Muy Pronto
                        </span>
                    </h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-xl md:text-2xl text-white/80 leading-relaxed max-w-2xl mx-auto"
                    >
                        La plataforma definitiva para nunca perderte el lore de tus películas favoritas.
                        <br />
                        <span className="text-[#4ECDC4] font-semibold">Prepárate para el cine como nunca antes.</span>
                    </motion.p>
                </motion.div>

                {/* Feature Highlights */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="flex flex-wrap justify-center gap-4 mb-12"
                >
                    {[
                        { icon: Zap, text: 'Resúmenes con IA', color: 'FF6B35' },
                        { icon: Film, text: 'Sin Spoilers', color: '4ECDC4' },
                        { icon: Star, text: 'Audio & Visual', color: 'FFD166' }
                    ].map((item, i) => (
                        <motion.div
                            key={item.text}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.2 + i * 0.1 }}
                            whileHover={{ scale: 1.1, y: -5 }}
                            className="group px-6 py-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/30 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={`w-5 h-5 text-[#${item.color}] group-hover:scale-110 transition-transform`} />
                                <span className="text-white/90 font-medium">{item.text}</span>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Email Signup */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 }}
                    className="w-full max-w-md mb-12"
                >
                    <AnimatePresence mode="wait">
                        {!isSubmitted ? (
                            <motion.form
                                key="form"
                                exit={{ opacity: 0, scale: 0.9 }}
                                onSubmit={handleNotify}
                                className="flex gap-3"
                            >
                                <div className="flex-1 relative">
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="tu@email.com"
                                        required
                                        className="h-14 pl-5 pr-5 bg-white/10 backdrop-blur-xl border-white/20 text-white placeholder:text-white/50 focus:border-[#FF6B35]/50 focus:ring-[#FF6B35]/20 rounded-2xl text-lg"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="h-14 px-8 bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white font-semibold text-base shadow-2xl shadow-[#FF6B35]/40 hover:shadow-[#FF6B35]/60 transition-all rounded-2xl"
                                >
                                    <Bell className="w-5 h-5 mr-2" />
                                    Notificarme
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </motion.form>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center justify-center gap-3 h-14 px-8 rounded-2xl bg-[#4ECDC4]/20 border border-[#4ECDC4]/40 backdrop-blur-xl"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200 }}
                                >
                                    <Sparkles className="w-6 h-6 text-[#4ECDC4]" />
                                </motion.div>
                                <span className="text-white font-semibold text-lg">
                                    ¡Listo! Te avisaremos cuando lancemos 🎬
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <p className="text-center text-white/50 text-sm mt-4">
                        Únete a la lista de espera y sé de los primeros en probarlo
                    </p>
                </motion.div>

                {/* Movie Info Ticker */}
                {currentMovie && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.6 }}
                        className="text-center"
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
                            >
                                <Calendar className="w-4 h-4 text-[#FF6B35]" />
                                <span className="text-white/80 text-sm">
                                    Ahora destacando:{' '}
                                    <span className="font-bold text-white">{currentMovie.title}</span>
                                </span>
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Progress Dots */}
                {movies.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.8 }}
                        className="flex gap-2 mt-8"
                    >
                        {movies.map((_, i) => (
                            <motion.div
                                key={i}
                                className={`h-1.5 rounded-full transition-all ${i === currentIndex
                                    ? 'w-8 bg-gradient-to-r from-[#FF6B35] to-[#F7931E]'
                                    : 'w-1.5 bg-white/20'
                                    }`}
                                animate={{
                                    opacity: i === currentIndex ? 1 : 0.4
                                }}
                            />
                        ))}
                    </motion.div>
                )}
            </div>

            {/* Bottom Gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A0A0F] to-transparent pointer-events-none" />
        </div>
    );
}
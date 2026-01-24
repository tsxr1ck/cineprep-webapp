import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Film, Clapperboard, TrendingUp, Loader2 } from 'lucide-react';
import Navbar from '@/components/app/navbar';
import { LoadingStates } from '@/components/app/loading-states';
import LoreAnalysis from '@/components/app/lore-analysis';
import { TMDBService } from '@/services/TMDB-service';
import { useLoreGenerator } from '@/hooks/useLoreGenerator';
import type { Movie } from 'tmdb-ts';
import { MovieHero } from './components/app/movie-hero';
import MovieGrid from './components/app/movie-grid';
import type { CollectionAnalysis, ExtendedMovieDetails } from './types/tmdb';

export default function Dashboard() {
  // State - with proper TypeScript types
  const [view, setView] = useState<'home' | 'detail' | 'lore'>('home');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [movieDetails, setMovieDetails] = useState<ExtendedMovieDetails | null>(null);

  // Hook for Lore Generation
  const {
    generateLore,
    loading: isGeneratingLore,
    stage: loreStage,
    stages: loadingStages,
    analysis: loreAnalysis,
    clearAnalysis
  } = useLoreGenerator(movieDetails?.id || 0);

  // Movie lists
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([]);

  // Loading states
  const [isLoadingMovies, setIsLoadingMovies] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Collection info
  const [collectionInfo, setCollectionInfo] = useState<CollectionAnalysis | null>(null);

  // Fetch movies on mount
  useEffect(() => {
    async function fetchMovies() {
      setIsLoadingMovies(true);
      try {
        const [upcoming, popular, nowPlaying] = await Promise.all([
          TMDBService.getUpcomingMovies(),
          TMDBService.getPopularMovies(),
          TMDBService.getNowPlayingMovies()
        ]);

        setUpcomingMovies(upcoming);
        setPopularMovies(popular);
        setNowPlayingMovies(nowPlaying);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setIsLoadingMovies(false);
      }
    }

    fetchMovies();
  }, []);

  // Handle movie selection
  const handleMovieSelect = async (movie: Movie) => {
    setSelectedMovie(movie);
    setView('detail');
    setIsLoadingDetails(true);
    clearAnalysis();
    setCollectionInfo(null);

    try {
      const details = await TMDBService.getMovieDetails(movie.id);
      setMovieDetails(details);

      // Check if it's part of a collection
      if (details.belongs_to_collection) {
        const analysis = await TMDBService.analyzeMovieForLore(movie.id);
        setCollectionInfo(analysis);
      }
    } catch (error) {
      console.error('Error fetching movie details:', error);
    } finally {
      setIsLoadingDetails(false);
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle lore generation
  const handleAnalyzeLore = async () => {
    if (!movieDetails || !collectionInfo) return;
    setView('lore');
    await generateLore();
  };

  // Handle navigation
  const handleGoHome = () => {
    setView('home');
    setSelectedMovie(null);
    setMovieDetails(null);
    clearAnalysis();
    setCollectionInfo(null);
  };

  const handleBackFromLore = () => {
    setView('detail');
    clearAnalysis();
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Navbar */}
      <Navbar
        onMovieSelect={handleMovieSelect}
        onHomeClick={handleGoHome}
      />

      <AnimatePresence mode="wait">
        {/* HOME VIEW */}
        {view === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Hero Section */}
            <section className="relative py-16 md:py-24 overflow-hidden">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35]/10 via-transparent to-[#4ECDC4]/5" />
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6B35]/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#4ECDC4]/10 rounded-full blur-3xl" />

              <div className="container mx-auto px-4 relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="max-w-3xl"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-[#FF6B35]" />
                    <span className="text-[#FF6B35] font-medium text-sm uppercase tracking-wider">
                      Prepárate para el cine
                    </span>
                  </div>

                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
                    Nunca más te pierdas{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#F7931E]">
                      la historia
                    </span>
                  </h1>

                  <p className="text-lg md:text-xl text-[#A0A0AB] leading-relaxed max-w-2xl">
                    Obtén resúmenes inteligentes de las precuelas antes de ver los nuevos estrenos.
                    Sin spoilers, solo el lore que necesitas saber.
                  </p>

                  {/* Feature Tags */}
                  <div className="flex flex-wrap gap-3 mt-8">
                    <span className="px-4 py-2 rounded-full bg-[#1C1C2E] border border-white/10 text-[#A0A0AB] text-sm flex items-center gap-2">
                      <Film className="w-4 h-4 text-[#FF6B35]" />
                      Próximos estrenos
                    </span>
                    <span className="px-4 py-2 rounded-full bg-[#1C1C2E] border border-white/10 text-[#A0A0AB] text-sm flex items-center gap-2">
                      <Clapperboard className="w-4 h-4 text-[#4ECDC4]" />
                      Análisis de sagas
                    </span>
                    <span className="px-4 py-2 rounded-full bg-[#1C1C2E] border border-white/10 text-[#A0A0AB] text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#FFD166]" />
                      Resúmenes con IA
                    </span>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Movie Grids */}
            <div className="container mx-auto px-4 pb-16 space-y-8">
              {/* Upcoming Movies */}
              <MovieGrid
                title="🔥 Próximos Estrenos"
                subtitle="Películas que están por llegar al cine"
                movies={upcomingMovies}
                onMovieClick={handleMovieSelect}
                isLoading={isLoadingMovies}
              />

              {/* Now Playing */}
              <MovieGrid
                title="🎬 En Cartelera"
                subtitle="Ahora en cines"
                movies={nowPlayingMovies}
                onMovieClick={handleMovieSelect}
                isLoading={isLoadingMovies}
              />

              {/* Popular Movies */}
              <MovieGrid
                title="⭐ Populares"
                subtitle="Las más vistas esta semana"
                movies={popularMovies}
                onMovieClick={handleMovieSelect}
                isLoading={isLoadingMovies}
              />
            </div>
          </motion.div>
        )}

        {/* DETAIL VIEW */}
        {view === 'detail' && (
          <motion.div
            key="detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {isLoadingDetails ? (
              <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF6B35]" />
              </div>
            ) : movieDetails ? (
              <>
                <MovieHero
                  movie={movieDetails}
                  onAnalyze={handleAnalyzeLore}
                  hasCollection={!!movieDetails.belongs_to_collection}
                  isAnalyzing={isGeneratingLore}
                />

                {/* Related Movies / Recommendations */}
                {movieDetails.recommendations?.results && movieDetails.recommendations.results.length > 0 && (
                  <div className="container mx-auto px-4 py-8">
                    <MovieGrid
                      title="También te puede interesar"
                      movies={movieDetails.recommendations.results.slice(0, 10)}
                      onMovieClick={handleMovieSelect}
                      isLoading={false}
                    />
                  </div>
                )}
              </>
            ) : null}
          </motion.div>
        )}

        {/* LORE VIEW */}
        {view === 'lore' && (
          <motion.div
            key="lore"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Mini Hero */}
            {movieDetails && (
              <div className="relative py-8 bg-gradient-to-b from-[#1C1C2E]/50 to-transparent">
                <div className="container mx-auto px-4">
                  <button
                    onClick={handleBackFromLore}
                    className="text-[#A0A0AB] hover:text-white mb-4 flex items-center gap-2 transition-colors"
                  >
                    ← Volver a {movieDetails.title}
                  </button>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">
                    Preparando: <span className="text-[#FF6B35]">{movieDetails.title}</span>
                  </h1>
                </div>
              </div>
            )}

            {/* Lore Content */}
            {isGeneratingLore && !loreAnalysis ? (
              <div className="container mx-auto px-4 py-12">
                <LoadingStates stage={loreStage} stages={loadingStages} />
              </div>
            ) : loreAnalysis ? (
              <LoreAnalysis
                analysis={loreAnalysis}
                collectionName={collectionInfo?.collection_name}
              />
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Film className="w-5 h-5 text-[#FF6B35]" />
            <span className="text-white font-bold">CinePrep</span>
          </div>
          <p className="text-[#6B6B78] text-sm">
            Datos de películas proporcionados por{' '}
            <a
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4ECDC4] hover:underline"
            >
              TMDB
            </a>
          </p>
          <p className="text-[#6B6B78] text-xs mt-2">
            © 2024 CinePrep. Hecho con 🎬 para cinéfilos.
          </p>
        </div>
      </footer>
    </div>
  );
}

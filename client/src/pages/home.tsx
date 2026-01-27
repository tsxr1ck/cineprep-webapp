import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Film, Clapperboard, TrendingUp, Play, ChevronRight } from 'lucide-react';
import MovieGrid from '@/components/app/movie-grid';
import { TMDBService } from '@/services/TMDB-service';
import type { Movie } from 'tmdb-ts';

export default function HomePage() {
  const navigate = useNavigate();
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);

  useEffect(() => {
    async function fetchMovies() {
      setIsLoading(true);
      try {
        const [upcoming, popular, nowPlaying] = await Promise.all([
          TMDBService.getUpcomingMovies(),
          TMDBService.getPopularMovies(),
          TMDBService.getNowPlayingMovies()
        ]);

        setUpcomingMovies(upcoming);
        setPopularMovies(popular);
        setNowPlayingMovies(nowPlaying);
        
        if (popular.length > 0) {
          setFeaturedMovie(popular[0]);
        }
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMovies();
  }, []);

  const handleMovieClick = (movie: Movie) => {
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div className="min-h-screen">
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {featuredMovie && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <img
              src={TMDBService.getImageUrl(featuredMovie.backdrop_path, 'original') || ''}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0F] via-[#0A0A0F]/90 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/60 to-transparent" />
            <div className="absolute inset-0 bg-[#0A0A0F]/40" />
          </motion.div>
        )}

        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-[#FF6B35]/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#4ECDC4]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 pt-20">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF6B35]/10 border border-[#FF6B35]/20">
                  <Sparkles className="w-4 h-4 text-[#FF6B35]" />
                  <span className="text-[#FF6B35] font-medium text-sm uppercase tracking-wider">
                    Preparate para el cine
                  </span>
                </div>
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
                Nunca mas te pierdas{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] via-[#F7931E] to-[#FFD166]">
                  la historia
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-[#A0A0AB] leading-relaxed max-w-2xl mb-10">
                Obtene resumenes inteligentes de las precuelas antes de ver los nuevos estrenos.
                <span className="text-white font-medium"> Sin spoilers</span>, solo el lore que necesitas.
              </p>

              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => document.getElementById('upcoming')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white font-semibold text-lg shadow-lg shadow-[#FF6B35]/25 hover:shadow-[#FF6B35]/40 transition-all"
                >
                  <Play className="w-5 h-5" />
                  Explorar peliculas
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>

              <div className="flex flex-wrap gap-4 mt-12">
                {[
                  { icon: Film, text: 'Proximos estrenos', color: '#FF6B35' },
                  { icon: Clapperboard, text: 'Analisis de sagas', color: '#4ECDC4' },
                  { icon: TrendingUp, text: 'Resumenes con IA', color: '#FFD166' }
                ].map((feature, index) => (
                  <motion.div
                    key={feature.text}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                  >
                    <feature.icon className="w-4 h-4" style={{ color: feature.color }} />
                    <span className="text-[#A0A0AB] text-sm">{feature.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
          >
            <motion.div className="w-1.5 h-1.5 rounded-full bg-white/60" />
          </motion.div>
        </motion.div>
      </section>

      <div className="container mx-auto px-4 py-16 space-y-16">
        <section id="upcoming">
          <MovieGrid
            title="Proximos Estrenos"
            subtitle="Peliculas que estan por llegar al cine"
            movies={upcomingMovies}
            onMovieClick={handleMovieClick}
            isLoading={isLoading}
          />
        </section>

        <section id="nowplaying">
          <MovieGrid
            title="En Cartelera"
            subtitle="Ahora en cines"
            movies={nowPlayingMovies}
            onMovieClick={handleMovieClick}
            isLoading={isLoading}
          />
        </section>

        <section id="popular">
          <MovieGrid
            title="Populares"
            subtitle="Las mas vistas esta semana"
            movies={popularMovies}
            onMovieClick={handleMovieClick}
            isLoading={isLoading}
          />
        </section>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Star,
  Loader2,
  ArrowLeft,
  Play,
  Users,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TMDBService } from "@/services/TMDB-service";
import { useLoreGenerator } from "@/hooks/useLoreGenerator";
import { LoadingStates } from "@/components/app/loading-states";
import LoreAnalysis from "@/components/app/lore-analysis";
import MovieGrid from "@/components/app/movie-grid";
import type { ExtendedMovieDetails, CollectionAnalysis } from "@/types/tmdb";
import type { Movie } from "tmdb-ts";

export default function MoviePage() {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<ExtendedMovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [collectionInfo, setCollectionInfo] =
    useState<CollectionAnalysis | null>(null);
  const [showLoreView, setShowLoreView] = useState(false);

  const {
    generateLore,
    loading: isGeneratingLore,
    stage: loreStage,
    stages: loadingStages,
    analysis: loreAnalysis,
    clearAnalysis,
  } = useLoreGenerator(movie?.id || 0);

  useEffect(() => {
    async function fetchMovie() {
      if (!movieId) return;

      setIsLoading(true);
      clearAnalysis();
      setCollectionInfo(null);
      setShowLoreView(false);

      try {
        const details = await TMDBService.getMovieDetails(parseInt(movieId));
        setMovie(details);

        if (details.belongs_to_collection) {
          const analysis = await TMDBService.analyzeMovieForLore(
            parseInt(movieId),
          );
          setCollectionInfo(analysis);
        }
      } catch (error) {
        console.error("Error fetching movie:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMovie();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [movieId]);

  const handleAnalyzeLore = async () => {
    if (!movie || !collectionInfo) return;
    setShowLoreView(true);
    await generateLore();
  };

  const handleMovieClick = (movie: Movie) => {
    navigate(`/movie/${movie.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#F7931E] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-[#6B6B78]">Cargando pelicula...</p>
        </motion.div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <p className="text-[#6B6B78] mb-4">Pelicula no encontrada</p>
          <Link to="/" className="text-[#FF6B35] hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const backdropUrl = TMDBService.getImageUrl(
    movie.backdrop_path || null,
    "original",
  );
  const posterUrl = TMDBService.getImageUrl(movie.poster_path || null, "w500");
  const releaseDate = new Date(movie.release_date).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {!showLoreView ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="relative min-h-[80vh] overflow-hidden">
              {backdropUrl && (
                <motion.img
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.5 }}
                  src={backdropUrl}
                  alt={movie.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0F] via-[#0A0A0F]/70 to-transparent" />
              <div className="absolute inset-0 bg-black/30" />

              <div className="absolute top-24 left-4">
                <motion.button
                  whileHover={{ scale: 1.05, x: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-white hover:bg-white/20 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver</span>
                </motion.button>
              </div>

              <div className="relative container mx-auto px-4 pt-32 pb-16 flex flex-col lg:flex-row gap-12 items-end lg:items-end min-h-[80vh]">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="hidden lg:block flex-shrink-0"
                >
                  {posterUrl && (
                    <img
                      src={posterUrl}
                      alt={movie.title}
                      className="w-72 rounded-2xl shadow-2xl shadow-black/50 border border-white/10"
                    />
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex-1 pb-8"
                >
                  <div className="flex flex-wrap gap-2 mb-4">
                    {movie.genres?.slice(0, 4).map((genre, index) => (
                      <motion.div
                        key={genre.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + index * 0.05 }}
                      >
                        <Badge
                          variant="outline"
                          className="border-white/20 text-gray-200 bg-white/10 backdrop-blur-sm px-3 py-1"
                        >
                          {genre.name}
                        </Badge>
                      </motion.div>
                    ))}
                    {movie.belongs_to_collection && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 }}
                      >
                        <Badge className="bg-[#4ECDC4] text-white px-3 py-1">
                          Parte de saga
                        </Badge>
                      </motion.div>
                    )}
                  </div>

                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1] drop-shadow-lg">
                    {movie.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-6 text-gray-200 mb-8">
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-sm"
                    >
                      <Calendar className="w-5 h-5 text-[#FF6B35]" />
                      {releaseDate}
                    </motion.span>
                    {movie.runtime && (
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-sm"
                      >
                        <Clock className="w-5 h-5 text-[#4ECDC4]" />
                        {movie.runtime} min
                      </motion.span>
                    )}
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FFD166]/20 backdrop-blur-sm"
                    >
                      <Star className="w-5 h-5 fill-[#FFD166] text-[#FFD166]" />
                      <span className="font-semibold text-[#FFD166]">
                        {movie.vote_average?.toFixed(1)}
                      </span>
                    </motion.span>
                  </div>

                  <p className="text-lg text-gray-300 mb-10 max-w-2xl leading-relaxed">
                    {movie.overview}
                  </p>

                  <div className="flex flex-wrap gap-4">
                    {collectionInfo?.needs_lore ? (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          size="lg"
                          className="bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white font-semibold px-8 py-6 text-lg shadow-lg shadow-[#FF6B35]/25 hover:shadow-[#FF6B35]/40 transition-all rounded-2xl"
                          onClick={handleAnalyzeLore}
                          disabled={isGeneratingLore}
                        >
                          {isGeneratingLore ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Generando...
                            </>
                          ) : (
                            <>
                              <Play className="w-5 h-5 mr-2" />
                              Preparar Lore
                              <ChevronRight className="w-5 h-5 ml-1" />
                            </>
                          )}
                        </Button>
                      </motion.div>
                    ) : (
                      <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <Users className="w-5 h-5 text-[#4ECDC4]" />
                        <span className="text-gray-300">
                          Esta pelicula no requiere conocimiento previo
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>

            {movie.credits?.cast && movie.credits.cast.length > 0 && (
              <div className="container mx-auto px-4 py-12">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Reparto principal
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {movie.credits.cast.slice(0, 10).map((actor, index) => (
                    <motion.div
                      key={actor.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex-shrink-0 w-32 text-center"
                    >
                      <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden bg-white/5 mb-3">
                        {actor.profile_path ? (
                          <img
                            src={
                              TMDBService.getImageUrl(
                                actor.profile_path,
                                "w185",
                              ) || ""
                            }
                            alt={actor.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#6B6B78]">
                            <Users className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <p className="text-white text-sm font-medium truncate">
                        {actor.name}
                      </p>
                      <p className="text-[#6B6B78] text-xs truncate">
                        {actor.character}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {movie.recommendations?.results &&
              movie.recommendations.results.length > 0 && (
                <div className="container mx-auto px-4 pb-16">
                  <MovieGrid
                    title="Tambien te puede interesar"
                    movies={movie.recommendations.results.slice(0, 10)}
                    onMovieClick={handleMovieClick}
                    isLoading={false}
                  />
                </div>
              )}
          </motion.div>
        ) : (
          <motion.div
            key="lore"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-20"
          >
            <div className="container mx-auto px-4 py-8">
              <motion.button
                whileHover={{ scale: 1.02, x: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowLoreView(false);
                  clearAnalysis();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[#A0A0AB] hover:text-white hover:bg-white/10 transition-all mb-8"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver a {movie.title}
              </motion.button>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
                Preparando:{" "}
                <span className="text-[#FF6B35]">{movie.title}</span>
              </h1>
            </div>

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
    </div>
  );
}

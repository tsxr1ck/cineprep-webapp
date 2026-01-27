import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Search, X, Loader2, Menu, User, Settings, LogOut, Heart, Bell, Crown, Sparkles, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { TMDBService } from '@/services/TMDB-service';
import type { Movie } from 'tmdb-ts';
import { useAuth } from '@/contexts/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import supabase from '@/utils/supabase';

export default function Navbar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);

  const {
    user,
    membership,
    usage,
    canGenerateAnalysis,
    canGenerateAudio,
    getRemainingAnalyses,
    getRemainingAudio,
    getAnalysisLimitStatus,
    getAudioLimitStatus,
    isUnlimited
  } = useAuth();

  const analysisStatus = getAnalysisLimitStatus();
  const audioStatus = getAudioLimitStatus();

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error);
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && event.target instanceof Node && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
      if (userMenuRef.current && event.target instanceof Node && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
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
    navigate(`/movie/${movie.id}`);
    setSearchQuery('');
    setShowResults(false);
    setIsMobileMenuOpen(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  // Helper function to get plan badge color
  const getPlanBadgeColor = (planSlug: string) => {
    switch (planSlug) {
      case 'pro':
        return 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-400 border-purple-500/20';
      case 'premium':
        return 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 text-yellow-400 border-yellow-500/20';
      default:
        return 'bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]/20';
    }
  };

  // Helper function to get plan icon
  const getPlanIcon = (planSlug: string) => {
    switch (planSlug) {
      case 'pro':
        return <Zap className="w-3 h-3" />;
      case 'premium':
        return <Crown className="w-3 h-3" />;
      default:
        return <Sparkles className="w-3 h-3" />;
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-[#0A0A0F]/95 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20'
        : 'bg-transparent'
        }`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
                className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#F7931E] flex items-center justify-center shadow-lg shadow-[#FF6B35]/25 group-hover:shadow-[#FF6B35]/40 transition-shadow"
              >
                <Film className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-xl font-bold text-white tracking-tight hidden sm:block group-hover:text-[#FF6B35] transition-colors">
                CinePrep
              </span>
            </Link>

            <div className="hidden md:flex relative flex-1 max-w-xl mx-4" ref={searchRef}>
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B6B78]" />
                <Input
                  type="text"
                  value={searchQuery}
                  placeholder="Busca una pelicula..."
                  className="pl-12 pr-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-[#6B6B78] focus:border-[#FF6B35]/50 focus:ring-[#FF6B35]/20 focus:bg-white/10 rounded-2xl transition-all"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowResults(true)}
                />
                {isSearching && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FF6B35] animate-spin" />
                )}
                {searchQuery && !isSearching && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B6B78] hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <AnimatePresence>
                {showResults && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-[#14141F]/98 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
                  >
                    {searchResults.map((movie: Movie, index: number) => (
                      <motion.div
                        key={movie.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: 'rgba(255, 107, 53, 0.08)' }}
                        className="flex items-center gap-4 p-4 cursor-pointer border-b border-white/5 last:border-0 group"
                        onClick={() => handleSelectMovie(movie)}
                      >
                        <img
                          src={TMDBService.getImageUrl(movie.poster_path, 'w92') || TMDBService.getPlaceholderPoster()}
                          alt={movie.title}
                          className="w-12 h-16 object-cover rounded-lg shadow-md"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate group-hover:text-[#FF6B35] transition-colors">{movie.title}</p>
                          <p className="text-[#6B6B78] text-sm">
                            {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Proximamente'}
                          </p>
                        </div>
                        {(movie.vote_average ?? 0) > 0 && (
                          <span className="text-[#FFD166] text-sm font-semibold bg-[#FFD166]/10 px-2 py-1 rounded-lg">
                            {movie.vote_average?.toFixed(1)}
                          </span>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#A0A0AB] hover:text-white transition-all"
                  >
                    <Bell className="w-5 h-5" />
                  </motion.button>

                  <div className="relative hidden md:block" ref={userMenuRef}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD166] to-[#FF6B35] flex items-center justify-center text-white font-semibold shadow-lg shadow-[#FF6B35]/25 hover:shadow-[#FF6B35]/40 transition-shadow overflow-hidden"
                    >
                      <Avatar>
                        <AvatarImage src={user?.user_metadata.avatar_url} />
                        <AvatarFallback><User className="w-5 h-5" /></AvatarFallback>
                      </Avatar>
                    </motion.button>

                    <AnimatePresence>
                      {showUserMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full right-0 mt-2 w-72 bg-[#14141F]/98 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
                        >
                          {/* User Info Header */}
                          <div className="p-4 border-b border-white/10">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-white font-medium">{user?.user_metadata.full_name}</p>
                              {membership && (
                                <Badge
                                  variant="secondary"
                                  className={`${getPlanBadgeColor(membership.plan.slug)} text-[10px] px-2 py-0 flex items-center gap-1`}
                                >
                                  {getPlanIcon(membership.plan.slug)}
                                  {membership.plan.name}
                                </Badge>
                              )}
                            </div>
                            <p className="text-[#6B6B78] text-sm truncate">{user?.email}</p>

                            {/* Membership Status */}
                            {membership && (
                              <div className="mt-3 p-2 rounded-lg bg-white/5 border border-white/5">
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="text-[#6B6B78]">Estado</span>
                                  <span className={`font-medium ${membership.status === 'active' ? 'text-green-400' :
                                    membership.status === 'cancelled' ? 'text-red-400' :
                                      'text-yellow-400'
                                    }`}>
                                    {membership.status === 'active' ? 'Activo' :
                                      membership.status === 'cancelled' ? 'Cancelado' :
                                        'Inactivo'}
                                  </span>
                                </div>
                                {membership.current_period_end && (
                                  <div className="flex items-center justify-between text-[10px] mt-1">
                                    <span className="text-[#6B6B78]">Renueva</span>
                                    <span className="text-white font-medium">
                                      {new Date(membership.current_period_end).toLocaleDateString('es-ES', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Usage Indicators */}
                          <div className="px-4 py-3 space-y-3 border-b border-white/10 bg-white/[0.02]">
                            {/* Analysis Usage */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Film className="w-3.5 h-3.5 text-[#FF6B35]" />
                                  <span className="text-[11px] text-[#A0A0AB]">Análisis de películas</span>
                                </div>
                                <span className="text-[11px] font-medium text-white">
                                  {usage?.analyses_generated || 0} / {
                                    isUnlimited('analysis') ? '∞' : membership?.plan.max_analyses_per_month || 0
                                  }
                                </span>
                              </div>

                              {!isUnlimited('analysis') && (
                                <div className="space-y-1">
                                  <Progress
                                    value={analysisStatus.percentage}
                                    className="h-1.5 bg-white/5"
                                  />
                                  <div className="flex items-center justify-between text-[9px]">
                                    <span className="text-[#6B6B78]">
                                      {analysisStatus.remaining} restantes
                                    </span>
                                    <span className={`font-medium ${analysisStatus.percentage >= 90 ? 'text-red-400' :
                                      analysisStatus.percentage >= 70 ? 'text-yellow-400' :
                                        'text-green-400'
                                      }`}>
                                      {analysisStatus.percentage.toFixed(0)}%
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Audio Usage */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                                  <span className="text-[11px] text-[#A0A0AB]">Generación de audio</span>
                                </div>
                                <span className="text-[11px] font-medium text-white">
                                  {usage?.audio_generated || 0} / {
                                    isUnlimited('audio') ? '∞' : membership?.plan.max_audio_generations_per_month || 0
                                  }
                                </span>
                              </div>

                              {!isUnlimited('audio') && (
                                <div className="space-y-1">
                                  <Progress
                                    value={audioStatus.percentage}
                                    className="h-1.5 bg-white/5"
                                  />
                                  <div className="flex items-center justify-between text-[9px]">
                                    <span className="text-[#6B6B78]">
                                      {audioStatus.remaining} restantes
                                    </span>
                                    <span className={`font-medium ${audioStatus.percentage >= 90 ? 'text-red-400' :
                                      audioStatus.percentage >= 70 ? 'text-yellow-400' :
                                        'text-green-400'
                                      }`}>
                                      {audioStatus.percentage.toFixed(0)}%
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Upgrade CTA */}
                            {!canGenerateAnalysis() && membership?.plan.slug === 'free' && (
                              <button
                                onClick={() => {
                                  navigate('/pricing');
                                  setShowUserMenu(false);
                                }}
                                className="w-full mt-2 py-2 rounded-lg bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white text-[11px] font-bold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-lg shadow-[#FF6B35]/25"
                              >
                                ⚡ Mejorar Plan
                              </button>
                            )}
                          </div>

                          {/* Menu Options */}
                          <div className="p-2">
                            <motion.button
                              whileHover={{ x: 4 }}
                              onClick={() => {
                                navigate('/favorites');
                                setShowUserMenu(false);
                              }}
                              className="flex items-center gap-3 w-full p-3 rounded-xl text-[#A0A0AB] hover:text-white hover:bg-white/5 transition-all"
                            >
                              <Heart className="w-4 h-4" />
                              <span>Mis Favoritos</span>
                            </motion.button>
                            <motion.button
                              whileHover={{ x: 4 }}
                              onClick={() => {
                                navigate('/settings');
                                setShowUserMenu(false);
                              }}
                              className="flex items-center gap-3 w-full p-3 rounded-xl text-[#A0A0AB] hover:text-white hover:bg-white/5 transition-all"
                            >
                              <Settings className="w-4 h-4" />
                              <span>Configuración</span>
                            </motion.button>

                            {membership?.plan.slug !== 'free' && (
                              <motion.button
                                whileHover={{ x: 4 }}
                                onClick={() => {
                                  navigate('/billing');
                                  setShowUserMenu(false);
                                }}
                                className="flex items-center gap-3 w-full p-3 rounded-xl text-[#A0A0AB] hover:text-white hover:bg-white/5 transition-all"
                              >
                                <Crown className="w-4 h-4" />
                                <span>Facturación</span>
                              </motion.button>
                            )}

                            <motion.button
                              onClick={() => signOut()}
                              whileHover={{ x: 4 }}
                              className="flex items-center gap-3 w-full p-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Cerrar sesión</span>
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/login')}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white font-semibold text-sm shadow-lg shadow-[#FF6B35]/25 hover:shadow-[#FF6B35]/40 transition-all"
                >
                  Iniciar sesión
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-all"
              >
                <Menu className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div >
      </nav >

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-[#0A0A0F] border-l border-white/10 z-50 md:hidden overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-xl font-bold text-white">Menu</span>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Mobile Search */}
                <div className="relative mb-8">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B6B78]" />
                  <Input
                    type="text"
                    value={searchQuery}
                    placeholder="Buscar pelicula..."
                    className="pl-12 pr-4 h-12 bg-white/5 border-white/10 text-white placeholder:text-[#6B6B78] rounded-xl w-full"
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {searchResults.length > 0 && (
                  <div className="mb-8 space-y-2">
                    {searchResults.map((movie) => (
                      <motion.div
                        key={movie.id}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 cursor-pointer"
                        onClick={() => handleSelectMovie(movie)}
                      >
                        <img
                          src={TMDBService.getImageUrl(movie.poster_path, 'w92') || TMDBService.getPlaceholderPoster()}
                          alt={movie.title}
                          className="w-10 h-14 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{movie.title}</p>
                          <p className="text-[#6B6B78] text-sm">
                            {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Proximamente'}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Mobile User Card */}
                {user ? (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 mb-8">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="w-12 h-12 rounded-xl transition-shadow">
                        <AvatarImage src={user?.user_metadata.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-[#FFD166] to-[#FF6B35] text-white">
                          <User className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium truncate">{user?.user_metadata.full_name || 'Usuario'}</p>
                          {membership && (
                            <Badge
                              variant="secondary"
                              className={`${getPlanBadgeColor(membership.plan.slug)} text-[9px] px-1.5 py-0 flex items-center gap-1`}
                            >
                              {getPlanIcon(membership.plan.slug)}
                              {membership.plan.name}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[#6B6B78] text-sm truncate">{user?.email}</p>
                      </div>
                    </div>

                    {/* Mobile Membership Status */}
                    {membership && (
                      <div className="mb-4 p-2 rounded-lg bg-white/5 border border-white/5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-[#6B6B78]">Estado</span>
                          <span className={`font-medium ${membership.status === 'active' ? 'text-green-400' :
                            membership.status === 'cancelled' ? 'text-red-400' :
                              'text-yellow-400'
                            }`}>
                            {membership.status === 'active' ? 'Activo' :
                              membership.status === 'cancelled' ? 'Cancelado' :
                                'Inactivo'}
                          </span>
                        </div>
                        {membership.current_period_end && (
                          <div className="flex items-center justify-between text-[10px] mt-1">
                            <span className="text-[#6B6B78]">Renueva</span>
                            <span className="text-white font-medium">
                              {new Date(membership.current_period_end).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Mobile Usage Indicators */}
                    <div className="space-y-3 pt-4 border-t border-white/5">
                      {/* Analysis */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Film className="w-3.5 h-3.5 text-[#FF6B35]" />
                            <span className="text-[11px] text-[#A0A0AB]">Análisis</span>
                          </div>
                          <span className="text-[11px] font-medium text-white">
                            {usage?.analyses_generated || 0} / {
                              isUnlimited('analysis') ? '∞' : membership?.plan.max_analyses_per_month || 0
                            }
                          </span>
                        </div>
                        {!isUnlimited('analysis') && (
                          <Progress
                            value={analysisStatus.percentage}
                            className="h-1 bg-white/5"
                          />
                        )}
                      </div>

                      {/* Audio */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                            <span className="text-[11px] text-[#A0A0AB]">Audio</span>
                          </div>
                          <span className="text-[11px] font-medium text-white">
                            {usage?.audio_generated || 0} / {
                              isUnlimited('audio') ? '∞' : membership?.plan.max_audio_generations_per_month || 0
                            }
                          </span>
                        </div>
                        {!isUnlimited('audio') && (
                          <Progress
                            value={audioStatus.percentage}
                            className="h-1 bg-white/5"
                          />
                        )}
                      </div>
                    </div>

                    {/* Mobile Upgrade CTA */}
                    {membership?.plan.slug === 'free' && (
                      <button
                        onClick={() => {
                          navigate('/pricing');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full mt-4 py-2 rounded-lg bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white text-[11px] font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
                      >
                        ⚡ Mejorar a Pro
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-[#FF6B35]/10 to-[#F7931E]/5 border border-[#FF6B35]/20 mb-8 text-center">
                    <p className="text-white font-medium mb-4">Accede a todo el potencial</p>
                    <button
                      onClick={() => {
                        navigate('/login');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white font-bold text-sm shadow-lg shadow-[#FF6B35]/25"
                    >
                      Iniciar sesión
                    </button>
                  </div>
                )}

                {/* Mobile Menu Items */}
                <div className="space-y-2">
                  {user && (
                    <>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          navigate('/favorites');
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-4 w-full p-4 rounded-xl text-[#A0A0AB] hover:text-white hover:bg-white/5 transition-all"
                      >
                        <Heart className="w-5 h-5" />
                        <span>Mis Favoritos</span>
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-4 w-full p-4 rounded-xl text-[#A0A0AB] hover:text-white hover:bg-white/5 transition-all"
                      >
                        <Bell className="w-5 h-5" />
                        <span>Notificaciones</span>
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          navigate('/settings');
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-4 w-full p-4 rounded-xl text-[#A0A0AB] hover:text-white hover:bg-white/5 transition-all"
                      >
                        <Settings className="w-5 h-5" />
                        <span>Configuración</span>
                      </motion.button>

                      {membership?.plan.slug !== 'free' && (
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            navigate('/billing');
                            setIsMobileMenuOpen(false);
                          }}
                          className="flex items-center gap-4 w-full p-4 rounded-xl text-[#A0A0AB] hover:text-white hover:bg-white/5 transition-all"
                        >
                          <Crown className="w-5 h-5" />
                          <span>Facturación</span>
                        </motion.button>
                      )}

                      <motion.button
                        onClick={() => signOut()}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-4 w-full p-4 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Cerrar sesión</span>
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Search, X, Loader2, Menu, User, Settings, LogOut, Heart, Bell, Crown, Sparkles, Zap, History } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { TMDBService } from '@/services/TMDB-service';
import type { Movie } from 'tmdb-ts';
import { useAuth } from '@/contexts/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import ThemeToggle from '@/components/ui/theme-toggle';
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
    getAnalysisLimitStatus,
    getAudioLimitStatus,
    isUnlimited
  } = useAuth();

  const analysisStatus = getAnalysisLimitStatus();
  const audioStatus = getAudioLimitStatus();

  async function signOut() {
    // Clear all local storage data
    localStorage.clear();

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
        return 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-500 border-purple-500/20';
      case 'premium':
        return 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 text-yellow-500 border-yellow-500/20';
      default:
        return 'bg-[#FF6B35]/10 text-primary border-[#FF6B35]/20';
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
        ? 'bg-background/95 backdrop-blur-xl border-b border-border shadow-lg'
        : 'bg-transparent'
        }`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
                className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#F7931E] flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow"
              >
                <Film className="w-5 h-5 text-foreground" />
              </motion.div>
              <span className="text-xl font-bold text-foreground tracking-tight hidden sm:block group-hover:text-primary transition-colors">
                CinePrep
              </span>
            </Link>

            <div className="hidden md:flex relative flex-1 max-w-xl mx-4" ref={searchRef}>
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  placeholder="Busca una pelicula..."
                  className="pl-12 pr-12 h-12 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20 focus:bg-muted rounded-2xl transition-all"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowResults(true)}
                />
                {isSearching && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-spin" />
                )}
                {searchQuery && !isSearching && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                    className="absolute top-full left-0 right-0 mt-2 bg-card/98 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden"
                  >
                    {searchResults.map((movie: Movie, index: number) => (
                      <motion.div
                        key={movie.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: 'rgba(var(--primary), 0.08)' }}
                        className="flex items-center gap-4 p-4 cursor-pointer border-b border-border last:border-0 group"
                        onClick={() => handleSelectMovie(movie)}
                      >
                        <img
                          src={TMDBService.getImageUrl(movie.poster_path, 'w92') || TMDBService.getPlaceholderPoster()}
                          alt={movie.title}
                          className="w-12 h-16 object-cover rounded-lg shadow-md"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground font-medium truncate group-hover:text-primary transition-colors">{movie.title}</p>
                          <p className="text-muted-foreground text-sm">
                            {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Proximamente'}
                          </p>
                        </div>
                        {(movie.vote_average ?? 0) > 0 && (
                          <span className="text-yellow-500 text-sm font-semibold bg-yellow-500/10 px-2 py-1 rounded-lg">
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
                    className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl bg-muted/50 hover:bg-muted border border-border text-muted-foreground hover:text-foreground transition-all"
                  >
                    <Bell className="w-5 h-5" />
                  </motion.button>

                  <ThemeToggle />

                  <div className="relative hidden md:block" ref={userMenuRef}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD166] to-[#FF6B35] flex items-center justify-center text-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow overflow-hidden"
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
                          className="absolute top-full right-0 mt-2 w-72 bg-card/98 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden"
                        >
                          {/* User Info Header */}
                          <div className="p-4 border-b border-border">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-foreground font-medium">{user?.user_metadata.full_name}</p>
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
                            <p className="text-muted-foreground text-sm truncate">{user?.email}</p>

                            {/* Membership Status */}
                            {membership && (
                              <div className="mt-3 p-2 rounded-lg bg-muted/50 border border-border">
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="text-muted-foreground">Estado</span>
                                  <span className={`font-medium ${membership.status === 'active' ? 'text-green-500' :
                                    membership.status === 'cancelled' ? 'text-red-500' :
                                      'text-yellow-500'
                                    }`}>
                                    {membership.status === 'active' ? 'Activo' :
                                      membership.status === 'cancelled' ? 'Cancelado' :
                                        'Inactivo'}
                                  </span>
                                </div>
                                {membership.current_period_end && (
                                  <div className="flex items-center justify-between text-[10px] mt-1">
                                    <span className="text-muted-foreground">Renueva</span>
                                    <span className="text-foreground font-medium">
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
                          <div className="px-4 py-3 space-y-3 border-b border-border bg-muted/[0.02]">
                            {/* Analysis Usage */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Film className="w-3.5 h-3.5 text-primary" />
                                  <span className="text-[11px] text-muted-foreground">Análisis de películas</span>
                                </div>
                                <span className="text-[11px] font-medium text-foreground">
                                  {usage?.analyses_generated || 0} / {
                                    isUnlimited('analysis') ? '∞' : membership?.plan.max_analyses_per_month || 0
                                  }
                                </span>
                              </div>

                              {!isUnlimited('analysis') && (
                                <div className="space-y-1">
                                  <Progress
                                    value={analysisStatus.percentage}
                                    className="h-1.5 bg-muted/50"
                                  />
                                  <div className="flex items-center justify-between text-[9px]">
                                    <span className="text-muted-foreground">
                                      {analysisStatus.remaining} restantes
                                    </span>
                                    <span className={`font-medium ${analysisStatus.percentage >= 90 ? 'text-red-500' :
                                      analysisStatus.percentage >= 70 ? 'text-yellow-500' :
                                        'text-green-500'
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
                                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                                  <span className="text-[11px] text-muted-foreground">Generación de audio</span>
                                </div>
                                <span className="text-[11px] font-medium text-foreground">
                                  {usage?.audio_generated || 0} / {
                                    isUnlimited('audio') ? '∞' : membership?.plan.max_audio_generations_per_month || 0
                                  }
                                </span>
                              </div>

                              {!isUnlimited('audio') && (
                                <div className="space-y-1">
                                  <Progress
                                    value={audioStatus.percentage}
                                    className="h-1.5 bg-muted/50"
                                  />
                                  <div className="flex items-center justify-between text-[9px]">
                                    <span className="text-muted-foreground">
                                      {audioStatus.remaining} restantes
                                    </span>
                                    <span className={`font-medium ${audioStatus.percentage >= 90 ? 'text-red-500' :
                                      audioStatus.percentage >= 70 ? 'text-yellow-500' :
                                        'text-green-500'
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
                                className="w-full mt-2 py-2 rounded-lg bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-foreground text-[11px] font-bold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
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
                              className="flex items-center gap-3 w-full p-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                            >
                              <Heart className="w-4 h-4" />
                              <span>Mis Favoritos</span>
                            </motion.button>
                            <motion.button
                              whileHover={{ x: 4 }}
                              onClick={() => {
                                navigate('/history');
                                setShowUserMenu(false);
                              }}
                              className="flex items-center gap-3 w-full p-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                            >
                              <History className="w-4 h-4" />
                              <span>Historial</span>
                            </motion.button>
                            <motion.button
                              whileHover={{ x: 4 }}
                              onClick={() => {
                                navigate('/settings');
                                setShowUserMenu(false);
                              }}
                              className="flex items-center gap-3 w-full p-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
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
                                className="flex items-center gap-3 w-full p-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                              >
                                <Crown className="w-4 h-4" />
                                <span>Facturación</span>
                              </motion.button>
                            )}

                            <motion.button
                              onClick={() => signOut()}
                              whileHover={{ x: 4 }}
                              className="flex items-center gap-3 w-full p-3 rounded-xl text-red-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
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
                <>
                  <ThemeToggle />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/login')}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-foreground font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                  >
                    Iniciar sesión
                  </motion.button>
                </>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden w-10 h-10 rounded-xl bg-muted/50 hover:bg-muted border border-border flex items-center justify-center text-foreground transition-all"
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
              className="fixed top-0 right-0 bottom-0 w-80 bg-background border-l border-border z-50 md:hidden overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-xl font-bold text-foreground">Menu</span>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-10 h-10 rounded-xl bg-muted/50 hover:bg-muted flex items-center justify-center text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Mobile Search */}
                <div className="relative mb-8">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    value={searchQuery}
                    placeholder="Buscar pelicula..."
                    className="pl-12 pr-4 h-12 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground rounded-xl w-full"
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {searchResults.length > 0 && (
                  <div className="mb-8 space-y-2">
                    {searchResults.map((movie) => (
                      <motion.div
                        key={movie.id}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 cursor-pointer"
                        onClick={() => handleSelectMovie(movie)}
                      >
                        <img
                          src={TMDBService.getImageUrl(movie.poster_path, 'w92') || TMDBService.getPlaceholderPoster()}
                          alt={movie.title}
                          className="w-10 h-14 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground font-medium truncate">{movie.title}</p>
                          <p className="text-muted-foreground text-sm">
                            {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Proximamente'}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Mobile User Card */}
                {user ? (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-border mb-8">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="w-12 h-12 rounded-xl transition-shadow">
                        <AvatarImage src={user?.user_metadata.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-[#FFD166] to-[#FF6B35] text-foreground">
                          <User className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-foreground font-medium truncate">{user?.user_metadata.full_name || 'Usuario'}</p>
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
                        <p className="text-muted-foreground text-sm truncate">{user?.email}</p>
                      </div>
                    </div>

                    {/* Mobile Membership Status */}
                    {membership && (
                      <div className="mb-4 p-2 rounded-lg bg-muted/50 border border-white/5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">Estado</span>
                          <span className={`font-medium ${membership.status === 'active' ? 'text-green-500' :
                            membership.status === 'cancelled' ? 'text-red-500' :
                              'text-yellow-500'
                            }`}>
                            {membership.status === 'active' ? 'Activo' :
                              membership.status === 'cancelled' ? 'Cancelado' :
                                'Inactivo'}
                          </span>
                        </div>
                        {membership.current_period_end && (
                          <div className="flex items-center justify-between text-[10px] mt-1">
                            <span className="text-muted-foreground">Renueva</span>
                            <span className="text-foreground font-medium">
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
                            <Film className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[11px] text-muted-foreground">Análisis</span>
                          </div>
                          <span className="text-[11px] font-medium text-foreground">
                            {usage?.analyses_generated || 0} / {
                              isUnlimited('analysis') ? '∞' : membership?.plan.max_analyses_per_month || 0
                            }
                          </span>
                        </div>
                        {!isUnlimited('analysis') && (
                          <Progress
                            value={analysisStatus.percentage}
                            className="h-1 bg-muted/50"
                          />
                        )}
                      </div>

                      {/* Audio */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                            <span className="text-[11px] text-muted-foreground">Audio</span>
                          </div>
                          <span className="text-[11px] font-medium text-foreground">
                            {usage?.audio_generated || 0} / {
                              isUnlimited('audio') ? '∞' : membership?.plan.max_audio_generations_per_month || 0
                            }
                          </span>
                        </div>
                        {!isUnlimited('audio') && (
                          <Progress
                            value={audioStatus.percentage}
                            className="h-1 bg-muted/50"
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
                        className="w-full mt-4 py-2 rounded-lg bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-foreground text-[11px] font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
                      >
                        ⚡ Mejorar a Pro
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-[#FF6B35]/10 to-[#F7931E]/5 border border-[#FF6B35]/20 mb-8 text-center">
                    <p className="text-foreground font-medium mb-4">Accede a todo el potencial</p>
                    <button
                      onClick={() => {
                        navigate('/login');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-foreground font-bold text-sm shadow-lg shadow-primary/25"
                    >
                      Iniciar sesión
                    </button>
                  </div>
                )}

                {/* Theme Toggle for all users */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                  <span className="text-muted-foreground">Tema</span>
                  <ThemeToggle />
                </div>

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
                        className="flex items-center gap-4 w-full p-4 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                      >
                        <Heart className="w-5 h-5" />
                        <span>Mis Favoritos</span>
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-4 w-full p-4 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
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
                        className="flex items-center gap-4 w-full p-4 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                      >
                        <Settings className="w-5 h-5" />
                        <span>Configuración</span>
                      </motion.button>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                        <span className="text-muted-foreground">Tema</span>
                        <ThemeToggle />
                      </div>

                      {membership?.plan.slug !== 'free' && (
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            navigate('/billing');
                            setIsMobileMenuOpen(false);
                          }}
                          className="flex items-center gap-4 w-full p-4 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                        >
                          <Crown className="w-5 h-5" />
                          <span>Facturación</span>
                        </motion.button>
                      )}

                      <motion.button
                        onClick={() => signOut()}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-4 w-full p-4 rounded-xl text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
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
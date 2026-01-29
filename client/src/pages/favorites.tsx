import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart,
    Star,
    Calendar,
    Film,
    Sparkles,
    TrendingUp,
    Bell,
    BellOff,
    RefreshCw,
    ChevronRight,
    Loader2,
    Trash2,
    Eye,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useFavorites, useTasteProfile, useRecommendations } from '@/hooks/useFavorites';
import { TMDBService } from '@/services/TMDB-service';
import type { UserFavorite, MovieRecommendation, NotificationFrequency } from '@/types/favorites';

// ============================================
// TAB TYPES
// ============================================

type TabType = 'favorites' | 'taste' | 'recommendations';

// ============================================
// FAVORITE CARD COMPONENT
// ============================================

interface FavoriteCardProps {
    favorite: UserFavorite;
    onRemove: (id: string) => void;
    onView: (movieId: number) => void;
}

function FavoriteCard({ favorite, onRemove, onView }: FavoriteCardProps) {
    const posterUrl = TMDBService.getImageUrl(favorite.movie_poster_path, 'w342');

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="group relative"
        >
            <Card className="overflow-hidden bg-muted/50 border-border hover:border-[#FF6B35]/50 transition-all duration-300">
                <div className="relative aspect-[2/3]">
                    {posterUrl ? (
                        <img
                            src={posterUrl}
                            alt={favorite.movie_title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-muted to-card flex items-center justify-center">
                            <Film className="w-12 h-12 text-muted-foreground" />
                        </div>
                    )}

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    className="flex-1 bg-[#FF6B35] hover:bg-[#FF6B35]/80"
                                    onClick={() => onView(favorite.tmdb_movie_id)}
                                >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Ver Lore
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-500/50 text-red-500 hover:bg-red-500/20"
                                    onClick={() => onRemove(favorite.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Favorite badge */}
                    <div className="absolute top-2 right-2">
                        <div className="p-1.5 rounded-full bg-[#FF6B35]/90 backdrop-blur-sm">
                            <Heart className="w-4 h-4 text-foreground fill-white" />
                        </div>
                    </div>

                    {/* Rating badge */}
                    {favorite.vote_average && (
                        <div className="absolute top-2 left-2">
                            <Badge className="bg-[#FFD166]/90 text-black font-semibold">
                                <Star className="w-3 h-3 mr-1 fill-current" />
                                {favorite.vote_average.toFixed(1)}
                            </Badge>
                        </div>
                    )}
                </div>

                <div className="p-3">
                    <h3 className="font-semibold text-foreground truncate text-sm">
                        {favorite.movie_title}
                    </h3>
                    {favorite.release_year && (
                        <p className="text-xs text-muted-foreground mt-1">
                            {favorite.release_year}
                        </p>
                    )}
                    {favorite.genres && favorite.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {favorite.genres.slice(0, 2).map(genre => (
                                <Badge
                                    key={genre.id}
                                    variant="outline"
                                    className="text-[10px] border-border text-muted-foreground"
                                >
                                    {genre.name}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </Card>
        </motion.div>
    );
}

// ============================================
// RECOMMENDATION CARD COMPONENT
// ============================================

interface RecommendationCardProps {
    recommendation: MovieRecommendation;
    onView: (movieId: number) => void;
    onDismiss: (id: string) => void;
}

function RecommendationCard({ recommendation, onView, onDismiss }: RecommendationCardProps) {
    const posterUrl = TMDBService.getImageUrl(recommendation.movie_poster_path, 'w342');

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            <Card className="overflow-hidden bg-muted/50 border-border hover:border-[#4ECDC4]/50 transition-all duration-300">
                <div className="flex">
                    {/* Poster */}
                    <div className="w-24 flex-shrink-0">
                        {posterUrl ? (
                            <img
                                src={posterUrl}
                                alt={recommendation.movie_title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-muted to-card flex items-center justify-center min-h-[144px]">
                                <Film className="w-8 h-8 text-muted-foreground" />
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                                <h3 className="font-semibold text-foreground line-clamp-1">
                                    {recommendation.movie_title}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    {recommendation.release_date && (
                                        <span className="text-xs text-muted-foreground flex items-center">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {new Date(recommendation.release_date).toLocaleDateString('es-MX', {
                                                year: 'numeric',
                                                month: 'short'
                                            })}
                                        </span>
                                    )}
                                    {recommendation.vote_average && (
                                        <Badge className="bg-[#FFD166]/20 text-yellow-500 text-xs">
                                            <Star className="w-3 h-3 mr-1 fill-current" />
                                            {recommendation.vote_average.toFixed(1)}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Match score */}
                            <div className="flex flex-col items-center">
                                <div className="text-2xl font-bold text-teal-500">
                                    {recommendation.recommendation_score}%
                                </div>
                                <span className="text-[10px] text-muted-foreground">Match</span>
                            </div>
                        </div>

                        {/* Reason */}
                        {recommendation.recommendation_reason && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                {recommendation.recommendation_reason}
                            </p>
                        )}

                        {/* Genres */}
                        {recommendation.genres && recommendation.genres.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {recommendation.genres.slice(0, 3).map(genre => (
                                    <Badge
                                        key={genre.id}
                                        variant="outline"
                                        className="text-[10px] border-border text-muted-foreground"
                                    >
                                        {genre.name}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 mt-3">
                            <Button
                                size="sm"
                                className="flex-1 bg-[#4ECDC4] hover:bg-[#4ECDC4]/80 text-black"
                                onClick={() => onView(recommendation.tmdb_movie_id)}
                            >
                                <Sparkles className="w-4 h-4 mr-1" />
                                Generar Lore
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-muted-foreground hover:text-red-500"
                                onClick={() => onDismiss(recommendation.id)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}

// ============================================
// TASTE PROFILE COMPONENT
// ============================================

interface TasteProfileViewProps {
    profile: ReturnType<typeof useTasteProfile>;
}

function TasteProfileView({ profile }: TasteProfileViewProps) {
    const {
        profile: tasteProfile,
        topGenres,
        topFranchises,
        loading,
        updateSettings,
        refreshProfile
    } = profile;

    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refreshProfile();
        setIsRefreshing(false);
    };

    const handleNotificationToggle = async () => {
        if (!tasteProfile) return;
        await updateSettings({
            notification_enabled: !tasteProfile.notification_enabled
        });
    };

    const handleFrequencyChange = async (frequency: NotificationFrequency) => {
        await updateSettings({ notification_frequency: frequency });
    };

    if (loading && !tasteProfile) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (!tasteProfile) {
        return (
            <div className="text-center py-20">
                <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                    Aún no tienes un perfil de gustos
                </h3>
                <p className="text-muted-foreground mb-6">
                    Genera algunos análisis de lore para que podamos conocer tus preferencias
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Tu Perfil de Gustos</h2>
                    <p className="text-muted-foreground mt-1">
                        Basado en {tasteProfile.total_movies_analyzed} películas analizadas
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="border-border"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Actualizar
                </Button>
            </div>

            {/* Genre Preferences */}
            <Card className="p-6 bg-muted/50 border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <Film className="w-5 h-5 mr-2 text-primary" />
                    Géneros Favoritos
                </h3>
                <div className="space-y-3">
                    {topGenres.map((genre, index) => (
                        <div key={genre.name} className="flex items-center gap-3">
                            <span className="text-muted-foreground w-6">{index + 1}.</span>
                            <span className="text-foreground flex-1">{genre.name}</span>
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${genre.score}%` }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="h-full bg-gradient-to-r from-[#FF6B35] to-[#F7931E] rounded-full"
                                />
                            </div>
                            <span className="text-primary font-semibold w-12 text-right">
                                {genre.score}%
                            </span>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Franchise Preferences */}
            {topFranchises.length > 0 && (
                <Card className="p-6 bg-muted/50 border-border">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-teal-500" />
                        Sagas Favoritas
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {topFranchises.map((franchise) => (
                            <div
                                key={franchise.collection_id}
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                            >
                                <span className="text-foreground">{franchise.name}</span>
                                <Badge className="bg-[#4ECDC4]/20 text-teal-500">
                                    {franchise.score}%
                                </Badge>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Emotional Keywords */}
            {tasteProfile.emotional_keywords.length > 0 && (
                <Card className="p-6 bg-muted/50 border-border">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                        <Heart className="w-5 h-5 mr-2 text-red-500" />
                        Temas que te Emocionan
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {tasteProfile.emotional_keywords.map((keyword) => (
                            <Badge
                                key={keyword}
                                className="bg-red-500/20 text-red-400 capitalize"
                            >
                                {keyword}
                            </Badge>
                        ))}
                    </div>
                </Card>
            )}

            {/* Notification Settings */}
            <Card className="p-6 bg-muted/50 border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-yellow-500" />
                    Notificaciones de Recomendaciones
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-foreground">Recibir notificaciones</p>
                            <p className="text-sm text-muted-foreground">
                                Te avisaremos cuando haya películas que te puedan interesar
                            </p>
                        </div>
                        <Button
                            variant={tasteProfile.notification_enabled ? 'default' : 'outline'}
                            className={tasteProfile.notification_enabled
                                ? 'bg-[#4ECDC4] hover:bg-[#4ECDC4]/80'
                                : 'border-border'
                            }
                            onClick={handleNotificationToggle}
                        >
                            {tasteProfile.notification_enabled ? (
                                <>
                                    <Bell className="w-4 h-4 mr-2" />
                                    Activadas
                                </>
                            ) : (
                                <>
                                    <BellOff className="w-4 h-4 mr-2" />
                                    Desactivadas
                                </>
                            )}
                        </Button>
                    </div>

                    {tasteProfile.notification_enabled && (
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">Frecuencia</p>
                            <div className="flex gap-2">
                                {(['daily', 'weekly', 'monthly'] as NotificationFrequency[]).map((freq) => (
                                    <Button
                                        key={freq}
                                        size="sm"
                                        variant={tasteProfile.notification_frequency === freq ? 'default' : 'outline'}
                                        className={tasteProfile.notification_frequency === freq
                                            ? 'bg-[#FF6B35]'
                                            : 'border-border'
                                        }
                                        onClick={() => handleFrequencyChange(freq)}
                                    >
                                        {freq === 'daily' && 'Diario'}
                                        {freq === 'weekly' && 'Semanal'}
                                        {freq === 'monthly' && 'Mensual'}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}

// ============================================
// MAIN FAVORITES PAGE
// ============================================

export default function FavoritesPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('favorites');

    const favorites = useFavorites();
    const tasteProfile = useTasteProfile();
    const recommendations = useRecommendations();

    // Fetch data on mount
    useEffect(() => {
        favorites.fetchFavorites(true);
        tasteProfile.fetchProfile();
        recommendations.fetchRecommendations(true);
    }, []);

    const handleViewMovie = (movieId: number) => {
        navigate(`/movie/${movieId}`);
    };

    const handleRemoveFavorite = async (favoriteId: string) => {
        await favorites.removeFavorite(favoriteId);
    };

    const handleDismissRecommendation = async (recommendationId: string) => {
        await recommendations.dismiss(recommendationId);
    };

    const tabs = [
        { id: 'favorites' as TabType, label: 'Favoritos', icon: Heart, count: favorites.total },
        { id: 'taste' as TabType, label: 'Mi Perfil', icon: Sparkles },
        { id: 'recommendations' as TabType, label: 'Para Ti', icon: TrendingUp, count: recommendations.total }
    ];

    return (
        <div className="min-h-screen pt-20 pb-16">
            <div className="container mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                        Mis <span className="text-primary">Favoritos</span>
                    </h1>
                    <p className="text-muted-foreground">
                        Tus análisis guardados y recomendaciones personalizadas
                    </p>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {tabs.map((tab) => (
                        <Button
                            key={tab.id}
                            variant={activeTab === tab.id ? 'default' : 'outline'}
                            className={`flex items-center gap-2 ${activeTab === tab.id
                                ? 'bg-[#FF6B35] hover:bg-[#FF6B35]/80'
                                : 'border-border hover:bg-muted/50'
                                }`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <Badge
                                    className={`ml-1 ${activeTab === tab.id
                                        ? 'bg-white/20 text-foreground'
                                        : 'bg-[#FF6B35]/20 text-primary'
                                        }`}
                                >
                                    {tab.count}
                                </Badge>
                            )}
                        </Button>
                    ))}
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'favorites' && (
                        <motion.div
                            key="favorites"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            {favorites.loading && favorites.favorites.length === 0 ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                </div>
                            ) : favorites.favorites.length === 0 ? (
                                <div className="text-center py-20">
                                    <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-foreground mb-2">
                                        No tienes favoritos aún
                                    </h3>
                                    <p className="text-muted-foreground mb-6">
                                        Guarda tus análisis de lore favoritos para acceder a ellos rápidamente
                                    </p>
                                    <Button
                                        className="bg-[#FF6B35] hover:bg-[#FF6B35]/80"
                                        onClick={() => navigate('/home')}
                                    >
                                        Explorar Películas
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                        <AnimatePresence>
                                            {favorites.favorites.map((favorite) => (
                                                <FavoriteCard
                                                    key={favorite.id}
                                                    favorite={favorite}
                                                    onRemove={handleRemoveFavorite}
                                                    onView={handleViewMovie}
                                                />
                                            ))}
                                        </AnimatePresence>
                                    </div>

                                    {favorites.hasMore && (
                                        <div className="flex justify-center mt-8">
                                            <Button
                                                variant="outline"
                                                className="border-border"
                                                onClick={() => favorites.fetchFavorites()}
                                                disabled={favorites.loading}
                                            >
                                                {favorites.loading ? (
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                ) : null}
                                                Cargar más
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'taste' && (
                        <motion.div
                            key="taste"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <TasteProfileView profile={tasteProfile} />
                        </motion.div>
                    )}

                    {activeTab === 'recommendations' && (
                        <motion.div
                            key="recommendations"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            {recommendations.loading && recommendations.recommendations.length === 0 ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                                </div>
                            ) : recommendations.recommendations.length === 0 ? (
                                <div className="text-center py-20">
                                    <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-foreground mb-2">
                                        No hay recomendaciones aún
                                    </h3>
                                    <p className="text-muted-foreground mb-6">
                                        Genera más análisis de lore para que podamos recomendarte películas
                                    </p>
                                    <Button
                                        className="bg-[#4ECDC4] hover:bg-[#4ECDC4]/80 text-black"
                                        onClick={() => navigate('/home')}
                                    >
                                        Explorar Películas
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-4">
                                        <AnimatePresence>
                                            {recommendations.recommendations.map((rec) => (
                                                <RecommendationCard
                                                    key={rec.id}
                                                    recommendation={rec}
                                                    onView={handleViewMovie}
                                                    onDismiss={handleDismissRecommendation}
                                                />
                                            ))}
                                        </AnimatePresence>
                                    </div>

                                    {recommendations.hasMore && (
                                        <div className="flex justify-center mt-8">
                                            <Button
                                                variant="outline"
                                                className="border-border"
                                                onClick={() => recommendations.fetchRecommendations()}
                                                disabled={recommendations.loading}
                                            >
                                                {recommendations.loading ? (
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                ) : null}
                                                Cargar más
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

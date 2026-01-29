import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Calendar,
    Star,
    Loader2,
    Film,
    RefreshCw,
    Eye,
    Heart,
    Search,
    ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHistory } from "@/hooks/useHistory";
import { TMDBService } from "@/services/TMDB-service";

export default function HistoryPage() {
    const navigate = useNavigate();
    const { history, isLoading, error, total, refetch } = useHistory();
    const [searchQuery, setSearchQuery] = useState("");
    const [filterFavorites, setFilterFavorites] = useState(false);

    // Filter history based on search and favorites
    const filteredHistory = history.filter((analysis) => {
        const matchesSearch = analysis.movie_title
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesFavorites = !filterFavorites || analysis.is_favorite;
        return matchesSearch && matchesFavorites;
    });

    const handleRefresh = async () => {
        await refetch();
    };

    const handleMovieClick = (tmdbId: number) => {
        navigate(`/movie/${tmdbId}`);
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
                        <Loader2 className="w-8 h-8 text-foreground animate-spin" />
                    </div>
                    <p className="text-muted-foreground">Cargando historial...</p>
                </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <Button onClick={handleRefresh}>Reintentar</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-20 pb-16">
            <div className="container mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Volver</span>
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-foreground mb-2">
                                Mi Historial
                            </h1>
                            <p className="text-muted-foreground">
                                {total} {total === 1 ? "análisis" : "análisis"} generados
                            </p>
                        </div>

                        <Button
                            onClick={handleRefresh}
                            variant="outline"
                            className="border-border hover:bg-muted/50"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Actualizar
                        </Button>
                    </div>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8 flex flex-col md:flex-row gap-4"
                >
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Buscar películas..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                        />
                    </div>

                    {/* Filter Favorites */}
                    <Button
                        onClick={() => setFilterFavorites(!filterFavorites)}
                        variant={filterFavorites ? "default" : "outline"}
                        className={
                            filterFavorites
                                ? "bg-[#FF6B35] hover:bg-[#FF6B35]/90"
                                : "border-border hover:bg-muted/50"
                        }
                    >
                        <Heart
                            className={`w-4 h-4 mr-2 ${filterFavorites ? "fill-white" : ""}`}
                        />
                        Favoritos
                    </Button>
                </motion.div>

                {/* Empty State */}
                {filteredHistory.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-center py-16"
                    >
                        <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-muted/50 flex items-center justify-center">
                            <Film className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                            {searchQuery || filterFavorites
                                ? "No se encontraron resultados"
                                : "No hay análisis aún"}
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            {searchQuery || filterFavorites
                                ? "Intenta con otros términos de búsqueda"
                                : "Comienza analizando tu primera película"}
                        </p>
                        {!searchQuery && !filterFavorites && (
                            <Button
                                onClick={() => navigate("/")}
                                className="bg-gradient-to-r from-[#FF6B35] to-[#F7931E]"
                            >
                                Explorar Películas
                            </Button>
                        )}
                    </motion.div>
                )}

                {/* History Grid */}
                {filteredHistory.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredHistory.map((analysis, index) => (
                            <HistoryCard
                                key={analysis.id}
                                analysis={analysis}
                                index={index}
                                onClick={() => handleMovieClick(analysis.tmdb_movie_id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// History Card Component
interface HistoryCardProps {
    analysis: {
        id: string;
        tmdb_movie_id: number;
        movie_title: string;
        movie_poster_path: string | null;
        is_favorite: boolean;
        user_rating: number | null;
        created_at: string;
    };
    index: number;
    onClick: () => void;
}

function HistoryCard({ analysis, index, onClick }: HistoryCardProps) {
    const posterUrl = TMDBService.getImageUrl(
        analysis.movie_poster_path,
        "w500"
    );

    const createdDate = new Date(analysis.created_at).toLocaleDateString(
        "es-MX",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
        }
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            onClick={onClick}
            className="group cursor-pointer"
        >
            <div className="relative rounded-2xl overflow-hidden bg-muted/50 border border-border hover:border-border transition-all">
                {/* Poster */}
                <div className="relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-[#FF6B35]/20 to-[#4ECDC4]/20">
                    {posterUrl ? (
                        <img
                            src={posterUrl}
                            alt={analysis.movie_title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Film className="w-16 h-16 text-muted-foreground" />
                        </div>
                    )}

                    {/* Favorite Badge */}
                    {analysis.is_favorite && (
                        <div className="absolute top-3 right-3">
                            <div className="w-10 h-10 rounded-full bg-red-500/90 backdrop-blur-sm flex items-center justify-center">
                                <Heart className="w-5 h-5 fill-white text-foreground" />
                            </div>
                        </div>
                    )}

                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="flex items-center gap-2 text-foreground">
                            <Eye className="w-5 h-5" />
                            <span className="font-semibold">Ver Lore</span>
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="p-4">
                    <h3 className="text-foreground font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {analysis.movie_title}
                    </h3>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Calendar className="w-4 h-4" />
                        <span>{createdDate}</span>
                    </div>

                    {/* Rating */}
                    {analysis.user_rating && (
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-4 h-4 ${star <= analysis.user_rating!
                                        ? "fill-yellow-500 text-yellow-500"
                                        : "text-muted-foreground"
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
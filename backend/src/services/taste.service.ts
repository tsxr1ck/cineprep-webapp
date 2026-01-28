// Taste Algorithm Service
// Analyzes user's lore generation history to build taste profile and generate recommendations

import { Pool } from 'pg';
import type {
    UserTasteProfile,
    GenrePreference,
    DecadePreference,
    FranchisePreference,
    TonePreference,
    MovieRecommendation,
    Genre
} from '../types';

// ============================================
// CONFIGURATION
// ============================================

const GENRE_WEIGHT = 0.35;
const FRANCHISE_WEIGHT = 0.25;
const DECADE_WEIGHT = 0.15;
const TONE_WEIGHT = 0.15;
const RATING_WEIGHT = 0.10;

// Decay factor for older analyses (more recent = more weight)
const TIME_DECAY_FACTOR = 0.95;

// Minimum analyses needed for reliable recommendations
const MIN_ANALYSES_FOR_RECOMMENDATIONS = 3;

// ============================================
// TASTE PROFILE CALCULATION
// ============================================

interface AnalysisData {
    tmdb_movie_id: number;
    movie_title: string;
    analysis_data: {
        required_movies?: Array<{
            summary?: {
                tone?: string;
                emotional_beats?: string[];
            };
        }>;
    };
    genres: Genre[];
    vote_average: number;
    release_year: number;
    collection_id: number | null;
    collection_name: string | null;
    created_at: string;
}

/**
 * Calculate genre preferences from user's analysis history
 */
function calculateGenrePreferences(analyses: AnalysisData[]): GenrePreference {
    const genreCounts: Record<string, number> = {};
    const genreWeights: Record<string, number> = {};
    let totalWeight = 0;

    analyses.forEach((analysis, index) => {
        // Apply time decay - more recent analyses have more weight
        const weight = Math.pow(TIME_DECAY_FACTOR, analyses.length - 1 - index);
        totalWeight += weight;

        if (analysis.genres && Array.isArray(analysis.genres)) {
            analysis.genres.forEach((genre) => {
                const genreName = genre.name;
                genreCounts[genreName] = (genreCounts[genreName] || 0) + 1;
                genreWeights[genreName] = (genreWeights[genreName] || 0) + weight;
            });
        }
    });

    // Normalize to 0-100 scale
    const preferences: GenrePreference = {};
    const maxWeight = Math.max(...Object.values(genreWeights), 1);

    Object.entries(genreWeights).forEach(([genre, weight]) => {
        preferences[genre] = Math.round((weight / maxWeight) * 100);
    });

    return preferences;
}

/**
 * Calculate decade preferences from user's analysis history
 */
function calculateDecadePreferences(analyses: AnalysisData[]): DecadePreference {
    const decadeCounts: Record<string, number> = {};
    const decadeWeights: Record<string, number> = {};

    analyses.forEach((analysis, index) => {
        if (analysis.release_year) {
            const decade = `${Math.floor(analysis.release_year / 10) * 10}s`;
            const weight = Math.pow(TIME_DECAY_FACTOR, analyses.length - 1 - index);

            decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
            decadeWeights[decade] = (decadeWeights[decade] || 0) + weight;
        }
    });

    // Normalize to 0-100 scale
    const preferences: DecadePreference = {};
    const maxWeight = Math.max(...Object.values(decadeWeights), 1);

    Object.entries(decadeWeights).forEach(([decade, weight]) => {
        preferences[decade] = Math.round((weight / maxWeight) * 100);
    });

    return preferences;
}

/**
 * Calculate franchise/collection preferences
 */
function calculateFranchisePreferences(analyses: AnalysisData[]): FranchisePreference[] {
    const franchiseData: Record<number, { name: string; count: number; weight: number }> = {};

    analyses.forEach((analysis, index) => {
        if (analysis.collection_id && analysis.collection_name) {
            const weight = Math.pow(TIME_DECAY_FACTOR, analyses.length - 1 - index);

            if (!franchiseData[analysis.collection_id]) {
                franchiseData[analysis.collection_id] = {
                    name: analysis.collection_name,
                    count: 0,
                    weight: 0
                };
            }

            franchiseData[analysis.collection_id].count += 1;
            franchiseData[analysis.collection_id].weight += weight;
        }
    });

    // Convert to array and normalize scores
    const maxWeight = Math.max(...Object.values(franchiseData).map(f => f.weight), 1);

    return Object.entries(franchiseData)
        .map(([id, data]) => ({
            collection_id: parseInt(id),
            name: data.name,
            score: Math.round((data.weight / maxWeight) * 100)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); // Keep top 10 franchises
}

/**
 * Extract tone preferences from lore analysis data
 */
function calculateTonePreferences(analyses: AnalysisData[]): TonePreference {
    const toneCounts: Record<string, number> = {};

    analyses.forEach((analysis) => {
        if (analysis.analysis_data?.required_movies) {
            analysis.analysis_data.required_movies.forEach((movie) => {
                if (movie.summary?.tone) {
                    // Split tone string (e.g., "epic, dark, mysterious")
                    const tones = movie.summary.tone.split(',').map(t => t.trim().toLowerCase());
                    tones.forEach(tone => {
                        if (tone) {
                            toneCounts[tone] = (toneCounts[tone] || 0) + 1;
                        }
                    });
                }
            });
        }
    });

    // Normalize to 0-100 scale
    const preferences: TonePreference = {};
    const maxCount = Math.max(...Object.values(toneCounts), 1);

    Object.entries(toneCounts).forEach(([tone, count]) => {
        preferences[tone] = Math.round((count / maxCount) * 100);
    });

    return preferences;
}

/**
 * Extract emotional keywords from analysis data
 */
function extractEmotionalKeywords(analyses: AnalysisData[]): string[] {
    const keywordCounts: Record<string, number> = {};

    analyses.forEach((analysis) => {
        if (analysis.analysis_data?.required_movies) {
            analysis.analysis_data.required_movies.forEach((movie) => {
                if (movie.summary?.emotional_beats) {
                    movie.summary.emotional_beats.forEach((beat) => {
                        // Extract keywords from emotional beats
                        // Remove emojis and extract meaningful words
                        const cleanBeat = beat.replace(/[\u{1F600}-\u{1F64F}]/gu, '')
                            .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
                            .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
                            .replace(/[\u{2600}-\u{26FF}]/gu, '')
                            .toLowerCase();

                        // Extract key emotional words
                        const emotionalWords = [
                            'sacrifice', 'redemption', 'love', 'betrayal', 'hope',
                            'revenge', 'friendship', 'loss', 'victory', 'adventure',
                            'mystery', 'discovery', 'transformation', 'courage', 'fear',
                            'joy', 'sorrow', 'anger', 'peace', 'conflict'
                        ];

                        emotionalWords.forEach(word => {
                            if (cleanBeat.includes(word)) {
                                keywordCounts[word] = (keywordCounts[word] || 0) + 1;
                            }
                        });
                    });
                }
            });
        }
    });

    // Return top keywords sorted by frequency
    return Object.entries(keywordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([keyword]) => keyword);
}

/**
 * Calculate average movie rating from analyses
 */
function calculateAverageRating(analyses: AnalysisData[]): number {
    const ratings = analyses
        .filter(a => a.vote_average && a.vote_average > 0)
        .map(a => a.vote_average);

    if (ratings.length === 0) return 0;

    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
}

// ============================================
// RECOMMENDATION SCORING
// ============================================

interface UpcomingMovie {
    tmdb_movie_id: number;
    movie_title: string;
    movie_poster_path: string | null;
    movie_backdrop_path: string | null;
    release_date: string;
    vote_average: number;
    genres: Genre[];
    overview: string;
    collection_id: number | null;
    collection_name: string | null;
}

/**
 * Calculate recommendation score for a movie based on user's taste profile
 */
function calculateRecommendationScore(
    movie: UpcomingMovie,
    profile: UserTasteProfile
): { score: number; factors: MovieRecommendation['matching_factors']; reason: string } {
    let totalScore = 0;
    const factors: MovieRecommendation['matching_factors'] = {};
    const reasons: string[] = [];

    // Genre matching
    if (movie.genres && movie.genres.length > 0) {
        let genreScore = 0;
        let matchedGenres: string[] = [];

        movie.genres.forEach(genre => {
            const preference = profile.genre_preferences[genre.name] || 0;
            if (preference > 0) {
                genreScore += preference;
                if (preference >= 50) {
                    matchedGenres.push(genre.name);
                }
            }
        });

        genreScore = Math.min(100, genreScore / movie.genres.length);
        factors.genre_match = Math.round(genreScore);
        totalScore += genreScore * GENRE_WEIGHT;

        if (matchedGenres.length > 0) {
            reasons.push(`Matches your favorite genres: ${matchedGenres.slice(0, 3).join(', ')}`);
        }
    }

    // Franchise matching
    if (movie.collection_id) {
        const franchiseMatch = profile.franchise_preferences.find(
            f => f.collection_id === movie.collection_id
        );

        if (franchiseMatch) {
            factors.franchise_match = franchiseMatch.score;
            totalScore += franchiseMatch.score * FRANCHISE_WEIGHT;
            reasons.push(`Part of ${franchiseMatch.name} franchise you love`);
        }
    }

    // Decade matching
    if (movie.release_date) {
        const releaseYear = new Date(movie.release_date).getFullYear();
        const decade = `${Math.floor(releaseYear / 10) * 10}s`;
        const decadePreference = profile.decade_preferences[decade] || 0;

        factors.decade_match = decadePreference;
        totalScore += decadePreference * DECADE_WEIGHT;
    }

    // Rating alignment (prefer movies with similar ratings to user's average)
    if (movie.vote_average && profile.avg_movie_rating > 0) {
        const ratingDiff = Math.abs(movie.vote_average - profile.avg_movie_rating);
        const ratingScore = Math.max(0, 100 - (ratingDiff * 15));
        totalScore += ratingScore * RATING_WEIGHT;
    }

    // Generate recommendation reason
    const reason = reasons.length > 0
        ? reasons.join('. ')
        : 'Based on your viewing preferences';

    return {
        score: Math.round(totalScore),
        factors,
        reason
    };
}

// ============================================
// MAIN SERVICE CLASS
// ============================================

export class TasteService {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    /**
     * Update user's taste profile based on their analysis history
     */
    async updateTasteProfile(userId: string): Promise<UserTasteProfile | null> {
        try {
            // Fetch user's analysis history with movie details
            const analysesQuery = `
                SELECT 
                    ua.tmdb_movie_id,
                    ua.movie_title,
                    ua.analysis_data,
                    ua.created_at,
                    lc.tmdb_collection_id as collection_id,
                    lc.collection_name
                FROM user_analyses ua
                LEFT JOIN lore_cache lc ON ua.lore_cache_id = lc.id
                WHERE ua.user_id = $1
                ORDER BY ua.created_at DESC
                LIMIT 100;
            `;

            const analysesResult = await this.pool.query(analysesQuery, [userId]);

            if (analysesResult.rows.length === 0) {
                return null;
            }

            // Fetch additional movie data from TMDB cache or external source
            // For now, we'll use the data we have
            const analyses: AnalysisData[] = analysesResult.rows.map(row => ({
                tmdb_movie_id: row.tmdb_movie_id,
                movie_title: row.movie_title,
                analysis_data: row.analysis_data || {},
                genres: row.genres || [],
                vote_average: row.vote_average || 0,
                release_year: row.release_year || new Date(row.created_at).getFullYear(),
                collection_id: row.collection_id,
                collection_name: row.collection_name,
                created_at: row.created_at
            }));

            // Calculate preferences
            const genrePreferences = calculateGenrePreferences(analyses);
            const decadePreferences = calculateDecadePreferences(analyses);
            const franchisePreferences = calculateFranchisePreferences(analyses);
            const tonePreferences = calculateTonePreferences(analyses);
            const emotionalKeywords = extractEmotionalKeywords(analyses);
            const avgRating = calculateAverageRating(analyses);

            // Upsert taste profile
            const upsertQuery = `
                INSERT INTO user_taste_profile (
                    user_id,
                    genre_preferences,
                    decade_preferences,
                    franchise_preferences,
                    tone_preferences,
                    emotional_keywords,
                    avg_movie_rating,
                    total_movies_analyzed,
                    updated_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
                ON CONFLICT (user_id) DO UPDATE SET
                    genre_preferences = $2,
                    decade_preferences = $3,
                    franchise_preferences = $4,
                    tone_preferences = $5,
                    emotional_keywords = $6,
                    avg_movie_rating = $7,
                    total_movies_analyzed = $8,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING *;
            `;

            const result = await this.pool.query(upsertQuery, [
                userId,
                JSON.stringify(genrePreferences),
                JSON.stringify(decadePreferences),
                JSON.stringify(franchisePreferences),
                JSON.stringify(tonePreferences),
                JSON.stringify(emotionalKeywords),
                avgRating,
                analyses.length
            ]);

            return result.rows[0] as UserTasteProfile;

        } catch (error) {
            console.error('Error updating taste profile:', error);
            throw error;
        }
    }

    /**
     * Get user's taste profile
     */
    async getTasteProfile(userId: string): Promise<UserTasteProfile | null> {
        try {
            const query = `
                SELECT * FROM user_taste_profile
                WHERE user_id = $1;
            `;

            const result = await this.pool.query(query, [userId]);

            if (result.rows.length === 0) {
                // Try to generate profile if it doesn't exist
                return await this.updateTasteProfile(userId);
            }

            return result.rows[0] as UserTasteProfile;

        } catch (error) {
            console.error('Error getting taste profile:', error);
            throw error;
        }
    }

    /**
     * Generate movie recommendations for a user
     */
    async generateRecommendations(
        userId: string,
        upcomingMovies: UpcomingMovie[]
    ): Promise<MovieRecommendation[]> {
        try {
            const profile = await this.getTasteProfile(userId);

            if (!profile || profile.total_movies_analyzed < MIN_ANALYSES_FOR_RECOMMENDATIONS) {
                console.log(`User ${userId} doesn't have enough analyses for recommendations`);
                return [];
            }

            // Get movies user has already analyzed (to exclude)
            const analyzedQuery = `
                SELECT DISTINCT tmdb_movie_id FROM user_analyses WHERE user_id = $1;
            `;
            const analyzedResult = await this.pool.query(analyzedQuery, [userId]);
            const analyzedMovieIds = new Set(analyzedResult.rows.map(r => r.tmdb_movie_id));

            // Score and filter movies
            const recommendations: MovieRecommendation[] = [];

            for (const movie of upcomingMovies) {
                // Skip already analyzed movies
                if (analyzedMovieIds.has(movie.tmdb_movie_id)) {
                    continue;
                }

                const { score, factors, reason } = calculateRecommendationScore(movie, profile);

                // Only recommend movies with score >= 40
                if (score >= 40) {
                    recommendations.push({
                        id: '', // Will be set by database
                        user_id: userId,
                        tmdb_movie_id: movie.tmdb_movie_id,
                        movie_title: movie.movie_title,
                        movie_poster_path: movie.movie_poster_path,
                        movie_backdrop_path: movie.movie_backdrop_path,
                        release_date: movie.release_date,
                        vote_average: movie.vote_average,
                        genres: movie.genres,
                        overview: movie.overview,
                        recommendation_score: score,
                        recommendation_reason: reason,
                        matching_factors: factors,
                        status: 'pending',
                        notification_sent_at: null,
                        viewed_at: null,
                        created_at: new Date().toISOString()
                    });
                }
            }

            // Sort by score and take top recommendations
            recommendations.sort((a, b) => b.recommendation_score - a.recommendation_score);
            const topRecommendations = recommendations.slice(0, 20);

            // Save recommendations to database
            for (const rec of topRecommendations) {
                const insertQuery = `
                    INSERT INTO movie_recommendations (
                        user_id,
                        tmdb_movie_id,
                        movie_title,
                        movie_poster_path,
                        movie_backdrop_path,
                        release_date,
                        vote_average,
                        genres,
                        overview,
                        recommendation_score,
                        recommendation_reason,
                        matching_factors
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                    ON CONFLICT (user_id, tmdb_movie_id) DO UPDATE SET
                        recommendation_score = $10,
                        recommendation_reason = $11,
                        matching_factors = $12,
                        created_at = CURRENT_TIMESTAMP
                    RETURNING id;
                `;

                const result = await this.pool.query(insertQuery, [
                    rec.user_id,
                    rec.tmdb_movie_id,
                    rec.movie_title,
                    rec.movie_poster_path,
                    rec.movie_backdrop_path,
                    rec.release_date,
                    rec.vote_average,
                    JSON.stringify(rec.genres),
                    rec.overview,
                    rec.recommendation_score,
                    rec.recommendation_reason,
                    JSON.stringify(rec.matching_factors)
                ]);

                rec.id = result.rows[0].id;
            }

            return topRecommendations;

        } catch (error) {
            console.error('Error generating recommendations:', error);
            throw error;
        }
    }

    /**
     * Get user's existing recommendations
     */
    async getRecommendations(
        userId: string,
        limit: number = 10,
        offset: number = 0
    ): Promise<{ recommendations: MovieRecommendation[]; total: number }> {
        try {
            const query = `
                SELECT * FROM movie_recommendations
                WHERE user_id = $1
                  AND status IN ('pending', 'sent')
                ORDER BY recommendation_score DESC
                LIMIT $2 OFFSET $3;
            `;

            const countQuery = `
                SELECT COUNT(*) FROM movie_recommendations
                WHERE user_id = $1
                  AND status IN ('pending', 'sent');
            `;

            const [result, countResult] = await Promise.all([
                this.pool.query(query, [userId, limit, offset]),
                this.pool.query(countQuery, [userId])
            ]);

            return {
                recommendations: result.rows as MovieRecommendation[],
                total: parseInt(countResult.rows[0].count)
            };

        } catch (error) {
            console.error('Error getting recommendations:', error);
            throw error;
        }
    }

    /**
     * Mark recommendation as viewed
     */
    async markRecommendationViewed(userId: string, recommendationId: string): Promise<void> {
        try {
            await this.pool.query(`
                UPDATE movie_recommendations
                SET status = 'viewed', viewed_at = CURRENT_TIMESTAMP
                WHERE id = $1 AND user_id = $2;
            `, [recommendationId, userId]);

        } catch (error) {
            console.error('Error marking recommendation as viewed:', error);
            throw error;
        }
    }

    /**
     * Dismiss a recommendation
     */
    async dismissRecommendation(userId: string, recommendationId: string): Promise<void> {
        try {
            await this.pool.query(`
                UPDATE movie_recommendations
                SET status = 'dismissed'
                WHERE id = $1 AND user_id = $2;
            `, [recommendationId, userId]);

        } catch (error) {
            console.error('Error dismissing recommendation:', error);
            throw error;
        }
    }

    /**
     * Mark recommendation as converted (user generated lore for it)
     */
    async markRecommendationConverted(userId: string, tmdbMovieId: number): Promise<void> {
        try {
            await this.pool.query(`
                UPDATE movie_recommendations
                SET status = 'converted'
                WHERE user_id = $1 AND tmdb_movie_id = $2;
            `, [userId, tmdbMovieId]);

        } catch (error) {
            console.error('Error marking recommendation as converted:', error);
            throw error;
        }
    }
}

export default TasteService;

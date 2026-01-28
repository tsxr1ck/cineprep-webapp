-- ============================================
-- Migration: Favorites and User Taste Profile
-- Description: Creates tables for user favorites and taste-based recommendations
-- ============================================

-- ============================================
-- TABLE: user_favorites
-- Stores user's favorite lore analyses
-- ============================================

CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_analysis_id UUID NOT NULL REFERENCES user_analyses(id) ON DELETE CASCADE,
    tmdb_movie_id INTEGER NOT NULL,
    movie_title VARCHAR(500) NOT NULL,
    movie_poster_path VARCHAR(500),
    
    -- Additional metadata for quick access
    genres JSONB DEFAULT '[]'::jsonb,
    vote_average DECIMAL(3, 1),
    release_year INTEGER,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(user_id, user_analysis_id)
);

-- Indexes for user_favorites
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_tmdb_movie_id ON user_favorites(tmdb_movie_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON user_favorites(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_favorites_genres ON user_favorites USING GIN(genres);

-- ============================================
-- TABLE: user_taste_profile
-- Stores computed taste preferences based on user's generated lores
-- ============================================

CREATE TABLE IF NOT EXISTS user_taste_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Genre preferences (weighted scores 0-100)
    genre_preferences JSONB DEFAULT '{}'::jsonb,
    -- Example: {"Action": 85, "Sci-Fi": 72, "Drama": 45}
    
    -- Decade preferences (weighted scores 0-100)
    decade_preferences JSONB DEFAULT '{}'::jsonb,
    -- Example: {"2020s": 90, "2010s": 75, "2000s": 50}
    
    -- Collection/Franchise affinity
    franchise_preferences JSONB DEFAULT '[]'::jsonb,
    -- Example: [{"collection_id": 10, "name": "Star Wars", "score": 95}]
    
    -- Tone preferences (based on lore analysis)
    tone_preferences JSONB DEFAULT '{}'::jsonb,
    -- Example: {"epic": 80, "dark": 65, "comedic": 30}
    
    -- Average rating of movies user generates lore for
    avg_movie_rating DECIMAL(3, 1) DEFAULT 0,
    
    -- Total movies analyzed (for weighting calculations)
    total_movies_analyzed INTEGER DEFAULT 0,
    
    -- Keywords extracted from emotional beats
    emotional_keywords JSONB DEFAULT '[]'::jsonb,
    -- Example: ["redemption", "sacrifice", "adventure"]
    
    -- Notification preferences
    notification_enabled BOOLEAN DEFAULT true,
    notification_frequency VARCHAR(20) DEFAULT 'weekly',
    -- Options: 'daily', 'weekly', 'monthly', 'never'
    
    -- Last recommendation sent
    last_recommendation_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(user_id)
);

-- Indexes for user_taste_profile
CREATE INDEX IF NOT EXISTS idx_user_taste_profile_user_id ON user_taste_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_user_taste_profile_notification ON user_taste_profile(notification_enabled, notification_frequency);
CREATE INDEX IF NOT EXISTS idx_user_taste_profile_genre_prefs ON user_taste_profile USING GIN(genre_preferences);

-- ============================================
-- TABLE: movie_recommendations
-- Stores generated recommendations for users
-- ============================================

CREATE TABLE IF NOT EXISTS movie_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Movie data from TMDB
    tmdb_movie_id INTEGER NOT NULL,
    movie_title VARCHAR(500) NOT NULL,
    movie_poster_path VARCHAR(500),
    movie_backdrop_path VARCHAR(500),
    release_date DATE,
    vote_average DECIMAL(3, 1),
    genres JSONB DEFAULT '[]'::jsonb,
    overview TEXT,
    
    -- Recommendation metadata
    recommendation_score DECIMAL(5, 2) NOT NULL,
    -- Score 0-100 based on taste matching
    
    recommendation_reason TEXT,
    -- Human-readable explanation
    
    matching_factors JSONB DEFAULT '{}'::jsonb,
    -- Example: {"genre_match": 85, "franchise_match": 100, "tone_match": 70}
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending',
    -- Options: 'pending', 'sent', 'viewed', 'dismissed', 'converted'
    
    notification_sent_at TIMESTAMP WITH TIME ZONE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(user_id, tmdb_movie_id)
);

-- Indexes for movie_recommendations
CREATE INDEX IF NOT EXISTS idx_movie_recommendations_user_id ON movie_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_movie_recommendations_status ON movie_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_movie_recommendations_score ON movie_recommendations(recommendation_score DESC);
CREATE INDEX IF NOT EXISTS idx_movie_recommendations_release ON movie_recommendations(release_date);

-- ============================================
-- TABLE: notification_queue
-- Queue for pending notifications
-- ============================================

CREATE TABLE IF NOT EXISTS notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification type
    notification_type VARCHAR(50) NOT NULL,
    -- Options: 'movie_recommendation', 'new_release', 'franchise_update'
    
    -- Notification content
    title VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    -- Additional data for deep linking
    
    -- Delivery channels
    channels JSONB DEFAULT '["push", "email"]'::jsonb,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    -- Options: 'pending', 'processing', 'sent', 'failed'
    
    -- Scheduling
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Error tracking
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for notification_queue
CREATE INDEX IF NOT EXISTS idx_notification_queue_user_id ON notification_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled ON notification_queue(scheduled_for) WHERE status = 'pending';

-- ============================================
-- TABLE: user_notification_tokens
-- Stores FCM/Push notification tokens
-- ============================================

CREATE TABLE IF NOT EXISTS user_notification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Token data
    token VARCHAR(500) NOT NULL,
    platform VARCHAR(20) NOT NULL,
    -- Options: 'web', 'ios', 'android'
    
    -- Device info
    device_name VARCHAR(200),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(user_id, token)
);

-- Indexes for user_notification_tokens
CREATE INDEX IF NOT EXISTS idx_user_notification_tokens_user_id ON user_notification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notification_tokens_active ON user_notification_tokens(is_active) WHERE is_active = true;

-- ============================================
-- FUNCTION: Update taste profile on new analysis
-- Trigger function to update user taste profile
-- ============================================

CREATE OR REPLACE FUNCTION update_user_taste_profile()
RETURNS TRIGGER AS $$
DECLARE
    movie_genres JSONB;
    movie_year INTEGER;
    current_prefs JSONB;
    genre_name TEXT;
    genre_score DECIMAL;
BEGIN
    -- Only process if we have analysis data
    IF NEW.analysis_data IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Ensure user has a taste profile
    INSERT INTO user_taste_profile (user_id)
    VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Update total movies analyzed
    UPDATE user_taste_profile
    SET 
        total_movies_analyzed = total_movies_analyzed + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for taste profile updates
DROP TRIGGER IF EXISTS trigger_update_taste_profile ON user_analyses;
CREATE TRIGGER trigger_update_taste_profile
    AFTER INSERT ON user_analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_user_taste_profile();

-- ============================================
-- FUNCTION: Get personalized recommendations
-- Returns movies matching user's taste profile
-- ============================================

CREATE OR REPLACE FUNCTION get_user_recommendations(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    tmdb_movie_id INTEGER,
    movie_title VARCHAR,
    recommendation_score DECIMAL,
    recommendation_reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mr.tmdb_movie_id,
        mr.movie_title,
        mr.recommendation_score,
        mr.recommendation_reason
    FROM movie_recommendations mr
    WHERE mr.user_id = p_user_id
      AND mr.status IN ('pending', 'sent')
    ORDER BY mr.recommendation_score DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Add is_favorite column to user_analyses if not exists
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_analyses' AND column_name = 'is_favorite'
    ) THEN
        ALTER TABLE user_analyses ADD COLUMN is_favorite BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_analyses' AND column_name = 'user_rating'
    ) THEN
        ALTER TABLE user_analyses ADD COLUMN user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5);
    END IF;
END $$;

-- Create index for favorites lookup
CREATE INDEX IF NOT EXISTS idx_user_analyses_favorites ON user_analyses(user_id, is_favorite) WHERE is_favorite = true;

-- ============================================
-- Grant permissions (adjust based on your setup)
-- ============================================

-- For Supabase, you might need to grant permissions to authenticated users
-- GRANT SELECT, INSERT, UPDATE, DELETE ON user_favorites TO authenticated;
-- GRANT SELECT, UPDATE ON user_taste_profile TO authenticated;
-- GRANT SELECT ON movie_recommendations TO authenticated;

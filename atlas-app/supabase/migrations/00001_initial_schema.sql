-- ATLAS Database Schema Migration
-- Enables PostGIS, creates all tables, indexes, and Row Level Security policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================
-- CATEGORIES (predefined + user-custom)
-- ============================================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  icon TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(slug, user_id)
);

-- Seed default categories
INSERT INTO categories (name, slug, icon, is_default) VALUES
  ('Adventure', 'adventure', '🏔️', true),
  ('Nature', 'nature', '🌿', true),
  ('Food & Dining', 'food-dining', '🍽️', true),
  ('Travel', 'travel', '✈️', true),
  ('Sports', 'sports', '⚽', true),
  ('Entertainment', 'entertainment', '🎭', true),
  ('Culture', 'culture', '🏛️', true),
  ('Architecture', 'architecture', '🏗️', true),
  ('Technology', 'technology', '💻', true),
  ('Events', 'events', '🎉', true),
  ('Education', 'education', '📚', true),
  ('Wildlife', 'wildlife', '🦁', true),
  ('Photography', 'photography', '📷', true),
  ('Personal Milestones', 'personal-milestones', '⭐', true),
  ('Other', 'other', '📌', true);

-- ============================================================
-- LOCATIONS (unique geographical identities)
-- ============================================================
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  city TEXT,
  country TEXT NOT NULL,
  venue TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  geog GEOGRAPHY(Point, 4326) GENERATED ALWAYS AS (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
  ) STORED,
  place_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_locations_geog ON locations USING GIST(geog);
CREATE INDEX idx_locations_country ON locations(country);
CREATE INDEX idx_locations_place_id ON locations(place_id);

-- ============================================================
-- EXPERIENCES
-- ============================================================
CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  rating NUMERIC(2,1) CHECK (rating >= 0.5 AND rating <= 5.0),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  privacy TEXT NOT NULL DEFAULT 'private' CHECK (privacy IN ('private', 'unlisted', 'public')),
  notes TEXT,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_experiences_user ON experiences(user_id);
CREATE INDEX idx_experiences_location ON experiences(location_id);
CREATE INDEX idx_experiences_date ON experiences(date DESC);
CREATE INDEX idx_experiences_category ON experiences(category_id);
CREATE INDEX idx_experiences_rating ON experiences(rating DESC);

-- ============================================================
-- EXPERIENCE MEDIA (photographs and videos)
-- ============================================================
CREATE TABLE experience_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  exif_data JSONB,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_media_experience ON experience_media(experience_id);
CREATE INDEX idx_media_user ON experience_media(user_id);

-- ============================================================
-- TAGS
-- ============================================================
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(name, user_id)
);

CREATE INDEX idx_tags_user ON tags(user_id);

-- ============================================================
-- EXPERIENCE TAGS (junction)
-- ============================================================
CREATE TABLE experience_tags (
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (experience_id, tag_id)
);

-- ============================================================
-- WISHLIST ITEMS
-- ============================================================
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  estimated_budget NUMERIC(10,2),
  notes TEXT,
  source TEXT,
  reference_image_url TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_experience_id UUID REFERENCES experiences(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wishlist_user ON wishlist_items(user_id);
CREATE INDEX idx_wishlist_priority ON wishlist_items(priority);

-- ============================================================
-- AI RECOMMENDATIONS
-- ============================================================
CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location_name TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  category TEXT,
  reason TEXT NOT NULL,
  external_url TEXT,
  image_url TEXT,
  distance_km NUMERIC(10,2),
  mode TEXT NOT NULL CHECK (mode IN ('next_experience', 'nearby', 'bucket_list', 'destination')),
  is_saved BOOLEAN NOT NULL DEFAULT false,
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_recommendations_user ON ai_recommendations(user_id);

-- ============================================================
-- USER PREFERENCES
-- ============================================================
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  favorite_categories TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  preferred_distance_km INTEGER DEFAULT 50,
  travel_budget TEXT CHECK (travel_budget IN ('budget', 'moderate', 'luxury')),
  home_latitude DOUBLE PRECISION,
  home_longitude DOUBLE PRECISION,
  ai_personalization BOOLEAN NOT NULL DEFAULT true,
  location_permission BOOLEAN NOT NULL DEFAULT false,
  default_privacy TEXT NOT NULL DEFAULT 'private' CHECK (default_privacy IN ('private', 'unlisted', 'public')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- CONNECTED ACCOUNTS (Google Drive etc.)
-- ============================================================
CREATE TABLE connected_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- ============================================================
-- USER PROFILES (materialized from auth.users)
-- ============================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Categories: everyone can read defaults, users can manage their own
CREATE POLICY "Anyone can read default categories"
  ON categories FOR SELECT
  USING (is_default = true);

CREATE POLICY "Users can read own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_default = false);

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id AND is_default = false);

CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id AND is_default = false);

-- Locations: readable by authenticated users (shared resource), writable by any authenticated user
CREATE POLICY "Authenticated users can read locations"
  ON locations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create locations"
  ON locations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update locations"
  ON locations FOR UPDATE
  TO authenticated
  USING (true);

-- Experiences: users can only access their own
CREATE POLICY "Users can read own experiences"
  ON experiences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own experiences"
  ON experiences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own experiences"
  ON experiences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own experiences"
  ON experiences FOR DELETE
  USING (auth.uid() = user_id);

-- Media: users can only access their own
CREATE POLICY "Users can read own media"
  ON experience_media FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own media"
  ON experience_media FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own media"
  ON experience_media FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own media"
  ON experience_media FOR DELETE
  USING (auth.uid() = user_id);

-- Tags: users manage their own
CREATE POLICY "Users can read own tags"
  ON tags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tags"
  ON tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags"
  ON tags FOR DELETE
  USING (auth.uid() = user_id);

-- Experience tags: access based on experience ownership
CREATE POLICY "Users can read own experience tags"
  ON experience_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM experiences
      WHERE experiences.id = experience_tags.experience_id
      AND experiences.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own experience tags"
  ON experience_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM experiences
      WHERE experiences.id = experience_tags.experience_id
      AND experiences.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own experience tags"
  ON experience_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM experiences
      WHERE experiences.id = experience_tags.experience_id
      AND experiences.user_id = auth.uid()
    )
  );

-- Wishlist: users manage their own
CREATE POLICY "Users can read own wishlist"
  ON wishlist_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own wishlist items"
  ON wishlist_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wishlist items"
  ON wishlist_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlist items"
  ON wishlist_items FOR DELETE
  USING (auth.uid() = user_id);

-- AI recommendations: users manage their own
CREATE POLICY "Users can read own recommendations"
  ON ai_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own recommendations"
  ON ai_recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations"
  ON ai_recommendations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recommendations"
  ON ai_recommendations FOR DELETE
  USING (auth.uid() = user_id);

-- User preferences: users manage their own
CREATE POLICY "Users can read own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Connected accounts: users manage their own
CREATE POLICY "Users can read own connected accounts"
  ON connected_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own connected accounts"
  ON connected_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connected accounts"
  ON connected_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connected accounts"
  ON connected_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- User profiles: users can read and manage their own
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Automatically create user profile and preferences on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_experiences_updated_at
  BEFORE UPDATE ON experiences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_wishlist_updated_at
  BEFORE UPDATE ON wishlist_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_connected_accounts_updated_at
  BEFORE UPDATE ON connected_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
-- Run in Supabase Dashboard > Storage:
-- Create bucket: 'experience-media' (private)
-- Create bucket: 'avatars' (public)
-- Policies handled via Supabase Dashboard storage policies


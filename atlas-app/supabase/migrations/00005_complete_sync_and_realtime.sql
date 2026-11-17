-- 00005_complete_sync_and_realtime.sql
-- Idempotent unified setup ensuring Adventures, Dream List status/tags, RLS, and Supabase Realtime are enabled.

-- 1. Ensure Adventures & Destinations tables exist (from 00003)
CREATE TABLE IF NOT EXISTS adventures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  notes TEXT,
  cover_image_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  origin_name TEXT,
  destination_name TEXT,
  start_date DATE,
  end_date DATE,
  estimated_duration_days INTEGER,
  status TEXT NOT NULL DEFAULT 'dreaming' CHECK (status IN ('dreaming', 'planned', 'upcoming', 'in_progress', 'completed', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS adventure_destinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  adventure_id UUID NOT NULL REFERENCES adventures(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  stop_order INTEGER NOT NULL DEFAULT 1,
  day_number INTEGER,
  activity_title TEXT NOT NULL,
  activity_description TEXT,
  target_date DATE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_experience_id UUID REFERENCES experiences(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_adventures_user ON adventures(user_id);
CREATE INDEX IF NOT EXISTS idx_adv_dest_adventure ON adventure_destinations(adventure_id);
CREATE INDEX IF NOT EXISTS idx_adv_dest_user ON adventure_destinations(user_id);

ALTER TABLE adventures ENABLE ROW LEVEL SECURITY;
ALTER TABLE adventure_destinations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own adventures" ON adventures;
CREATE POLICY "Users can manage own adventures"
  ON adventures FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own adventure destinations" ON adventure_destinations;
CREATE POLICY "Users can manage own adventure destinations"
  ON adventure_destinations FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Ensure Wishlist Dream List columns exist (from 00004)
ALTER TABLE wishlist_items
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'dreaming'
  CHECK (status IN ('dreaming', 'planned', 'visited')),
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

UPDATE wishlist_items
SET status = 'visited'
WHERE is_completed = true AND status = 'dreaming';

-- 3. Enable Supabase Realtime broadcast across devices
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'experiences'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE experiences;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'wishlist_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE wishlist_items;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'adventures'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE adventures;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'adventure_destinations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE adventure_destinations;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'user_preferences'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_preferences;
  END IF;
END $$;

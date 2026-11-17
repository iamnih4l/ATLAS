-- 00004_sync_and_dreamlist_parity.sql
-- ATLAS Cross-Device Synchronization, Feature Parity & Dream List Schema Enhancement

-- 1. Enhance wishlist_items table with explicit status and tags
ALTER TABLE wishlist_items 
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'dreaming' 
  CHECK (status IN ('dreaming', 'planned', 'visited')),
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

-- 2. Backfill existing wishlist_items
UPDATE wishlist_items 
SET status = 'visited' 
WHERE is_completed = true AND status = 'dreaming';

UPDATE wishlist_items 
SET status = 'dreaming' 
WHERE is_completed = false;

-- 3. Indexes for fast status filtering
CREATE INDEX IF NOT EXISTS idx_wishlist_status ON wishlist_items(status);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_status ON wishlist_items(user_id, status);

-- 4. Verify RLS policies on experiences, wishlist_items, locations, and adventures
-- Ensure authenticated users can perform SELECT, INSERT, UPDATE, DELETE on their own experiences
DROP POLICY IF EXISTS "Users can read own experiences" ON experiences;
CREATE POLICY "Users can read own experiences"
  ON experiences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own experiences" ON experiences;
CREATE POLICY "Users can create own experiences"
  ON experiences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own experiences" ON experiences;
CREATE POLICY "Users can update own experiences"
  ON experiences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own experiences" ON experiences;
CREATE POLICY "Users can delete own experiences"
  ON experiences FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Ensure authenticated users can perform SELECT, INSERT, UPDATE, DELETE on their own wishlist_items
DROP POLICY IF EXISTS "Users can read own wishlist" ON wishlist_items;
CREATE POLICY "Users can read own wishlist"
  ON wishlist_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own wishlist items" ON wishlist_items;
CREATE POLICY "Users can create own wishlist items"
  ON wishlist_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own wishlist items" ON wishlist_items;
CREATE POLICY "Users can update own wishlist items"
  ON wishlist_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own wishlist items" ON wishlist_items;
CREATE POLICY "Users can delete own wishlist items"
  ON wishlist_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Ensure authenticated users can read and insert locations (shared geospatial catalog)
DROP POLICY IF EXISTS "Authenticated users can read locations" ON locations;
CREATE POLICY "Authenticated users can read locations"
  ON locations FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create locations" ON locations;
CREATE POLICY "Authenticated users can create locations"
  ON locations FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update locations" ON locations;
CREATE POLICY "Authenticated users can update locations"
  ON locations FOR UPDATE
  TO authenticated
  USING (true);

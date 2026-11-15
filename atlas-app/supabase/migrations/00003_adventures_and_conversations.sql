-- 00003_adventures_and_conversations.sql
-- ATLAS Adventure-Centric AI Planning & Conversation Persistence Schema

-- ============================================================
-- 1. ADVENTURES (Journeys connecting destinations & itineraries)
-- ============================================================
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

CREATE INDEX IF NOT EXISTS idx_adventures_user ON adventures(user_id);
CREATE INDEX IF NOT EXISTS idx_adventures_status ON adventures(status);

-- ============================================================
-- 2. ADVENTURE DESTINATIONS (Ordered itinerary stops)
-- ============================================================
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

CREATE INDEX IF NOT EXISTS idx_adv_dest_adventure ON adventure_destinations(adventure_id);
CREATE INDEX IF NOT EXISTS idx_adv_dest_user ON adventure_destinations(user_id);
CREATE INDEX IF NOT EXISTS idx_adv_dest_location ON adventure_destinations(location_id);
CREATE INDEX IF NOT EXISTS idx_adv_dest_order ON adventure_destinations(adventure_id, stop_order);

-- ============================================================
-- 3. AI CONVERSATIONS (Persistent chats with Orion)
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Adventure Planning with Orion',
  associated_adventure_id UUID REFERENCES adventures(id) ON DELETE SET NULL,
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_conv_user ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conv_adventure ON ai_conversations(associated_adventure_id);

-- ============================================================
-- 4. AI MESSAGES (Individual messages in conversations)
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'orion', 'system')),
  content TEXT NOT NULL,
  structured_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_msg_conv ON ai_messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_ai_msg_user ON ai_messages(user_id);

-- ============================================================
-- 5. ROW LEVEL SECURITY POLICIES
-- ============================================================
ALTER TABLE adventures ENABLE ROW LEVEL SECURITY;
ALTER TABLE adventure_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own adventures"
  ON adventures FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own adventure destinations"
  ON adventure_destinations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own ai conversations"
  ON ai_conversations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own ai messages"
  ON ai_messages FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

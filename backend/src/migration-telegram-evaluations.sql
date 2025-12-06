-- ============================================
-- UMKM EVALUATIONS TABLE
-- ============================================
-- Table untuk menyimpan evaluasi dari Boss via Telegram

CREATE TABLE IF NOT EXISTS umkm_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES umkm_profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sender_name TEXT DEFAULT 'Boss',
  telegram_chat_id BIGINT,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_evaluations_profile ON umkm_evaluations(profile_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_status ON umkm_evaluations(status);
CREATE INDEX IF NOT EXISTS idx_evaluations_created ON umkm_evaluations(created_at DESC);

-- RLS Policies
ALTER TABLE umkm_evaluations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to view evaluations" ON umkm_evaluations;
DROP POLICY IF EXISTS "Allow anyone to insert evaluations" ON umkm_evaluations;
DROP POLICY IF EXISTS "Allow authenticated users to update evaluations" ON umkm_evaluations;

-- Allow authenticated users to view evaluations
CREATE POLICY "Allow authenticated users to view evaluations"
  ON umkm_evaluations FOR SELECT
  TO authenticated
  USING (true);

-- Allow anyone to insert evaluations (for Telegram bot)
CREATE POLICY "Allow anyone to insert evaluations"
  ON umkm_evaluations FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow authenticated users to update evaluations
CREATE POLICY "Allow authenticated users to update evaluations"
  ON umkm_evaluations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_evaluations_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists before creating
DROP TRIGGER IF EXISTS set_evaluations_timestamp ON umkm_evaluations;

CREATE TRIGGER set_evaluations_timestamp
BEFORE UPDATE ON umkm_evaluations
FOR EACH ROW
EXECUTE FUNCTION update_evaluations_timestamp();

-- ============================================
-- TELEGRAM BOT USERS TABLE (Optional)
-- ============================================
-- Store authorized Telegram users

CREATE TABLE IF NOT EXISTS telegram_bot_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES umkm_profiles(id) ON DELETE CASCADE,
  telegram_chat_id BIGINT UNIQUE NOT NULL,
  telegram_username TEXT,
  first_name TEXT,
  last_name TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telegram_users_profile ON telegram_bot_users(profile_id);
CREATE INDEX IF NOT EXISTS idx_telegram_users_chat ON telegram_bot_users(telegram_chat_id);

ALTER TABLE telegram_bot_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anyone to view telegram users" ON telegram_bot_users;
DROP POLICY IF EXISTS "Allow anyone to insert telegram users" ON telegram_bot_users;
DROP POLICY IF EXISTS "Allow anyone to update telegram users" ON telegram_bot_users;

CREATE POLICY "Allow anyone to view telegram users"
  ON telegram_bot_users FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow anyone to insert telegram users"
  ON telegram_bot_users FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow anyone to update telegram users"
  ON telegram_bot_users FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE umkm_evaluations IS 'Evaluasi dari Boss UMKM via Telegram Bot';
COMMENT ON TABLE telegram_bot_users IS 'Authorized Telegram Bot users untuk akses laporan';

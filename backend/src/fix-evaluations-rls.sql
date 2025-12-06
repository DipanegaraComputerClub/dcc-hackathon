-- ============================================
-- FIX RLS POLICY FOR TELEGRAM BOT
-- ============================================
-- Quick fix: Disable RLS temporarily for umkm_evaluations

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Allow authenticated users to view evaluations" ON umkm_evaluations;
DROP POLICY IF EXISTS "Allow anyone to insert evaluations" ON umkm_evaluations;
DROP POLICY IF EXISTS "Allow authenticated users to update evaluations" ON umkm_evaluations;
DROP POLICY IF EXISTS "Allow anon to insert evaluations" ON umkm_evaluations;
DROP POLICY IF EXISTS "Enable insert for all users" ON umkm_evaluations;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON umkm_evaluations;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON umkm_evaluations;

-- DISABLE RLS completely (for development/testing)
ALTER TABLE umkm_evaluations DISABLE ROW LEVEL SECURITY;

-- OR if you want to keep RLS enabled, use these permissive policies:
-- ALTER TABLE umkm_evaluations ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Allow all operations"
--   ON umkm_evaluations
--   FOR ALL
--   USING (true)
--   WITH CHECK (true);

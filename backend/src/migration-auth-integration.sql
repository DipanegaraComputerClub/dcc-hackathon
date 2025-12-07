-- Add user_id column to umkm_profiles table
-- This connects Supabase Auth users to UMKM profiles

-- Add user_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'umkm_profiles' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE umkm_profiles 
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        
        -- Add index for faster queries
        CREATE INDEX IF NOT EXISTS idx_umkm_profiles_user_id ON umkm_profiles(user_id);
        
        -- Add unique constraint to ensure one profile per user
        ALTER TABLE umkm_profiles 
        ADD CONSTRAINT unique_user_profile UNIQUE(user_id);
    END IF;
END $$;

-- Enable RLS on umkm_profiles if not already enabled
ALTER TABLE umkm_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON umkm_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON umkm_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON umkm_profiles;

-- Create RLS policies
CREATE POLICY "Users can view their own profile"
ON umkm_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON umkm_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON umkm_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

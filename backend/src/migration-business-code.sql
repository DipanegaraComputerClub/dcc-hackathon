-- Add business_code column to umkm_profiles
-- This code links user to Telegram bot

ALTER TABLE umkm_profiles 
ADD COLUMN IF NOT EXISTS business_code TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_umkm_profiles_business_code ON umkm_profiles(business_code);

-- Function to generate unique business code
CREATE OR REPLACE FUNCTION generate_business_code(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_check INTEGER;
BEGIN
  -- Generate code from first 8 chars of UUID + random suffix
  code := UPPER(SUBSTRING(REPLACE(user_uuid::TEXT, '-', ''), 1, 8));
  
  -- Check if code already exists
  SELECT COUNT(*) INTO exists_check 
  FROM umkm_profiles 
  WHERE business_code = code;
  
  -- If exists, add random suffix
  IF exists_check > 0 THEN
    code := code || FLOOR(RANDOM() * 1000)::TEXT;
  END IF;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate business_code on insert if not provided
CREATE OR REPLACE FUNCTION auto_generate_business_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.business_code IS NULL THEN
    NEW.business_code := generate_business_code(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trigger_auto_business_code ON umkm_profiles;

-- Create trigger
CREATE TRIGGER trigger_auto_business_code
BEFORE INSERT ON umkm_profiles
FOR EACH ROW
EXECUTE FUNCTION auto_generate_business_code();

-- Update existing profiles without business_code
UPDATE umkm_profiles
SET business_code = generate_business_code(user_id)
WHERE business_code IS NULL;

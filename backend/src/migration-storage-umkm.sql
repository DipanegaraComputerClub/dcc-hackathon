-- ============================================
-- MIGRATION: SUPABASE STORAGE FOR UMKM LOGOS
-- Created: December 6, 2025
-- Description: Setup storage bucket for UMKM logo uploads
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Create storage bucket for UMKM logos (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'umkm-logos',
  'umkm-logos',
  true,
  5242880, -- 5MB max file size
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Step 2: Drop existing policies (if any) to avoid conflicts
DROP POLICY IF EXISTS "Public can view logos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update logos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete logos" ON storage.objects;

-- Step 3: Create new policies for umkm-logos bucket
-- Policy 1: Anyone can view/download logos (public read)
CREATE POLICY "Public can view logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'umkm-logos');

-- Policy 2: Anyone can upload logos (no auth required for development)
CREATE POLICY "Anyone can upload logos"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'umkm-logos');

-- Policy 3: Anyone can update logos
CREATE POLICY "Anyone can update logos"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'umkm-logos')
WITH CHECK (bucket_id = 'umkm-logos');

-- Policy 4: Anyone can delete logos
CREATE POLICY "Anyone can delete logos"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'umkm-logos');

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Storage bucket "umkm-logos" setup completed!';
    RAISE NOTICE '📸 Max file size: 5MB';
    RAISE NOTICE '🎨 Allowed formats: JPEG, PNG, WebP, GIF';
    RAISE NOTICE '🔓 Public access: ENABLED (read)';
    RAISE NOTICE '📝 Upload access: ENABLED (no auth required)';
    RAISE NOTICE '';
    RAISE NOTICE '✨ Ready to use! Try uploading a logo from frontend.';
END $$;

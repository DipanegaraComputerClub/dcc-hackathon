-- ============================================
-- MIGRATION: SUPABASE STORAGE FOR UMKM LOGOS
-- Created: December 6, 2025
-- Description: Setup storage bucket for UMKM logo uploads
-- ============================================

-- Create storage bucket for UMKM logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'umkm-logos',
  'umkm-logos',
  true,
  5242880, -- 5MB max file size
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view logos (public bucket)
CREATE POLICY "Public Access for Logo Viewing"
ON storage.objects FOR SELECT
USING (bucket_id = 'umkm-logos');

-- Policy: Authenticated users can upload logos
CREATE POLICY "Authenticated Users Can Upload Logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'umkm-logos' 
  AND (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

-- Policy: Users can update their own uploads
CREATE POLICY "Users Can Update Own Logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'umkm-logos')
WITH CHECK (bucket_id = 'umkm-logos');

-- Policy: Users can delete their own uploads
CREATE POLICY "Users Can Delete Own Logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'umkm-logos');

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Storage bucket "umkm-logos" created successfully!';
    RAISE NOTICE '📸 Max file size: 5MB';
    RAISE NOTICE '🎨 Allowed types: JPEG, PNG, WebP, GIF';
    RAISE NOTICE '🔓 Public access enabled';
END $$;

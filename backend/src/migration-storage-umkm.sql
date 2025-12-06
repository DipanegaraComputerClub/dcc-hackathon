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

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Storage bucket "umkm-logos" created successfully!';
    RAISE NOTICE '📸 Max file size: 5MB';
    RAISE NOTICE '🎨 Allowed types: JPEG, PNG, WebP, GIF';
    RAISE NOTICE '🔓 Public access enabled';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  MANUAL SETUP REQUIRED:';
    RAISE NOTICE '1. Go to Supabase Dashboard > Storage > Policies';
    RAISE NOTICE '2. Click on "umkm-logos" bucket';
    RAISE NOTICE '3. Add policy: "Enable public read access"';
    RAISE NOTICE '   - Policy name: Public Access';
    RAISE NOTICE '   - Operation: SELECT';
    RAISE NOTICE '   - Policy definition: true';
    RAISE NOTICE '4. Add policy: "Enable insert for all users"';
    RAISE NOTICE '   - Policy name: Insert Access';
    RAISE NOTICE '   - Operation: INSERT';
    RAISE NOTICE '   - Policy definition: true';
END $$;

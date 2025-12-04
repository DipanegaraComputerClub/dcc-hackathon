-- ============================================
-- AI CONTENT STUDIO - Update Schema
-- ============================================
-- Update table ai_content_activity untuk tipe baru

-- Drop constraint lama jika ada
ALTER TABLE public.ai_content_activity 
DROP CONSTRAINT IF EXISTS ai_content_activity_type_check;

-- Tambahkan constraint baru dengan 8 tipe
ALTER TABLE public.ai_content_activity 
ADD CONSTRAINT ai_content_activity_type_check 
CHECK (type IN (
    'caption',
    'promo',
    'branding',
    'planner',
    'copywriting',
    'pricing',
    'reply',
    'comment'
));

-- Verify table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'ai_content_activity';

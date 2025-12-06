-- =====================================================
-- Visual Studio Activity - Fix RLS & Add UMKM Support
-- =====================================================
-- Run this in Supabase SQL Editor

-- 1. Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view own visual studio activities" ON public.visual_studio_activity;
DROP POLICY IF EXISTS "Users can create visual studio activities" ON public.visual_studio_activity;

-- 2. Update activity_type constraint to include 'umkm_branding'
ALTER TABLE public.visual_studio_activity 
DROP CONSTRAINT IF EXISTS visual_studio_activity_activity_type_check;

ALTER TABLE public.visual_studio_activity
ADD CONSTRAINT visual_studio_activity_activity_type_check 
CHECK (activity_type IN (
    'image_analysis',
    'template_generation',
    'schedule_planner',
    'umkm_branding'
));

-- 3. Allow NULL user_id for anonymous users
ALTER TABLE public.visual_studio_activity
ALTER COLUMN user_id DROP NOT NULL;

-- 4. New RLS Policies (allow anonymous + authenticated)
CREATE POLICY "Allow public read on visual studio activities"
    ON public.visual_studio_activity
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert on visual studio activities"
    ON public.visual_studio_activity
    FOR INSERT
    WITH CHECK (true);

-- 5. Grant permissions (if needed)
GRANT SELECT, INSERT ON public.visual_studio_activity TO anon;
GRANT SELECT, INSERT ON public.visual_studio_activity TO authenticated;

-- ✅ Done! Now your backend can insert without RLS errors

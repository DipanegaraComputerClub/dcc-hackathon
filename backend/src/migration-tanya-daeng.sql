-- =====================================================
-- Tanya Daeng Conversations Table
-- =====================================================
-- Stores chat history between users and Daeng AI

CREATE TABLE IF NOT EXISTS public.tanya_daeng_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Chat content
    message TEXT NOT NULL,
    reply TEXT NOT NULL,
    
    -- Metadata
    user_context JSONB DEFAULT '{}'::jsonb,
    suggestions TEXT[],
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS tanya_daeng_conversations_user_id_idx
    ON public.tanya_daeng_conversations (user_id);

CREATE INDEX IF NOT EXISTS tanya_daeng_conversations_created_at_idx
    ON public.tanya_daeng_conversations (created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.tanya_daeng_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow public for demo, restrict in production)
CREATE POLICY "Allow public read on conversations"
    ON public.tanya_daeng_conversations
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert on conversations"
    ON public.tanya_daeng_conversations
    FOR INSERT
    WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT ON public.tanya_daeng_conversations TO anon;
GRANT SELECT, INSERT ON public.tanya_daeng_conversations TO authenticated;

-- Optional: Add rating system for answers
ALTER TABLE public.tanya_daeng_conversations
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);

ALTER TABLE public.tanya_daeng_conversations
ADD COLUMN IF NOT EXISTS feedback TEXT;

-- ✅ Done! Now backend can save chat history

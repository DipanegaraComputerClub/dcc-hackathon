-- Visual Studio Activity Table
-- Stores history of image analysis, template generation, and schedule planning

create table if not exists public.visual_studio_activity (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    
    -- Type of activity
    activity_type text check (activity_type in (
        'image_analysis',
        'template_generation',
        'schedule_planner'
    )) not null,

    -- Input data (JSON)
    input_data jsonb not null default '{}'::jsonb,
    
    -- Output data (JSON)
    output_data jsonb not null default '{}'::jsonb,

    created_at timestamp with time zone default now()
);

-- Indexes for performance
create index if not exists visual_studio_activity_user_id_idx
    on public.visual_studio_activity (user_id);

create index if not exists visual_studio_activity_type_idx
    on public.visual_studio_activity (activity_type);

create index if not exists visual_studio_activity_created_at_idx
    on public.visual_studio_activity (created_at desc);

-- Enable Row Level Security (RLS)
alter table public.visual_studio_activity enable row level security;

-- RLS Policies
-- Users can see their own activities
create policy "Users can view own visual studio activities"
    on public.visual_studio_activity
    for select
    using (auth.uid() = user_id);

-- Users can create their own activities
create policy "Users can create visual studio activities"
    on public.visual_studio_activity
    for insert
    with check (auth.uid() = user_id);

-- Grant permissions
grant usage on schema public to anon, authenticated;
grant all on public.visual_studio_activity to anon, authenticated;

-- Comment
comment on table public.visual_studio_activity is 'Stores Visual Studio activity history including image analysis, template generation, and schedule planning';

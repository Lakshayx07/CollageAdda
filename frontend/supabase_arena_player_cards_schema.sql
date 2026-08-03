-- Table definition for Arena Player Cards
CREATE TABLE IF NOT EXISTS public.arena_player_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    game_or_sport TEXT NOT NULL,
    category TEXT NOT NULL,
    photo_url TEXT,
    card_data JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.arena_player_cards ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read player cards
CREATE POLICY "Anyone can read arena_player_cards"
ON public.arena_player_cards FOR SELECT
USING (true);

-- Allow authenticated users to insert their own cards
CREATE POLICY "Users can insert their own arena_player_cards"
ON public.arena_player_cards FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Optional: Allow users to update their own cards
CREATE POLICY "Users can update their own arena_player_cards"
ON public.arena_player_cards FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Optional: Allow users to delete their own cards
CREATE POLICY "Users can delete their own arena_player_cards"
ON public.arena_player_cards FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

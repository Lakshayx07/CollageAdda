-- Run this in your Supabase SQL Editor to set up the connections logic

-- 1. Ensure your users table has a university column
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS university TEXT;

-- 2. Create the connections table if you don't have one
CREATE TABLE IF NOT EXISTS connections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, friend_id)
);

-- 3. Enable RLS (Row Level Security)
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- 4. Create policies so users can see their own connections
CREATE POLICY "Users can view their own connections" 
ON connections FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can insert their own connections" 
ON connections FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connection requests" 
ON connections FOR UPDATE 
USING (auth.uid() = friend_id OR auth.uid() = user_id);

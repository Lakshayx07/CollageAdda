-- ====================================================
-- CollageAdda — Communities Feature
-- Run this entire script in your Supabase SQL Editor
-- ====================================================

-- 1. COMMUNITIES TABLE
CREATE TABLE IF NOT EXISTS communities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT,
  tags          TEXT[] DEFAULT '{}',
  privacy       TEXT DEFAULT 'public' CHECK (privacy IN ('public', 'invite_only')),
  created_by    TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  member_count  INT DEFAULT 1 NOT NULL,
  avatar_color  TEXT DEFAULT 'amber'
);

-- 2. COMMUNITY MEMBERS JOIN TABLE
CREATE TABLE IF NOT EXISTS community_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id  UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id       TEXT NOT NULL,
  role          TEXT DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at     TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(community_id, user_id)
);

-- 3. COMMUNITY MESSAGES TABLE
CREATE TABLE IF NOT EXISTS community_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id  UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  sender_id     TEXT NOT NULL,
  sender_name   TEXT NOT NULL,
  sender_avatar TEXT,
  content       TEXT NOT NULL,
  reply_to_id   UUID,
  reply_to_content TEXT,
  reply_to_sender_name TEXT,
  attachment_type TEXT DEFAULT 'text' CHECK (attachment_type IN ('text', 'poll', 'photo', 'video')),
  media_url     TEXT,
  media_path    TEXT,
  poll          JSONB,
  is_pinned     BOOLEAN DEFAULT false NOT NULL,
  edited_at     TIMESTAMPTZ,
  deleted_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE community_messages ADD COLUMN IF NOT EXISTS reply_to_id UUID;
ALTER TABLE community_messages ADD COLUMN IF NOT EXISTS reply_to_content TEXT;
ALTER TABLE community_messages ADD COLUMN IF NOT EXISTS reply_to_sender_name TEXT;
ALTER TABLE community_messages ADD COLUMN IF NOT EXISTS attachment_type TEXT DEFAULT 'text';
ALTER TABLE community_messages ADD COLUMN IF NOT EXISTS media_url TEXT;
ALTER TABLE community_messages ADD COLUMN IF NOT EXISTS media_path TEXT;
ALTER TABLE community_messages ADD COLUMN IF NOT EXISTS poll JSONB;
ALTER TABLE community_messages ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE community_messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;
ALTER TABLE community_messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_communities_created_at ON communities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_members_community_id ON community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user_id ON community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_community_id ON community_messages(community_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_created_at ON community_messages(created_at ASC);

-- 5. ENABLE ROW LEVEL SECURITY
ALTER TABLE communities         ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_messages  ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES
DROP POLICY IF EXISTS "Allow public select communities"  ON communities;
DROP POLICY IF EXISTS "Allow public insert communities"  ON communities;
DROP POLICY IF EXISTS "Allow public update communities"  ON communities;
DROP POLICY IF EXISTS "Allow public delete communities"  ON communities;
CREATE POLICY "Allow public select communities"  ON communities FOR SELECT  USING (true);
CREATE POLICY "Allow public insert communities"  ON communities FOR INSERT  WITH CHECK (true);
CREATE POLICY "Allow public update communities"  ON communities FOR UPDATE  USING (true);
CREATE POLICY "Allow public delete communities"  ON communities FOR DELETE  USING (true);

DROP POLICY IF EXISTS "Allow public select members"  ON community_members;
DROP POLICY IF EXISTS "Allow public insert members"  ON community_members;
DROP POLICY IF EXISTS "Allow public update members"  ON community_members;
DROP POLICY IF EXISTS "Allow public delete members"  ON community_members;
CREATE POLICY "Allow public select members"  ON community_members FOR SELECT  USING (true);
CREATE POLICY "Allow public insert members"  ON community_members FOR INSERT  WITH CHECK (true);
CREATE POLICY "Allow public update members"  ON community_members FOR UPDATE  USING (true);
CREATE POLICY "Allow public delete members"  ON community_members FOR DELETE  USING (true);

DROP POLICY IF EXISTS "Allow public select messages"  ON community_messages;
DROP POLICY IF EXISTS "Allow public insert messages"  ON community_messages;
DROP POLICY IF EXISTS "Allow public update messages"  ON community_messages;
DROP POLICY IF EXISTS "Allow public delete messages"  ON community_messages;
CREATE POLICY "Allow public select messages"  ON community_messages FOR SELECT  USING (true);
CREATE POLICY "Allow public insert messages"  ON community_messages FOR INSERT  WITH CHECK (true);
CREATE POLICY "Allow public update messages"  ON community_messages FOR UPDATE  USING (true);
CREATE POLICY "Allow public delete messages"  ON community_messages FOR DELETE  USING (true);

-- 7. CHAT MEDIA STORAGE
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-chat', 'community-chat', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public community chat media uploads" ON storage.objects;
CREATE POLICY "Public community chat media uploads"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'community-chat');

DROP POLICY IF EXISTS "Public community chat media reads" ON storage.objects;
CREATE POLICY "Public community chat media reads"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'community-chat');

DROP POLICY IF EXISTS "Public community chat media cleanup" ON storage.objects;
CREATE POLICY "Public community chat media cleanup"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'community-chat');

-- 8. REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE community_messages;

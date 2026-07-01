-- ============================================================
-- MIGRATION: Fix UUID → TEXT mismatch for MongoDB ObjectId IDs
-- The app uses MongoDB (custom backend), not Supabase Auth.
-- All user ID columns must be TEXT to accept MongoDB ObjectIds.
-- Run this in your Supabase SQL Editor.
-- ============================================================

-- Step 1: Drop old tables if they were created with uuid columns
-- (safe to drop & recreate since we're in early dev)

DROP TABLE IF EXISTS community_messages;
DROP TABLE IF EXISTS community_members;
DROP TABLE IF EXISTS communities;

-- Step 2: Recreate communities with created_by as TEXT
CREATE TABLE communities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT,
  tags          TEXT[] DEFAULT '{}',
  privacy       TEXT DEFAULT 'public' CHECK (privacy IN ('public', 'invite_only')),
  created_by    TEXT NOT NULL,           -- MongoDB ObjectId (24-char hex)
  created_at    TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  member_count  INT DEFAULT 1 NOT NULL,
  avatar_color  TEXT DEFAULT 'amber'
);

-- Step 3: Recreate community_members with user_id as TEXT
CREATE TABLE community_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id  UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id       TEXT NOT NULL,           -- MongoDB ObjectId
  role          TEXT DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at     TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(community_id, user_id)
);

-- Step 4: Recreate community_messages with sender_id as TEXT
CREATE TABLE community_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id  UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  sender_id     TEXT NOT NULL,           -- MongoDB ObjectId
  sender_name   TEXT NOT NULL,
  sender_avatar TEXT,
  content       TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Step 5: Re-add indexes
CREATE INDEX idx_communities_created_at ON communities(created_at DESC);
CREATE INDEX idx_community_members_community_id ON community_members(community_id);
CREATE INDEX idx_community_members_user_id ON community_members(user_id);
CREATE INDEX idx_community_messages_community_id ON community_messages(community_id);
CREATE INDEX idx_community_messages_created_at ON community_messages(created_at ASC);

-- Step 6: Re-enable RLS
ALTER TABLE communities         ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_messages  ENABLE ROW LEVEL SECURITY;

-- Step 7: Re-apply open RLS policies
CREATE POLICY "Allow public select communities"  ON communities FOR SELECT  USING (true);
CREATE POLICY "Allow public insert communities"  ON communities FOR INSERT  WITH CHECK (true);
CREATE POLICY "Allow public update communities"  ON communities FOR UPDATE  USING (true);
CREATE POLICY "Allow public delete communities"  ON communities FOR DELETE  USING (true);

CREATE POLICY "Allow public select members"  ON community_members FOR SELECT  USING (true);
CREATE POLICY "Allow public insert members"  ON community_members FOR INSERT  WITH CHECK (true);
CREATE POLICY "Allow public update members"  ON community_members FOR UPDATE  USING (true);
CREATE POLICY "Allow public delete members"  ON community_members FOR DELETE  USING (true);

CREATE POLICY "Allow public select messages"  ON community_messages FOR SELECT  USING (true);
CREATE POLICY "Allow public insert messages"  ON community_messages FOR INSERT  WITH CHECK (true);
CREATE POLICY "Allow public delete messages"  ON community_messages FOR DELETE  USING (true);

-- Step 8: Re-enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE community_messages;

-- Done! All user ID columns are now TEXT, accepting MongoDB ObjectIds.

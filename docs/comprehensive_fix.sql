-- Comprehensive Database Fix Script
-- Run this in Supabase SQL Editor to fix all foreign key relationship issues

-- 1. First, ensure the profiles table exists with all required columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hackathons_participated INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS twitter_username TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS github_username TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- 2. Drop and recreate team_seekers table with correct foreign keys
DROP TABLE IF EXISTS team_seekers CASCADE;
CREATE TABLE team_seekers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
  skills TEXT[] DEFAULT '{}',
  bio TEXT,
  looking_for TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, hackathon_id)
);

-- 3. Drop and recreate team_invites table with correct foreign keys
DROP TABLE IF EXISTS team_invites CASCADE;
CREATE TABLE team_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Drop and recreate teams table with correct foreign keys
DROP TABLE IF EXISTS teams CASCADE;
CREATE TABLE teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  leader_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  members UUID[] DEFAULT '{}',
  max_members INTEGER DEFAULT 4,
  is_open BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Drop and recreate follows table (if it doesn't exist or has wrong references)
DROP TABLE IF EXISTS follows CASCADE;
CREATE TABLE follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- 6. Drop and recreate messages table with correct foreign keys
DROP TABLE IF EXISTS messages CASCADE;
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  is_read BOOLEAN DEFAULT false,
  reply_to UUID REFERENCES messages(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (
    (to_user_id IS NOT NULL AND team_id IS NULL) OR 
    (to_user_id IS NULL AND team_id IS NOT NULL)
  )
);

-- 7. Create notifications table
DROP TABLE IF EXISTS notifications CASCADE;
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('team_invite', 'message', 'follow', 'hackathon_reminder')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create all necessary indexes
CREATE INDEX IF NOT EXISTS idx_team_seekers_hackathon ON team_seekers(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_team_seekers_user ON team_seekers(user_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_to_user ON team_invites(to_user_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_from_user ON team_invites(from_user_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_hackathon ON team_invites(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_teams_hackathon ON teams(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_teams_leader ON teams(leader_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_messages_from_user_id ON messages(from_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_to_user_id ON messages(to_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_team_id ON messages(team_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- 9. Enable RLS on all tables
ALTER TABLE team_seekers ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS policies for team_seekers
CREATE POLICY "Users can view all team seekers" ON team_seekers FOR SELECT USING (true);
CREATE POLICY "Users can insert their own team seeker entries" ON team_seekers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own team seeker entries" ON team_seekers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own team seeker entries" ON team_seekers FOR DELETE USING (auth.uid() = user_id);

-- 11. Create RLS policies for team_invites
CREATE POLICY "Users can view invites they sent or received" ON team_invites FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "Users can send invites" ON team_invites FOR INSERT WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "Users can update invites they received" ON team_invites FOR UPDATE USING (auth.uid() = to_user_id);

-- 12. Create RLS policies for teams
CREATE POLICY "Users can view all teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Users can create teams" ON teams FOR INSERT WITH CHECK (auth.uid() = leader_id);
CREATE POLICY "Team leaders can update their teams" ON teams FOR UPDATE USING (auth.uid() = leader_id);
CREATE POLICY "Team leaders can delete their teams" ON teams FOR DELETE USING (auth.uid() = leader_id);

-- 13. Create RLS policies for follows
CREATE POLICY "Follows are viewable by everyone" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow others" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- 14. Create RLS policies for messages
CREATE POLICY "Users can view their messages" ON messages FOR SELECT USING (
  auth.uid() = from_user_id OR 
  auth.uid() = to_user_id OR
  (team_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM teams WHERE id = team_id AND auth.uid() = ANY(members)
  ))
);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "Users can update their messages" ON messages FOR UPDATE USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- 15. Create RLS policies for notifications
CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- 16. Create functions and triggers
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    UPDATE profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET following_count = following_count - 1 WHERE id = OLD.follower_id;
    UPDATE profiles SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_follower_counts_trigger ON follows;
CREATE TRIGGER update_follower_counts_trigger
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW EXECUTE FUNCTION update_follower_counts();

-- Function to automatically add team leader to members array
CREATE OR REPLACE FUNCTION add_leader_to_members()
RETURNS TRIGGER AS $$
BEGIN
  NEW.members := array_append(NEW.members, NEW.leader_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_add_leader_to_members ON teams;
CREATE TRIGGER trigger_add_leader_to_members
  BEFORE INSERT ON teams
  FOR EACH ROW
  EXECUTE FUNCTION add_leader_to_members();

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_team_seekers_updated_at ON team_seekers;
CREATE TRIGGER update_team_seekers_updated_at BEFORE UPDATE ON team_seekers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_team_invites_updated_at ON team_invites;
CREATE TRIGGER update_team_invites_updated_at BEFORE UPDATE ON team_invites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
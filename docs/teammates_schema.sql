-- Teammates Feature Schema
-- Run this in Supabase SQL Editor

-- Table: team_seekers (users looking for teammates for specific hackathons)
CREATE TABLE team_seekers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
  skills TEXT[] DEFAULT '{}',
  bio TEXT,
  looking_for TEXT, -- what kind of teammates they're looking for
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, hackathon_id)
);

-- Table: team_invites (invitations to form teams)
CREATE TABLE team_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: teams (formed teams for hackathons)
CREATE TABLE teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  leader_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  members UUID[] DEFAULT '{}',
  max_members INTEGER DEFAULT 4,
  is_open BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: user_connections (following system)
CREATE TABLE user_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Table: messages (chat system)
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (
    (to_user_id IS NOT NULL AND team_id IS NULL) OR 
    (to_user_id IS NULL AND team_id IS NOT NULL)
  )
);

-- Add skills column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_username TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- Indexes for better performance
CREATE INDEX idx_team_seekers_hackathon ON team_seekers(hackathon_id);
CREATE INDEX idx_team_seekers_user ON team_seekers(user_id);
CREATE INDEX idx_team_invites_to_user ON team_invites(to_user_id);
CREATE INDEX idx_team_invites_hackathon ON team_invites(hackathon_id);
CREATE INDEX idx_teams_hackathon ON teams(hackathon_id);
CREATE INDEX idx_messages_to_user ON messages(to_user_id);
CREATE INDEX idx_messages_team ON messages(team_id);
CREATE INDEX idx_user_connections_follower ON user_connections(follower_id);

-- Row Level Security (RLS) Policies

-- team_seekers policies
ALTER TABLE team_seekers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all team seekers" ON team_seekers
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own team seeker entries" ON team_seekers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own team seeker entries" ON team_seekers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own team seeker entries" ON team_seekers
  FOR DELETE USING (auth.uid() = user_id);

-- team_invites policies
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invites they sent or received" ON team_invites
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can send invites" ON team_invites
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update invites they received" ON team_invites
  FOR UPDATE USING (auth.uid() = to_user_id);

-- teams policies
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all teams" ON teams
  FOR SELECT USING (true);

CREATE POLICY "Users can create teams" ON teams
  FOR INSERT WITH CHECK (auth.uid() = leader_id);

CREATE POLICY "Team leaders can update their teams" ON teams
  FOR UPDATE USING (auth.uid() = leader_id);

CREATE POLICY "Team leaders can delete their teams" ON teams
  FOR DELETE USING (auth.uid() = leader_id);

-- user_connections policies
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view connections they're involved in" ON user_connections
  FOR SELECT USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can create their own connections" ON user_connections
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own connections" ON user_connections
  FOR DELETE USING (auth.uid() = follower_id);

-- messages policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages they sent or received" ON messages
  FOR SELECT USING (
    auth.uid() = from_user_id OR 
    auth.uid() = to_user_id OR
    (team_id IS NOT NULL AND auth.uid() IN (
      SELECT unnest(members) FROM teams WHERE id = team_id
    ))
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (auth.uid() = from_user_id);

CREATE POLICY "Users can delete their own messages" ON messages
  FOR DELETE USING (auth.uid() = from_user_id);

-- Functions for better UX

-- Function to automatically add team leader to members array
CREATE OR REPLACE FUNCTION add_leader_to_members()
RETURNS TRIGGER AS $$
BEGIN
  NEW.members := array_append(NEW.members, NEW.leader_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_add_leader_to_members
  BEFORE INSERT ON teams
  FOR EACH ROW
  EXECUTE FUNCTION add_leader_to_members();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to allow members to leave a team (non-leader only)
CREATE OR REPLACE FUNCTION leave_team(team_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE teams
  SET members = array_remove(members, auth.uid())
  WHERE id = team_id
    AND auth.uid() = ANY(members)
    AND auth.uid() <> leader_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION leave_team(UUID) TO authenticated;

CREATE TRIGGER trigger_team_seekers_updated_at
  BEFORE UPDATE ON team_seekers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_team_invites_updated_at
  BEFORE UPDATE ON team_invites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
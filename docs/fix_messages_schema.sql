-- Fix messages table foreign key relationships
-- Run this in Supabase SQL Editor to fix the foreign key issue

-- First, drop the existing messages table if it exists
DROP TABLE IF EXISTS messages CASCADE;

-- Recreate messages table with correct foreign key references to profiles
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

-- Create indexes for performance
CREATE INDEX idx_messages_from_user_id ON messages(from_user_id);
CREATE INDEX idx_messages_to_user_id ON messages(to_user_id);
CREATE INDEX idx_messages_team_id ON messages(team_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
CREATE POLICY "Users can view their messages" ON messages FOR SELECT USING (
  auth.uid() = from_user_id OR 
  auth.uid() = to_user_id OR
  (team_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM teams WHERE id = team_id AND auth.uid() = ANY(members)
  ))
);

CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update their messages" ON messages FOR UPDATE USING (
  auth.uid() = from_user_id OR auth.uid() = to_user_id
);

-- Trigger for updated_at
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
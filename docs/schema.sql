-- DevCompare Database Schema
-- Run this in Supabase SQL Editor

-- Hackathons table
CREATE TABLE hackathons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  short_summary TEXT,
  banner_url TEXT,
  prize_money TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  registration_deadline TIMESTAMPTZ,
  themes TEXT[], -- Array of tags like ['AI/ML', 'Web3']
  platform_source TEXT NOT NULL CHECK (platform_source IN ('unstop', 'devpost')),
  original_url TEXT NOT NULL UNIQUE,
  eligibility TEXT,
  location_mode TEXT CHECK (location_mode IN ('online', 'offline', 'hybrid')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  notification_preferences JSONB DEFAULT '{"deadline_reminders": true, "new_hackathons": false}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved hackathons (user bookmarks)
CREATE TABLE saved_hackathons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  hackathon_id UUID REFERENCES hackathons(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, hackathon_id)
);

-- Performance indexes
CREATE INDEX idx_hackathons_deadline ON hackathons(registration_deadline);
CREATE INDEX idx_hackathons_platform ON hackathons(platform_source);
CREATE INDEX idx_hackathons_themes ON hackathons USING GIN(themes);
CREATE INDEX idx_hackathons_created ON hackathons(created_at DESC);
CREATE INDEX idx_saved_hackathons_user ON saved_hackathons(user_id);

-- Row Level Security Policies
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_hackathons ENABLE ROW LEVEL SECURITY;

-- Hackathons are public (read-only for users)
CREATE POLICY "Hackathons are viewable by everyone" ON hackathons
  FOR SELECT USING (true);

-- Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can only manage their own saved hackathons
CREATE POLICY "Users can view own saved hackathons" ON saved_hackathons
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved hackathons" ON saved_hackathons
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved hackathons" ON saved_hackathons
  FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_hackathons_updated_at BEFORE UPDATE ON hackathons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
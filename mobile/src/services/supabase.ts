import { createClient } from '@supabase/supabase-js';
import { Hackathon, Profile, SavedHackathon, PaginatedResponse } from '../types';

// TODO: Replace with your actual Supabase credentials
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Hackathon services
export const hackathonService = {
  // Get paginated hackathons for feed
  async getHackathons(page = 0, limit = 10, filters?: any): Promise<PaginatedResponse<Hackathon>> {
    let query = supabase
      .from('hackathons')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    // Apply filters
    if (filters?.themes?.length) {
      query = query.overlaps('themes', filters.themes);
    }
    
    if (filters?.platforms?.length) {
      query = query.in('platform_source', filters.platforms);
    }

    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      data: data || [],
      count: count || 0,
      page,
      hasMore: (data?.length || 0) === limit,
    };
  },

  // Get single hackathon by ID
  async getHackathon(id: string): Promise<Hackathon> {
    const { data, error } = await supabase
      .from('hackathons')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Search hackathons
  async searchHackathons(query: string): Promise<Hackathon[]> {
    const { data, error } = await supabase
      .from('hackathons')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) throw error;
    return data || [];
  },
};

// User profile services
export const profileService = {
  // Get current user profile
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data;
  },

  // Update user profile
  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create user profile
  async createProfile(profile: Omit<Profile, 'created_at' | 'updated_at'>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

// Saved hackathons services
export const savedHackathonService = {
  // Get user's saved hackathons
  async getSavedHackathons(userId: string): Promise<SavedHackathon[]> {
    const { data, error } = await supabase
      .from('saved_hackathons')
      .select(`
        *,
        hackathon:hackathons(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Save a hackathon
  async saveHackathon(userId: string, hackathonId: string): Promise<SavedHackathon> {
    const { data, error } = await supabase
      .from('saved_hackathons')
      .insert({ user_id: userId, hackathon_id: hackathonId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Unsave a hackathon
  async unsaveHackathon(userId: string, hackathonId: string): Promise<void> {
    const { error } = await supabase
      .from('saved_hackathons')
      .delete()
      .eq('user_id', userId)
      .eq('hackathon_id', hackathonId);
    
    if (error) throw error;
  },

  // Check if hackathon is saved
  async isHackathonSaved(userId: string, hackathonId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('saved_hackathons')
      .select('id')
      .eq('user_id', userId)
      .eq('hackathon_id', hackathonId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  },
};

// Auth services
export const authService = {
  // Sign up with email
  async signUp(email: string, password: string, fullName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    
    if (error) throw error;
    return data;
  },

  // Sign in with email
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
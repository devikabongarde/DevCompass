import { createClient } from '@supabase/supabase-js';
import { Hackathon, Profile, SavedHackathon, PaginatedResponse, TeamSeeker, TeamInvite, Team, Message, Follow, Notification } from '../types';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const hackathonService = {
  async getHackathons(page = 0, limit = 10, filters?: any): Promise<PaginatedResponse<Hackathon>> {
    let query = supabase
      .from('hackathons')
      .select('*', { count: 'exact' })
      .range(page * limit, (page + 1) * limit - 1);

    if (filters?.themes?.length) {
      query = query.overlaps('themes', filters.themes);
    }
    
    if (filters?.platforms?.length) {
      query = query.in('platform_source', filters.platforms);
    }

    const { data, error, count } = await query;
    
    if (error) throw error;
    
    const unstopHackathons = (data || []).filter(h => h.platform_source === 'unstop');
    const devpostHackathons = (data || []).filter(h => h.platform_source === 'devpost');
    
    const shuffledUnstop = unstopHackathons.sort(() => Math.random() - 0.5);
    const shuffledDevpost = devpostHackathons.sort(() => Math.random() - 0.5);
    
    const mixedHackathons = [];
    let unstopIndex = 0;
    let devpostIndex = 0;
    
    while (unstopIndex < shuffledUnstop.length || devpostIndex < shuffledDevpost.length) {
      const choice = Math.random() < 0.5 ? 0 : 1;
      
      if (choice === 0 && unstopIndex < shuffledUnstop.length) {
        mixedHackathons.push(shuffledUnstop[unstopIndex++]);
      } else if (choice === 1 && devpostIndex < shuffledDevpost.length) {
        mixedHackathons.push(shuffledDevpost[devpostIndex++]);
      } else if (unstopIndex < shuffledUnstop.length) {
        mixedHackathons.push(shuffledUnstop[unstopIndex++]);
      } else if (devpostIndex < shuffledDevpost.length) {
        mixedHackathons.push(shuffledDevpost[devpostIndex++]);
      }
    }
    
    return {
      data: mixedHackathons,
      count: count || 0,
      page,
      hasMore: (data?.length || 0) === limit,
    };
  },

  async getHackathon(id: string): Promise<Hackathon> {
    const { data, error } = await supabase
      .from('hackathons')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

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

export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getProfileByUsername(username: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

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

  async createProfile(profile: Omit<Profile, 'created_at' | 'updated_at'>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async searchProfiles(query: string): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(20);
    
    if (error) throw error;
    return data || [];
  },
};

export const savedHackathonService = {
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

  async saveHackathon(userId: string, hackathonId: string): Promise<SavedHackathon> {
    const { data, error } = await supabase
      .from('saved_hackathons')
      .upsert({ user_id: userId, hackathon_id: hackathonId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async unsaveHackathon(userId: string, hackathonId: string): Promise<void> {
    const { error } = await supabase
      .from('saved_hackathons')
      .delete()
      .eq('user_id', userId)
      .eq('hackathon_id', hackathonId);
    
    if (error) throw error;
  },

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

export const teammatesService = {
  async isLookingForTeammates(hackathonId: string): Promise<boolean> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return false;
    
    // Check if user is already on a team for this hackathon
    const { data: teamData } = await supabase
      .from('teams')
      .select('id')
      .eq('hackathon_id', hackathonId)
      .contains('members', [userId])
      .limit(1)
      .maybeSingle();
    
    if (teamData) return false; // Already on a team
    
    const { data, error } = await supabase
      .from('team_seekers')
      .select('id')
      .eq('user_id', userId)
      .eq('hackathon_id', hackathonId)
      .single();
    
    return !!data && !error;
  },

  async lookingForTeammates(hackathonId: string, skills?: string[], bio?: string, lookingFor?: string): Promise<TeamSeeker> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');
    
    // Check if user is already on a team for this hackathon
    const { data: teamData } = await supabase
      .from('teams')
      .select('id')
      .eq('hackathon_id', hackathonId)
      .contains('members', [userId])
      .limit(1)
      .maybeSingle();
    
    if (teamData) {
      throw new Error('You are already on a team for this hackathon');
    }
    
    // Get user profile to use existing data
    const { data: profile } = await supabase
      .from('profiles')
      .select('skills, bio')
      .eq('id', userId)
      .single();
    
    const { data: existing } = await supabase
      .from('team_seekers')
      .select('id')
      .eq('user_id', userId)
      .eq('hackathon_id', hackathonId)
      .single();
    
    if (existing) {
      throw new Error('Already looking for teammates');
    }

    const { data, error } = await supabase
      .from('team_seekers')
      .insert({
        user_id: userId,
        hackathon_id: hackathonId,
        skills: skills || profile?.skills || [],
        bio: bio || profile?.bio || '',
        looking_for: lookingFor
      })
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  },

  async getTeammates(hackathonId: string): Promise<TeamSeeker[]> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    const { data, error } = await supabase
      .from('team_seekers')
      .select('*')
      .eq('hackathon_id', hackathonId)
      .neq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Get all teams for this hackathon to filter out members
    const { data: teams } = await supabase
      .from('teams')
      .select('members')
      .eq('hackathon_id', hackathonId);
    
    const teamMemberIds = new Set(
      (teams || []).flatMap(team => team.members || [])
    );
    
    // Filter out users who are already on a team
    const availableSeekers = (data || []).filter(
      seeker => !teamMemberIds.has(seeker.user_id)
    );
    
    const seekersWithProfiles = await Promise.all(
      availableSeekers.map(async (seeker) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', seeker.user_id)
          .single();
        
        return {
          ...seeker,
          profile
        };
      })
    );
    
    return seekersWithProfiles;
  },

  async sendInvite(toUserId: string, hackathonId: string, message?: string): Promise<TeamInvite> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    // Check if user is a team leader for this hackathon
    const { data: userTeam } = await supabase
      .from('teams')
      .select('id, leader_id')
      .eq('hackathon_id', hackathonId)
      .eq('leader_id', userId)
      .limit(1)
      .maybeSingle();

    if (!userTeam) {
      throw new Error('Only team leaders can send invites');
    }

    const { data: existingTeam } = await supabase
      .from('teams')
      .select('id')
      .eq('hackathon_id', hackathonId)
      .contains('members', [userId, toUserId])
      .limit(1)
      .maybeSingle();

    if (existingTeam) {
      throw new Error('You are already on a team together for this hackathon.');
    }

    const { data: existingInvite } = await supabase
      .from('team_invites')
      .select('id,status')
      .eq('hackathon_id', hackathonId)
      .or(`and(from_user_id.eq.${userId},to_user_id.eq.${toUserId}),and(from_user_id.eq.${toUserId},to_user_id.eq.${userId})`)
      .limit(1)
      .maybeSingle();

    if (existingInvite) {
      throw new Error('You already sent an invite for this hackathon.');
    }
    
    const { data, error } = await supabase
      .from('team_invites')
      .insert({
        from_user_id: userId,
        to_user_id: toUserId,
        hackathon_id: hackathonId,
        message
      })
      .select('*')
      .single();
    
    if (error) throw error;
    
    // Create initial message when sending invite
    try {
      await supabase
        .from('messages')
        .insert({
          from_user_id: userId,
          to_user_id: toUserId,
          content: message || 'Hi! I sent you a team invite. Let\'s collaborate!',
          message_type: 'text'
        });
    } catch (msgError) {
      console.error('Error creating invite message:', msgError);
    }
    
    return data;
  },

  async getInvites(): Promise<TeamInvite[]> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    const { data, error } = await supabase
      .from('team_invites')
      .select(`
        *,
        hackathon:hackathons(*)
      `)
      .eq('to_user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const invitesWithProfiles = await Promise.all(
      (data || []).map(async (invite) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', invite.from_user_id)
          .single();
        
        return {
          ...invite,
          from_profile: profile
        };
      })
    );
    
    return invitesWithProfiles;
  },

  async respondToInvite(inviteId: string, status: 'accepted' | 'rejected'): Promise<TeamInvite> {
    const { data, error } = await supabase
      .from('team_invites')
      .update({ status })
      .eq('id', inviteId)
      .select('*')
      .single();
    
    if (error) throw error;
    
    // If invite is accepted, create team and add both users
    if (status === 'accepted') {
      const currentUserId = (await supabase.auth.getUser()).data.user?.id;
      if (currentUserId) {
        try {
          const { data: existingTeam } = await supabase
            .from('teams')
            .select('id')
            .eq('hackathon_id', data.hackathon_id)
            .contains('members', [currentUserId, data.from_user_id])
            .limit(1)
            .maybeSingle();

          if (!existingTeam) {
            // Create team with both users (leader auto-added by trigger)
            const { data: team } = await supabase
              .from('teams')
              .insert({
                hackathon_id: data.hackathon_id,
                name: 'New Team',
                leader_id: currentUserId,
                members: [data.from_user_id]
              })
              .select('*')
              .single();
          }

          // Remove both users from team_seekers for this hackathon
          await supabase
            .from('team_seekers')
            .delete()
            .eq('hackathon_id', data.hackathon_id)
            .in('user_id', [currentUserId, data.from_user_id]);
          
          // Create welcome message
          await supabase
            .from('messages')
            .insert({
              from_user_id: currentUserId,
              to_user_id: data.from_user_id,
              content: 'Hi! I accepted your team invite. Let\'s work together!',
              message_type: 'text'
            });
          
          // Auto-follow the user if not already following
          const { data: existingFollow } = await supabase
            .from('follows')
            .select('id')
            .eq('follower_id', currentUserId)
            .eq('following_id', data.from_user_id)
            .single();
          
          if (!existingFollow) {
            await supabase
              .from('follows')
              .insert({
                follower_id: currentUserId,
                following_id: data.from_user_id
              });
          }
        } catch (msgError) {
          console.error('Error creating team/message/follow:', msgError);
        }
      }
    }
    
    return data;
  },

  async getFollowingForHackathon(hackathonId: string): Promise<any[]> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return [];
    
    const { data: following } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);
    
    if (!following?.length) return [];
    
    const followingIds = following.map(f => f.following_id);
    
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', followingIds);
    
    return (profiles || []).map(profile => ({
      ...profile,
      isFollowing: true
    }));
  },

  async getUserTeams(): Promise<Team[]> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return [];
    
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        hackathon:hackathons(*)
      `)
      .contains('members', [userId])
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Get member profiles for each team
    const teamsWithProfiles = await Promise.all(
      (data || []).map(async (team) => {
        const memberProfiles = await Promise.all(
          team.members.map(async (memberId: string) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', memberId)
              .single();
            return profile;
          })
        );
        
        return {
          ...team,
          member_profiles: memberProfiles.filter(Boolean)
        };
      })
    );
    
    return teamsWithProfiles;
  },

  async updateTeamName(teamId: string, name: string): Promise<Team> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('teams')
      .update({ name })
      .eq('id', teamId)
      .eq('leader_id', userId)
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteTeam(teamId: string): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');
    
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId)
      .eq('leader_id', userId);
    
    if (error) throw error;
  },
};

export const followService = {
  async followUser(userId: string): Promise<Follow> {
    const currentUserId = (await supabase.auth.getUser()).data.user?.id;
    if (!currentUserId) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('follows')
      .insert({
        follower_id: currentUserId,
        following_id: userId
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async unfollowUser(userId: string): Promise<void> {
    const currentUserId = (await supabase.auth.getUser()).data.user?.id;
    if (!currentUserId) throw new Error('User not authenticated');
    
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', currentUserId)
      .eq('following_id', userId);
    
    if (error) throw error;
  },

  async isFollowing(userId: string): Promise<boolean> {
    const currentUserId = (await supabase.auth.getUser()).data.user?.id;
    if (!currentUserId) return false;
    
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUserId)
      .eq('following_id', userId)
      .single();
    
    return !!data && !error;
  },

  async getFollowers(userId: string): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', userId);
    
    if (error) throw error;
    
    // Manually fetch profiles
    const profiles = await Promise.all(
      (data || []).map(async (follow) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', follow.follower_id)
          .single();
        return profile;
      })
    );
    
    return profiles.filter(Boolean);
  },

  async getFollowing(userId: string): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);
    
    if (error) throw error;
    
    // Manually fetch profiles
    const profiles = await Promise.all(
      (data || []).map(async (follow) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', follow.following_id)
          .single();
        return profile;
      })
    );
    
    return profiles.filter(Boolean);
  },
};

export const messageService = {
  async sendMessage(toUserId: string, content: string, teamId?: string, hackathonId?: string): Promise<Message> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');
    
    const messageContent = hackathonId ? `${content}\n\n[HACKATHON:${hackathonId}]` : content;
    
    const { data, error } = await supabase
      .from('messages')
      .insert({
        from_user_id: userId,
        to_user_id: toUserId,
        team_id: teamId,
        content: messageContent,
        message_type: 'text'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getMessages(userId: string, teamId?: string): Promise<Message[]> {
    const currentUserId = (await supabase.auth.getUser()).data.user?.id;
    if (!currentUserId) return [];
    
    let query = supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (teamId) {
      query = query.eq('team_id', teamId);
    } else {
      query = query
        .or(`and(from_user_id.eq.${currentUserId},to_user_id.eq.${userId}),and(from_user_id.eq.${userId},to_user_id.eq.${currentUserId})`)
        .is('team_id', null);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    // Manually fetch profiles for each message
    const messagesWithProfiles = await Promise.all(
      (data || []).map(async (message) => {
        const { data: fromProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', message.from_user_id)
          .single();
        
        return {
          ...message,
          from_profile: fromProfile
        };
      })
    );
    
    return messagesWithProfiles;
  },

  async markAsRead(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId);
    
    if (error) throw error;
  },

  async getConversations(): Promise<any[]> {
    const currentUserId = (await supabase.auth.getUser()).data.user?.id;
    if (!currentUserId) return [];

    // Get all messages involving the current user
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .or(`from_user_id.eq.${currentUserId},to_user_id.eq.${currentUserId}`)
      .is('team_id', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group messages by conversation partner
    const conversationMap = new Map();
    
    for (const message of messages || []) {
      const otherUserId = message.from_user_id === currentUserId 
        ? message.to_user_id 
        : message.from_user_id;
      
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          other_user_id: otherUserId,
          last_message: message,
          unread_count: 0
        });
      }
      
      // Count unread messages (messages sent to current user that are unread)
      if (message.to_user_id === currentUserId && !message.is_read) {
        conversationMap.get(otherUserId).unread_count++;
      }
    }

    // Get profiles for all conversation partners
    const conversations = await Promise.all(
      Array.from(conversationMap.values()).map(async (conv) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', conv.other_user_id)
          .single();
        
        return {
          ...conv,
          other_user: profile
        };
      })
    );

    return conversations.filter(conv => conv.other_user);
  },
};

export const authService = {
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async signUp(email: string, password: string, fullName: string) {
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

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },
};
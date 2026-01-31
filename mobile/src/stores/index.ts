import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, Profile, Hackathon, FeedFilters, TeamSeeker, TeamInvite, Team } from '../types';
import { authService, profileService } from '../services/supabase';

// Theme Store
interface ThemeStore {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeStore>()(persist(
  (set) => ({
    isDarkMode: false,
    toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    setDarkMode: (isDark: boolean) => set({ isDarkMode: isDark }),
  }),
  {
    name: 'theme-storage',
    storage: createJSONStorage(() => AsyncStorage),
  }
));

// Auth Store
interface AuthStore extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const { user } = await authService.signIn(email, password);
      
      if (user) {
        const profile = await profileService.getProfile(user.id);
        set({ user, profile, loading: false });
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  signUp: async (email: string, password: string, fullName?: string) => {
    try {
      set({ loading: true, error: null });
      const { user } = await authService.signUp(email, password, fullName);
      
      if (user) {
        // Profile will be created automatically via database trigger
        set({ user, loading: false });
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  signOut: async () => {
    try {
      set({ loading: true });
      await authService.signOut();
      set({ user: null, profile: null, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  loadUser: async () => {
    try {
      set({ loading: true });
      const session = await authService.getSession();
      
      if (session?.user) {
        const profile = await profileService.getProfile(session.user.id);
        set({ user: session.user, profile, loading: false });
      } else {
        set({ user: null, profile: null, loading: false });
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateProfile: async (updates: Partial<Profile>) => {
    try {
      const { user } = get();
      if (!user) throw new Error('No user logged in');
      
      const updatedProfile = await profileService.updateProfile(user.id, updates);
      set({ profile: updatedProfile });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  setError: (error: string | null) => set({ error }),
}));

// Feed Store
interface FeedStore {
  hackathons: Hackathon[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  filters: FeedFilters;
  refreshing: boolean;
  
  loadHackathons: (refresh?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  setFilters: (filters: Partial<FeedFilters>) => void;
  clearFilters: () => void;
  refresh: () => Promise<void>;
}

const defaultFilters: FeedFilters = {
  themes: [],
  platforms: [],
};

export const useFeedStore = create<FeedStore>((set, get) => ({
  hackathons: [],
  loading: false,
  error: null,
  hasMore: true,
  page: 0,
  filters: defaultFilters,
  refreshing: false,

  loadHackathons: async (refresh = false) => {
    try {
      const { hackathons: currentHackathons, filters, page } = get();
      
      if (refresh) {
        set({ loading: true, error: null, page: 0 });
      } else {
        set({ loading: true, error: null });
      }

      const { hackathonService } = await import('../services/supabase');
      const response = await hackathonService.getHackathons(
        refresh ? 0 : page,
        50,
        filters
      );

      // Shuffle the hackathons to mix platforms randomly
      const shuffledHackathons = response.data.sort(() => Math.random() - 0.5);

      set({
        hackathons: refresh ? shuffledHackathons : [...currentHackathons, ...shuffledHackathons],
        hasMore: response.hasMore,
        page: refresh ? 1 : page + 1,
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  loadMore: async () => {
    const { hasMore, loading } = get();
    if (!hasMore || loading) return;
    
    await get().loadHackathons();
  },

  setFilters: (newFilters: Partial<FeedFilters>) => {
    const { filters } = get();
    const updatedFilters = { ...filters, ...newFilters };
    set({ filters: updatedFilters, hackathons: [], page: 0, hasMore: true });
    get().loadHackathons(true);
  },

  clearFilters: () => {
    set({ filters: defaultFilters, hackathons: [], page: 0, hasMore: true });
    get().loadHackathons(true);
  },

  refresh: async () => {
    set({ refreshing: true });
    await get().loadHackathons(true);
    set({ refreshing: false });
  },
}));

// Saved Hackathons Store
interface SavedStore {
  savedHackathons: Hackathon[];
  loading: boolean;
  error: string | null;
  
  loadSaved: () => Promise<void>;
  saveHackathon: (hackathon: Hackathon) => Promise<void>;
  unsaveHackathon: (hackathonId: string) => Promise<void>;
  isSaved: (hackathonId: string) => boolean;
}

export const useSavedStore = create<SavedStore>((set, get) => ({
  savedHackathons: [],
  loading: false,
  error: null,

  loadSaved: async () => {
    try {
      set({ loading: true, error: null });
      const { user } = useAuthStore.getState();
      
      if (!user) {
        set({ savedHackathons: [], loading: false });
        return;
      }

      const { savedHackathonService } = await import('../services/supabase');
      const saved = await savedHackathonService.getSavedHackathons(user.id);
      
      set({
        savedHackathons: saved.map(s => s.hackathon).filter(Boolean) as Hackathon[],
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  saveHackathon: async (hackathon: Hackathon) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) throw new Error('Must be logged in to save hackathons');

      const { savedHackathonService } = await import('../services/supabase');
      try {
        await savedHackathonService.saveHackathon(user.id, hackathon.id);
      } catch (error: any) {
        // Ignore duplicate key constraint error - hackathon already saved
        if (error.code === '23505') {
          console.log('Hackathon already saved');
          return;
        }
        throw error;
      }
      
      const { savedHackathons } = get();
      // Check if already in the list
      if (!savedHackathons.some(h => h.id === hackathon.id)) {
        set({ savedHackathons: [hackathon, ...savedHackathons] });
      }
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  unsaveHackathon: async (hackathonId: string) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) throw new Error('Must be logged in');

      const { savedHackathonService } = await import('../services/supabase');
      await savedHackathonService.unsaveHackathon(user.id, hackathonId);
      
      const { savedHackathons } = get();
      set({
        savedHackathons: savedHackathons.filter(h => h.id !== hackathonId),
      });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  isSaved: (hackathonId: string) => {
    const { savedHackathons } = get();
    return savedHackathons.some(h => h.id === hackathonId);
  },
}));

// Teammates Store
interface TeammatesStore {
  teamSeekers: TeamSeeker[];
  invites: TeamInvite[];
  teams: Team[];
  lookingForTeammates: Set<string>;
  loading: boolean;
  error: string | null;
  
  loadTeammates: (hackathonId: string) => Promise<void>;
  loadInvites: () => Promise<void>;
  loadTeams: () => Promise<void>;
  checkTeammateStatus: (hackathonId: string) => Promise<boolean>;
  sendInvite: (toUserId: string, hackathonId: string, message?: string) => Promise<void>;
  respondToInvite: (inviteId: string, status: 'accepted' | 'rejected') => Promise<void>;
  isLookingFor: (hackathonId: string) => boolean;
}

export const useTeammatesStore = create<TeammatesStore>((set, get) => ({
  teamSeekers: [],
  invites: [],
  teams: [],
  lookingForTeammates: new Set(),
  loading: false,
  error: null,

  loadTeammates: async (hackathonId: string) => {
    try {
      set({ loading: true, error: null });
      const { teammatesService } = await import('../services/supabase');
      const data = await teammatesService.getTeammates(hackathonId);
      set({ teamSeekers: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  loadInvites: async () => {
    try {
      set({ loading: true, error: null });
      const { teammatesService } = await import('../services/supabase');
      const data = await teammatesService.getInvites();
      set({ invites: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  loadTeams: async () => {
    try {
      set({ loading: true, error: null });
      const { teammatesService } = await import('../services/supabase');
      const data = await teammatesService.getUserTeams();
      set({ teams: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  sendInvite: async (toUserId: string, hackathonId: string, message?: string) => {
    try {
      const { teammatesService } = await import('../services/supabase');
      await teammatesService.sendInvite(toUserId, hackathonId, message);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  respondToInvite: async (inviteId: string, status: 'accepted' | 'rejected') => {
    try {
      const { teammatesService } = await import('../services/supabase');
      await teammatesService.respondToInvite(inviteId, status);
      
      // Update local state
      const { invites } = get();
      set({
        invites: invites.map(invite => 
          invite.id === inviteId ? { ...invite, status } : invite
        )
      });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  checkTeammateStatus: async (hackathonId: string) => {
    try {
      const { teammatesService } = await import('../services/supabase');
      const isLooking = await teammatesService.isLookingForTeammates(hackathonId);
      
      const { lookingForTeammates } = get();
      const newSet = new Set(lookingForTeammates);
      if (isLooking) {
        newSet.add(hackathonId);
      } else {
        newSet.delete(hackathonId);
      }
      set({ lookingForTeammates: newSet });
      
      return isLooking;
    } catch (error: any) {
      console.error('Error checking teammate status:', error);
      return false;
    }
  },

  isLookingFor: (hackathonId: string) => {
    const { lookingForTeammates } = get();
    return lookingForTeammates.has(hackathonId);
  },
}));
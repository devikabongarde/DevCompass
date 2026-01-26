import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, Profile, Hackathon, FeedFilters } from '../types';
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
        10,
        filters
      );

      set({
        hackathons: refresh ? response.data : [...currentHackathons, ...response.data],
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
      await savedHackathonService.saveHackathon(user.id, hackathon.id);
      
      const { savedHackathons } = get();
      set({ savedHackathons: [hackathon, ...savedHackathons] });
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
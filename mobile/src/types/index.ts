// Core data types for DevCompare

export interface Hackathon {
  id: string;
  title: string;
  description: string;
  short_summary: string;
  banner_url?: string;
  prize_money?: string;
  start_date?: string;
  end_date?: string;
  registration_deadline?: string;
  themes: string[];
  platform_source: 'unstop' | 'devpost';
  original_url: string;
  eligibility?: string;
  location_mode?: 'online' | 'offline' | 'hybrid';
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  notification_preferences: {
    deadline_reminders: boolean;
    new_hackathons: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface SavedHackathon {
  id: string;
  user_id: string;
  hackathon_id: string;
  hackathon?: Hackathon; // Joined data
  created_at: string;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  HackathonDetail: { hackathon: Hackathon };
  Onboarding: undefined;
};

export type MainTabParamList = {
  Feed: undefined;
  Saved: undefined;
  Calendar: undefined;
  Profile: undefined;
};

// API Response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  hasMore: boolean;
}

// Filter types
export interface FeedFilters {
  themes: string[];
  platforms: ('unstop' | 'devpost')[];
  prizeRange?: {
    min?: number;
    max?: number;
  };
  deadline?: {
    upcoming: boolean;
    thisWeek: boolean;
    thisMonth: boolean;
  };
}

// Auth types
export interface AuthState {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}
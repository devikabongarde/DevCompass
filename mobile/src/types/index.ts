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
  username: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  skills?: string[];
  github_username?: string;
  linkedin_url?: string;
  twitter_username?: string;
  website_url?: string;
  location?: string;
  followers_count: number;
  following_count: number;
  hackathons_participated: number;
  notification_preferences: {
    deadline_reminders: boolean;
    new_hackathons: boolean;
    team_invites: boolean;
    messages: boolean;
  };
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamSeeker {
  id: string;
  user_id: string;
  hackathon_id: string;
  skills: string[];
  bio?: string;
  looking_for?: string;
  profile?: Profile;
  created_at: string;
  updated_at: string;
}

export interface TeamInvite {
  id: string;
  from_user_id: string;
  to_user_id: string;
  hackathon_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  from_profile?: Profile;
  hackathon?: Hackathon;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  hackathon_id: string;
  name: string;
  description?: string;
  leader_id: string;
  members: string[];
  max_members: number;
  is_open: boolean;
  hackathon?: Hackathon;
  leader_profile?: Profile;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  from_user_id: string;
  to_user_id?: string;
  team_id?: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  is_read: boolean;
  reply_to?: string;
  from_profile?: Profile;
  created_at: string;
  updated_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'team_invite' | 'message' | 'follow' | 'hackathon_reminder';
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
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
  SavedHackathons: undefined;
  Notifications: undefined;
  Settings: undefined;
  HelpSupport: undefined;
  TeammateModal: { hackathon: Hackathon };
  TeammatesListScreen: { hackathon: Hackathon };
  ConversationsScreen: undefined;
  ChatScreen: { userId?: string; teamId?: string };
  ProfileSetup: undefined;
  UserProfile: { userId: string };
  EditProfile: undefined;
  Followers: { userId: string };
  Following: { userId: string };
  Onboarding: undefined;
};

export type MainTabParamList = {
  Feed: undefined;
  Saved: undefined;
  Calendar: undefined;
  People: undefined;
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
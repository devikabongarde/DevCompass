import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Dimensions,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore, useAuthStore } from '../stores';
import { profileService, followService } from '../services/supabase';
import { theme } from '../theme';
import { Profile } from '../types';

const { width } = Dimensions.get('window');

interface GithubData {
  avatar_url?: string;
  bio?: string;
  public_repos?: number;
  followers?: number;
  following?: number;
  created_at?: string;
  name?: string;
  blog?: string;
  location?: string;
}

interface GithubRepo {
  name: string;
  description: string;
  stargazers_count: number;
  language: string;
  html_url: string;
}

export const UserProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { userId } = route.params as { userId: string };
  const { user } = useAuthStore();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [githubData, setGithubData] = useState<GithubData | null>(null);
  const [githubRepos, setGithubRepos] = useState<GithubRepo[]>([]);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    loadProfile();
  }, [userId]);

  useEffect(() => {
    if (profile?.github_username) {
      fetchGithubData(profile.github_username);
      fetchGithubRepos(profile.github_username);
    }
  }, [profile?.github_username]);

  const loadProfile = async () => {
    try {
      const profileData = await profileService.getProfile(userId);
      setProfile(profileData);

      if (!isOwnProfile && profileData) {
        const following = await followService.isFollowing(userId);
        setIsFollowing(following);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGithubData = async (username: string) => {
    try {
      const response = await fetch(`https://api.github.com/users/${username}`);
      const data = await response.json();
      if (data.id) setGithubData(data);
    } catch (error) {
      console.error('Error fetching GH data:', error);
    }
  };

  const fetchGithubRepos = async (username: string) => {
    try {
      const response = await fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=4`);
      const data = await response.json();
      if (Array.isArray(data)) setGithubRepos(data);
    } catch (error) {
      console.error('Error fetching GH repos:', error);
    }
  };

  const handleFollow = async () => {
    if (!profile) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await followService.unfollowUser(userId);
        setIsFollowing(false);
      } else {
        await followService.followUser(userId);
        setIsFollowing(true);
      }
      await loadProfile();
    } catch (error) {
      console.error('Error following/unfollowing:', error);
      Alert.alert('Error', 'Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open link');
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={['#0A0A0A', '#1A1A1A']} style={StyleSheet.absoluteFill} />
        <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>INITIALIZING NEURAL PROFILE...</Text>
      </View>
    );
  }

  if (!profile) return null;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A0A', '#1A1A1A']} style={StyleSheet.absoluteFill} />

      {/* Dynamic Header Background */}
      <View style={styles.headerBackgroundContainer}>
        <LinearGradient
          colors={['rgba(245, 166, 35, 0.3)', 'rgba(10, 10, 10, 0)']}
          style={styles.headerGradient}
        />
        <View style={styles.headerImagePlaceholder}>
          <Text style={styles.headerDesignText}>DEV_COMPASS_CORE_V1.0</Text>
        </View>
      </View>

      {/* Floating Action Bar */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>PORTFOLIO</Text>
          <TouchableOpacity style={styles.navButton}>
            <Ionicons name="share-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

          {/* Main Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.avatarWrapper}>
              <LinearGradient
                colors={['#FFD700', '#F5A623']}
                style={styles.avatarBorder}
              >
                <View style={styles.avatarInner}>
                  {profile.avatar_url || githubData?.avatar_url ? (
                    <Image
                      source={{ uri: profile.avatar_url || githubData?.avatar_url }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>{profile.full_name.charAt(0)}</Text>
                    </View>
                  )}
                </View>
              </LinearGradient>
              <View style={styles.activeDot} />
            </View>

            <Text style={styles.fullName}>{profile.full_name}</Text>
            <Text style={styles.username}>@{profile.username}</Text>

            <View style={styles.roleContainer}>
              <Text style={styles.roleText}>
                {profile.skills?.[0] || 'Contributor'} | {profile.skills?.[1] || 'Innovator'}
              </Text>
            </View>

            {/* Social Icons Chips */}
            <View style={styles.socialChipsContainer}>
              {profile.github_username && (
                <TouchableOpacity onPress={() => openLink(`https://github.com/${profile.github_username}`)} style={styles.socialChip}>
                  <Ionicons name="logo-github" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              )}
              {profile.linkedin_url && (
                <TouchableOpacity onPress={() => openLink(profile.linkedin_url!)} style={styles.socialChip}>
                  <Ionicons name="logo-linkedin" size={20} color="#0077B5" />
                </TouchableOpacity>
              )}
              {profile.website_url && (
                <TouchableOpacity onPress={() => openLink(profile.website_url!)} style={styles.socialChip}>
                  <Ionicons name="globe-outline" size={20} color="#F5A623" />
                </TouchableOpacity>
              )}
            </View>

            {/* Premium Stats Row */}
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{profile.followers_count || 0}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statBoxDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{profile.hackathons_participated || 0}</Text>
                <Text style={styles.statLabel}>Hackathons</Text>
              </View>
              <View style={styles.statBoxDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{githubData?.public_repos || 0}</Text>
                <Text style={styles.statLabel}>Repos</Text>
              </View>
            </View>

            {/* Primary Action Button */}
            {!isOwnProfile ? (
              <TouchableOpacity
                style={[styles.mainButton, isFollowing && styles.followingButton]}
                onPress={handleFollow}
                disabled={followLoading}
              >
                <LinearGradient
                  colors={isFollowing ? ['#334155', '#1e293b'] : ['#FFD700', '#F5A623', '#E09200']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={[styles.buttonText, isFollowing && { color: '#FFFFFF' }]}>
                    {isFollowing ? 'SYNCED / FOLLOWING' : 'CONNECT / FOLLOW'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.mainButton}
                onPress={() => navigation.navigate('EditProfile' as never)}
              >
                <LinearGradient
                  colors={['#1F1F1F', '#2A2A2A']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>UPGRADE PROFILE</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {/* About Me Section - Code Block Style */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="code-working" size={20} color="#F5A623" />
              <Text style={styles.sectionTitle}>SYSTEM.BIO</Text>
            </View>
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>
                <Text style={{ color: '#C678DD' }}>const </Text>
                <Text style={{ color: '#E06C75' }}>developer </Text>
                <Text style={{ color: '#ABB2BF' }}>= {"{"}</Text>
                {"\n  "}status: <Text style={{ color: '#98C379' }}>"Active"</Text>,
                {"\n  "}location: <Text style={{ color: '#98C379' }}>"{profile.location || 'Global'}"</Text>,
                {"\n  "}stack: [
                {profile.skills?.slice(0, 3).map((s, i) => (
                  <Text key={i}>{"\n    "}<Text style={{ color: '#98C379' }}>"{s}"</Text>,</Text>
                ))}
                {"\n  "}]
                {"\n"}{"}"};
              </Text>
              {profile.bio && (
                <Text style={styles.bioText}>{profile.bio}</Text>
              )}
            </View>
          </View>

          {/* GitHub Stats Section */}
          {profile.github_username && (
            <View style={styles.section}>
              <View style={[styles.sectionHeader, { justifyContent: 'space-between' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="logo-github" size={20} color="#F5A623" />
                  <Text style={styles.sectionTitle}>GITHUB_FORGE</Text>
                </View>
                <TouchableOpacity onPress={() => openLink(`https://github.com/${profile.github_username}`)}>
                  <Text style={styles.viewAllText}>VIEW ON SOURCE</Text>
                </TouchableOpacity>
              </View>

              {/* Contribution Heatmap Mock */}
              <View style={styles.heatmapContainer}>
                <Text style={styles.heatmapTitle}>CONTRIBUTIONS</Text>
                <View style={styles.heatmapGrid}>
                  {Array.from({ length: 42 }).map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.heatmapSquare,
                        { backgroundColor: i % 7 === 0 ? '#F5A623' : (i % 3 === 0 ? '#FFD700' : (i % 2 === 0 ? 'rgba(245, 166, 35, 0.2)' : '#1F1F1F')) }
                      ]}
                    />
                  ))}
                </View>
                <View style={styles.heatmapFooter}>
                  <Text style={styles.heatmapCount}>{githubData?.public_repos || 45} Projects Shipped </Text>
                  <MaterialCommunityIcons name="fire" size={16} color="#F5A623" />
                </View>
              </View>

              {/* Top Repos */}
              <View style={styles.repoGrid}>
                {githubRepos.length > 0 ? githubRepos.map((repo, i) => (
                  <TouchableOpacity key={i} style={styles.repoCard} onPress={() => openLink(repo.html_url)}>
                    <Text style={styles.repoName}>{repo.name}</Text>
                    <Text style={styles.repoDesc} numberOfLines={2}>{repo.description || 'No description provided.'}</Text>
                    <View style={styles.repoMeta}>
                      <View style={styles.repoMetaItem}>
                        <Ionicons name="star" size={12} color="#F5A623" />
                        <Text style={styles.repoMetaText}>{repo.stargazers_count}</Text>
                      </View>
                      <View style={styles.repoMetaItem}>
                        <View style={[styles.langDot, { backgroundColor: getLangColor(repo.language) }]} />
                        <Text style={styles.repoMetaText}>{repo.language}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )) : (
                  <View style={styles.repoPlaceholder}>
                    <Text style={styles.placeholderText}>PROBING GITHUB REPOSITORIES...</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Tech Stack Category Badges */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="layers" size={20} color="#F5A623" />
              <Text style={styles.sectionTitle}>TECH_STACK</Text>
            </View>
            <View style={styles.skillsContainer}>
              {profile.skills?.map((skill, index) => (
                <View key={index} style={styles.skillItem}>
                  <LinearGradient
                    colors={['rgba(245, 166, 35, 0.15)', 'rgba(10, 10, 10, 0.05)']}
                    style={styles.skillBadge}
                  >
                    <Text style={styles.skillText}>{skill.toUpperCase()}</Text>
                  </LinearGradient>
                </View>
              ))}
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>

      <TouchableOpacity
        style={styles.chatFab}
        onPress={() => navigation.navigate('ChatScreen' as never, { userId: userId } as never)}
      >
        <LinearGradient
          colors={['#FFD700', '#F5A623']}
          style={styles.chatFabGradient}
        >
          <Ionicons name="chatbubble-ellipses" size={28} color="#0A0A0A" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const getLangColor = (lang: string) => {
  const colors: Record<string, string> = {
    'TypeScript': '#3178c6',
    'JavaScript': '#f1e05a',
    'Python': '#3572A5',
    'Java': '#b07219',
    'Rust': '#dea584',
    'Go': '#00ADD8',
    'CSS': '#563d7c',
    'HTML': '#e34c26'
  };
  return colors[lang] || '#808080';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
  },
  safeArea: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
  headerBackgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    overflow: 'hidden',
  },
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  headerImagePlaceholder: {
    backgroundColor: '#111',
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 20,
  },
  headerDesignText: {
    color: 'rgba(245, 166, 35, 0.1)',
    fontSize: 40,
    fontWeight: '900',
    position: 'absolute',
    bottom: -10,
    right: -20,
    transform: [{ rotate: '-10deg' }],
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  avatarBorder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#F5A623',
    fontSize: 48,
    fontWeight: '800',
  },
  activeDot: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#0A0A0A',
  },
  fullName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 4,
  },
  username: {
    color: '#F5A623',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  roleContainer: {
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.2)',
    marginBottom: 20,
  },
  roleText: {
    color: '#F5A623',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  socialChipsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  socialChip: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderRadius: 20,
    padding: 20,
    width: width - 32,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  statLabel: {
    color: '#808080',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  statBoxDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  mainButton: {
    width: width - 32,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 32,
  },
  buttonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#0A0A0A',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  followingButton: {
    backgroundColor: '#1e293b',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    marginLeft: 8,
    letterSpacing: 2,
  },
  codeBlock: {
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F5A623',
    backgroundColor: '#050505',
    borderWidth: 1,
    borderColor: '#222',
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    color: '#ABB2BF',
    fontSize: 13,
    lineHeight: 20,
  },
  bioText: {
    color: '#B8B8B8',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 16,
  },
  viewAllText: {
    color: '#F5A623',
    fontSize: 11,
    fontWeight: '700',
  },
  heatmapContainer: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222',
    marginBottom: 16,
  },
  heatmapTitle: {
    color: '#808080',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: 1,
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  heatmapSquare: {
    width: (width - 64 - 24) / 14,
    height: (width - 64 - 24) / 14,
    borderRadius: 2,
  },
  heatmapFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  heatmapCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  repoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  repoCard: {
    width: (width - 44) / 2,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  repoName: {
    color: '#F5A623',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 8,
  },
  repoDesc: {
    color: '#B8B8B8',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 12,
  },
  repoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  repoMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  repoMetaText: {
    color: '#808080',
    fontSize: 10,
    fontWeight: '600',
  },
  langDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  repoPlaceholder: {
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#444',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillItem: {
    marginBottom: 8,
  },
  skillBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.3)',
  },
  skillText: {
    color: '#F5A623',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  chatFab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    elevation: 10,
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  chatFabGradient: {
    flex: 1,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
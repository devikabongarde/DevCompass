import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useThemeStore, useAuthStore } from '../stores';
import { profileService, followService } from '../services/supabase';
import { theme } from '../theme';
import { Profile } from '../types';

export const UserProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params as { userId: string };
  const { isDarkMode = false } = useThemeStore();
  const { user } = useAuthStore();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    loadProfile();
  }, [userId]);

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

  const handleFollow = async () => {
    if (!profile) return;
    
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await followService.unfollowUser(userId);
        setIsFollowing(false);
        setProfile(prev => prev ? {
          ...prev,
          followers_count: Math.max(0, prev.followers_count - 1)
        } : null);
      } else {
        await followService.followUser(userId);
        setIsFollowing(true);
        setProfile(prev => prev ? {
          ...prev,
          followers_count: prev.followers_count + 1
        } : null);
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error);
      Alert.alert('Error', 'Failed to update follow status');
      // Revert UI changes on error
      loadProfile();
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = () => {
    navigation.navigate('ChatScreen' as never, { userId } as never);
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open link');
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={{
        flex: 1,
        backgroundColor: isDarkMode ? '#0f172a' : '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Text style={{ color: isDarkMode ? '#f8fafc' : '#0F172A' }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={{
        flex: 1,
        backgroundColor: isDarkMode ? '#0f172a' : '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Text style={{ color: isDarkMode ? '#f8fafc' : '#0F172A' }}>Profile not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: isDarkMode ? '#0f172a' : '#F8FAFC',
    }}>
      {/* Header */}
      <View style={{
        backgroundColor: isDarkMode ? '#1e293b' : 'white',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? '#334155' : '#E5E7EB',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#f8fafc' : '#0F172A'} />
        </TouchableOpacity>
        
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: isDarkMode ? '#f8fafc' : '#0F172A',
        }}>
          @{profile.username}
        </Text>
        
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={24} color={isDarkMode ? '#f8fafc' : '#0F172A'} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Profile Header */}
        <View style={{
          backgroundColor: isDarkMode ? '#1e293b' : 'white',
          padding: 20,
          alignItems: 'center',
        }}>
          <View style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}>
            <Text style={{ color: 'white', fontSize: 36, fontWeight: 'bold' }}>
              {profile.full_name.charAt(0)}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: isDarkMode ? '#f8fafc' : '#0F172A',
            }}>
              {profile.full_name}
            </Text>
            {profile.is_verified && (
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} style={{ marginLeft: 8 }} />
            )}
          </View>
          
          <Text style={{
            fontSize: 16,
            color: isDarkMode ? '#94a3b8' : '#64748B',
            marginBottom: 16,
          }}>
            @{profile.username}
          </Text>

          {profile.bio && (
            <Text style={{
              fontSize: 16,
              color: isDarkMode ? '#f8fafc' : '#0F172A',
              textAlign: 'center',
              marginBottom: 16,
              lineHeight: 24,
            }}>
              {profile.bio}
            </Text>
          )}

          {profile.location && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="location-outline" size={16} color={isDarkMode ? '#94a3b8' : '#64748B'} />
              <Text style={{
                fontSize: 14,
                color: isDarkMode ? '#94a3b8' : '#64748B',
                marginLeft: 4,
              }}>
                {profile.location}
              </Text>
            </View>
          )}

          {/* Stats */}
          <View style={{ flexDirection: 'row', gap: 32, marginBottom: 20 }}>
            <TouchableOpacity 
              style={{ alignItems: 'center' }}
              onPress={() => navigation.navigate('Following' as never, { userId } as never)}
            >
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: isDarkMode ? '#f8fafc' : '#0F172A',
              }}>
                {profile.following_count}
              </Text>
              <Text style={{
                fontSize: 14,
                color: isDarkMode ? '#94a3b8' : '#64748B',
              }}>
                Following
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={{ alignItems: 'center' }}
              onPress={() => navigation.navigate('Followers' as never, { userId } as never)}
            >
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: isDarkMode ? '#f8fafc' : '#0F172A',
              }}>
                {profile.followers_count}
              </Text>
              <Text style={{
                fontSize: 14,
                color: isDarkMode ? '#94a3b8' : '#64748B',
              }}>
                Followers
              </Text>
            </TouchableOpacity>
            
            <View style={{ alignItems: 'center' }}>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: isDarkMode ? '#f8fafc' : '#0F172A',
              }}>
                {profile.hackathons_participated}
              </Text>
              <Text style={{
                fontSize: 14,
                color: isDarkMode ? '#94a3b8' : '#64748B',
              }}>
                Hackathons
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          {!isOwnProfile && (
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: isFollowing ? (isDarkMode ? '#475569' : '#E5E7EB') : theme.colors.primary,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                  opacity: followLoading ? 0.7 : 1,
                }}
                onPress={handleFollow}
                disabled={followLoading}
              >
                <Text style={{
                  color: isFollowing ? (isDarkMode ? '#f8fafc' : '#64748B') : 'white',
                  fontWeight: '600',
                }}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: isDarkMode ? '#334155' : '#F1F5F9',
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                onPress={handleMessage}
              >
                <Text style={{
                  color: isDarkMode ? '#f8fafc' : '#475569',
                  fontWeight: '600',
                }}>
                  Message
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {isOwnProfile && (
            <TouchableOpacity
              style={{
                width: '100%',
                backgroundColor: isDarkMode ? '#334155' : '#F1F5F9',
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
              }}
              onPress={() => navigation.navigate('EditProfile' as never)}
            >
              <Text style={{
                color: isDarkMode ? '#f8fafc' : '#475569',
                fontWeight: '600',
              }}>
                Edit Profile
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <View style={{
            backgroundColor: isDarkMode ? '#1e293b' : 'white',
            padding: 20,
            marginTop: 8,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: isDarkMode ? '#f8fafc' : '#0F172A',
              marginBottom: 12,
            }}>
              Skills
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {profile.skills.map((skill, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: isDarkMode ? '#334155' : '#F1F5F9',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{
                    fontSize: 14,
                    color: isDarkMode ? '#f8fafc' : '#475569',
                  }}>
                    {skill}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Links */}
        <View style={{
          backgroundColor: isDarkMode ? '#1e293b' : 'white',
          padding: 20,
          marginTop: 8,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: isDarkMode ? '#f8fafc' : '#0F172A',
            marginBottom: 12,
          }}>
            Links
          </Text>
          
          {profile.github_username && (
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
              onPress={() => openLink(`https://github.com/${profile.github_username}`)}
            >
              <Ionicons name="logo-github" size={20} color={isDarkMode ? '#f8fafc' : '#0F172A'} />
              <Text style={{
                fontSize: 16,
                color: theme.colors.primary,
                marginLeft: 12,
              }}>
                github.com/{profile.github_username}
              </Text>
            </TouchableOpacity>
          )}
          
          {profile.linkedin_url && (
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
              onPress={() => openLink(profile.linkedin_url!)}
            >
              <Ionicons name="logo-linkedin" size={20} color="#0077B5" />
              <Text style={{
                fontSize: 16,
                color: theme.colors.primary,
                marginLeft: 12,
              }}>
                LinkedIn Profile
              </Text>
            </TouchableOpacity>
          )}
          
          {profile.website_url && (
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
              onPress={() => openLink(profile.website_url!)}
            >
              <Ionicons name="globe-outline" size={20} color={isDarkMode ? '#f8fafc' : '#0F172A'} />
              <Text style={{
                fontSize: 16,
                color: theme.colors.primary,
                marginLeft: 12,
              }}>
                {profile.website_url}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
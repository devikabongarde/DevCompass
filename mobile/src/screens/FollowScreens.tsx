import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useThemeStore } from '../stores';
import { followService } from '../services/supabase';
import { theme } from '../theme';
import { Profile } from '../types';

export const FollowersScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params as { userId: string };
  const { isDarkMode = false } = useThemeStore();
  const [followers, setFollowers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFollowers();
  }, [userId]);

  const loadFollowers = async () => {
    try {
      const data = await followService.getFollowers(userId);
      setFollowers(data);
    } catch (error) {
      console.error('Error loading followers:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderFollower = ({ item }: { item: Profile }) => (
    <TouchableOpacity
      style={{
        backgroundColor: isDarkMode ? '#1e293b' : 'white',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? '#334155' : '#E5E7EB',
        flexDirection: 'row',
        alignItems: 'center',
      }}
      onPress={() => navigation.navigate('UserProfile' as never, { userId: item.id } as never)}
    >
      <View style={{
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
      }}>
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
          {item.full_name?.charAt(0) || 'U'}
        </Text>
      </View>
      
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: isDarkMode ? '#f8fafc' : '#0F172A',
          marginBottom: 4,
        }}>
          {item.full_name}
        </Text>
        <Text style={{
          fontSize: 14,
          color: isDarkMode ? '#94a3b8' : '#64748B',
        }}>
          @{item.username}
        </Text>
      </View>
      
      <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#64748b' : '#94A3B8'} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: isDarkMode ? '#0f172a' : '#F8FAFC',
    }}>
      <View style={{
        backgroundColor: isDarkMode ? '#1e293b' : 'white',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? '#334155' : '#E5E7EB',
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#f8fafc' : '#0F172A'} />
        </TouchableOpacity>
        <Text style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: isDarkMode ? '#f8fafc' : '#0F172A',
          marginLeft: 16,
        }}>
          Followers
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={followers}
          renderItem={renderFollower}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={() => (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Ionicons name="people-outline" size={48} color={isDarkMode ? '#64748b' : '#94A3B8'} />
              <Text style={{
                fontSize: 16,
                color: isDarkMode ? '#94a3b8' : '#64748B',
                textAlign: 'center',
                marginTop: 12,
              }}>
                No followers yet
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export const FollowingScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params as { userId: string };
  const { isDarkMode = false } = useThemeStore();
  const [following, setFollowing] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFollowing();
  }, [userId]);

  const loadFollowing = async () => {
    try {
      const data = await followService.getFollowing(userId);
      setFollowing(data);
    } catch (error) {
      console.error('Error loading following:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderFollowing = ({ item }: { item: Profile }) => (
    <TouchableOpacity
      style={{
        backgroundColor: isDarkMode ? '#1e293b' : 'white',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? '#334155' : '#E5E7EB',
        flexDirection: 'row',
        alignItems: 'center',
      }}
      onPress={() => navigation.navigate('UserProfile' as never, { userId: item.id } as never)}
    >
      <View style={{
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
      }}>
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
          {item.full_name?.charAt(0) || 'U'}
        </Text>
      </View>
      
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: isDarkMode ? '#f8fafc' : '#0F172A',
          marginBottom: 4,
        }}>
          {item.full_name}
        </Text>
        <Text style={{
          fontSize: 14,
          color: isDarkMode ? '#94a3b8' : '#64748B',
        }}>
          @{item.username}
        </Text>
      </View>
      
      <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#64748b' : '#94A3B8'} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: isDarkMode ? '#0f172a' : '#F8FAFC',
    }}>
      <View style={{
        backgroundColor: isDarkMode ? '#1e293b' : 'white',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? '#334155' : '#E5E7EB',
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#f8fafc' : '#0F172A'} />
        </TouchableOpacity>
        <Text style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: isDarkMode ? '#f8fafc' : '#0F172A',
          marginLeft: 16,
        }}>
          Following
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={following}
          renderItem={renderFollowing}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={() => (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Ionicons name="people-outline" size={48} color={isDarkMode ? '#64748b' : '#94A3B8'} />
              <Text style={{
                fontSize: 16,
                color: isDarkMode ? '#94a3b8' : '#64748B',
                textAlign: 'center',
                marginTop: 12,
              }}>
                Not following anyone yet
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};
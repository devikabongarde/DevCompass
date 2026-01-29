import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore, useAuthStore } from '../stores';
import { teammatesService, profileService } from '../services/supabase';
import { theme } from '../theme';
import { TeamInvite, Team, Profile } from '../types';

export const PeopleScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isDarkMode = false } = useThemeStore();
  const { user } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<'search' | 'invites' | 'teams'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'invites') {
        const data = await teammatesService.getInvites();
        setInvites(data);
      } else if (activeTab === 'teams') {
        const data = await teammatesService.getUserTeams();
        setTeams(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setLoading(true);
    try {
      const results = await profileService.searchProfiles(query.trim());
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'search') {
      searchUsers(searchQuery);
    } else {
      loadData();
    }
  }, [activeTab, searchQuery]);

  const handleInviteResponse = async (inviteId: string, status: 'accepted' | 'rejected') => {
    try {
      await teammatesService.respondToInvite(inviteId, status);
      Alert.alert(
        status === 'accepted' ? 'Invite Accepted!' : 'Invite Declined',
        status === 'accepted' 
          ? 'You can now chat with your new teammate!'
          : 'The invite has been declined.'
      );
      loadData(); // Refresh
    } catch (error) {
      console.error('Error responding to invite:', error);
      Alert.alert('Error', 'Failed to respond to invite');
    }
  };

  const containerStyle = {
    flex: 1,
    backgroundColor: isDarkMode ? '#0f172a' : '#F8FAFC',
  };

  const headerStyle = {
    backgroundColor: isDarkMode ? '#1e293b' : 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? '#334155' : '#E5E7EB',
  };

  const titleStyle = {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: isDarkMode ? '#f8fafc' : '#0F172A',
    marginBottom: 16,
  };

  const tabContainerStyle = {
    flexDirection: 'row' as const,
    backgroundColor: isDarkMode ? '#334155' : '#F1F5F9',
    borderRadius: 12,
    padding: 4,
  };

  const tabButtonStyle = (active: boolean) => ({
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: active 
      ? (isDarkMode ? '#6366f1' : 'white')
      : 'transparent',
  });

  const tabTextStyle = (active: boolean) => ({
    textAlign: 'center' as const,
    fontSize: 14,
    fontWeight: '600' as const,
    color: active 
      ? (isDarkMode ? 'white' : '#6366f1')
      : (isDarkMode ? '#94a3b8' : '#64748B'),
  });

  const cardStyle = {
    backgroundColor: isDarkMode ? '#1e293b' : 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  };

  const renderInvite = ({ item }: { item: TeamInvite }) => (
    <View style={cardStyle}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            {item.from_profile?.full_name?.charAt(0) || 'U'}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: isDarkMode ? '#f8fafc' : '#0F172A',
          }}>
            {item.from_profile?.full_name || 'Unknown User'}
          </Text>
          <Text style={{
            fontSize: 14,
            color: isDarkMode ? '#94a3b8' : '#64748B',
          }}>
            wants to team up for {item.hackathon?.title}
          </Text>
        </View>
      </View>
      
      {item.message && (
        <Text style={{
          fontSize: 14,
          color: isDarkMode ? '#94a3b8' : '#64748B',
          marginBottom: 12,
          fontStyle: 'italic',
        }}>
          "{item.message}"
        </Text>
      )}

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: theme.colors.primary,
            paddingVertical: 8,
            borderRadius: 8,
            alignItems: 'center',
          }}
          onPress={() => handleInviteResponse(item.id, 'accepted')}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: isDarkMode ? '#475569' : '#E5E7EB',
            paddingVertical: 8,
            borderRadius: 8,
            alignItems: 'center',
          }}
          onPress={() => handleInviteResponse(item.id, 'rejected')}
        >
          <Text style={{ color: isDarkMode ? '#f8fafc' : '#64748B', fontWeight: '600' }}>
            Decline
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTeam = ({ item }: { item: Team }) => (
    <TouchableOpacity
      style={cardStyle}
      onPress={() => navigation.navigate('ChatScreen' as never, { teamId: item.id } as never)}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Ionicons 
          name="people" 
          size={20} 
          color={theme.colors.primary} 
          style={{ marginRight: 8 }}
        />
        <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: isDarkMode ? '#f8fafc' : '#0F172A',
          flex: 1,
        }}>
          {item.name}
        </Text>
        <Text style={{
          fontSize: 12,
          color: isDarkMode ? '#94a3b8' : '#64748B',
        }}>
          {item.members.length}/{item.max_members} members
        </Text>
      </View>
      
      <Text style={{
        fontSize: 14,
        color: isDarkMode ? '#94a3b8' : '#64748B',
        marginBottom: 8,
      }}>
        {item.hackathon?.title}
      </Text>
      
      {item.description && (
        <Text style={{
          fontSize: 14,
          color: isDarkMode ? '#94a3b8' : '#64748B',
        }}>
          {item.description}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={{ alignItems: 'center', paddingVertical: 40 }}>
      <Ionicons 
        name={activeTab === 'invites' ? 'mail-outline' : 'people-outline'} 
        size={48} 
        color={isDarkMode ? '#64748b' : '#94A3B8'} 
      />
      <Text style={{
        fontSize: 16,
        color: isDarkMode ? '#94a3b8' : '#64748B',
        textAlign: 'center',
        marginTop: 12,
      }}>
        {activeTab === 'invites' 
          ? 'No team invites yet\nSwipe right on hackathons to find teammates!'
          : 'No teams yet\nAccept invites or create teams to get started!'
        }
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={containerStyle}>
      <View style={headerStyle}>
        <Text style={titleStyle}>People</Text>
        
        <View style={tabContainerStyle}>
          <TouchableOpacity
            style={tabButtonStyle(activeTab === 'search')}
            onPress={() => setActiveTab('search')}
          >
            <Text style={tabTextStyle(activeTab === 'search')}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tabButtonStyle(activeTab === 'invites')}
            onPress={() => setActiveTab('invites')}
          >
            <Text style={tabTextStyle(activeTab === 'invites')}>
              Invites {invites.length > 0 && `(${invites.length})`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tabButtonStyle(activeTab === 'teams')}
            onPress={() => setActiveTab('teams')}
          >
            <Text style={tabTextStyle(activeTab === 'teams')}>Teams</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flex: 1, padding: 16 }}>
        {activeTab === 'search' && (
          <>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: isDarkMode ? '#475569' : '#E2E8F0',
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: isDarkMode ? '#f8fafc' : '#0F172A',
                backgroundColor: isDarkMode ? '#334155' : 'white',
                marginBottom: 16,
              }}
              placeholder="Search users by name or username..."
              placeholderTextColor={isDarkMode ? '#64748b' : '#94A3B8'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
            <FlatList
              data={searchResults}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={cardStyle}
                  onPress={() => navigation.navigate('UserProfile' as never, { userId: item.id } as never)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
                      }}>
                        {item.full_name}
                      </Text>
                      <Text style={{
                        fontSize: 14,
                        color: isDarkMode ? '#94a3b8' : '#64748B',
                      }}>
                        @{item.username}
                      </Text>
                      {item.bio && (
                        <Text style={{
                          fontSize: 12,
                          color: isDarkMode ? '#94a3b8' : '#64748B',
                          marginTop: 4,
                        }} numberOfLines={1}>
                          {item.bio}
                        </Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#64748b' : '#94A3B8'} />
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={() => (
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                  <Ionicons name="search-outline" size={48} color={isDarkMode ? '#64748b' : '#94A3B8'} />
                  <Text style={{
                    fontSize: 16,
                    color: isDarkMode ? '#94a3b8' : '#64748B',
                    textAlign: 'center',
                    marginTop: 12,
                  }}>
                    {searchQuery ? 'No users found' : 'Search for users by name or username'}
                  </Text>
                </View>
              )}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
        
        {activeTab === 'invites' && (
          <FlatList
            data={invites.filter(invite => invite.status === 'pending')}
            renderItem={renderInvite}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />
        )}
        {activeTab === 'teams' && (
          <FlatList
            data={teams}
            renderItem={renderTeam}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};
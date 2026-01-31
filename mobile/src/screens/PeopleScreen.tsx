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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useThemeStore, useAuthStore } from '../stores';
import { teammatesService, profileService, messageService } from '../services/supabase';
import { theme } from '../theme';
import { TeamInvite, Team, Profile, Message } from '../types';

export const PeopleScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { isDarkMode = false } = useThemeStore();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'search' | 'messages' | 'invites' | 'teams'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
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
      } else if (activeTab === 'messages') {
        const data = await messageService.getConversations();
        setConversations(data);
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

  useFocusEffect(
    React.useCallback(() => {
      if (activeTab !== 'search') {
        loadData();
      }
    }, [activeTab])
  );

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
    } catch (error: any) {
      console.error('Error responding to invite:', error);
      if (error.message === 'You are already on a team for this hackathon.') {
        Alert.alert('Already on a Team', 'You are already on a team for this hackathon, so you cannot accept this invite.');
      } else {
        Alert.alert('Error', 'Failed to respond to invite');
      }
    }
  };

  const containerStyle = {
    flex: 1,
    backgroundColor: '#0A0A0A',
  };

  const headerStyle = {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? '#334155' : '#E5E7EB',
  };

  const titleStyle = {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 16,
  };

  const tabContainerStyle = {
    flexDirection: 'row' as const,
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.2)',
  };

  const tabButtonStyle = (active: boolean) => ({
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: active
      ? '#F5A623'
      : 'transparent',
    shadowColor: active ? '#F5A623' : 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: active ? 0.6 : 0,
    shadowRadius: active ? 8 : 0,
    elevation: active ? 8 : 0,
  });

  const tabTextStyle = (active: boolean) => ({
    textAlign: 'center' as const,
    fontSize: 14,
    fontWeight: '700' as const,
    color: active
      ? '#0A0A0A'
      : '#B8B8B8',
  });

  const cardStyle = {
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.15)',
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  };

  const renderInvite = ({ item }: { item: TeamInvite }) => (
    <View style={cardStyle}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: '#F5A623',
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
            color: '#FFFFFF',
          }}>
            {item.from_profile?.full_name || 'Unknown User'}
          </Text>
          <Text style={{
            fontSize: 14,
            color: '#B8B8B8',
          }}>
            wants to team up for {item.hackathon?.title}
          </Text>
        </View>
      </View>

      {item.message && (
        <Text style={{
          fontSize: 14,
          color: '#B8B8B8',
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
            backgroundColor: '#F5A623',
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: 'center',
            shadowColor: '#F5A623',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 10,
            elevation: 8,
          }}
          onPress={() => handleInviteResponse(item.id, 'accepted')}
        >
          <Text style={{ color: '#0A0A0A', fontWeight: '700', fontSize: 15 }}>Accept</Text>
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
      onPress={() => navigation.navigate('TeamDetail' as never, { team: item } as never)}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Ionicons
          name="people"
          size={20}
          color={'#F5A623'}
          style={{ marginRight: 8 }}
        />
        <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: '#FFFFFF',
          flex: 1,
        }}>
          {item.name}
        </Text>
        <Text style={{
          fontSize: 12,
          color: '#B8B8B8',
        }}>
          {item.members.length}/{item.max_members} members
        </Text>
      </View>

      <Text style={{
        fontSize: 14,
        color: '#B8B8B8',
        marginBottom: 8,
      }}>
        {item.hackathon?.title}
      </Text>

      {item.description && (
        <Text style={{
          fontSize: 14,
          color: '#B8B8B8',
        }}>
          {item.description}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderConversation = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={cardStyle}
      onPress={() => navigation.navigate('ChatScreen' as never, { userId: item.other_user.id } as never)}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: '#F5A623',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
            {item.other_user.full_name?.charAt(0) || 'U'}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: '#FFFFFF',
          }}>
            {item.other_user.full_name}
          </Text>
          <Text style={{
            fontSize: 14,
            color: '#B8B8B8',
          }} numberOfLines={1}>
            {item.last_message?.content || 'No messages yet'}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          {item.last_message?.created_at && (
            <Text style={{
              fontSize: 12,
              color: isDarkMode ? '#64748b' : '#94A3B8',
            }}>
              {new Date(item.last_message.created_at).toLocaleDateString()}
            </Text>
          )}
          {item.unread_count > 0 && (
            <View style={{
              backgroundColor: '#F5A623',
              borderRadius: 10,
              minWidth: 20,
              height: 20,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 4,
            }}>
              <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                {item.unread_count}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={{ alignItems: 'center', paddingVertical: 40 }}>
      <Ionicons
        name={activeTab === 'messages' ? 'chatbubble-outline' : activeTab === 'invites' ? 'mail-outline' : 'people-outline'}
        size={48}
        color={isDarkMode ? '#64748b' : '#94A3B8'}
      />
      <Text style={{
        fontSize: 16,
        color: '#B8B8B8',
        textAlign: 'center',
        marginTop: 12,
      }}>
        {activeTab === 'messages'
          ? 'No conversations yet\nStart chatting with teammates!'
          : activeTab === 'invites'
            ? 'No team invites yet\nSwipe right on hackathons to find teammates!'
            : 'No teams yet\nAccept invites or create teams to get started!'
        }
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={containerStyle}>
      <View style={headerStyle}>
        <Text style={titleStyle}>
          <Text style={{ color: '#F5A623' }}>Peo</Text>
          <Text style={{ color: '#FFFFFF' }}>ple</Text>
        </Text>

        <View style={tabContainerStyle}>
          <TouchableOpacity
            style={tabButtonStyle(activeTab === 'search')}
            onPress={() => setActiveTab('search')}
          >
            <Text style={tabTextStyle(activeTab === 'search')}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tabButtonStyle(activeTab === 'messages')}
            onPress={() => setActiveTab('messages')}
          >
            <Text style={tabTextStyle(activeTab === 'messages')}>Messages</Text>
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
                borderColor: 'rgba(245, 166, 35, 0.3)',
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: '#FFFFFF',
                backgroundColor: 'rgba(26, 26, 26, 0.8)',
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
                      backgroundColor: '#F5A623',
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
                        color: '#FFFFFF',
                      }}>
                        {item.full_name}
                      </Text>
                      <Text style={{
                        fontSize: 14,
                        color: '#B8B8B8',
                      }}>
                        @{item.username}
                      </Text>
                      {item.bio && (
                        <Text style={{
                          fontSize: 12,
                          color: '#B8B8B8',
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
                    color: '#B8B8B8',
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

        {activeTab === 'messages' && (
          <FlatList
            data={conversations}
            renderItem={renderConversation}
            keyExtractor={(item) => item.other_user.id}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />
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

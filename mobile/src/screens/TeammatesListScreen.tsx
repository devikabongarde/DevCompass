import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useThemeStore } from '../stores';
import { teammatesService, followService } from '../services/supabase';
import { theme } from '../theme';
import { TeamSeeker, Hackathon } from '../types';
import { filterTeammates, getUniqueSkills, FilterCriteria } from '../utils/teamFilters';
import { Modal, TextInput, ScrollView, Switch } from 'react-native';


export const TeammatesListScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { hackathon } = route.params as { hackathon: Hackathon };
  const { isDarkMode = false } = useThemeStore();

  const [teammates, setTeammates] = useState<TeamSeeker[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'seekers' | 'following'>('seekers');
  const [loading, setLoading] = useState(true);

  // Filter State
  const [filters, setFilters] = useState<FilterCriteria>({
    skills: [],
    college: '',
    hasOpenSpots: false,
    lookingFor: '',
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);

  // Derived filtered teammates
  const filteredTeammates = filterTeammates(teammates, filters);


  useEffect(() => {
    loadTeammates();
  }, []);

  const loadTeammates = async () => {
    try {
      const [seekersData, followingData] = await Promise.all([
        teammatesService.getTeammates(hackathon.id),
        teammatesService.getFollowingForHackathon(hackathon.id)
      ]);
      setTeammates(seekersData);
      setFollowing(followingData);
      setAvailableSkills(getUniqueSkills(seekersData));

    } catch (error) {
      console.error('Error loading teammates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async (userId: string, fullName: string) => {
    try {
      await teammatesService.sendInvite(userId, hackathon.id, 'Let\'s team up!');
      Alert.alert('Invite Sent!', `Your team invite has been sent to ${fullName}`);
    } catch (error: any) {
      console.error('Error sending invite:', error);
      if (error.message === 'You are already on a team together for this hackathon.') {
        Alert.alert('Already Teammates', 'You are already on a team together for this hackathon.');
      } else if (error.message?.includes('already sent an invite')) {
        Alert.alert('Already Sent', 'You already sent an invite to this person for this hackathon.');
      } else {
        Alert.alert('Error', 'Failed to send invite');
      }
    }
  };

  const renderTeammate = ({ item }: { item: TeamSeeker }) => (
    <View style={{
      backgroundColor: isDarkMode ? '#1e293b' : 'white',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
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
            {item.profile?.full_name?.charAt(0) || 'U'}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: isDarkMode ? '#f8fafc' : '#0F172A',
          }}>
            {item.profile?.full_name || 'Anonymous'}
          </Text>
          <Text style={{
            fontSize: 14,
            color: isDarkMode ? '#94a3b8' : '#64748B',
          }}>
            {item.skills.join(', ')}
          </Text>
        </View>
      </View>

      {item.bio && (
        <Text style={{
          fontSize: 14,
          color: isDarkMode ? '#94a3b8' : '#64748B',
          marginBottom: 12,
        }}>
          {item.bio}
        </Text>
      )}

      {item.looking_for && (
        <Text style={{
          fontSize: 14,
          color: isDarkMode ? '#94a3b8' : '#64748B',
          marginBottom: 12,
          fontStyle: 'italic',
        }}>
          Looking for: {item.looking_for}
        </Text>
      )}

      <TouchableOpacity
        style={{
          backgroundColor: theme.colors.primary,
          paddingVertical: 10,
          borderRadius: 8,
          alignItems: 'center',
        }}
        onPress={() => handleSendInvite(item.user_id, item.profile?.full_name || 'User')}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>Send Invite</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFollowing = ({ item }: { item: any }) => (
    <View style={{
      backgroundColor: isDarkMode ? '#1e293b' : 'white',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
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
            fontSize: 18,
            fontWeight: 'bold',
            color: isDarkMode ? '#f8fafc' : '#0F172A',
          }}>
            {item.full_name}
          </Text>
          <Text style={{
            fontSize: 14,
            color: isDarkMode ? '#94a3b8' : '#64748B',
          }}>
            @{item.username} • {item.skills?.join(', ') || 'No skills listed'}
          </Text>
        </View>
      </View>

      {item.bio && (
        <Text style={{
          fontSize: 14,
          color: isDarkMode ? '#94a3b8' : '#64748B',
          marginBottom: 12,
        }}>
          {item.bio}
        </Text>
      )}

      <TouchableOpacity
        style={{
          backgroundColor: theme.colors.primary,
          paddingVertical: 10,
          borderRadius: 8,
          alignItems: 'center',
        }}
        onPress={() => handleSendInvite(item.id, item.full_name)}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>Invite to Team</Text>
      </TouchableOpacity>
    </View>
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
          Find Teammates
        </Text>
        <TouchableOpacity
          style={{ marginLeft: 'auto', padding: 8 }}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="filter" size={24} color={isDarkMode ? '#f8fafc' : '#0F172A'} />
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{
            backgroundColor: isDarkMode ? '#1e293b' : 'white',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            height: '80%',
            padding: 20
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDarkMode ? '#f8fafc' : '#0F172A' }}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Text style={{ color: theme.colors.primary, fontSize: 16 }}>Done</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* College Filter */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: isDarkMode ? '#f8fafc' : '#0F172A', marginBottom: 8 }}>College/University</Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: isDarkMode ? '#334155' : '#E2E8F0',
                    borderRadius: 8,
                    padding: 12,
                    color: isDarkMode ? '#f8fafc' : '#0F172A',
                    backgroundColor: isDarkMode ? '#0f172a' : 'white'
                  }}
                  placeholder="e.g. IIT Bombay"
                  placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                  value={filters.college}
                  onChangeText={(text) => setFilters({ ...filters, college: text })}
                />
              </View>

              {/* Open Spots Toggle */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: isDarkMode ? '#f8fafc' : '#0F172A' }}>Has Open Spots / Looking For</Text>
                <Switch
                  value={filters.hasOpenSpots}
                  onValueChange={(val) => setFilters({ ...filters, hasOpenSpots: val })}
                  trackColor={{ false: '#767577', true: theme.colors.primary }}
                />
              </View>

              {/* Skills Filter */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: isDarkMode ? '#f8fafc' : '#0F172A', marginBottom: 12 }}>Skills</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {availableSkills.map(skill => (
                    <TouchableOpacity
                      key={skill}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 20,
                        backgroundColor: filters.skills?.includes(skill) ? theme.colors.primary : (isDarkMode ? '#334155' : '#E2E8F0'),
                      }}
                      onPress={() => {
                        const currentSkills = filters.skills || [];
                        const newSkills = currentSkills.includes(skill)
                          ? currentSkills.filter(s => s !== skill)
                          : [...currentSkills, skill];
                        setFilters({ ...filters, skills: newSkills });
                      }}
                    >
                      <Text style={{
                        color: filters.skills?.includes(skill) ? 'white' : (isDarkMode ? '#f8fafc' : '#0F172A'),
                        fontSize: 14
                      }}>{skill}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={{
                  backgroundColor: isDarkMode ? '#334155' : '#E2E8F0',
                  padding: 14,
                  borderRadius: 8,
                  alignItems: 'center',
                  marginTop: 20
                }}
                onPress={() => setFilters({ skills: [], college: '', hasOpenSpots: false, lookingFor: '' })}
              >
                <Text style={{ color: isDarkMode ? '#f8fafc' : '#0F172A', fontWeight: '600' }}>Reset Filters</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>


      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{
          fontSize: 16,
          color: isDarkMode ? '#94a3b8' : '#64748B',
          marginBottom: 16,
        }}>
          For: {hackathon.title}
        </Text>

        {/* Tab Buttons */}
        <View style={{
          flexDirection: 'row',
          backgroundColor: isDarkMode ? '#334155' : '#F1F5F9',
          borderRadius: 8,
          padding: 4,
          marginBottom: 16,
        }}>
          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 6,
              backgroundColor: activeTab === 'seekers' ? theme.colors.primary : 'transparent',
              alignItems: 'center',
            }}
            onPress={() => setActiveTab('seekers')}
          >
            <Text style={{
              color: activeTab === 'seekers' ? 'white' : (isDarkMode ? '#f8fafc' : '#64748B'),
              fontWeight: '600',
            }}>
              Looking for Teams ({teammates.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 6,
              backgroundColor: activeTab === 'following' ? theme.colors.primary : 'transparent',
              alignItems: 'center',
            }}
            onPress={() => setActiveTab('following')}
          >
            <Text style={{
              color: activeTab === 'following' ? 'white' : (isDarkMode ? '#f8fafc' : '#64748B'),
              fontWeight: '600',
            }}>
              People You Follow ({following.length})
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={activeTab === 'seekers' ? filteredTeammates : following}

            renderItem={activeTab === 'seekers' ? renderTeammate : renderFollowing}
            keyExtractor={(item) => activeTab === 'seekers' ? item.id : item.id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Ionicons name="people-outline" size={48} color={isDarkMode ? '#64748b' : '#94A3B8'} />
                <Text style={{
                  fontSize: 16,
                  color: isDarkMode ? '#94a3b8' : '#64748B',
                  textAlign: 'center',
                  marginTop: 12,
                }}>
                  {activeTab === 'seekers'
                    ? 'No teammates looking yet\nBe the first to find teammates!'
                    : 'No one you follow yet\nFollow people to invite them to teams!'}
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};
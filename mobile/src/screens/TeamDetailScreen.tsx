import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useThemeStore, useAuthStore } from '../stores';
import { teammatesService } from '../services/supabase';
import { theme } from '../theme';
import { Team } from '../types';

export const TeamDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { team: initialTeam } = route.params as { team: Team };
  const { isDarkMode = false } = useThemeStore();
  const { user } = useAuthStore();
  
  const [team, setTeam] = useState<Team>(initialTeam);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState(team.name);
  const [loading, setLoading] = useState(false);

  const isLeader = user?.id === team.leader_id;

  const handleUpdateTeamName = async () => {
    if (!newTeamName.trim()) {
      Alert.alert('Error', 'Team name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const updatedTeam = await teammatesService.updateTeamName(team.id, newTeamName.trim());
      setTeam({ ...team, name: updatedTeam.name });
      setShowEditModal(false);
      Alert.alert('Success', 'Team name updated successfully!');
    } catch (error) {
      console.error('Error updating team name:', error);
      Alert.alert('Error', 'Failed to update team name');
    } finally {
      setLoading(false);
    }
  };

  const handleChatWithTeam = () => {
    navigation.navigate('ChatScreen' as never, { teamId: team.id } as never);
  };

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
          Team Details
        </Text>
        
        {isLeader && (
          <TouchableOpacity onPress={() => setShowEditModal(true)}>
            <Ionicons name="create-outline" size={24} color={isDarkMode ? '#f8fafc' : '#0F172A'} />
          </TouchableOpacity>
        )}
        {!isLeader && <View style={{ width: 24 }} />}
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }}>
        {/* Team Info */}
        <View style={{
          backgroundColor: isDarkMode ? '#1e293b' : 'white',
          borderRadius: 12,
          padding: 20,
          marginBottom: 16,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: theme.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}>
              <Ionicons name="people" size={30} color="white" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: isDarkMode ? '#f8fafc' : '#0F172A',
                marginBottom: 4,
              }}>
                {team.name}
              </Text>
              <Text style={{
                fontSize: 14,
                color: isDarkMode ? '#94a3b8' : '#64748B',
              }}>
                {team.members.length}/{team.max_members} members
              </Text>
            </View>
          </View>

          {team.description && (
            <Text style={{
              fontSize: 16,
              color: isDarkMode ? '#f8fafc' : '#0F172A',
              marginBottom: 16,
              lineHeight: 24,
            }}>
              {team.description}
            </Text>
          )}

          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.primary,
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: 'center',
            }}
            onPress={handleChatWithTeam}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
              Chat with Team
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hackathon Info */}
        <View style={{
          backgroundColor: isDarkMode ? '#1e293b' : 'white',
          borderRadius: 12,
          padding: 20,
          marginBottom: 16,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: isDarkMode ? '#f8fafc' : '#0F172A',
            marginBottom: 12,
          }}>
            Hackathon
          </Text>
          <Text style={{
            fontSize: 16,
            color: isDarkMode ? '#f8fafc' : '#0F172A',
            marginBottom: 8,
          }}>
            {team.hackathon?.title}
          </Text>
          {team.hackathon?.registration_deadline && (
            <Text style={{
              fontSize: 14,
              color: isDarkMode ? '#94a3b8' : '#64748B',
            }}>
              Deadline: {new Date(team.hackathon.registration_deadline).toLocaleDateString()}
            </Text>
          )}
        </View>

        {/* Team Members */}
        <View style={{
          backgroundColor: isDarkMode ? '#1e293b' : 'white',
          borderRadius: 12,
          padding: 20,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: isDarkMode ? '#f8fafc' : '#0F172A',
            marginBottom: 16,
          }}>
            Team Members
          </Text>
          
          {team.member_profiles?.map((member, index) => (
            <TouchableOpacity
              key={member.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: index < team.member_profiles.length - 1 ? 1 : 0,
                borderBottomColor: isDarkMode ? '#334155' : '#E5E7EB',
              }}
              onPress={() => navigation.navigate('UserProfile' as never, { userId: member.id } as never)}
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
                  {member.full_name?.charAt(0) || 'U'}
                </Text>
              </View>
              
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: isDarkMode ? '#f8fafc' : '#0F172A',
                  }}>
                    {member.full_name}
                  </Text>
                  {member.id === team.leader_id && (
                    <View style={{
                      backgroundColor: theme.colors.primary,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 12,
                      marginLeft: 8,
                    }}>
                      <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                        Leader
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={{
                  fontSize: 14,
                  color: isDarkMode ? '#94a3b8' : '#64748B',
                }}>
                  @{member.username}
                </Text>
                {member.skills && member.skills.length > 0 && (
                  <Text style={{
                    fontSize: 12,
                    color: isDarkMode ? '#94a3b8' : '#64748B',
                    marginTop: 4,
                  }}>
                    {member.skills.slice(0, 3).join(', ')}
                    {member.skills.length > 3 && '...'}
                  </Text>
                )}
              </View>
              
              <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#64748b' : '#94A3B8'} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Edit Team Name Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          <View style={{
            backgroundColor: isDarkMode ? '#1e293b' : 'white',
            borderRadius: 12,
            padding: 20,
            width: '100%',
            maxWidth: 400,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: isDarkMode ? '#f8fafc' : '#0F172A',
              marginBottom: 16,
            }}>
              Edit Team Name
            </Text>
            
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: isDarkMode ? '#475569' : '#E2E8F0',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                color: isDarkMode ? '#f8fafc' : '#0F172A',
                backgroundColor: isDarkMode ? '#334155' : '#F8FAFC',
                marginBottom: 16,
              }}
              placeholder="Enter team name"
              placeholderTextColor={isDarkMode ? '#64748b' : '#94A3B8'}
              value={newTeamName}
              onChangeText={setNewTeamName}
              maxLength={50}
            />
            
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: isDarkMode ? '#475569' : '#E5E7EB',
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                onPress={() => {
                  setShowEditModal(false);
                  setNewTeamName(team.name);
                }}
              >
                <Text style={{
                  color: isDarkMode ? '#f8fafc' : '#64748B',
                  fontWeight: '600',
                }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.primary,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                  opacity: loading ? 0.7 : 1,
                }}
                onPress={handleUpdateTeamName}
                disabled={loading}
              >
                <Text style={{
                  color: 'white',
                  fontWeight: '600',
                }}>
                  {loading ? 'Updating...' : 'Update'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
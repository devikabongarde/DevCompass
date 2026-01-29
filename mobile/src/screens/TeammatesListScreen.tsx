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
import { teammatesService } from '../services/supabase';
import { theme } from '../theme';
import { TeamSeeker, Hackathon } from '../types';

export const TeammatesListScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { hackathon } = route.params as { hackathon: Hackathon };
  const { isDarkMode = false } = useThemeStore();
  
  const [teammates, setTeammates] = useState<TeamSeeker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeammates();
  }, []);

  const loadTeammates = async () => {
    try {
      const data = await teammatesService.getTeammates(hackathon.id);
      setTeammates(data);
    } catch (error) {
      console.error('Error loading teammates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async (teammate: TeamSeeker) => {
    try {
      await teammatesService.sendInvite(teammate.user_id, hackathon.id, 'Let\'s team up!');
      Alert.alert('Invite Sent!', `Your team invite has been sent to ${teammate.profile?.full_name}`);
    } catch (error) {
      console.error('Error sending invite:', error);
      Alert.alert('Error', 'Failed to send invite');
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
        onPress={() => handleSendInvite(item)}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>Send Invite</Text>
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
          Looking for Teammates
        </Text>
      </View>

      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{
          fontSize: 16,
          color: isDarkMode ? '#94a3b8' : '#64748B',
          marginBottom: 16,
        }}>
          For: {hackathon.title}
        </Text>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={teammates}
            renderItem={renderTeammate}
            keyExtractor={(item) => item.id}
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
                  No teammates looking yet{'\n'}Be the first to find teammates!
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};
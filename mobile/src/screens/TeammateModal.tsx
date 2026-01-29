import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useThemeStore, useAuthStore, useTeammatesStore } from '../stores';
import { teammatesService, profileService } from '../services/supabase';
import { theme } from '../theme';
import { Hackathon } from '../types';

const COMMON_SKILLS = [
  'React Native', 'JavaScript', 'Python', 'Java', 'Swift',
  'UI/UX Design', 'Backend', 'Frontend', 'Machine Learning',
  'Data Science', 'DevOps', 'Blockchain', 'AI', 'Mobile Dev'
];

export const TeammateModal: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { hackathon } = route.params as { hackathon: Hackathon };
  const { isDarkMode = false } = useThemeStore();
  const { user } = useAuthStore();
  const { checkTeammateStatus } = useTeammatesStore();
  
  const [skills, setSkills] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    if (!user?.id) return;
    
    try {
      const profile = await profileService.getProfile(user.id);
      if (profile) {
        setSkills(profile.skills || []);
        setBio(profile.bio || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setProfileLoaded(true);
    }
  };

  const toggleSkill = (skill: string) => {
    setSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await teammatesService.lookingForTeammates(
        hackathon.id,
        skills.length > 0 ? skills : undefined,
        bio || undefined,
        lookingFor || undefined
      );
      
      // Update local status
      await checkTeammateStatus(hackathon.id);
      
      Alert.alert(
        'Looking for Teammates!',
        "You're now visible to other participants looking for teammates for this hackathon.",
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      console.error('Error:', error);
      if (error.message === 'Already looking for teammates') {
        Alert.alert(
          'Already Looking for Teammates',
          'You are already looking for teammates for this hackathon.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', 'Failed to register for teammate matching');
      }
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    flex: 1,
    backgroundColor: isDarkMode ? '#0f172a' : '#F8FAFC',
  };

  const modalStyle = {
    backgroundColor: isDarkMode ? '#1e293b' : 'white',
    borderRadius: 20,
    margin: 20,
    marginTop: 100,
    flex: 1,
  };

  const headerStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? '#334155' : '#E5E7EB',
  };

  const titleStyle = {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: isDarkMode ? '#f8fafc' : '#0F172A',
  };

  const sectionTitleStyle = {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: isDarkMode ? '#f8fafc' : '#0F172A',
    marginBottom: 12,
  };

  const skillButtonStyle = (selected: boolean) => ({
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: selected 
      ? theme.colors.primary 
      : (isDarkMode ? '#334155' : '#F1F5F9'),
    borderWidth: selected ? 0 : 1,
    borderColor: isDarkMode ? '#475569' : '#E2E8F0',
  });

  const skillTextStyle = (selected: boolean) => ({
    fontSize: 14,
    fontWeight: '500' as const,
    color: selected 
      ? 'white' 
      : (isDarkMode ? '#f8fafc' : '#475569'),
  });

  const inputStyle = {
    borderWidth: 1,
    borderColor: isDarkMode ? '#475569' : '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: isDarkMode ? '#f8fafc' : '#0F172A',
    backgroundColor: isDarkMode ? '#334155' : 'white',
    textAlignVertical: 'top' as const,
  };

  return (
    <Modal visible={true} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={containerStyle}>
        <View style={modalStyle}>
          <View style={headerStyle}>
            <Text style={titleStyle}>Looking for Teammates</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={24} color={isDarkMode ? '#f8fafc' : '#64748B'} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1, padding: 20 }}>
            <View style={{ marginBottom: 24 }}>
              <Text style={[sectionTitleStyle, { color: isDarkMode ? '#94a3b8' : '#64748B' }]}>
                For: {hackathon.title}
              </Text>
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={sectionTitleStyle}>Your Skills</Text>
              <Text style={{
                fontSize: 14,
                color: isDarkMode ? '#94a3b8' : '#64748B',
                marginBottom: 12,
              }}>
                {profileLoaded ? 'Using skills from your profile. Tap to modify:' : 'Loading your profile...'}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {COMMON_SKILLS.map((skill) => (
                  <TouchableOpacity
                    key={skill}
                    style={skillButtonStyle(skills.includes(skill))}
                    onPress={() => toggleSkill(skill)}
                  >
                    <Text style={skillTextStyle(skills.includes(skill))}>
                      {skill}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={sectionTitleStyle}>About You</Text>
              <Text style={{
                fontSize: 14,
                color: isDarkMode ? '#94a3b8' : '#64748B',
                marginBottom: 8,
              }}>
                {profileLoaded ? 'Using bio from your profile. Edit if needed:' : 'Loading...'}
              </Text>
              <TextInput
                style={[inputStyle, { height: 80 }]}
                placeholder="Tell potential teammates about yourself..."
                placeholderTextColor={isDarkMode ? '#64748b' : '#94A3B8'}
                value={bio}
                onChangeText={setBio}
                multiline
                maxLength={200}
              />
            </View>

            <View style={{ marginBottom: 32 }}>
              <Text style={sectionTitleStyle}>Looking For</Text>
              <TextInput
                style={[inputStyle, { height: 80 }]}
                placeholder="What kind of teammates are you looking for?"
                placeholderTextColor={isDarkMode ? '#64748b' : '#94A3B8'}
                value={lookingFor}
                onChangeText={setLookingFor}
                multiline
                maxLength={200}
              />
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.primary,
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
                marginBottom: 20,
                opacity: loading ? 0.7 : 1,
              }}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                {loading ? 'Finding Teammates...' : 'Find Teammates'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
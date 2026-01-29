import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore, useAuthStore } from '../stores';
import { profileService } from '../services/supabase';
import { theme } from '../theme';

const COMMON_SKILLS = [
  'React Native', 'JavaScript', 'Python', 'Java', 'Swift',
  'UI/UX Design', 'Backend', 'Frontend', 'Machine Learning',
  'Data Science', 'DevOps', 'Blockchain', 'AI', 'Mobile Dev'
];

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isDarkMode = false } = useThemeStore();
  const { user, profile, updateProfile } = useAuthStore();
  
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    github_username: profile?.github_username || '',
    linkedin_url: profile?.linkedin_url || '',
    website_url: profile?.website_url || '',
  });
  const [skills, setSkills] = useState<string[]>(profile?.skills || []);
  const [loading, setLoading] = useState(false);

  const toggleSkill = (skill: string) => {
    setSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSave = async () => {
    if (!formData.username.trim()) {
      Alert.alert('Username Required', 'Please enter a username');
      return;
    }
    
    if (!formData.full_name.trim()) {
      Alert.alert('Name Required', 'Please enter your full name');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        username: formData.username.toLowerCase().trim(),
        full_name: formData.full_name.trim(),
        bio: formData.bio.trim() || undefined,
        location: formData.location.trim() || undefined,
        github_username: formData.github_username.trim() || undefined,
        linkedin_url: formData.linkedin_url.trim() || undefined,
        website_url: formData.website_url.trim() || undefined,
        skills,
      });
      
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      if (error.code === '23505') {
        Alert.alert('Username Taken', 'This username is already taken. Please choose another.');
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    borderWidth: 1,
    borderColor: isDarkMode ? '#475569' : '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: isDarkMode ? '#f8fafc' : '#0F172A',
    backgroundColor: isDarkMode ? '#334155' : 'white',
    marginBottom: 16,
  };

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
          Edit Profile
        </Text>
        
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: loading ? (isDarkMode ? '#64748b' : '#94A3B8') : theme.colors.primary,
          }}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={{ flex: 1, padding: 20 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: isDarkMode ? '#f8fafc' : '#0F172A',
            marginBottom: 8,
          }}>
            Username *
          </Text>
          <TextInput
            style={inputStyle}
            placeholder="Choose a unique username"
            placeholderTextColor={isDarkMode ? '#64748b' : '#94A3B8'}
            value={formData.username}
            onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
            autoCapitalize="none"
            maxLength={30}
          />

          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: isDarkMode ? '#f8fafc' : '#0F172A',
            marginBottom: 8,
          }}>
            Full Name *
          </Text>
          <TextInput
            style={inputStyle}
            placeholder="Your full name"
            placeholderTextColor={isDarkMode ? '#64748b' : '#94A3B8'}
            value={formData.full_name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, full_name: text }))}
            maxLength={50}
          />

          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: isDarkMode ? '#f8fafc' : '#0F172A',
            marginBottom: 8,
          }}>
            Bio
          </Text>
          <TextInput
            style={[inputStyle, { height: 80, textAlignVertical: 'top' }]}
            placeholder="Tell others about yourself..."
            placeholderTextColor={isDarkMode ? '#64748b' : '#94A3B8'}
            value={formData.bio}
            onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
            multiline
            maxLength={200}
          />

          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: isDarkMode ? '#f8fafc' : '#0F172A',
            marginBottom: 8,
          }}>
            Skills
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
            {COMMON_SKILLS.map((skill) => (
              <TouchableOpacity
                key={skill}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  marginRight: 8,
                  marginBottom: 8,
                  backgroundColor: skills.includes(skill) 
                    ? theme.colors.primary 
                    : (isDarkMode ? '#334155' : '#F1F5F9'),
                  borderWidth: skills.includes(skill) ? 0 : 1,
                  borderColor: isDarkMode ? '#475569' : '#E2E8F0',
                }}
                onPress={() => toggleSkill(skill)}
              >
                <Text style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: skills.includes(skill) 
                    ? 'white' 
                    : (isDarkMode ? '#f8fafc' : '#475569'),
                }}>
                  {skill}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: isDarkMode ? '#f8fafc' : '#0F172A',
            marginBottom: 8,
          }}>
            Location
          </Text>
          <TextInput
            style={inputStyle}
            placeholder="City, Country"
            placeholderTextColor={isDarkMode ? '#64748b' : '#94A3B8'}
            value={formData.location}
            onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
            maxLength={50}
          />

          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: isDarkMode ? '#f8fafc' : '#0F172A',
            marginBottom: 8,
          }}>
            GitHub Username
          </Text>
          <TextInput
            style={inputStyle}
            placeholder="github-username"
            placeholderTextColor={isDarkMode ? '#64748b' : '#94A3B8'}
            value={formData.github_username}
            onChangeText={(text) => setFormData(prev => ({ ...prev, github_username: text }))}
            autoCapitalize="none"
            maxLength={39}
          />

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
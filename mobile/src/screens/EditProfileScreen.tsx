import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore, useAuthStore } from '../stores';
import { theme } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';

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

      Alert.alert('Success', 'Neural Profile Synchronized!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      if (error.code === '23505') {
        Alert.alert('Username Taken', 'This ID is already allocated. Choose another one.');
      } else {
        Alert.alert('Error', 'Nexus Update Failed. Retry connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = styles.label;
  const inputStyle = styles.input;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A0A', '#1A1A1A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>OPTIMIZE_IDENTITY</Text>
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            {loading ? (
              <Text style={[styles.saveText, { color: '#444' }]}>SAVING...</Text>
            ) : (
              <Text style={styles.saveText}>SYNC</Text>
            )}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
            <Text style={labelStyle}>USERNAME_ID *</Text>
            <TextInput
              style={inputStyle}
              placeholder="Choose a unique ID"
              placeholderTextColor="#444"
              value={formData.username}
              onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
              autoCapitalize="none"
              maxLength={30}
            />

            <Text style={labelStyle}>FULL_NAME *</Text>
            <TextInput
              style={inputStyle}
              placeholder="Your full identifier"
              placeholderTextColor="#444"
              value={formData.full_name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, full_name: text }))}
              maxLength={50}
            />

            <Text style={labelStyle}>SYSTEM.BIO</Text>
            <TextInput
              style={[inputStyle, { height: 100, textAlignVertical: 'top' }]}
              placeholder="Describe your capabilities..."
              placeholderTextColor="#444"
              value={formData.bio}
              onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
              multiline
              maxLength={200}
            />

            <Text style={labelStyle}>TECH_STACK</Text>
            <View style={styles.skillsGrid}>
              {COMMON_SKILLS.map((skill) => (
                <TouchableOpacity
                  key={skill}
                  style={[
                    styles.skillChip,
                    skills.includes(skill) && styles.skillChipActive
                  ]}
                  onPress={() => toggleSkill(skill)}
                >
                  <Text style={[
                    styles.skillChipText,
                    skills.includes(skill) && styles.skillChipTextActive
                  ]}>
                    {skill.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={labelStyle}>PHYSICAL_LOCATION</Text>
            <TextInput
              style={inputStyle}
              placeholder="City, Planet"
              placeholderTextColor="#444"
              value={formData.location}
              onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
              maxLength={50}
            />

            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>EXTERNAL_NEXUS</Text>

            <Text style={labelStyle}>GITHUB_HANDLE</Text>
            <TextInput
              style={inputStyle}
              placeholder="github_username"
              placeholderTextColor="#444"
              value={formData.github_username}
              onChangeText={(text) => setFormData(prev => ({ ...prev, github_username: text }))}
              autoCapitalize="none"
              maxLength={39}
            />

            <Text style={labelStyle}>LINKEDIN_KEY</Text>
            <TextInput
              style={inputStyle}
              placeholder="https://linkedin.com/in/..."
              placeholderTextColor="#444"
              value={formData.linkedin_url}
              onChangeText={(text) => setFormData(prev => ({ ...prev, linkedin_url: text }))}
              autoCapitalize="none"
            />

            <Text style={labelStyle}>PERSONAL_SOURCE</Text>
            <TextInput
              style={inputStyle}
              placeholder="https://yourportal.com"
              placeholderTextColor="#444"
              value={formData.website_url}
              onChangeText={(text) => setFormData(prev => ({ ...prev, website_url: text }))}
              autoCapitalize="none"
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  saveText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#F5A623',
    letterSpacing: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '900',
    color: '#F5A623',
    marginBottom: 10,
    marginTop: 20,
    letterSpacing: 1.5,
  },
  input: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#222',
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  skillChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
  },
  skillChipActive: {
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
    borderColor: '#F5A623',
  },
  skillChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#808080',
    letterSpacing: 1,
  },
  skillChipTextActive: {
    color: '#F5A623',
  },
  divider: {
    height: 1,
    backgroundColor: '#1A1A1A',
    marginVertical: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 10,
    letterSpacing: 2,
  },
});
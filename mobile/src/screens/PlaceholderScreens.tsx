import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSavedStore, useThemeStore } from '../stores';
import { Hackathon } from '../types';

const { width: screenWidth } = Dimensions.get('window');

export const HackathonDetailScreen: React.FC = () => {
  const { isDarkMode = false } = useThemeStore();
  const route = useRoute();
  const navigation = useNavigation();
  const { hackathon } = route.params as { hackathon: Hackathon };
  const { saveHackathon, unsaveHackathon, isSaved } = useSavedStore();

  const handleRegister = async () => {
    try {
      const supported = await Linking.canOpenURL(hackathon.original_url);
      if (supported) {
        await Linking.openURL(hackathon.original_url);
      } else {
        Alert.alert('Error', 'Cannot open this URL');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open registration page');
    }
  };

  const handleSave = async () => {
    try {
      if (isSaved(hackathon.id)) {
        await unsaveHackathon(hackathon.id);
      } else {
        await saveHackathon(hackathon);
      }
    } catch (error) {
      console.error('Error saving hackathon:', error);
    }
  };

  const getPlatformColor = () => {
    return hackathon.platform_source === 'unstop' ? '#FF6B35' : '#003E54';
  };

  const formatDeadline = (deadline?: string) => {
    if (!deadline) return null;
    if (hackathon.description.includes('Dates:')) {
      const dateMatch = hackathon.description.match(/Dates: ([^.]+)/);
      return dateMatch ? dateMatch[1] : 'Check details';
    }
    return 'Check details';
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : 'white' }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header with Banner */}
      <View style={styles.header}>
        {hackathon.banner_url ? (
          <Image source={{ uri: hackathon.banner_url }} style={styles.bannerImage} />
        ) : (
          <LinearGradient
            colors={['#6366f1', '#8b5cf6']}
            style={styles.bannerImage}
          >
            <Ionicons name="code-slash" size={64} color="white" />
          </LinearGradient>
        )}
        
        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.headerOverlay}
        />
        

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons
            name={isSaved(hackathon.id) ? 'heart' : 'heart-outline'}
            size={28}
            color={isSaved(hackathon.id) ? '#EF4444' : 'white'}
          />
        </TouchableOpacity>

        {/* Platform Badge */}
        <View style={[styles.platformBadge, { backgroundColor: getPlatformColor() }]}>
          <Text style={styles.platformText}>
            {hackathon.platform_source.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contentPadding}>
          {/* Title */}
          <Text style={[styles.title, { color: isDarkMode ? '#f8fafc' : '#0F172A' }]}>{hackathon.title}</Text>
          
          {/* Quick Info Cards */}
          <View style={styles.infoCards}>
            {hackathon.prize_money && (
              <View style={[styles.infoCard, { backgroundColor: isDarkMode ? '#1e293b' : '#F8FAFC' }]}>
                <Text style={styles.infoIcon}>💰</Text>
                <Text style={[styles.infoLabel, { color: isDarkMode ? '#94a3b8' : '#64748B' }]}>Prize</Text>
                <Text style={[styles.infoValue, { color: isDarkMode ? '#f8fafc' : '#0F172A' }]}>
                  {(() => {
                    let prize = hackathon.prize_money;
                    // Remove all HTML tags
                    prize = prize.replace(/<[^>]*>/g, '');
                    // Decode HTML entities
                    prize = prize.replace(/&nbsp;/g, ' ');
                    prize = prize.replace(/&amp;/g, '&');
                    prize = prize.replace(/&lt;/g, '<');
                    prize = prize.replace(/&gt;/g, '>');
                    prize = prize.replace(/&quot;/g, '"');
                    // Clean up whitespace
                    prize = prize.replace(/\s+/g, ' ').trim();
                    return prize || 'N/A';
                  })()}
                </Text>
              </View>
            )}
            
            <View style={[styles.infoCard, { backgroundColor: isDarkMode ? '#1e293b' : '#F8FAFC' }]}>
              <Text style={styles.infoIcon}>📅</Text>
              <Text style={[styles.infoLabel, { color: isDarkMode ? '#94a3b8' : '#64748B' }]}>Deadline</Text>
              <Text style={[styles.infoValue, { color: isDarkMode ? '#f8fafc' : '#0F172A' }]}>
                {formatDeadline(hackathon.registration_deadline) || 'Check details'}
              </Text>
            </View>
            
            <View style={[styles.infoCard, { backgroundColor: isDarkMode ? '#1e293b' : '#F8FAFC' }]}>
              <Text style={styles.infoIcon}>🌐</Text>
              <Text style={[styles.infoLabel, { color: isDarkMode ? '#94a3b8' : '#64748B' }]}>Mode</Text>
              <Text style={[styles.infoValue, { color: isDarkMode ? '#f8fafc' : '#0F172A' }]}>
                {hackathon.location_mode || 'Online'}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#f8fafc' : '#0F172A' }]}>About</Text>
            <Text style={[styles.description, { color: isDarkMode ? '#94a3b8' : '#64748B' }]}>{hackathon.description}</Text>
          </View>

          {/* Themes */}
          {hackathon.themes.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDarkMode ? '#f8fafc' : '#0F172A' }]}>Themes & Tracks</Text>
              <View style={styles.themesContainer}>
                {hackathon.themes.map((theme, index) => (
                  <View key={index} style={[styles.themeChip, { backgroundColor: isDarkMode ? '#334155' : '#EEF2FF' }]}>
                    <Text style={[styles.themeText, { color: isDarkMode ? '#a5b4fc' : '#6366F1' }]}>{theme}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Eligibility */}
          {hackathon.eligibility && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDarkMode ? '#f8fafc' : '#0F172A' }]}>Eligibility</Text>
              <Text style={[styles.eligibilityText, { color: isDarkMode ? '#94a3b8' : '#64748B' }]}>{hackathon.eligibility}</Text>
            </View>
          )}

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>

      {/* Fixed Bottom Action */}
      <View style={[styles.bottomAction, { backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)' }]}>
        <TouchableOpacity 
          style={styles.registerButton}
          onPress={handleRegister}
        >
          <Text style={styles.registerButtonText}>Register Now</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    height: 300,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },

  saveButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformBadge: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  platformText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  contentPadding: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 24,
    lineHeight: 36,
  },
  infoCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
  themesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeChip: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  themeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6366F1',
  },
  eligibilityText: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
  bottomSpacing: {
    height: 100,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  registerButton: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
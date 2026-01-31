import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Linking, Alert, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import { Hackathon } from '../types';
import { useThemeStore } from '../stores';
import { messageService, profileService } from '../services/supabase';

const cleanHtmlTags = (text: string): string => {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();
};

// HackathonDetailScreen moved to its own file

// Smart Matching & RecSys
export const RoleMatcherScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Role-Aware Recommender</Text>
    <Text style={styles.subtitle}>Auto-detect missing roles and suggest teammates</Text>
  </View>
);

export const HackathonRecommendationsScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Hackathon Recommendations</Text>
    <Text style={styles.subtitle}>Top hackathons ranked for you</Text>
  </View>
);

export const SynergyScoreScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Team Synergy Score</Text>
    <Text style={styles.subtitle}>Skills complementarity & collaboration graph</Text>
  </View>
);

// Dev Profile Features
export const GitHubImportScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>GitHub Profile Import</Text>
    <Text style={styles.subtitle}>Auto-import languages, repos, contributions</Text>
  </View>
);

export const PortfolioModesScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Portfolio Modes</Text>
    <Text style={styles.subtitle}>Hackathon Mode • Job Mode</Text>
  </View>
);

export const PrivacyControlsScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Privacy Controls</Text>
    <Text style={styles.subtitle}>Granular visibility & anonymous browsing</Text>
  </View>
);

// Social Feed
export const ContentLanesScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Content Lanes</Text>
    <Text style={styles.subtitle}>Team Updates • Demos • Opportunities • Memes</Text>
  </View>
);

export const ProjectDemosScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Project Demos</Text>
    <Text style={styles.subtitle}>30-60s vertical video demos</Text>
  </View>
);

export const FeedControlsScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Feed Controls</Text>
    <Text style={styles.subtitle}>Mute/hide users or topics</Text>
  </View>
);

// Team & Communication
export const TeamChannelsScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Team Channels</Text>
    <Text style={styles.subtitle}>#planning #design #backend #demo</Text>
  </View>
);

export const TaskBoardScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Task Board</Text>
    <Text style={styles.subtitle}>Kanban: Todo • Doing • Done</Text>
  </View>
);

export const MentorHubScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Mentor Hub</Text>
    <Text style={styles.subtitle}>Drop-in help & judge access</Text>
  </View>
);

// Hackathon Ops
export const TimelineViewScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Unified Timeline</Text>
    <Text style={styles.subtitle}>Gantt-style view with all deadlines</Text>
  </View>
);

export const SmartRemindersScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Smart Reminders</Text>
    <Text style={styles.subtitle}>Actionable notifications & team check-ins</Text>
  </View>
);

export const DevpostGeneratorScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Devpost Generator</Text>
    <Text style={styles.subtitle}>Auto-generate project descriptions</Text>
  </View>
);

// Discovery & Community
export const HackathonMapScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Hackathon Map</Text>
    <Text style={styles.subtitle}>Map + filters: online, offline, prize pool</Text>
  </View>
);

export const CommunitiesScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Communities</Text>
    <Text style={styles.subtitle}>VIT Mumbai • GDSC • Web3 India</Text>
  </View>
);

export const ReputationBadgesScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Reputation & Badges</Text>
    <Text style={styles.subtitle}>Shipped 5+ • On-time • Mentor • Organizer</Text>
  </View>
);

// AI Assistant
export const ProjectCopilotScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>AI Project Copilot</Text>
    <Text style={styles.subtitle}>Generate ideas, stack, architecture, roadmap</Text>
  </View>
);

export const PersonalityMatcherScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Personality Matcher</Text>
    <Text style={styles.subtitle}>Work style, time, communication preferences</Text>
  </View>
);

export const RetroAnalyticsScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Retro & Analytics</Text>
    <Text style={styles.subtitle}>Time breakdown, GitHub activity, patterns</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  text: {
    fontSize: 18,
    color: theme.colors.text,
  },
});
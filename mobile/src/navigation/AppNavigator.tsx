import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useEffect } from 'react';

import { useAuthStore, useThemeStore, useFeedStore } from '../stores';
import { theme } from '../theme';
import { RootStackParamList, MainTabParamList } from '../types';

// Screens
import { AuthScreen } from '../screens/AuthScreen';
import { FeedScreen } from '../screens/FeedScreen';
import { SavedScreen } from '../screens/SavedScreen';
import { CalendarScreen, ProfileScreen } from '../screens/CalendarProfileScreens';
import { PeopleScreen } from '../screens/PeopleScreen';
import { TeammateModal } from '../screens/TeammateModal';
import { TeammatesListScreen } from '../screens/TeammatesListScreen';
import { ProfileSetupScreen } from '../screens/ProfileSetupScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { ConversationsScreen } from '../screens/ConversationsScreen';
import { SavedHackathonsScreen, NotificationsScreen, SettingsScreen, HelpSupportScreen } from '../screens/ProfileScreens';
import { FollowersScreen, FollowingScreen } from '../screens/FollowScreens';
import { TeamDetailScreen } from '../screens/TeamDetailScreen';
import { HackathonDetailScreen } from '../screens/HackathonDetailScreen';

// New feature screens
import {
  RoleMatcherScreen,
  HackathonRecommendationsScreen,
  SynergyScoreScreen,
  GitHubImportScreen,
  PortfolioModesScreen,
  PrivacyControlsScreen,
  ContentLanesScreen,
  ProjectDemosScreen,
  FeedControlsScreen,
  TeamChannelsScreen,
  TaskBoardScreen,
  MentorHubScreen,
  TimelineViewScreen,
  SmartRemindersScreen,
  DevpostGeneratorScreen,
  HackathonMapScreen,
  CommunitiesScreen,
  ReputationBadgesScreen,
  ProjectCopilotScreen,
  PersonalityMatcherScreen,
  RetroAnalyticsScreen,
} from '../screens/PlaceholderScreens';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const Drawer = createDrawerNavigator();

// Custom Drawer Content
const CustomDrawerContent = (props: any) => {
  const { isDarkMode = false } = useThemeStore();

  const menuSections = [
    {
      title: '🎯 Smart Matching & RecSys',
      items: [
        { name: 'Role-Aware Recommender', screen: 'RoleMatcher', icon: 'people-circle' },
        { name: 'Hackathon Recommendations', screen: 'HackathonRecommendations', icon: 'trophy' },
        { name: 'Team Synergy Score', screen: 'SynergyScore', icon: 'analytics' },
      ],
    },
    {
      title: '👤 Dev Profile Features',
      items: [
        { name: 'GitHub Profile Import', screen: 'GitHubImport', icon: 'logo-github' },
        { name: 'Portfolio Modes', screen: 'PortfolioModes', icon: 'briefcase' },
        { name: 'Privacy Controls', screen: 'PrivacyControls', icon: 'shield-checkmark' },
      ],
    },
    {
      title: '📱 Social Feed',
      items: [
        { name: 'Content Lanes', screen: 'ContentLanes', icon: 'layers' },
        { name: 'Project Demos', screen: 'ProjectDemos', icon: 'videocam' },
        { name: 'Feed Controls', screen: 'FeedControls', icon: 'options' },
      ],
    },
    {
      title: '🤝 Team & Communication',
      items: [
        { name: 'Team Channels', screen: 'TeamChannels', icon: 'chatbubbles' },
        { name: 'Task Board', screen: 'TaskBoard', icon: 'checkbox' },
        { name: 'Mentor Hub', screen: 'MentorHub', icon: 'school' },
      ],
    },
    {
      title: '⏰ Hackathon Ops',
      items: [
        { name: 'Unified Timeline', screen: 'TimelineView', icon: 'time' },
        { name: 'Smart Reminders', screen: 'SmartReminders', icon: 'notifications' },
        { name: 'Devpost Generator', screen: 'DevpostGenerator', icon: 'document-text' },
      ],
    },
    {
      title: '🌍 Discovery & Community',
      items: [
        { name: 'Hackathon Map', screen: 'HackathonMap', icon: 'map' },
        { name: 'Communities', screen: 'Communities', icon: 'people' },
        { name: 'Reputation & Badges', screen: 'ReputationBadges', icon: 'medal' },
      ],
    },
    {
      title: '🤖 AI Assistant',
      items: [
        { name: 'Project Copilot', screen: 'ProjectCopilot', icon: 'bulb' },
        { name: 'Personality Matcher', screen: 'PersonalityMatcher', icon: 'happy' },
        { name: 'Retro & Analytics', screen: 'RetroAnalytics', icon: 'stats-chart' },
      ],
    },
  ];

  return (
    <ScrollView
      style={[styles.drawerContainer, { backgroundColor: isDarkMode ? '#1e293b' : '#fff' }]}
      contentContainerStyle={styles.drawerContent}
    >
      {/* Header */}
      <View style={[styles.drawerHeader, { backgroundColor: isDarkMode ? '#334155' : theme.colors.primary }]}>
        <Text style={styles.drawerHeaderText}>DevCompass</Text>
        <Text style={styles.drawerHeaderSubtext}>Pro Features</Text>
      </View>

      {/* Menu Sections */}
      {menuSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>
            {section.title}
          </Text>
          {section.items.map((item, itemIndex) => (
            <TouchableOpacity
              key={itemIndex}
              style={[styles.menuItem, { backgroundColor: isDarkMode ? '#1e293b' : '#fff' }]}
              onPress={() => props.navigation.navigate(item.screen)}
            >
              <Ionicons
                name={item.icon as any}
                size={20}
                color={isDarkMode ? '#94a3b8' : theme.colors.primary}
              />
              <Text style={[styles.menuItemText, { color: isDarkMode ? '#f1f5f9' : theme.colors.text }]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {/* Footer */}
      <View style={styles.drawerFooter}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => props.navigation.closeDrawer()}
        >
          <Ionicons name="close-circle" size={24} color={theme.colors.textLight} />
          <Text style={[styles.closeButtonText, { color: isDarkMode ? '#94a3b8' : theme.colors.textLight }]}>
            Close Menu
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const MainTabs: React.FC = () => {
  const { isDarkMode = false } = useThemeStore();
  const { refresh } = useFeedStore();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Feed':
              iconName = focused ? 'flame' : 'flame-outline';
              break;
            case 'Saved':
              iconName = focused ? 'heart' : 'heart-outline';
              break;
            case 'Calendar':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'People':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: isDarkMode ? '#64748b' : theme.colors.textLight,
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#1e293b' : theme.colors.surface,
          borderTopColor: isDarkMode ? '#334155' : 'transparent',
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        headerShown: false,
        tabBarBackground: () => (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
          }} />
        ),
      })}
      screenListeners={{
        tabPress: (e) => {
          if (e.target?.includes('Feed')) {
            refresh();
          }
        },
      }}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Saved" component={SavedScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="People" component={PeopleScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Drawer Navigator with Main Tabs
const DrawerNavigator: React.FC = () => {
  const { isDarkMode = false } = useThemeStore();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false, // Hide all headers by default
        drawerStyle: {
          backgroundColor: isDarkMode ? '#1e293b' : '#fff',
          width: 300,
        },
      }}
    >
      <Drawer.Screen
        name="Home"
        component={MainTabs}
        options={{
          headerShown: false, // No header for main tabs
        }}
      />
      {/* Smart Matching & RecSys */}
      <Drawer.Screen name="RoleMatcher" component={RoleMatcherScreen} options={{ title: 'Role-Aware Recommender' }} />
      <Drawer.Screen name="HackathonRecommendations" component={HackathonRecommendationsScreen} options={{ title: 'Hackathon Recommendations' }} />
      <Drawer.Screen name="SynergyScore" component={SynergyScoreScreen} options={{ title: 'Team Synergy Score' }} />

      {/* Dev Profile Features */}
      <Drawer.Screen name="GitHubImport" component={GitHubImportScreen} options={{ title: 'GitHub Import' }} />
      <Drawer.Screen name="PortfolioModes" component={PortfolioModesScreen} options={{ title: 'Portfolio Modes' }} />
      <Drawer.Screen name="PrivacyControls" component={PrivacyControlsScreen} options={{ title: 'Privacy Controls' }} />

      {/* Social Feed */}
      <Drawer.Screen name="ContentLanes" component={ContentLanesScreen} options={{ title: 'Content Lanes' }} />
      <Drawer.Screen name="ProjectDemos" component={ProjectDemosScreen} options={{ title: 'Project Demos' }} />
      <Drawer.Screen name="FeedControls" component={FeedControlsScreen} options={{ title: 'Feed Controls' }} />

      {/* Team & Communication */}
      <Drawer.Screen name="TeamChannels" component={TeamChannelsScreen} options={{ title: 'Team Channels' }} />
      <Drawer.Screen name="TaskBoard" component={TaskBoardScreen} options={{ title: 'Task Board' }} />
      <Drawer.Screen name="MentorHub" component={MentorHubScreen} options={{ title: 'Mentor Hub' }} />

      {/* Hackathon Ops */}
      <Drawer.Screen name="TimelineView" component={TimelineViewScreen} options={{ title: 'Unified Timeline' }} />
      <Drawer.Screen name="SmartReminders" component={SmartRemindersScreen} options={{ title: 'Smart Reminders' }} />
      <Drawer.Screen name="DevpostGenerator" component={DevpostGeneratorScreen} options={{ title: 'Devpost Generator' }} />

      {/* Discovery & Community */}
      <Drawer.Screen name="HackathonMap" component={HackathonMapScreen} options={{ title: 'Hackathon Map' }} />
      <Drawer.Screen name="Communities" component={CommunitiesScreen} options={{ title: 'Communities' }} />
      <Drawer.Screen name="ReputationBadges" component={ReputationBadgesScreen} options={{ title: 'Reputation & Badges' }} />

      {/* AI Assistant */}
      <Drawer.Screen name="ProjectCopilot" component={ProjectCopilotScreen} options={{ title: 'AI Project Copilot' }} />
      <Drawer.Screen name="PersonalityMatcher" component={PersonalityMatcherScreen} options={{ title: 'Personality Matcher' }} />
      <Drawer.Screen name="RetroAnalytics" component={RetroAnalyticsScreen} options={{ title: 'Retro & Analytics' }} />
    </Drawer.Navigator>
  );
};

const LoadingScreen: React.FC = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
    <ActivityIndicator size="large" color={theme.colors.primary} />
  </View>
);

export const AppNavigator: React.FC = () => {
  const { user, loading, loadUser, profile } = useAuthStore();
  const { isDarkMode = false } = useThemeStore();

  useEffect(() => {
    loadUser();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: theme.colors.background },
        }}
      >
        {user ? (
          profile ? (
            <>
              <Stack.Screen name="Main" component={DrawerNavigator} />
              <Stack.Screen
                name="HackathonDetail"
                component={HackathonDetailScreen}
                options={{
                  headerShown: true,
                  headerTitle: '',
                  headerBackTitleVisible: false,
                  headerStyle: {
                    backgroundColor: isDarkMode ? '#1e293b' : theme.colors.surface,
                    shadowColor: 'transparent',
                    elevation: 0,
                  },
                  headerTintColor: isDarkMode ? '#f8fafc' : theme.colors.text,
                }}
              />
              <Stack.Screen name="SavedHackathons" component={SavedHackathonsScreen} />
              <Stack.Screen name="Notifications" component={NotificationsScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
              <Stack.Screen name="TeammateModal" component={TeammateModal} options={{ presentation: 'modal' }} />
              <Stack.Screen name="TeammatesListScreen" component={TeammatesListScreen} />
              <Stack.Screen name="ChatScreen" component={ChatScreen} />
              <Stack.Screen name="ConversationsScreen" component={ConversationsScreen} />
              <Stack.Screen name="UserProfile" component={UserProfileScreen} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="Followers" component={FollowersScreen} />
              <Stack.Screen name="Following" component={FollowingScreen} />
              <Stack.Screen name="TeamDetail" component={TeamDetailScreen} />
            </>
          ) : (
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          )
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
  },
  drawerContent: {
    paddingBottom: 20,
  },
  drawerHeader: {
    padding: 20,
    paddingTop: 50,
    marginBottom: 10,
  },
  drawerHeaderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  drawerHeaderSubtext: {
    fontSize: 14,
    color: '#e2e8f0',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  menuItemText: {
    fontSize: 15,
    marginLeft: 12,
    fontWeight: '500',
  },
  drawerFooter: {
    marginTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  closeButtonText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '600',
  },
});
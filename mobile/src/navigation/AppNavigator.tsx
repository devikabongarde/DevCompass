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
import HistoricalIntelligenceScreen from '../screens/HistoricalIntelligenceScreen';

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
        { name: 'Historical Intelligence', screen: 'HistoricalIntelligence', icon: 'analytics' },
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
      style={[styles.drawerContainer, { backgroundColor: '#0A0A0A' }]}
      contentContainerStyle={styles.drawerContent}
    >
      {/* Premium Header with Gold Gradient */}
      <View style={[styles.drawerHeader, { backgroundColor: '#1A1A1A' }]}>
        <Text style={styles.drawerHeaderText}>
          <Text style={{ color: '#F5A623' }}>Dev</Text>
          <Text style={{ color: '#FFFFFF' }}>Compass</Text>
        </Text>
        <View style={styles.goldLine} />
        <Text style={styles.drawerHeaderSubtext}>Premium Features</Text>
      </View>

      {/* Menu Sections */}
      {menuSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#F5A623' }]}>
            {section.title}
          </Text>
          {section.items.map((item, itemIndex) => (
            <TouchableOpacity
              key={itemIndex}
              style={[styles.menuItem, { backgroundColor: '#1A1A1A', borderColor: 'rgba(245, 166, 35, 0.1)' }]}
              onPress={() => props.navigation.navigate(item.screen)}
            >
              <View style={styles.menuItemIconContainer}>
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color="#F5A623"
                />
              </View>
              <Text style={[styles.menuItemText, { color: '#FFFFFF' }]}>
                {item.name}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#808080" />
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
          <Ionicons name="close-circle" size={24} color="#F5A623" />
          <Text style={[styles.closeButtonText, { color: '#B8B8B8' }]}>
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
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Feed') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Saved') {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
          } else if (route.name === 'Calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'People') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#F5A623', // Premium gold
        tabBarInactiveTintColor: '#808080', // Gray
        tabBarStyle: {
          backgroundColor: '#0A0A0A', // Pure black
          borderTopWidth: 1,
          borderTopColor: 'rgba(245, 166, 35, 0.2)', // Gold border
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
            backgroundColor: 'rgba(10, 10, 10, 0.98)', // Dark with slight transparency
            borderTopWidth: 1,
            borderTopColor: 'rgba(245, 166, 35, 0.2)',
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
      <Drawer.Screen name="HistoricalIntelligence" component={HistoricalIntelligenceScreen} options={{ title: 'Historical Intelligence' }} />

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
                  headerShown: false,
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
    fontSize: 26,
    fontWeight: 'bold',
  },
  goldLine: {
    height: 2,
    backgroundColor: '#F5A623',
    marginVertical: 12,
    width: 60,
  },
  drawerHeaderSubtext: {
    fontSize: 13,
    color: '#B8B8B8',
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
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
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 6,
    borderWidth: 1,
  },
  menuItemIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 15,
    marginLeft: 12,
    fontWeight: '600',
    flex: 1,
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
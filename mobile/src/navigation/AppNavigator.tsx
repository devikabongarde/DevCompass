import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

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
import { HackathonDetailScreen } from '../screens/PlaceholderScreens';
import { SavedHackathonsScreen, NotificationsScreen, SettingsScreen, HelpSupportScreen } from '../screens/ProfileScreens';
import { FollowersScreen, FollowingScreen } from '../screens/FollowScreens';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

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
              <Stack.Screen name="Main" component={MainTabs} />
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
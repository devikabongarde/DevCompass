import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSavedStore, useThemeStore } from '../stores';
import { theme } from '../theme';

export const SavedHackathonsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { savedHackathons, unsaveHackathon } = useSavedStore();
  const { isDarkMode = false } = useThemeStore();

  const handleHackathonPress = (hackathon: any) => {
    navigation.navigate('HackathonDetail' as never, { hackathon } as never);
  };

  const handleUnsave = async (hackathonId: string) => {
    try {
      await unsaveHackathon(hackathonId);
    } catch (error) {
      console.error('Error unsaving hackathon:', error);
    }
  };

  const containerStyle = {
    flex: 1,
    backgroundColor: isDarkMode ? '#0f172a' : '#F8FAFC',
  };

  const headerStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: isDarkMode ? '#1e293b' : 'white',
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? '#334155' : '#E5E7EB',
  };

  const headerTitleStyle = {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: isDarkMode ? '#f8fafc' : '#0F172A',
  };

  const hackathonCardStyle = {
    backgroundColor: isDarkMode ? '#1e293b' : 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  };

  const hackathonTitleStyle = {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: isDarkMode ? '#f8fafc' : '#0F172A',
    flex: 1,
    marginRight: 12,
  };

  const descriptionStyle = {
    fontSize: 14,
    color: isDarkMode ? '#94a3b8' : '#64748B',
    lineHeight: 20,
  };

  const emptyTitleStyle = {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: isDarkMode ? '#f8fafc' : '#0F172A',
    marginTop: 16,
    marginBottom: 8,
  };

  const emptyTextStyle = {
    fontSize: 14,
    color: isDarkMode ? '#94a3b8' : '#64748B',
    textAlign: 'center' as const,
    paddingHorizontal: 32,
  };

  return (
    <SafeAreaView style={containerStyle}>
      <View style={headerStyle}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#f8fafc' : '#0F172A'} />
        </TouchableOpacity>
        <Text style={headerTitleStyle}>Saved Hackathons</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {savedHackathons.length > 0 ? (
          savedHackathons.map((hackathon) => (
            <TouchableOpacity
              key={hackathon.id}
              style={hackathonCardStyle}
              onPress={() => handleHackathonPress(hackathon)}
            >
              <View style={styles.cardHeader}>
                <Text style={hackathonTitleStyle} numberOfLines={2}>
                  {hackathon.title}
                </Text>
                <TouchableOpacity
                  onPress={() => handleUnsave(hackathon.id)}
                  style={styles.unsaveButton}
                >
                  <Ionicons name="heart" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.cardContent}>
                <View style={[
                  styles.platformBadge,
                  { backgroundColor: hackathon.platform_source === 'unstop' ? '#FF6B35' : '#003E54' }
                ]}>
                  <Text style={styles.platformText}>
                    {hackathon.platform_source.toUpperCase()}
                  </Text>
                </View>
                
                {hackathon.prize_money && (
                  <Text style={styles.prizeText}>
                    💰 {hackathon.prize_money.replace(/<[^>]*>/g, '').replace(/&gt;/g, '>')}
                  </Text>
                )}
                
                <Text style={descriptionStyle} numberOfLines={3}>
                  {hackathon.short_summary || hackathon.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color={isDarkMode ? '#64748b' : '#94A3B8'} />
            <Text style={emptyTitleStyle}>No Saved Hackathons</Text>
            <Text style={emptyTextStyle}>
              Swipe left on hackathons in the feed to save them here
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isDarkMode = false } = useThemeStore();
  const [notifications, setNotifications] = useState({
    deadlineReminders: true,
    newHackathons: true,
    prizeUpdates: false,
    weeklyDigest: true,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const containerStyle = {
    flex: 1,
    backgroundColor: isDarkMode ? '#0f172a' : '#F8FAFC',
  };

  const headerStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: isDarkMode ? '#1e293b' : 'white',
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? '#334155' : '#E5E7EB',
  };

  const headerTitleStyle = {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: isDarkMode ? '#f8fafc' : '#0F172A',
  };

  const sectionStyle = {
    backgroundColor: isDarkMode ? '#1e293b' : 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden' as const,
  };

  const sectionTitleStyle = {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: isDarkMode ? '#f8fafc' : '#0F172A',
    padding: 16,
    paddingBottom: 8,
  };

  const settingTitleStyle = {
    fontSize: 16,
    fontWeight: '500' as const,
    color: isDarkMode ? '#f8fafc' : '#0F172A',
    marginBottom: 4,
  };

  const settingDescriptionStyle = {
    fontSize: 14,
    color: isDarkMode ? '#94a3b8' : '#64748B',
  };

  return (
    <SafeAreaView style={containerStyle}>
      <View style={headerStyle}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#f8fafc' : '#0F172A'} />
        </TouchableOpacity>
        <Text style={headerTitleStyle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={sectionStyle}>
          <Text style={sectionTitleStyle}>Hackathon Alerts</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={settingTitleStyle}>Deadline Reminders</Text>
              <Text style={settingDescriptionStyle}>
                Get notified 24 hours before registration deadlines
              </Text>
            </View>
            <Switch
              value={notifications.deadlineReminders}
              onValueChange={() => toggleNotification('deadlineReminders')}
              trackColor={{ false: '#E5E7EB', true: theme.colors.primary }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={settingTitleStyle}>New Hackathons</Text>
              <Text style={settingDescriptionStyle}>
                Be the first to know about new hackathons
              </Text>
            </View>
            <Switch
              value={notifications.newHackathons}
              onValueChange={() => toggleNotification('newHackathons')}
              trackColor={{ false: '#E5E7EB', true: theme.colors.primary }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={settingTitleStyle}>Prize Updates</Text>
              <Text style={settingDescriptionStyle}>
                Get notified when prize amounts change
              </Text>
            </View>
            <Switch
              value={notifications.prizeUpdates}
              onValueChange={() => toggleNotification('prizeUpdates')}
              trackColor={{ false: '#E5E7EB', true: theme.colors.primary }}
            />
          </View>
        </View>

        <View style={sectionStyle}>
          <Text style={sectionTitleStyle}>Digest</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={settingTitleStyle}>Weekly Digest</Text>
              <Text style={settingDescriptionStyle}>
                Weekly summary of trending hackathons
              </Text>
            </View>
            <Switch
              value={notifications.weeklyDigest}
              onValueChange={() => toggleNotification('weeklyDigest')}
              trackColor={{ false: '#E5E7EB', true: theme.colors.primary }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isDarkMode = false, toggleDarkMode } = useThemeStore();
  const [settings, setSettings] = useState({
    autoRefresh: true,
    showPlatformBadges: true,
    compactView: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const containerStyle = {
    flex: 1,
    backgroundColor: isDarkMode ? '#0f172a' : '#F8FAFC',
  };

  const headerStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: isDarkMode ? '#1e293b' : 'white',
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? '#334155' : '#E5E7EB',
  };

  const headerTitleStyle = {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: isDarkMode ? '#f8fafc' : '#0F172A',
  };

  const sectionStyle = {
    backgroundColor: isDarkMode ? '#1e293b' : 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden' as const,
  };

  const sectionTitleStyle = {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: isDarkMode ? '#f8fafc' : '#0F172A',
    padding: 16,
    paddingBottom: 8,
  };

  const settingTitleStyle = {
    fontSize: 16,
    fontWeight: '500' as const,
    color: isDarkMode ? '#f8fafc' : '#0F172A',
    marginBottom: 4,
  };

  const settingDescriptionStyle = {
    fontSize: 14,
    color: isDarkMode ? '#94a3b8' : '#64748B',
  };

  return (
    <SafeAreaView style={containerStyle}>
      <View style={headerStyle}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#f8fafc' : '#0F172A'} />
        </TouchableOpacity>
        <Text style={headerTitleStyle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={sectionStyle}>
          <Text style={sectionTitleStyle}>Appearance</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={settingTitleStyle}>Dark Mode</Text>
              <Text style={settingDescriptionStyle}>
                Switch to dark theme for better night viewing
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#E5E7EB', true: theme.colors.primary }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={settingTitleStyle}>Show Platform Badges</Text>
              <Text style={settingDescriptionStyle}>
                Display Unstop/Devpost badges on cards
              </Text>
            </View>
            <Switch
              value={settings.showPlatformBadges}
              onValueChange={() => toggleSetting('showPlatformBadges')}
              trackColor={{ false: '#E5E7EB', true: theme.colors.primary }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={settingTitleStyle}>Compact View</Text>
              <Text style={settingDescriptionStyle}>
                Show more hackathons in less space
              </Text>
            </View>
            <Switch
              value={settings.compactView}
              onValueChange={() => toggleSetting('compactView')}
              trackColor={{ false: '#E5E7EB', true: theme.colors.primary }}
            />
          </View>
        </View>

        <View style={sectionStyle}>
          <Text style={sectionTitleStyle}>Data & Sync</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={settingTitleStyle}>Auto Refresh</Text>
              <Text style={settingDescriptionStyle}>
                Automatically refresh hackathons when app opens
              </Text>
            </View>
            <Switch
              value={settings.autoRefresh}
              onValueChange={() => toggleSetting('autoRefresh')}
              trackColor={{ false: '#E5E7EB', true: theme.colors.primary }}
            />
          </View>
        </View>

        <View style={sectionStyle}>
          <Text style={sectionTitleStyle}>About</Text>
          
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: isDarkMode ? '#334155' : '#F1F5F9' }]}>
            <Text style={[styles.menuItemText, { color: isDarkMode ? '#f8fafc' : '#0F172A' }]}>Version</Text>
            <Text style={[styles.menuItemValue, { color: isDarkMode ? '#94a3b8' : '#64748B' }]}>1.0.0</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: isDarkMode ? '#334155' : '#F1F5F9' }]}>
            <Text style={[styles.menuItemText, { color: isDarkMode ? '#f8fafc' : '#0F172A' }]}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#94a3b8' : '#94A3B8'} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: isDarkMode ? '#334155' : '#F1F5F9' }]}>
            <Text style={[styles.menuItemText, { color: isDarkMode ? '#f8fafc' : '#0F172A' }]}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#94a3b8' : '#94A3B8'} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export const HelpSupportScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isDarkMode = false } = useThemeStore();

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@devcompass.app?subject=DevCompass Support');
  };

  const handleReportBug = () => {
    Linking.openURL('mailto:bugs@devcompass.app?subject=Bug Report');
  };

  const handleFeatureRequest = () => {
    Linking.openURL('mailto:features@devcompass.app?subject=Feature Request');
  };

  const containerStyle = {
    flex: 1,
    backgroundColor: isDarkMode ? '#0f172a' : '#F8FAFC',
  };

  const headerStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: isDarkMode ? '#1e293b' : 'white',
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? '#334155' : '#E5E7EB',
  };

  const headerTitleStyle = {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: isDarkMode ? '#f8fafc' : '#0F172A',
  };

  const sectionStyle = {
    backgroundColor: isDarkMode ? '#1e293b' : 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden' as const,
  };

  const sectionTitleStyle = {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: isDarkMode ? '#f8fafc' : '#0F172A',
    padding: 16,
    paddingBottom: 8,
  };

  const helpTitleStyle = {
    fontSize: 16,
    fontWeight: '500' as const,
    color: isDarkMode ? '#f8fafc' : '#0F172A',
    marginBottom: 4,
  };

  const helpDescriptionStyle = {
    fontSize: 14,
    color: isDarkMode ? '#94a3b8' : '#64748B',
  };

  const faqQuestionStyle = {
    fontSize: 16,
    fontWeight: '500' as const,
    color: isDarkMode ? '#f8fafc' : '#0F172A',
    marginBottom: 8,
  };

  const faqAnswerStyle = {
    fontSize: 14,
    color: isDarkMode ? '#94a3b8' : '#64748B',
    lineHeight: 20,
  };

  return (
    <SafeAreaView style={containerStyle}>
      <View style={headerStyle}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#f8fafc' : '#0F172A'} />
        </TouchableOpacity>
        <Text style={headerTitleStyle}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={sectionStyle}>
          <Text style={sectionTitleStyle}>Get Help</Text>
          
          <TouchableOpacity style={styles.helpItem} onPress={handleContactSupport}>
            <Ionicons name="mail" size={24} color={theme.colors.primary} />
            <View style={styles.helpInfo}>
              <Text style={helpTitleStyle}>Contact Support</Text>
              <Text style={helpDescriptionStyle}>
                Get help with your account or technical issues
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#64748b' : '#94A3B8'} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.helpItem} onPress={handleReportBug}>
            <Ionicons name="bug" size={24} color={theme.colors.primary} />
            <View style={styles.helpInfo}>
              <Text style={helpTitleStyle}>Report a Bug</Text>
              <Text style={helpDescriptionStyle}>
                Found something that's not working? Let us know
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#64748b' : '#94A3B8'} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.helpItem} onPress={handleFeatureRequest}>
            <Ionicons name="bulb" size={24} color={theme.colors.primary} />
            <View style={styles.helpInfo}>
              <Text style={helpTitleStyle}>Request a Feature</Text>
              <Text style={helpDescriptionStyle}>
                Have an idea to make DevCompass better?
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#64748b' : '#94A3B8'} />
          </TouchableOpacity>
        </View>

        <View style={sectionStyle}>
          <Text style={sectionTitleStyle}>FAQ</Text>
          
          <View style={styles.faqItem}>
            <Text style={faqQuestionStyle}>How do I save hackathons?</Text>
            <Text style={faqAnswerStyle}>
              Swipe left on any hackathon card in the feed to save it to your calendar and saved list.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={faqQuestionStyle}>How often is data updated?</Text>
            <Text style={faqAnswerStyle}>
              We update hackathon data daily from Unstop and Devpost to ensure you have the latest information.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={faqQuestionStyle}>Can I participate in multiple hackathons?</Text>
            <Text style={faqAnswerStyle}>
              Yes! You can save and track multiple hackathons. Check each hackathon's rules for participation requirements.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  hackathonCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  hackathonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    flex: 1,
    marginRight: 12,
  },
  unsaveButton: {
    padding: 4,
  },
  cardContent: {
    gap: 8,
  },
  platformBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  platformText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  prizeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    padding: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuItemText: {
    fontSize: 16,
    color: '#0F172A',
  },
  menuItemValue: {
    fontSize: 16,
    color: '#64748B',
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  helpInfo: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 4,
  },
  helpDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  faqItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
});
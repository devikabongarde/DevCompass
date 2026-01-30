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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSavedStore, useThemeStore } from '../stores';
import { theme } from '../theme';

// --- Shared Components ---
const Header = ({ title }: { title: string }) => {
  const navigation = useNavigation();
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#F5A623" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={{ width: 40 }} />
    </View>
  );
};

const PremiumSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.sectionContainer}>
    <View style={styles.sectionHeader}>
      <View style={styles.goldBar} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={styles.sectionContent}>
      {children}
    </View>
  </View>
);

// --- Saved Hackathons Screen ---
export const SavedHackathonsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { savedHackathons, unsaveHackathon } = useSavedStore();

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

  return (
    <View style={styles.container}>
      <Header title="Saved Hackathons" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {savedHackathons.length > 0 ? (
          savedHackathons.map((hackathon) => (
            <TouchableOpacity
              key={hackathon.id}
              style={styles.hackathonCard}
              onPress={() => handleHackathonPress(hackathon)}
            >
              {/* Blurred Background for Card */}
              {hackathon.banner_url && (
                <View style={StyleSheet.absoluteFillObject}>
                  <View style={{ backgroundColor: '#000', opacity: 0.7 }} />
                </View>
              )}

              <View style={styles.hackathonCardHeader}>
                <View style={[styles.platformBadge, {
                  backgroundColor: hackathon.platform_source === 'unstop' ? '#FF6B35' :
                    hackathon.platform_source === 'devpost' ? '#003E54' : '#F5A623',
                  borderColor: 'rgba(255,255,255,0.2)',
                  borderWidth: 1
                }]}>
                  <Text style={styles.platformText}>{hackathon.platform_source.toUpperCase()}</Text>
                </View>
                <TouchableOpacity onPress={() => handleUnsave(hackathon.id)} style={styles.iconButton}>
                  <Ionicons name="bookmark" size={22} color="#F5A623" />
                </TouchableOpacity>
              </View>

              <Text style={styles.hackathonTitle} numberOfLines={2}>{hackathon.title}</Text>

              <View style={styles.hackathonFooter}>
                {hackathon.prize_money && (
                  <View style={styles.metaItem}>
                    <Ionicons name="trophy" size={14} color="#FFD700" />
                    <Text style={styles.metaText}>{hackathon.prize_money.replace(/<[^>]*>/g, '')}</Text>
                  </View>
                )}
                <View style={styles.metaItem}>
                  <Ionicons name="arrow-forward-circle" size={18} color="#F5A623" />
                  <Text style={[styles.metaText, { color: '#F5A623' }]}>View Details</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="bookmark-outline" size={64} color="#F5A623" />
            </View>
            <Text style={styles.emptyTitle}>No Saved Data</Text>
            <Text style={styles.emptyText}>Swipe right on cards to save them here.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// --- Notifications Screen ---
export const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState({
    deadlineReminders: true,
    newHackathons: true,
    prizeUpdates: false,
    weeklyDigest: true,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const NotificationToggle = ({ label, desc, value, onToggle }: any) => (
    <View style={styles.settingRow}>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDesc}>{desc}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#333', true: 'rgba(245, 166, 35, 0.5)' }}
        thumbColor={value ? '#F5A623' : '#666'}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Notifications" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <PremiumSection title="Alerts">
          <NotificationToggle
            label="Deadline Reminders"
            desc="24h before registration closes"
            value={notifications.deadlineReminders}
            onToggle={() => toggleNotification('deadlineReminders')}
          />
          <NotificationToggle
            label="New Hackathons"
            desc="Immediate alerts for new drops"
            value={notifications.newHackathons}
            onToggle={() => toggleNotification('newHackathons')}
          />
          <NotificationToggle
            label="Prize Updates"
            desc="Notify when prize pool increases"
            value={notifications.prizeUpdates}
            onToggle={() => toggleNotification('prizeUpdates')}
          />
        </PremiumSection>

        <PremiumSection title="Digest">
          <NotificationToggle
            label="Weekly Report"
            desc="Summary of top hackathons"
            value={notifications.weeklyDigest}
            onToggle={() => toggleNotification('weeklyDigest')}
          />
        </PremiumSection>
      </ScrollView>
    </View>
  );
};

// --- Settings Screen ---
export const SettingsScreen: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const [settings, setSettings] = useState({
    autoRefresh: true,
    showPlatformBadges: true,
    compactView: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const SettingRow = ({ label, desc, value, onToggle, isSwitch = true }: any) => (
    <TouchableOpacity style={styles.settingRow} onPress={isSwitch ? onToggle : undefined} activeOpacity={isSwitch ? 1 : 0.7}>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingLabel}>{label}</Text>
        {desc && <Text style={styles.settingDesc}>{desc}</Text>}
      </View>
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#333', true: 'rgba(245, 166, 35, 0.5)' }}
          thumbColor={value ? '#F5A623' : '#666'}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#666" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Settings" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <PremiumSection title="Appearance">
          <SettingRow
            label="Dark Mode"
            desc="Always on for premium feel"
            value={true} // Forced True for this UI
            onToggle={() => { }} // Disabled
            isSwitch={true}
          />
          <SettingRow
            label="Show Badges"
            desc="Display platform icons on cards"
            value={settings.showPlatformBadges}
            onToggle={() => toggleSetting('showPlatformBadges')}
          />
        </PremiumSection>

        <PremiumSection title="Legal">
          <SettingRow label="Privacy Policy" onToggle={() => { }} isSwitch={false} />
          <SettingRow label="Terms of Service" onToggle={() => { }} isSwitch={false} />
          <SettingRow label="App Version" desc="v1.2.0 (Premium Build)" onToggle={() => { }} isSwitch={false} />
        </PremiumSection>

        <TouchableOpacity style={styles.dangerButton}>
          <Text style={styles.dangerButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// --- Help & Support Screen ---
export const HelpSupportScreen: React.FC = () => {
  const handleContact = (type: string) => {
    // Mock action
    Alert.alert('Opening Support', ` contacting ${type}...`);
  };

  const SupportItem = ({ icon, title, desc }: any) => (
    <TouchableOpacity style={styles.supportItem} onPress={() => handleContact(title)}>
      <View style={styles.supportIconContainer}>
        <Ionicons name={icon} size={24} color="#F5A623" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.supportTitle}>{title}</Text>
        <Text style={styles.supportDesc}>{desc}</Text>
      </View>
      <Ionicons name="open-outline" size={20} color="#666" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Help & Support" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <PremiumSection title="Contact Us">
          <SupportItem icon="mail" title="Email Support" desc="Get help within 24h" />
          <SupportItem icon="bug" title="Report Bug" desc="Found an issue? Let us know" />
          <SupportItem icon="bulb" title="Feature Request" desc="Request new features" />
        </PremiumSection>

        <PremiumSection title="FAQ">
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How do I apply?</Text>
            <Text style={styles.faqAnswer}>Click the 'Apply' button on any hackathon card to visit the official registration page.</Text>
          </View>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Is it free?</Text>
            <Text style={styles.faqAnswer}>The app is free to use. Most hackathons are free, but check specific rules.</Text>
          </View>
        </PremiumSection>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A', // Pure Black Background
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60, // Safe area
    paddingBottom: 20,
    backgroundColor: '#0A0A0A',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F5A623',
    letterSpacing: 0.5,
  },
  // Section Wrapper
  sectionContainer: {
    marginTop: 24,
    backgroundColor: '#111',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  goldBar: {
    width: 4,
    height: 16,
    backgroundColor: '#F5A623',
    marginRight: 10,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#AAA',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionContent: {
    padding: 0,
  },
  // Settings Row
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 13,
    color: '#666',
  },
  // Saved Hackathon Card
  hackathonCard: {
    backgroundColor: '#151515',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#222',
    overflow: 'hidden',
    padding: 16,
  },
  hackathonCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  platformBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  platformText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  iconButton: {
    padding: 4,
  },
  hackathonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
    lineHeight: 24,
  },
  hackathonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#CCC',
    fontWeight: '500',
  },
  // Support
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
    gap: 16,
  },
  supportIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 2,
  },
  supportDesc: {
    fontSize: 13,
    color: '#666',
  },
  // FAQ
  faqItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F5A623',
    marginBottom: 6,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#CCC',
    lineHeight: 20,
  },
  // Others
  dangerButton: {
    marginTop: 32,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#EF4444',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(245, 166, 35, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.2)',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
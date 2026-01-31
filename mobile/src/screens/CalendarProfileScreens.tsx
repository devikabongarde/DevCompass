import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore, useSavedStore, useThemeStore } from '../stores';
import { theme } from '../theme';

export const CalendarScreen: React.FC = () => {
  const { isDarkMode = false } = useThemeStore();
  const navigation = useNavigation<any>();
  const { savedHackathons } = useSavedStore();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getHackathonDates = (hackathon: any) => {
    const dates = [];
    const now = new Date();

    // Try to find start and end dates
    const possibleStartFields = [
      hackathon.start_date,
      hackathon.event_start_date,
      hackathon.hackathon_start_date,
      hackathon.begin_date
    ];

    const possibleEndFields = [
      hackathon.end_date,
      hackathon.event_end_date,
      hackathon.hackathon_end_date,
      hackathon.registration_deadline,
      hackathon.deadline,
      hackathon.submission_deadline
    ];

    let startDate = null;
    let endDate = null;

    // Find start date
    for (const dateField of possibleStartFields) {
      if (dateField) {
        try {
          const date = new Date(dateField);
          if (!isNaN(date.getTime())) {
            startDate = date;
            break;
          }
        } catch (e) { }
      }
    }

    // Find end date
    for (const dateField of possibleEndFields) {
      if (dateField) {
        try {
          const date = new Date(dateField);
          if (!isNaN(date.getTime())) {
            endDate = date;
            break;
          }
        } catch (e) { }
      }
    }

    // Determine which date to use
    let targetDate = null;

    if (startDate && endDate) {
      // If hackathon is ongoing (start date passed, end date future)
      if (startDate <= now && endDate >= now) {
        targetDate = now; // Show on current date
      } else {
        targetDate = startDate; // Show on start date
      }
    } else if (startDate) {
      targetDate = startDate;
    } else if (endDate) {
      targetDate = endDate;
    }

    if (targetDate) {
      dates.push({
        year: targetDate.getFullYear(),
        month: targetDate.getMonth(),
        day: targetDate.getDate()
      });
    }

    // If no structured dates found, try to extract from description
    if (dates.length === 0 && hackathon.description) {
      const datePatterns = [
        /\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\b/gi,
        /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})\b/gi,
        /\b(\d{4})-(\d{2})-(\d{2})\b/g
      ];

      for (const pattern of datePatterns) {
        const matches = hackathon.description.match(pattern);
        if (matches && matches.length > 0) {
          try {
            const date = new Date(matches[0]);
            if (!isNaN(date.getTime())) {
              dates.push({
                year: date.getFullYear(),
                month: date.getMonth(),
                day: date.getDate()
              });
              break;
            }
          } catch (e) { }
        }
      }
    }

    // If still no dates found, use current date as fallback
    if (dates.length === 0) {
      dates.push({
        year: now.getFullYear(),
        month: now.getMonth(),
        day: now.getDate()
      });
    }

    return dates;
  };

  const getHackathonsForDate = (day: number) => {
    return savedHackathons.filter(hackathon => {
      const hackathonDates = getHackathonDates(hackathon);
      return hackathonDates.some(date =>
        date.year === selectedYear &&
        date.month === selectedMonth &&
        date.day === day
      );
    });
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.emptyDay} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const hackathonsForDay = getHackathonsForDate(day);
      const hasEvent = hackathonsForDay.length > 0;

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            hasEvent && styles.dayWithEvent,
            selectedDay === day && styles.selectedDay
          ]}
          onPress={() => setSelectedDay(selectedDay === day ? null : day)}
        >
          <Text style={[
            styles.dayText,
            { color: '#FFFFFF' },
            hasEvent && styles.dayTextWithEvent,
            selectedDay === day && styles.selectedDayText
          ]}>
            {day}
          </Text>
          {hasEvent && <View style={styles.eventDot} />}
        </TouchableOpacity>
      );
    }

    return days;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#0A0A0A' }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: '#0A0A0A', borderBottomWidth: 1, borderBottomColor: 'rgba(245, 166, 35, 0.2)' }]}>
          <Text style={[styles.title, { color: '#FFFFFF' }]}>
            <Text style={{ color: '#F5A623' }}>Calen</Text>
            <Text style={{ color: '#FFFFFF' }}>dar</Text>
          </Text>
          <Text style={[styles.subtitle, { color: '#B8B8B8' }]}>{savedHackathons.length} saved hackathons</Text>
        </View>

        {/* Premium Month/Year Selector */}
        <View style={[styles.monthSelector, { backgroundColor: 'rgba(26, 26, 26, 0.9)', borderWidth: 1, borderColor: 'rgba(245, 166, 35, 0.2)' }]}>
          <TouchableOpacity
            style={{
              padding: 8,
              borderRadius: 8,
              backgroundColor: 'rgba(245, 166, 35, 0.1)',
            }}
            onPress={() => {
              if (selectedMonth === 0) {
                setSelectedMonth(11);
                setSelectedYear(selectedYear - 1);
              } else {
                setSelectedMonth(selectedMonth - 1);
              }
            }}
          >
            <Ionicons name="chevron-back" size={24} color="#F5A623" />
          </TouchableOpacity>

          <Text style={[styles.monthYear, { color: '#F5A623', fontWeight: '800', fontSize: 20 }]}>
            {months[selectedMonth]} {selectedYear}
          </Text>

          <TouchableOpacity
            style={{
              padding: 8,
              borderRadius: 8,
              backgroundColor: 'rgba(245, 166, 35, 0.1)',
            }}
            onPress={() => {
              if (selectedMonth === 11) {
                setSelectedMonth(0);
                setSelectedYear(selectedYear + 1);
              } else {
                setSelectedMonth(selectedMonth + 1);
              }
            }}
          >
            <Ionicons name="chevron-forward" size={24} color="#F5A623" />
          </TouchableOpacity>
        </View>

        {/* Premium Calendar Grid */}
        <View style={[styles.calendar, { backgroundColor: 'rgba(26, 26, 26, 0.9)', borderWidth: 1, borderColor: 'rgba(245, 166, 35, 0.2)' }]}>
          {/* Day Headers */}
          <View style={styles.dayHeaders}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <Text key={day} style={[styles.dayHeader, { color: '#F5A623', fontWeight: '700' }]}>{day}</Text>
            ))}
          </View>

          {/* Calendar Days */}
          <View style={styles.daysGrid}>
            {renderCalendarGrid().map((day, index) => {
              if (React.isValidElement(day)) {
                return React.cloneElement(day as any, {
                  key: (day as any).key || index,
                  style: [
                    (day as any).props.style,
                    (day as any).props.children && (day as any).props.children[0] && {
                      color: '#FFFFFF'
                    }
                  ]
                });
              }
              return day;
            })}
          </View>
        </View>

        {/* Hackathons for Selected Day */}
        {selectedDay && (
          <View style={[styles.selectedDayEvents, { backgroundColor: 'rgba(26, 26, 26, 0.9)', borderWidth: 1, borderColor: 'rgba(245, 166, 35, 0.2)' }]}>
            <Text style={[styles.selectedDayTitle, { color: '#F5A623', fontWeight: '800' }]}>
              {months[selectedMonth]} {selectedDay}, {selectedYear}
            </Text>
            {getHackathonsForDate(selectedDay).map((hackathon) => (
              <TouchableOpacity
                key={hackathon.id}
                style={[styles.dayEventCard, { backgroundColor: 'rgba(245, 166, 35, 0.08)', borderWidth: 1, borderColor: 'rgba(245, 166, 35, 0.2)' }]}
                onPress={() => navigation.navigate('HackathonDetail' as any, { hackathon } as any)}
              >
                <View style={styles.hackathonHeader}>
                  <Text style={[styles.hackathonTitle, { color: '#FFFFFF' }]} numberOfLines={2}>
                    {hackathon.title}
                  </Text>
                  <View style={[
                    styles.platformBadge,
                    { backgroundColor: '#F5A623', borderWidth: 1, borderColor: '#FFD700' }
                  ]}>
                    <Text style={[styles.platformText, { color: '#0A0A0A', fontWeight: '800' }]}>
                      {hackathon.platform_source.toUpperCase()}
                    </Text>
                  </View>
                </View>
                {hackathon.prize_money && (
                  <Text style={styles.hackathonPrize}>
                    💰 {hackathon.prize_money.replace(/<[^>]*>/g, '').replace(/&gt;/g, '>')}
                  </Text>
                )}
                <Text style={[styles.hackathonDescription, { color: '#B8B8B8' }]} numberOfLines={2}>
                  {hackathon.short_summary || hackathon.description}
                </Text>
                <View style={styles.tapHint}>
                  <Text style={[styles.tapHintText, { color: isDarkMode ? '#64748b' : '#94A3B8' }]}>Tap for details</Text>
                  <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#64748b' : '#94A3B8'} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, profile, signOut } = useAuthStore();
  const { savedHackathons } = useSavedStore();
  const { isDarkMode = false } = useThemeStore();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#0A0A0A' }]}>
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* Profile Header Premium */}
        <LinearGradient
          colors={['rgba(245, 166, 35, 0.15)', 'rgba(10, 10, 10, 0)']}
          style={styles.profileHeaderPremium}
        >
          <View style={[styles.avatarContainerLarge, { borderColor: '#F5A623', borderWidth: 2 }]}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatarImageSmall} />
            ) : (
              <Ionicons name="person" size={40} color="#F5A623" />
            )}
          </View>
          <Text style={styles.userNamePremium}>{profile?.full_name || 'Neural Developer'}</Text>
          <Text style={styles.userEmailPremium}>{user?.email}</Text>

          <TouchableOpacity
            style={styles.viewProfileButton}
            onPress={() => navigation.navigate('UserProfile', { userId: user?.id })}
          >
            <LinearGradient
              colors={['#FFD700', '#F5A623']}
              style={styles.viewProfileGradient}
            >
              <Text style={styles.viewProfileText}>ACCESS FULL PORTFOLIO</Text>
              <Ionicons name="flash" size={14} color="#0A0A0A" />
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsContainerPremium}>
          <View style={styles.statCardPremium}>
            <Text style={styles.statNumberPremium}>{savedHackathons.length}</Text>
            <Text style={styles.statLabelPremium}>SAVED</Text>
          </View>
          <View style={styles.statCardPremium}>
            <Text style={styles.statNumberPremium}>{profile?.hackathons_participated || 0}</Text>
            <Text style={styles.statLabelPremium}>SHIPPED</Text>
          </View>
          <View style={styles.statCardPremium}>
            <Text style={styles.statNumberPremium}>{profile?.followers_count || 0}</Text>
            <Text style={styles.statLabelPremium}>EQUITY</Text>
          </View>
        </View>

        {/* Portfolio Mini Preview */}
        {profile?.github_username && (
          <View style={styles.previewContainer}>
            <View style={styles.previewHeader}>
              <Ionicons name="logo-github" size={18} color="#F5A623" />
              <Text style={styles.previewTitle}>GITHUB_STATUS</Text>
            </View>
            <TouchableOpacity
              style={styles.previewCard}
              onPress={() => navigation.navigate('UserProfile', { userId: user?.id })}
            >
              <View style={styles.heatmapMini}>
                {Array.from({ length: 28 }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.heatmapSquareMini,
                      { backgroundColor: i % 5 === 0 ? '#F5A623' : '#1F1F1F' }
                    ]}
                  />
                ))}
              </View>
              <View style={styles.previewInfo}>
                <Text style={styles.previewInfoText}>@{profile.github_username}</Text>
                <Ionicons name="chevron-forward" size={14} color="#F5A623" />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Menu Section */}
        <View style={styles.menuSectionPremium}>
          <TouchableOpacity style={styles.menuItemPremium} onPress={() => navigation.navigate('SavedHackathons')}>
            <View style={styles.menuIconContainer}><Ionicons name="bookmark" size={20} color="#F5A623" /></View>
            <Text style={styles.menuTextPremium}>Saved Hackathons</Text>
            <Ionicons name="chevron-forward" size={18} color="#4A4A4A" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItemPremium} onPress={() => navigation.navigate('Notifications')}>
            <View style={styles.menuIconContainer}><Ionicons name="notifications" size={20} color="#F5A623" /></View>
            <Text style={styles.menuTextPremium}>Notifications</Text>
            <Ionicons name="chevron-forward" size={18} color="#4A4A4A" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItemPremium} onPress={() => navigation.navigate('Settings')}>
            <View style={styles.menuIconContainer}><Ionicons name="settings" size={20} color="#F5A623" /></View>
            <Text style={styles.menuTextPremium}>Settings</Text>
            <Ionicons name="chevron-forward" size={18} color="#4A4A4A" />
          </TouchableOpacity>
        </View>

        {/* Support & Logout */}
        <View style={styles.footerSection}>
          <TouchableOpacity style={styles.menuItemPremium} onPress={() => navigation.navigate('HelpSupport')}>
            <View style={styles.menuIconContainer}><Ionicons name="help-buoy" size={20} color="#F5A623" /></View>
            <Text style={styles.menuTextPremium}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={18} color="#4A4A4A" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButtonPremium} onPress={handleSignOut}>
            <Ionicons name="log-out" size={20} color="#EF4444" />
            <Text style={styles.logoutTextPremium}>TERMINATE SESSION</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Will be overridden by inline style
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 4,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  calendar: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
  },
  dayHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  dayHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    width: 40,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  emptyDay: {
    width: '14.28%',
    height: 40,
  },
  dayText: {
    fontSize: 16,
    color: '#0F172A', // Will be overridden by inline style
  },
  eventDot: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F5A623',
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  hackathonsList: {
    flex: 1,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  hackathonCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  hackathonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  hackathonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    flex: 1,
    marginRight: 12,
  },
  platformBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  platformText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  hackathonPrize: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 12,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
  },
  dayWithEvent: {
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.3)',
  },
  selectedDay: {
    backgroundColor: '#F5A623',
    borderRadius: 20,
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  dayTextWithEvent: {
    color: '#F5A623',
    fontWeight: '800' as const,
  },
  selectedDayText: {
    color: 'white',
  },
  selectedDayEvents: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
  },
  selectedDayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  dayEventCard: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  hackathonDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginTop: 8,
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  tapHintText: {
    fontSize: 12,
    color: '#94A3B8',
    marginRight: 4,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#64748B',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F5A623',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  menuContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    marginLeft: 12,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  signOutText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
    marginLeft: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: '#64748B',
  },
  // New Premium Profile Styles
  profileHeaderPremium: {
    alignItems: 'center',
    padding: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 24,
  },
  avatarContainerLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarImageSmall: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  userNamePremium: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  userEmailPremium: {
    color: '#808080',
    fontSize: 14,
    marginBottom: 20,
  },
  viewProfileButton: {
    width: 220,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  viewProfileGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  viewProfileText: {
    color: '#0A0A0A',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  statsContainerPremium: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 32,
  },
  statCardPremium: {
    flex: 1,
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  statNumberPremium: {
    color: '#F5A623',
    fontSize: 20,
    fontWeight: '900',
  },
  statLabelPremium: {
    color: '#444',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: 1,
  },
  previewContainer: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  previewTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  previewCard: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#333',
  },
  heatmapMini: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    width: 120,
  },
  heatmapSquareMini: {
    width: 6,
    height: 6,
    borderRadius: 1,
  },
  previewInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  previewInfoText: {
    color: '#F5A623',
    fontSize: 14,
    fontWeight: '700',
  },
  menuSectionPremium: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  menuItemPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#222',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 166, 35, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuTextPremium: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footerSection: {
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  logoutButtonPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 12,
    marginTop: 12,
  },
  logoutTextPremium: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
});

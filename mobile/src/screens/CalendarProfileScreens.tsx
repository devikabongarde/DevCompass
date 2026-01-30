import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore, useSavedStore, useThemeStore } from '../stores';
import { theme } from '../theme';

export const CalendarScreen: React.FC = () => {
  const { isDarkMode = false } = useThemeStore();
  const navigation = useNavigation();
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
        } catch (e) {}
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
        } catch (e) {}
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
          } catch (e) {}
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
            { color: isDarkMode ? '#f8fafc' : '#0F172A' },
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
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : '#F8FAFC' }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: isDarkMode ? '#1e293b' : 'white' }]}>
        <Text style={[styles.title, { color: isDarkMode ? '#f8fafc' : '#0F172A' }]}>Calendar</Text>
        <Text style={[styles.subtitle, { color: isDarkMode ? '#94a3b8' : '#64748B' }]}>{savedHackathons.length} saved hackathons</Text>
      </View>

      {/* Month/Year Selector */}
      <View style={[styles.monthSelector, { backgroundColor: isDarkMode ? '#1e293b' : 'white' }]}>
        <TouchableOpacity 
          onPress={() => {
            if (selectedMonth === 0) {
              setSelectedMonth(11);
              setSelectedYear(selectedYear - 1);
            } else {
              setSelectedMonth(selectedMonth - 1);
            }
          }}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        
        <Text style={[styles.monthYear, { color: isDarkMode ? '#f8fafc' : '#0F172A' }]}>
          {months[selectedMonth]} {selectedYear}
        </Text>
        
        <TouchableOpacity 
          onPress={() => {
            if (selectedMonth === 11) {
              setSelectedMonth(0);
              setSelectedYear(selectedYear + 1);
            } else {
              setSelectedMonth(selectedMonth + 1);
            }
          }}
        >
          <Ionicons name="chevron-forward" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Calendar Grid */}
      <View style={[styles.calendar, { backgroundColor: isDarkMode ? '#1e293b' : 'white' }]}>
        {/* Day Headers */}
        <View style={styles.dayHeaders}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Text key={day} style={[styles.dayHeader, { color: isDarkMode ? '#94a3b8' : '#64748B' }]}>{day}</Text>
          ))}
        </View>
        
        {/* Calendar Days */}
        <View style={styles.daysGrid}>
          {renderCalendarGrid().map((day, index) => {
            if (React.isValidElement(day)) {
              return React.cloneElement(day, {
                key: day.key || index,
                style: [
                  day.props.style,
                  day.props.children && day.props.children[0] && {
                    color: isDarkMode ? '#f8fafc' : '#0F172A'
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
        <View style={[styles.selectedDayEvents, { backgroundColor: isDarkMode ? '#1e293b' : 'white' }]}>
          <Text style={[styles.selectedDayTitle, { color: isDarkMode ? '#f8fafc' : '#0F172A' }]}>
            {months[selectedMonth]} {selectedDay}, {selectedYear}
          </Text>
          {getHackathonsForDate(selectedDay).map((hackathon) => (
            <TouchableOpacity 
              key={hackathon.id} 
              style={[styles.dayEventCard, { backgroundColor: isDarkMode ? '#334155' : '#F8FAFC' }]}
              onPress={() => navigation.navigate('HackathonDetail' as never, { hackathon } as never)}
            >
              <View style={styles.hackathonHeader}>
                <Text style={[styles.hackathonTitle, { color: isDarkMode ? '#f8fafc' : '#0F172A' }]} numberOfLines={2}>
                  {hackathon.title}
                </Text>
                <View style={[
                  styles.platformBadge,
                  { backgroundColor: hackathon.platform_source === 'unstop' ? '#FF6B35' : '#003E54' }
                ]}>
                  <Text style={styles.platformText}>
                    {hackathon.platform_source.toUpperCase()}
                  </Text>
                </View>
              </View>
              {hackathon.prize_money && (
                <Text style={styles.hackathonPrize}>
                  💰 {hackathon.prize_money.replace(/<[^>]*>/g, '').replace(/&gt;/g, '>')}
                </Text>
              )}
              <Text style={[styles.hackathonDescription, { color: isDarkMode ? '#94a3b8' : '#64748B' }]} numberOfLines={2}>
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
  const navigation = useNavigation();
  const { user, signOut } = useAuthStore();
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
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : '#F8FAFC' }]}>
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: isDarkMode ? '#1e293b' : 'white' }]}>
          <View style={[styles.avatarContainer, { backgroundColor: isDarkMode ? '#334155' : '#EEF2FF' }]}>
            <Ionicons name="person" size={40} color={theme.colors.primary} />
          </View>
          <Text style={[styles.userName, { color: isDarkMode ? '#f8fafc' : '#0F172A' }]}>{user?.email || 'User'}</Text>
          <Text style={[styles.userEmail, { color: isDarkMode ? '#94a3b8' : '#64748B' }]}>{user?.email}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: isDarkMode ? '#1e293b' : 'white' }]}>
            <Text style={styles.statNumber}>{savedHackathons.length}</Text>
            <Text style={[styles.statLabel, { color: isDarkMode ? '#94a3b8' : '#64748B' }]}>Saved Hackathons</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDarkMode ? '#1e293b' : 'white' }]}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={[styles.statLabel, { color: isDarkMode ? '#94a3b8' : '#64748B' }]}>Participated</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{
          backgroundColor: isDarkMode ? '#1e293b' : 'white',
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          marginHorizontal: 16,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: isDarkMode ? '#f8fafc' : '#0F172A',
            marginBottom: 16,
          }}>
            Quick Actions
          </Text>
          
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: isDarkMode ? '#334155' : '#E5E7EB',
            }}
            onPress={() => navigation.navigate('UserProfile' as never, { userId: user?.id } as never)}
          >
            <Ionicons name="person-outline" size={20} color={theme.colors.primary} />
            <Text style={{
              fontSize: 16,
              color: isDarkMode ? '#f8fafc' : '#0F172A',
              marginLeft: 12,
              flex: 1,
            }}>
              View Full Profile
            </Text>
            <Ionicons name="chevron-forward" size={16} color={isDarkMode ? '#64748b' : '#94A3B8'} />
          </TouchableOpacity>

        </View>
        <View style={[styles.menuContainer, { backgroundColor: isDarkMode ? '#1e293b' : 'white' }]}>
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: isDarkMode ? '#334155' : '#F1F5F9' }]}
            onPress={() => navigation.navigate('SavedHackathons' as never)}
          >
            <Ionicons name="heart" size={24} color={theme.colors.primary} />
            <Text style={[styles.menuText, { color: isDarkMode ? '#f8fafc' : '#0F172A' }]}>Saved Hackathons</Text>
            <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#94a3b8' : '#94A3B8'} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: isDarkMode ? '#334155' : '#F1F5F9' }]}
            onPress={() => navigation.navigate('Notifications' as never)}
          >
            <Ionicons name="notifications" size={24} color={theme.colors.primary} />
            <Text style={[styles.menuText, { color: isDarkMode ? '#f8fafc' : '#0F172A' }]}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#94a3b8' : '#94A3B8'} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: isDarkMode ? '#334155' : '#F1F5F9' }]}
            onPress={() => navigation.navigate('Settings' as never)}
          >
            <Ionicons name="settings" size={24} color={theme.colors.primary} />
            <Text style={[styles.menuText, { color: isDarkMode ? '#f8fafc' : '#0F172A' }]}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#94a3b8' : '#94A3B8'} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: isDarkMode ? '#334155' : '#F1F5F9' }]}
            onPress={() => navigation.navigate('HelpSupport' as never)}
          >
            <Ionicons name="help-circle" size={24} color={theme.colors.primary} />
            <Text style={[styles.menuText, { color: isDarkMode ? '#f8fafc' : '#0F172A' }]}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#94a3b8' : '#94A3B8'} />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={[styles.signOutButton, { backgroundColor: isDarkMode ? '#1e293b' : 'white' }]} onPress={handleSignOut}>
          <Ionicons name="log-out" size={24} color="#EF4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
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
    backgroundColor: theme.colors.primary,
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
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
  },
  selectedDay: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
  },
  dayTextWithEvent: {
    color: theme.colors.primary,
    fontWeight: 'bold',
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
    color: theme.colors.primary,
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
});
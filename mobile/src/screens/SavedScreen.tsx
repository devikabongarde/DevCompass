import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSavedStore, useThemeStore } from '../stores';
import { theme } from '../theme';
import { Hackathon } from '../types';

export const SavedScreen: React.FC = () => {
  const { isDarkMode = false } = useThemeStore();
  const navigation = useNavigation();
  const { savedHackathons, loading, loadSaved } = useSavedStore();

  useEffect(() => {
    loadSaved();
  }, []);

  const handleHackathonPress = (hackathon: Hackathon) => {
    navigation.navigate('HackathonDetail' as never, { hackathon } as never);
  };

  const renderHackathon = ({ item }: { item: Hackathon }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: isDarkMode ? '#1e293b' : theme.colors.surface }]}
      onPress={() => handleHackathonPress(item)}
    >
      <View style={styles.cardContent}>
        <Text style={[styles.title, { color: isDarkMode ? '#f8fafc' : theme.colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.summary, { color: isDarkMode ? '#94a3b8' : theme.colors.textSecondary }]} numberOfLines={2}>
          {item.short_summary || item.description}
        </Text>
        
        <View style={styles.cardFooter}>
          <View style={styles.platformBadge}>
            <Text style={styles.platformText}>
              {item.platform_source.toUpperCase()}
            </Text>
          </View>
          
          {item.registration_deadline && (
            <View style={styles.deadlineContainer}>
              <Ionicons name="time-outline" size={14} color={theme.colors.error} />
              <Text style={styles.deadlineText}>
                {new Date(item.registration_deadline).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bookmark-outline" size={64} color={isDarkMode ? '#64748b' : theme.colors.textLight} />
      <Text style={[styles.emptyTitle, { color: isDarkMode ? '#f8fafc' : theme.colors.text }]}>No saved hackathons</Text>
      <Text style={[styles.emptySubtitle, { color: isDarkMode ? '#94a3b8' : theme.colors.textSecondary }]}>
        Save hackathons from the feed to see them here
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: isDarkMode ? '#334155' : theme.colors.border, backgroundColor: isDarkMode ? '#1e293b' : 'transparent' }]}>
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#f8fafc' : theme.colors.text }]}>Saved Hackathons</Text>
        <Text style={[styles.headerSubtitle, { color: isDarkMode ? '#94a3b8' : theme.colors.textSecondary }]}>
          {savedHackathons.length} hackathon{savedHackathons.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {loading && savedHackathons.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={savedHackathons}
          renderItem={renderHackathon}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContainer, { flexGrow: 1 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={loadSaved}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={renderEmpty}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  cardContent: {
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  summary: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
    marginBottom: theme.spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  platformBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  platformText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  deadlineText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error,
    fontWeight: theme.typography.fontWeight.medium,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
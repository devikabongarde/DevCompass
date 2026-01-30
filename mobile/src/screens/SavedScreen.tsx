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
      style={[styles.card, { backgroundColor: '#1A1A1A', borderColor: 'rgba(245, 166, 35, 0.2)', borderWidth: 1 }]}
      onPress={() => handleHackathonPress(item)}
    >
      <View style={styles.cardContent}>
        <Text style={[styles.title, { color: '#FFFFFF' }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.summary, { color: '#B8B8B8' }]} numberOfLines={2}>
          {item.short_summary || item.description}
        </Text>

        <View style={styles.cardFooter}>
          <View style={[styles.platformBadge, { backgroundColor: '#F5A623', borderColor: '#FFD700', borderWidth: 1 }]}>
            <Text style={[styles.platformText, { color: '#0A0A0A', fontWeight: '800' }]}>
              {item.platform_source.toUpperCase()}
            </Text>
          </View>

          {item.registration_deadline && (
            <View style={styles.deadlineContainer}>
              <Ionicons name="time-outline" size={14} color="#EF4444" />
              <Text style={[styles.deadlineText, { color: '#EF4444', fontWeight: '600' }]}>
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
      <View style={styles.emptyIconContainer}>
        <Ionicons name="bookmark-outline" size={64} color="#F5A623" />
      </View>
      <Text style={[styles.emptyTitle, { color: '#FFFFFF' }]}>No saved hackathons</Text>
      <Text style={[styles.emptySubtitle, { color: '#B8B8B8' }]}>
        Save hackathons from the feed to see them here
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#0A0A0A' }]}>
      <View style={[styles.header, { borderBottomColor: 'rgba(245, 166, 35, 0.2)', backgroundColor: '#0A0A0A' }]}>
        <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>
          <Text style={{ color: '#F5A623' }}>Saved</Text> Hackathons
        </Text>
        <Text style={[styles.headerSubtitle, { color: '#B8B8B8' }]}>
          {savedHackathons.length} hackathon{savedHackathons.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {loading && savedHackathons.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F5A623" />
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
              tintColor="#F5A623"
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
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(245, 166, 35, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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
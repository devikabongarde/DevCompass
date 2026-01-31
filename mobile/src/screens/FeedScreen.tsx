import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useFeedStore, useSavedStore, useThemeStore, useTeammatesStore } from '../stores';
import { theme } from '../theme';
import { Hackathon } from '../types';
import { HackathonCard } from '../components/HackathonCard';
import { messageService, profileService } from '../services/supabase';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
const TOP_BAR_OFFSET = 110;
const BOTTOM_OFFSET = 20;
const CARD_HEIGHT = screenHeight - TOP_BAR_OFFSET - BOTTOM_OFFSET;

export const FeedScreen: React.FC = () => {
  const { isDarkMode = false } = useThemeStore();
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const {
    hackathons,
    loading,
    error,
    hasMore,
    refreshing,
    loadHackathons,
    loadMore,
    refresh,
    filters,
    setFilters
  } = useFeedStore();

  const THEMES = ["AI", "Blockchain", "Web", "Mobile", "Data Science", "Cybersecurity", "IoT", "Cloud", "Fintech", "Healthtech"];
  const LOCATIONS = ["online", "offline", "hybrid"];
  const PLATFORMS = ["unstop", "devpost", "devfolio", "hackclub"];

  const toggleFilter = (type: 'themes' | 'locationMode' | 'platforms', value: string) => {
    const currentFilters = filters[type] || [];
    const newFilters = currentFilters.includes(value as any)
      ? currentFilters.filter(item => item !== value)
      : [...currentFilters, value];

    setFilters({ [type]: newFilters });
  };

  const activeFiltersCount = (filters.themes?.length || 0) + (filters.locationMode?.length || 0) + (filters.platforms?.length || 0);

  const { saveHackathon, unsaveHackathon, isSaved } = useSavedStore();
  const { checkTeammateStatus, isLookingFor } = useTeammatesStore();

  useEffect(() => {
    if (hackathons.length === 0) {
      loadHackathons(true);
    }
    // Check teammate status for visible hackathons
    hackathons.forEach(hackathon => {
      checkTeammateStatus(hackathon.id);
    });
  }, [hackathons.length, loadHackathons, checkTeammateStatus]);

  const handleViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const handleEndReached = () => {
    if (hasMore && !loading) {
      loadMore();
    }
  };

  const handleHackathonPress = (hackathon: Hackathon) => {
    navigation.navigate('HackathonDetail' as never, { hackathon } as never);
  };

  const handleShare = async (hackathon: Hackathon) => {
    setSelectedHackathon(hackathon);
    try {
      const results = await profileService.searchProfiles('');
      setSearchResults(results.slice(0, 10));
      setShareModalVisible(true);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleSendToUser = async (userId: string, userName: string) => {
    if (!selectedHackathon) return;

    try {
      await messageService.sendMessage(
        userId,
        `Check out this hackathon: ${selectedHackathon.title}\n\n${selectedHackathon.short_summary || selectedHackathon.description}\n\nRegister: ${selectedHackathon.original_url}`,
        undefined,
        selectedHackathon.id
      );
      setShareModalVisible(false);
      Alert.alert('Shared!', `Hackathon shared with ${userName}`);
    } catch (error) {
      console.error('Error sharing hackathon:', error);
      Alert.alert('Error', 'Failed to share hackathon');
    }
  };

  const handleSave = async (hackathon: Hackathon) => {
    try {
      if (isSaved(hackathon.id)) {
        await unsaveHackathon(hackathon.id);
      } else {
        await saveHackathon(hackathon);
      }
    } catch (error) {
      console.error('Error saving hackathon:', error);
    }
  };

  const renderHackathon = useCallback(({ item }: { item: Hackathon }) => {
    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 100) {
          // Swipe right - find teammates
          navigation.navigate('TeammatesListScreen' as never, { hackathon: item } as never);
        } else if (gestureState.dx < -100) {
          // Swipe left - save hackathon
          handleSave(item);
        }
      },
    });

    return (
      <View {...panResponder.panHandlers} style={{ height: CARD_HEIGHT, justifyContent: 'center' }}>
        <HackathonCard
          hackathon={item}
          onSave={() => handleSave(item)}
          onPress={() => handleHackathonPress(item)}
          onShare={handleShare}
        />
      </View>
    );
  }, []);

  const renderEmpty = () => {
    if (loading && hackathons.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.emptyText}>Loading hackathons...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle" size={64} color={theme.colors.error} />
          <Text style={styles.errorText}>Failed to load hackathons</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refresh()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search" size={64} color={theme.colors.textLight} />
        <Text style={styles.emptyText}>No hackathons found</Text>
        <Text style={styles.emptySubtext}>Pull down to refresh</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Premium Top Bar with Gold Accents */}
      <View style={[styles.topBar, { backgroundColor: isDarkMode ? 'rgba(10,10,10,0.95)' : 'rgba(0,0,0,0.9)' }]}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity
            style={[styles.iconButton, styles.goldButton]}
            onPress={() => (navigation as any).openDrawer()}
          >
            <Ionicons name="menu" size={26} color="#F5A623" />
          </TouchableOpacity>
          <Text style={styles.logo}>
            <Text style={styles.logoGold}>Dev</Text>
            <Text style={styles.logoWhite}>Compass</Text>
          </Text>
        </View>
        <View style={styles.topBarRight}>
          <TouchableOpacity
            style={[styles.iconButton, styles.glassButton, activeFiltersCount > 0 && styles.activeFilterButton]}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="filter" size={24} color={activeFiltersCount > 0 ? "#FFFFFF" : "#F5A623"} />
            {activeFiltersCount > 0 && <View style={styles.notificationBadge} />}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconButton, styles.glassButton]}>
            <Ionicons name="notifications-outline" size={24} color="#F5A623" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton}>
            <View style={[styles.avatar, { backgroundColor: '#F5A623', borderColor: '#FFD700', borderWidth: 2 }]}>
              <Ionicons name="person" size={18} color="#0A0A0A" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed */}
      <FlatList
        ref={flatListRef}
        data={hackathons}
        renderItem={renderHackathon}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: TOP_BAR_OFFSET,
          paddingBottom: BOTTOM_OFFSET,
        }}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={CARD_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor="white"
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={renderEmpty}
        removeClippedSubviews={true}
        maxToRenderPerBatch={2}
        windowSize={3}
        initialNumToRender={1}
        scrollEventThrottle={16}
        getItemLayout={(data, index) => ({
          length: CARD_HEIGHT,
          offset: CARD_HEIGHT * index + TOP_BAR_OFFSET,
          index,
        })}
      />

      {/* Progress Indicator */}
      {hackathons.length > 0 && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: isDarkMode ? 'rgba(51,65,85,0.5)' : 'rgba(255,255,255,0.3)' }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentIndex + 1) / hackathons.length) * 100}%`,
                  backgroundColor: isDarkMode ? '#6366f1' : 'white',
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: isDarkMode ? '#94a3b8' : 'white' }]}>
            {currentIndex + 1} / {hackathons.length}
          </Text>
        </View>
      )}

      {/* Share Modal */}
      {shareModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={[styles.shareModal, { backgroundColor: isDarkMode ? '#1e293b' : 'white' }]}>
            <Text style={[styles.shareTitle, { color: isDarkMode ? '#f8fafc' : '#0F172A' }]}>
              Share Hackathon
            </Text>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.userItem}
                  onPress={() => handleSendToUser(item.id, item.full_name)}
                >
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {item.full_name?.charAt(0) || 'U'}
                    </Text>
                  </View>
                  <Text style={[styles.userName, { color: isDarkMode ? '#f8fafc' : '#0F172A' }]}>
                    {item.full_name}
                  </Text>
                </TouchableOpacity>
              )}
              style={styles.userList}
            />
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShareModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Filter Modal */}
      {filterModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={[styles.filterModal, { backgroundColor: isDarkMode ? '#1e293b' : 'white' }]}>
            <Text style={[styles.shareTitle, { color: isDarkMode ? '#f8fafc' : '#0F172A', marginBottom: 20 }]}>
              Filter Hackathons
            </Text>

            <Text style={[styles.filterSectionTitle, { color: isDarkMode ? '#cbd5e1' : '#475569' }]}>Location</Text>
            <View style={styles.filterOptions}>
              {LOCATIONS.map(loc => (
                <TouchableOpacity
                  key={loc}
                  style={[
                    styles.filterChip,
                    filters.locationMode?.includes(loc as any) && styles.activeFilterChip
                  ]}
                  onPress={() => toggleFilter('locationMode', loc)}
                >
                  <Text style={[
                    styles.filterChipText,
                    filters.locationMode?.includes(loc as any) && styles.activeFilterChipText
                  ]}>{loc.charAt(0).toUpperCase() + loc.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.filterSectionTitle, { color: isDarkMode ? '#cbd5e1' : '#475569', marginTop: 16 }]}>Domains</Text>
            <View style={styles.filterOptions}>
              {THEMES.map(themeItem => (
                <TouchableOpacity
                  key={themeItem}
                  style={[
                    styles.filterChip,
                    filters.themes?.includes(themeItem) && styles.activeFilterChip
                  ]}
                  onPress={() => toggleFilter('themes', themeItem)}
                >
                  <Text style={[
                    styles.filterChipText,
                    filters.themes?.includes(themeItem) && styles.activeFilterChipText
                  ]}>{themeItem}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.filterSectionTitle, { color: isDarkMode ? '#cbd5e1' : '#475569', marginTop: 16 }]}>Platforms</Text>
            <View style={styles.filterOptions}>
              {PLATFORMS.map(platform => (
                <TouchableOpacity
                  key={platform}
                  style={[
                    styles.filterChip,
                    filters.platforms?.includes(platform as any) && styles.activeFilterChip
                  ]}
                  onPress={() => toggleFilter('platforms', platform)}
                >
                  <Text style={[
                    styles.filterChipText,
                    filters.platforms?.includes(platform as any) && styles.activeFilterChipText
                  ]}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.applyButton, { marginTop: 24 }]}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.applyButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A', // Premium dark background
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  logo: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  logoGold: {
    color: '#F5A623',
    fontWeight: '800',
  },
  logoWhite: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 10,
    borderRadius: 12,
  },
  goldButton: {
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.3)',
  },
  glassButton: {
    backgroundColor: 'rgba(31, 31, 31, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.2)',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F5A623',
  },
  profileButton: {
    padding: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    height: CARD_HEIGHT,
    width: screenWidth,
    backgroundColor: 'white', // Keep cards white for readability
    marginBottom: 0,
  },
  cardContent: {
    flex: 1,
  },
  imageContainer: {
    height: '45%',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  platformBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  platformText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  saveButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentSection: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
    lineHeight: 32,
  },
  description: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
    marginBottom: 20,
  },
  metadataContainer: {
    gap: 12,
    marginBottom: 24,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metadataIcon: {
    fontSize: 16,
  },
  prizeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  deadlineText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F59E0B',
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  tag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6366F1',
  },
  moreTagsText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },

  progressContainer: {
    position: 'absolute',
    top: 120,
    right: 16,
    alignItems: 'flex-end',
    zIndex: 10,
  },
  progressBar: {
    width: 60,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  emptyContainer: {
    height: CARD_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white', // Keep white for visibility on black background
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  teammatesBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  teammatesText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  shareModal: {
    width: '80%',
    maxHeight: '60%',
    borderRadius: 12,
    padding: 20,
  },
  shareTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  userList: {
    maxHeight: 300,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  filterModal: {
    width: '85%',
    maxHeight: '70%',
    borderRadius: 16,
    padding: 24,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: 'transparent',
  },
  activeFilterChip: {
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
    borderColor: '#F5A623',
  },
  filterChipText: {
    fontSize: 14,
    color: '#64748b',
  },
  activeFilterChipText: {
    color: '#F5A623',
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#F5A623',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  activeFilterButton: {
    backgroundColor: '#F5A623',
    borderWidth: 0,
  },
});
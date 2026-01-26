import React, { useEffect, useRef, useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useFeedStore, useSavedStore, useThemeStore } from '../stores';
import { theme } from '../theme';
import { Hackathon } from '../types';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
const CARD_HEIGHT = screenHeight;

interface HackathonCardProps {
  hackathon: Hackathon;
  onSave: () => void;
  onPress: () => void;
  isSaved: boolean;
}

const HackathonCard: React.FC<HackathonCardProps> = ({ hackathon, onSave, onPress, isSaved }) => {
  const { isDarkMode = false } = useThemeStore();
  const formatDeadline = (deadline?: string) => {
    if (!deadline) return null;
    // For now, extract readable info from description
    if (hackathon.description.includes('Dates:')) {
      const dateMatch = hackathon.description.match(/Dates: ([^.]+)/);
      return dateMatch ? dateMatch[1] : 'Check details';
    }
    return 'Check details';
  };

  const getPlatformColor = () => {
    return hackathon.platform_source === 'unstop' ? '#FF6B35' : '#003E54';
  };

  const handleSwipe = ({ nativeEvent }: any) => {
    if (nativeEvent.state === State.END) {
      if (nativeEvent.translationX < -100) {
        // Left swipe - add/remove from calendar
        if (isSaved) {
          Alert.alert(
            'Removed from Calendar',
            `${hackathon.title} has been removed from your calendar!`,
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Added to Calendar',
            `${hackathon.title} has been added to your calendar!`,
            [{ text: 'OK' }]
          );
        }
        onSave(); // Toggle save state
      }
    }
  };

  return (
    <PanGestureHandler 
      onHandlerStateChange={handleSwipe}
      activeOffsetX={[-50, 50]}
      failOffsetY={[-20, 20]}
    >
      <View style={styles.card}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.95} style={styles.cardContent}>
      {/* Banner Image */}
      <View style={styles.imageContainer}>
        {hackathon.banner_url ? (
          <Image source={{ uri: hackathon.banner_url }} style={styles.bannerImage} />
        ) : (
          <LinearGradient
            colors={['#6366f1', '#8b5cf6']}
            style={styles.bannerImage}
          >
            <Ionicons name="code-slash" size={48} color="white" />
          </LinearGradient>
        )}
        
        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.imageOverlay}
        />
        
        {/* Platform Badge */}
        <View style={[styles.platformBadge, { backgroundColor: getPlatformColor() }]}>
          <Text style={styles.platformText}>
            {hackathon.platform_source.toUpperCase()}
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={onSave}>
          <Ionicons
            name={isSaved ? 'heart' : 'heart-outline'}
            size={28}
            color={isSaved ? '#EF4444' : 'white'}
          />
        </TouchableOpacity>
      </View>

      {/* Content Section */}
      <View style={[styles.contentSection, { backgroundColor: isDarkMode ? '#1e293b' : 'white' }]}>
        <Text style={[styles.title, { color: isDarkMode ? '#f8fafc' : '#0F172A' }]} numberOfLines={2}>
          {hackathon.title}
        </Text>
        
        <Text style={[styles.description, { color: isDarkMode ? '#94a3b8' : '#64748B' }]} numberOfLines={3}>
          {hackathon.short_summary || hackathon.description}
        </Text>

        {/* Metadata */}
        <View style={styles.metadataContainer}>
          {hackathon.prize_money && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataIcon}>💰</Text>
              <Text style={styles.prizeText}>
                {hackathon.prize_money.replace(/<[^>]*>/g, '').replace(/&gt;/g, '>')}
              </Text>
            </View>
          )}
          
          <View style={styles.metadataRow}>
            <Text style={styles.metadataIcon}>📅</Text>
            <Text style={styles.deadlineText}>
              {formatDeadline(hackathon.registration_deadline) || 'Check details'}
            </Text>
          </View>

          {hackathon.themes.length > 0 && (
            <View style={styles.tagsRow}>
              <Text style={styles.metadataIcon}>🏷️</Text>
              <View style={styles.tagsContainer}>
                {hackathon.themes.slice(0, 3).map((theme, index) => (
                  <View key={index} style={[styles.tag, { backgroundColor: isDarkMode ? '#334155' : '#EEF2FF' }]}>
                    <Text style={[styles.tagText, { color: isDarkMode ? '#a5b4fc' : '#6366F1' }]}>{theme}</Text>
                  </View>
                ))}
                {hackathon.themes.length > 3 && (
                  <Text style={[styles.moreTagsText, { color: isDarkMode ? '#64748b' : '#94A3B8' }]}>+{hackathon.themes.length - 3}</Text>
                )}
              </View>
            </View>
          )}
        </View>


      </View>
        </TouchableOpacity>
      </View>
    </PanGestureHandler>
  );
};

export const FeedScreen: React.FC = () => {
  const { isDarkMode = false } = useThemeStore();
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const {
    hackathons,
    loading,
    error,
    hasMore,
    refreshing,
    loadHackathons,
    loadMore,
    refresh,
  } = useFeedStore();

  const { saveHackathon, unsaveHackathon, isSaved } = useSavedStore();

  useEffect(() => {
    if (hackathons.length === 0) {
      loadHackathons(true);
    }
  }, []);

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

  const renderHackathon = ({ item }: { item: Hackathon }) => (
    <HackathonCard
      hackathon={item}
      onSave={() => handleSave(item)}
      onPress={() => handleHackathonPress(item)}
      isSaved={isSaved(item.id)}
    />
  );

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
      
      {/* Top Bar */}
      <View style={[styles.topBar, { backgroundColor: isDarkMode ? 'rgba(15,23,42,0.8)' : 'rgba(0,0,0,0.3)' }]}>
        <Text style={styles.logo}>DevCompare</Text>
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton}>
            <View style={[styles.avatar, { backgroundColor: isDarkMode ? '#334155' : 'white' }]}>
              <Ionicons name="person" size={20} color={isDarkMode ? 'white' : theme.colors.primary} />
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
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={2}
        getItemLayout={(data, index) => ({
          length: CARD_HEIGHT,
          offset: CARD_HEIGHT * index,
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Keep feed background black for TikTok style
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
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 8,
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
});
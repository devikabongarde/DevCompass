import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Hackathon } from '../types';
import { theme } from '../theme';
import { useSavedStore, useThemeStore } from '../stores';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface HackathonCardProps {
  hackathon: Hackathon;
  onPress: () => void;
  onSave?: () => void;
  onShare?: (hackathon: Hackathon) => void;
}

export const HackathonCard: React.FC<HackathonCardProps> = ({
  hackathon,
  onPress,
  onSave,
  onShare,
}) => {
  const { isSaved, saveHackathon, unsaveHackathon } = useSavedStore();
  const { isDarkMode = false } = useThemeStore();
  const saved = isSaved(hackathon.id);
  const [liked, setLiked] = useState(false);
  const [likeAnimation] = useState(new Animated.Value(0));
  const [lastTap, setLastTap] = useState(0);
  const insets = useSafeAreaInsets();

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    
    if (lastTap && (now - lastTap) < DOUBLE_PRESS_DELAY) {
      // Double tap - like the hackathon
      setLiked(!liked);
      Animated.sequence([
        Animated.timing(likeAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(likeAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      setLastTap(0); // Reset to prevent details from opening
    } else {
      setLastTap(now);
      // Single tap - open details after delay
      setTimeout(() => {
        if (lastTap === now) { // Only open if no second tap occurred
          onPress();
        }
      }, DOUBLE_PRESS_DELAY);
    }
  };

  const handleShare = async () => {
    try {
      if (onShare) {
        onShare(hackathon);
      } else {
        await Share.share({
          message: `Check out this hackathon: ${hackathon.title}\n\n${hackathon.short_summary || hackathon.description}\n\nLink: ${hackathon.original_url}`,
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (saved) {
        await unsaveHackathon(hackathon.id);
      } else {
        await saveHackathon(hackathon);
      }
      onSave?.();
    } catch (error) {
      console.error('Error saving hackathon:', error);
    }
  };

  const formatDeadline = (deadline?: string) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `${diffDays} days left`;
    return date.toLocaleDateString();
  };

  const getPlatformColor = (platform: string) => {
    return platform === 'unstop' ? theme.colors.unstop : theme.colors.devpost;
  };

  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: isDarkMode ? '#1e293b' : theme.colors.surface }]} onPress={handleDoubleTap} activeOpacity={0.95}>
      {/* Banner Image */}
      <View style={styles.imageContainer}>
        {hackathon.banner_url ? (
          <Image source={{ uri: hackathon.banner_url }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholderImage, { backgroundColor: isDarkMode ? '#334155' : theme.colors.backgroundSecondary }]}>
            <Ionicons name="code-slash" size={48} color={isDarkMode ? '#64748b' : theme.colors.textLight} />
          </View>
        )}
        
        {/* Platform Badge */}
        <View style={[styles.platformBadge, { backgroundColor: getPlatformColor(hackathon.platform_source) }]}>
          <Text style={styles.platformText}>
            {hackathon.platform_source.toUpperCase()}
          </Text>
        </View>

        {/* Like Animation */}
        <Animated.View
          style={[
            styles.likeAnimation,
            {
              opacity: likeAnimation,
              transform: [
                {
                  scale: likeAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1.2],
                  }),
                },
              ],
            },
          ]}
        >
          <Ionicons name="heart" size={80} color="#EF4444" />
        </Animated.View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: isDarkMode ? '#f8fafc' : theme.colors.text }]} numberOfLines={2}>
          {hackathon.title}
        </Text>
        
        <Text style={[styles.summary, { color: isDarkMode ? '#94a3b8' : theme.colors.textSecondary }]} numberOfLines={3}>
          {hackathon.short_summary || hackathon.description}
        </Text>

        {/* Tags */}
        {hackathon.themes.length > 0 && (
          <View style={styles.tagsContainer}>
            {hackathon.themes.slice(0, 3).map((themeName, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: isDarkMode ? '#334155' : theme.colors.primaryLight }]}>
                <Text style={[styles.tagText, { color: isDarkMode ? '#94a3b8' : theme.colors.primary }]}>{themeName}</Text>
              </View>
            ))}
            {hackathon.themes.length > 3 && (
              <Text style={[styles.moreTagsText, { color: isDarkMode ? '#64748b' : theme.colors.textLight }]}>+{hackathon.themes.length - 3}</Text>
            )}
          </View>
        )}

        {/* Bottom Info */}
        <View style={styles.bottomInfo}>
          <View style={styles.infoRow}>
            {hackathon.prize_money && (
              <View style={styles.infoItem}>
                <Ionicons name="trophy" size={16} color={theme.colors.secondary} />
                <Text style={[styles.infoText, { color: isDarkMode ? '#94a3b8' : theme.colors.textSecondary }]}>{hackathon.prize_money}</Text>
              </View>
            )}
            
            {hackathon.registration_deadline && (
              <View style={styles.infoItem}>
                <Ionicons name="time" size={16} color={theme.colors.error} />
                <Text style={[styles.infoText, { color: theme.colors.error }]}>
                  {formatDeadline(hackathon.registration_deadline)}
                </Text>
              </View>
            )}
          </View>

          {hackathon.location_mode && (
            <View style={styles.infoItem}>
              <Ionicons 
                name={hackathon.location_mode === 'online' ? 'globe' : 'location'} 
                size={16} 
                color={isDarkMode ? '#94a3b8' : theme.colors.textSecondary} 
              />
              <Text style={[styles.infoText, { color: isDarkMode ? '#94a3b8' : theme.colors.textSecondary }]}>
                {hackathon.location_mode.charAt(0).toUpperCase() + hackathon.location_mode.slice(1)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Action Buttons - Moved to bottom */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={() => setLiked(!liked)}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={28}
            color={liked ? '#EF4444' : (isDarkMode ? 'white' : theme.colors.primary)}
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={28}
            color={saved ? theme.colors.secondary : (isDarkMode ? 'white' : theme.colors.primary)}
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Ionicons
            name="paper-plane-outline"
            size={28}
            color={isDarkMode ? 'white' : theme.colors.primary}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    height: screenHeight,
    ...theme.shadows.lg,
    paddingTop: 100, // Account for top bar
    paddingBottom: 80, // Account for bottom navigation
  },
  imageContainer: {
    height: '45%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  platformBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    left: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  platformText: {
    color: theme.colors.surface,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeAnimation: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -40,
    marginLeft: -40,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.sm,
  },
  summary: {
    fontSize: theme.typography.fontSize.base,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
    marginBottom: theme.spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  tag: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  tagText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  moreTagsText: {
    fontSize: theme.typography.fontSize.sm,
    marginLeft: theme.spacing.xs,
  },
  bottomInfo: {
    gap: theme.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  infoText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
});
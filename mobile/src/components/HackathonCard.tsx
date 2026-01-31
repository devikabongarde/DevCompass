import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Share,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Hackathon } from '../types';
import { theme } from '../theme';
import { useSavedStore, useThemeStore } from '../stores';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface HackathonCardProps {
  hackathon: Hackathon;
  onPress: () => void;
  onSave?: () => void;
  onShare?: (hackathon: Hackathon) => void;
  skillMatchPercentage?: number;
  matchedSkills?: string[];
}

export const HackathonCard: React.FC<HackathonCardProps> = ({
  hackathon,
  onPress,
  onSave,
  onShare,
  skillMatchPercentage = 0,
  matchedSkills = [],
}) => {
  const { isSaved, saveHackathon, unsaveHackathon } = useSavedStore();
  const { isDarkMode = false } = useThemeStore();
  const [liked, setLiked] = useState(false);
  const [localSaved, setLocalSaved] = useState(() => isSaved(hackathon.id));
  const [likeAnimation] = useState(new Animated.Value(0));
  const lastTapRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saved = isSaved(hackathon.id);

  // Sync localSaved with store state
  useEffect(() => {
    setLocalSaved(saved);
  }, [saved]);

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    if (lastTapRef.current && (now - lastTapRef.current) < DOUBLE_PRESS_DELAY) {
      // Double tap - like the hackathon
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
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
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      // Single tap - open details after delay
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        if (lastTapRef.current === now) { // Only open if no second tap occurred
          onPress();
        }
        timeoutRef.current = null;
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
      if (localSaved) {
        await unsaveHackathon(hackathon.id);
        setLocalSaved(false);
      } else {
        await saveHackathon(hackathon);
        setLocalSaved(true);
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
    if (platform === 'unstop') return theme.colors.unstop;
    if (platform === 'devpost') return theme.colors.devpost;
    if (platform === 'devfolio') return theme.colors.devfolio;
    return theme.colors.primary;
  };

  const getPlaceholderBgColor = (platform: string) => {
    if (platform === 'unstop') return 'rgba(255, 107, 53, 0.15)';
    if (platform === 'devpost') return 'rgba(0, 62, 84, 0.15)';
    if (platform === 'devfolio') return 'rgba(99, 102, 241, 0.15)';
    return '#334155';
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: '#0A0A0A' }]}
      onPress={handleDoubleTap}
      activeOpacity={0.95}
    >
      {/* Immersive Background Image */}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#000' }]}>
        {hackathon.banner_url ? (
          <>
            {/* Blurred Background Layer - Fills the screen with color */}
            <Image
              source={{ uri: hackathon.banner_url }}
              style={[styles.image, { opacity: 0.6 }]}
              blurRadius={Platform.OS === 'ios' ? 20 : 10}
            />
            {/* Foreground Layer - Shows full image without cropping */}
            <Image
              source={{ uri: hackathon.banner_url }}
              style={[StyleSheet.absoluteFill, { width: '100%', height: '100%', resizeMode: 'contain' }]}
            />
          </>
        ) : (
          <View style={[styles.image, styles.placeholderImage, { backgroundColor: getPlaceholderBgColor(hackathon.platform_source) }]}>
            <Ionicons name="code-slash" size={80} color={getPlatformColor(hackathon.platform_source)} />
          </View>
        )}

        {/* Subtle Gradient to make sure white text pops if image is light */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)']}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      {/* Top Badges */}
      <View style={styles.topContainer}>
        <View style={[styles.platformBadge, { backgroundColor: '#F5A623', borderColor: '#FFD700', borderWidth: 1 }]}>
          <Text style={[styles.platformText, { color: '#0A0A0A', fontWeight: '800' }]}>
            {hackathon.platform_source.toUpperCase()}
          </Text>
        </View>
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
        <Ionicons name="heart" size={120} color="#EF4444" />
      </Animated.View>

      {/* Floating Glass Content Card (The "Card within a Card") */}
      <View style={styles.floatingGlassCard}>
        {/* Content */}
        <View style={styles.contentInner}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Text style={[styles.title, { color: '#FFFFFF', flex: 1 }]} numberOfLines={2}>
              {hackathon.title}
            </Text>
            {skillMatchPercentage > 0 && (
              <View style={{
                backgroundColor: skillMatchPercentage >= 60 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 166, 35, 0.2)',
                borderColor: skillMatchPercentage >= 60 ? '#22C55E' : '#F5A623',
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 4,
                marginLeft: 8,
              }}>
                <Text style={{
                  color: skillMatchPercentage >= 60 ? '#22C55E' : '#F5A623',
                  fontSize: 11,
                  fontWeight: '700',
                }}>
                  {skillMatchPercentage}% match
                </Text>
              </View>
            )}
          </View>

          {matchedSkills.length > 0 && (
            <View style={{ marginTop: 6, marginBottom: 8 }}>
              <Text style={{ color: '#94A3B8', fontSize: 10, marginBottom: 4 }}>Your skills:</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                {matchedSkills.map((skill, idx) => (
                  <View
                    key={idx}
                    style={{
                      backgroundColor: 'rgba(34, 197, 94, 0.15)',
                      borderColor: '#22C55E',
                      borderWidth: 0.5,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 4,
                    }}
                  >
                    <Text style={{ color: '#22C55E', fontSize: 9, fontWeight: '600' }}>✓ {skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <Text style={[styles.summary, { color: '#E2E8F0' }]} numberOfLines={2}>
            {hackathon.short_summary || hackathon.description}
          </Text>

          {/* Tags */}
          {hackathon.themes.length > 0 && (
            <View style={styles.tagsContainer}>
              {hackathon.themes.slice(0, 3).map((themeName, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: 'rgba(245, 166, 35, 0.25)', borderColor: '#F5A623', borderWidth: 1 }]}>
                  <Text style={[styles.tagText, { color: '#FFD700', fontWeight: '700' }]}>{themeName}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Bottom Info */}
          <View style={styles.bottomInfo}>
            <View style={styles.infoRow}>
              {hackathon.prize_money && (
                <View style={styles.infoItem}>
                  <Ionicons name="trophy" size={16} color="#FFD700" />
                  <Text style={[styles.infoText, { color: '#FFD700' }]}>
                    {(() => {
                      let prize = hackathon.prize_money;
                      prize = prize.replace(/<[^>]*>/g, '');
                      prize = prize.replace(/&nbsp;/g, ' ');
                      prize = prize.replace(/\s+/g, ' ').trim();
                      return prize || 'N/A';
                    })()}
                  </Text>
                </View>
              )}

              {hackathon.registration_deadline && (
                <View style={styles.infoItem}>
                  <Ionicons name="time" size={16} color="#FF6B6B" />
                  <Text style={[styles.infoText, { color: '#FF6B6B', fontWeight: '700' }]}>
                    {formatDeadline(hackathon.registration_deadline)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Action Buttons inside the floating card */}
        <View 
          style={styles.actionButtons}
          onStartShouldSetResponder={() => true}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => setLiked(!liked)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, { borderColor: liked ? '#EF4444' : '#F5A623' }]}>
              <Ionicons
                name={liked ? 'heart' : 'heart-outline'}
                size={24}
                color={liked ? '#EF4444' : '#F5A623'}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleSave}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, { borderColor: localSaved ? '#FFD700' : '#F5A623' }]}>
              <Ionicons
                name={localSaved ? 'bookmark' : 'bookmark-outline'}
                size={24}
                color={localSaved ? '#FFD700' : '#F5A623'}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, { borderColor: '#F5A623' }]}>
              <Ionicons
                name="paper-plane"
                size={24}
                color="#F5A623"
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    height: '100%',
    ...theme.shadows.lg,
    borderRadius: 32, // More rounded outer corners
    overflow: 'hidden',
    marginTop: 0,
    marginBottom: 0,
    marginHorizontal: 0,
    backgroundColor: '#000',
  },
  topContainer: {
    padding: theme.spacing.md,
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    zIndex: 20,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  platformText: {
    color: '#0A0A0A',
    fontSize: theme.typography.fontSize.xs,
    fontWeight: 'bold',
  },
  // The "Card within a Card"
  floatingGlassCard: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(20, 20, 20, 0.85)', // Dark premium glass
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.3)', // Gold border
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  contentInner: {
    flex: 1,
    marginRight: 10,
  },
  actionButtons: {
    flexDirection: 'column',
    gap: 12,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeAnimation: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    marginTop: -60,
    marginLeft: -60,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
    lineHeight: 28,
  },
  summary: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
    fontWeight: '500',
    opacity: 0.9,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 10,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  bottomInfo: {
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
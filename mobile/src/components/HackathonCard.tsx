import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Hackathon } from '../types';
import { theme } from '../theme';
import { useSavedStore } from '../stores';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface HackathonCardProps {
  hackathon: Hackathon;
  onPress: () => void;
  onSave?: () => void;
}

export const HackathonCard: React.FC<HackathonCardProps> = ({
  hackathon,
  onPress,
  onSave,
}) => {
  const { isSaved, saveHackathon, unsaveHackathon } = useSavedStore();
  const saved = isSaved(hackathon.id);

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
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.95}>
      {/* Banner Image */}
      <View style={styles.imageContainer}>
        {hackathon.banner_url ? (
          <Image source={{ uri: hackathon.banner_url }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Ionicons name="code-slash" size={48} color={theme.colors.textLight} />
          </View>
        )}
        
        {/* Platform Badge */}
        <View style={[styles.platformBadge, { backgroundColor: getPlatformColor(hackathon.platform_source) }]}>
          <Text style={styles.platformText}>
            {hackathon.platform_source.toUpperCase()}
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={saved ? theme.colors.secondary : theme.colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {hackathon.title}
        </Text>
        
        <Text style={styles.summary} numberOfLines={3}>
          {hackathon.short_summary || hackathon.description}
        </Text>

        {/* Tags */}
        {hackathon.themes.length > 0 && (
          <View style={styles.tagsContainer}>
            {hackathon.themes.slice(0, 3).map((theme, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{theme}</Text>
              </View>
            ))}
            {hackathon.themes.length > 3 && (
              <Text style={styles.moreTagsText}>+{hackathon.themes.length - 3}</Text>
            )}
          </View>
        )}

        {/* Bottom Info */}
        <View style={styles.bottomInfo}>
          <View style={styles.infoRow}>
            {hackathon.prize_money && (
              <View style={styles.infoItem}>
                <Ionicons name="trophy" size={16} color={theme.colors.secondary} />
                <Text style={styles.infoText}>{hackathon.prize_money}</Text>
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
                color={theme.colors.textSecondary} 
              />
              <Text style={styles.infoText}>
                {hackathon.location_mode.charAt(0).toUpperCase() + hackathon.location_mode.slice(1)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    height: screenHeight * 0.85, // Take most of screen height
    backgroundColor: theme.colors.surface,
    ...theme.shadows.lg,
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
    backgroundColor: theme.colors.backgroundSecondary,
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
  saveButton: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
    padding: theme.spacing.sm,
    ...theme.shadows.md,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  summary: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
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
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  tagText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  moreTagsText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textLight,
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
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
});
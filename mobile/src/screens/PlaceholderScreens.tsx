import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Linking, Alert, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import { Hackathon } from '../types';
import { useThemeStore } from '../stores';
import { messageService, profileService } from '../services/supabase';

const cleanHtmlTags = (text: string): string => {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();
};

// Hackathon Detail Screen
export const HackathonDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { hackathon } = route.params as { hackathon: Hackathon };
  const { isDarkMode = false } = useThemeStore();
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleRegister = () => {
    if (hackathon.original_url) {
      Linking.openURL(hackathon.original_url).catch(() => {
        Alert.alert('Error', 'Could not open the hackathon URL');
      });
    }
  };

  const handleShare = async () => {
    try {
      const results = await profileService.searchProfiles('');
      setSearchResults(results.slice(0, 10));
      setShareModalVisible(true);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load contacts');
    }
  };

  const handleSendToUser = async (userId: string, userName: string) => {
    try {
      await messageService.sendMessage(
        userId,
        `Check out this hackathon: ${hackathon.title}\n\n${hackathon.short_summary || hackathon.description}\n\nRegister: ${hackathon.original_url}`,
        undefined,
        hackathon.id
      );
      setShareModalVisible(false);
      Alert.alert('Shared!', `Hackathon shared with ${userName}`);
    } catch (error) {
      console.error('Error sharing hackathon:', error);
      Alert.alert('Error', 'Failed to share hackathon');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'TBA';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: theme.colors.background,
    }}>
      {/* Header with Gold Gradient */}
      <LinearGradient
        colors={['rgba(245, 166, 35, 0.15)', 'rgba(10, 10, 10, 0.5)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(245, 166, 35, 0.2)',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: theme.colors.text,
          flex: 1,
          marginLeft: 16,
        }} numberOfLines={1}>
          Hackathon Details
        </Text>
        
        <TouchableOpacity onPress={handleShare}>
          <Ionicons 
            name="share-social" 
            size={24} 
            color={theme.colors.textSecondary} 
          />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} showsVerticalScrollIndicator={false}>
        {/* Banner Image */}
        {hackathon.banner_url && (
          <View style={{ overflow: 'hidden' }}>
            <Image
              source={{ uri: hackathon.banner_url }}
              style={{
                width: '100%',
                height: 200,
                backgroundColor: theme.colors.surface,
              }}
            />
            <LinearGradient
              colors={[`${theme.colors.background}00`, theme.colors.background]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 100,
              }}
            />
          </View>
        )}

        <View style={{ padding: 16 }}>
          {/* Title */}
          <Text style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: theme.colors.text,
            marginBottom: 12,
          }}>
            {hackathon.title}
          </Text>

          {/* Platform Badge */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
            gap: 8,
          }}>
            <LinearGradient
              colors={hackathon.platform_source === 'devpost' 
                ? ['#FF6B00', '#FF8C42']
                : ['#FF6B35', '#FF8C42']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 12,
              }}
            >
              <Text style={{
                color: 'white',
                fontSize: 12,
                fontWeight: '700',
              }}>
                {hackathon.platform_source === 'devpost' ? 'Devpost' : 'Unstop'}
              </Text>
            </LinearGradient>
            
            {hackathon.location_mode && (
              <View style={{
                backgroundColor: theme.colors.surface,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.colors.borderLight,
              }}>
                <Text style={{
                  color: theme.colors.textSecondary,
                  fontSize: 12,
                  fontWeight: '600',
                }}>
                  {hackathon.location_mode.charAt(0).toUpperCase() + hackathon.location_mode.slice(1)}
                </Text>
              </View>
            )}
          </View>

          {/* Key Dates Section */}
          <View style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: theme.colors.borderLight,
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '700',
              color: theme.colors.primary,
              marginBottom: 12,
            }}>
              📅 Key Dates
            </Text>

            {hackathon.registration_deadline && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{
                  fontSize: 12,
                  color: theme.colors.textLight,
                  marginBottom: 4,
                }}>
                  Registration Deadline
                </Text>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: theme.colors.text,
                }}>
                  {formatDate(hackathon.registration_deadline)}
                </Text>
              </View>
            )}

            {hackathon.start_date && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{
                  fontSize: 12,
                  color: theme.colors.textLight,
                  marginBottom: 4,
                }}>
                  Start Date
                </Text>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: theme.colors.text,
                }}>
                  {formatDate(hackathon.start_date)}
                </Text>
              </View>
            )}

            {hackathon.end_date && (
              <View>
                <Text style={{
                  fontSize: 12,
                  color: theme.colors.textLight,
                  marginBottom: 4,
                }}>
                  End Date
                </Text>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: theme.colors.text,
                }}>
                  {formatDate(hackathon.end_date)}
                </Text>
              </View>
            )}
          </View>

          {/* Themes */}
          {hackathon.themes && hackathon.themes.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '700',
                color: theme.colors.primary,
                marginBottom: 12,
              }}>
                🎨 Themes
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {hackathon.themes.map((themeItem, index) => (
                  <LinearGradient
                    key={index}
                    colors={['rgba(245, 166, 35, 0.1)', 'rgba(224, 146, 0, 0.05)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                      marginRight: 8,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: theme.colors.borderGold,
                    }}
                  >
                    <Text style={{
                      color: theme.colors.primary,
                      fontSize: 12,
                      fontWeight: '600',
                    }}>
                      {themeItem}
                    </Text>
                  </LinearGradient>
                ))}
              </View>
            </View>
          )}

          {/* Prize Money */}
          {hackathon.prize_money && (
            <LinearGradient
              colors={['rgba(245, 166, 35, 0.2)', 'rgba(224, 146, 0, 0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: theme.colors.borderGold,
              }}
            >
              <Text style={{
                fontSize: 12,
                color: theme.colors.textLight,
                marginBottom: 8,
              }}>
                💰 Prize Pool
              </Text>
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: theme.colors.primary,
              }}>
                {cleanHtmlTags(hackathon.prize_money)}
              </Text>
            </LinearGradient>
          )}

          {/* Description */}
          {hackathon.short_summary && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '700',
                color: theme.colors.primary,
                marginBottom: 12,
              }}>
                📝 About
              </Text>
              <Text style={{
                fontSize: 14,
                lineHeight: 20,
                color: theme.colors.textSecondary,
              }}>
                {cleanHtmlTags(hackathon.short_summary)}
              </Text>
            </View>
          )}

          {hackathon.description && hackathon.description !== hackathon.short_summary && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '700',
                color: theme.colors.primary,
                marginBottom: 12,
              }}>
                📖 Description
              </Text>
              <Text style={{
                fontSize: 14,
                lineHeight: 20,
                color: theme.colors.textSecondary,
              }}>
                {cleanHtmlTags(hackathon.description)}
              </Text>
            </View>
          )}

          {/* Eligibility */}
          {hackathon.eligibility && (
            <View style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: theme.colors.borderLight,
            }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '700',
                color: theme.colors.primary,
                marginBottom: 8,
              }}>
                ✅ Eligibility
              </Text>
              <Text style={{
                fontSize: 14,
                lineHeight: 20,
                color: theme.colors.textSecondary,
              }}>
                {cleanHtmlTags(hackathon.eligibility)}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Register Button */}
      <View style={{
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderLight,
        backgroundColor: theme.colors.background,
      }}>
        <LinearGradient
          colors={theme.colors.gradientGold}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 8,
          }}
        >
          <TouchableOpacity
            onPress={handleRegister}
            style={{
              paddingVertical: 14,
              paddingHorizontal: 16,
              alignItems: 'center',
            }}
          >
            <Text style={{
              color: '#0A0A0A',
              fontSize: 16,
              fontWeight: '700',
            }}>
              Register Now
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Share Modal */}
      {shareModalVisible && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}>
          <View style={{
            backgroundColor: theme.colors.surface,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 16,
            maxHeight: '60%',
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: theme.colors.text,
              }}>
                Share with
              </Text>
              <TouchableOpacity onPress={() => setShareModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              {searchResults.map((user, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSendToUser(user.id, user.username)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.borderLight,
                  }}
                >
                  {user.avatar_url && (
                    <Image
                      source={{ uri: user.avatar_url }}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        marginRight: 12,
                      }}
                    />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      color: theme.colors.text,
                      fontSize: 14,
                      fontWeight: '600',
                    }}>
                      {user.username}
                    </Text>
                    <Text style={{
                      color: theme.colors.textSecondary,
                      fontSize: 12,
                    }}>
                      {user.full_name}
                    </Text>
                  </View>
                  <Ionicons name="send" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

// Smart Matching & RecSys
export const RoleMatcherScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Role-Aware Recommender</Text>
    <Text style={styles.subtitle}>Auto-detect missing roles and suggest teammates</Text>
  </View>
);

export const HackathonRecommendationsScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Hackathon Recommendations</Text>
    <Text style={styles.subtitle}>Top hackathons ranked for you</Text>
  </View>
);

export const SynergyScoreScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Team Synergy Score</Text>
    <Text style={styles.subtitle}>Skills complementarity & collaboration graph</Text>
  </View>
);

// Dev Profile Features
export const GitHubImportScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>GitHub Profile Import</Text>
    <Text style={styles.subtitle}>Auto-import languages, repos, contributions</Text>
  </View>
);

export const PortfolioModesScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Portfolio Modes</Text>
    <Text style={styles.subtitle}>Hackathon Mode • Job Mode</Text>
  </View>
);

export const PrivacyControlsScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Privacy Controls</Text>
    <Text style={styles.subtitle}>Granular visibility & anonymous browsing</Text>
  </View>
);

// Social Feed
export const ContentLanesScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Content Lanes</Text>
    <Text style={styles.subtitle}>Team Updates • Demos • Opportunities • Memes</Text>
  </View>
);

export const ProjectDemosScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Project Demos</Text>
    <Text style={styles.subtitle}>30-60s vertical video demos</Text>
  </View>
);

export const FeedControlsScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Feed Controls</Text>
    <Text style={styles.subtitle}>Mute/hide users or topics</Text>
  </View>
);

// Team & Communication
export const TeamChannelsScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Team Channels</Text>
    <Text style={styles.subtitle}>#planning #design #backend #demo</Text>
  </View>
);

export const TaskBoardScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Task Board</Text>
    <Text style={styles.subtitle}>Kanban: Todo • Doing • Done</Text>
  </View>
);

export const MentorHubScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Mentor Hub</Text>
    <Text style={styles.subtitle}>Drop-in help & judge access</Text>
  </View>
);

// Hackathon Ops
export const TimelineViewScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Unified Timeline</Text>
    <Text style={styles.subtitle}>Gantt-style view with all deadlines</Text>
  </View>
);

export const SmartRemindersScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Smart Reminders</Text>
    <Text style={styles.subtitle}>Actionable notifications & team check-ins</Text>
  </View>
);

export const DevpostGeneratorScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Devpost Generator</Text>
    <Text style={styles.subtitle}>Auto-generate project descriptions</Text>
  </View>
);

// Discovery & Community
export const HackathonMapScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Hackathon Map</Text>
    <Text style={styles.subtitle}>Map + filters: online, offline, prize pool</Text>
  </View>
);

export const CommunitiesScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Communities</Text>
    <Text style={styles.subtitle}>VIT Mumbai • GDSC • Web3 India</Text>
  </View>
);

export const ReputationBadgesScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Reputation & Badges</Text>
    <Text style={styles.subtitle}>Shipped 5+ • On-time • Mentor • Organizer</Text>
  </View>
);

// AI Assistant
export const ProjectCopilotScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>AI Project Copilot</Text>
    <Text style={styles.subtitle}>Generate ideas, stack, architecture, roadmap</Text>
  </View>
);

export const PersonalityMatcherScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Personality Matcher</Text>
    <Text style={styles.subtitle}>Work style, time, communication preferences</Text>
  </View>
);

export const RetroAnalyticsScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Retro & Analytics</Text>
    <Text style={styles.subtitle}>Time breakdown, GitHub activity, patterns</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  text: {
    fontSize: 18,
    color: theme.colors.text,
  },
});
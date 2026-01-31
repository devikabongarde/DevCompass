import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore } from '../stores';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

interface RoleMatch {
    role: string;
    icon: string;
    needed: boolean;
    candidates: {
        id: string;
        name: string;
        avatar: string;
        matchScore: number;
        skills: string[];
        availability: string;
    }[];
}

export const RoleMatcherScreen: React.FC = () => {
    const navigation = useNavigation();
    const { isDarkMode = false } = useThemeStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [sendingInvite, setSendingInvite] = useState<string | null>(null);
    const [userHackathons, setUserHackathons] = useState<any[]>([]);

    useEffect(() => {
        loadUserHackathons();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery.trim()) {
                handleSearch();
            } else {
                setSearchResults([]);
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const loadUserHackathons = async () => {
        try {
            // In a real app we'd fetch actual active hackathons. 
            // For now, let's fetch saved hackathons or active ones from feed
            const { hackathonService } = await import('../services/supabase');
            const response = await hackathonService.getHackathons(0, 5);
            setUserHackathons(response.data);
        } catch (error) {
            console.error('Error loading hackathons:', error);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setLoading(true);
        try {
            const { profileService } = await import('../services/supabase');
            const results = await profileService.searchProfiles(searchQuery);
            setSearchResults(results);
        } catch (error) {
            console.error('Error searching profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (userId: string, userName: string) => {
        if (userHackathons.length === 0) {
            alert('No active hackathons found to invite to.');
            return;
        }

        // Just pick the first one for speed/demo purposes if specific one isn't selected
        // Ideally we show a modal to pick
        const targetHackathon = userHackathons[0];

        setSendingInvite(userId);
        try {
            const { teammatesService } = await import('../services/supabase');
            await teammatesService.sendInvite(
                userId,
                targetHackathon.id,
                `Hi ${userName}, I'd like to invite you to join my team for ${targetHackathon.title}!`
            );
            alert(`Invite sent to ${userName}!`);
        } catch (error: any) {
            console.error('Error sending invite:', error);
            alert('Failed to send invite: ' + error.message);
        } finally {
            setSendingInvite(null);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            {/* Header */}
            <LinearGradient
                colors={['rgba(245, 166, 35, 0.15)', 'rgba(10, 10, 10, 0.5)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                    Find Teammates
                </Text>
                <TouchableOpacity>
                    <Ionicons name="settings-outline" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
            </LinearGradient>

            {/* Search Bar */}
            <View style={{ padding: 16 }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: theme.colors.surface,
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderWidth: 1,
                    borderColor: 'rgba(245, 166, 35, 0.2)'
                }}>
                    <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
                    <TextInput
                        style={{
                            flex: 1,
                            marginLeft: 8,
                            color: theme.colors.text,
                            fontSize: 16
                        }}
                        placeholder="Search by name or username..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                    />
                    {loading && <ActivityIndicator size="small" color={theme.colors.primary} />}
                </View>
            </View>

            {/* Results */}
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}>
                {searchQuery && searchResults.length === 0 && !loading ? (
                    <Text style={{ textAlign: 'center', color: theme.colors.textSecondary, marginTop: 20 }}>
                        No users found matching "{searchQuery}"
                    </Text>
                ) : (
                    searchResults.map((user) => (
                        <View
                            key={user.id}
                            style={[
                                styles.candidateCard,
                                { backgroundColor: theme.colors.surface, marginBottom: 12 }
                            ]}
                        >
                            <View style={styles.candidateHeader}>
                                <View style={styles.candidateLeft}>
                                    <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primary }]}>
                                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
                                            {user.full_name?.charAt(0) || user.username?.charAt(0) || '?'}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text style={[styles.candidateName, { color: theme.colors.text }]}>
                                            {user.full_name || 'Unknown User'}
                                        </Text>
                                        <Text style={[styles.availability, { color: theme.colors.textSecondary }]}>
                                            @{user.username || 'user'}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Skills (if available in profile) */}
                            {user.skills && user.skills.length > 0 && (
                                <View style={styles.skillsRow}>
                                    {user.skills.slice(0, 3).map((skill: string, idx: number) => (
                                        <View
                                            key={idx}
                                            style={[styles.skillChip, { backgroundColor: 'rgba(245, 166, 35, 0.1)' }]}
                                        >
                                            <Text style={[styles.skillText, { color: theme.colors.primary }]}>
                                                {skill}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            <TouchableOpacity
                                style={[styles.inviteButton, { opacity: sendingInvite === user.id ? 0.7 : 1 }]}
                                onPress={() => handleInvite(user.id, user.full_name)}
                                disabled={sendingInvite === user.id}
                            >
                                <LinearGradient
                                    colors={theme.colors.gradientGold}
                                    style={styles.inviteGradient}
                                >
                                    {sendingInvite === user.id ? (
                                        <ActivityIndicator size="small" color="#0A0A0A" />
                                    ) : (
                                        <>
                                            <Ionicons name="person-add" size={16} color="#0A0A0A" />
                                            <Text style={styles.inviteText}>Send Invite</Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    ))
                )}

                {!searchQuery && (
                    <View style={{ alignItems: 'center', marginTop: 40, opacity: 0.6 }}>
                        <Ionicons name="people-outline" size={64} color={theme.colors.textSecondary} />
                        <Text style={{ color: theme.colors.textSecondary, marginTop: 12 }}>
                            Search for friends to invite to your team
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(245, 166, 35, 0.2)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    insightBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 8,
        gap: 8,
    },
    insightText: {
        flex: 1,
        fontSize: 13,
    },
    roleSection: {
        marginTop: 12,
    },
    roleCard: {
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(245, 166, 35, 0.1)',
    },
    roleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    roleLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    roleIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    roleName: {
        fontSize: 16,
        fontWeight: '700',
    },
    roleStatus: {
        fontSize: 12,
        marginTop: 2,
    },
    neededBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    neededText: {
        fontSize: 11,
        fontWeight: '700',
    },
    candidatesList: {
        marginTop: 12,
        marginHorizontal: 16,
        gap: 12,
    },
    candidateCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(245, 166, 35, 0.1)',
    },
    candidateHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    candidateLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        fontSize: 32,
    },
    candidateName: {
        fontSize: 15,
        fontWeight: '700',
    },
    availability: {
        fontSize: 12,
        marginTop: 2,
    },
    matchScoreContainer: {
        alignItems: 'center',
    },
    matchScore: {
        fontSize: 24,
        fontWeight: '700',
    },
    matchLabel: {
        fontSize: 11,
    },
    skillsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 12,
    },
    skillChip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    skillText: {
        fontSize: 11,
        fontWeight: '600',
    },
    inviteButton: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    inviteGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        gap: 6,
    },
    inviteText: {
        color: '#0A0A0A',
        fontSize: 14,
        fontWeight: '700',
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore, useAuthStore } from '../stores';
import { theme } from '../theme';
import { Hackathon } from '../types';

type TabType = 'upcoming' | 'past';

interface UserHackathon extends Hackathon {
    role?: string;
    is_winner?: boolean;
    prize_won?: string;
}

export const YourHacksScreen: React.FC = () => {
    const navigation = useNavigation();
    const { isDarkMode = false } = useThemeStore();
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<TabType>('upcoming');
    const [hackathons, setHackathons] = useState<UserHackathon[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserHackathons();
    }, []);

    const loadUserHackathons = async () => {
        // TODO: Replace with actual Supabase query
        // Query: SELECT h.*, tm.role, tm.is_winner, tm.prize_won
        // FROM hackathons h
        // JOIN teams t ON t.hackathon_id = h.id
        // JOIN team_members tm ON tm.team_id = t.id
        // WHERE tm.user_id = current_user_id

        // Mock data
        setHackathons([
            {
                id: '1',
                title: 'HackMIT 2024',
                description: 'MIT\'s premier hackathon',
                short_summary: '36-hour hackathon at MIT',
                start_date: '2024-09-15',
                end_date: '2024-09-17',
                registration_deadline: '2024-09-10',
                themes: ['AI', 'Web3'],
                platform_source: 'devpost',
                original_url: 'https://hackmit.org',
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
                prize_money: '$50,000',
                role: 'Frontend Developer',
            },
            {
                id: '2',
                title: 'TreeHacks',
                description: 'Stanford\'s hackathon',
                short_summary: 'Build the future at Stanford',
                start_date: '2023-02-16',
                end_date: '2023-02-18',
                registration_deadline: '2023-02-10',
                themes: ['Health', 'Education'],
                platform_source: 'devpost',
                original_url: 'https://treehacks.com',
                created_at: '2023-01-01',
                updated_at: '2023-01-01',
                prize_money: '$30,000',
                role: 'Full Stack Developer',
                is_winner: true,
                prize_won: 'Best Health Hack - $5,000',
            },
        ]);
        setLoading(false);
    };

    const upcomingHackathons = hackathons.filter(h => {
        const endDate = new Date(h.end_date || '');
        return endDate > new Date();
    });

    const pastHackathons = hackathons.filter(h => {
        const endDate = new Date(h.end_date || '');
        return endDate <= new Date();
    });

    const displayedHackathons = activeTab === 'upcoming' ? upcomingHackathons : pastHackathons;

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'TBA';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    const handleHackathonPress = (hackathon: UserHackathon) => {
        navigation.navigate('HackathonDetail' as never, { hackathon } as never);
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
                    Your Hacks
                </Text>
                <View style={{ width: 24 }} />
            </LinearGradient>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                        {hackathons.length}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                        Total Hacks
                    </Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                        {hackathons.filter(h => h.is_winner).length}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                        Wins
                    </Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                        {upcomingHackathons.length}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                        Upcoming
                    </Text>
                </View>
            </View>

            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    onPress={() => setActiveTab('upcoming')}
                    style={[
                        styles.tab,
                        activeTab === 'upcoming' && { borderBottomColor: theme.colors.primary },
                    ]}
                >
                    <Text
                        style={[
                            styles.tabText,
                            { color: activeTab === 'upcoming' ? theme.colors.primary : theme.colors.textLight },
                        ]}
                    >
                        Upcoming ({upcomingHackathons.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('past')}
                    style={[
                        styles.tab,
                        activeTab === 'past' && { borderBottomColor: theme.colors.primary },
                    ]}
                >
                    <Text
                        style={[
                            styles.tabText,
                            { color: activeTab === 'past' ? theme.colors.primary : theme.colors.textLight },
                        ]}
                    >
                        Past ({pastHackathons.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Hackathon List */}
            <ScrollView style={{ flex: 1 }}>
                {loading ? (
                    <View style={styles.emptyContainer}>
                        <Text style={{ color: theme.colors.textLight }}>Loading your hacks...</Text>
                    </View>
                ) : displayedHackathons.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="trophy-outline" size={64} color={theme.colors.textLight} />
                        <Text style={[styles.emptyText, { color: theme.colors.textLight }]}>
                            No {activeTab} hackathons
                        </Text>
                        <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                            {activeTab === 'upcoming'
                                ? 'Join a team to start your next adventure'
                                : 'Your hackathon history will appear here'}
                        </Text>
                    </View>
                ) : (
                    displayedHackathons.map((hackathon) => (
                        <TouchableOpacity
                            key={hackathon.id}
                            onPress={() => handleHackathonPress(hackathon)}
                            style={[styles.hackathonCard, { backgroundColor: theme.colors.surface }]}
                        >
                            {/* Winner Badge */}
                            {hackathon.is_winner && (
                                <View style={[styles.winnerBadge, { backgroundColor: theme.colors.primary }]}>
                                    <Ionicons name="trophy" size={16} color="#0A0A0A" />
                                    <Text style={styles.winnerText}>Winner</Text>
                                </View>
                            )}

                            <Text style={[styles.hackathonTitle, { color: theme.colors.text }]}>
                                {hackathon.title}
                            </Text>

                            <View style={styles.dateRow}>
                                <Ionicons name="calendar" size={14} color={theme.colors.primary} />
                                <Text style={[styles.dateText, { color: theme.colors.primary }]}>
                                    {formatDate(hackathon.start_date)} - {formatDate(hackathon.end_date)}
                                </Text>
                            </View>

                            {hackathon.role && (
                                <View style={styles.roleRow}>
                                    <Ionicons name="person" size={14} color={theme.colors.textSecondary} />
                                    <Text style={[styles.roleText, { color: theme.colors.textSecondary }]}>
                                        Role: {hackathon.role}
                                    </Text>
                                </View>
                            )}

                            {hackathon.prize_won && (
                                <View style={styles.prizeRow}>
                                    <Ionicons name="gift" size={14} color={theme.colors.primary} />
                                    <Text style={[styles.prizeText, { color: theme.colors.primary }]}>
                                        {hackathon.prize_won}
                                    </Text>
                                </View>
                            )}

                            {hackathon.themes && hackathon.themes.length > 0 && (
                                <View style={styles.themesRow}>
                                    {hackathon.themes.slice(0, 3).map((theme, index) => (
                                        <View
                                            key={index}
                                            style={[styles.themeChip, { backgroundColor: 'rgba(245, 166, 35, 0.1)' }]}
                                        >
                                            <Text style={[styles.themeText, { color: theme.colors.primary }]}>
                                                {theme}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            <View style={styles.cardFooter}>
                                <Text style={[styles.viewDetails, { color: theme.colors.primary }]}>
                                    View Details
                                </Text>
                                <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
                            </View>
                        </TouchableOpacity>
                    ))
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
    statsRow: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(245, 166, 35, 0.1)',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(245, 166, 35, 0.1)',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 32,
    },
    hackathonCard: {
        marginHorizontal: 16,
        marginTop: 12,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(245, 166, 35, 0.1)',
    },
    winnerBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    winnerText: {
        color: '#0A0A0A',
        fontSize: 11,
        fontWeight: 'bold',
    },
    hackathonTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        paddingRight: 80,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    dateText: {
        fontSize: 12,
        fontWeight: '600',
    },
    roleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    roleText: {
        fontSize: 12,
    },
    prizeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    prizeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    themesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 12,
    },
    themeChip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    themeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 4,
    },
    viewDetails: {
        fontSize: 12,
        fontWeight: '600',
    },
});

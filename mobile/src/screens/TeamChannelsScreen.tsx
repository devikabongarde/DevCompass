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

interface TeamChannel {
    id: string;
    name: string;
    hackathon_name: string;
    last_message: string;
    last_message_time: string;
    unread_count: number;
    member_count: number;
}

export const TeamChannelsScreen: React.FC = () => {
    const navigation = useNavigation();
    const { isDarkMode = false } = useThemeStore();
    const { user } = useAuthStore();
    const [channels, setChannels] = useState<TeamChannel[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTeamChannels();
    }, []);

    const loadTeamChannels = async () => {
        // TODO: Replace with actual Supabase query
        // Query: SELECT teams.*, last_message FROM teams 
        // JOIN team_members ON team_members.team_id = teams.id
        // WHERE team_members.user_id = current_user_id

        // Mock data for now
        setChannels([
            {
                id: '1',
                name: 'AI Innovators',
                hackathon_name: 'HackMIT 2024',
                last_message: 'Hey team, I just pushed the latest changes!',
                last_message_time: '2m ago',
                unread_count: 3,
                member_count: 4,
            },
            {
                id: '2',
                name: 'Code Crusaders',
                hackathon_name: 'TreeHacks',
                last_message: 'Meeting at 3pm?',
                last_message_time: '1h ago',
                unread_count: 0,
                member_count: 5,
            },
        ]);
        setLoading(false);
    };

    const handleChannelPress = (channel: TeamChannel) => {
        // Navigate to ChatScreen with team context
        navigation.navigate('ChatScreen' as never, {
            teamId: channel.id,
            teamName: channel.name,
        } as never);
    };

    const formatTime = (time: string) => {
        return time;
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
                    Team Channels
                </Text>
                <TouchableOpacity>
                    <Ionicons name="add-circle-outline" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={{ flex: 1 }}>
                {loading ? (
                    <View style={styles.emptyContainer}>
                        <Text style={{ color: theme.colors.textLight }}>Loading channels...</Text>
                    </View>
                ) : channels.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="chatbubbles-outline" size={64} color={theme.colors.textLight} />
                        <Text style={[styles.emptyText, { color: theme.colors.textLight }]}>
                            No team channels yet
                        </Text>
                        <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                            Join a team to start collaborating
                        </Text>
                    </View>
                ) : (
                    channels.map((channel) => (
                        <TouchableOpacity
                            key={channel.id}
                            onPress={() => handleChannelPress(channel)}
                            style={[styles.channelCard, { backgroundColor: theme.colors.surface }]}
                        >
                            {/* Team Icon */}
                            <LinearGradient
                                colors={theme.colors.gradientGold}
                                style={styles.channelIcon}
                            >
                                <Text style={styles.channelIconText}>
                                    {channel.name.charAt(0).toUpperCase()}
                                </Text>
                            </LinearGradient>

                            {/* Channel Info */}
                            <View style={styles.channelInfo}>
                                <View style={styles.channelHeader}>
                                    <Text style={[styles.channelName, { color: theme.colors.text }]}>
                                        {channel.name}
                                    </Text>
                                    <Text style={[styles.channelTime, { color: theme.colors.textLight }]}>
                                        {formatTime(channel.last_message_time)}
                                    </Text>
                                </View>

                                <Text style={[styles.hackathonName, { color: theme.colors.primary }]}>
                                    {channel.hackathon_name}
                                </Text>

                                <View style={styles.lastMessageRow}>
                                    <Text
                                        style={[styles.lastMessage, { color: theme.colors.textSecondary }]}
                                        numberOfLines={1}
                                    >
                                        {channel.last_message}
                                    </Text>
                                    {channel.unread_count > 0 && (
                                        <View style={[styles.unreadBadge, { backgroundColor: theme.colors.primary }]}>
                                            <Text style={styles.unreadText}>{channel.unread_count}</Text>
                                        </View>
                                    )}
                                </View>

                                {/* Member Count */}
                                <View style={styles.memberRow}>
                                    <Ionicons name="people" size={14} color={theme.colors.textLight} />
                                    <Text style={[styles.memberCount, { color: theme.colors.textLight }]}>
                                        {channel.member_count} members
                                    </Text>
                                </View>
                            </View>

                            {/* Arrow */}
                            <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
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
    },
    channelCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(245, 166, 35, 0.1)',
    },
    channelIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    channelIconText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0A0A0A',
    },
    channelInfo: {
        flex: 1,
    },
    channelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    channelName: {
        fontSize: 16,
        fontWeight: '700',
    },
    channelTime: {
        fontSize: 12,
    },
    hackathonName: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 6,
    },
    lastMessageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    lastMessage: {
        fontSize: 14,
        flex: 1,
    },
    unreadBadge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
        marginLeft: 8,
    },
    unreadText: {
        color: '#0A0A0A',
        fontSize: 11,
        fontWeight: 'bold',
    },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    memberCount: {
        fontSize: 12,
    },
});

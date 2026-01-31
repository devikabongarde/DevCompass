import React, { useState } from 'react';
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
import { useThemeStore } from '../stores';
import { theme } from '../theme';

interface Community {
    id: string;
    name: string;
    icon: string;
    members: number;
    category: string;
    description: string;
    isJoined: boolean;
}

export const CommunitiesScreen: React.FC = () => {
    const navigation = useNavigation();
    const { isDarkMode = false } = useThemeStore();
    const [communities, setCommunities] = useState<Community[]>([
        {
            id: '1',
            name: 'VJTI Mumbai',
            icon: '🏛️',
            members: 2400,
            category: 'College',
            description: 'Official community for VJTI students and alumni',
            isJoined: true,
        },
        {
            id: '2',
            name: 'GDSC India',
            icon: '🎯',
            members: 15000,
            category: 'Tech Community',
            description: 'Google Developer Student Clubs across India',
            isJoined: true,
        },
        {
            id: '3',
            name: 'Web3 India',
            icon: '⛓️',
            members: 8500,
            category: 'Tech Community',
            description: 'Blockchain and Web3 developers in India',
            isJoined: false,
        },
        {
            id: '4',
            name: 'Mumbai Hackers',
            icon: '💻',
            members: 5200,
            category: 'Local',
            description: 'Mumbai-based hackathon enthusiasts',
            isJoined: true,
        },
        {
            id: '5',
            name: 'AI/ML India',
            icon: '🤖',
            members: 12000,
            category: 'Tech Community',
            description: 'Machine Learning and AI practitioners',
            isJoined: false,
        },
        {
            id: '6',
            name: 'IIT Bombay',
            icon: '🎓',
            members: 3800,
            category: 'College',
            description: 'IIT Bombay student community',
            isJoined: false,
        },
    ]);

    const toggleJoin = (id: string) => {
        setCommunities(communities.map(c =>
            c.id === id ? { ...c, isJoined: !c.isJoined } : c
        ));
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
                    Communities
                </Text>
                <TouchableOpacity>
                    <Ionicons name="search" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
            </LinearGradient>

            {/* Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                        {communities.filter(c => c.isJoined).length}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textLight }]}>
                        Joined
                    </Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                        {communities.reduce((sum, c) => c.isJoined ? sum + c.members : sum, 0).toLocaleString()}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textLight }]}>
                        Total Reach
                    </Text>
                </View>
            </View>

            <ScrollView style={{ flex: 1 }}>
                {communities.map((community) => (
                    <View
                        key={community.id}
                        style={[styles.communityCard, { backgroundColor: theme.colors.surface }]}
                    >
                        <View style={styles.communityHeader}>
                            <View style={styles.communityLeft}>
                                <Text style={styles.communityIcon}>{community.icon}</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.communityName, { color: theme.colors.text }]}>
                                        {community.name}
                                    </Text>
                                    <View style={styles.communityMeta}>
                                        <View style={[styles.categoryBadge, { backgroundColor: 'rgba(245, 166, 35, 0.1)' }]}>
                                            <Text style={[styles.categoryText, { color: theme.colors.primary }]}>
                                                {community.category}
                                            </Text>
                                        </View>
                                        <View style={styles.membersRow}>
                                            <Ionicons name="people" size={12} color={theme.colors.textSecondary} />
                                            <Text style={[styles.membersText, { color: theme.colors.textSecondary }]}>
                                                {community.members.toLocaleString()}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <Text style={[styles.communityDescription, { color: theme.colors.textSecondary }]}>
                            {community.description}
                        </Text>

                        <TouchableOpacity
                            style={styles.joinButton}
                            onPress={() => toggleJoin(community.id)}
                        >
                            {community.isJoined ? (
                                <View style={[styles.joinedButton, { backgroundColor: 'rgba(245, 166, 35, 0.1)' }]}>
                                    <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                                    <Text style={[styles.joinedText, { color: theme.colors.primary }]}>
                                        Joined
                                    </Text>
                                </View>
                            ) : (
                                <LinearGradient
                                    colors={theme.colors.gradientGold}
                                    style={styles.joinGradient}
                                >
                                    <Ionicons name="add-circle" size={16} color="#0A0A0A" />
                                    <Text style={styles.joinText}>Join Community</Text>
                                </LinearGradient>
                            )}
                        </TouchableOpacity>
                    </View>
                ))}
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
    statsContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
        padding: 12,
        backgroundColor: 'rgba(245, 166, 35, 0.05)',
        borderRadius: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    communityCard: {
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(245, 166, 35, 0.1)',
    },
    communityHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    communityLeft: {
        flex: 1,
        flexDirection: 'row',
        gap: 12,
    },
    communityIcon: {
        fontSize: 40,
    },
    communityName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 6,
    },
    communityMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    categoryBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    categoryText: {
        fontSize: 10,
        fontWeight: '600',
    },
    membersRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    membersText: {
        fontSize: 11,
    },
    communityDescription: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 12,
    },
    joinButton: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    joinGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        gap: 6,
    },
    joinText: {
        color: '#0A0A0A',
        fontSize: 14,
        fontWeight: '700',
    },
    joinedButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        gap: 6,
    },
    joinedText: {
        fontSize: 14,
        fontWeight: '700',
    },
});

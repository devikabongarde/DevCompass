// This file contains all the remaining drawer navigation screens
// Import them individually in AppNavigator.tsx

import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore } from '../stores';
import { theme } from '../theme';

// ============ HACKATHON RECOMMENDATIONS ============
export const HackathonRecommendationsScreen: React.FC = () => {
    const navigation = useNavigation();
    const { isDarkMode = false } = useThemeStore();

    const recommendations = [
        { id: '1', title: 'Smart India Hackathon 2024', match: 95, reason: 'Matches your AI/ML skills', prize: '₹1,00,000', deadline: '15 Aug 2024' },
        { id: '2', title: 'Flipkart GRiD 5.0', match: 88, reason: 'E-commerce + ML focus', prize: '₹10,00,000', deadline: '1 Sep 2024' },
        { id: '3', title: 'HackBangalore 2024', match: 82, reason: 'Startup-focused', prize: '₹5,00,000', deadline: '25 Aug 2024' },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <LinearGradient colors={['rgba(245, 166, 35, 0.15)', 'rgba(10, 10, 10, 0.5)']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Recommendations</Text>
                <Ionicons name="filter" size={24} color={theme.colors.primary} />
            </LinearGradient>

            <ScrollView style={{ flex: 1, padding: 16 }}>
                {recommendations.map((hack) => (
                    <View key={hack.id} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.matchBadge}>
                            <Text style={[styles.matchText, { color: theme.colors.primary }]}>{hack.match}% Match</Text>
                        </View>
                        <Text style={[styles.title, { color: theme.colors.text }]}>{hack.title}</Text>
                        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{hack.reason}</Text>
                        <View style={styles.row}>
                            <View style={styles.metaItem}>
                                <Ionicons name="trophy" size={14} color={theme.colors.primary} />
                                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>{hack.prize}</Text>
                            </View>
                            <View style={styles.metaItem}>
                                <Ionicons name="calendar" size={14} color={theme.colors.primary} />
                                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>{hack.deadline}</Text>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

// ============ SYNERGY SCORE ============
export const SynergyScoreScreen: React.FC = () => {
    const navigation = useNavigation();
    const { isDarkMode = false } = useThemeStore();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <LinearGradient colors={['rgba(245, 166, 35, 0.15)', 'rgba(10, 10, 10, 0.5)']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Team Synergy</Text>
                <Ionicons name="analytics" size={24} color={theme.colors.primary} />
            </LinearGradient>

            <ScrollView style={{ flex: 1, padding: 16 }}>
                <View style={[styles.scoreCard, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.scoreLabel, { color: theme.colors.textLight }]}>Overall Synergy Score</Text>
                    <Text style={[styles.scoreValue, { color: theme.colors.primary }]}>87/100</Text>
                    <Text style={[styles.scoreDesc, { color: theme.colors.textSecondary }]}>Excellent team balance!</Text>
                </View>

                <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Skill Coverage</Text>
                    {['Frontend: 90%', 'Backend: 85%', 'Design: 75%', 'ML: 80%'].map((skill, idx) => (
                        <View key={idx} style={styles.skillRow}>
                            <Text style={[styles.skillText, { color: theme.colors.textSecondary }]}>{skill}</Text>
                            <View style={styles.skillBar}>
                                <View style={[styles.skillFill, { width: skill.split(': ')[1], backgroundColor: theme.colors.primary }]} />
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// ============ GITHUB IMPORT ============
export const GitHubImportScreen: React.FC = () => {
    const navigation = useNavigation();
    const { isDarkMode = false } = useThemeStore();
    const [username, setUsername] = useState('');

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <LinearGradient colors={['rgba(245, 166, 35, 0.15)', 'rgba(10, 10, 10, 0.5)']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>GitHub Import</Text>
                <Ionicons name="logo-github" size={24} color={theme.colors.primary} />
            </LinearGradient>

            <ScrollView style={{ flex: 1, padding: 16 }}>
                <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.title, { color: theme.colors.text }]}>Import Your GitHub Profile</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
                        placeholder="GitHub username"
                        placeholderTextColor={theme.colors.textLight}
                        value={username}
                        onChangeText={setUsername}
                    />
                    <TouchableOpacity style={styles.button}>
                        <LinearGradient colors={theme.colors.gradientGold} style={styles.buttonGradient}>
                            <Text style={styles.buttonText}>Import Profile</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>What we'll import:</Text>
                    {['Top languages', 'Contribution stats', 'Pinned repositories', 'Activity graph'].map((item, idx) => (
                        <View key={idx} style={styles.listItem}>
                            <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                            <Text style={[styles.listText, { color: theme.colors.textSecondary }]}>{item}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// ============ PORTFOLIO MODES ============
export const PortfolioModesScreen: React.FC = () => {
    const navigation = useNavigation();
    const { isDarkMode = false } = useThemeStore();
    const [mode, setMode] = useState<'hackathon' | 'job'>('hackathon');

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <LinearGradient colors={['rgba(245, 166, 35, 0.15)', 'rgba(10, 10, 10, 0.5)']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Portfolio Modes</Text>
                <Ionicons name="briefcase" size={24} color={theme.colors.primary} />
            </LinearGradient>

            <ScrollView style={{ flex: 1, padding: 16 }}>
                <TouchableOpacity
                    style={[styles.modeCard, { backgroundColor: mode === 'hackathon' ? 'rgba(245, 166, 35, 0.2)' : theme.colors.surface }]}
                    onPress={() => setMode('hackathon')}
                >
                    <Ionicons name="trophy" size={32} color={theme.colors.primary} />
                    <Text style={[styles.modeTitle, { color: theme.colors.text }]}>Hackathon Mode</Text>
                    <Text style={[styles.modeDesc, { color: theme.colors.textSecondary }]}>
                        Show projects, team experience, and hackathon wins
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.modeCard, { backgroundColor: mode === 'job' ? 'rgba(245, 166, 35, 0.2)' : theme.colors.surface }]}
                    onPress={() => setMode('job')}
                >
                    <Ionicons name="briefcase" size={32} color={theme.colors.primary} />
                    <Text style={[styles.modeTitle, { color: theme.colors.text }]}>Job Mode</Text>
                    <Text style={[styles.modeDesc, { color: theme.colors.textSecondary }]}>
                        Professional resume view with work experience and skills
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

// ============ PRIVACY CONTROLS ============
export const PrivacyControlsScreen: React.FC = () => {
    const navigation = useNavigation();
    const { isDarkMode = false } = useThemeStore();
    const [settings, setSettings] = useState({
        showEmail: true,
        showGitHub: true,
        showProjects: true,
        anonymousBrowsing: false,
    });

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <LinearGradient colors={['rgba(245, 166, 35, 0.15)', 'rgba(10, 10, 10, 0.5)']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Privacy Controls</Text>
                <Ionicons name="shield-checkmark" size={24} color={theme.colors.primary} />
            </LinearGradient>

            <ScrollView style={{ flex: 1, padding: 16 }}>
                {Object.entries(settings).map(([key, value]) => (
                    <View key={key} style={[styles.settingRow, { backgroundColor: theme.colors.surface }]}>
                        <Text style={[styles.settingText, { color: theme.colors.text }]}>
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Text>
                        <Switch
                            value={value}
                            onValueChange={(val) => setSettings({ ...settings, [key]: val })}
                            trackColor={{ false: '#444', true: theme.colors.primary }}
                        />
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

// ============ CONTENT LANES ============
export const ContentLanesScreen: React.FC = () => {
    const navigation = useNavigation();
    const { isDarkMode = false } = useThemeStore();

    const lanes = [
        { id: '1', name: 'Team Updates', icon: 'people', count: 12 },
        { id: '2', name: 'Project Demos', icon: 'videocam', count: 8 },
        { id: '3', name: 'Opportunities', icon: 'briefcase', count: 5 },
        { id: '4', name: 'Memes', icon: 'happy', count: 24 },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <LinearGradient colors={['rgba(245, 166, 35, 0.15)', 'rgba(10, 10, 10, 0.5)']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Content Lanes</Text>
                <Ionicons name="layers" size={24} color={theme.colors.primary} />
            </LinearGradient>

            <ScrollView style={{ flex: 1, padding: 16 }}>
                {lanes.map((lane) => (
                    <TouchableOpacity key={lane.id} style={[styles.laneCard, { backgroundColor: theme.colors.surface }]}>
                        <Ionicons name={lane.icon as any} size={32} color={theme.colors.primary} />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.laneTitle, { color: theme.colors.text }]}>{lane.name}</Text>
                            <Text style={[styles.laneCount, { color: theme.colors.textSecondary }]}>{lane.count} new posts</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

// ============ PROJECT DEMOS ============
export const ProjectDemosScreen: React.FC = () => {
    const navigation = useNavigation();
    const { isDarkMode = false } = useThemeStore();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <LinearGradient colors={['rgba(245, 166, 35, 0.15)', 'rgba(10, 10, 10, 0.5)']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Project Demos</Text>
                <Ionicons name="videocam" size={24} color={theme.colors.primary} />
            </LinearGradient>

            <View style={styles.centerContainer}>
                <Ionicons name="videocam-outline" size={80} color={theme.colors.primary} />
                <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>TikTok-Style Demo Videos</Text>
                <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                    30-60s vertical videos showcasing hackathon projects
                </Text>
                <TouchableOpacity style={styles.button}>
                    <LinearGradient colors={theme.colors.gradientGold} style={styles.buttonGradient}>
                        <Ionicons name="add" size={20} color="#0A0A0A" />
                        <Text style={styles.buttonText}>Upload Demo</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

// ============ FEED CONTROLS ============
export const FeedControlsScreen: React.FC = () => {
    const navigation = useNavigation();
    const { isDarkMode = false } = useThemeStore();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <LinearGradient colors={['rgba(245, 166, 35, 0.15)', 'rgba(10, 10, 10, 0.5)']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Feed Controls</Text>
                <Ionicons name="options" size={24} color={theme.colors.primary} />
            </LinearGradient>

            <ScrollView style={{ flex: 1, padding: 16 }}>
                <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Muted Topics</Text>
                    {['Blockchain', 'Gaming', 'Crypto'].map((topic, idx) => (
                        <View key={idx} style={styles.mutedItem}>
                            <Text style={[styles.mutedText, { color: theme.colors.textSecondary }]}>{topic}</Text>
                            <TouchableOpacity>
                                <Ionicons name="close-circle" size={20} color={theme.colors.primary} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// Continue with remaining screens...
// (Due to length, I'll create a second file for the rest)

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
    card: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(245, 166, 35, 0.1)',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 13,
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
    },
    matchBadge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(245, 166, 35, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 8,
    },
    matchText: {
        fontSize: 12,
        fontWeight: '700',
    },
    scoreCard: {
        padding: 24,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(245, 166, 35, 0.2)',
    },
    scoreLabel: {
        fontSize: 14,
        marginBottom: 8,
    },
    scoreValue: {
        fontSize: 48,
        fontWeight: '700',
    },
    scoreDesc: {
        fontSize: 14,
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    skillRow: {
        marginBottom: 12,
    },
    skillText: {
        fontSize: 13,
        marginBottom: 4,
    },
    skillBar: {
        height: 6,
        backgroundColor: 'rgba(245, 166, 35, 0.1)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    skillFill: {
        height: '100%',
    },
    input: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(245, 166, 35, 0.2)',
    },
    button: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 6,
    },
    buttonText: {
        color: '#0A0A0A',
        fontSize: 14,
        fontWeight: '700',
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    listText: {
        fontSize: 13,
    },
    modeCard: {
        padding: 20,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'rgba(245, 166, 35, 0.2)',
        alignItems: 'center',
    },
    modeTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 12,
        marginBottom: 8,
    },
    modeDesc: {
        fontSize: 13,
        textAlign: 'center',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    settingText: {
        fontSize: 14,
    },
    laneCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(245, 166, 35, 0.1)',
    },
    laneTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    laneCount: {
        fontSize: 12,
        marginTop: 2,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
    },
    mutedItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    mutedText: {
        fontSize: 14,
    },
});

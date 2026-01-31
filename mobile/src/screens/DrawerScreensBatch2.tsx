// Remaining drawer navigation screens - Batch 2

import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore } from '../stores';
import { theme } from '../theme';

// ============ MENTOR HUB ============
export const MentorHubScreen: React.FC = () => {
    const navigation = useNavigation();
    const { isDarkMode = false } = useThemeStore();

    const mentors = [
        { id: '1', name: 'Dr. Rajesh Kumar', expertise: 'AI/ML', available: true, rating: 4.9 },
        { id: '2', name: 'Priya Sharma', expertise: 'Web Development', available: false, rating: 4.8 },
        { id: '3', name: 'Arjun Patel', expertise: 'Blockchain', available: true, rating: 4.7 },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <LinearGradient colors={['rgba(245, 166, 35, 0.15)', 'rgba(10, 10, 10, 0.5)']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Mentor Hub</Text>
                <Ionicons name="school" size={24} color={theme.colors.primary} />
            </LinearGradient>

            <ScrollView style={{ flex: 1, padding: 16 }}>
                {mentors.map((mentor) => (
                    <View key={mentor.id} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.mentorHeader}>
                            <View>
                                <Text style={[styles.mentorName, { color: theme.colors.text }]}>{mentor.name}</Text>
                                <Text style={[styles.mentorExpertise, { color: theme.colors.textSecondary }]}>{mentor.expertise}</Text>
                            </View>
                            <View style={styles.ratingContainer}>
                                <Ionicons name="star" size={16} color={theme.colors.primary} />
                                <Text style={[styles.rating, { color: theme.colors.primary }]}>{mentor.rating}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.button}>
                            <LinearGradient
                                colors={mentor.available ? theme.colors.gradientGold : ['#444', '#666']}
                                style={styles.buttonGradient}
                            >
                                <Text style={styles.buttonText}>{mentor.available ? 'Request Help' : 'Unavailable'}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

// ============ TIMELINE VIEW ============
export const TimelineViewScreen: React.FC = () => {
    const navigation = useNavigation();
    const { isDarkMode = false } = useThemeStore();

    const events = [
        { id: '1', title: 'Smart India Hackathon Registration', date: '15 Aug 2024', type: 'deadline' },
        { id: '2', title: 'HackBangalore Starts', date: '25 Aug 2024', type: 'event' },
        { id: '3', title: 'Flipkart GRiD Submission', date: '1 Sep 2024', type: 'deadline' },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <LinearGradient colors={['rgba(245, 166, 35, 0.15)', 'rgba(10, 10, 10, 0.5)']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Timeline</Text>
                <Ionicons name="time" size={24} color={theme.colors.primary} />
            </LinearGradient>

            <ScrollView style={{ flex: 1, padding: 16 }}>
                {events.map((event, idx) => (
                    <View key={event.id} style={styles.timelineItem}>
                        <View style={styles.timelineDot}>
                            <View style={[styles.dot, { backgroundColor: event.type === 'deadline' ? '#FF4444' : theme.colors.primary }]} />
                            {idx < events.length - 1 && <View style={styles.line} />}
                        </View>
                        <View style={[styles.timelineCard, { backgroundColor: theme.colors.surface }]}>
                            <Text style={[styles.eventTitle, { color: theme.colors.text }]}>{event.title}</Text>
                            <Text style={[styles.eventDate, { color: theme.colors.textSecondary }]}>{event.date}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

// ============ SMART REMINDERS ============
export const SmartRemindersScreen: React.FC = () => {
    const navigation = useNavigation();
    const { isDarkMode = false } = useThemeStore();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <LinearGradient colors={['rgba(245, 166, 35, 0.15)', 'rgba(10, 10, 10, 0.5)']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Smart Reminders</Text>
                <Ionicons name="notifications" size={24} color={theme.colors.primary} />
            </LinearGradient>

            <ScrollView style={{ flex: 1, padding: 16 }}>
                <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                    <Ionicons name="alarm" size={32} color={theme.colors.primary} />
                    <Text style={[styles.reminderTitle, { color: theme.colors.text }]}>Registration closes in 3 days</Text>
                    <Text style={[styles.reminderSubtitle, { color: theme.colors.textSecondary }]}>Smart India Hackathon 2024</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// ============ DEVPOST GENERATOR ============
export const DevpostGeneratorScreen: React.FC = () => {
    const navigation = useNavigation();
    const { isDarkMode = false } = useThemeStore();
    const [projectName, setProjectName] = useState('');

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <LinearGradient colors={['rgba(245, 166, 35, 0.15)', 'rgba(10, 10, 10, 0.5)']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Devpost Generator</Text>
                <Ionicons name="document-text" size={24} color={theme.colors.primary} />
            </LinearGradient>

            <ScrollView style={{ flex: 1, padding: 16 }}>
                <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Generate Project Description</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
                        placeholder="Project name"
                        placeholderTextColor={theme.colors.textLight}
                        value={projectName}
                        onChangeText={setProjectName}
                    />
                    <TouchableOpacity style={styles.button}>
                        <LinearGradient colors={theme.colors.gradientGold} style={styles.buttonGradient}>
                            <Ionicons name="sparkles" size={18} color="#0A0A0A" />
                            <Text style={styles.buttonText}>Generate with AI</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// ============ REPUTATION & BADGES ============
export const ReputationBadgesScreen: React.FC = () => {
    const navigation = useNavigation();
    const { isDarkMode = false } = useThemeStore();

    const badges = [
        { id: '1', name: 'Shipped 5+', icon: '🚀', earned: true },
        { id: '2', name: 'On-time Delivery', icon: '⏰', earned: true },
        { id: '3', name: 'Team Player', icon: '🤝', earned: true },
        { id: '4', name: 'Mentor', icon: '👨‍🏫', earned: false },
        { id: '5', name: 'Organizer', icon: '📋', earned: false },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <LinearGradient colors={['rgba(245, 166, 35, 0.15)', 'rgba(10, 10, 10, 0.5)']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Badges</Text>
                <Ionicons name="medal" size={24} color={theme.colors.primary} />
            </LinearGradient>

            <View style={styles.reputationCard}>
                <Text style={[styles.reputationLabel, { color: theme.colors.textLight }]}>Reputation Score</Text>
                <Text style={[styles.reputationValue, { color: theme.colors.primary }]}>850</Text>
            </View>

            <ScrollView style={{ flex: 1, padding: 16 }}>
                <View style={styles.badgesGrid}>
                    {badges.map((badge) => (
                        <View
                            key={badge.id}
                            style={[
                                styles.badgeCard,
                                { backgroundColor: theme.colors.surface, opacity: badge.earned ? 1 : 0.5 }
                            ]}
                        >
                            <Text style={styles.badgeIcon}>{badge.icon}</Text>
                            <Text style={[styles.badgeName, { color: theme.colors.text }]}>{badge.name}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// ============ PERSONALITY MATCHER ============
export const PersonalityMatcherScreen: React.FC = () => {
    const navigation = useNavigation();
    const { isDarkMode = false } = useThemeStore();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <LinearGradient colors={['rgba(245, 166, 35, 0.15)', 'rgba(10, 10, 10, 0.5)']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Personality Matcher</Text>
                <Ionicons name="happy" size={24} color={theme.colors.primary} />
            </LinearGradient>

            <ScrollView style={{ flex: 1, padding: 16 }}>
                <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Work Style Preferences</Text>
                    {['Morning person', 'Async communication', 'Detailed planning', 'Quick iterations'].map((pref, idx) => (
                        <View key={idx} style={styles.preferenceRow}>
                            <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                            <Text style={[styles.preferenceText, { color: theme.colors.textSecondary }]}>{pref}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// ============ RETRO ANALYTICS ============
export const RetroAnalyticsScreen: React.FC = () => {
    const navigation = useNavigation();
    const { isDarkMode = false } = useThemeStore();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <LinearGradient colors={['rgba(245, 166, 35, 0.15)', 'rgba(10, 10, 10, 0.5)']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Retro & Analytics</Text>
                <Ionicons name="stats-chart" size={24} color={theme.colors.primary} />
            </LinearGradient>

            <ScrollView style={{ flex: 1, padding: 16 }}>
                <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Last Hackathon Stats</Text>
                    <View style={styles.statRow}>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Total Commits:</Text>
                        <Text style={[styles.statValue, { color: theme.colors.primary }]}>127</Text>
                    </View>
                    <View style={styles.statRow}>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Code Time:</Text>
                        <Text style={[styles.statValue, { color: theme.colors.primary }]}>18h 45m</Text>
                    </View>
                    <View style={styles.statRow}>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Peak Hours:</Text>
                        <Text style={[styles.statValue, { color: theme.colors.primary }]}>2AM - 6AM</Text>
                    </View>
                </View>
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
    card: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(245, 166, 35, 0.1)',
    },
    mentorHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    mentorName: {
        fontSize: 16,
        fontWeight: '700',
    },
    mentorExpertise: {
        fontSize: 13,
        marginTop: 2,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    rating: {
        fontSize: 14,
        fontWeight: '700',
    },
    button: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        gap: 6,
    },
    buttonText: {
        color: '#0A0A0A',
        fontSize: 14,
        fontWeight: '700',
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    timelineDot: {
        alignItems: 'center',
        marginRight: 12,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    line: {
        width: 2,
        flex: 1,
        backgroundColor: 'rgba(245, 166, 35, 0.3)',
        marginTop: 4,
    },
    timelineCard: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(245, 166, 35, 0.1)',
    },
    eventTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
    },
    eventDate: {
        fontSize: 12,
    },
    reminderTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 12,
        marginBottom: 4,
    },
    reminderSubtitle: {
        fontSize: 13,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    input: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(245, 166, 35, 0.2)',
    },
    reputationCard: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: 'rgba(245, 166, 35, 0.05)',
    },
    reputationLabel: {
        fontSize: 14,
        marginBottom: 8,
    },
    reputationValue: {
        fontSize: 48,
        fontWeight: '700',
    },
    badgesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    badgeCard: {
        width: '47%',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(245, 166, 35, 0.1)',
    },
    badgeIcon: {
        fontSize: 40,
        marginBottom: 8,
    },
    badgeName: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    preferenceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    preferenceText: {
        fontSize: 13,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 13,
    },
    statValue: {
        fontSize: 13,
        fontWeight: '700',
    },
});

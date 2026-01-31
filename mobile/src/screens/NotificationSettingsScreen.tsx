import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSavedStore, useThemeStore } from '../stores';
import { NotificationService, scheduleHackathonDeadlineNotification } from '../services/notifications';
import { theme } from '../theme';

export const NotificationSettingsScreen: React.FC = () => {
    const navigation = useNavigation();
    const { isDarkMode = false } = useThemeStore();
    const { savedHackathons } = useSavedStore();
    const [scheduledNotifications, setScheduledNotifications] = useState<any[]>([]);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    useEffect(() => {
        loadScheduledNotifications();
    }, []);

    const loadScheduledNotifications = async () => {
        const notifications = await NotificationService.getAllScheduledNotifications();
        setScheduledNotifications(notifications);
    };

    const handleScheduleAll = async () => {
        for (const hackathon of savedHackathons) {
            await scheduleHackathonDeadlineNotification(hackathon);
        }
        await loadScheduledNotifications();
    };

    const handleCancelAll = async () => {
        await NotificationService.cancelAllNotifications();
        await loadScheduledNotifications();
    };

    const handleCheckDeadlines = async () => {
        await NotificationService.checkAndNotifyDeadlines(savedHackathons);
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
                    Notification Settings
                </Text>
                <View style={{ width: 24 }} />
            </LinearGradient>

            <ScrollView style={{ flex: 1 }}>
                {/* Notification Toggle */}
                <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
                    <View style={styles.settingRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                                Deadline Reminders
                            </Text>
                            <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
                                Get notified 3 days before hackathon deadlines
                            </Text>
                        </View>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            trackColor={{ false: '#767577', true: theme.colors.primary }}
                            thumbColor={notificationsEnabled ? '#FFD700' : '#f4f3f4'}
                        />
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                        Quick Actions
                    </Text>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleScheduleAll}
                    >
                        <LinearGradient
                            colors={theme.colors.gradientGold}
                            style={styles.actionGradient}
                        >
                            <Ionicons name="calendar" size={20} color="#0A0A0A" />
                            <Text style={styles.actionText}>
                                Schedule All Saved Hackathons
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleCheckDeadlines}
                    >
                        <View style={[styles.actionOutline, { borderColor: theme.colors.borderGold }]}>
                            <Ionicons name="notifications" size={20} color={theme.colors.primary} />
                            <Text style={[styles.actionOutlineText, { color: theme.colors.primary }]}>
                                Check for 72-Hour Deadlines
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleCancelAll}
                    >
                        <View style={[styles.actionOutline, { borderColor: theme.colors.error }]}>
                            <Ionicons name="close-circle" size={20} color={theme.colors.error} />
                            <Text style={[styles.actionOutlineText, { color: theme.colors.error }]}>
                                Cancel All Notifications
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Scheduled Notifications */}
                <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                        Scheduled Notifications ({scheduledNotifications.length})
                    </Text>

                    {scheduledNotifications.length === 0 ? (
                        <Text style={[styles.emptyText, { color: theme.colors.textLight }]}>
                            No notifications scheduled
                        </Text>
                    ) : (
                        scheduledNotifications.map((notification, index) => (
                            <View key={index} style={styles.notificationItem}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.notificationTitle, { color: theme.colors.text }]}>
                                        {notification.content.title}
                                    </Text>
                                    <Text style={[styles.notificationBody, { color: theme.colors.textSecondary }]}>
                                        {notification.content.body}
                                    </Text>
                                    <Text style={[styles.notificationTime, { color: theme.colors.textLight }]}>
                                        {notification.trigger?.date
                                            ? new Date(notification.trigger.date).toLocaleString()
                                            : 'Immediate'}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={async () => {
                                        await NotificationService.cancelNotification(notification.identifier);
                                        await loadScheduledNotifications();
                                    }}
                                >
                                    <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                </View>

                {/* Info */}
                <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
                        <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                            Notifications are sent 72 hours (3 days) before hackathon submission deadlines.
                            Make sure to save hackathons to receive reminders!
                        </Text>
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
    section: {
        padding: 20,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 16,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    settingSubtitle: {
        fontSize: 12,
    },
    actionButton: {
        marginBottom: 12,
    },
    actionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 8,
        gap: 8,
    },
    actionText: {
        color: '#0A0A0A',
        fontSize: 14,
        fontWeight: '700',
    },
    actionOutline: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
        gap: 8,
    },
    actionOutlineText: {
        fontSize: 14,
        fontWeight: '600',
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(245, 166, 35, 0.1)',
    },
    notificationTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    notificationBody: {
        fontSize: 12,
        marginBottom: 4,
    },
    notificationTime: {
        fontSize: 10,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: 20,
    },
    infoBox: {
        flexDirection: 'row',
        gap: 12,
        padding: 12,
        backgroundColor: 'rgba(245, 166, 35, 0.1)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(245, 166, 35, 0.2)',
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 18,
    },
});

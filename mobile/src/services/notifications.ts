/**
 * Notification Service for Hackathon Deadline Reminders
 * Handles push notifications for hackathons with 72-hour deadline alerts
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Hackathon } from '../types';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export class NotificationService {
    private static expoPushToken: string | null = null;

    /**
     * Initialize notification service and request permissions
     */
    static async initialize(): Promise<string | null> {
        if (!Device.isDevice) {
            console.log('Must use physical device for Push Notifications');
            return null;
        }

        try {
            // Request permissions
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('Failed to get push token for push notification!');
                return null;
            }

            // Get push token
            const token = (await Notifications.getExpoPushTokenAsync()).data;
            this.expoPushToken = token;
            console.log('Expo Push Token:', token);

            // Android-specific channel setup
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('hackathon-deadlines', {
                    name: 'Hackathon Deadlines',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#F5A623',
                    sound: 'default',
                });
            }

            return token;
        } catch (error) {
            console.error('Error initializing notifications:', error);
            return null;
        }
    }

    /**
     * Check if a hackathon deadline is exactly 72 hours away
     */
    static isDeadlineIn72Hours(deadline: string): boolean {
        const deadlineDate = new Date(deadline);
        const now = new Date();
        const diffMs = deadlineDate.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        // Check if difference is between 71.5 and 72.5 hours (30-minute window)
        return diffHours >= 71.5 && diffHours <= 72.5;
    }

    /**
     * Calculate time until deadline in hours
     */
    static getHoursUntilDeadline(deadline: string): number {
        const deadlineDate = new Date(deadline);
        const now = new Date();
        const diffMs = deadlineDate.getTime() - now.getTime();
        return diffMs / (1000 * 60 * 60);
    }

    /**
     * Schedule a notification for a hackathon deadline
     */
    static async scheduleDeadlineNotification(hackathon: Hackathon): Promise<string | null> {
        if (!hackathon.registration_deadline && !hackathon.end_date) {
            console.log('No deadline found for hackathon:', hackathon.title);
            return null;
        }

        const deadline = hackathon.registration_deadline || hackathon.end_date!;
        const deadlineDate = new Date(deadline);
        const now = new Date();

        // Calculate when to send notification (72 hours before deadline)
        const notificationDate = new Date(deadlineDate.getTime() - (72 * 60 * 60 * 1000));

        // Don't schedule if notification time has passed
        if (notificationDate <= now) {
            console.log('Notification time has passed for:', hackathon.title);
            return null;
        }

        try {
            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: '⏰ Final Stretch!',
                    body: `3 days left to submit your project for ${hackathon.title}`,
                    data: {
                        hackathonId: hackathon.id,
                        hackathonTitle: hackathon.title,
                        deadline: deadline,
                        type: '72_hour_reminder',
                    },
                    sound: 'default',
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                    categoryIdentifier: 'hackathon-deadline',
                },
                trigger: {
                    date: notificationDate,
                    channelId: 'hackathon-deadlines',
                },
            });

            console.log('Scheduled notification:', notificationId, 'for', hackathon.title);
            return notificationId;
        } catch (error) {
            console.error('Error scheduling notification:', error);
            return null;
        }
    }

    /**
     * Send immediate notification for hackathons with deadline in 72 hours
     */
    static async sendImmediateDeadlineNotification(hackathon: Hackathon): Promise<void> {
        if (!hackathon.registration_deadline && !hackathon.end_date) {
            return;
        }

        const deadline = hackathon.registration_deadline || hackathon.end_date!;

        if (!this.isDeadlineIn72Hours(deadline)) {
            return;
        }

        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: '⏰ Final Stretch!',
                    body: `3 days left to submit your project for ${hackathon.title}`,
                    data: {
                        hackathonId: hackathon.id,
                        hackathonTitle: hackathon.title,
                        deadline: deadline,
                        type: '72_hour_reminder',
                    },
                    sound: 'default',
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                    categoryIdentifier: 'hackathon-deadline',
                },
                trigger: null, // Send immediately
            });

            console.log('Sent immediate notification for:', hackathon.title);
        } catch (error) {
            console.error('Error sending immediate notification:', error);
        }
    }

    /**
     * Check all saved hackathons and send notifications for those with 72-hour deadlines
     */
    static async checkAndNotifyDeadlines(hackathons: Hackathon[]): Promise<void> {
        for (const hackathon of hackathons) {
            await this.sendImmediateDeadlineNotification(hackathon);
        }
    }

    /**
     * Cancel a scheduled notification
     */
    static async cancelNotification(notificationId: string): Promise<void> {
        try {
            await Notifications.cancelScheduledNotificationAsync(notificationId);
            console.log('Cancelled notification:', notificationId);
        } catch (error) {
            console.error('Error cancelling notification:', error);
        }
    }

    /**
     * Cancel all scheduled notifications
     */
    static async cancelAllNotifications(): Promise<void> {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
            console.log('Cancelled all notifications');
        } catch (error) {
            console.error('Error cancelling all notifications:', error);
        }
    }

    /**
     * Get all scheduled notifications
     */
    static async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
        try {
            return await Notifications.getAllScheduledNotificationsAsync();
        } catch (error) {
            console.error('Error getting scheduled notifications:', error);
            return [];
        }
    }

    /**
     * Add notification response listener (for when user taps notification)
     */
    static addNotificationResponseListener(
        callback: (response: Notifications.NotificationResponse) => void
    ): Notifications.Subscription {
        return Notifications.addNotificationResponseReceivedListener(callback);
    }

    /**
     * Add notification received listener (for when notification is received while app is open)
     */
    static addNotificationReceivedListener(
        callback: (notification: Notifications.Notification) => void
    ): Notifications.Subscription {
        return Notifications.addNotificationReceivedListener(callback);
    }
}

// Export convenience functions
export const initializeNotifications = () => NotificationService.initialize();
export const scheduleHackathonDeadlineNotification = (hackathon: Hackathon) =>
    NotificationService.scheduleDeadlineNotification(hackathon);
export const checkDeadlineNotifications = (hackathons: Hackathon[]) =>
    NotificationService.checkAndNotifyDeadlines(hackathons);

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface ScheduledNotification {
  id: string;
  trigger: Date | number;
  content: NotificationData;
}

class NotificationService {
  private initialized = false;

  async initialize(): Promise<boolean> {
    if (this.initialized) return true;

    try {
      // Configure notification behavior
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
      }

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#10B981',
        });
      }

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return false;
    }
  }

  async sendLocalNotification(notification: NotificationData): Promise<string | null> {
    try {
      if (!this.initialized) {
        const success = await this.initialize();
        if (!success) return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
        },
        trigger: null, // Send immediately
      });

      return notificationId;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return null;
    }
  }

  async scheduleNotification(
    notification: NotificationData,
    trigger: Date | number
  ): Promise<string | null> {
    try {
      if (!this.initialized) {
        const success = await this.initialize();
        if (!success) return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
        },
        trigger: typeof trigger === 'number' ? { seconds: trigger } : trigger,
      });

      return notificationId;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      return null;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  async getPushToken(): Promise<string | null> {
    try {
      if (!this.initialized) {
        const success = await this.initialize();
        if (!success) return null;
      }

      const token = await Notifications.getExpoPushTokenAsync();
      return token.data;
    } catch (error) {
      console.error('Failed to get push token:', error);
      return null;
    }
  }

  // Order-specific notification helpers
  async notifyOrderStatusUpdate(orderId: string, status: string): Promise<void> {
    const statusMessages = {
      confirmed: 'Your order has been confirmed!',
      preparing: 'Your order is being prepared',
      ready: 'Your order is ready for pickup',
      picked_up: 'Your order is on the way',
      delivered: 'Your order has been delivered',
    };

    const message = statusMessages[status as keyof typeof statusMessages];
    if (message) {
      await this.sendLocalNotification({
        title: 'Order Update',
        body: message,
        data: { orderId, status },
      });
    }
  }

  async notifyDeliveryArrival(estimatedMinutes: number): Promise<void> {
    await this.sendLocalNotification({
      title: 'Delivery Update',
      body: `Your order will arrive in approximately ${estimatedMinutes} minutes`,
      data: { type: 'delivery_arrival' },
    });
  }
}

export const notificationService = new NotificationService();

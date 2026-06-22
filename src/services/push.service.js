import webpush from 'web-push';
import PushSubscription from '../models/PushSubscription.js';

// Configure web-push with VAPID keys from environment variables
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
} else {
  console.warn('VAPID keys are not configured properly. Web Push Notifications will not work.');
}

class PushService {
  /**
   * Broadcast a push notification to all stored admin subscriptions.
   * @param {String} title Notification title
   * @param {String} body Notification body
   */
  static async notifyAllAdmins(title, body) {
    try {
      const subscriptions = await PushSubscription.find({ $or: [{role: 'admin'}, {role: {$exists: false}}] });
      const payload = JSON.stringify({
        title,
        body
      });

      const sendPromises = subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: sub.keys,
            },
            payload
          );
        } catch (error) {
          // If subscription is invalid/expired (status 410 or 404), remove it from the DB
          if (error.statusCode === 410 || error.statusCode === 404) {
            await PushSubscription.findByIdAndDelete(sub._id);
            console.log('Removed expired push subscription');
          } else {
            console.error('Error sending push notification to a subscription:', error);
          }
        }
      });

      await Promise.all(sendPromises);
      console.log(`Pushed notification to ${subscriptions.length} clients`);
    } catch (error) {
      console.error('Error in notifyAllAdmins:', error);
    }
  }

  /**
   * Broadcast a push notification to a specific delivery boy.
   * @param {String} deliveryBoyId Delivery Boy ID
   * @param {String} title Notification title
   * @param {String} body Notification body
   */
  static async notifyDeliveryBoy(deliveryBoyId, title, body) {
    try {
      const subscriptions = await PushSubscription.find({ userId: deliveryBoyId, role: 'delivery' });
      const payload = JSON.stringify({
        title,
        body
      });

      const sendPromises = subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: sub.keys,
            },
            payload
          );
        } catch (error) {
          // If subscription is invalid/expired (status 410 or 404), remove it from the DB
          if (error.statusCode === 410 || error.statusCode === 404) {
            await PushSubscription.findByIdAndDelete(sub._id);
            console.log('Removed expired push subscription');
          } else {
            console.error('Error sending push notification to delivery boy:', error);
          }
        }
      });

      await Promise.all(sendPromises);
      console.log(`Pushed notification to ${subscriptions.length} delivery boy clients`);
    } catch (error) {
      console.error('Error in notifyDeliveryBoy:', error);
    }
  }
}

export default PushService;

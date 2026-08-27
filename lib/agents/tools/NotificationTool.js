import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { sendSMS } from '@/lib/sms';
import { sendPushNotification } from '@/lib/fcm';

/**
 * NotificationTool
 * A unified interface for all agents to send communications.
 */
export class NotificationTool {
  
  /**
   * Send a notification through the best available channel (or specified channels).
   * @param {Object} params
   * @param {string} params.userId - System user ID (if applicable)
   * @param {string} params.phone - Recipient phone number
   * @param {string} params.message - Raw text message
   * @param {string} params.templateName - WhatsApp template name (optional)
   * @param {Array} params.templateVars - Variables for the template (optional)
   * @param {Array<string>} params.channels - e.g., ['WHATSAPP', 'SMS', 'PUSH']
   */
  static async notify({ userId, phone, message, templateName, templateVars = [], channels = ['WHATSAPP'] }) {
    const results = {};

    if (channels.includes('WHATSAPP') && phone && templateName) {
      results.whatsapp = await sendWhatsAppMessage(phone, templateName, templateVars);
    }

    if (channels.includes('SMS') && phone && message) {
      results.sms = await sendSMS(phone, message);
    }

    if (channels.includes('PUSH') && userId && message) {
      results.push = await sendPushNotification(userId, "Swastik Notification", message);
    }

    return results;
  }
}

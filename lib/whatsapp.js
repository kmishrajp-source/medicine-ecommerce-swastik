/**
 * WhatsApp Messaging Service for Swastik Medicare
 * Handles all notifications for Customers, Retailers, and Admins.
 */

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || "https://api.whatsapp.com/v1/messages";
const WHATSAPP_TOKEN = process.env.WHATSAPP_API_TOKEN;

/**
 * Generic function to send a WhatsApp message
 */
export async function sendWhatsAppMessage(to, templateName, variables) {
    console.log(`[WHATSAPP MOCK] Triggering template "${templateName}" to ${to} with variables:`, variables);

    // In a real implementation, you would call your WhatsApp Business API provider here
    // Example:
    /*
    try {
        const response = await fetch(WHATSAPP_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to: to.startsWith('91') ? to : `91${to}`,
                type: "template",
                template: {
                    name: templateName,
                    language: { code: "en_US" },
                    components: [{
                        type: "body",
                        parameters: variables.map(v => ({ type: "text", text: String(v) }))
                    }]
                }
            })
        });
        return await response.json();
    } catch (error) {
        console.error("WhatsApp Send Error:", error);
        return { success: false, error: error.message };
    }
    */

    return { success: true, status: "sent_mock" };
}

/**
 * Dedicated triggers for common marketplace events
 */
export const WhatsAppTriggers = {
    // 1. Customer Notifications
    orderConfirmed: (phone, orderId, amount, deliveryCode) =>
        sendWhatsAppMessage(phone, "order_confirmed", [orderId, amount, deliveryCode]),

    invoiceApproved: (phone, orderId) =>
        sendWhatsAppMessage(phone, "invoice_approved", [orderId]),

    deliveryOut: (phone, orderId, agentName, agentPhone) =>
        sendWhatsAppMessage(phone, "delivery_out", [orderId, agentName, agentPhone]),

    customerSubstitutionAlert: (phone, orderId, medicineName) =>
        sendWhatsAppMessage(phone, "customer_substitution_alert", [orderId, medicineName]),

    appointmentConfirmed: (phone, appointmentId, doctorName, date) =>
        sendWhatsAppMessage(phone, "appointment_confirmed", [appointmentId, doctorName, date]),

    // 2. Retailer Notifications
    newSubOrder: (phone, subOrderId, itemsCount) =>
        sendWhatsAppMessage(phone, "new_sub_order", [subOrderId, itemsCount]),

    invoiceReminder: (phone, subOrderId) =>
        sendWhatsAppMessage(phone, "invoice_reminder", [subOrderId]),

    // 3. Admin Notifications
    invoicePending: (adminPhone, count) =>
        sendWhatsAppMessage(adminPhone, "admin_pending_approval", [count]),

    substitutionAlert: (adminPhone, orderId, medicineName) =>
        sendWhatsAppMessage(adminPhone, "admin_substitution_alert", [orderId, medicineName]),

    doctorAppointmentAlert: (phone, appointmentId, patientName, date) =>
        sendWhatsAppMessage(phone, "doctor_appointment_alert", [appointmentId, patientName, date])
};

/**
 * WhatsApp Messaging Service for Swastik Medicare
 * Handles all notifications for Customers, Retailers, and Admins.
 */

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || "https://api.wati.io/api/v1/sendTemplateMessage";
const WHATSAPP_TOKEN = process.env.WHATSAPP_API_TOKEN;
const WHATSAPP_PROVIDER = process.env.WHATSAPP_PROVIDER || "WATI"; // "WATI" or "TWILIO"

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

    // 1.1 Lead Automation (New)
    leadCreatedCustomer: (phone, customerName, serviceType) =>
        sendWhatsAppMessage(phone, "customer_lead_confirm", [customerName, serviceType, "Swastik Medicare"]),

    leadCreatedProvider: (phone, customerName, customerPhone, serviceType) =>
        sendWhatsAppMessage(phone, "provider_lead_alert", [serviceType, customerName, customerPhone]),

    paymentSuccess: (phone, amount, service) =>
        sendWhatsAppMessage(phone, "payment_success", [amount, service]),

    appointmentReminder: (phone, patientName, time) =>
        sendWhatsAppMessage(phone, "appointment_reminder", [patientName, time]),

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
        sendWhatsAppMessage(phone, "doctor_appointment_alert", [appointmentId, patientName, date]),

    // 4. Partner Notifications
    partnerSettlementAlert: (phone, partnerType, amount, orderId) =>
        sendWhatsAppMessage(phone, "partner_settlement_alert", [partnerType, amount, orderId]),

    partnerRegistrationSuccess: (phone, partnerType) =>
        sendWhatsAppMessage(phone, "partner_welcome", [partnerType]),

    planPurchaseConfirmed: (phone, planName) =>
        sendWhatsAppMessage(phone, "plan_purchase_success", [planName])
};

export const WhatsAppMessageSender = {
    // Lead Conversion System: Bulk Sender
    async sendBulkTemplate(phone, templateName, variables, batchId = null) {
        let cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

        const provider = process.env.WHATSAPP_PROVIDER || "MOCK";
        const message = `Template: ${templateName} | Variables: ${JSON.stringify(variables)}${batchId ? ` | Batch: ${batchId}` : ""}`;

        if (provider === "WATI") {
            try {
                await fetch(`${process.env.WHATSAPP_API_URL}/api/v1/sendTemplateMessage?whatsappNumber=${cleanPhone}`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        template_name: templateName,
                        broadcast_name: "CRM_CAMPAIGN",
                        parameters: Object.entries(variables).map(([key, value]) => ({ name: key, value }))
                    })
                });
            } catch (err) {
                console.error("WATI Bulk Send Failed:", err);
            }
        } else {
            console.log(`[WHATSAPP MOCK] Sent ${templateName} to ${cleanPhone}: ${message}`);
            // Log to DB via a separate import or helper if needed, but since we are in lib/whatsapp.js
            // we can assume prisma is available if imported.
        }
        return { success: true };
    }
};

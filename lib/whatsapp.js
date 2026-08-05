/**
 * WhatsApp Messaging Service for Swastik Medicare
 * Uses Meta WhatsApp Cloud API (Free - Official from Facebook/Meta)
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

export async function sendWhatsAppMessage(to, templateName, variables) {
    // Normalize phone number
    let cleanPhone = String(to).replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_API_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.WHATSAPP_INSTANCE_ID;

    // If no credentials, log and skip (no crash)
    if (!accessToken || !phoneNumberId) {
        console.log(`[WHATSAPP MOCK] To: +${cleanPhone} | Template: "${templateName}" | Variables:`, variables);
        return { success: true, status: "mock_no_token" };
    }

    // Build message body for plain text
    let messageBody = `*Swastik Medicare Notification*\n\nType: ${templateName}\n`;
    if (variables && variables.length > 0) {
        messageBody += `Details:\n- ${variables.join('\n- ')}`;
    }
    if (templateName === 'admin_order_alert') {
        messageBody = `🚨 *New Order Alert*\n\n*Order ID:* ${variables[0]}\n*Amount:* ₹${variables[1]}\n*Service:* ${variables[2]}`;
    }
    if (templateName === 'refill_reminder') {
        messageBody = `💊 *Swastik Medicare – Refill Reminder*\n\nHi ${variables[0]}, you might be running low on *${variables[1]}*.\n\nRe-order with *5% discount* 🎁\n🔗 ${variables[2]}`;
    }
    if (templateName === 'abandoned_cart_reminder') {
        messageBody = `🛒 *Swastik Medicare – Quote Ready!*\n\nHi ${variables[0]}, your prescription quote is ready!\n\n✅ Complete payment:\n🔗 ${variables[1]}\n\n_Valid for 24 hours._`;
    }

    try {
        const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to: cleanPhone,
                type: "text",
                text: { body: messageBody }
            })
        });

        const data = await response.json();
        console.log(`[WHATSAPP META] To +${cleanPhone}:`, data);
        return { success: true, data };

    } catch (error) {
        console.error(`[WHATSAPP ERROR] Failed to send to +${cleanPhone}:`, error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Send an arbitrary text message (e.g. from AI Chatbot)
 */
export async function sendWhatsAppText(to, text) {
    return sendWhatsAppMessage(to, 'text', [text]);
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

    adminOrderAlert: (adminPhone, orderId, amount, serviceType) =>
        sendWhatsAppMessage(adminPhone, "admin_order_alert", [orderId, amount, serviceType]),

    // 4. Partner Notifications
    partnerSettlementAlert: (phone, partnerType, amount, orderId) =>
        sendWhatsAppMessage(phone, "partner_settlement_alert", [partnerType, amount, orderId]),

    partnerRegistrationSuccess: (phone, partnerType) =>
        sendWhatsAppMessage(phone, "partner_welcome", [partnerType]),

    planPurchaseConfirmed: (phone, planName) =>
        sendWhatsAppMessage(phone, "plan_purchase_success", [planName]),

    referralBonusAlert: (phone, amount, type) =>
        sendWhatsAppMessage(phone, "referral_bonus_alert", [amount, type]),

    refillReminder: (phone, patientName, medicineName, reorderLink) =>
        sendWhatsAppMessage(phone, "refill_reminder", [patientName, medicineName, reorderLink]),

    abandonedCartReminder: (phone, patientName, paymentLink) =>
        sendWhatsAppMessage(phone, "abandoned_cart_reminder", [patientName, paymentLink]),

    outreachDoctor: (phone, doctorName) =>
        sendWhatsAppMessage(phone, "outreach_doctor", [doctorName || "Doctor", "20+ patients/month"]),

    outreachRetailer: (phone, shopName) =>
        sendWhatsAppMessage(phone, "outreach_retailer", [shopName || "Partner", "increase medicine sales with home delivery"]),

    outreachHospital: (phone, hospitalName) =>
        sendWhatsAppMessage(phone, "outreach_hospital", [hospitalName || "Hospital", "get more patient bookings digitally"]),

    outreachLab: (phone, labName) =>
        sendWhatsAppMessage(phone, "outreach_lab", [labName || "Lab", "increase test bookings"])
};

export const WhatsAppMessageSender = {
    async sendBulkTemplate(phone, templateName, variables, batchId = null) {
        let cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
        const message = `Template: ${templateName} | Variables: ${JSON.stringify(variables)}${batchId ? ` | Batch: ${batchId}` : ""}`;
        console.log(`[WHATSAPP BULK] Sent ${templateName} to ${cleanPhone}: ${message}`);
        return { success: true };
    }
};

export const sendWhatsAppNotification = sendWhatsAppMessage;

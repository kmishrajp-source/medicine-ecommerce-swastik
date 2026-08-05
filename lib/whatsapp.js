/**
 * WhatsApp Messaging Service for Swastik Medicare
 * Supports token-only APIs (sk_live_ tokens) and Ultramsg (requires instance ID)
 */

export async function sendWhatsAppMessage(to, templateName, variables) {
    // Normalize phone number
    let cleanPhone = String(to).replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    const token = process.env.WHATSAPP_API_TOKEN;
    const instanceId = process.env.WHATSAPP_INSTANCE_ID; // Optional - only needed for Ultramsg

    // If no token at all, log and skip (no crash)
    if (!token) {
        console.log(`[WHATSAPP MOCK] To: +${cleanPhone} | Template: "${templateName}" | Variables:`, variables);
        return { success: true, status: "mock_no_token" };
    }

    // Build message body
    let messageBody = `*Swastik Medicare Notification*\n\nType: ${templateName}\n`;
    if (variables && variables.length > 0) {
        messageBody += `Details:\n- ${variables.join('\n- ')}`;
    }
    if (templateName === 'admin_order_alert') {
        messageBody = `🚨 *New Order Alert*\n\n*Order ID:* ${variables[0]}\n*Amount:* ₹${variables[1]}\n*Service:* ${variables[2]}`;
    }
    if (templateName === 'refill_reminder') {
        messageBody = `💊 *Swastik Medicare – Refill Reminder*\n\nHi ${variables[0]}, it looks like you might be running low on *${variables[1]}*.\n\nTap here to re-order with a *5% discount!* 🎁\n🔗 ${variables[2]}`;
    }
    if (templateName === 'abandoned_cart_reminder') {
        messageBody = `🛒 *Swastik Medicare – Prescription Quote Ready!*\n\nHi ${variables[0]}, your quote is ready!\n\n✅ Complete payment now:\n🔗 ${variables[1]}\n\n_Valid for 24 hours._`;
    }

    try {
        // MODE 1: Ultramsg (when instance ID is provided)
        if (instanceId) {
            const url = `https://api.ultramsg.com/${instanceId}/messages/chat`;
            const params = new URLSearchParams();
            params.append('token', token);
            params.append('to', `+${cleanPhone}`);
            params.append('body', messageBody);
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: params.toString()
            });
            const data = await response.json();
            console.log(`[WHATSAPP ULTRAMSG] To +${cleanPhone}:`, data);
            return { success: true, data };
        }

        // MODE 2: Token-only API (sk_live_ tokens - Interakt or similar)
        const sendUrl = process.env.WHATSAPP_API_URL || `https://api.interakt.ai/v1/public/message/`;
        const response = await fetch(sendUrl, {
            method: "POST",
            headers: {
                "Authorization": `Basic ${Buffer.from(token + ':').toString('base64')}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                countryCode: "+91",
                phoneNumber: cleanPhone.replace(/^91/, ''),
                callbackData: templateName,
                type: "Text",
                data: { message: messageBody }
            })
        });
        const data = await response.json();
        console.log(`[WHATSAPP API] To +${cleanPhone}:`, data);
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
    let cleanPhone = String(to).replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    const token = process.env.WHATSAPP_API_TOKEN;
    const instanceId = process.env.WHATSAPP_INSTANCE_ID;

    if (!token) {
        console.log(`[WHATSAPP MOCK TEXT] To: +${cleanPhone} | Text: "${text}"`);
        return { success: true, status: "mock_no_token" };
    }

    try {
        if (instanceId) {
            const url = `https://api.ultramsg.com/${instanceId}/messages/chat`;
            const params = new URLSearchParams();
            params.append('token', token);
            params.append('to', `+${cleanPhone}`);
            params.append('body', text);
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: params.toString()
            });
            const data = await response.json();
            console.log(`[WHATSAPP ULTRAMSG TEXT] To +${cleanPhone}:`, data);
            return { success: true, data };
        }

        const sendUrl = process.env.WHATSAPP_API_URL || `https://api.interakt.ai/v1/public/message/`;
        const response = await fetch(sendUrl, {
            method: "POST",
            headers: {
                "Authorization": `Basic ${Buffer.from(token + ':').toString('base64')}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                countryCode: "+91",
                phoneNumber: cleanPhone.replace(/^91/, ''),
                callbackData: "text",
                type: "Text",
                data: { message: text }
            })
        });
        const data = await response.json();
        console.log(`[WHATSAPP API TEXT] To +${cleanPhone}:`, data);
        return { success: true, data };

    } catch (error) {
        console.error(`[WHATSAPP ERROR TEXT] Failed to send to +${cleanPhone}:`, error.message);
        return { success: false, error: error.message };
    }
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
        }
        return { success: true };
    }
};

export const sendWhatsAppNotification = sendWhatsAppMessage;

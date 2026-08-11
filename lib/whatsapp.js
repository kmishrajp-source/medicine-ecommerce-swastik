/**
 * WhatsApp Messaging Service for Swastik Medicare
 * Uses Ultramsg WhatsApp API (simplest setup with QR code scan)
 */

export async function sendWhatsAppMessage(to, templateName, variables) {
    // Normalize phone number
    let cleanPhone = String(to).replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    const token = process.env.WHATSAPP_API_TOKEN; // Ultramsg Token
    const instanceId = process.env.WHATSAPP_INSTANCE_ID; // Ultramsg Instance ID

    // If no token or instance ID, log and skip (no crash)
    if (!token || !instanceId) {
        console.log(`[WHATSAPP MOCK] To: +${cleanPhone} | Template: "${templateName}" | Variables:`, variables);
        return { success: true, status: "mock_no_token" };
    }

    // Ultramsg doesn't use standard templates in the same way, so we build the message body
    let messageBody = `*Swastik Medicare Notification*\n\nType: ${templateName}\n`;
    if (variables && variables.length > 0) {
        messageBody += `Details:\n- ${variables.join('\n- ')}`;
    }
    
    // Custom formatting for specific alerts
    if (templateName === 'admin_order_alert') {
        messageBody = `🚨 *New Order Alert*\n\n*Order ID:* ${variables[0]}\n*Amount:* ₹${variables[1]}\n*Service:* ${variables[2]}`;
    }
    if (templateName === 'admin_rich_order_alert') {
        messageBody = `🚨 *New COD Order — Action Required*\n\n*Order ID:* #${variables[0]}\n*Customer:* ${variables[1]}\n*Phone:* ${variables[2]}\n*Amount:* ₹${variables[3]}\n*Items:* ${variables[4]}\n*Address:* ${variables[5]}\n\n🧾 *Invoice:* ${variables[6]}\n\nLogin to Admin: https://www.swastikmed.online/en/admin/orders`;
    }
    if (templateName === 'retailer_new_order') {
        messageBody = `📦 *New Order Assigned — Swastik Medicare*\n\n*Order ID:* #${variables[0]}\n*Customer:* ${variables[1]}\n*Delivery Code:* ${variables[2]}\n*Amount:* ₹${variables[3]}\n\n*Medicines Required:*\n${variables[4]}\n\n*Delivery Address:* ${variables[5]}\n\n🧾 *Invoice Link:* ${variables[6]}\n\n✅ Accept/Pack via: https://www.swastikmed.online/en/retailer/orders\n⏰ Please accept within 3 minutes.`;
    }

    // Real Ultramsg sending
    try {
        const url = `https://api.ultramsg.com/${instanceId}/messages/chat`;
        
        const params = new URLSearchParams();
        params.append('token', token);
        params.append('to', `+${cleanPhone}`);
        params.append('body', messageBody);

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params.toString()
        });

        const data = await response.json();
        console.log(`[WHATSAPP ULTRAMSG] To +${cleanPhone}:`, data);
        return { success: true, data };

    } catch (error) {
        console.error(`[WHATSAPP ERROR] Failed to send to +${cleanPhone}:`, error.message);
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

    // Rich admin alert — includes customer, items, address, invoice link
    adminRichOrderAlert: (adminPhone, orderId, customerName, customerPhone, amount, itemsCount, address, invoiceUrl) =>
        sendWhatsAppMessage(adminPhone, "admin_rich_order_alert", [orderId, customerName, customerPhone, amount, itemsCount, address, invoiceUrl]),

    // Rich retailer alert — includes medicine list, delivery code, invoice
    retailerNewOrder: (retailerPhone, orderId, customerName, deliveryCode, amount, medicineList, address, invoiceUrl) =>
        sendWhatsAppMessage(retailerPhone, "retailer_new_order", [orderId, customerName, deliveryCode, amount, medicineList, address, invoiceUrl]),

    // 4. Partner Notifications
    partnerSettlementAlert: (phone, partnerType, amount, orderId) =>
        sendWhatsAppMessage(phone, "partner_settlement_alert", [partnerType, amount, orderId]),

    partnerRegistrationSuccess: (phone, partnerType) =>
        sendWhatsAppMessage(phone, "partner_welcome", [partnerType]),

    planPurchaseConfirmed: (phone, planName) =>
        sendWhatsAppMessage(phone, "plan_purchase_success", [planName]),

    // 5. Category-Specific Outreach (New)
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

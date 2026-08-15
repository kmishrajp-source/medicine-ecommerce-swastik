/**
 * WhatsApp Messaging Service for Swastik Medicare
 * Integrated with MSG91 WhatsApp API
 */

export async function sendWhatsAppMessage(to, templateName, variables) {
    // Normalize phone number
    let cleanPhone = String(to).replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
    const MSG91_WHATSAPP_NUMBER = process.env.MSG91_WHATSAPP_NUMBER || process.env.ADMIN_PHONE || "917992122974";

    // If no token, log and skip (no crash)
    if (!MSG91_AUTH_KEY) {
        console.log(`[WHATSAPP MOCK] To: +${cleanPhone} | Template: "${templateName}" | Variables:`, variables);
        return { success: true, status: "mock_no_token" };
    }

    // Real MSG91 WhatsApp sending
    try {
        const url = "https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/";
        
        const payload = {
            "integrated-number": MSG91_WHATSAPP_NUMBER,
            "content_type": "template",
            "payload": {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": cleanPhone,
                "type": "template",
                "template": {
                    "name": templateName,
                    "language": {
                        "code": "en"
                    },
                    "components": variables && variables.length > 0 ? [
                        {
                            "type": "body",
                            "parameters": variables.map(v => ({
                                "type": "text",
                                "text": String(v)
                            }))
                        }
                    ] : []
                }
            }
        };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "authkey": MSG91_AUTH_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (data.hasError) {
             console.error(`[WHATSAPP MSG91 ERROR] Failed to send to +${cleanPhone}:`, data);
             return { success: false, error: data.message || "MSG91 Error" };
        }

        console.log(`[WHATSAPP MSG91] To +${cleanPhone}: Sent template ${templateName}`);
        return { success: true, data };

    } catch (error) {
        console.error(`[WHATSAPP EXCEPTION] Failed to send to +${cleanPhone}:`, error.message);
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

    // Rich admin alert
    adminRichOrderAlert: (adminPhone, orderId, customerName, customerPhone, amount, itemsCount, address, invoiceUrl) =>
        sendWhatsAppMessage(adminPhone, "admin_rich_order_alert", [orderId, customerName, customerPhone, amount, itemsCount, address, invoiceUrl]),

    // Rich retailer alert
    retailerNewOrder: (retailerPhone, orderId, customerName, deliveryCode, amount, medicineList, address, invoiceUrl) =>
        sendWhatsAppMessage(retailerPhone, "retailer_new_order", [orderId, customerName, deliveryCode, amount, medicineList, address, invoiceUrl]),

    // 4. Partner Notifications
    partnerSettlementAlert: (phone, partnerType, amount, orderId) =>
        sendWhatsAppMessage(phone, "partner_settlement_alert", [partnerType, amount, orderId]),

    settlementBatchCreated: (phone, shopName, batchRef, amount, orderCount) =>
        sendWhatsAppMessage(phone, "settlement_batch_created", [shopName, batchRef, amount, orderCount]),

    settlementPaid: (phone, shopName, batchRef, amount) =>
        sendWhatsAppMessage(phone, "settlement_paid", [shopName, batchRef, amount]),

    codRiskAlert: (phone, shopName, unremittedAmount) =>
        sendWhatsAppMessage(phone, "cod_risk_alert", [shopName, unremittedAmount]),

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
        // Re-use the main function to ensure identical MSG91 logic
        return await sendWhatsAppMessage(phone, templateName, Object.values(variables));
    }
};

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
        sendWhatsAppMessage(phone, "outreach_lab", [labName || "Lab", "increase test bookings"]),

    // 6. Rider Triggers
    riderJobOffer: (phone, jobId, pickupAddress, dropAddress, distance) =>
        sendWhatsAppMessage(phone, "rider_job_offer", [jobId, pickupAddress, dropAddress, distance]),

    riderVerified: (phone, riderName) =>
        sendWhatsAppMessage(phone, "rider_verified", [riderName]),

    riderApplicationReceived: (phone, name) =>
        sendWhatsAppMessage(phone, "rider_application_received", [name]),

    riderReferralQualified: (phone, rewardAmount) =>
        sendWhatsAppMessage(phone, "rider_referral_qualified", [rewardAmount.toString()])
};

export const WhatsAppMessageSender = {
    // Lead Conversion System: Bulk Sender
    async sendBulkTemplate(phone, templateName, variables, batchId = null) {
        // Re-use the main function to ensure identical MSG91 logic
        return await sendWhatsAppMessage(phone, templateName, Object.values(variables));
    },

    walletUpdated: async (phone, action, amount, newBalance) => {
        const actionStr = action === "CREDIT" ? "Credited with" : "Debited for";
        const message = `💰 *Wallet Update*\n\nYour Swastik Medicare wallet has been ${actionStr} ₹${amount}.\nNew Balance: ₹${newBalance}\n\n_Swastik Medicare_`;
        return await sendWhatsAppMessage(phone, "wallet_updated", [actionStr, amount.toString(), newBalance.toString()]);
    },
    
    // --- RIDER INTELLIGENCE TRIGGERS --- //
    riderJobOffer: async (phone, jobId, pickupAddress, dropAddress, distance) => {
        const message = `🚴 *New Delivery Job Offer*\n\nOrder #${jobId}\n📦 Pickup: ${pickupAddress}\n📍 Drop: ${dropAddress}\n📏 Distance: ${distance}km\n\nAccept within 5 minutes on your Rider Dashboard!`;
        return await sendWhatsAppMessage(phone, "rider_job_offer", [jobId, pickupAddress, dropAddress, distance]);
    },

    riderVerified: async (phone, riderName) => {
        const message = `🎉 *Account Verified*\n\nHello ${riderName},\nYour Swastik Medicare Delivery Partner account is now VERIFIED!\n\nLog in to your dashboard to go online and start accepting deliveries.`;
        return await sendWhatsAppMessage(phone, "rider_verified", [riderName]);
    },

    riderApplicationReceived: async (phone, name) => {
        const message = `👋 *Application Received*\n\nHi ${name}, thank you for applying to be a Swastik Medicare Delivery Partner.\n\nOur team will review your application and contact you within 24-48 hours.`;
        return await sendWhatsAppMessage(phone, "rider_application_received", [name]);
    },

    riderReferralQualified: async (phone, rewardAmount) => {
        const message = `🎁 *Referral Reward Earned!*\n\nCongratulations! Your referred delivery partner has completed their qualifying deliveries.\n\nYou've earned a reward of ₹${rewardAmount}! It will be credited to your bank account soon.`;
        return await sendWhatsAppMessage(phone, "rider_referral_qualified", [rewardAmount.toString()]);
    }
};

/**
 * Send a free-text WhatsApp message (non-template).
 * Falls back to using MSG91 text session message endpoint.
 * Required by webhook and other modules that need plain-text replies.
 */
export async function sendWhatsAppText(to, text) {
    let cleanPhone = String(to).replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
    const MSG91_WHATSAPP_NUMBER = process.env.MSG91_WHATSAPP_NUMBER || "917992122974";

    if (!MSG91_AUTH_KEY) {
        console.log(`[WHATSAPP TEXT MOCK] To: +${cleanPhone} | Text: ${text}`);
        return { success: true, status: "mock_no_token" };
    }

    try {
        const url = "https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/";
        const payload = {
            "integrated-number": MSG91_WHATSAPP_NUMBER,
            "content_type": "text",
            "payload": {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": cleanPhone,
                "type": "text",
                "text": { "body": text }
            }
        };
        const response = await fetch(url, {
            method: "POST",
            headers: { "authkey": MSG91_AUTH_KEY, "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        return { success: !data.hasError, data };
    } catch (error) {
        console.error(`[WHATSAPP TEXT ERROR] +${cleanPhone}:`, error.message);
        return { success: false, error: error.message };
    }
}

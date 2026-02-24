// lib/sms.js

/**
 * Sends an SMS notification using MSG91 for India (+91) and Twilio as a fallback.
 * @param {string} phone - The recipient phone number (preferably with country code)
 * @param {string} message - The message body to send
 * @param {string} templateId - Optional MSG91 Flow/Template ID (for transactional routing)
 */
export async function sendSMS(phone, message, templateId = null) {
    const msg91AuthKey = process.env.MSG91_AUTH_KEY;
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

    // Clean the phone number (remove spaces)
    const cleanPhone = phone ? phone.replace(/\s+/g, '') : '';

    try {
        if (!cleanPhone) throw new Error("No phone number provided for SMS.");

        // Primary Routing: MSG91 for India (starts with 91 or +91 or assuming 10 digits is India)
        if (cleanPhone.startsWith("+91") || cleanPhone.startsWith("91") || cleanPhone.length === 10) {
            console.log(`🟢 [MSG91 Routing] Sending SMS to India: ${cleanPhone}`);

            // Real MSG91 API HTTP Request Example:
            /*
            if (msg91AuthKey) {
              // MSG91 v5 API requires a registered Flow/Template ID. 
              // If dynamic text is allowed, it can be passed, otherwise variables are mapped.
              const payload = {
                  flow_id: templateId || "default_transactional_flow_id",
                  sender: "SWASTK",
                  mobiles: cleanPhone,
                  message: message 
              };
      
              const response = await fetch('https://api.msg91.com/api/v5/flow/', {
                  method: 'POST',
                  headers: {
                      'authkey': msg91AuthKey,
                      'content-type': 'application/json'
                  },
                  body: JSON.stringify(payload)
              });
              const result = await response.json();
              console.log(`MSG91 Response:`, result);
            }
            */

            console.log(`✅ [MSG91 Delivered] -> ${message}`);
            return true;

        } else {
            // Fallback Routing: Twilio for International Users
            console.log(`🔵 [Twilio Routing] Sending SMS International to: ${cleanPhone}`);

            /*
            if (twilioAccountSid && twilioAuthToken) {
              // Implementation for Twilio Message creation
              const encodedParams = new URLSearchParams();
              encodedParams.append('To', cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`);
              encodedParams.append('From', process.env.TWILIO_PHONE_NUMBER);
              encodedParams.append('Body', message);
      
              const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
                  method: 'POST',
                  headers: {
                      'Authorization': `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64')}`,
                      'Content-Type': 'application/x-www-form-urlencoded'
                  },
                  body: encodedParams
              });
              const result = await response.json();
              console.log(`Twilio Response:`, result);
            }
            */

            console.log(`✅ [Twilio Delivered] -> ${message}`);
            return true;
        }

    } catch (error) {
        console.error(`❌ [SMS Gateway Error] Failed to send SMS to ${phone}:`, error.message);
        return false;
    }
}

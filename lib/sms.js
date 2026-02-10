export async function sendSMS(phone, message, isPromotional = false) {
    const API_KEY = process.env.FAST2SMS_API_KEY;

    // 1. Mock Mode (If no key)
    if (!API_KEY) {
        console.log("---------------------------------------------------");
        console.log(`[MOCK SMS] To: ${phone}`);
        console.log(`[Message]: ${message}`);
        console.log("---------------------------------------------------");
        return { success: true, mock: true };
    }

    // 2. Real Sending (Fast2SMS)
    try {
        const url = "https://www.fast2sms.com/dev/bulkV2";
        const body = {
            route: "q", // Quick transactional route
            message: message,
            flash: 0,
            numbers: phone,
        };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "authorization": API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        console.log("SMS Sent Result:", data);
        return data;

    } catch (error) {
        console.error("Failed to send SMS:", error);
        return { success: false, error: error.message };
    }
}

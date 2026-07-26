// test-mass-broadcast.js
import { sendSMS } from './lib/sms.js';
import { sendWhatsAppText } from './lib/whatsapp.js';
import dotenv from 'dotenv';
dotenv.config(); // Loads .env

const TEST_PHONE = "919876543210"; // I will use a dummy number unless they want their own
const MESSAGE = "Hello from Swastik Medicare SMS Test!";

async function runTest() {
    console.log("=== STARTING MASS BROADCAST TEST ===");
    console.log("Delivery Method: SMS");
    console.log("Target Number:", TEST_PHONE);
    console.log("Message:", MESSAGE);
    console.log("Checking MSG91_AUTH_KEY in environment...", process.env.MSG91_AUTH_KEY ? "FOUND" : "NOT FOUND");

    try {
        const result = await sendSMS(TEST_PHONE, MESSAGE);
        console.log("SMS Result:", result);
    } catch (error) {
        console.error("SMS Error:", error);
    }

    console.log("=== TEST COMPLETE ===");
}

runTest();

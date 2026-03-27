import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase only if we are in the browser and config is valid
let app = null;
if (typeof window !== "undefined" && firebaseConfig.projectId) {
    try {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    } catch (error) {
        console.error("Firebase initialization failed:", error);
    }
}

let messaging = null;

// Ensure this only runs on the client side where `window` and `navigator` exist
if (typeof window !== "undefined" && app) {
    // Check if the browser supports Firebase Cloud Messaging
    isSupported(app).then((supported) => {
        if (supported) {
            messaging = getMessaging(app);
            console.log("Firebase Messaging Initialized");
        }
    }).catch(err => console.log("Firebase Messaging Support Check Failed", err));
}

export { app, messaging, getToken, onMessage };

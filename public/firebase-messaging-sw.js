importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

const firebaseConfig = {
    // These values will be injected dynamically if we were using a build step for the SW
    // But for a static SW, we must hardcode the public keys or fetch them
    apiKey: "CHECK_ENV_NEXT_PUBLIC_FIREBASE_API_KEY",
    authDomain: "CHECK_ENV_NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    projectId: "CHECK_ENV_NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    storageBucket: "CHECK_ENV_NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    messagingSenderId: "CHECK_ENV_NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    appId: "CHECK_ENV_NEXT_PUBLIC_FIREBASE_APP_ID"
};

try {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
        console.log('[firebase-messaging-sw.js] Received background message ', payload);

        const notificationTitle = payload.notification.title;
        const notificationOptions = {
            body: payload.notification.body,
            icon: '/icon-192x192.png', // Ensure icon exists in public dir
            badge: '/icon-192x192.png',
            data: payload.data
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
    });

} catch (e) {
    console.error("Firebase Worker Init Failed", e);
}

// Handle notification clicks
self.addEventListener('notificationclick', function (event) {
    console.log('[firebase-messaging-sw.js] Notification click received.');
    event.notification.close();

    // This allows backend click_action URLs to directly open the relevant page (like the Delivery Dashboard)
    const urlToOpen = event.notification.data.click_action || '/';

    event.waitUntil(
        clients.openWindow(urlToOpen)
    );
});

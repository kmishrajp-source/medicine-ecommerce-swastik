"use client";
import { useEffect, useState } from 'react';
import { messaging, getToken, onMessage } from '@/lib/firebase';

export default function useFCMToken() {
    const [token, setToken] = useState(null);

    useEffect(() => {
        const setupFCM = async () => {
            try {
                if (!messaging) return; // If not supported (e.g. Safari Private Mode)

                // Request Notification Permission
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    console.log('Notification permission denied.');
                    return;
                }

                // Get the unique Push Token for this device
                const currentToken = await getToken(messaging, {
                    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
                });

                if (currentToken) {
                    setToken(currentToken);
                    // Register the token with the backend securely
                    await fetch('/api/fcm/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token: currentToken })
                    });
                } else {
                    console.log('No FCM registration token available. Request permission to generate one.');
                }
            } catch (error) {
                console.error('An error occurred while retrieving token. ', error);
            }
        };

        setupFCM();

        // Listen for foreground messages (when the user has the site open)
        if (messaging) {
            const unsubscribe = onMessage(messaging, (payload) => {
                console.log('[Foreground Message]', payload);
                // Optional: You can trigger a custom React Toast UI here instead of an OS native alert
                // when the app is already open
                if (payload.notification) {
                    // Native fallback for demonstration
                    new Notification(payload.notification.title, {
                        body: payload.notification.body,
                        icon: '/icon-192x192.png'
                    });
                }
            });

            return () => {
                unsubscribe();
            };
        }

    }, []);

    return token;
}

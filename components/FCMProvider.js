"use client";
import useFCMToken from "@/hooks/useFCMToken";

export default function FCMProvider({ children }) {
    // This hook automatically requests permission and manages the token
    // It runs entirely in the background as soon as the app mounts on the client
    useFCMToken();

    return <>{children}</>;
}

"use client";
import React, { useEffect, useRef } from 'react';

export default function VideoRoom({ roomId, userName, onEnd }) {
    const jitsiContainer = useRef(null);

    useEffect(() => {
        // Load Jitsi script
        const script = document.createElement("script");
        script.src = "https://meet.jit.si/external_api.js";
        script.async = true;
        script.onload = () => {
            if (!window.JitsiMeetExternalAPI) return;

            const domain = "meet.jit.si";
            const options = {
                roomName: `SwastikMedicare-${roomId}`,
                width: "100%",
                height: "600px",
                parentNode: jitsiContainer.current,
                userInfo: {
                    displayName: userName
                },
                configOverwrite: {
                    startWithAudioMuted: true,
                    disableDeepLinking: true,
                    prejoinPageEnabled: false
                },
                interfaceConfigOverwrite: {
                    TOOLBAR_BUTTONS: [
                        'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                        'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                        'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                        'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                        'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone'
                    ],
                },
            };

            const api = new window.JitsiMeetExternalAPI(domain, options);

            api.addEventListeners({
                videoConferenceLeft: () => onEnd(),
            });
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [roomId, userName, onEnd]);

    return (
        <div ref={jitsiContainer} style={{ width: '100%', height: '100%', minHeight: '600px', background: 'black', borderRadius: '16px', overflow: 'hidden' }} />
    );
}

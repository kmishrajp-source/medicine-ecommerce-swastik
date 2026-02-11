"use client";
import React, { useState, use } from 'react';
import Navbar from "@/components/Navbar";
import VideoRoom from "@/components/VideoRoom";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function MeetingPage(props) {
    const params = use(props.params);
    const { id } = params;
    const { data: session } = useSession();
    const router = useRouter();
    const [callEnded, setCallEnded] = useState(false);

    if (!session) return <div style={{ padding: '50px', textAlign: 'center' }}>Please log in.</div>;

    const handleEnd = () => {
        setCallEnded(true);
        // Optionally update appointment status to "Completed" via API
        alert("Call Ended. Thank you for using Swastik Medicare.");
        router.back();
    };

    return (
        <>
            <Navbar />
            <div className="container" style={{ marginTop: '100px', height: 'calc(100vh - 100px)' }}>
                {callEnded ? (
                    <div style={{ textAlign: 'center', paddingTop: '100px' }}>
                        <h2>Consultation Ended</h2>
                        <button onClick={() => router.back()} className="btn btn-primary">Go Back</button>
                    </div>
                ) : (
                    <>
                        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0 }}>🎥 Video Consultation</h2>
                            <button onClick={handleEnd} style={{ background: '#EF4444', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none' }}>Enc Call</button>
                        </div>
                        <VideoRoom roomId={id} userName={session.user.name || "User"} onEnd={handleEnd} />
                    </>
                )}
            </div>
        </>
    );
}

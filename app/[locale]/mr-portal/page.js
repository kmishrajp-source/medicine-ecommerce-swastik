"use client";
import React from 'react';
import Navbar from "@/components/Navbar";
import MotivationalVideo from "@/components/MotivationalVideo";

export default function MrDashboard() {
    return (
        <>
            <Navbar />
            <div className="container" style={{ marginTop: '120px' }}>
                <MotivationalVideo 
                    title="Empower Your Medical Outreach"
                    description="Connect with top doctors, manage your visits efficiently, and drive healthcare excellence with Swastik Medicare's advanced MR tools."
                    videoUrl="https://www.youtube.com/embed/8-szBRlQWqE"
                    ctaText="View Doctor Directory"
                    ctaLink="/doctors"
                />

                <h1 style={{ color: '#0EA5E9', marginTop: '40px' }}>👨‍💼 Medical Rep Portal</h1>
                <p>Region: North Delhi</p>

                <div style={{ marginTop: '30px' }}>
                    <h3>Today's Visits</h3>
                    <div style={{ padding: '20px', background: 'white', border: '1px solid #eee', borderRadius: '8px', margin: '10px 0' }}>
                        <h4>Dr. Sharma (Cardiologist)</h4>
                        <p>Time: 11:00 AM</p>
                        <button className="btn-small">Mark Visited</button>
                    </div>
                </div>
            </div>
        </>
    );
}

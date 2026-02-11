"use client";
import React from 'react';
import Navbar from "@/components/Navbar";

export default function MrDashboard() {
    return (
        <>
            <Navbar />
            <div className="container" style={{ marginTop: '120px' }}>
                <h1 style={{ color: '#0EA5E9' }}>👨‍💼 Medical Rep Portal</h1>
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

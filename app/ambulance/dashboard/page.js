"use client";
import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";

export default function AmbulanceDashboard() {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        // Fetch driver's bookings
        // Implement API endpoint /api/ambulance/my-bookings
    }, []);

    return (
        <>
            <Navbar />
            <div className="container" style={{ marginTop: '120px' }}>
                <h1 style={{ color: '#DC2626' }}>🚑 Driver Dashboard</h1>
                <div className="status-toggle" style={{ margin: '20px 0', padding: '20px', background: 'white', borderRadius: '12px' }}>
                    <h3>Status: <span style={{ color: 'green' }}>Online</span></h3>
                    <button className="btn">Go Offline</button>
                </div>

                <h3>Recent Trip Requests</h3>
                <div className="trips-list">
                    <p>No new requests.</p>
                </div>
            </div>
        </>
    );
}

"use client";
import React from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Advertise() {
    return (
        <>
            <Navbar />
            <div className="container" style={{ marginTop: '120px', paddingBottom: '60px' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h1 style={{ fontSize: '3rem', color: 'var(--primary)' }}>Grow with Swastik Medicare</h1>
                    <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '600px', margin: '10px auto' }}>
                        Reach thousands of doctors, pharmacists, and patients daily.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                    {/* Plan 1 */}
                    <div style={{ background: 'white', padding: '40px', borderRadius: '16px', borderTop: '5px solid #3B82F6', boxShadow: 'var(--shadow-sm)' }}>
                        <h3>Home Banner</h3>
                        <p style={{ color: '#666', marginTop: '10px' }}>Premium visibility on our homepage.</p>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '20px 0' }}>₹5,000 <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>/day</span></div>
                        <ul style={{ paddingLeft: '20px', marginBottom: '30px', color: '#444' }}>
                            <li>Top of the page placement</li>
                            <li>High click-through rate</li>
                            <li>Visible to all users</li>
                        </ul>
                        <button className="btn btn-primary" style={{ width: '100%' }}>Book Now</button>
                    </div>

                    {/* Plan 2 */}
                    <div style={{ background: 'white', padding: '40px', borderRadius: '16px', borderTop: '5px solid #10B981', boxShadow: 'var(--shadow-sm)' }}>
                        <h3>Featured Product</h3>
                        <p style={{ color: '#666', marginTop: '10px' }}>Boost your product in search results.</p>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '20px 0' }}>₹2,000 <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>/week</span></div>
                        <ul style={{ paddingLeft: '20px', marginBottom: '30px', color: '#444' }}>
                            <li>Appears in "Featured" section</li>
                            <li>highlighted in search</li>
                            <li>Targeted category placement</li>
                        </ul>
                        <button className="btn btn-primary" style={{ width: '100%' }}>Book Now</button>
                    </div>

                    {/* Plan 3 */}
                    <div style={{ background: 'white', padding: '40px', borderRadius: '16px', borderTop: '5px solid #8B5CF6', boxShadow: 'var(--shadow-sm)' }}>
                        <h3>Doctor Outreach</h3>
                        <p style={{ color: '#666', marginTop: '10px' }}>Direct promotion to registered doctors.</p>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '20px 0' }}>₹10,000 <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>/campaign</span></div>
                        <button className="btn btn-primary" style={{ width: '100%' }}>Contact Sales</button>
                    </div>
                </div>

                <div style={{ marginTop: '60px', textAlign: 'center' }}>
                    <h3>Are you a Pharma Company?</h3>
                    <p style={{ marginBottom: '20px' }}>Register for a dedicated business account to manage your campaigns.</p>
                    <a href="/partner" className="btn glass">Partner Login</a>
                </div>
            </div>
            <Footer />
        </>
    );
}

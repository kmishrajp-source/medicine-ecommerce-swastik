"use client";
import React, { useState } from 'react';
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";

export default function SupportHub() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState("complaint");
    const [loading, setLoading] = useState(false);

    // Form States
    const [complaint, setComplaint] = useState({ subject: "", description: "", orderId: "", priority: "Medium" });
    const [suggestion, setSuggestion] = useState({ title: "", description: "", category: "General", guestName: "", guestEmail: "" });
    const [experience, setExperience] = useState({ rating: 5, feedback: "", orderId: "", category: "General" });

    const handleComplaintSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/support/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'complaint', ...complaint })
            });
            const data = await res.json();
            if (data.success) {
                alert("Complaint logged successfully. Our team will review it shortly.");
                setComplaint({ subject: "", description: "", orderId: "", priority: "Medium" });
            } else alert(data.error);
        } finally { setLoading(false); }
    };

    const handleSuggestionSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/support/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'suggestion', ...suggestion })
            });
            const data = await res.json();
            if (data.success) {
                alert("Thank you for your suggestion! We review all ideas to improve Swastik Medicare.");
                setSuggestion({ title: "", description: "", category: "General", guestName: "", guestEmail: "" });
            } else alert(data.error);
        } finally { setLoading(false); }
    };

    const handleExperienceSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/support/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'experience', ...experience })
            });
            const data = await res.json();
            if (data.success) {
                alert("Thank you for your feedback! Your rating has been recorded.");
                setExperience({ rating: 5, feedback: "", orderId: "", category: "General" });
            } else alert(data.error);
        } finally { setLoading(false); }
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '60px' }}>
            <Navbar />
            <div className="container" style={{ marginTop: '100px', maxWidth: '800px' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ color: '#0f172a', fontWeight: 'bold' }}>Swastik Medicare Support Hub</h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem' }}>We're here to help. Select a topic below to get started.</p>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', background: 'white', padding: '10px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <button
                        onClick={() => setActiveTab('complaint')}
                        style={{ flex: 1, padding: '15px', border: 'none', background: activeTab === 'complaint' ? '#eff6ff' : 'transparent', color: activeTab === 'complaint' ? '#2563eb' : '#64748b', fontWeight: activeTab === 'complaint' ? 'bold' : 'normal', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '8px' }}></i> File Complaint
                    </button>
                    <button
                        onClick={() => setActiveTab('suggestion')}
                        style={{ flex: 1, padding: '15px', border: 'none', background: activeTab === 'suggestion' ? '#f0fdf4' : 'transparent', color: activeTab === 'suggestion' ? '#16a34a' : '#64748b', fontWeight: activeTab === 'suggestion' ? 'bold' : 'normal', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <i className="fa-solid fa-lightbulb" style={{ marginRight: '8px' }}></i> Suggestions
                    </button>
                    <button
                        onClick={() => setActiveTab('experience')}
                        style={{ flex: 1, padding: '15px', border: 'none', background: activeTab === 'experience' ? '#fefce8' : 'transparent', color: activeTab === 'experience' ? '#ca8a04' : '#64748b', fontWeight: activeTab === 'experience' ? 'bold' : 'normal', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <i className="fa-solid fa-star" style={{ marginRight: '8px' }}></i> Rate Experience
                    </button>
                </div>

                <div style={{ background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>

                    {/* --- COMPLAINT TAB --- */}
                    {activeTab === 'complaint' && (
                        <form onSubmit={handleComplaintSubmit} style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                            <h2 style={{ color: '#1e293b', marginBottom: '20px' }}>Report an Issue</h2>
                            {!session?.user && (
                                <div style={{ background: '#fee2e2', color: '#991b1b', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                                    <i className="fa-solid fa-lock" style={{ marginRight: '8px' }}></i> You must be logged in to track a formal complaint.
                                </div>
                            )}
                            <div style={{ display: 'grid', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>Issue Subject</label>
                                    <select required value={complaint.subject} onChange={e => setComplaint({ ...complaint, subject: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                        <option value="">Select an issue...</option>
                                        <option value="Delivery Delay">Delivery is delayed</option>
                                        <option value="Wrong Medicine">Received wrong medicine</option>
                                        <option value="App Bug">App is not working correctly</option>
                                        <option value="Rude Behavior">Rude behavior from delivery agent</option>
                                        <option value="Billing Issue">Overcharged / Billing Error</option>
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>Order ID (Optional)</label>
                                        <input type="text" placeholder="e.g. SM-12345" value={complaint.orderId} onChange={e => setComplaint({ ...complaint, orderId: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>Priority Level</label>
                                        <select value={complaint.priority} onChange={e => setComplaint({ ...complaint, priority: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                            <option value="Low">Low (General Inquiry)</option>
                                            <option value="Medium">Medium (Incorrect order)</option>
                                            <option value="High">High (Medical emergency/Missing items)</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>Detailed Description</label>
                                    <textarea required rows="5" placeholder="Please describe exactly what happened..." value={complaint.description} onChange={e => setComplaint({ ...complaint, description: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}></textarea>
                                </div>
                                <button type="submit" disabled={loading || !session?.user} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem', cursor: loading || !session?.user ? 'not-allowed' : 'pointer', opacity: loading || !session?.user ? 0.7 : 1, transition: 'background 0.2s' }}>
                                    {loading ? 'Submitting...' : 'Submit Official Complaint'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* --- SUGGESTION TAB --- */}
                    {activeTab === 'suggestion' && (
                        <form onSubmit={handleSuggestionSubmit} style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                            <h2 style={{ color: '#1e293b', marginBottom: '20px' }}>Share an Idea</h2>
                            <p style={{ color: '#64748b', marginBottom: '20px' }}>Have an idea to make Swastik Medicare better? We want to hear it!</p>
                            <div style={{ display: 'grid', gap: '20px' }}>
                                {!session?.user && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>Your Name</label>
                                            <input type="text" required placeholder="John Doe" value={suggestion.guestName} onChange={e => setSuggestion({ ...suggestion, guestName: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>Email Address</label>
                                            <input type="email" required placeholder="john@example.com" value={suggestion.guestEmail} onChange={e => setSuggestion({ ...suggestion, guestEmail: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>Idea Category</label>
                                    <select value={suggestion.category} onChange={e => setSuggestion({ ...suggestion, category: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                        <option value="App Feature">New App Feature</option>
                                        <option value="Inventory">Medicine Availability</option>
                                        <option value="Delivery">Delivery Speed</option>
                                        <option value="General">Other / General</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>Idea Summary</label>
                                    <input type="text" required placeholder="e.g. Add dark mode, stock specifically Brand X..." value={suggestion.title} onChange={e => setSuggestion({ ...suggestion, title: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>How would this help you?</label>
                                    <textarea required rows="4" placeholder="Explain how this suggestion would improve your experience..." value={suggestion.description} onChange={e => setSuggestion({ ...suggestion, description: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}></textarea>
                                </div>
                                <button type="submit" disabled={loading} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                                    {loading ? 'Submitting...' : 'Submit Suggestion'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* --- EXPERIENCE TAB --- */}
                    {activeTab === 'experience' && (
                        <form onSubmit={handleExperienceSubmit} style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                            <h2 style={{ color: '#1e293b', marginBottom: '20px' }}>Rate Your Experience</h2>
                            <p style={{ color: '#64748b', marginBottom: '30px' }}>Help us maintain a 5-star standard across our network.</p>
                            <div style={{ display: 'grid', gap: '25px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <label style={{ display: 'block', fontWeight: 'bold', color: '#475569', marginBottom: '15px' }}>How was your overall experience?</label>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <i
                                                key={star}
                                                className={`fa-star ${star <= experience.rating ? 'fa-solid' : 'fa-regular'}`}
                                                onClick={() => setExperience({ ...experience, rating: star })}
                                                style={{ fontSize: '2.5rem', color: star <= experience.rating ? '#eab308' : '#cbd5e1', cursor: 'pointer', transition: 'color 0.2s' }}
                                            ></i>
                                        ))}
                                    </div>
                                    <p style={{ color: '#94a3b8', marginTop: '10px' }}>Tap a star to rate</p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>Category</label>
                                        <select value={experience.category} onChange={e => setExperience({ ...experience, category: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                            <option value="Delivery Speed">Delivery Speed</option>
                                            <option value="Product Quality">Product Quality</option>
                                            <option value="App UX">App Experience</option>
                                            <option value="Customer Service">Customer Service</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>Order ID (Optional)</label>
                                        <input type="text" placeholder="e.g. SM-12345" value={experience.orderId} onChange={e => setExperience({ ...experience, orderId: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>Additional Feedback</label>
                                    <textarea rows="4" placeholder="Tell us what you loved, or what we can improve..." value={experience.feedback} onChange={e => setExperience({ ...experience, feedback: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}></textarea>
                                </div>
                                <button type="submit" disabled={loading} style={{ background: '#ca8a04', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                                    {loading ? 'Submitting...' : 'Submit Rating'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

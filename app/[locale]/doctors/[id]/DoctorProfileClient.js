"use client";
import { useState } from "react";

export default function DoctorProfileClient({ doctor }) {
    const [showWAForm, setShowWAForm] = useState(false);
    const [formData, setFormData] = useState({ name: "", phone: "", problem: "", location: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleWASubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await fetch('/api/marketing/lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, serviceType: 'doctor', targetProvider: doctor.name })
            });
        } catch (e) { /* non-critical */ }
        const msg = `Hello, I found ${doctor.name} on Swastik Medicare.%0A%0AMy Name: ${formData.name}%0ALocation: ${formData.location}%0AProblem: ${formData.problem}`;
        const phone = (doctor.phone || '9161364908').replace(/[^0-9]/g, '');
        window.open(`https://wa.me/91${phone}?text=${msg}`, "_blank");
        setShowWAForm(false);
        setIsSubmitting(false);
    };

    const stars = Math.round(doctor.rating || 4.8);

    return (
        <main style={{ minHeight: '100vh', background: '#f8fafc', paddingTop: '90px', paddingBottom: '60px', fontFamily: 'var(--font-inter, system-ui, sans-serif)' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>

                {/* ── Back Button ── */}
                <button
                    onClick={() => window.history.back()}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        background: 'white', border: '1px solid #e2e8f0',
                        borderRadius: '50px', padding: '10px 20px', cursor: 'pointer',
                        color: '#64748b', fontWeight: 700, fontSize: '0.85rem',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '28px',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
                >
                    ← Back to Directory
                </button>

                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    {/* ── Left: Main Card ── */}
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <div style={{ background: 'white', borderRadius: '24px', padding: '36px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9', position: 'relative' }}>

                            {/* Verified badge */}
                            {doctor.verified && (
                                <div style={{ position: 'absolute', top: '20px', right: '20px', background: '#ecfdf5', color: '#059669', borderRadius: '50px', padding: '6px 14px', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em' }}>
                                    ✓ Verified
                                </div>
                            )}

                            {/* Avatar + Name */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '28px', flexWrap: 'wrap' }}>
                                <img
                                    src={doctor.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name || 'D')}&background=6366f1&color=fff&size=120`}
                                    alt={doctor.name}
                                    style={{ width: '100px', height: '100px', borderRadius: '20px', objectFit: 'cover', border: '3px solid #e0e7ff', flexShrink: 0 }}
                                />
                                <div>
                                    <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>{doctor.name}</h1>
                                    <p style={{ color: '#6366f1', fontWeight: 700, fontSize: '1rem', margin: '6px 0 10px' }}>{doctor.specialization}</p>
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        {doctor.experience && (
                                            <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '50px', padding: '4px 14px', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                                                {doctor.experience}+ Yrs Experience
                                            </span>
                                        )}
                                        <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '50px', padding: '4px 14px', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                                            📍 {doctor.city || 'Gorakhpur'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '24px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', marginBottom: '28px' }}>
                                <div>
                                    <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Hospital / Clinic</p>
                                    <p style={{ fontWeight: 700, color: '#0f172a', margin: 0, fontSize: '0.95rem' }}>{doctor.hospital || 'Private Practice'}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Consultation Fee</p>
                                    <p style={{ fontWeight: 700, color: '#0f172a', margin: 0, fontSize: '0.95rem' }}>₹{doctor.consultationFee || 500} <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500 }}>(Direct)</span></p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Timing</p>
                                    <p style={{ fontWeight: 700, color: '#0f172a', margin: 0, fontSize: '0.95rem' }}>{doctor.openingHours || '9:00 AM - 5:00 PM'}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Rating</p>
                                    <p style={{ fontWeight: 700, color: '#0f172a', margin: 0, fontSize: '0.95rem' }}>
                                        {'⭐'.repeat(Math.min(stars, 5))} {doctor.rating || 4.8}/5
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                                <a
                                    href={`tel:${doctor.phone || '9161364908'}`}
                                    style={{
                                        flex: 1, minWidth: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        background: '#0f172a', color: 'white', borderRadius: '14px', padding: '16px 20px',
                                        fontWeight: 800, fontSize: '0.85rem', textDecoration: 'none', border: 'none', cursor: 'pointer'
                                    }}
                                >
                                    📞 Call Doctor
                                </a>
                                <button
                                    onClick={() => setShowWAForm(true)}
                                    style={{
                                        flex: 1, minWidth: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        background: '#22c55e', color: 'white', borderRadius: '14px', padding: '16px 20px',
                                        fontWeight: 800, fontSize: '0.85rem', border: 'none', cursor: 'pointer'
                                    }}
                                >
                                    💬 WhatsApp
                                </button>
                                <a
                                    href={`/doctor-consult?doctorId=${doctor.id}`}
                                    style={{
                                        flex: 1, minWidth: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        background: '#6366f1', color: 'white', borderRadius: '14px', padding: '16px 20px',
                                        fontWeight: 800, fontSize: '0.85rem', textDecoration: 'none', border: 'none', cursor: 'pointer'
                                    }}
                                >
                                    🗓️ Book Online
                                </a>
                            </div>
                        </div>

                        {/* Claim Profile Banner */}
                        {!doctor.isClaimed && (
                            <div style={{ marginTop: '20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '20px', padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                                <div>
                                    <h3 style={{ color: 'white', fontWeight: 900, margin: '0 0 4px', fontSize: '1rem' }}>Is this your profile?</h3>
                                    <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.85rem' }}>Claim it to manage bookings & get a verified badge.</p>
                                </div>
                                <a href="/partner" style={{ background: 'white', color: '#6366f1', borderRadius: '12px', padding: '12px 24px', fontWeight: 800, fontSize: '0.8rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                                    Claim Profile →
                                </a>
                            </div>
                        )}
                    </div>

                    {/* ── Right: Sidebar ── */}
                    <div style={{ width: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Trust Score */}
                        <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
                            <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>⭐ Trust Score</p>
                            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{doctor.rating || 4.8}<span style={{ fontSize: '1rem', color: '#94a3b8' }}>/5</span></div>
                            <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '8px 0 0', fontWeight: 600 }}>Based on {doctor.ratingCount || 200}+ patient reviews verified by Swastik Medicare.</p>
                        </div>

                        {/* Working Hours */}
                        <div style={{ background: '#0f172a', borderRadius: '20px', padding: '24px', color: 'white' }}>
                            <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>⏰ Working Hours</p>
                            {[['Mon – Fri', doctor.openingHours || '09:00 – 18:00'], ['Saturday', '10:00 – 15:00'], ['Sunday', 'Emergency Only']].map(([day, time]) => (
                                <div key={day} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px', marginBottom: '10px', fontSize: '0.8rem', fontWeight: 700 }}>
                                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>{day}</span>
                                    <span style={{ color: day === 'Sunday' ? '#f87171' : 'white' }}>{time}</span>
                                </div>
                            ))}
                        </div>

                        {/* Source Badge */}
                        {doctor.source && (
                            <div style={{ background: '#eff6ff', borderRadius: '16px', padding: '16px 20px', border: '1px solid #bfdbfe' }}>
                                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>📋 Data Source</p>
                                <p style={{ color: '#1e40af', fontWeight: 700, fontSize: '0.8rem', margin: 0, textTransform: 'capitalize' }}>{doctor.source.replace(/_/g, ' ')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── WhatsApp Modal ── */}
            {showWAForm && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '480px', borderRadius: '28px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
                        <div style={{ background: '#0f172a', padding: '32px', textAlign: 'center', position: 'relative' }}>
                            <button onClick={() => setShowWAForm(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '1rem' }}>×</button>
                            <div style={{ width: '64px', height: '64px', background: '#22c55e', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 16px' }}>💬</div>
                            <h3 style={{ color: 'white', fontWeight: 900, margin: 0, fontSize: '1.3rem' }}>Connect via WhatsApp</h3>
                            <p style={{ color: '#64748b', margin: '6px 0 0', fontSize: '0.8rem' }}>with {doctor.name}</p>
                        </div>
                        <form onSubmit={handleWASubmit} style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {[['Your Name', 'name', 'text', 'e.g. Rahul Kumar'], ['Mobile Number', 'phone', 'tel', '10-digit number'], ['Your Location', 'location', 'text', 'e.g. Golghar']].map(([label, key, type, ph]) => (
                                <div key={key}>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{label}</label>
                                    <input required type={type} placeholder={ph} value={formData[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                                        style={{ width: '100%', background: '#f8fafc', border: '2px solid #f1f5f9', borderRadius: '12px', padding: '12px 16px', fontWeight: 600, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                            ))}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Your Problem</label>
                                <textarea required rows={3} placeholder="Describe your issue..." value={formData.problem} onChange={e => setFormData({ ...formData, problem: e.target.value })}
                                    style={{ width: '100%', background: '#f8fafc', border: '2px solid #f1f5f9', borderRadius: '12px', padding: '12px 16px', fontWeight: 600, fontSize: '0.9rem', outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
                            </div>
                            <button disabled={isSubmitting} style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: '14px', padding: '16px', fontWeight: 900, fontSize: '0.9rem', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                                {isSubmitting ? 'Connecting...' : '💬 Start WhatsApp Chat'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}

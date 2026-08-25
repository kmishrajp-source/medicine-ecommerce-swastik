"use client";
import { useState } from "react";
import { Link } from "@/i18n/navigation";

export default function HospitalProfileClient({ hospital }) {
    const [showWAForm, setShowWAForm] = useState(false);
    const [formData, setFormData] = useState({ name: "", phone: "", query: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleWASubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await fetch('/api/marketing/lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, serviceType: 'hospital', targetProvider: hospital.name })
            });
        } catch (e) { /* non-critical */ }
        const msg = `Hello, I found ${hospital.name} on Swastik Medicare.%0A%0AMy Name: ${formData.name}%0AQuery: ${formData.query}`;
        const phone = (hospital.phone || '9161364908').replace(/[^0-9]/g, '');
        window.open(`https://wa.me/91${phone}?text=${msg}`, "_blank");
        setShowWAForm(false);
        setIsSubmitting(false);
    };

    const stars = Math.round(hospital.rating || 4.5);

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
                            {hospital.verified && (
                                <div style={{ position: 'absolute', top: '20px', right: '20px', background: '#ecfdf5', color: '#059669', borderRadius: '50px', padding: '6px 14px', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em' }}>
                                    ✓ Verified
                                </div>
                            )}

                            {/* Info + Name */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '28px', flexWrap: 'wrap' }}>
                                <div style={{ width: '100px', height: '100px', borderRadius: '20px', background: '#e0e7ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>
                                    <i className="fa-solid fa-hospital"></i>
                                </div>
                                <div>
                                    <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>{hospital.name}</h1>
                                    <p style={{ color: '#6366f1', fontWeight: 700, fontSize: '1rem', margin: '6px 0 10px' }}>{hospital.specialties || 'Multi-Specialty Facility'}</p>
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '50px', padding: '4px 14px', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                                            📍 {hospital.city || 'Gorakhpur'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '24px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', marginBottom: '28px' }}>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Address</p>
                                    <p style={{ fontWeight: 700, color: '#0f172a', margin: 0, fontSize: '0.95rem' }}>{hospital.address}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Timing</p>
                                    <p style={{ fontWeight: 700, color: '#0f172a', margin: 0, fontSize: '0.95rem' }}>{hospital.openingHours || '24/7 Hours'}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Rating</p>
                                    <p style={{ fontWeight: 700, color: '#0f172a', margin: 0, fontSize: '0.95rem' }}>
                                        {'⭐'.repeat(Math.min(stars, 5))} {hospital.rating || 4.5}/5
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                                <a
                                    href={`tel:${hospital.phone || '9161364908'}`}
                                    style={{
                                        flex: 1, minWidth: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        background: '#0f172a', color: 'white', borderRadius: '14px', padding: '16px 20px',
                                        fontWeight: 800, fontSize: '0.85rem', textDecoration: 'none', border: 'none', cursor: 'pointer'
                                    }}
                                >
                                    📞 Call Hospital
                                </a>
                                <button
                                    onClick={() => setShowWAForm(true)}
                                    style={{
                                        flex: 1, minWidth: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        background: '#22c55e', color: 'white', borderRadius: '14px', padding: '16px 20px',
                                        fontWeight: 800, fontSize: '0.85rem', border: 'none', cursor: 'pointer'
                                    }}
                                >
                                    💬 WhatsApp Inquiry
                                </button>
                            </div>
                        </div>

                        {/* Doctors Section */}
                        {hospital.doctors && hospital.doctors.length > 0 && (
                            <div style={{ marginTop: '24px', background: 'white', borderRadius: '24px', padding: '36px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', marginBottom: '20px' }}>Associated Doctors ({hospital.doctors.length})</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {hospital.doctors.map(doctor => (
                                        <div key={doctor.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
                                            <div>
                                                <h4 style={{ fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>{doctor.name}</h4>
                                                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0, fontWeight: 600 }}>{doctor.specialization}</p>
                                            </div>
                                            <Link href={`/doctors/${doctor.id}`} style={{ padding: '8px 16px', background: '#f1f5f9', color: '#6366f1', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none' }}>
                                                View
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                    </div>
                </div>
            </div>

            {/* WA Modal overlay */}
            {showWAForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '400px', position: 'relative' }}>
                        <button onClick={() => setShowWAForm(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>Send Inquiry</h3>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>We'll send your details directly via WhatsApp.</p>

                        <form onSubmit={handleWASubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Your Name</label>
                                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', fontWeight: 600, color: '#0f172a' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Query / Requirement</label>
                                <textarea required value={formData.query} onChange={e => setFormData({ ...formData, query: e.target.value })} rows={3} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', fontWeight: 600, color: '#0f172a', resize: 'none' }} />
                            </div>
                            <button type="submit" disabled={isSubmitting} style={{ background: '#22c55e', color: 'white', padding: '16px', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', marginTop: '8px', opacity: isSubmitting ? 0.7 : 1 }}>
                                {isSubmitting ? 'Opening WhatsApp...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}

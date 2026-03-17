"use client";
import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function AmbulanceBooking() {
    const { cartCount, toggleCart } = useCart();
    const router = useRouter();
    const [city, setCity] = useState('');
    const [priority, setPriority] = useState('All');
    const [userLocation, setUserLocation] = useState(null);
    const [ambulances, setAmbulances] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bookingStep, setBookingStep] = useState(1); // 1: Search, 2: Select, 3: Confirm
    const [selectedAmbulance, setSelectedAmbulance] = useState(null);
    const [formData, setFormData] = useState({
        pickup: '',
        drop: '',
        guestName: '',
        guestPhone: ''
    });

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
                },
                (error) => {
                    console.log("Geolocation error:", error);
                }
            );
        }
    }, []);

    const searchAmbulances = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let url = `/api/ambulance/available?city=${city}&priority=${priority}`;
            if (userLocation) {
                url += `&lat=${userLocation.lat}&lng=${userLocation.lng}`;
            }
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
                setAmbulances(data.ambulances);
                if (data.ambulances.length === 0) alert("No ambulances found matching your criteria.");
            }
        } catch (err) {
            alert("Error searching ambulances");
        }
        setLoading(false);
    };

    const handleBook = async (e) => {
        e.preventDefault();
        if (!confirm("Confirm Ambulance Request?")) return;

        try {
            const res = await fetch('/api/ambulance/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ambulanceId: selectedAmbulance.id,
                    ...formData
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Ambulance Requested! \nDriver: ${selectedAmbulance.driverName}\nPhone: ${selectedAmbulance.phone}`);
                router.push('/');
            } else {
                alert("Booking Failed: " + data.error);
            }
        } catch (err) {
            alert("Something went wrong");
        }
    };

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            <div style={{ background: '#FEF2F2', padding: '80px 20px', textAlign: 'center', marginTop: '60px' }}>
                <h1 style={{ color: '#DC2626', fontSize: '3rem', marginBottom: '10px' }}>🚑 Emergency Ambulance</h1>
                <p style={{ color: '#991B1B', fontSize: '1.2rem' }}>24/7 Rapid Response. Search by GPS Nearest.</p>
            </div>

            <div className="container" style={{ marginTop: '40px', paddingBottom: '60px', maxWidth: '800px' }}>

                {bookingStep === 1 && (
                    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                        <h3>Find Nearest Ambulance</h3>
                        <form onSubmit={searchAmbulances} style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            <input
                                type="text"
                                placeholder="Enter City (e.g. Noida)"
                                value={city}
                                onChange={e => setCity(e.target.value)}
                                style={{ flex: '1 1 200px', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                            <select
                                value={priority}
                                onChange={e => setPriority(e.target.value)}
                                style={{ flex: '1 1 150px', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }}
                            >
                                <option value="All">All Types</option>
                                <option value="Basic">Basic Life Support</option>
                                <option value="Advance">Advance Life Support</option>
                                <option value="ICU">ICU Setup</option>
                            </select>
                            <button type="submit" className="btn" style={{ background: '#DC2626', color: 'white', flex: '1 1 100px' }} disabled={loading}>
                                {loading ? 'Searching...' : 'Search'}
                            </button>
                        </form>
                        {userLocation && (
                            <p style={{ fontSize: '0.85rem', color: '#16a34a', marginTop: '10px' }}>
                                <i className="fa-solid fa-location-crosshairs"></i> GPS Active: Searching nearest first
                            </p>
                        )}

                        <div style={{ marginTop: '30px' }}>
                            {ambulances.map(amb => (
                                <div key={amb.id} style={{ border: '1px solid #eee', padding: '20px', borderRadius: '12px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ margin: 0 }}>
                                            {amb.vehicleType} Ambulance 
                                            {amb.distance !== null && amb.distance !== undefined && (
                                                <span style={{ fontSize: '0.85rem', color: '#ef4444', marginLeft: '10px', background: '#FEF2F2', padding: '4px 8px', borderRadius: '12px' }}>
                                                    <i className="fa-solid fa-location-dot"></i> {amb.distance.toFixed(1)} km away
                                                </span>
                                            )}
                                        </h4>
                                        <p style={{ margin: '5px 0', color: '#666' }}>Driver: {amb.driverName}</p>
                                        <span style={{ background: '#DCFCE7', color: '#166534', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>Available</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>₹{amb.pricePerKm}/km</div>
                                        <button onClick={() => { setSelectedAmbulance(amb); setBookingStep(2); }} className="btn" style={{ background: '#DC2626', color: 'white', marginTop: '5px', fontSize: '0.9rem' }}>
                                            Select
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {bookingStep === 2 && selectedAmbulance && (
                    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                        <button onClick={() => setBookingStep(1)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginBottom: '20px' }}>← Back</button>
                        <h3 style={{ marginBottom: '20px' }}>Enter Trip Details</h3>
                        <form onSubmit={handleBook}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Pickup Location</label>
                                <input type="text" required value={formData.pickup} onChange={e => setFormData({ ...formData, pickup: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Drop Location</label>
                                <input type="text" required value={formData.drop} onChange={e => setFormData({ ...formData, drop: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>Patient/Contact Name</label>
                                    <input type="text" required value={formData.guestName} onChange={e => setFormData({ ...formData, guestName: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>Phone Number</label>
                                    <input type="tel" required value={formData.guestPhone} onChange={e => setFormData({ ...formData, guestPhone: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                                </div>
                            </div>
                            <button type="submit" className="btn" style={{ background: '#DC2626', color: 'white', width: '100%', padding: '15px', fontSize: '1.1rem' }}>
                                Confirm Booking
                            </button>
                        </form>
                    </div>
                )}

            </div>
            <Footer />
        </>
    );
}

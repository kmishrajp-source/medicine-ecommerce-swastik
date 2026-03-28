"use client";
import { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";

export default function AgentDirectoryPanel() {
    const { cartCount, toggleCart } = useCart();
    
    const [view, setView] = useState('list'); // 'list' | 'add'
    const [type, setType] = useState('doctor'); // 'doctor' | 'retailer'
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        shopName: '',
        phone: '',
        address: '',
        specialization: '',
        lat: null,
        lng: null
    });

    useEffect(() => {
        if (view === 'list') {
            fetchEntries();
        }
    }, [view, type]);

    const fetchEntries = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/agent/directory?type=${type}`);
            const data = await res.json();
            if (data.success) {
                setEntries(data.data);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const captureLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setFormData(prev => ({
                    ...prev,
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                }));
                alert("Location captured successfully!");
            }, (error) => {
                console.error("Geolocation error:", error);
                alert("Failed to capture location. Please ensure GPS is on.");
            });
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/agent/add-entry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, ...formData })
            });
            const data = await res.json();
            if (data.success) {
                alert(`${type === 'doctor' ? 'Doctor' : 'Store'} added successfully!`);
                setView('list');
                setFormData({ name: '', shopName: '', phone: '', address: '', specialization: '', lat: null, lng: null });
            }
        } catch (error) {
            alert("Failed to add entry");
        } finally {
            setLoading(false);
        }
    };

    const verifyEntry = async (id) => {
        try {
            const res = await fetch('/api/agent/directory', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, id, status: 'verified' })
            });
            const data = await res.json();
            if (data.success) {
                fetchEntries();
            }
        } catch (error) {
            alert("Verification failed");
        }
    };

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            
            <div className="max-w-4xl mx-auto p-4 md:p-8 font-sans" style={{ marginTop: '80px' }}>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Agent Directory Panel</h1>
                    <button 
                        onClick={() => setView(view === 'list' ? 'add' : 'list')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
                    >
                        {view === 'list' ? '+ Add New' : 'Back to List'}
                    </button>
                </div>

                <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
                    <button 
                        onClick={() => setType('doctor')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === 'doctor' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                    >
                        Doctors
                    </button>
                    <button 
                        onClick={() => setType('retailer')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === 'retailer' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                    >
                        Retailers
                    </button>
                </div>

                {view === 'list' ? (
                    <div className="space-y-4">
                        {loading ? (
                            <p className="text-center py-10 text-gray-400">Loading entries...</p>
                        ) : entries.length === 0 ? (
                            <p className="text-center py-10 text-gray-400">No entries found.</p>
                        ) : (
                            entries.map(entry => (
                                <div key={entry.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${type === 'doctor' ? 'bg-blue-50 text-blue-500' : 'bg-indigo-50 text-indigo-500'}`}>
                                            <i className={`fa-solid ${type === 'doctor' ? 'fa-user-doctor' : 'fa-shop'}`}></i>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{type === 'doctor' ? entry.name : entry.shopName}</h4>
                                            <p className="text-xs text-gray-500">{entry.phone}</p>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${entry.status === 'verified' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                                {entry.status}
                                            </span>
                                        </div>
                                    </div>
                                    {entry.status !== 'verified' && (
                                        <button 
                                            onClick={() => verifyEntry(entry.id)}
                                            className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm"
                                        >
                                            Verify
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleAdd} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md space-y-4">
                        <h3 className="text-lg font-bold mb-4">Add {type === 'doctor' ? 'Doctor' : 'Retailer'}</h3>
                        
                        {type === 'doctor' ? (
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Doctor Name</label>
                                <input 
                                    type="text" required
                                    className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. Dr. Sameer Khan"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Shop Name</label>
                                <input 
                                    type="text" required
                                    className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. Swastik Pharmacy"
                                    value={formData.shopName}
                                    onChange={e => setFormData({...formData, shopName: e.target.value})}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Phone Number</label>
                            <input 
                                type="tel" required
                                className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. 9876543210"
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                            />
                        </div>

                        {type === 'doctor' && (
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Specialization</label>
                                <input 
                                    type="text"
                                    className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. Cardiologist"
                                    value={formData.specialization}
                                    onChange={e => setFormData({...formData, specialization: e.target.value})}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Address / Landmark</label>
                            <textarea 
                                required
                                className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 h-24"
                                placeholder="Full address..."
                                value={formData.address}
                                onChange={e => setFormData({...formData, address: e.target.value})}
                            ></textarea>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-2xl flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-blue-800">GPS Location</p>
                                <p className="text-[10px] text-blue-600">
                                    {formData.lat ? `${formData.lat.toFixed(4)}, ${formData.lng.toFixed(4)}` : 'Not captured yet'}
                                </p>
                            </div>
                            <button 
                                type="button"
                                onClick={captureLocation}
                                className="bg-white text-blue-600 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm"
                            >
                                <i className="fa-solid fa-location-crosshairs mr-1"></i> Capture
                            </button>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg mt-4 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : `Add ${type === 'doctor' ? 'Doctor' : 'Retailer'}`}
                        </button>
                    </form>
                )}
            </div>
        </>
    );
}

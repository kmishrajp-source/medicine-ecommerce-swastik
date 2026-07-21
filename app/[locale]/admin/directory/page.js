"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const EMPTY_STOCKIST = { agencyName: "", ownerName: "", phone: "", altPhone: "", email: "", address: "", city: "", pincode: "", state: "Uttar Pradesh", gstin: "", licenseNumber: "", speciality: "", notes: "" };
const EMPTY_DISTRIBUTOR = { companyName: "", ownerName: "", phone: "", altPhone: "", email: "", address: "", city: "", pincode: "", state: "Uttar Pradesh", gstin: "", drugLicenseNo: "", brands: "", coverageArea: "", notes: "" };
const EMPTY_HOSPITAL = { name: "", address: "", city: "Gorakhpur", phone: "", email: "", website: "", specialties: "", licenseNumber: "", verified: true, isDirectory: true, openingHours: "24/7 Hours" };

function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    return lines.slice(1).map(line => {
        const vals = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const obj = {};
        headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
        return obj;
    });
}

export default function DirectoryPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("stockist");

    // Stockist state
    const [stockists, setStockists] = useState([]);
    const [stockistTotal, setStockistTotal] = useState(0);
    const [stockistPage, setStockistPage] = useState(1);
    const [stockistSearch, setStockistSearch] = useState("");
    const [stockistLoading, setStockistLoading] = useState(true);
    const [stockistForm, setStockistForm] = useState(EMPTY_STOCKIST);
    const [editingStockist, setEditingStockist] = useState(null);
    const [showStockistModal, setShowStockistModal] = useState(false);

    // Distributor state
    const [distributors, setDistributors] = useState([]);
    const [distributorTotal, setDistributorTotal] = useState(0);
    const [distributorPage, setDistributorPage] = useState(1);
    const [distributorSearch, setDistributorSearch] = useState("");
    const [distributorLoading, setDistributorLoading] = useState(true);
    const [distributorForm, setDistributorForm] = useState(EMPTY_DISTRIBUTOR);
    const [editingDistributor, setEditingDistributor] = useState(null);
    const [showDistributorModal, setShowDistributorModal] = useState(false);

    // Hospital state
    const [hospitals, setHospitals] = useState([]);
    const [hospitalTotal, setHospitalTotal] = useState(0);
    const [hospitalSearch, setHospitalSearch] = useState("");
    const [hospitalLoading, setHospitalLoading] = useState(true);
    const [hospitalForm, setHospitalForm] = useState(EMPTY_HOSPITAL);
    const [editingHospital, setEditingHospital] = useState(null);
    const [showHospitalModal, setShowHospitalModal] = useState(false);

    const [csvImporting, setCsvImporting] = useState(false);
    const [csvResult, setCsvResult] = useState(null);
    const fileRef = useRef();

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
    }, [status]);

    useEffect(() => { fetchStockists(); }, [stockistPage, stockistSearch]);
    useEffect(() => { fetchDistributors(); }, [distributorPage, distributorSearch]);
    useEffect(() => { fetchHospitals(); }, [hospitalSearch]);

    const fetchStockists = async () => {
        setStockistLoading(true);
        try {
            const res = await fetch(`/api/admin/stockist-directory?q=${stockistSearch}&page=${stockistPage}`);
            const data = await res.json();
            if (data.success) { setStockists(data.stockists); setStockistTotal(data.total); }
        } catch (e) { console.error(e); } finally { setStockistLoading(false); }
    };

    const fetchDistributors = async () => {
        setDistributorLoading(true);
        try {
            const res = await fetch(`/api/admin/distributor-directory?q=${distributorSearch}&page=${distributorPage}`);
            const data = await res.json();
            if (data.success) { setDistributors(data.distributors); setDistributorTotal(data.total); }
        } catch (e) { console.error(e); } finally { setDistributorLoading(false); }
    };

    const fetchHospitals = async () => {
        setHospitalLoading(true);
        try {
            const res = await fetch(`/api/hospitals?all=true&q=${hospitalSearch}`);
            const data = await res.json();
            if (data.success) { setHospitals(data.hospitals); setHospitalTotal(data.hospitals.length); }
        } catch (e) { console.error(e); } finally { setHospitalLoading(false); }
    };

    const handleStockistSave = async () => {
        const method = editingStockist ? "PUT" : "POST";
        const body = editingStockist ? { ...stockistForm, id: editingStockist.id } : stockistForm;
        const res = await fetch("/api/admin/stockist-directory", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await res.json();
        if (data.success) { setShowStockistModal(false); setStockistForm(EMPTY_STOCKIST); setEditingStockist(null); fetchStockists(); }
    };

    const handleDistributorSave = async () => {
        const method = editingDistributor ? "PUT" : "POST";
        const body = editingDistributor ? { ...distributorForm, id: editingDistributor.id } : distributorForm;
        const res = await fetch("/api/admin/distributor-directory", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await res.json();
        if (data.success) { setShowDistributorModal(false); setDistributorForm(EMPTY_DISTRIBUTOR); setEditingDistributor(null); fetchDistributors(); }
    };

    const handleHospitalSave = async () => {
        const method = editingHospital ? "PUT" : "POST";
        const url = editingHospital ? `/api/hospitals/${editingHospital.id}` : "/api/hospitals";
        const body = hospitalForm;
        const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await res.json();
        if (data.success) { setShowHospitalModal(false); setHospitalForm(EMPTY_HOSPITAL); setEditingHospital(null); fetchHospitals(); }
    };

    const toggleHospitalVerify = async (h) => {
        const res = await fetch(`/api/hospitals/${h.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ verified: !h.verified })
        });
        const data = await res.json();
        if (data.success) fetchHospitals();
    };

    const handleDelete = async (type, id) => {
        if (!confirm("Delete this entry?")) return;
        let url = type === 'stockist' ? `/api/admin/stockist-directory?id=${id}` : type === 'distributor' ? `/api/admin/distributor-directory?id=${id}` : `/api/hospitals/${id}`;
        await fetch(url, { method: "DELETE" });
        if (type === 'stockist') fetchStockists();
        else if (type === 'distributor') fetchDistributors();
        else fetchHospitals();
    };

    const handleCSVImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setCsvImporting(true);
        setCsvResult(null);
        const text = await file.text();
        const rows = parseCSV(text);
        const url = activeTab === 'stockist' ? '/api/admin/stockist-directory' : '/api/admin/distributor-directory';
        const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bulk: rows }) });
        const data = await res.json();
        setCsvResult(data);
        setCsvImporting(false);
        activeTab === 'stockist' ? fetchStockists() : fetchDistributors();
        e.target.value = '';
    };

    const openStockistEdit = (s) => { setEditingStockist(s); setStockistForm({ ...s }); setShowStockistModal(true); };
    const openDistributorEdit = (d) => { setEditingDistributor(d); setDistributorForm({ ...d }); setShowDistributorModal(true); };
    const openHospitalEdit = (h) => { setEditingHospital(h); setHospitalForm({ ...h }); setShowHospitalModal(true); };

    const downloadTemplate = () => {
        const isStockist = activeTab === 'stockist';
        const headers = isStockist
            ? "agencyName,ownerName,phone,altPhone,email,address,city,pincode,state,gstin,licenseNumber,speciality"
            : "companyName,ownerName,phone,altPhone,email,address,city,pincode,state,gstin,drugLicenseNo,brands,coverageArea";
        const sample = isStockist
            ? "City Medico Stockist,Rajan Gupta,9876543210,9876543211,rajan@example.com,12 Station Road,Gorakhpur,273001,Uttar Pradesh,09XXXX,UP-DL-001,General Medicines"
            : "Pharma Distributors Pvt Ltd,Mohan Verma,9876543210,,mohan@pharma.com,45 Industrial Area,Gorakhpur,273001,Uttar Pradesh,09XXXX,UP-DL-002,GSK;Cipla;Sun,Gorakhpur;Deoria;Basti";
        const blob = new Blob([headers + "\n" + sample], { type: "text/csv" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${activeTab}_directory_template.csv`;
        a.click();
    };

    if (status === "loading") return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400 font-bold">Loading...</div>;

    return (
        <div className="bg-[#0f172a] min-h-screen pb-20 text-slate-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1e293b] to-slate-900 border-b border-slate-700 px-8 py-10 mb-8 shadow-xl">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-1 flex items-center gap-3">
                        <i className="fa-solid fa-address-book text-indigo-400"></i>
                        B2B Directory Management
                    </h1>
                    <p className="text-indigo-400/70 font-bold uppercase tracking-widest text-[10px]">
                        Stockist & Distributor Database — Used for Live WhatsApp Broadcasts
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8">
                {/* Tab Switcher */}
                <div className="flex gap-2 mb-8 bg-slate-800/50 p-1.5 rounded-2xl inline-flex flex-wrap">
                    <button onClick={() => setActiveTab('stockist')} className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${activeTab === 'stockist' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:text-white'}`}>
                        <i className="fa-solid fa-warehouse mr-2"></i> Stockists ({stockistTotal})
                    </button>
                    <button onClick={() => setActiveTab('distributor')} className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${activeTab === 'distributor' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : 'text-slate-400 hover:text-white'}`}>
                        <i className="fa-solid fa-truck-ramp-box mr-2"></i> Distributors ({distributorTotal})
                    </button>
                    <button onClick={() => setActiveTab('hospital')} className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${activeTab === 'hospital' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'text-slate-400 hover:text-white'}`}>
                        <i className="fa-solid fa-hospital mr-2"></i> Hospitals ({hospitalTotal})
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
                    <div className="relative flex-1 max-w-md">
                        <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}s...`}
                            value={activeTab === 'stockist' ? stockistSearch : activeTab === 'distributor' ? distributorSearch : hospitalSearch}
                            onChange={e => activeTab === 'stockist' ? setStockistSearch(e.target.value) : activeTab === 'distributor' ? setDistributorSearch(e.target.value) : setHospitalSearch(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>

                    <div className="flex gap-3 flex-wrap">
                        {activeTab !== 'hospital' && (
                            <>
                                <button onClick={downloadTemplate} className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2">
                                    <i className="fa-solid fa-file-csv text-emerald-400"></i> Download Template
                                </button>
                                <label className={`px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 cursor-pointer ${csvImporting ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <i className={`fa-solid fa-upload ${csvImporting ? 'animate-spin' : ''}`}></i>
                                    {csvImporting ? 'Importing...' : 'Import CSV'}
                                    <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
                                </label>
                            </>
                        )}
                        <button
                            onClick={() => {
                                if (activeTab === 'stockist') { setEditingStockist(null); setStockistForm(EMPTY_STOCKIST); setShowStockistModal(true); }
                                else if (activeTab === 'distributor') { setEditingDistributor(null); setDistributorForm(EMPTY_DISTRIBUTOR); setShowDistributorModal(true); }
                                else { setEditingHospital(null); setHospitalForm(EMPTY_HOSPITAL); setShowHospitalModal(true); }
                            }}
                            className={`px-5 py-2.5 font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 text-white ${activeTab === 'stockist' ? 'bg-indigo-500 hover:bg-indigo-400' : activeTab === 'distributor' ? 'bg-purple-500 hover:bg-purple-400' : 'bg-emerald-500 hover:bg-emerald-400'} shadow-lg`}
                        >
                            <i className="fa-solid fa-plus"></i> Add New {activeTab === 'hospital' ? 'Hospital' : ''}
                        </button>
                    </div>
                </div>

                {csvResult && (
                    <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 font-bold text-sm flex items-center justify-between">
                        <span><i className="fa-solid fa-check-circle mr-2"></i> Successfully imported {csvResult.created} entries!</span>
                        <button onClick={() => setCsvResult(null)} className="text-slate-500 hover:text-white"><i className="fa-solid fa-xmark"></i></button>
                    </div>
                )}

                {/* STOCKIST TABLE */}
                {activeTab === 'stockist' && (
                    <div className="bg-[#1e293b] rounded-3xl border border-slate-700 overflow-hidden shadow-xl">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Agency / Owner</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">City</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Speciality</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Source</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stockistLoading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="border-b border-slate-700/50">
                                            {Array(6).fill(0).map((_, j) => <td key={j} className="px-6 py-4"><div className="h-4 bg-slate-700 rounded animate-pulse"></div></td>)}
                                        </tr>
                                    ))
                                ) : stockists.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-500 font-bold">No stockists found. Add one or import a CSV file.</td></tr>
                                ) : stockists.map(s => (
                                    <tr key={s.id} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-white text-sm">{s.agencyName}</p>
                                            {s.ownerName && <p className="text-xs text-slate-400">{s.ownerName}</p>}
                                        </td>
                                        <td className="px-6 py-4 text-cyan-400 font-bold text-sm">{s.phone}</td>
                                        <td className="px-6 py-4 text-slate-300 text-sm">{s.city}</td>
                                        <td className="px-6 py-4">
                                            {s.speciality ? <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold rounded">{s.speciality}</span> : <span className="text-slate-600 text-xs">—</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${s.source === 'csv_import' ? 'bg-amber-500/20 text-amber-400' : s.source === 'field_agent' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>{s.source?.replace('_', ' ')}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => openStockistEdit(s)} className="p-2 bg-slate-700 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-400 rounded-lg transition-all text-xs">
                                                    <i className="fa-solid fa-pen"></i>
                                                </button>
                                                <button onClick={() => handleDelete('stockist', s.id)} className="p-2 bg-slate-700 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-lg transition-all text-xs">
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {stockistTotal > 20 && (
                            <div className="px-6 py-4 border-t border-slate-700 flex justify-between items-center">
                                <span className="text-xs text-slate-500 font-bold">Showing {stockists.length} of {stockistTotal}</span>
                                <div className="flex gap-2">
                                    <button disabled={stockistPage <= 1} onClick={() => setStockistPage(p => p - 1)} className="px-4 py-2 text-xs bg-slate-700 rounded-lg disabled:opacity-30 font-bold text-slate-300">Prev</button>
                                    <button disabled={stockistPage * 20 >= stockistTotal} onClick={() => setStockistPage(p => p + 1)} className="px-4 py-2 text-xs bg-slate-700 rounded-lg disabled:opacity-30 font-bold text-slate-300">Next</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* DISTRIBUTOR TABLE */}
                {activeTab === 'distributor' && (
                    <div className="bg-[#1e293b] rounded-3xl border border-slate-700 overflow-hidden shadow-xl">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Company / Owner</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">City</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Brands</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Coverage</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {distributorLoading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="border-b border-slate-700/50">
                                            {Array(6).fill(0).map((_, j) => <td key={j} className="px-6 py-4"><div className="h-4 bg-slate-700 rounded animate-pulse"></div></td>)}
                                        </tr>
                                    ))
                                ) : distributors.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-500 font-bold">No distributors found. Add one or import a CSV file.</td></tr>
                                ) : distributors.map(d => (
                                    <tr key={d.id} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-white text-sm">{d.companyName}</p>
                                            {d.ownerName && <p className="text-xs text-slate-400">{d.ownerName}</p>}
                                        </td>
                                        <td className="px-6 py-4 text-cyan-400 font-bold text-sm">{d.phone}</td>
                                        <td className="px-6 py-4 text-slate-300 text-sm">{d.city}</td>
                                        <td className="px-6 py-4">
                                            {d.brands ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {d.brands.split(';').slice(0, 3).map((b, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[9px] font-bold rounded">{b.trim()}</span>
                                                    ))}
                                                </div>
                                            ) : <span className="text-slate-600 text-xs">—</span>}
                                        </td>
                                        <td className="px-6 py-4 text-slate-300 text-xs">{d.coverageArea || '—'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => openDistributorEdit(d)} className="p-2 bg-slate-700 hover:bg-purple-500/20 text-slate-300 hover:text-purple-400 rounded-lg transition-all text-xs">
                                                    <i className="fa-solid fa-pen"></i>
                                                </button>
                                                <button onClick={() => handleDelete('distributor', d.id)} className="p-2 bg-slate-700 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-lg transition-all text-xs">
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {distributorTotal > 20 && (
                            <div className="px-6 py-4 border-t border-slate-700 flex justify-between items-center">
                                <span className="text-xs text-slate-500 font-bold">Showing {distributors.length} of {distributorTotal}</span>
                                <div className="flex gap-2">
                                    <button disabled={distributorPage <= 1} onClick={() => setDistributorPage(p => p - 1)} className="px-4 py-2 text-xs bg-slate-700 rounded-lg disabled:opacity-30 font-bold text-slate-300">Prev</button>
                                    <button disabled={distributorPage * 20 >= distributorTotal} onClick={() => setDistributorPage(p => p + 1)} className="px-4 py-2 text-xs bg-slate-700 rounded-lg disabled:opacity-30 font-bold text-slate-300">Next</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* HOSPITAL TABLE */}
                {activeTab === 'hospital' && (
                    <div className="bg-[#1e293b] rounded-3xl border border-slate-700 overflow-hidden shadow-xl">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Hospital Name</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone / Email</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">City</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Specialties</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Verified Status</th>
                                    <th className="text-left px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {hospitalLoading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="border-b border-slate-700/50">
                                            {Array(6).fill(0).map((_, j) => <td key={j} className="px-6 py-4"><div className="h-4 bg-slate-700 rounded animate-pulse"></div></td>)}
                                        </tr>
                                    ))
                                ) : hospitals.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-500 font-bold">No hospitals found. Click "Add New Hospital" to register one.</td></tr>
                                ) : hospitals.map(h => (
                                    <tr key={h.id} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-white text-sm">{h.name}</p>
                                            <p className="text-xs text-slate-400">{h.address}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-cyan-400 font-bold text-sm">{h.phone}</p>
                                            {h.email && <p className="text-xs text-slate-400">{h.email}</p>}
                                        </td>
                                        <td className="px-6 py-4 text-slate-300 text-sm">{h.city}</td>
                                        <td className="px-6 py-4">
                                            {h.specialties ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {h.specialties.split(',').slice(0, 3).map((s, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold rounded">{s.trim()}</span>
                                                    ))}
                                                </div>
                                            ) : <span className="text-slate-600 text-xs">—</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleHospitalVerify(h)}
                                                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${h.verified ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}
                                            >
                                                {h.verified ? '✓ Verified Partner' : '⏳ Pending Approval'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => openHospitalEdit(h)} className="p-2 bg-slate-700 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 rounded-lg transition-all text-xs">
                                                    <i className="fa-solid fa-pen"></i>
                                                </button>
                                                <button onClick={() => handleDelete('hospital', h.id)} className="p-2 bg-slate-700 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-lg transition-all text-xs">
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* HOSPITAL MODAL */}
            {showHospitalModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1e293b] rounded-3xl p-8 w-full max-w-2xl border border-emerald-500/30 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-6">{editingHospital ? 'Edit' : 'Add'} Hospital</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hospital Name *</label>
                                <input type="text" value={hospitalForm.name || ''} onChange={e => setHospitalForm(f => ({ ...f, name: e.target.value }))} placeholder="Swastik Super Speciality Hospital" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Address *</label>
                                <input type="text" value={hospitalForm.address || ''} onChange={e => setHospitalForm(f => ({ ...f, address: e.target.value }))} placeholder="123 Medical Road, Park Road" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">City *</label>
                                <input type="text" value={hospitalForm.city || ''} onChange={e => setHospitalForm(f => ({ ...f, city: e.target.value }))} placeholder="Gorakhpur" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone *</label>
                                <input type="text" value={hospitalForm.phone || ''} onChange={e => setHospitalForm(f => ({ ...f, phone: e.target.value }))} placeholder="9876543210" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</label>
                                <input type="text" value={hospitalForm.email || ''} onChange={e => setHospitalForm(f => ({ ...f, email: e.target.value }))} placeholder="info@hospital.com" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">License Number</label>
                                <input type="text" value={hospitalForm.licenseNumber || ''} onChange={e => setHospitalForm(f => ({ ...f, licenseNumber: e.target.value }))} placeholder="HOSP-UP-102" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Specialties (comma separated)</label>
                                <input type="text" value={hospitalForm.specialties || ''} onChange={e => setHospitalForm(f => ({ ...f, specialties: e.target.value }))} placeholder="Cardiology, Neurology, Pediatrics, ICU" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Opening Hours</label>
                                <input type="text" value={hospitalForm.openingHours || ''} onChange={e => setHospitalForm(f => ({ ...f, openingHours: e.target.value }))} placeholder="24/7 Hours" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500" />
                            </div>
                            <div className="flex items-center gap-3 pt-4">
                                <input type="checkbox" id="verified" checked={hospitalForm.verified} onChange={e => setHospitalForm(f => ({ ...f, verified: e.target.checked }))} className="w-4 h-4 rounded text-emerald-500" />
                                <label htmlFor="verified" className="text-xs font-bold text-slate-300">Verified Admin Partner</label>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-8">
                            <button onClick={() => { setShowHospitalModal(false); setEditingHospital(null); }} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all">Cancel</button>
                            <button onClick={handleHospitalSave} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-xl transition-all">Save Hospital</button>
                        </div>
                    </div>
                </div>
            )}
            {showStockistModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1e293b] rounded-3xl p-8 w-full max-w-2xl border border-indigo-500/30 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-6">{editingStockist ? 'Edit' : 'Add'} Stockist</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { key: 'agencyName', label: 'Agency Name *', placeholder: 'City Medico Stockist' },
                                { key: 'ownerName', label: 'Owner Name', placeholder: 'Rajan Gupta' },
                                { key: 'phone', label: 'Phone *', placeholder: '9876543210' },
                                { key: 'altPhone', label: 'Alternate Phone', placeholder: 'Optional' },
                                { key: 'email', label: 'Email', placeholder: 'Optional' },
                                { key: 'gstin', label: 'GSTIN', placeholder: 'Optional' },
                                { key: 'licenseNumber', label: 'Drug License No.', placeholder: 'UP-DL-001' },
                                { key: 'speciality', label: 'Speciality', placeholder: 'e.g. General Medicines' },
                            ].map(({ key, label, placeholder }) => (
                                <div key={key}>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</label>
                                    <input type="text" value={stockistForm[key] || ''} onChange={e => setStockistForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500" />
                                </div>
                            ))}
                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Address *</label>
                                <input type="text" value={stockistForm.address || ''} onChange={e => setStockistForm(f => ({ ...f, address: e.target.value }))} placeholder="12 Station Road" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">City *</label>
                                <input type="text" value={stockistForm.city || ''} onChange={e => setStockistForm(f => ({ ...f, city: e.target.value }))} placeholder="Gorakhpur" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pincode</label>
                                <input type="text" value={stockistForm.pincode || ''} onChange={e => setStockistForm(f => ({ ...f, pincode: e.target.value }))} placeholder="273001" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500" />
                            </div>
                        </div>
                        <div className="flex gap-4 mt-8">
                            <button onClick={() => { setShowStockistModal(false); setEditingStockist(null); }} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all">Cancel</button>
                            <button onClick={handleStockistSave} className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-black rounded-xl transition-all">Save Stockist</button>
                        </div>
                    </div>
                </div>
            )}

            {/* DISTRIBUTOR MODAL */}
            {showDistributorModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1e293b] rounded-3xl p-8 w-full max-w-2xl border border-purple-500/30 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-6">{editingDistributor ? 'Edit' : 'Add'} Distributor</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { key: 'companyName', label: 'Company Name *', placeholder: 'Pharma Distributors Pvt Ltd' },
                                { key: 'ownerName', label: 'Owner Name', placeholder: 'Mohan Verma' },
                                { key: 'phone', label: 'Phone *', placeholder: '9876543210' },
                                { key: 'altPhone', label: 'Alternate Phone', placeholder: 'Optional' },
                                { key: 'email', label: 'Email', placeholder: 'Optional' },
                                { key: 'gstin', label: 'GSTIN', placeholder: 'Optional' },
                                { key: 'drugLicenseNo', label: 'Drug License No.', placeholder: 'UP-DL-002' },
                                { key: 'coverageArea', label: 'Coverage Area', placeholder: 'Gorakhpur;Deoria;Basti' },
                            ].map(({ key, label, placeholder }) => (
                                <div key={key}>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</label>
                                    <input type="text" value={distributorForm[key] || ''} onChange={e => setDistributorForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500" />
                                </div>
                            ))}
                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Brands (semicolon separated)</label>
                                <input type="text" value={distributorForm.brands || ''} onChange={e => setDistributorForm(f => ({ ...f, brands: e.target.value }))} placeholder="GSK;Cipla;Sun Pharma" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Address *</label>
                                <input type="text" value={distributorForm.address || ''} onChange={e => setDistributorForm(f => ({ ...f, address: e.target.value }))} placeholder="45 Industrial Area" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">City *</label>
                                <input type="text" value={distributorForm.city || ''} onChange={e => setDistributorForm(f => ({ ...f, city: e.target.value }))} placeholder="Gorakhpur" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pincode</label>
                                <input type="text" value={distributorForm.pincode || ''} onChange={e => setDistributorForm(f => ({ ...f, pincode: e.target.value }))} placeholder="273001" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500" />
                            </div>
                        </div>
                        <div className="flex gap-4 mt-8">
                            <button onClick={() => { setShowDistributorModal(false); setEditingDistributor(null); }} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all">Cancel</button>
                            <button onClick={handleDistributorSave} className="flex-1 py-3 bg-purple-500 hover:bg-purple-400 text-white font-black rounded-xl transition-all">Save Distributor</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";

export default function BulkUpload() {
    const { data: session, status } = useSession();
    const router = useRouter();
    
    // Global State
    const [activeTab, setActiveTab] = useState('medicine'); // 'medicine' | 'directory'
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    // Medicine State (File Upload)
    const [file, setFile] = useState(null);

    // Directory State (Textarea Paste)
    const [dirType, setDirType] = useState('doctor'); 
    const [rawData, setRawData] = useState('');

    if (status === 'loading') return <div style={{ padding: '100px', textAlign: 'center' }}>Loading...</div>;

    if (!session || session.user.role !== 'ADMIN') {
         return <div style={{ padding: '100px', textAlign: 'center' }}>Access Denied</div>;
    }

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleMedicineUpload = async (e) => {
        e.preventDefault();
        if (!file) return alert("Please select a CSV file first.");

        setLoading(true);
        setResult(null);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "medicine");

        try {
            const res = await fetch('/api/admin/bulk-upload', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (data.success) {
                setResult({ success: true, message: `Successfully imported ${data.count || ''} medicines.` });
                setFile(null);
            } else {
                setResult({ success: false, message: data.error || "Upload failed." });
            }
        } catch (err) {
            setResult({ success: false, message: "A network error occurred." });
        } finally {
            setLoading(false);
        }
    };

    const parseCSV = (csv) => {
        const lines = csv.split('\n');
        if (lines.length < 2) return [];
        const header = lines[0].split(',').map(h => h.trim());
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            const values = lines[i].split(',').map(v => v.trim());
            const obj = {};
            header.forEach((h, index) => { obj[h] = values[index]; });
            data.push(obj);
        }
        return data;
    };

    const handleDirectoryUpload = async () => {
        if (!rawData.trim()) return alert("No data provided");
        
        setLoading(true);
        setResult(null);
        try {
            let dataToUpload;
            if (rawData.trim().startsWith('[')) {
                dataToUpload = JSON.parse(rawData);
            } else {
                dataToUpload = parseCSV(rawData);
            }

            const res = await fetch('/api/admin/bulk-upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: dirType, data: dataToUpload })
            });

            const data = await res.json();
            if (data.success) {
                setResult({ success: true, message: `Successfully uploaded ${data.count} entries!` });
                setRawData('');
            } else {
                setResult({ success: false, message: data.error || "Upload failed." });
            }
        } catch (error) {
            setResult({ success: false, message: "Invalid data format. Please check your JSON or CSV." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar cartCount={0} />
            <div className="container" style={{ marginTop: '100px', paddingBottom: '60px', maxWidth: '1000px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                        <h1 style={{ margin: 0 }}>Bulk Data Management</h1>
                        <p style={{ color: '#666' }}>Upload medicines or directory listings in bulk.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                    <button 
                        onClick={() => { setActiveTab('medicine'); setResult(null); }}
                        style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: activeTab === 'medicine' ? '#1B5E20' : '#eee', color: activeTab === 'medicine' ? 'white' : '#333', fontWeight: 'bold', cursor: 'pointer' }}>
                        <i className="fa-solid fa-pills mr-2"></i> Medicine Master
                    </button>
                    <button 
                        onClick={() => { setActiveTab('directory'); setResult(null); }}
                        style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: activeTab === 'directory' ? '#2563EB' : '#eee', color: activeTab === 'directory' ? 'white' : '#333', fontWeight: 'bold', cursor: 'pointer' }}>
                        <i className="fa-solid fa-address-book mr-2"></i> Directory Import
                    </button>
                </div>

                <div className="glass" style={{ padding: '40px', borderRadius: '16px', border: '1px solid #e2e8f0', background: 'white' }}>
                    
                    {activeTab === 'medicine' ? (
                        <div>
                            <h2 style={{ marginBottom: '10px' }}>Bulk Medicine Import</h2>
                            <p style={{ color: '#666', marginBottom: '30px' }}>Upload a CSV file for high-volume inventory sync (100k+ rows supported).</p>
                            
                            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                                <strong>Required Headers:</strong> <code>medicine_name, mrp, purchase_price, stock</code>
                            </div>

                            <form onSubmit={handleMedicineUpload}>
                                <div style={{ border: '2px dashed #CBD5E1', padding: '40px', textAlign: 'center', borderRadius: '12px', background: 'white', marginBottom: '20px' }}>
                                    <input type="file" accept=".csv" onChange={handleFileChange} required />
                                </div>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary" 
                                    disabled={loading || !file} 
                                    style={{ width: '100%', padding: '15px', background: loading ? '#94A3B8' : '#1B5E20' }}
                                >
                                    {loading ? "Processing..." : "Start Import"}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div>
                            <h2 style={{ marginBottom: '10px' }}>Directory Importer</h2>
                            <p style={{ color: '#666', marginBottom: '30px' }}>Paste scraped data (Google Maps, Justdial) for Doctors or Retailers.</p>
                            
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                                <button 
                                    onClick={() => setDirType('doctor')}
                                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd', background: dirType === 'doctor' ? '#eff6ff' : 'white', fontWeight: 'bold' }}>
                                    Doctors
                                </button>
                                <button 
                                    onClick={() => setDirType('retailer')}
                                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd', background: dirType === 'retailer' ? '#f5f3ff' : 'white', fontWeight: 'bold' }}>
                                    Retailers
                                </button>
                            </div>

                            <textarea 
                                style={{ width: '100%', height: '300px', padding: '15px', borderRadius: '12px', border: '1px solid #ddd', fontFamily: 'monospace', fontSize: '0.8rem', marginBottom: '20px' }}
                                placeholder={dirType === 'doctor' ? "name,phone,specialization,hospital,source\nDr. Khan,9876543210,Cardiologist,Apex City,google_maps" : "shopName,phone,address,source\nSwastik Medical,9876543210,Phase-1 Delhi,justdial"}
                                value={rawData}
                                onChange={(e) => setRawData(e.target.value)}
                            />

                            <button 
                                onClick={handleDirectoryUpload}
                                disabled={loading || !rawData.trim()}
                                className="btn btn-primary" 
                                style={{ width: '100%', padding: '15px', background: loading ? '#94A3B8' : '#2563EB' }}
                            >
                                {loading ? "Uploading..." : "🚀 Upload Directory"}
                            </button>
                        </div>
                    )}

                    {result && (
                        <div style={{ marginTop: '20px', padding: '20px', borderRadius: '12px', background: result.success ? '#ECFDF5' : '#FEF2F2', border: `1px solid ${result.success ? '#A7F3D0' : '#FECACA'}`, color: result.success ? '#065F46' : '#991B1B' }}>
                            <strong>{result.success ? "Success!" : "Error:"}</strong> {result.message}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

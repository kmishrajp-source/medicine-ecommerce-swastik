"use client";
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BulkUpload() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);

    if (status === 'loading') return <div style={{ padding: '100px', textAlign: 'center' }}>Loading...</div>;

    if (!session || session.user.role !== 'ADMIN') {
         // Optionally router.push('/login') instead of render
         return <div style={{ padding: '100px', textAlign: 'center' }}>Access Denied</div>;
    }

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return alert("Please select a CSV file first.");

        setUploading(true);
        setResult(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch('/api/admin/bulk-upload', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setResult({
                    success: true,
                    message: data.message
                });
            } else {
                setResult({
                    success: false,
                    message: data.error || "Upload failed."
                });
            }
        } catch (err) {
            setResult({
                success: false,
                message: "A network error occurred."
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <Navbar cartCount={0} openCart={() => {}} />
            <div className="container" style={{ marginTop: '100px', paddingBottom: '60px', maxWidth: '800px' }}>
                <Link href="/admin/inventory" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: 'var(--text-light)', textDecoration: 'none' }}>
                    <i className="fa-solid fa-arrow-left"></i> Back to Inventory
                </Link>

                <div className="glass" style={{ padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ marginBottom: '10px' }}><i className="fa-solid fa-file-csv" style={{ color: '#1B5E20' }}></i> Bulk Medicine Import</h2>
                    <p style={{ color: '#666', marginBottom: '30px' }}>Upload a CSV file containing your medicine master and inventory data. The system supports 100k+ row datasets.</p>

                    <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #E2E8F0' }}>
                        <h4 style={{ marginBottom: '10px', fontSize: '1rem' }}>Required CSV Format Requirements:</h4>
                        <ul style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6', margin: 0, paddingLeft: '20px' }}>
                            <li>Headers must be lower_case: <code>medicine_name, mrp, purchase_price, stock</code></li>
                            <li>Optional fields: <code>margin, category, composition, manufacturer, pack_size, description, image_url</code></li>
                            <li>Selling price is auto-calculated as: <b>min(mrp, purchase_price + margin)</b></li>
                        </ul>
                    </div>

                    <form onSubmit={handleUpload}>
                        <div style={{ border: '2px dashed #CBD5E1', padding: '40px', textAlign: 'center', borderRadius: '12px', background: 'white', marginBottom: '20px', cursor: 'pointer' }}>
                            <input 
                                type="file" 
                                accept=".csv" 
                                onChange={handleFileChange} 
                                style={{ display: 'block', margin: '0 auto' }}
                                required 
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            disabled={uploading || !file} 
                            style={{ width: '100%', padding: '15px', fontSize: '1.1rem', background: uploading ? '#94A3B8' : '#1B5E20' }}
                        >
                            {uploading ? "Processing file... Please wait" : "Upload & Sync Inventory"}
                        </button>
                    </form>

                    {result && (
                        <div style={{ marginTop: '20px', padding: '20px', borderRadius: '12px', background: result.success ? '#ECFDF5' : '#FEF2F2', border: `1px solid ${result.success ? '#A7F3D0' : '#FECACA'}`, color: result.success ? '#065F46' : '#991B1B' }}>
                            <strong>{result.success ? "Success!" : "Upload Error:"}</strong> {result.message}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

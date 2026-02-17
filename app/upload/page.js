"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

export default function UploadPrescription() {
    const [file, setFile] = useState(null);
    const [notes, setNotes] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            alert("Please select a file to upload.");
            return;
        }

        setIsUploading(true);

        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // In a real app, you would upload to S3/Blob storage here
        // and save the URL to the database.

        alert("Prescription Uploaded Successfully! Our pharmacist will review it and contact you shortly.");
        setIsUploading(false);
        router.push("/shop");
    };

    return (
        <>
            <Navbar cartCount={0} openCart={() => { }} />
            <div className="container" style={{ marginTop: '120px', maxWidth: '600px' }}>
                <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '10px', color: 'var(--primary)' }}>Upload Prescription</h2>
                    <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
                        Upload your doctor's prescription and we will handle the rest.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Select Image/PDF</label>
                            <div style={{ border: '2px dashed #ddd', padding: '40px', textAlign: 'center', borderRadius: '12px', cursor: 'pointer', background: '#fafafa' }}
                                onClick={() => document.getElementById('fileInput').click()}
                            >
                                <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '2rem', color: '#aaa', marginBottom: '10px' }}></i>
                                {file ? (
                                    <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{file.name}</div>
                                ) : (
                                    <div style={{ color: '#888' }}>Click to browse or drag file here</div>
                                )}
                                <input
                                    id="fileInput"
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Additional Notes (Optional)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="E.g., I only need the first 3 medicines..."
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '100px' }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary full-width"
                            disabled={isUploading}
                            style={{ padding: '15px', fontSize: '1.1rem' }}
                        >
                            {isUploading ? "Uploading..." : "Submit Prescription"}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

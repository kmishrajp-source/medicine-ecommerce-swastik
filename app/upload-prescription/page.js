"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function UploadPrescription() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
        }
    };

    const handleUpload = async () => {
        if (!file) return alert("Please select a file first.");

        setLoading(true);
        // Note: Real implementation needs a cloud storage (S3/Cloudinary).
        // Phase 1 MVP: We will convert to Base64 (Limit size) or placeholder.
        // For simplicity in this demo, we'll mimic success.

        // Convert to Base64 (Small files only)
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            const base64String = reader.result;

            try {
                // Call API to save prescription
                // Use a hypothetical API endpoint
                /* 
                const res = await fetch('/api/prescription/upload', {
                    method: 'POST',
                    body: JSON.stringify({ userId: session.user.id, image: base64String })
                });
                */

                // For now, simulate success
                setTimeout(() => {
                    alert("Prescription Uploaded Successfully! A pharmacist will review it.");
                    router.push('/profile');
                }, 1000);
            } catch (error) {
                alert("Upload failed.");
            } finally {
                setLoading(false);
            }
        };
    };

    if (status === 'loading') return <div>Loading...</div>;
    if (status === 'unauthenticated') {
        router.push('/login');
        return null;
    }

    return (
        <>
            <Navbar cartCount={0} />
            <div className="container" style={{ marginTop: "100px", maxWidth: "600px" }}>
                <h2 style={{ textAlign: "center" }}>Upload Prescription</h2>
                <div style={{ marginTop: "20px", border: "2px dashed #ccc", padding: "40px", textAlign: "center", borderRadius: "10px" }}>
                    <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                        id="fileInput"
                    />
                    <label htmlFor="fileInput" style={{ cursor: "pointer", display: "block" }}>
                        {preview ? (
                            <img src={preview} alt="Preview" style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: "8px" }} />
                        ) : (
                            <div>
                                <p style={{ fontSize: "1.2rem", color: "#666" }}>Click to Select File</p>
                                <p style={{ fontSize: "0.9rem", color: "#999" }}>(JPG, PNG, PDF)</p>
                            </div>
                        )}
                    </label>
                </div>

                <div style={{ marginTop: "20px", textAlign: "center" }}>
                    <button
                        onClick={handleUpload}
                        disabled={loading || !file}
                        style={{
                            padding: "12px 30px",
                            background: file ? "#0D8ABC" : "#ccc",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: file ? "pointer" : "not-allowed",
                            fontSize: "1rem"
                        }}
                    >
                        {loading ? "Uploading..." : "Submit Prescription"}
                    </button>
                </div>
            </div>
        </>
    );
}

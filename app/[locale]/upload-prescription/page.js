"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function UploadPrescription() {
    const { data: session } = useSession();
    const { cartCount, toggleCart } = useCart();
    const router = useRouter();
    const [imageUrl, setImageUrl] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // In a real app, we would upload the file to S3/Cloudinary here.
        // For this demo, we'll assume the user pastes a link or we use a dummy link if empty.
        const finalUrl = imageUrl || "https://via.placeholder.com/300?text=Prescription+Scanning...";

        const res = await fetch('/api/prescription/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imageUrl: finalUrl,
                userId: session?.user?.id
            })
        });

        if (res.ok) {
            alert("Prescription Uploaded! Local pharmacies will now bid to provide your medicines at the best price.");
            router.push('/my-prescriptions');
        } else {
            alert("Failed to upload.");
        }
        setLoading(false);
    };

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            <div className="container" style={{ marginTop: '120px', maxWidth: '600px' }}>
                <div className="glass" style={{ padding: '40px', borderRadius: '16px' }}>
                    <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>📄 Upload Prescription</h1>
                    <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
                        Upload your doctor's prescription. We will verify availability and send you a payment link.
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Select Prescription Image</label>
                            <div style={{ border: '2px dashed #ddd', padding: '40px', textAlign: 'center', borderRadius: '12px', cursor: 'pointer', background: '#fafafa' }}
                                onClick={() => document.getElementById('fileInput').click()}
                            >
                                <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '2rem', color: '#aaa', marginBottom: '10px' }}></i>
                                {imageUrl ? (
                                    <div style={{ color: 'var(--success)', fontWeight: 'bold' }}>✅ File Attached and Ready</div>
                                ) : (
                                    <div style={{ color: '#888' }}>Click here to browse your device for the prescription image</div>
                                )}
                                <input
                                    id="fileInput"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setImageUrl(reader.result);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        </div>

                        {!session && (
                            <div style={{ background: '#FFF7ED', padding: '15px', borderRadius: '8px', color: '#C2410C', fontSize: '0.9rem' }}>
                                <i className="fa-solid fa-info-circle"></i> You must be logged in to track your order.
                            </div>
                        )}

                        <button type="submit" disabled={loading || !session} className="btn btn-primary" style={{ padding: '15px' }}>
                            {loading ? 'Uploading...' : 'Submit Prescription'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

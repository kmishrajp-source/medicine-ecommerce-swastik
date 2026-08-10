"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Link from 'next/link';

export default function UploadPrescription() {
    const { data: session } = useSession();
    const { cartCount, toggleCart, addToCart } = useCart();
    const router = useRouter();
    
    const [imageUrl, setImageUrl] = useState("");
    const [status, setStatus] = useState("IDLE"); // IDLE, SCANNING, SUCCESS, ERROR
    const [extractedMeds, setExtractedMeds] = useState([]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result);
                simulateAIOCR();
            };
            reader.readAsDataURL(file);
        }
    };

    const simulateAIOCR = () => {
        setStatus("SCANNING");
        
        // Simulate AI processing time
        setTimeout(() => {
            // Mock extracted data
            const meds = [
                { id: '1', name: 'Augmentin 625 Duo Tablet', quantity: 1, price: 204.50 },
                { id: '2', name: 'Dolo 650 Tablet', quantity: 1, price: 30.00 },
                { id: '3', name: 'Pantocid DSR Capsule', quantity: 1, price: 140.00 }
            ];
            setExtractedMeds(meds);
            setStatus("SUCCESS");
        }, 2500);
    };

    const handleAddAllToCart = () => {
        extractedMeds.forEach(med => {
            addToCart({ ...med, isPrescriptionRequired: true });
        });
        alert("All medicines added to cart successfully!");
        toggleCart(true);
    };

    const handleSubmit = async () => {
        // Fallback for manual review if AI misses something
        const res = await fetch('/api/prescription/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imageUrl: imageUrl || "https://via.placeholder.com/300?text=Prescription",
                userId: session?.user?.id
            })
        });

        if (res.ok) {
            alert("Prescription submitted for manual pharmacist review.");
            router.push('/my-health-records/prescriptions');
        } else {
            alert("Failed to upload.");
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            
            <main className="flex-1" style={{ marginTop: '160px' }}>
                <div className="container mx-auto px-8 py-10 max-w-4xl">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                            <i className="fa-solid fa-wand-magic-sparkles" /> AI-Powered Reader
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter mb-4">
                            Upload <span className="text-indigo-600">Prescription</span>
                        </h1>
                        <p className="text-slate-500 font-medium max-w-xl mx-auto">
                            Upload your handwritten prescription and our Medical AI will instantly read and extract the medicines to pre-fill your cart.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left: Upload Area */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                            <label className="block mb-6">
                                <span className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2 block">Select Image</span>
                                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center cursor-pointer hover:bg-slate-50 hover:border-indigo-400 transition-all relative overflow-hidden group">
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
                                    
                                    {!imageUrl ? (
                                        <>
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-2xl mx-auto mb-4 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                                <i className="fa-solid fa-image" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-600 mb-1">Click or drag image here</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">JPG, PNG, PDF (Max 5MB)</p>
                                        </>
                                    ) : (
                                        <div className="relative z-10">
                                            <img src={imageUrl} alt="Prescription" className="w-full h-48 object-cover rounded-xl shadow-md opacity-50" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                 <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2 shadow-lg">
                                                     <i className="fa-solid fa-pen" /> Replace Image
                                                 </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Scanning Overlay */}
                                    {status === "SCANNING" && (
                                        <div className="absolute inset-0 bg-indigo-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20">
                                            <div className="w-full h-1 bg-indigo-500/30 absolute top-0 overflow-hidden">
                                                <div className="h-full bg-emerald-400 w-1/3 animate-[scanner_1.5s_ease-in-out_infinite]" />
                                            </div>
                                            <i className="fa-solid fa-robot text-4xl mb-4 animate-bounce" />
                                            <h3 className="text-sm font-black uppercase tracking-widest mb-2">Analyzing Handwriting</h3>
                                            <p className="text-xs text-indigo-200">Extracting medication data...</p>
                                        </div>
                                    )}
                                </div>
                            </label>

                            {!session && (
                                <div className="bg-amber-50 border border-amber-100 text-amber-700 p-4 rounded-xl text-xs font-bold flex items-start gap-3">
                                    <i className="fa-solid fa-triangle-exclamation text-base mt-0.5" />
                                    <div>
                                        <div className="uppercase tracking-widest font-black text-[10px] mb-1">Guest User</div>
                                        Please <Link href="/login" className="underline">login</Link> to permanently save this prescription to your ABDM health timeline.
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right: Results Area */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col">
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">
                                Extraction Results
                            </h2>

                            {status === "IDLE" && (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center">
                                    <i className="fa-solid fa-file-prescription text-4xl mb-4 opacity-50" />
                                    <p className="text-sm font-bold">Upload an image to see extracted medicines here.</p>
                                </div>
                            )}

                            {status === "SCANNING" && (
                                <div className="flex-1 flex flex-col items-center justify-center text-indigo-400 text-center">
                                    <i className="fa-solid fa-circle-notch fa-spin text-3xl mb-4" />
                                    <p className="text-sm font-bold">AI is reading the prescription...</p>
                                </div>
                            )}

                            {status === "SUCCESS" && (
                                <div className="flex-1 flex flex-col">
                                    <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-xs font-bold flex items-center gap-2 mb-6 border border-emerald-100">
                                        <i className="fa-solid fa-check-circle" /> Successfully extracted {extractedMeds.length} medicines.
                                    </div>
                                    
                                    <ul className="space-y-4 mb-8 flex-1">
                                        {extractedMeds.map((med, idx) => (
                                            <li key={idx} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                                <div>
                                                    <div className="font-black text-slate-900 text-sm mb-1">{med.name}</div>
                                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Qty: {med.quantity} • Est. ₹{med.price}</div>
                                                </div>
                                                <button 
                                                    onClick={() => addToCart({ ...med, isPrescriptionRequired: true })}
                                                    className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors shadow-sm"
                                                >
                                                    <i className="fa-solid fa-plus" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="flex flex-col gap-3">
                                        <button 
                                            onClick={handleAddAllToCart}
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/30 transition-all"
                                        >
                                            <i className="fa-solid fa-cart-shopping mr-2" /> Add All to Cart
                                        </button>
                                        <button 
                                            onClick={handleSubmit}
                                            className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                                        >
                                            Skip & Send for Manual Review
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            
            <Footer />
            
            <style jsx>{`
                @keyframes scanner {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(300%); }
                }
            `}</style>
        </div>
    );
}

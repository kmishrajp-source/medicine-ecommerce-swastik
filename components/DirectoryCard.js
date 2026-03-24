import { useSession } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { maskPhone } from "@/lib/security";
import VerifiedBadge from "./VerifiedBadge";

export default function DirectoryCard({ item, type, onBook }) {
    const { data: session } = useSession();
    
    const [isUnlocked, setIsUnlocked] = useState(data?.isUnlocked || false);
    
    // Using centralized masking for consistent security
    const displayPhone = (session && (isUnlocked || session.user.id === item.userId)) ? item.phone : maskPhone(item.phone);

    const handleUnlock = async () => {
        try {
            const res = await fetch('/api/payments/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: 50, // Standard 50 INR for unlock
                    type: 'contact_unlock',
                    targetId: item.id
                })
            });
            const { order } = await res.json();
            
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "Swastik Medicare",
                description: "Unlock Contact Details",
                order_id: order.id,
                handler: async (response) => {
                    const verifyRes = await fetch('/api/payments/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...response,
                            type: 'contact_unlock',
                            targetId: item.id,
                            amount: 50
                        })
                    });
                    if (verifyRes.ok) setIsUnlocked(true);
                }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error(err);
        }
    };

    const displayName = type === 'doctor' ? item.name : (type === 'hospital' ? item.name : item.shopName);
    const subText = type === 'doctor' ? item.specialization : (type === 'hospital' ? item.specialties : item.address);

    return (
        <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${type === 'doctor' ? 'bg-indigo-50 text-indigo-500' : (type === 'hospital' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500')}`}>
                    <i className={`fa-solid ${type === 'doctor' ? 'fa-user-doctor' : (type === 'hospital' ? 'fa-hospital' : 'fa-shop')}`}></i>
                </div>
                {item.verified && (
                    <VerifiedBadge timestamp={item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : undefined} />
                )}
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-1">{displayName}</h3>
            <div className="flex items-center gap-2 mb-4">
                <p className="text-sm text-slate-500 line-clamp-1">{subText}</p>
                {item.qualityScore > 0 && (
                    <span className="text-[10px] font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">
                        {item.qualityScore}% Trust
                    </span>
                )}
            </div>

            {/* Practo-style UX Metrics */}
            {type === 'doctor' && (
                <div className="flex items-center gap-4 mb-6 pt-4 border-t border-slate-50">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wait Time</span>
                        <span className="text-xs font-bold text-slate-800">{item.waitTime || '15 min'}</span>
                    </div>
                    <div className="h-8 w-px bg-slate-100"></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Feedback</span>
                        <span className="text-xs font-bold text-emerald-600 whitespace-nowrap"><i className="fa-solid fa-thumbs-up"></i> {item.recommendationRate || 95}%</span>
                    </div>
                </div>
            )}

            <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                    <i className="fa-solid fa-phone text-slate-400 w-4"></i>
                    {(session && (isUnlocked || session.user.id === item.userId)) ? (
                        <a href={`tel:${item.phone}`} className="font-bold text-slate-800 hover:text-blue-600">{displayPhone}</a>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-medium">{displayPhone}</span>
                            {session && (
                                <button 
                                    onClick={handleUnlock}
                                    className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Unlock
                                </button>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <i className="fa-solid fa-location-dot text-slate-400 w-4"></i>
                    <span className="text-slate-600 line-clamp-1">{type === 'doctor' ? (item.hospital || item.city) : item.address}</span>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                {!session ? (
                    <Link 
                        href="/login"
                        className="w-full bg-slate-100 text-slate-600 text-center font-bold py-3 rounded-xl text-sm hover:bg-slate-200 transition-all"
                    >
                        Login to View Contact
                    </Link>
                ) : (
                    <div className="flex gap-2">
                        <a 
                            href={`https://wa.me/${item.phone}`}
                            target="_blank"
                            className="flex-1 bg-green-500 text-white text-center font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2"
                        >
                            <i className="fa-brands fa-whatsapp"></i> WhatsApp
                        </a>
                        <a 
                            href={`tel:${item.phone}`}
                            className="bg-blue-600 text-white p-3 rounded-xl flex items-center justify-center"
                        >
                            <i className="fa-solid fa-phone"></i>
                        </a>
                    </div>
                )}
                <button 
                    onClick={() => onBook(item)}
                    className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl text-sm shadow-lg hover:shadow-slate-200 transition-all flex items-center justify-center gap-2"
                >
                    Book via Swastik <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </button>
            </div>
        </div>
    );
}

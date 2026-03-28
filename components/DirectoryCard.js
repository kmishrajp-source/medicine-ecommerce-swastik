import { useSession } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { maskPhone } from "@/lib/security";
import VerifiedBadge from "./VerifiedBadge";

export default function DirectoryCard({ item, type, onBook }) {
    const { data: session } = useSession();
    
    const [isUnlocked, setIsUnlocked] = useState(item?.isUnlocked || false);
    
    // Using centralized masking for consistent security
    // REMOVED session check for high-conversion directory listings
    const displayPhone = item.phone; 

    // ... (keep handleUnlock for legacy/other items if needed)

    const displayName = type === 'doctor' ? (item.doctorName || item.name) : (type === 'hospital' ? item.name : item.shopName || item.name);
    const subText = type === 'doctor' ? item.specialization : (type === 'hospital' ? item.specialties : item.address);

    return (
        <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all group relative overflow-hidden">
            {item.availableNow && (
                <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-emerald-200 z-10 animate-pulse">
                    <i className="fa-solid fa-circle-check mr-1 text-[8px]"></i> Available Now
                </div>
            )}
            
            <div className="flex justify-between items-start mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${type === 'doctor' ? 'bg-indigo-50 text-indigo-500' : (type === 'hospital' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500')}`}>
                    <i className={`fa-solid ${type === 'doctor' ? 'fa-user-doctor' : (type === 'hospital' ? 'fa-hospital' : 'fa-shop')}`}></i>
                </div>
                {item.verified ? (
                    <VerifiedBadge timestamp={item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : undefined} />
                ) : (
                    <div className="flex flex-col items-end gap-2">
                        <div className="bg-slate-100 text-slate-400 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md border border-slate-200">
                            <i className="fa-solid fa-circle-info mr-1"></i> Unverified
                        </div>
                        <Link href={`/join?claim=${item.id}&name=${encodeURIComponent(displayName)}`} className="bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100">
                            Claim this Profile
                        </Link>
                    </div>
                )}
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-1 leading-tight">{displayName}</h3>
            <div className="flex items-center gap-2 mb-4">
                <p className="text-sm font-bold text-slate-400 line-clamp-1">{subText}</p>
                {(item.qualityScore > 0 || item.rating > 0) && (
                    <span className="text-[10px] font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">
                        {item.qualityScore || (item.rating * 20)}% Trust
                    </span>
                )}
            </div>

            {/* Timings / Locality Info */}
             <div className="flex items-center gap-3 mb-6 bg-slate-50 p-3 rounded-2xl">
                  <div className="flex flex-col">
                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Experience</span>
                     <span className="text-[10px] font-black text-slate-800">{type === 'doctor' ? (item.experience ? `${item.experience} Years` : '10+ Years') : 'Gorakhpur'}</span>
                  </div>
                  <div className="h-6 w-px bg-slate-200"></div>
                  <div className="flex flex-col">
                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Rating</span>
                     <span className="text-[10px] font-black text-amber-500"><i className="fa-solid fa-star mr-1"></i>{item.rating || '4.5'}</span>
                  </div>
                  <div className="h-6 w-px bg-slate-200"></div>
                  <div className="flex flex-col">
                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">OPD Fee</span>
                     <span className="text-[10px] font-black text-indigo-600">₹{item.fee || item.consultationFee || '500'}</span>
                  </div>
             </div>

            <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                    <i className="fa-solid fa-phone text-slate-400 w-4"></i>
                    <a href={`tel:${item.phone}`} className="font-black text-slate-800 hover:text-indigo-600 tracking-tight">{displayPhone}</a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <i className="fa-solid fa-location-dot text-slate-400 w-4"></i>
                    <span className="text-slate-600 line-clamp-1 font-bold">{type === 'doctor' ? (item.hospital || item.address) : item.address}</span>
                </div>
            </div>

            {/* Attribution Badge */}
            <div className="flex items-center gap-1.5 mb-6 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md w-fit">
                <i className="fa-solid fa-shield-check text-indigo-400"></i> Verified Swastik Partner
            </div>

            <div className="grid grid-cols-2 gap-4">
                <a 
                    href={`https://wa.me/91${item.phone}?text=Hello, I found your listing on Swastik Medicare and want to connect.`}
                    target="_blank"
                    onClick={() => {
                        fetch('/api/analytics/track', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ type: 'whatsapp', targetId: item.id, targetType: type, area: item.locality })
                        });
                    }}
                    className="bg-emerald-500 text-white text-center font-black py-5 rounded-2xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all active:scale-95"
                >
                    <i className="fa-brands fa-whatsapp text-lg"></i> WhatsApp
                </a>
                <a 
                    href={`tel:${item.phone}`}
                    onClick={() => {
                        fetch('/api/analytics/track', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ type: 'call', targetId: item.id, targetType: type, area: item.locality })
                        });
                    }}
                    className="bg-slate-900 text-white text-center font-black py-5 rounded-2xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-slate-100 hover:bg-black transition-all active:scale-95"
                >
                    <i className="fa-solid fa-phone text-sm"></i> Call Now
                </a>
            </div>
        </div>
    );
}

"use client";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { maskPhone } from "@/lib/security";
import VerifiedBadge from "./VerifiedBadge";
import Image from "next/image";
import { trackEvent, ANALYTICS_EVENTS } from "@/lib/analytics";

export default function DirectoryCard({ item, type, onBook }) {
    const { data: session } = useSession();
    
    const [isUnlocked, setIsUnlocked] = useState(item?.isUnlocked || false);
    
    // Using centralized masking for consistent security
    // REMOVED session check for high-conversion directory listings
    const displayPhone = item.phone; 

    // ... (keep handleUnlock for legacy/other items if needed)

    const displayName = type === 'doctor' ? (item.doctorName || item.name) : (type === 'hospital' || type === 'lab' ? item.name : (type === 'ambulance' ? (item.driverName || 'Ambulance Service') : (item.shopName || item.name)));
    const subText = type === 'doctor' ? item.specialization : (type === 'hospital' ? item.specialties : (type === 'lab' ? item.address : (type === 'ambulance' ? `${item.vehicleType} Ambulance` : item.address)));

    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden flex flex-col h-full">
            {/* Top Badge Overlay */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

            {item.photoUrl && (
                <div className="relative w-full h-40 mb-6 rounded-2xl overflow-hidden shadow-inner bg-slate-100">
                    <Image src={item.photoUrl} alt={displayName} fill sizes="(max-width: 768px) 100vw, 300px" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                        <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                            {type === 'hospital' ? 'Facility' : (type === 'doctor' ? 'Consultant' : (type === 'lab' ? 'Diagnostic Center' : (type === 'ambulance' ? 'Emergency' : 'Verified Store')))}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-start mb-4">
                {!item.photoUrl && (
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${type === 'doctor' ? 'bg-indigo-50 text-indigo-500' : (type === 'hospital' ? 'bg-red-50 text-red-500' : (type === 'lab' ? 'bg-blue-50 text-blue-500' : (type === 'ambulance' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500')))}`}>
                        <i className={`fa-solid ${type === 'doctor' ? 'fa-user-doctor' : (type === 'hospital' ? 'fa-hospital' : (type === 'lab' ? 'fa-flask-vial' : (type === 'ambulance' ? 'fa-truck-medical' : 'fa-shop')))}`}></i>
                    </div>
                )}
                <div className="flex-1"></div>
                {item.verified ? (
                    <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-emerald-100 shadow-sm">
                        <i className="fa-solid fa-circle-check"></i> Verified
                    </div>
                ) : (
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-600 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-amber-100 shadow-sm">
                        <i className="fa-solid fa-triangle-exclamation"></i> Unverified
                    </div>
                )}
            </div>

            <div className="flex-1">
                <h3 className="text-xl font-black text-slate-900 mb-1 leading-tight group-hover:text-indigo-600 transition-colors">{displayName}</h3>
                <div className="flex items-center gap-2 mb-4">
                    <p className="text-xs font-bold text-slate-400 line-clamp-1">{subText}</p>
                    {item.verified && (
                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                            <i className="fa-solid fa-bolt-lightning text-[8px]"></i> Fast Response
                        </span>
                    )}
                </div>

                {/* Data Grid */}
                <div className="grid grid-cols-3 gap-2 mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex flex-col">
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">
                            {type === 'doctor' ? 'Experience' : (type === 'hospital' ? 'Type' : (type === 'lab' ? 'Samples' : (type === 'ambulance' ? 'Vehicle' : 'Delivery')))}
                        </span>
                        <span className="text-[10px] font-black text-slate-800 line-clamp-1">
                            {type === 'doctor' ? (item.experience ? `${item.experience} yrs` : '12+ yrs') : (type === 'hospital' ? 'Multi-Specialty' : (type === 'lab' ? 'Home Pickup' : (type === 'ambulance' ? item.vehicleType : 'Home Delivery')))}
                        </span>
                    </div>
                    <div className="flex flex-col border-l border-slate-200 pl-2">
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Rating</span>
                        <span className="text-[10px] font-black text-amber-500 flex items-center gap-0.5">
                            <i className="fa-solid fa-star text-[8px]"></i>{item.rating || '4.5'}
                        </span>
                    </div>
                    <div className="flex flex-col border-l border-slate-200 pl-2">
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">
                            {type === 'doctor' ? 'Fee' : (type === 'hospital' ? 'Status' : (type === 'ambulance' ? 'Rate' : 'Hours'))}
                        </span>
                        <span className="text-[10px] font-black text-indigo-600">
                            {type === 'doctor' ? `₹${item.consultationFee || 500}` : (type === 'ambulance' ? `₹${item.pricePerKm}/km` : (item.openingHours?.split(' ')[0] || '24/7'))}
                        </span>
                    </div>
                </div>

                <div className="space-y-2.5 mb-6 text-sm">
                    <div className="flex items-start gap-3">
                        <i className="fa-solid fa-phone text-slate-400 w-3 mt-1"></i>
                        <a href={`tel:${item.phone}`} className="font-bold text-slate-800 hover:text-indigo-600 transition-colors">{displayPhone}</a>
                    </div>
                    <div className="flex items-start gap-3">
                        <i className="fa-solid fa-location-dot text-slate-400 w-3 mt-1"></i>
                        <span className="text-slate-500 font-medium text-xs leading-relaxed line-clamp-2">{item.address}</span>
                    </div>
                </div>

                {type === 'doctor' && (
                    <Link 
                        href={`/doctors/${item.id}`}
                        className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 mb-6 hover:underline"
                    >
                        View Full Profile <i className="fa-solid fa-arrow-right-long"></i>
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-auto">
                <a 
                    href={`https://wa.me/91${item.phone?.replace(/[^0-9]/g, '')}?text=Hello, I am interested in ${displayName}. Found you on Swastik Medicare.`}
                    target="_blank"
                    onClick={() => trackEvent(ANALYTICS_EVENTS.CONTACT, { method: "whatsapp", target: displayName, type: type })}
                    className="bg-emerald-50 text-emerald-600 text-center font-black py-4 rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-600 hover:text-white transition-all active:scale-95 border border-emerald-100"
                >
                    <i className="fa-brands fa-whatsapp text-sm"></i> WhatsApp
                </a>
                <a 
                    href={`tel:${item.phone}`}
                    onClick={() => trackEvent(ANALYTICS_EVENTS.CONTACT, { method: "call", target: displayName, type: type })}
                    className="bg-slate-50 text-slate-900 text-center font-black py-4 rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-200 transition-all active:scale-95 border border-slate-200"
                >
                    <i className="fa-solid fa-phone text-[10px]"></i> Call Now
                </a>
                <button 
                    onClick={() => {
                        trackEvent(ANALYTICS_EVENTS.LEAD, { target: displayName, type: type });
                        onBook(item);
                    }} 
                    className="col-span-2 bg-indigo-600 text-white text-center font-black py-4 rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100 group"
                >
                    <i className="fa-solid fa-calendar-check text-sm group-hover:rotate-12 transition-transform"></i> 
                    {type === 'retailer' ? 'Order via Direct Message' : (type === 'ambulance' ? 'Request Emergency Pick' : 'Request Instant Callback')}
                </button>
            </div>

            {/* Module 6: Trust & Verification Reporting */}
            <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                 <a 
                    href={`https://wa.me/917992122974?text=Report Incorrect Info: ${displayName} (${type}) ID: ${item.id}`}
                    className="text-[8px] font-black text-slate-300 uppercase tracking-widest hover:text-rose-400 transition-colors flex items-center gap-1"
                 >
                    <i className="fa-solid fa-triangle-exclamation"></i> Report Incorrect Info
                 </a>
                 <div className="text-[8px] font-black text-slate-200 uppercase tracking-widest">
                    ID: {item.id.slice(-6)}
                 </div>
            </div>
        </div>
    );
}

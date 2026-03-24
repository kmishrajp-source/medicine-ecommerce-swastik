"use client";
import React from 'react';

export default function VerifiedBadge({ timestamp = new Date().toLocaleDateString(), pulse = true }) {
    return (
        <div className="group relative inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-100 transition-all hover:bg-emerald-600 hover:text-white cursor-help">
            {pulse && (
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
            )}
            {!pulse && <i className="fa-solid fa-circle-check text-[10px]"></i>}
            
            <span className="text-[10px] font-black uppercase tracking-widest">100% Verified Data</span>

            {/* Tooltip */}
            <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 bg-slate-900 text-white p-4 rounded-2xl text-[10px] font-bold opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-2xl z-50">
                <div className="flex items-center gap-2 mb-2 text-emerald-400">
                    <i className="fa-solid fa-shield-check"></i>
                    <span>Cross-Verified</span>
                </div>
                <p className="text-slate-400 leading-relaxed">This contact has been manually verified by our Gorakhpur field team on {timestamp}.</p>
                <div className="mt-2 pt-2 border-t border-white/10 uppercase tracking-tighter text-white/50">
                    ID: SW-AUTH-PRO
                </div>
                {/* Tooltip Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
            </div>
        </div>
    );
}

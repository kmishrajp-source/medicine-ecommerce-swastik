"use client";
import { useEffect, useState } from 'react';

export default function StatCounter({ end, label, icon }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const duration = 2000;
        const increment = end / (duration / 16);
        
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [end]);

    return (
        <div className="flex flex-col items-center p-6 bg-white rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-xl group">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                <i className={`fa-solid ${icon}`}></i>
            </div>
            <div className="text-4xl font-black text-slate-900 tracking-tighter mb-1">
                {count}+
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                {label}
            </div>
        </div>
    );
}

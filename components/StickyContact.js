"use client";

export default function StickyContact() {
    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
            {/* Pulsing Help Text */}
            <div className="bg-white px-4 py-2 rounded-2xl shadow-xl border border-indigo-100 text-[10px] font-black uppercase tracking-widest text-indigo-600 animate-pulse mb-2 whitespace-nowrap hidden md:block">
                Need help? Chat on WhatsApp
            </div>
            
            <a 
                href="https://wa.me/917992122974" 
                target="_blank"
                className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 border-4 border-white group transition-all hover:scale-110 active:scale-95"
            >
                <i className="fa-brands fa-whatsapp text-3xl"></i>
                <span className="absolute right-full mr-4 bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                   Chat with Support
                </span>
            </a>
            <a 
                href="tel:+917992122974" 
                className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-indigo-600/40 border-4 border-white group transition-all hover:scale-110 active:scale-95"
            >
                <i className="fa-solid fa-phone text-2xl"></i>
                <span className="absolute right-full mr-4 bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                   Call Emergency
                </span>
            </a>
        </div>
    );
}

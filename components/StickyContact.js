"use client";

export default function StickyContact() {
    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 md:hidden">
            {/* Mobile Only Sticky Buttons */}
            <a 
                href="https://wa.me/917992122974" 
                target="_blank"
                className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 border-4 border-white animate-bounce"
            >
                <i className="fa-brands fa-whatsapp text-2xl"></i>
            </a>
            <a 
                href="tel:+917992122974" 
                className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-indigo-600/40 border-4 border-white"
            >
                <i className="fa-solid fa-phone text-xl"></i>
            </a>
        </div>
    );
}

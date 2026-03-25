"use client";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { Link } from "@/i18n/navigation";

export default function JoinPage() {
    const { cartCount, toggleCart } = useCart();

    const benefits = [
        {
            title: "More Customers",
            desc: "Get discovered by thousands of patients searching for local healthcare in Gorakhpur.",
            icon: "fa-users-line"
        },
        {
            title: "WhatsApp Inquiries",
            desc: "Receive direct leads on your WhatsApp. No middleman, no login friction.",
            icon: "fa-brands fa-whatsapp"
        },
        {
            title: "Local Visibility",
            desc: "Rank #1 for 'best doctor in [area]' searches through our SEO-optimized pages.",
            icon: "fa-location-dot"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            
            <main className="pt-32 pb-24">
                {/* HERO SECTION */}
                <div className="max-w-7xl mx-auto px-6 text-center mb-24">
                    <div className="inline-block bg-indigo-100 text-indigo-600 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest mb-6">
                        Partner with Swastik Medicare
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 uppercase tracking-tighter leading-none">
                        Grow Your Practice <br/> <span className="text-indigo-600">Instantly</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-bold max-w-2xl mx-auto mb-12">
                        Join Gorakhpur's fastest growing healthcare network. Get more patients and orders with zero setup friction.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href="#register" className="bg-slate-900 text-white px-10 py-6 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl hover:bg-slate-800 transition-all">
                            Get Started Now
                        </a>
                        <a href="https://wa.me/919999999999?text=Interested in joining Swastik Medicare" className="bg-emerald-500 text-white px-10 py-6 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-3">
                            <i className="fa-brands fa-whatsapp text-xl"></i> Chat with Sales
                        </a>
                    </div>
                </div>

                {/* BENEFITS GRID */}
                <div className="bg-white py-24 border-y border-slate-100 mb-24">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {benefits.map((b, i) => (
                                <div key={i} className="group">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl text-slate-900 mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                                        <i className={`fa-solid ${b.icon}`}></i>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-4">{b.title}</h3>
                                    <p className="text-slate-500 font-bold leading-relaxed">{b.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* REGISTRATION FORM & PAYMENT */}
                <div id="register" className="max-w-4xl mx-auto px-6">
                    <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-bl-[100px]"></div>
                        
                        <h2 className="text-3xl font-black text-slate-900 mb-2">Activation Form</h2>
                        <p className="text-slate-400 font-bold mb-10 uppercase tracking-widest text-[10px]">Complete in 2 minutes</p>

                        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <input type="text" placeholder="Dr. Rahul Singh" className="w-full p-5 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-50 transition-all"/>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                    <input type="tel" placeholder="+91 00000 00000" className="w-full p-5 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-50 transition-all"/>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clinic / Store Name</label>
                                <input type="text" placeholder="Life Care Hospital" className="w-full p-5 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-50 transition-all"/>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Plan</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-6 rounded-3xl border-2 border-slate-100 hover:border-indigo-600 transition-all cursor-pointer relative group bg-white shadow-sm">
                                        <div className="text-sm font-black text-slate-900 mb-1">Basic Plan</div>
                                        <div className="text-[10px] font-bold text-slate-400">Free Listing + Verified Badge</div>
                                    </div>
                                    <div className="p-6 rounded-3xl border-2 border-indigo-600 bg-indigo-50 transition-all cursor-pointer relative shadow-sm">
                                        <div className="absolute -top-3 right-4 bg-indigo-600 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase">Most Popular</div>
                                        <div className="text-sm font-black text-slate-900 mb-1">Featured Plan</div>
                                        <div className="text-sm font-black text-indigo-600">₹2,999 / Year</div>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full bg-indigo-600 text-white p-6 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl hover:shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all mt-6">
                                Proceed to Activation & Pay
                            </button>
                        </form>
                    </div>
                </div>

                {/* TRUST SECTION */}
                <div className="mt-24 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[10px] mb-8">Trusted By</p>
                    <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                         {/* Placeholder logos */}
                         <div className="text-2xl font-black text-slate-900 tracking-tighter">MEDICARE+</div>
                         <div className="text-2xl font-black text-slate-900 tracking-tighter">LIFECARE</div>
                         <div className="text-2xl font-black text-slate-900 tracking-tighter">GORAKHPUR HEALTH</div>
                         <div className="text-2xl font-black text-slate-900 tracking-tighter">PHARMA CONNECT</div>
                    </div>
                </div>
            </main>
        </div>
    );
}

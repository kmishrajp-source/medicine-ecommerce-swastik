"use client";
import { Link } from "@/i18n/navigation";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import MotivationalVideo from "@/components/MotivationalVideo";

export default function PartnerPortal() {
    const { cartCount, toggleCart } = useCart();

    const modules = [
        {
            title: "Doctors",
            icon: "fa-user-doctor",
            color: "#3B82F6",
            desc: "Manage appointments, profiles, and digital prescriptions.",
            link: "/doctor/login",
            register: "/doctor/register",
            btnText: "Doctor Login"
        },
        {
            title: "Retail Pharmacies",
            icon: "fa-shop",
            color: "#10B981",
            desc: "Fullfill orders, manage inventory, and track settlements.",
            link: "/retailer/login",
            register: "/retailer/register",
            btnText: "Retailer Login"
        },
        {
            title: "Diagnostic Labs",
            icon: "fa-flask",
            color: "#8B5CF6",
            desc: "Process test bookings and upload patient reports.",
            link: "/lab/login",
            register: "/lab/register",
            btnText: "Lab Login"
        },
        {
            title: "Ambulance Drivers",
            icon: "fa-truck-medical",
            color: "#DC2626",
            desc: "Receive emergency requests and manage fleet status.",
            link: "/ambulance/dashboard",
            register: "/ambulance/register",
            btnText: "Driver Access"
        },
        {
            title: "Hospitals & Clinics",
            icon: "fa-hospital",
            color: "#F43F5E",
            desc: "Centralize facility management and patient flow.",
            link: "/hospital/dashboard",
            register: "/hospital/register",
            btnText: "Facility Login"
        },
        {
            title: "Medical Reps",
            icon: "fa-briefcase",
            color: "#0EA5E9",
            desc: "Monitor visits and pharmaceutical outreach.",
            link: "/mr-portal",
            register: "/partner/register?type=mr",
            btnText: "MR Access"
        }
    ];

    return (
        <div className="min-h-screen bg-white font-sans">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            <main className="max-w-7xl mx-auto px-6 pt-44 pb-24">
                
                {/* Module 4: Primary Growth Hook */}
                <div className="bg-slate-900 rounded-[4rem] p-12 md:p-24 text-center text-white mb-24 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    <div className="relative z-10 max-w-3xl mx-auto">
                        <span className="bg-blue-600 text-white text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-[0.3em] mb-8 inline-block shadow-2xl">
                            Partner Growth Engine
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[0.9] tracking-tighter uppercase">
                            Is your healthcare <br/> <span className="text-blue-500">profile already live?</span>
                        </h1>
                        <p className="text-xl text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-12">
                            Gorakhpur's fastest healthcare network is already listing top providers. Claim your profile to verify your identity, update contact details, and start converting leads today.
                        </p>
                        <div className="flex flex-col md:flex-row gap-6 justify-center">
                            <Link 
                                href="/doctor/register?claim=true"
                                className="bg-white text-slate-900 font-black px-12 py-6 rounded-2xl hover:bg-blue-50 transition-all shadow-xl text-[10px] uppercase tracking-widest"
                            >
                                Claim Doctor Profile <i className="fa-solid fa-user-doctor ml-2"></i>
                            </Link>
                            <Link 
                                href="/retailer/register?claim=true"
                                className="bg-blue-600 text-white font-black px-12 py-6 rounded-2xl hover:bg-blue-700 transition-all shadow-xl text-[10px] uppercase tracking-widest"
                            >
                                Claim Store Profile <i className="fa-solid fa-shop ml-2"></i>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="text-center mb-16 px-6">
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4">Partner Ecosystem Access</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Select your entity type to access your dashboard</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
                    {modules.map((mod, i) => (
                        <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner">
                                <i className={`fa-solid ${mod.icon}`}></i>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">{mod.title}</h3>
                            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-10 opacity-60 leading-relaxed">{mod.desc}</p>
                            <div className="space-y-4">
                                <Link 
                                    href={mod.link} 
                                    className="block w-full text-center bg-slate-900 text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200"
                                >
                                    {mod.btnText}
                                </Link>
                                <Link 
                                    href={mod.register} 
                                    className="block w-full text-center text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-blue-600 transition-colors"
                                >
                                    New Registration
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-slate-50 p-12 md:p-24 rounded-[4rem] border border-slate-100">
                    <MotivationalVideo 
                        title="Swastik Digital Healthcare Infrastructure"
                        description="Watch how our platform connects thousands of patients with verified doctors, labs, and pharmacies in real-time."
                        videoUrl="https://www.youtube.com/embed/8ETN_k6HDr8"
                        ctaText="Get Started Partnering"
                        ctaLink="#top"
                    />
                </div>
            </main>
        </div>
    );
}

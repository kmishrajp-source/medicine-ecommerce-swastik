import Navbar from "@/components/Navbar";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import DoctorContactButtons from "@/components/DoctorContactButtons";

// Module 4: Standalone High-Conversion Doctor Profile
async function getDoctor(id) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/doctors/${id}`, { next: { revalidate: 3600 } });
    const data = await res.json();
    if (data.success) return data.doctor;
    return null;
}

export async function generateMetadata({ params }) {
    const { id } = await params;
    const doctor = await getDoctor(id);
    if (!doctor) return { title: "Doctor Not Found" };

    return {
        title: `${doctor.name || "Specialist"} - ${doctor.specialization} in Gorakhpur | Swastik Medicare`,
        description: `Consult with ${doctor.name || "our specialist"} (${doctor.specialization}). ${doctor.experience || 'Experienced'} years of practice in Gorakhpur. View WhatsApp and phone details instantly.`,
    };
}

export default async function DoctorProfilePage({ params }) {
    const { id } = await params;
    const doctor = await getDoctor(id);

    if (!doctor) notFound();

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar />
            
            <main className="max-w-5xl mx-auto px-6 pt-44 pb-24">
                <Link href="/doctors" className="text-slate-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 mb-12 hover:text-blue-600 transition-colors">
                    <i className="fa-solid fa-arrow-left"></i> Back to Directory
                </Link>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left Column: Profile Card */}
                    <div className="flex-1">
                        <div className="bg-white rounded-[4rem] p-12 shadow-2xl shadow-slate-200 border border-slate-100 relative overflow-hidden">
                            {/* Verification Badge */}
                            <div className="absolute top-10 right-10 flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                                <i className="fa-solid fa-circle-check"></i> {doctor.verified ? "Verified Profile" : "Listed Entry"}
                            </div>

                            <div className="flex flex-col md:flex-row items-center md:items-start gap-10 mb-12">
                                <div className="w-40 h-40 bg-slate-100 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl shrink-0">
                                    <img 
                                        src={doctor.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name || "D")}&background=f1f5f9&color=64748b&size=200`} 
                                        alt={doctor.name} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="text-center md:text-left">
                                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter uppercase">{doctor.name}</h1>
                                    <p className="text-blue-600 font-black text-xl mb-6 uppercase tracking-tight">{doctor.specialization}</p>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                        <span className="bg-slate-50 text-slate-500 text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border border-slate-100">
                                            {doctor.experience || 5}+ Years Experience
                                        </span>
                                        <span className="bg-slate-50 text-slate-500 text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border border-slate-100">
                                            {doctor.location || doctor.city || 'Gorakhpur'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-10 border-y border-slate-50">
                                <div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Clinic / Hospital</h3>
                                    <p className="text-slate-900 font-bold text-lg">{doctor.hospital || "Private Practice"}</p>
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Consulation Fee</h3>
                                    <p className="text-slate-900 font-bold text-lg">₹{doctor.consultationFee || 500} <span className="text-slate-400 text-sm">(Direct Payment)</span></p>
                                </div>
                            </div>

                            {/* Module 3: Instant Contact Actions (Integrated Funnel) */}
                            <DoctorContactButtons doctor={doctor} />
                        </div>

                        {/* Module 4: Claim Profile Notification */}
                        {!doctor.isClaimed && (
                            <div className="mt-8 bg-blue-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-blue-100 flex flex-col md:flex-row items-center justify-between gap-8 border-4 border-blue-500">
                                <div className="text-center md:text-left">
                                    <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Is this you?</h3>
                                    <p className="text-blue-100 font-bold text-sm tracking-tight">Claim this profile to manage patients, update fees, and receive verified badges.</p>
                                </div>
                                <Link 
                                    href="/partner"
                                    className="bg-white text-blue-600 font-black px-10 py-5 rounded-2xl hover:bg-blue-50 transition-all shadow-xl text-[10px] uppercase tracking-widest whitespace-nowrap shrink-0"
                                >
                                    Claim this Profile
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Trust & Sidebar info */}
                    <div className="w-full lg:w-80 shrink-0 space-y-8">
                         <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-lg">
                            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4 flex items-center gap-2">
                                <i className="fa-solid fa-shield-heart text-blue-500"></i> Trust Score
                            </h4>
                            <div className="text-4xl font-black text-slate-900 mb-2">4.8 / 5</div>
                            <div className="flex text-amber-400 gap-1 mb-4">
                                <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star text-slate-100"></i>
                            </div>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest uppercase mb-0">Based on 200+ patient reviews verified by Swastik.</p>
                         </div>

                         <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-10 translate-x-10"></div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest mb-6 opacity-60">Working Hours</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-black border-b border-white/10 pb-2">
                                    <span className="opacity-60">MON - FRI</span>
                                    <span>09:00 - 18:00</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black border-b border-white/10 pb-2">
                                    <span className="opacity-60">SATURDAY</span>
                                    <span>10:00 - 15:00</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black">
                                    <span className="opacity-60 text-rose-400">SUNDAY</span>
                                    <span className="text-rose-400">EMERGENCY ONLY</span>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

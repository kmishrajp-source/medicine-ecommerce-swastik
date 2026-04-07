import Navbar from "@/components/Navbar";
import DirectoryCard from "@/components/DirectoryCard";
import { Link } from "@/i18n/navigation";

// Module 2: High-Performance Server Data Fetching for Area SEO
async function getAreaDoctors(area) {
    const decodedArea = decodeURIComponent(area).replace(/-/g, ' ');
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/doctors?area=${encodeURIComponent(decodedArea)}`, { next: { revalidate: 3600 } });
    const data = await res.json();
    if (data.success) {
        return data.doctors;
    }
    return [];
}

export async function generateMetadata({ params }) {
    const { area } = await params;
    const decodedArea = decodeURIComponent(area).replace(/-/g, ' ');
    const formattedArea = decodedArea.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    return {
        title: `Best Doctors in ${formattedArea}, Gorakhpur | Verified Specialists`,
        description: `Find top-rated doctors and clinics in ${formattedArea}. View phone numbers, WhatsApp, and consult instantly. No login required.`,
    };
}

export default async function AreaDoctorsPage({ params }) {
    const { area } = await params;
    const decodedArea = decodeURIComponent(area).replace(/-/g, ' ');
    const formattedArea = decodedArea.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    const doctors = await getAreaDoctors(area);

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar />
            
            <main className="max-w-7xl mx-auto px-6 pt-44 pb-24">
                <div className="mb-12">
                    <div className="inline-block bg-blue-100 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4">
                        Local Healthcare Directory
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-2 tracking-tighter uppercase">
                        Best Doctors in <span className="text-blue-600">{formattedArea}</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Verified local specialists and clinics near you in Gorakhpur.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {doctors.map(doctor => (
                        <DirectoryCard 
                            key={doctor.id} 
                            item={doctor} 
                            type="doctor" 
                        />
                    ))}
                    {doctors.length === 0 && (
                        <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm px-6">
                            <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-slate-200 text-4xl">
                                <i className="fa-solid fa-map-location-dot"></i>
                            </div>
                            <p className="text-2xl font-black text-slate-900 mb-4">No specialists found in {formattedArea} yet.</p>
                            <Link href="/doctors" className="text-blue-600 font-bold hover:underline uppercase tracking-widest text-xs">
                                View all doctors in Gorakhpur →
                            </Link>
                        </div>
                    )}
                </div>

                {/* Module 2: SEO Layer */}
                <section className="mt-32 pt-24 border-t border-slate-200">
                    <div className="max-w-3xl">
                        <h2 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-tighter">Finding the Right Doctor in {formattedArea}</h2>
                        <p className="text-slate-600 font-medium leading-relaxed mb-6">
                            Swastik Medicare helps you discover and connect with top-rated medical professionals located specifically in the {formattedArea} area of Gorakhpur. Our verified directory ensures you get accurate contact details including Phone and WhatsApp for instant communication.
                        </p>
                        <p className="text-slate-600 font-medium leading-relaxed">
                            No login is required to access doctor details. Simply browse the list, check verified badges, and click "Call Now" to book your consultation directly.
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}

import Navbar from "@/components/Navbar";
import DirectoryCard from "@/components/DirectoryCard";
import { Link } from "@/i18n/navigation";

// Module 2: High-Intent Area Pages for Medical Stores
async function getAreaStores(area) {
    const decodedArea = decodeURIComponent(area).replace(/-/g, ' ');
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/retailers?area=${encodeURIComponent(decodedArea)}`, { next: { revalidate: 3600 } });
    const data = await res.json();
    if (data.success) {
        return data.retailers;
    }
    return [];
}

export async function generateMetadata({ params }) {
    const { area } = await params;
    const decodedArea = decodeURIComponent(area).replace(/-/g, ' ');
    const formattedArea = decodedArea.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    return {
        title: `Best Medical Stores in ${formattedArea}, Gorakhpur | Swastik Medicare`,
        description: `Find verified medical stores, pharmacies, and chemists in ${formattedArea}. Get contact details, WhatsApp, and home delivery info without any login.`,
    };
}

export default async function AreaStoresPage({ params }) {
    const { area } = await params;
    const decodedArea = decodeURIComponent(area).replace(/-/g, ' ');
    const formattedArea = decodedArea.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    const stores = await getAreaStores(area);

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar />
            
            <main className="max-w-7xl mx-auto px-6 pt-44 pb-24">
                <div className="mb-12">
                    <div className="inline-block bg-emerald-100 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4">
                        Medicine Hub Directory
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-2 tracking-tighter uppercase">
                        Best Medical Stores in <span className="text-emerald-600">{formattedArea}</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Verified local pharmacies and chemists near you in Gorakhpur.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {stores.map(store => (
                        <DirectoryCard 
                            key={store.id} 
                            item={store} 
                            type="retailer" 
                        />
                    ))}
                    {stores.length === 0 && (
                        <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm px-6">
                            <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-slate-200 text-4xl">
                                <i className="fa-solid fa-store-slash"></i>
                            </div>
                            <p className="text-2xl font-black text-slate-900 mb-4">No partner stores in {formattedArea} yet.</p>
                            <p className="text-slate-400 font-bold mb-10">We are currently onboarding new pharmacies in this area.</p>
                            <Link href="/retailers" className="bg-slate-900 text-white font-black px-12 py-5 rounded-2xl hover:bg-black transition-all shadow-xl text-[10px] uppercase tracking-widest">
                                Browse all Gorakhpur Pharmacies
                            </Link>
                        </div>
                    )}
                </div>

                {/* Module 2: SEO Content Layer */}
                <section className="mt-32 pt-24 border-t border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-tighter">Trusted Medicine Delivery in {formattedArea}</h2>
                            <p className="text-slate-600 font-medium leading-relaxed mb-8">
                                Swastik Medicare connects you with the most reliable medical stores in {formattedArea}. Our directory is designed for speed—just find a store, click call or WhatsApp, and place your order. No login, no complicated forms, just direct healthcare commerce.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-lg"><i className="fa-solid fa-circle-check text-emerald-500"></i> Verified License</div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-lg"><i className="fa-solid fa-truck text-emerald-500"></i> Fast Home Delivery</div>
                            </div>
                        </div>
                        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                            <h3 className="text-xl font-black text-slate-900 mb-6">Are you a Chemist in {formattedArea}?</h3>
                            <p className="text-slate-500 font-medium text-sm mb-10 leading-relaxed">Join Gorakhpur's fastest-growing healthcare network and list your store for free to reach thousands of customers in your locality.</p>
                            <Link href="/partner" className="block w-full bg-emerald-600 text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-widest text-center hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100">
                                Register Your Store Now
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

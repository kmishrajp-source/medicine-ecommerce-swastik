import Link from 'next/link';
import prisma from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default async function TopBrandsPage() {
    // Fetch verified manufacturers and also extract unique brands from products
    const verifiedManufacturers = await prisma.manufacturer.findMany({
        where: { verified: true },
        select: {
            id: true,
            companyName: true,
            contactPerson: true,
            phone: true
        }
    });

    // We can also fetch the most popular brands from the products table
    const products = await prisma.product.findMany({
        select: { brand: true },
        where: { brand: { not: null } }
    });

    const brandCounts = products.reduce((acc, p) => {
        if (p.brand) {
            acc[p.brand] = (acc[p.brand] || 0) + 1;
        }
        return acc;
    }, {});

    const topProductBrands = Object.entries(brandCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([name, count]) => ({ name, count }));

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />

            <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-extrabold text-indigo-900 mb-4">Top Verified Brands</h1>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Discover trusted pharmaceutical manufacturers and the most popular medicine brands available on Swastik Medicare. All brands listed here are verified for quality and authenticity.
                    </p>
                </div>

                {verifiedManufacturers.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <i className="fa-solid fa-certificate text-emerald-500"></i> Verified Partners
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {verifiedManufacturers.map(m => (
                                <Link href={`/shop-medicines?search=${encodeURIComponent(m.companyName)}`} key={m.id}>
                                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-100 transition-all group">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-xl font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                {m.companyName.charAt(0)}
                                            </div>
                                            <span className="bg-emerald-50 text-emerald-600 text-xs px-2 py-1 rounded font-medium flex items-center gap-1">
                                                <i className="fa-solid fa-check-circle"></i> Verified
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-1">{m.companyName}</h3>
                                        {m.contactPerson && <p className="text-sm text-slate-500 mb-2">Contact: {m.contactPerson}</p>}
                                        <div className="text-sm text-indigo-600 font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                            View Products <i className="fa-solid fa-arrow-right text-xs"></i>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <i className="fa-solid fa-star text-orange-400"></i> Most Popular Brands
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {topProductBrands.map(b => (
                            <Link href={`/shop-medicines?search=${encodeURIComponent(b.name)}`} key={b.name}>
                                <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100 text-center hover:border-indigo-300 hover:shadow-md transition-all group">
                                    <h3 className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{b.name}</h3>
                                    <p className="text-xs text-slate-400 mt-1">{b.count} Products Available</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                    {topProductBrands.length === 0 && (
                        <div className="text-center py-10 bg-white rounded-lg border border-slate-100">
                            <p className="text-slate-500">More brands will be listed soon as our inventory grows.</p>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}

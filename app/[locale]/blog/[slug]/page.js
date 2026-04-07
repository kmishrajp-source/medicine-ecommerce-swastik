import Navbar from "@/components/Navbar";
import { Link } from "@/i18n/navigation";
import DirectoryCard from "@/components/DirectoryCard";

// SERVER-SIDE DATA FETCHING for Module 1 SEO
async function getBlogPost(slug) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/blog`, { next: { revalidate: 3600 } });
    const data = await res.json();
    if (data.success) {
        return data.posts.find(p => p.slug === slug);
    }
    return null;
}

async function getRelatedDoctors() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/doctors`, { next: { revalidate: 3600 } });
    const data = await res.json();
    if (data.success) {
        return data.doctors.slice(0, 3);
    }
    return [];
}

// Module 1: High-Performance Metadata Generation
export async function generateMetadata({ params }) {
    const { slug } = await params;
    const post = await getBlogPost(slug);
    
    if (!post) {
        return { title: "Blog Not Found | Swastik Medicare" };
    }

    return {
        title: `${post.metaTitle || post.title} | Swastik Medicare`,
        description: post.metaDescription || `Read ${post.title} on Swastik Medicare - Gorakhpur's fastest healthcare discovery platform.`,
        openGraph: {
            title: post.title,
            description: post.metaDescription,
            images: [post.featuredImage || "/medicine-bg.jpg"],
        }
    };
}

export default async function BlogDetailPage({ params }) {
    const { slug } = await params;
    const post = await getBlogPost(slug);
    const relatedDoctors = await getRelatedDoctors();

    if (!post) {
        return <div className="py-32 text-center text-red-500 font-black">Blog Post Not Found</div>;
    }

    return (
        <div className="min-h-screen bg-white font-sans">
            <Navbar />
            
            <article className="pt-44 pb-24">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="mb-12">
                        <Link href="/blog" className="text-blue-600 font-black text-xs uppercase tracking-widest flex items-center gap-2 mb-8 hover:underline">
                            <i className="fa-solid fa-arrow-left"></i> Back to Blog
                        </Link>
                        <span className="bg-indigo-100 text-indigo-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-6 inline-block">
                            {post.category || "General"}
                        </span>
                        <h1 className="text-4xl md:text-7xl font-black text-slate-900 mb-8 leading-tight tracking-tighter">
                            {post.title}
                        </h1>
                        <div className="flex items-center gap-6 border-y border-slate-100 py-6">
                            <div className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center font-black">
                                {post.author?.name ? post.author.name.charAt(0) : "S"}
                            </div>
                            <div>
                                <p className="text-slate-900 font-black text-sm">{post.author?.name || "Swastik Medical Expert"}</p>
                                <p className="text-slate-400 text-xs font-bold">{new Date(post.createdAt).toLocaleDateString()} • 5 min read</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-16 rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100">
                        <img 
                            src={post.featuredImage || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80"} 
                            alt={post.title}
                            className="w-full h-auto object-cover"
                        />
                    </div>

                    <div className="prose prose-slate prose-xl max-w-none mb-24 font-medium text-slate-700 leading-relaxed whitespace-pre-line">
                        {post.content}
                    </div>

                    {/* High-Conversion CTA Layer (Module 3) */}
                    <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 text-center text-white mb-24 shadow-2xl shadow-slate-200 relative overflow-hidden group border border-slate-800">
                        <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <div className="relative z-10">
                            <h3 className="text-3xl md:text-4xl font-black mb-6 uppercase tracking-tight">Need Expert <span className="text-blue-500">Medical Advice?</span></h3>
                            <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto font-bold uppercase tracking-widest text-[10px]">
                                Connect with top-rated specialists in Gorakhpur instantly. No registration. No wait.
                            </p>
                            <div className="flex flex-col md:flex-row gap-6 justify-center">
                                <a href="tel:9161364908" className="bg-white text-slate-900 font-black px-12 py-5 rounded-2xl hover:bg-slate-50 transition-all shadow-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-3">
                                    <i className="fa-solid fa-phone-volume"></i> Call Specialist Now
                                </a>
                                <a href="https://wa.me/917992122974" className="bg-emerald-500 text-white font-black px-12 py-5 rounded-2xl hover:bg-emerald-600 transition-all shadow-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-3">
                                    <i className="fa-brands fa-whatsapp"></i> Chat on WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Related Doctors Section (Module 1/10 Requirement) */}
                    <div className="border-t border-slate-100 pt-24">
                        <h2 className="text-4xl font-black text-slate-900 mb-6 flex items-center gap-4 tracking-tighter">
                            RECOMMENDED SERVICES
                        </h2>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-12 italic">Top-rated doctors relevant to this topic</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {relatedDoctors.map(doctor => (
                                <DirectoryCard 
                                    key={doctor.id} 
                                    item={doctor} 
                                    type="doctor" 
                                />
                            ))}
                        </div>
                        <div className="text-center mt-16">
                            <Link href="/doctors" className="bg-slate-50 text-slate-400 font-black px-12 py-5 rounded-2xl hover:bg-slate-100 transition-all text-[10px] uppercase tracking-widest inline-flex items-center gap-3 border border-slate-100">
                                View Full Medical Directory <i className="fa-solid fa-arrow-right"></i>
                            </Link>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
}

"use client";
import { useState, useEffect, use } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { Link } from "@/i18n/navigation";
import DirectoryCard from "@/components/DirectoryCard";

export default function BlogDetailPage({ params }) {
    const { slug } = use(params);
    const { cartCount, toggleCart } = useCart();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [relatedDoctors, setRelatedDoctors] = useState([]);

    useEffect(() => {
        fetchPost();
        fetchRelatedDoctors();
    }, [slug]);

    const fetchPost = async () => {
        try {
            // Note: In production we would build a dedicated GET /api/blog/[slug]
            const res = await fetch('/api/blog');
            const data = await res.json();
            if (data.success) {
                const found = data.posts.find(p => p.slug === slug);
                setPost(found);
            }
        } catch (error) {
            console.error("Failed to fetch blog post:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedDoctors = async () => {
        try {
            const res = await fetch('/api/doctors');
            const data = await res.json();
            if (data.success) {
                // Return top 3 doctors for simplicity
                setRelatedDoctors(data.doctors.slice(0, 3));
            }
        } catch (error) {
            console.error("Failed to fetch related doctors:", error);
        }
    };

    if (loading) return <div className="py-32 text-center text-slate-400"><i className="fa-solid fa-spinner fa-spin text-4xl"></i></div>;
    if (!post) return <div className="py-32 text-center text-red-500 font-black">Blog Post Not Found</div>;

    return (
        <div className="min-h-screen bg-white font-sans">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            
            {/* Meta Tags for SEO (Client-side simulation) */}
            <title>{post.metaTitle || post.title}</title>
            <meta name="description" content={post.metaDescription} />

            <article className="pt-32 pb-24">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="mb-12">
                        <Link href="/blog" className="text-blue-600 font-black text-xs uppercase tracking-widest flex items-center gap-2 mb-8 hover:underline">
                            <i className="fa-solid fa-arrow-left"></i> Back to Blog
                        </Link>
                        <span className="bg-indigo-100 text-indigo-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-6 inline-block">
                            {post.category || "General"}
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 leading-tight">
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

                    <div className="mb-16 rounded-[3rem] overflow-hidden shadow-2xl">
                        <img 
                            src={post.featuredImage || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80"} 
                            alt={post.title}
                            className="w-full h-auto object-cover"
                        />
                    </div>

                    <div className="prose prose-slate prose-xl max-w-none mb-24 font-medium text-slate-700 leading-relaxed whitespace-pre-line">
                        {post.content}
                    </div>

                    {/* High-Conversion CTA Layer */}
                    <div className="bg-blue-600 rounded-[3rem] p-10 md:p-16 text-center text-white mb-24 shadow-2xl shadow-blue-200 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-700/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <div className="relative z-10">
                            <h3 className="text-3xl md:text-4xl font-black mb-6">Need Medical Advice?</h3>
                            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto font-medium">
                                Connect with top-rated specialists in Gorakhpur instantly via WhatsApp or Call. No registration required.
                            </p>
                            <div className="flex flex-col md:flex-row gap-6 justify-center">
                                <a href="tel:9161364908" className="bg-white text-blue-600 font-black px-12 py-5 rounded-2xl hover:bg-slate-50 transition-all shadow-xl shadow-blue-900/20 text-[10px] uppercase tracking-widest flex items-center justify-center gap-3">
                                    <i className="fa-solid fa-phone"></i> Call Helper Now
                                </a>
                                <a href="https://wa.me/919161364908" className="bg-emerald-500 text-white font-black px-12 py-5 rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-900/20 text-[10px] uppercase tracking-widest flex items-center justify-center gap-3">
                                    <i className="fa-brands fa-whatsapp"></i> Chat on WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Related Doctors Section (Module 1 Requirement) */}
                    <div className="border-t border-slate-100 pt-24">
                        <h2 className="text-4xl font-black text-slate-900 mb-12 flex items-center gap-4">
                            <i className="fa-solid fa-user-doctor text-blue-600"></i> Best Doctors Recommended for You
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {relatedDoctors.map(doctor => (
                                <DirectoryCard 
                                    key={doctor.id} 
                                    item={doctor} 
                                    type="doctor" 
                                    onBook={() => {}}
                                />
                            ))}
                        </div>
                        <div className="text-center mt-16">
                            <Link href="/doctors" className="bg-slate-900 text-white font-black px-12 py-5 rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-200 text-[10px] uppercase tracking-widest inline-flex items-center gap-3">
                                View Gorakhpur Doctor Directory <i className="fa-solid fa-arrow-right"></i>
                            </Link>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
}

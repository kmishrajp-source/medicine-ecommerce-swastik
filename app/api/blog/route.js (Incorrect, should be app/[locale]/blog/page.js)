"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { Link } from "@/i18n/navigation";

export default function BlogListingPage() {
    const { cartCount, toggleCart } = useCart();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await fetch('/api/blog');
            const data = await res.json();
            if (data.success) {
                setPosts(data.posts);
            }
        } catch (error) {
            console.error("Failed to fetch blog posts:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            
            <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
                <div className="text-center mb-16">
                    <div className="inline-block bg-indigo-100 text-indigo-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-6 shadow-sm border border-indigo-50">
                        Swastik Medicare Health Hub
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                        Insights for a <span className="text-blue-600">Healthier You</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                        Expert health tips, disease guides, and local healthcare discovery in Gorakhpur.
                    </p>
                </div>

                {loading ? (
                    <div className="py-32 text-center text-slate-400">
                        <i className="fa-solid fa-spinner fa-spin text-4xl"></i>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {posts.map((post) => (
                            <Link 
                                key={post.id} 
                                href={`/blog/${post.slug}`}
                                className="group bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-200/40 transition-all duration-500 border border-slate-100 flex flex-col hover:-translate-y-2"
                            >
                                <div className="h-64 overflow-hidden relative">
                                    <img 
                                        src={post.featuredImage || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80"} 
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute top-6 left-6">
                                        <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest shadow-lg">
                                            {post.category || "General"}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-8 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 text-slate-400 text-xs font-bold mb-4">
                                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                            <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                                            <span>5 min read</span>
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900 mb-4 leading-snug group-hover:text-blue-600 transition-colors">
                                            {post.title}
                                        </h2>
                                        <p className="text-slate-500 line-clamp-3 font-medium leading-relaxed mb-6">
                                            {post.metaDescription || "Read more about this important health topic from Swastik Medicare experts."}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                        <span className="text-sm font-black text-slate-900">Read Article</span>
                                        <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors shadow-lg">
                                            <i className="fa-solid fa-arrow-right"></i>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {posts.length === 0 && !loading && (
                    <div className="py-32 text-center">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 text-4xl">
                            <i className="fa-solid fa-feather-pointed"></i>
                        </div>
                        <p className="text-xl font-black text-slate-400">No blog posts found.</p>
                    </div>
                )}
            </main>

            {/* Newsletter CTA */}
            <section className="bg-slate-900 py-24 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -ml-48 -mb-48"></div>
                
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-4xl font-black text-white mb-6">Subscribe for Health Updates</h2>
                    <p className="text-indigo-200 font-medium text-lg mb-10 opacity-80">
                        Get the latest health tips and doctor guides directly in your inbox.
                    </p>
                    <form className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                        <input 
                            type="email" 
                            placeholder="Enter your email address" 
                            className="flex-1 p-5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                        />
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-black px-10 py-5 rounded-2xl transition-all shadow-xl shadow-blue-900/40">
                            Join Now
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
}

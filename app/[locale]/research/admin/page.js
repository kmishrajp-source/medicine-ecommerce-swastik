"use client";
import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import toast from 'react-hot-toast';

export default function ResearchAdminDashboard() {
    const { cartCount, toggleCart } = useCart();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch('/api/research/admin/projects');
                const data = await res.json();
                
                if (res.status === 403) {
                    toast.error("Unauthorized. Admin access required.");
                    setLoading(false);
                    return;
                }
                
                if (data.success) {
                    setProjects(data.data);
                } else {
                    toast.error(data.error || "Failed to load projects");
                }
            } catch (error) {
                console.error("Error fetching projects:", error);
                toast.error("An error occurred loading dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const getStatusBadge = (status) => {
        switch(status) {
            case 'NEW_INQUIRY': return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">New Inquiry</span>;
            case 'PROPOSAL': return <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">Proposal Sent</span>;
            case 'ACTIVE': return <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">Active</span>;
            case 'COMPLETED': return <span className="bg-slate-100 text-slate-800 text-xs font-bold px-3 py-1 rounded-full">Completed</span>;
            default: return <span className="bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1 rounded-full">{status}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            {/* Header */}
            <div className="bg-slate-900 pt-28 pb-10 px-6 text-white border-b-4 border-indigo-500">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-black mb-2 flex items-center">
                        <i className="fa-solid fa-server text-indigo-400 mr-3"></i> 
                        Research & Bioinformatics Admin
                    </h1>
                    <p className="text-slate-400">Manage incoming research proposals, datasets, and bioinformatics inquiries.</p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-800">Recent Project Submissions</h2>
                        <span className="text-sm font-medium text-slate-500">{projects.length} Total</span>
                    </div>

                    {loading ? (
                        <div className="p-10 text-center text-slate-500">
                            <i className="fa-solid fa-circle-notch fa-spin text-3xl mb-3 text-indigo-500"></i>
                            <p>Loading projects...</p>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="p-10 text-center text-slate-500">
                            <i className="fa-solid fa-folder-open text-4xl mb-3 text-slate-300"></i>
                            <p>No research projects found.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4">Project Title</th>
                                        <th className="px-6 py-4">Organization</th>
                                        <th className="px-6 py-4">Contact</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projects.map((project) => (
                                        <tr key={project.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900 max-w-xs truncate">
                                                {project.title}
                                                <div className="text-xs text-slate-400 font-normal mt-1">{project.researchArea}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {project.organization?.name}
                                                <div className="text-xs text-slate-400 mt-1">{project.organization?.type}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {project.contact?.name}
                                                <div className="text-xs text-indigo-500 mt-1">{project.contact?.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(project.status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {new Date(project.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-indigo-600 hover:text-indigo-900 font-medium text-xs bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}

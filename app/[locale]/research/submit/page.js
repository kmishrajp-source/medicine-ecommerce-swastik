"use client";
import React, { useState } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function ResearchSubmitPage() {
    const { cartCount, toggleCart } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        projectTitle: '',
        researchArea: '',
        objective: '',
        problemStatement: '',
        budgetRange: '',
        deadline: '',
        organizationName: '',
        organizationType: 'University',
        country: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        position: '',
        hasDataset: false,
        datasetType: '',
        datasetSize: '',
        needsLabWork: false,
        needsClinical: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/research/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (data.success) {
                toast.success("Research Project Submitted Successfully!");
                router.push('/en/research');
            } else {
                toast.error(data.error || "Failed to submit project.");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            {/* Header */}
            <div className="bg-indigo-900 pt-32 pb-16 px-6 text-center text-white relative">
                <h1 className="text-3xl md:text-5xl font-black mb-4">Submit a Research Project</h1>
                <p className="text-indigo-200 max-w-2xl mx-auto">
                    Partner with Swastik AI for advanced bioinformatics, data intelligence, and computational research services.
                </p>
            </div>

            {/* Main Form */}
            <main className="max-w-4xl mx-auto px-6 py-12 relative z-20 -mt-10">
                <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100">
                    
                    {/* Organization Details */}
                    <div className="mb-10">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center border-b pb-2">
                            <i className="fa-solid fa-building text-indigo-500 mr-3"></i> Organization Details
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Organization Name *</label>
                                <input required type="text" name="organizationName" value={formData.organizationName} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="E.g., Oxford University" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Organization Type</label>
                                <select name="organizationType" value={formData.organizationType} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none">
                                    <option value="University">University / Academic</option>
                                    <option value="Hospital">Hospital / Clinical</option>
                                    <option value="Biotech">Biotech Startup</option>
                                    <option value="Pharma">Pharmaceuticals</option>
                                    <option value="Research Institute">Research Institute</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Country</label>
                                <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Contact Details */}
                    <div className="mb-10">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center border-b pb-2">
                            <i className="fa-solid fa-address-card text-emerald-500 mr-3"></i> Principal Investigator / Contact
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Full Name *</label>
                                <input required type="text" name="contactName" value={formData.contactName} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Position / Title</label>
                                <input type="text" name="position" value={formData.position} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="E.g., Lead Researcher" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Official Email *</label>
                                <input required type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Phone Number</label>
                                <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Project Details */}
                    <div className="mb-10">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center border-b pb-2">
                            <i className="fa-solid fa-flask text-purple-500 mr-3"></i> Project Specifications
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Project Title *</label>
                                <input required type="text" name="projectTitle" value={formData.projectTitle} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Primary Objective *</label>
                                <textarea required name="objective" value={formData.objective} onChange={handleChange} rows="3" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Problem Statement</label>
                                <textarea name="problemStatement" value={formData.problemStatement} onChange={handleChange} rows="3" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Research Area</label>
                                <select name="researchArea" value={formData.researchArea} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none">
                                    <option value="">Select Area</option>
                                    <option value="Genomics">Genomics / Transcriptomics</option>
                                    <option value="Oncology">Oncology / Cancer Research</option>
                                    <option value="Drug Discovery">Drug Discovery / Target ID</option>
                                    <option value="Clinical Data">Clinical Data Analytics</option>
                                    <option value="Medical AI">Medical AI / NLP</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Estimated Budget Range</label>
                                <select name="budgetRange" value={formData.budgetRange} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none">
                                    <option value="">Select Budget</option>
                                    <option value="< $10,000">Less than $10,000</option>
                                    <option value="$10,000 - $50,000">$10,000 - $50,000</option>
                                    <option value="$50,000 - $250,000">$50,000 - $250,000</option>
                                    <option value="> $250,000">More than $250,000</option>
                                    <option value="To be determined">To be determined</option>
                                </select>
                            </div>
                        </div>

                        {/* Requirements Toggles */}
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                            <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wider">Additional Requirements</h3>
                            
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" name="hasDataset" checked={formData.hasDataset} onChange={handleChange} className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                                <span className="text-slate-700 font-medium">We have an existing dataset to provide</span>
                            </label>
                            
                            {formData.hasDataset && (
                                <div className="ml-8 grid md:grid-cols-2 gap-4 mt-2">
                                    <input type="text" name="datasetType" value={formData.datasetType} onChange={handleChange} placeholder="Dataset Type (e.g., FASTQ, VCF)" className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                                    <input type="text" name="datasetSize" value={formData.datasetSize} onChange={handleChange} placeholder="Estimated Size (e.g., 500GB)" className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                                </div>
                            )}

                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" name="needsLabWork" checked={formData.needsLabWork} onChange={handleChange} className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                                <span className="text-slate-700 font-medium">Project requires physical laboratory work/testing</span>
                            </label>

                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" name="needsClinical" checked={formData.needsClinical} onChange={handleChange} className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                                <span className="text-slate-700 font-medium">Project involves clinical data/patients (requires ethics review)</span>
                            </label>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <><i className="fa-solid fa-circle-notch fa-spin"></i> Submitting...</>
                        ) : (
                            <>Submit Project Proposal <i className="fa-solid fa-paper-plane"></i></>
                        )}
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-4">
                        All submissions are strictly confidential. A research consultant will contact you within 48 hours.
                    </p>
                </form>
            </main>

            <Footer />
        </div>
    );
}

"use client";

import React, { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";

export default function BioinformaticsHub() {
    const { data: session } = useSession() || {};
    const { cartCount, toggleCart } = useCart();

    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStep, setUploadStep] = useState("");
    const [selectedTab, setSelectedTab] = useState("datasets"); // datasets, upload, insights, abha

    const [userDatasets, setUserDatasets] = useState([]);
    const [pollingJobs, setPollingJobs] = useState(new Set());

    useEffect(() => {
        if (session?.user) {
            fetchDatasets();
        }
    }, [session]);

    const fetchDatasets = async () => {
        try {
            const res = await fetch('/api/bio/bioinformatics/datasets');
            const data = await res.json();
            if (data.success) {
                setUserDatasets(data.datasets);
                
                // If any datasets are still processing, ensure we're polling them
                const processingDatasets = data.datasets.filter(d => d.status !== 'PROCESSED' && d.status !== 'FAILED' && d.jobId);
                processingDatasets.forEach(d => {
                    if (!pollingJobs.has(d.jobId)) {
                        pollJob(d.jobId);
                    }
                });
            }
        } catch (e) {
            console.error('Failed to fetch datasets:', e);
        }
    };

    const pollJob = (jobId) => {
        setPollingJobs(prev => new Set(prev).add(jobId));
        
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/bio/bioinformatics/job/${jobId}`);
                const data = await res.json();
                
                if (data.success) {
                    // Update dataset in state
                    setUserDatasets(prev => prev.map(ds => {
                        if (ds.jobId === jobId) {
                            return { ...ds, progress: data.progress, pipelineStage: data.stage, status: data.status };
                        }
                        return ds;
                    }));

                    // Also update upload UI if it's the current upload
                    setUploadProgress(data.progress);
                    setUploadStep(`Running Pipeline: ${data.stage}...`);

                    if (data.progress >= 100) {
                        clearInterval(interval);
                        setPollingJobs(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(jobId);
                            return newSet;
                        });
                        setUploadStep("Data Bank Ingestion Complete!");
                        setTimeout(() => {
                            setUploading(false);
                            setSelectedTab("datasets");
                            fetchDatasets(); // Refresh final state
                        }, 1000);
                    }
                }
            } catch (e) {
                console.error('Polling error:', e);
            }
        }, 1500);
    };

    const handleFileUploadSimulation = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setUploadProgress(5);
        setUploadStep("Uploading file securely...");

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/bio/bioinformatics/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.success) {
                setUploadStep("Initializing Bioinformatics Pipeline...");
                // Add temp entry to UI
                setUserDatasets(prev => [{
                    id: data.datasetId,
                    fileName: file.name,
                    type: file.name.endsWith('.vcf') ? 'GENOMIC_VCF' : file.name.endsWith('.fastq') ? 'RAW_FASTQ' : 'LAB_REPORT',
                    fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                    uploadedAt: new Date().toISOString().split('T')[0],
                    status: 'QUEUED',
                    jobId: data.jobId,
                    progress: 0,
                    pipelineStage: 'INITIALIZING'
                }, ...prev]);

                pollJob(data.jobId);
            } else {
                alert(data.error || 'Upload failed');
                setUploading(false);
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again.');
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            <main className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Back Link & Header */}
                <div className="mb-8 flex items-center justify-between">
                    <Link href="/bio" className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-2 text-sm bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
                        <span>←</span> Back to Bio-Health Hub
                    </Link>

                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-xs font-mono font-bold text-emerald-400">ENGINE ONLINE v6.4</span>
                    </div>
                </div>

                {/* Hero Header */}
                <div className="mb-12 text-center max-w-4xl mx-auto">
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block">
                        🧬 Computational Biology & Genomic Data Bank
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-white">
                        💻 Swastik Bioinformatics Engine
                    </h1>
                    <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
                        A future-ready computational biology layer for processing laboratory data, genomic datasets (FASTQ, BAM, VCF), and molecular diagnostic reports.
                    </p>
                </div>

                {/* AUTHENTICATION GATE */}
                {!session ? (
                    <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-10 md:p-16 text-center max-w-2xl mx-auto shadow-2xl space-y-6">
                        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl flex items-center justify-center text-4xl text-emerald-400 mx-auto">
                            <i className="fa-solid fa-lock"></i>
                        </div>
                        <h2 className="text-2xl font-black text-white">Authorization Required / लॉगिन आवश्यक है</h2>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            To access your personal Genomic Data Bank, upload lab reports (FASTQ/VCF), and view computational biology insights, please sign in to your Swastik Medicare account.
                        </p>
                        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/login" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-8 py-4 rounded-full text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20">
                                Login to Data Bank / लॉगिन करें
                            </Link>
                            <Link href="/signup" className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-8 py-4 rounded-full text-xs uppercase tracking-widest transition-all">
                                Create Account / खाता बनाएं
                            </Link>
                        </div>
                    </div>
                ) : (
                    /* LOGGED-IN CUSTOMER DATA BANK WORKSPACE */
                    <div className="space-y-8">
                        {/* User Identity Bar */}
                        <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xl">
                                    {session.user?.name ? session.user.name.charAt(0) : 'U'}
                                </div>
                                <div>
                                    <h3 className="font-black text-white text-lg">{session.user?.name || 'Authorized Customer'}</h3>
                                    <p className="text-xs text-slate-400 font-mono">{session.user?.email} • Patient Data Vault ID: #BD-{session.user?.id ? session.user.id.slice(-6) : '8849'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                                    <i className="fa-solid fa-shield-halved"></i> ABHA Linked: 91-8821-4401-9921
                                </span>
                            </div>
                        </div>

                        {/* Workspace Navigation Tabs */}
                        <div className="flex gap-3 overflow-x-auto pb-2 border-b border-slate-800">
                            <button
                                onClick={() => setSelectedTab("datasets")}
                                className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${selectedTab === "datasets" ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" : "bg-slate-800 text-slate-400 hover:text-white"}`}
                            >
                                <i className="fa-solid fa-database mr-2"></i> My Data Bank ({userDatasets.length})
                            </button>
                            <button
                                onClick={() => setSelectedTab("upload")}
                                className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${selectedTab === "upload" ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" : "bg-slate-800 text-slate-400 hover:text-white"}`}
                            >
                                <i className="fa-solid fa-cloud-arrow-up mr-2"></i> Upload Dataset (FASTQ / VCF / PDF)
                            </button>
                            <button
                                onClick={() => setSelectedTab("insights")}
                                className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${selectedTab === "insights" ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" : "bg-slate-800 text-slate-400 hover:text-white"}`}
                            >
                                <i className="fa-solid fa-dna mr-2"></i> AI Pharmacogenomic Insights
                            </button>
                        </div>

                        {/* TAB 1: MY DATASETS REPOSITORY */}
                        {selectedTab === "datasets" && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {userDatasets.length === 0 ? (
                                        <div className="col-span-full text-center py-10 text-slate-400">
                                            No datasets found. Upload your first genomic file to get started.
                                        </div>
                                    ) : (
                                        userDatasets.map((dataset) => (
                                            <div key={dataset.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition-colors flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                                                                dataset.type === 'GENOMIC_VCF' ? 'bg-purple-500/20 text-purple-400' :
                                                                dataset.type === 'RAW_FASTQ' ? 'bg-blue-500/20 text-blue-400' :
                                                                'bg-emerald-500/20 text-emerald-400'
                                                            }`}>
                                                                {dataset.type === 'GENOMIC_VCF' ? '🧬' : dataset.type === 'RAW_FASTQ' ? '🔬' : '📊'}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-white text-sm line-clamp-1 break-all" title={dataset.fileName}>{dataset.fileName}</div>
                                                                <div className="text-[10px] text-slate-400 flex gap-2 mt-1 font-bold">
                                                                    <span>{dataset.type}</span>
                                                                    <span>•</span>
                                                                    <span>{dataset.fileSize}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className={`px-2.5 py-1 rounded-md text-[9px] font-black tracking-wider uppercase border ${
                                                            dataset.status === 'PROCESSED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                                                            dataset.status === 'FAILED' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                                                            'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                                        }`}>
                                                            {dataset.status === 'PROCESSED' ? 'PROCESSED' : dataset.pipelineStage || 'PROCESSING'}
                                                        </span>
                                                    </div>

                                                    {dataset.status !== 'PROCESSED' && dataset.status !== 'FAILED' && (
                                                        <div className="mt-2 mb-4">
                                                            <div className="flex justify-between text-[10px] font-bold text-amber-400/80 mb-1">
                                                                <span>{dataset.pipelineStage}</span>
                                                                <span>{dataset.progress}%</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-slate-700/50 rounded-full overflow-hidden">
                                                                <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${dataset.progress}%` }}></div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {dataset.aiSummary && (
                                                        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/50 space-y-1.5 mt-2">
                                                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                                                                <i className="fa-solid fa-microchip"></i> AI Computation Summary
                                                            </span>
                                                            <p className="text-xs text-slate-300 font-medium leading-relaxed">{dataset.aiSummary}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="pt-4 flex gap-2 mt-4 border-t border-slate-700/50">
                                                    <button onClick={() => alert(`Downloading normalized payload for ${dataset.fileName}...`)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition-colors">
                                                        <i className="fa-solid fa-download"></i> Payload
                                                    </button>
                                                    <button onClick={() => alert(`Full Diagnostic Report View: ${dataset.fileName}`)} className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 px-3 py-2 rounded-xl text-xs font-bold transition-colors">
                                                        <i className="fa-solid fa-eye"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB 2: UPLOAD DATASET ZONE */}
                        {selectedTab === "upload" && (
                            <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-8 md:p-12 text-center max-w-3xl mx-auto space-y-6">
                                <h3 className="text-2xl font-black text-white">Ingest New Genomic or Diagnostic Payload</h3>
                                <p className="text-slate-400 text-sm max-w-lg mx-auto">
                                    Upload raw sequence datasets (`.FASTQ`, `.BAM`, `.VCF`) or clinical laboratory reports (`.PDF`). Your data is encrypted with 256-bit AES.
                                </p>

                                {uploading ? (
                                    <div className="bg-slate-900 p-8 rounded-2xl border border-emerald-500/40 space-y-4 text-left">
                                        <div className="flex justify-between items-center text-xs font-bold">
                                            <span className="text-emerald-400 flex items-center gap-2">
                                                <i className="fa-solid fa-spinner fa-spin"></i> {uploadStep}
                                            </span>
                                            <span className="text-white font-mono">{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                                            <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${uploadProgress}%` }}></div>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="border-2 border-dashed border-slate-600 hover:border-emerald-500 rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer bg-slate-900/50 hover:bg-slate-900 transition-all group">
                                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform flex items-center justify-center text-3xl mb-4">
                                            <i className="fa-solid fa-file-arrow-up"></i>
                                        </div>
                                        <p className="text-white font-bold text-base mb-1">Click to browse or drag genomic files here</p>
                                        <p className="text-xs text-slate-400">Supports FASTQ.gz, VCF.gz, BAM, PDF (Max: 500 MB)</p>
                                        <input type="file" className="hidden" onChange={handleFileUploadSimulation} accept=".vcf,.fastq,.bam,.pdf,.gz" />
                                    </label>
                                )}
                            </div>
                        )}

                        {/* TAB 3: AI PHARMACOGENOMIC INSIGHTS */}
                        {selectedTab === "insights" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-3xl space-y-4">
                                    <h4 className="font-black text-white text-lg flex items-center gap-2">
                                        <i className="fa-solid fa-pills text-emerald-400"></i> Drug Sensitivity Profile
                                    </h4>
                                    <div className="space-y-3 text-xs">
                                        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700 flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-white">Paracetamol / Acetaminophen</p>
                                                <p className="text-[10px] text-slate-400">CYP2E1 Gene Profile</p>
                                            </div>
                                            <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded text-[10px]">Normal Metabolism</span>
                                        </div>
                                        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700 flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-white">Clopidogrel (Blood Thinner)</p>
                                                <p className="text-[10px] text-slate-400">CYP2C19 Gene Profile</p>
                                            </div>
                                            <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded text-[10px]">Normal Responder</span>
                                        </div>
                                        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700 flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-white">Metformin (Diabetes)</p>
                                                <p className="text-[10px] text-slate-400">SLC22A1 Gene Profile</p>
                                            </div>
                                            <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded text-[10px]">Optimal Efficacy</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-3xl space-y-4">
                                    <h4 className="font-black text-white text-lg flex items-center gap-2">
                                        <i className="fa-solid fa-heart-pulse text-indigo-400"></i> Polygenic Disease Risk Index
                                    </h4>
                                    <div className="space-y-3 text-xs">
                                        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700 flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-white">Type-2 Diabetes Propensity</p>
                                                <p className="text-[10px] text-slate-400">Based on 14 genomic markers</p>
                                            </div>
                                            <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded text-[10px]">Low Risk (Percentile 22%)</span>
                                        </div>
                                        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700 flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-white">Coronary Artery Disease</p>
                                                <p className="text-[10px] text-slate-400">Lipid gene interaction score</p>
                                            </div>
                                            <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded text-[10px]">Average Population Risk</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

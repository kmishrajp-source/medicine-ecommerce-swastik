"use client";
import { useState } from "react";
import { useTranslations } from 'next-intl';
import Papa from "papaparse";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function LeadImportPage() {
    const t = useTranslations('Admin');
    const [file, setFile] = useState(null);
    const [leads, setLeads] = useState([]);
    const [isImporting, setIsImporting] = useState(false);
    const [message, setMessage] = useState("");

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        
        Papa.parse(selectedFile, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setLeads(results.data);
                setMessage(`Loaded ${results.data.length} leads. Ready to import.`);
            }
        });
    };

    const handleImport = async () => {
        if (leads.length === 0) return;
        setIsImporting(true);
        try {
            const res = await fetch("/api/admin/crm/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ leads })
            });
            const data = await res.json();
            if (data.success) {
                setMessage(data.message);
                setLeads([]);
            } else {
                setMessage(`Error: ${data.error}`);
            }
        } catch (error) {
            setMessage(`Fatal Error: ${error.message}`);
        }
        setIsImporting(false);
    };

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-tight">
                Bulk Lead <span className="text-indigo-600">Import</span>
            </h1>
            
            <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-100 max-w-2xl">
                <div className="mb-8">
                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Select CSV File</label>
                    <input 
                        type="file" 
                        accept=".csv"
                        onChange={handleFileChange}
                        className="w-full p-4 border-2 border-dashed border-slate-200 rounded-2xl hover:border-indigo-400 transition-colors cursor-pointer"
                    />
                    <p className="mt-2 text-xs text-slate-400">Columns required: name, phone, type, area, notes, plan, amount</p>
                </div>

                {leads.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                            <span className="text-indigo-700 font-bold">{leads.length} Leads found in CSV</span>
                            <button 
                                onClick={handleImport}
                                disabled={isImporting}
                                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 disabled:opacity-50"
                            >
                                {isImporting ? <LoadingSpinner size="sm" /> : "Start Import"}
                            </button>
                        </div>
                    </div>
                )}

                {message && (
                    <div className={`p-4 rounded-xl font-bold text-sm ${message.startsWith('Error') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";

export default function AdminInsuranceManagement() {
    const { cartCount, toggleCart } = useCart();
    const { data: session } = useSession();
    
    const [companies, setCompanies] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const compRes = await fetch('/api/insurance/companies');
            const planRes = await fetch('/api/insurance/plans');
            const compData = await compRes.json();
            const planData = await planRes.json();
            if (compData.success) setCompanies(compData.companies);
            if (planData.success) setPlans(planData.plans);
        } catch (error) {
            console.error("Failed to fetch insurance data", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
                <div className="flex justify-between items-center mb-12">
                     <div>
                        <h1 className="text-4xl font-black text-slate-900">Insurance Directory Management</h1>
                        <p className="text-slate-500">Add, edit and manage insurance providers and their healthcare plans.</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl hover:bg-slate-800 transition-all">
                            Add Company +
                        </button>
                        <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl hover:bg-indigo-700 transition-all">
                            Add Plan +
                        </button>
                    </div>
                </div>

                {/* Companies Section */}
                <div className="mb-12">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <i className="fa-solid fa-building-circle-check text-indigo-600"></i> Active Companies
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {companies.map(comp => (
                            <div key={comp.id} className="bg-white p-6 rounded-[2rem] shadow-lg border border-slate-100 group hover:border-indigo-600 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center p-2 border border-slate-100">
                                        <img src={comp.logoUrl || "https://placeholder.com/company"} alt={comp.name} className="max-h-full object-contain" />
                                    </div>
                                    <button className="text-slate-300 hover:text-indigo-600"><i className="fa-solid fa-ellipsis-vertical"></i></button>
                                </div>
                                <h4 className="font-black text-slate-900 text-lg mb-1">{comp.name}</h4>
                                <p className="text-xs text-slate-400 line-clamp-2 mb-4">{comp.description}</p>
                                <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                                     <div className="text-center flex-1">
                                        <p className="text-[10px] font-black text-slate-300 uppercase">Plans</p>
                                        <p className="font-black text-slate-900">{plans.filter(p => p.companyId === comp.id).length}</p>
                                     </div>
                                     <div className="text-center flex-1 border-x border-slate-50">
                                        <p className="text-[10px] font-black text-slate-300 uppercase">Status</p>
                                        <p className="text-[10px] font-black text-green-600 uppercase">Active</p>
                                     </div>
                                      <div className="text-center flex-1">
                                        <p className="text-[10px] font-black text-slate-300 uppercase">Type</p>
                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">Verified</p>
                                     </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Plans Table */}
                <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-50">
                        <h3 className="text-xl font-bold text-slate-900">Insurance Plan Registry</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Plan Name</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Company</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Type</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Premium</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Commission</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {plans.map(plan => (
                                    <tr key={plan.id} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="px-8 py-6">
                                            <p className="font-bold text-slate-900 text-sm">{plan.name}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">ID: {plan.id.slice(0, 8)}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-black text-slate-600 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg">{plan.company?.name}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{plan.coverageType}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="font-black text-slate-900 text-sm">₹{plan.premium.toLocaleString()}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="font-black text-green-600 text-sm">{plan.commissionRate}%</p>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><i className="fa-solid fa-pen-to-square"></i></button>
                                                <button className="p-2 bg-red-50 text-red-600 rounded-lg"><i className="fa-solid fa-trash-can"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

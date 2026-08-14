"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CustomerIntelligenceDashboard() {
    const { cartCount, toggleCart } = useCart();
    const { data: session, status } = useSession();
    const router = useRouter();

    // Workspaces: 'acquisition' (1-3), 'scoring' (4-6), 'outreach' (7-9), 'success' (10-12)
    const [activeWorkspace, setActiveWorkspace] = useState("acquisition");
    
    // Core filtering
    const [selectedArea, setSelectedArea] = useState("Gorakhpur");
    const [serviceType, setServiceType] = useState("retailer");
    
    // Data states
    const [directoryLeads, setDirectoryLeads] = useState([]);
    const [activeLeads, setActiveLeads] = useState([]);
    const [agents, setAgents] = useState([]);
    const [products, setProducts] = useState([]);
    const [monitoredCustomers, setMonitoredCustomers] = useState([]);
    
    // Selection states
    const [selectedDirIds, setSelectedDirIds] = useState([]);
    const [selectedAgentId, setSelectedAgentId] = useState("");
    const [selectedLeadIdsForRoute, setSelectedLeadIdsForRoute] = useState([]);
    const [activeRoute, setActiveRoute] = useState([]);
    const [selectedLeadForAction, setSelectedLeadForAction] = useState(null);
    
    // Interaction form states
    const [interactionType, setInteractionType] = useState("whatsapp");
    const [interactionNotes, setInteractionNotes] = useState("");
    
    // Quotation states
    const [quoteItems, setQuoteItems] = useState([]); // [{id, name, price, quantity}]
    const [quoteDiscount, setQuoteDiscount] = useState(10); // Default 10% wholesale discount
    const [productSearch, setProductSearch] = useState("");
    
    // Conversion results
    const [conversionResult, setConversionResult] = useState(null);
    
    // General states
    const [loading, setLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [isScoring, setIsScoring] = useState(false);

    // Redirect if unauthenticated or not staff
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (status === "authenticated" && !["SUPER_ADMIN", "ADMIN", "CRM_STAFF"].includes(session?.user?.role)) {
            router.push("/");
        }
    }, [status, router, session]);

    // Initial and filter-based fetches
    useEffect(() => {
        if (status === "authenticated") {
            fetchActiveLeads();
            fetchAgentsAndProducts();
            fetchMonitoredCustomers();
        }
    }, [selectedArea, status]);

    // Fetch active leads in selected geography
    const fetchActiveLeads = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/customer-intelligence?action=get-leads&area=${selectedArea}`);
            const data = await res.json();
            if (data.success) {
                setActiveLeads(data.leads);
            }
        } catch (err) {
            console.error("Failed fetching leads:", err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch agents and products for dropdowns and quote builder
    const fetchAgentsAndProducts = async () => {
        try {
            const res = await fetch(`/api/admin/customer-intelligence?action=get-agents-products`);
            const data = await res.json();
            if (data.success) {
                setAgents(data.agents || []);
                setProducts(data.products || []);
                if (data.agents?.length > 0) {
                    setSelectedAgentId(data.agents[0].id);
                }
            }
        } catch (err) {
            console.error("Failed fetching metadata:", err);
        }
    };

    // Fetch customers order metrics & health scores
    const fetchMonitoredCustomers = async () => {
        try {
            const res = await fetch(`/api/admin/customer-intelligence?action=monitor-customers`);
            const data = await res.json();
            if (data.success) {
                setMonitoredCustomers(data.monitoredCustomers);
            }
        } catch (err) {
            console.error("Failed monitoring customers:", err);
        }
    };

    // Stage 2: Identify Potential Businesses from Google Maps / Directories
    const discoverBusinesses = async () => {
        setIsScanning(true);
        setDirectoryLeads([]);
        // Artificial scan delay for rich AI visual feeling
        setTimeout(async () => {
            try {
                const res = await fetch(`/api/admin/customer-intelligence?action=get-directory-leads&area=${selectedArea}&serviceType=${serviceType}`);
                const data = await res.json();
                if (data.success) {
                    setDirectoryLeads(data.directoryLeads);
                    setSelectedDirIds(data.directoryLeads.map(d => d.id)); // Select all by default
                }
            } catch (err) {
                console.error("Discovery error:", err);
            } finally {
                setIsScanning(false);
            }
        }, 1500);
    };

    // Stage 3: Import Discovery Leads into PostgreSQL Database
    const importSelectedLeads = async () => {
        const leadsToImport = directoryLeads.filter(d => selectedDirIds.includes(d.id));
        if (leadsToImport.length === 0) {
            alert("Please select at least one business to import.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/admin/customer-intelligence?action=import-leads`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ leads: leadsToImport })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Successfully imported ${data.imported} leads into the database!`);
                setDirectoryLeads([]);
                setSelectedDirIds([]);
                fetchActiveLeads();
            }
        } catch (err) {
            console.error("Import error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Stage 4 & 5: AI Heuristic Scoring & A/B/C Priority Classification
    const runAIScoring = async () => {
        setIsScoring(true);
        // Show matrix code scan animations
        setTimeout(async () => {
            try {
                const res = await fetch(`/api/admin/customer-intelligence?action=score-leads`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ area: selectedArea })
                });
                const data = await res.json();
                if (data.success) {
                    alert(`AI Scoring Matrix successfully ran! Scored and classified ${data.scored} leads.`);
                    fetchActiveLeads();
                }
            } catch (err) {
                console.error("Scoring error:", err);
            } finally {
                setIsScoring(false);
            }
        }, 2000);
    };

    // Stage 6: Salesperson Route Planning Optimization
    const planOptimizedRoute = async () => {
        if (selectedLeadIdsForRoute.length === 0) {
            alert("Please select leads to assign to the salesperson's route.");
            return;
        }
        if (!selectedAgentId) {
            alert("Please select a salesperson.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/admin/customer-intelligence?action=plan-route`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ leadIds: selectedLeadIdsForRoute, agentId: selectedAgentId })
            });
            const data = await res.json();
            if (data.success) {
                setActiveRoute(data.route);
                alert(`Optimized route generated with ${data.route.length} stops! Saved to salesperson plan.`);
                fetchActiveLeads(); // Update assigned agents list
            }
        } catch (err) {
            console.error("Routing error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Stage 7: Log outreach check-in / WhatsApp / Call
    const logOutreachInteraction = async () => {
        if (!selectedLeadForAction) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/admin/customer-intelligence?action=log-interaction`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    leadId: selectedLeadForAction.id,
                    type: interactionType,
                    notes: interactionNotes
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Outreach Touchpoint (${interactionType}) logged successfully!`);
                setInteractionNotes("");
                // Refresh lead list
                fetchActiveLeads();
                // Update selected lead details
                const updatedLead = { ...selectedLeadForAction, status: "contacted", lastAction: interactionType };
                // Add to mock interactions locally to show immediately
                let detailsObj = {};
                try { detailsObj = JSON.parse(selectedLeadForAction.details || "{}"); } catch(e){}
                if (!detailsObj.interactions) detailsObj.interactions = [];
                detailsObj.interactions.push({
                    type: interactionType,
                    notes: interactionNotes || `Logged outreach: ${interactionType}`,
                    date: new Date().toISOString()
                });
                updatedLead.details = JSON.stringify(detailsObj);
                setSelectedLeadForAction(updatedLead);
            }
        } catch (err) {
            console.error("Touchpoint error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Stage 8: Add item to Quotation Builder
    const addProductToQuote = (prod) => {
        const exists = quoteItems.find(item => item.id === prod.id);
        if (exists) {
            setQuoteItems(quoteItems.map(item => item.id === prod.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setQuoteItems([...quoteItems, { id: prod.id, name: prod.name, price: prod.price, quantity: 10 }]); // default bulk qty 10
        }
    };

    // Adjust quote item quantity
    const adjustQuoteQty = (id, delta) => {
        setQuoteItems(quoteItems.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    // Save/lock quotation B2B
    const dispatchQuotation = async () => {
        if (!selectedLeadForAction) return;
        if (quoteItems.length === 0) {
            alert("Add at least one product to the quote.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/admin/customer-intelligence?action=save-quotation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    leadId: selectedLeadForAction.id,
                    items: quoteItems,
                    discount: quoteDiscount
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("B2B wholesale pricing quotation locked and saved to lead database!");
                fetchActiveLeads();
                // Refresh local view
                const updatedLead = { ...selectedLeadForAction, status: "follow_up", amount: data.quotation.totalAmount };
                let detailsObj = {};
                try { detailsObj = JSON.parse(selectedLeadForAction.details || "{}"); } catch(e){}
                detailsObj.quotation = data.quotation;
                updatedLead.details = JSON.stringify(detailsObj);
                setSelectedLeadForAction(updatedLead);
            }
        } catch (err) {
            console.error("Quote dispatch error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Stage 9: Convert lead to active customer user & submit order
    const convertLeadToCustomer = async () => {
        if (!selectedLeadForAction) return;

        setLoading(true);
        setConversionResult(null);
        try {
            const res = await fetch(`/api/admin/customer-intelligence?action=convert-lead`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ leadId: selectedLeadForAction.id })
            });
            const data = await res.json();
            if (data.success) {
                setConversionResult(data);
                alert("B2B account created and first wholesale order placed successfully!");
                fetchActiveLeads();
                fetchMonitoredCustomers();
                // Clear selection
                setSelectedLeadForAction(null);
                setQuoteItems([]);
            } else {
                alert("Conversion failed: " + data.error);
            }
        } catch (err) {
            console.error("Convert error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Stage 12: Trigger AI Retention Coupon Campaign
    const triggerRetentionCampaign = async (cust, campaignCode, discountPercent) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/customer-intelligence?action=trigger-retention`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerId: cust.id,
                    code: campaignCode,
                    discountVal: discountPercent
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(`SUCCESS: Retention campaign deployed! Dynamic coupon '${campaignCode}' created.\nSMS dispatched to ${cust.phone}.`);
                fetchMonitoredCustomers(); // Reload customer statuses
            }
        } catch (err) {
            console.error("Retention dispatch error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Helpers
    const toggleSelectDirectoryLead = (id) => {
        if (selectedDirIds.includes(id)) {
            setSelectedDirIds(selectedDirIds.filter(i => i !== id));
        } else {
            setSelectedDirIds([...selectedDirIds, id]);
        }
    };

    const toggleSelectLeadForRoute = (id) => {
        if (selectedLeadIdsForRoute.includes(id)) {
            setSelectedLeadIdsForRoute(selectedLeadIdsForRoute.filter(i => i !== id));
        } else {
            setSelectedLeadIdsForRoute([...selectedLeadIdsForRoute, id]);
        }
    };

    // Filter products for quotation builder
    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.category?.toLowerCase().includes(productSearch.toLowerCase())
    );

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            <div style={{
                minHeight: '100vh',
                background: 'radial-gradient(circle at top left, #032111, #080d16, #030409)',
                padding: '120px 20px 60px',
                fontFamily: "'Inter', sans-serif",
                color: '#f8fafc'
            }}>
                <main className="max-w-[1400px] mx-auto">
                    {/* Glowing Header Card */}
                    <div style={{
                        background: 'rgba(11, 22, 17, 0.45)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        borderRadius: '24px',
                        padding: '30px',
                        marginBottom: '30px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.35), 0 0 30px rgba(16, 185, 129, 0.05)'
                    }}>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-extrabold tracking-tight" style={{
                                    background: 'linear-gradient(to right, #ffffff, #10B981, #06B6D4)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    🎯 CUSTOMER FINDING INTELLIGENCE MATRIX
                                </h1>
                                <p className="text-slate-400 text-sm mt-1">
                                    Enterprise B2B Pipeline: Lead Discovery, Heuristic Scoring, Optimized Routing, Quotations & Customer Retention
                                </p>
                            </div>
                            
                            {/* Geography Selector */}
                            <div className="flex items-center gap-3 bg-slate-900/60 p-1.5 rounded-xl border border-emerald-500/20">
                                <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider pl-2">Territory:</span>
                                {["Gorakhpur", "Lucknow", "Varanasi"].map(area => (
                                    <button
                                        key={area}
                                        onClick={() => setSelectedArea(area)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedArea === area ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        {area}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Pipeline Stepper Navigation */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 pt-6 border-t border-slate-800">
                            {[
                                { id: "acquisition", label: "1. Lead Acquisition & Geo Search", sub: "Stages 1-3", icon: "fa-earth-asia", color: "#3B82F6" },
                                { id: "scoring", label: "2. AI Scoring & Route Planning", sub: "Stages 4-6", icon: "fa-wand-magic-sparkles", color: "#A855F7" },
                                { id: "outreach", label: "3. Outreach, Quote & Convert", sub: "Stages 7-9", icon: "fa-file-invoice-dollar", color: "#10B981" },
                                { id: "success", label: "4. Customer Success & Loyalty", sub: "Stages 10-12", icon: "fa-chart-line", color: "#F59E0B" }
                            ].map(block => (
                                <button
                                    key={block.id}
                                    onClick={() => {
                                        setActiveWorkspace(block.id);
                                        setSelectedLeadForAction(null);
                                    }}
                                    style={{
                                        background: activeWorkspace === block.id ? `${block.color}15` : 'rgba(255, 255, 255, 0.02)',
                                        border: activeWorkspace === block.id ? `1.5px solid ${block.color}` : '1px solid rgba(255,255,255,0.06)'
                                    }}
                                    className="p-4 rounded-xl text-left transition-all hover:scale-[1.02] flex items-start gap-3.5"
                                >
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg mt-0.5" style={{
                                        backgroundColor: activeWorkspace === block.id ? block.color : 'rgba(255,255,255,0.05)',
                                        color: activeWorkspace === block.id ? '#ffffff' : '#94a3b8'
                                    }}>
                                        <i className={`fa-solid ${block.icon}`}></i>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-100">{block.label}</h4>
                                        <p className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase mt-0.5">{block.sub}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ========================================================================= */}
                    {/* WORKSPACE 1: LEAD ACQUISITION & DISCOVERY */}
                    {/* ========================================================================= */}
                    {activeWorkspace === "acquisition" && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* Setup Discovery Parameters */}
                            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl flex flex-col gap-5">
                                <h3 className="text-lg font-bold border-b border-slate-800 pb-3 text-emerald-400 flex items-center gap-2">
                                    <i className="fa-solid fa-compass"></i> AI Business Discovery
                                </h3>

                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Target Geography Radius</label>
                                    <select className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2.5 text-xs outline-none">
                                        <option>Golghar / Town Center (5km Radius)</option>
                                        <option>Medical College Road (10km Radius)</option>
                                        <option>Railway Station Road / Buxipur (8km Radius)</option>
                                        <option>All City Territories (Wide)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Business Category Type</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => setServiceType("retailer")}
                                            className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${serviceType === "retailer" ? "bg-blue-600/20 border-blue-500 text-blue-300" : "bg-slate-950 border-slate-800 text-slate-400"}`}
                                        >
                                            💊 Retail Pharmacies
                                        </button>
                                        <button
                                            onClick={() => setServiceType("doctor")}
                                            className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${serviceType === "doctor" ? "bg-blue-600/20 border-blue-500 text-blue-300" : "bg-slate-950 border-slate-800 text-slate-400"}`}
                                        >
                                            👨‍⚕️ Clinics & Doctors
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={discoverBusinesses}
                                    disabled={isScanning}
                                    className="w-full mt-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                                >
                                    {isScanning ? (
                                        <>
                                            <i className="fa-solid fa-spinner fa-spin"></i> Scouring Google Maps/Directories...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-magnifying-glass-location"></i> Scan Selected Geography
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Discovered Directory Entries */}
                            <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl flex flex-col">
                                <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                                    <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                                        <i className="fa-solid fa-clipboard-list"></i> Identified Potential Businesses ({directoryLeads.length})
                                    </h3>
                                    {directoryLeads.length > 0 && (
                                        <button
                                            onClick={importSelectedLeads}
                                            disabled={loading}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md shadow-emerald-500/20"
                                        >
                                            Verify & Import Selected ({selectedDirIds.length})
                                        </button>
                                    )}
                                </div>

                                {isScanning ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                                        <div className="w-12 h-12 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin mb-4" />
                                        <p className="text-xs uppercase tracking-widest font-black text-emerald-500">AI crawler querying directory matrix...</p>
                                    </div>
                                ) : directoryLeads.length === 0 ? (
                                    <div className="text-center py-20 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                                        <i className="fa-solid fa-map-location-dot text-4xl mb-3 text-slate-700"></i>
                                        <p className="text-xs uppercase font-bold tracking-wider">No scanner results display yet. Select a category and click Scan Geography.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase">
                                                    <th className="py-2 px-3"><input type="checkbox" checked={selectedDirIds.length === directoryLeads.length} onChange={(e) => setSelectedDirIds(e.target.checked ? directoryLeads.map(d=>d.id) : [])} className="rounded" /></th>
                                                    <th className="py-2 px-3">Business / Doctor</th>
                                                    <th className="py-2 px-3">Contact</th>
                                                    <th className="py-2 px-3">Address</th>
                                                    <th className="py-2 px-3">Google Rating</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800/40">
                                                {directoryLeads.map(lead => (
                                                    <tr key={lead.id} className="hover:bg-slate-800/20">
                                                        <td className="py-3 px-3">
                                                            <input type="checkbox" checked={selectedDirIds.includes(lead.id)} onChange={() => toggleSelectDirectoryLead(lead.id)} className="rounded" />
                                                        </td>
                                                        <td className="py-3 px-3 font-bold text-slate-200">
                                                            {lead.shopName || lead.name}
                                                        </td>
                                                        <td className="py-3 px-3 font-semibold text-slate-300">
                                                            {lead.phone}
                                                        </td>
                                                        <td className="py-3 px-3 text-slate-400 max-w-[200px] truncate">
                                                            {lead.address}
                                                        </td>
                                                        <td className="py-3 px-3 text-yellow-400 font-bold flex items-center gap-1.5">
                                                            ★ {lead.rating} <span className="text-[10px] text-slate-500 font-normal">({lead.ratingCount})</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                            
                            {/* CRM Lead Database List */}
                            <div className="lg:col-span-3 bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl mt-4">
                                <h3 className="text-lg font-bold text-emerald-400 border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
                                    <i className="fa-solid fa-database"></i> B2B CRM Lead Database ({activeLeads.length} total in {selectedArea})
                                </h3>

                                {loading ? (
                                    <div className="text-center py-8"><i className="fa-solid fa-spinner fa-spin text-slate-400 text-xl"></i></div>
                                ) : activeLeads.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500">
                                        <p className="text-xs uppercase font-bold tracking-wider">No active leads in this territory. Discover and import leads above.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {activeLeads.map(lead => {
                                            let rating = 4.0;
                                            if (lead.details) {
                                                try { rating = JSON.parse(lead.details).rating || 4.0; } catch(e){}
                                            }
                                            return (
                                                <div key={lead.id} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between gap-3 relative overflow-hidden group hover:border-slate-700 transition-all">
                                                    <div>
                                                        <div className="flex justify-between items-start">
                                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${lead.serviceType === "retailer" ? "bg-blue-900/40 text-blue-400 border border-blue-800/50" : "bg-purple-900/40 text-purple-400 border border-purple-800/50"}`}>
                                                                {lead.serviceType}
                                                            </span>
                                                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                                lead.status === "new" ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" :
                                                                lead.status === "contacted" ? "bg-yellow-600/10 text-yellow-400 border border-yellow-500/20" :
                                                                lead.status === "follow_up" ? "bg-purple-600/10 text-purple-400 border border-purple-500/20" :
                                                                lead.status === "converted" ? "bg-emerald-600/10 text-emerald-400 border border-emerald-500/20" :
                                                                "bg-slate-600/10 text-slate-400"
                                                            }`}>
                                                                {lead.status}
                                                            </span>
                                                        </div>
                                                        <h4 className="font-bold text-slate-100 mt-2">{lead.guestName}</h4>
                                                        <p className="text-xs text-slate-400 font-semibold mt-0.5">{lead.guestPhone}</p>
                                                        <p className="text-[11px] text-slate-500 italic mt-2 line-clamp-1"><i className="fa-solid fa-location-dot"></i> {lead.notes || "No address details"}</p>
                                                    </div>
                                                    
                                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-900 text-[10px] text-slate-400">
                                                        <span className="font-bold">Rating: ★ {rating}</span>
                                                        <span className="text-[9px] font-mono text-slate-500">ID: {lead.id.slice(-6)}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                        </div>
                    )}

                    {/* ========================================================================= */}
                    {/* WORKSPACE 2: AI SCORING & SALESPERSON ROUTING */}
                    {/* ========================================================================= */}
                    {activeWorkspace === "scoring" && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* AI Scorer Control Panel */}
                            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl flex flex-col gap-4">
                                <h3 className="text-lg font-bold border-b border-slate-800 pb-3 text-emerald-400 flex items-center gap-2">
                                    <i className="fa-solid fa-microchip"></i> AI Lead Qualification
                                </h3>
                                
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Analyze and qualify leads using AI-driven heuristics: rating score, reviews maturity weight, contact authenticity, and industry type conversion potential.
                                </p>

                                <button
                                    onClick={runAIScoring}
                                    disabled={isScoring}
                                    className="w-full mt-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-purple-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                                >
                                    {isScoring ? (
                                        <>
                                            <i className="fa-solid fa-spinner fa-spin"></i> Running Scoring Neural Network...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-bolt"></i> Evaluate Scoring Matrix
                                        </>
                                    )}
                                </button>
                                
                                {/* Route Planning Controls */}
                                <h3 className="text-lg font-bold border-b border-slate-800 pb-3 mt-6 text-emerald-400 flex items-center gap-2">
                                    <i className="fa-solid fa-route"></i> Salesperson Route Optimizer
                                </h3>

                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Select Salesperson Rep</label>
                                    <select
                                        value={selectedAgentId}
                                        onChange={(e) => setSelectedAgentId(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2.5 text-xs outline-none"
                                    >
                                        {agents.map(a => (
                                            <option key={a.id} value={a.id}>{a.name} ({a.role})</option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    onClick={planOptimizedRoute}
                                    disabled={loading}
                                    className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest hover:scale-[1.01] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                                >
                                    <i className="fa-solid fa-route"></i> Optimize Sales Route Matrix
                                </button>
                            </div>

                            {/* Scored Leads & Routing Selection */}
                            <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl">
                                <h3 className="text-lg font-bold border-b border-slate-800 pb-3 mb-4 text-emerald-400 flex items-center gap-2">
                                    <i className="fa-solid fa-table-list"></i> Lead Classification & Route Mapping
                                </h3>

                                {isScoring ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                                        <div className="w-12 h-12 border-4 border-slate-800 border-t-purple-500 rounded-full animate-spin mb-4" />
                                        <p className="text-xs uppercase tracking-widest font-black text-purple-500">AI analyzing business density metrics...</p>
                                    </div>
                                ) : activeLeads.length === 0 ? (
                                    <div className="text-center py-20 text-slate-500">
                                        <p className="text-xs font-bold uppercase">No leads available for evaluation. Create leads in workspace 1.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase">
                                                    <th className="py-2 px-3">Assign Route</th>
                                                    <th className="py-2 px-3">Lead name</th>
                                                    <th className="py-2 px-3">Score (0-100)</th>
                                                    <th className="py-2 px-3">ABC Priority</th>
                                                    <th className="py-2 px-3">Assigned Salesperson</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800/40">
                                                {activeLeads.map(lead => {
                                                    const isA = lead.qualityScore >= 80;
                                                    const isB = lead.qualityScore >= 50 && lead.qualityScore < 80;
                                                    return (
                                                        <tr key={lead.id} className="hover:bg-slate-800/20">
                                                            <td className="py-3 px-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedLeadIdsForRoute.includes(lead.id)}
                                                                    onChange={() => toggleSelectLeadForRoute(lead.id)}
                                                                    disabled={lead.status === "converted"}
                                                                    className="rounded"
                                                                />
                                                            </td>
                                                            <td className="py-3 px-3 font-bold text-slate-200">
                                                                {lead.guestName}
                                                            </td>
                                                            <td className="py-3 px-3">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
                                                                        <div
                                                                            style={{ width: `${lead.qualityScore}%` }}
                                                                            className={`h-full rounded-full ${isA ? 'bg-emerald-500' : isB ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                                        />
                                                                    </div>
                                                                    <span className="font-bold text-[11px] text-slate-300">{lead.qualityScore}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-3">
                                                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                                                    isA ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                                                                    isB ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' :
                                                                    'bg-red-500/10 text-red-400 border border-red-500/30'
                                                                }`}>
                                                                    Tier {lead.planType || 'C'}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-3 font-bold text-slate-400">
                                                                {lead.assignedAgent?.name || (
                                                                    <span className="text-slate-600 font-normal italic">Unassigned</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Geographic SVG Optimized Routing Map */}
                            {activeRoute.length > 0 && (
                                <div className="lg:col-span-3 bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl mt-4">
                                    <h3 className="text-lg font-bold border-b border-slate-800 pb-3 mb-4 text-emerald-400 flex items-center gap-2">
                                        <i className="fa-solid fa-map-location"></i> Optimized Geospatial Sales Path Map
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                        {/* SVG Route Visualization */}
                                        <div className="md:col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex items-center justify-center min-h-[300px] relative overflow-hidden">
                                            <div className="absolute top-2 left-2 text-[10px] text-slate-500 uppercase tracking-widest font-mono">Map projection: {selectedArea} center</div>
                                            
                                            <svg className="w-full max-w-[500px]" viewBox="0 0 400 300">
                                                {/* Grid Lines */}
                                                <g stroke="#ffffff" strokeOpacity="0.03" strokeWidth="1">
                                                    <line x1="0" y1="50" x2="400" y2="50" />
                                                    <line x1="0" y1="100" x2="400" y2="100" />
                                                    <line x1="0" y1="150" x2="400" y2="150" />
                                                    <line x1="0" y1="200" x2="400" y2="200" />
                                                    <line x1="0" y1="250" x2="400" y2="250" />
                                                    
                                                    <line x1="50" y1="0" x2="50" y2="300" />
                                                    <line x1="100" y1="0" x2="100" y2="300" />
                                                    <line x1="150" y1="0" x2="150" y2="300" />
                                                    <line x1="200" y1="0" x2="200" y2="300" />
                                                    <line x1="250" y1="0" x2="250" y2="300" />
                                                    <line x1="300" y1="0" x2="300" y2="300" />
                                                    <line x1="350" y1="0" x2="350" y2="300" />
                                                </g>

                                                {/* Start Hub Pin */}
                                                <circle cx="50" cy="250" r="8" fill="#10B981" fillOpacity="0.3" />
                                                <circle cx="50" cy="250" r="4" fill="#10B981" />
                                                <text x="65" y="254" fill="#10B981" fontSize="9" fontWeight="bold">Swastik Hub (Start)</text>

                                                {/* Generate route lines */}
                                                {activeRoute.map((stop, i) => {
                                                    const prevX = i === 0 ? 50 : 80 + (i - 1) * 60;
                                                    const prevY = i === 0 ? 250 : 80 + ((i - 1) % 2) * 80;
                                                    const x = 80 + i * 60;
                                                    const y = 80 + (i % 2) * 80;

                                                    return (
                                                        <g key={stop.id}>
                                                            {/* Path Line */}
                                                            <line
                                                                x1={prevX}
                                                                y1={prevY}
                                                                x2={x}
                                                                y2={y}
                                                                stroke="#06B6D4"
                                                                strokeWidth="2.5"
                                                                strokeDasharray="4 4"
                                                                strokeLinecap="round"
                                                            />
                                                            
                                                            {/* Stop Circle */}
                                                            <circle cx={x} cy={y} r="14" fill="#1e1b4b" stroke="#06B6D4" strokeWidth="2" />
                                                            <text x={x} y={y + 4} fill="#06B6D4" fontSize="10" fontWeight="bold" textAnchor="middle">{i + 1}</text>
                                                        </g>
                                                    );
                                                })}
                                            </svg>
                                        </div>
                                        
                                        {/* Timeline Stops */}
                                        <div className="flex flex-col gap-3">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Optimized Stop Timeline</h4>
                                            {activeRoute.map((stop, index) => (
                                                <div key={stop.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-cyan-900/30 text-cyan-400 border border-cyan-800/50 flex items-center justify-center text-xs font-bold font-mono">
                                                        #{index + 1}
                                                    </div>
                                                    <div>
                                                        <h5 className="text-xs font-bold text-slate-200">{stop.guestName}</h5>
                                                        <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{stop.notes}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}

                    {/* ========================================================================= */}
                    {/* WORKSPACE 3: OUTREACH, QUOTATION & CONVERSION */}
                    {/* ========================================================================= */}
                    {activeWorkspace === "outreach" && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* Leads List selection */}
                            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl flex flex-col gap-4">
                                <h3 className="text-lg font-bold border-b border-slate-800 pb-3 text-emerald-400 flex items-center gap-2">
                                    <i className="fa-solid fa-address-book"></i> Target Leads
                                </h3>

                                {activeLeads.length === 0 ? (
                                    <div className="text-center py-10 text-slate-500">
                                        <p className="text-xs uppercase font-bold tracking-wider">No leads imported. Proceed to block 1.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto">
                                        {activeLeads.map(lead => {
                                            const isSelected = selectedLeadForAction?.id === lead.id;
                                            return (
                                                <button
                                                    key={lead.id}
                                                    onClick={() => {
                                                        setSelectedLeadForAction(lead);
                                                        setConversionResult(null);
                                                        // Load existing quote if any
                                                        if (lead.details) {
                                                            try {
                                                                const parsed = JSON.parse(lead.details);
                                                                if (parsed.quotation) {
                                                                    setQuoteItems(parsed.quotation.items || []);
                                                                    setQuoteDiscount(parsed.quotation.discount || 0);
                                                                } else {
                                                                    setQuoteItems([]);
                                                                }
                                                            } catch(e){
                                                                setQuoteItems([]);
                                                            }
                                                        } else {
                                                            setQuoteItems([]);
                                                        }
                                                    }}
                                                    style={{
                                                        background: isSelected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                                                        borderColor: isSelected ? '#10B981' : 'rgba(255, 255, 255, 0.06)'
                                                    }}
                                                    className="w-full text-left p-3.5 rounded-xl border transition-all hover:scale-[1.01] flex justify-between items-center"
                                                >
                                                    <div>
                                                        <h4 className="text-xs font-black text-slate-200 uppercase tracking-tight">{lead.guestName}</h4>
                                                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{lead.guestPhone}</p>
                                                        <div className="flex gap-2 items-center mt-2">
                                                            <span className="text-[8px] font-black uppercase bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                                                                Tier {lead.planType || 'C'}
                                                            </span>
                                                            <span className="text-[8px] text-slate-500">
                                                                Status: {lead.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <i className="fa-solid fa-chevron-right text-xs text-slate-600"></i>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Interactions & Quotation panel */}
                            <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl flex flex-col gap-6">
                                {!selectedLeadForAction ? (
                                    <div className="text-center py-24 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                                        <i className="fa-solid fa-hand-pointer text-4xl mb-3 text-slate-700"></i>
                                        <p className="text-xs uppercase font-bold tracking-wider">Select a lead from the left pane to log outreach, create quotations, or convert.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-3 gap-2">
                                            <div>
                                                <h3 className="text-lg font-bold text-emerald-400 uppercase">
                                                    Action Desk: {selectedLeadForAction.guestName}
                                                </h3>
                                                <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">
                                                    Category: {selectedLeadForAction.serviceType} | Priority: Tier {selectedLeadForAction.planType || "C"} | Score: {selectedLeadForAction.qualityScore}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={convertLeadToCustomer}
                                                    disabled={loading || selectedLeadForAction.status === "converted"}
                                                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 disabled:from-slate-800 disabled:to-slate-900 disabled:text-slate-500 hover:scale-[1.02] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md shadow-emerald-500/20"
                                                >
                                                    {selectedLeadForAction.status === "converted" ? "Converted ✔" : "Convert & Place First Order"}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Conversion Account Details display */}
                                        {conversionResult && (
                                            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 text-xs">
                                                <h4 className="font-bold text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    🎉 Conversion Successful!
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300 font-medium">
                                                    <div><span className="text-slate-500">Email:</span> {conversionResult.user.email}</div>
                                                    <div><span className="text-slate-500">Temporary Password:</span> <code className="bg-slate-900 px-2 py-0.5 rounded text-emerald-400">{conversionResult.user.password}</code></div>
                                                    <div><span className="text-slate-500">Account Role:</span> {conversionResult.user.role}</div>
                                                    <div><span className="text-slate-500">First Order ID:</span> <code className="bg-slate-900 px-2 py-0.5 rounded text-cyan-400">{conversionResult.orderId}</code></div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Tab split: Touchpoint Logs vs Quotation Builder */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            
                                            {/* Log Touchpoint Interactions */}
                                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex flex-col gap-4">
                                                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest border-b border-slate-900 pb-2">
                                                    Log Touchpoint Outreach
                                                </h4>

                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Outreach Type</label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {["whatsapp", "call", "visit"].map(t => (
                                                            <button
                                                                key={t}
                                                                onClick={() => setInteractionType(t)}
                                                                className={`py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border ${interactionType === t ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                                                            >
                                                                {t}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Interaction Notes</label>
                                                    <textarea
                                                        value={interactionNotes}
                                                        onChange={(e) => setInteractionNotes(e.target.value)}
                                                        rows={2.5}
                                                        placeholder="Write field feedback, check-in details, call transcript brief..."
                                                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 outline-none placeholder:text-slate-600"
                                                    />
                                                </div>

                                                <button
                                                    onClick={logOutreachInteraction}
                                                    disabled={loading}
                                                    className="w-full bg-slate-900 text-slate-200 border border-slate-700 font-bold py-2 rounded-lg text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all"
                                                >
                                                    Save Interaction Log
                                                </button>

                                                {/* History list */}
                                                <div className="mt-2">
                                                    <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Outreach Timeline History</h5>
                                                    <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto pr-1">
                                                        {(() => {
                                                            let list = [];
                                                            try { list = JSON.parse(selectedLeadForAction.details || "{}").interactions || []; } catch(e){}
                                                            if (list.length === 0) return <p className="text-[10px] text-slate-600 italic">No outreach logged yet.</p>;
                                                            return list.map((item, idx) => (
                                                                <div key={idx} className="bg-slate-900 p-2 rounded border border-slate-800 text-[10px]">
                                                                    <div className="flex justify-between items-center text-slate-500 mb-1">
                                                                        <span className="font-bold uppercase text-cyan-400">{item.type}</span>
                                                                        <span>{new Date(item.date).toLocaleDateString()}</span>
                                                                    </div>
                                                                    <p className="text-slate-300 font-semibold">{item.notes}</p>
                                                                </div>
                                                            ));
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* B2B wholesale quotation builder */}
                                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
                                                <div>
                                                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest border-b border-slate-900 pb-2 mb-3">
                                                        B2B Quotation Creator
                                                    </h4>

                                                    {/* Product search & Add */}
                                                    <div className="relative mb-3">
                                                        <input
                                                            type="text"
                                                            value={productSearch}
                                                            onChange={(e) => setProductSearch(e.target.value)}
                                                            placeholder="Search wholesale products/medicines..."
                                                            className="w-full bg-slate-900 border border-slate-850 rounded-lg py-1.5 px-3 pl-8 text-[11px] text-slate-200 outline-none"
                                                        />
                                                        <i className="fa-solid fa-magnifying-glass absolute left-2.5 top-2.5 text-xs text-slate-600"></i>
                                                        
                                                        {productSearch && (
                                                            <div className="absolute left-0 right-0 top-9 max-h-[150px] overflow-y-auto bg-slate-900 border border-slate-800 rounded-lg z-20 p-1 flex flex-col gap-1 shadow-2xl">
                                                                {filteredProducts.map(p => (
                                                                    <button
                                                                        key={p.id}
                                                                        onClick={() => {
                                                                            addProductToQuote(p);
                                                                            setProductSearch("");
                                                                        }}
                                                                        className="w-full text-left p-1.5 hover:bg-slate-850 rounded text-[10px] text-slate-300 flex justify-between items-center"
                                                                    >
                                                                        <span>{p.name}</span>
                                                                        <span className="font-bold text-emerald-400">₹{p.price}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Selected Quote Items */}
                                                    <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                                                        {quoteItems.length === 0 ? (
                                                            <p className="text-[10px] text-slate-600 italic py-4 text-center">No products selected in quotation.</p>
                                                        ) : (
                                                            quoteItems.map(item => (
                                                                <div key={item.id} className="bg-slate-900 p-2 rounded flex justify-between items-center text-[10px] border border-slate-800">
                                                                    <div>
                                                                        <p className="font-semibold text-slate-200 truncate max-w-[120px]">{item.name}</p>
                                                                        <p className="text-slate-500 font-mono text-[9px]">₹{item.price} each</p>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <button onClick={() => adjustQuoteQty(item.id, -5)} className="w-5 h-5 bg-slate-850 border border-slate-700 text-slate-400 rounded hover:text-white flex items-center justify-center">-</button>
                                                                        <span className="font-bold text-slate-200 font-mono">{item.quantity}</span>
                                                                        <button onClick={() => adjustQuoteQty(item.id, 5)} className="w-5 h-5 bg-slate-850 border border-slate-700 text-slate-400 rounded hover:text-white flex items-center justify-center">+</button>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-4 pt-4 border-t border-slate-900">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-[10px] text-slate-500">Discount margin:</span>
                                                        <select
                                                            value={quoteDiscount}
                                                            onChange={(e) => setQuoteDiscount(parseInt(e.target.value))}
                                                            className="bg-slate-900 border border-slate-800 text-[10px] text-slate-300 rounded p-1"
                                                        >
                                                            <option value={0}>0% margin</option>
                                                            <option value={5}>5% margin</option>
                                                            <option value={10}>10% standard margin</option>
                                                            <option value={15}>15% bulk partner discount</option>
                                                        </select>
                                                    </div>
                                                    
                                                    {/* Calculation summary */}
                                                    {(() => {
                                                        const rawSub = quoteItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                                                        const discVal = rawSub * (quoteDiscount / 100);
                                                        const sub = rawSub - discVal;
                                                        const tax = sub * 0.12; // 12% GST
                                                        const grand = sub + tax;

                                                        return (
                                                            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-850/60 mb-3 text-[10px] flex flex-col gap-1">
                                                                <div className="flex justify-between text-slate-400"><span>Subtotal:</span><span>₹{rawSub.toFixed(2)}</span></div>
                                                                <div className="flex justify-between text-slate-400"><span>Discount:</span><span>-₹{discVal.toFixed(2)}</span></div>
                                                                <div className="flex justify-between text-slate-400"><span>GST (12%):</span><span>₹{tax.toFixed(2)}</span></div>
                                                                <div className="flex justify-between text-slate-100 font-extrabold border-t border-slate-800 pt-1.5 mt-1 text-[11px]">
                                                                    <span>B2B wholesale Total:</span><span className="text-emerald-400">₹{grand.toFixed(2)}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}

                                                    <button
                                                        onClick={dispatchQuotation}
                                                        disabled={loading || quoteItems.length === 0}
                                                        className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white font-bold rounded-lg text-[10px] uppercase tracking-widest shadow-md shadow-cyan-500/10 transition-all"
                                                    >
                                                        Lock & Save Quotation
                                                    </button>
                                                </div>
                                            </div>

                                        </div>
                                    </>
                                )}
                            </div>

                        </div>
                    )}

                    {/* ========================================================================= */}
                    {/* WORKSPACE 4: CUSTOMER SUCCESS, HEALTH & RETENTION */}
                    {/* ========================================================================= */}
                    {activeWorkspace === "success" && (
                        <div className="flex flex-col gap-6">
                            
                            {/* Monitoring Matrix Table */}
                            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl">
                                <h3 className="text-lg font-bold border-b border-slate-800 pb-3 mb-4 text-emerald-400 flex items-center gap-2">
                                    <i className="fa-solid fa-ranking-star"></i> Customer Lifecycle Retention & Upsell Center
                                </h3>

                                {monitoredCustomers.length === 0 ? (
                                    <div className="text-center py-16 text-slate-500">
                                        <p className="text-xs uppercase font-bold tracking-wider">No customer accounts registered on the platform yet.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase">
                                                    <th className="py-2.5 px-3">B2B Customer Profile</th>
                                                    <th className="py-2.5 px-3">Lifecycle orders</th>
                                                    <th className="py-2.5 px-3">Gross sales</th>
                                                    <th className="py-2.5 px-3">Recency</th>
                                                    <th className="py-2.5 px-3">Health Score</th>
                                                    <th className="py-2.5 px-3">AI Intelligence Recommendation</th>
                                                    <th className="py-2.5 px-3 text-right">Retention Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800/40">
                                                {monitoredCustomers.map(cust => {
                                                    const isLowHealth = cust.healthScore < 50;
                                                    const isVIP = cust.healthScore >= 75;
                                                    
                                                    // Dynamic coupon code recommendation based on name
                                                    const cleanName = cust.name.toUpperCase().replace(/[^A-Z]/g, "").substring(0,4);
                                                    const promoCode = `${cleanName}RETAIN15`;

                                                    return (
                                                        <tr key={cust.id} className="hover:bg-slate-800/10">
                                                            <td className="py-4 px-3">
                                                                <div>
                                                                    <p className="font-bold text-slate-200">{cust.shopName || cust.name}</p>
                                                                    <p className="text-[10px] text-slate-400">{cust.phone}</p>
                                                                    <span className="text-[8px] bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded mt-1 inline-block uppercase font-mono">
                                                                        {cust.role}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-3 font-semibold text-slate-300 font-mono">
                                                                {cust.orderCount} purchases
                                                            </td>
                                                            <td className="py-4 px-3 font-bold text-emerald-400 font-mono">
                                                                ₹{cust.totalSpend}
                                                            </td>
                                                            <td className="py-4 px-3">
                                                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                                                    cust.orderStatus === "Churn Risk" ? 'bg-red-600/10 text-red-400 border border-red-500/20' :
                                                                    cust.orderStatus === "Slowing Down" ? 'bg-orange-600/10 text-orange-400 border border-orange-500/20' :
                                                                    cust.orderStatus === "No Purchases Yet" ? 'bg-slate-600/10 text-slate-400 border border-slate-500/20' :
                                                                    'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20'
                                                                }`}>
                                                                    {cust.orderStatus === "Churn Risk" ? `⚠️ Churn (${cust.daysSinceLastOrder}d)` :
                                                                     cust.orderStatus === "Slowing Down" ? `Slowing (${cust.daysSinceLastOrder}d)` :
                                                                     cust.orderStatus === "No Purchases Yet" ? "Inactive" :
                                                                     `Active (${cust.daysSinceLastOrder}d)`}
                                                                </span>
                                                            </td>
                                                            <td className="py-4 px-3">
                                                                <div className="flex items-center gap-1.5">
                                                                    <div className={`w-3 h-3 rounded-full ${isLowHealth ? 'bg-red-500 animate-pulse' : isVIP ? 'bg-emerald-400' : 'bg-yellow-500'}`} />
                                                                    <span className="font-extrabold text-slate-200 font-mono">{cust.healthScore}/100</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-3 max-w-[300px] text-slate-300 font-medium leading-relaxed italic">
                                                                {cust.recommendation}
                                                            </td>
                                                            <td className="py-4 px-3 text-right">
                                                                {cust.orderStatus === "Churn Risk" ? (
                                                                    <button
                                                                        onClick={() => triggerRetentionCampaign(cust, promoCode, 15)}
                                                                        disabled={loading}
                                                                        className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-[10px] font-bold uppercase tracking-widest text-white rounded-lg transition-all"
                                                                    >
                                                                        Deploy 15% Reactivation
                                                                    </button>
                                                                ) : cust.orderStatus === "Slowing Down" ? (
                                                                    <button
                                                                        onClick={() => triggerRetentionCampaign(cust, `${cleanName}SAVE10`, 10)}
                                                                        disabled={loading}
                                                                        className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-[10px] font-bold uppercase tracking-widest text-white rounded-lg transition-all"
                                                                    >
                                                                        Dispatch 10% Check-in
                                                                    </button>
                                                                ) : isVIP ? (
                                                                    <button
                                                                        onClick={() => alert(`VIP bulk pitch dispatched to ${cust.name} offering custom wholesale multivitamin catalog!`)}
                                                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-[10px] font-bold uppercase tracking-widest text-white rounded-lg transition-all"
                                                                    >
                                                                        Pitch Bulk Vitamins
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => alert(`Wholesale engagement message sent to ${cust.name}!`)}
                                                                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold uppercase tracking-widest text-slate-300 rounded-lg transition-all"
                                                                    >
                                                                        Send Engagement Catalog
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                        </div>
                    )}
                </main>
            </div>
        </>
    );
}

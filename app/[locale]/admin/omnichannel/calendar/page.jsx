"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";

export default function ContentCalendar() {
    const { cartCount, toggleCart } = useCart();
    const { data: session, status } = useSession();
    const router = useRouter();
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Calendar State
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
        else if (status === "authenticated" && session?.user?.role === "CUSTOMER") router.push("/");
        else if (status === "authenticated") fetchContent();
    }, [status, session, router]);

    const fetchContent = async () => {
        try {
            const res = await fetch("/api/admin/omnichannel/content");
            const data = await res.json();
            if (data.success) {
                setContent(data.content);
            }
        } catch (error) {
            console.error("Failed to load content", error);
        } finally {
            setLoading(false);
        }
    };

    // Calendar Logic
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    // Map content to specific days
    const contentByDay = {};
    content.forEach(item => {
        // Use publishDate if available, otherwise use updatedAt (when it was drafted)
        const dateStr = item.publishDate || item.updatedAt;
        if (!dateStr) return;
        const d = new Date(dateStr);
        if (d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()) {
            const day = d.getDate();
            if (!contentByDay[day]) contentByDay[day] = [];
            contentByDay[day].push(item);
        }
    });

    const STATUS_COLORS = {
        DRAFT: { bg: "#3B1F06", text: "#F59E0B", border: "#78350F" },
        PUBLISHED: { bg: "#064E3B", text: "#34D399", border: "#065F46" },
    };

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0A0A0F 0%, #0D1117 50%, #0A0A0F 100%)", color: "white", fontFamily: "'Inter', sans-serif" }}>
            <Navbar cartCount={cartCount} toggleCart={toggleCart} />
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 16px" }}>
                
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
                    <div>
                        <Link href="/admin/omnichannel" style={{ color: "#6B7280", fontSize: "0.85rem", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                            ← Back to Hub
                        </Link>
                        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "white", margin: 0 }}>
                            📅 Content Calendar
                        </h1>
                        <p style={{ color: "#9CA3AF", marginTop: 6, fontSize: "0.95rem" }}>
                            Visualize your omnichannel publishing schedule.
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <button onClick={prevMonth} style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "white", padding: "8px 16px", borderRadius: 8, cursor: "pointer" }}>←</button>
                        <h2 style={{ fontSize: "1.2rem", margin: "0 10px", minWidth: 150, textAlign: "center" }}>
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h2>
                        <button onClick={nextMonth} style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "white", padding: "8px 16px", borderRadius: 8, cursor: "pointer" }}>→</button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
                    
                    {/* Days of Week */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: "rgba(255,255,255,0.05)", textAlign: "center", padding: "12px 0", fontWeight: 700, color: "#9CA3AF", fontSize: "0.85rem" }}>
                        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                    </div>

                    {loading ? (
                        <div style={{ padding: 60, textAlign: "center", color: "#6B7280" }}>Loading calendar...</div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gridAutoRows: "minmax(120px, auto)" }}>
                            
                            {/* Empty padding days */}
                            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                <div key={`empty-${i}`} style={{ borderRight: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: 8, background: "rgba(255,255,255,0.01)" }}></div>
                            ))}

                            {/* Actual days */}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
                                const items = contentByDay[day] || [];

                                return (
                                    <div key={day} style={{ 
                                        borderRight: "1px solid rgba(255,255,255,0.05)", 
                                        borderBottom: "1px solid rgba(255,255,255,0.05)", 
                                        padding: 8,
                                        background: isToday ? "rgba(244,63,94,0.05)" : "transparent"
                                    }}>
                                        <div style={{ 
                                            fontSize: "0.85rem", fontWeight: isToday ? 800 : 600, 
                                            color: isToday ? "#F43F5E" : "#9CA3AF",
                                            marginBottom: 8, textAlign: "right", paddingRight: 4
                                        }}>
                                            {day}
                                        </div>
                                        
                                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                            {items.map(item => {
                                                const c = STATUS_COLORS[item.status] || STATUS_COLORS.DRAFT;
                                                return (
                                                    <Link href={`/admin/omnichannel/content`} key={item.id} style={{
                                                        textDecoration: "none",
                                                        padding: "6px 8px", borderRadius: 6,
                                                        background: c.bg, border: `1px solid ${c.border}`,
                                                        fontSize: "0.7rem", color: "white",
                                                        display: "flex", flexDirection: "column", gap: 4,
                                                        transition: "transform 0.1s",
                                                    }} onMouseOver={e=>e.currentTarget.style.transform="scale(1.02)"} onMouseOut={e=>e.currentTarget.style.transform="scale(1)"}>
                                                        <span style={{ fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                            {item.title}
                                                        </span>
                                                        <span style={{ color: c.text, fontWeight: 700, fontSize: "0.6rem", textTransform: "uppercase" }}>
                                                            {item.status}
                                                        </span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

"use client";
import { usePathname, useRouter } from "next/navigation";

/**
 * GlobalBackButton
 * Automatically shows a floating back button on all inner pages (non-home pages).
 * Home pages: /en, /hi, /bn — no button shown.
 * Admin pages: no button shown (they have their own nav).
 */
export default function GlobalBackButton() {
    const pathname = usePathname();
    const router = useRouter();

    // Don't show on home pages
    const isHomePage = /^\/[a-z]{2}(\/)?$/.test(pathname);
    // Don't show on admin, rider dashboard, or retailer dashboard (they have their own nav)
    const isExcluded = /\/(admin|rider\/dashboard|retailer\/dashboard|login|signup|forgot-password|reset-password)/.test(pathname);

    if (isHomePage || isExcluded) return null;

    return (
        <button
            onClick={() => router.back()}
            title="Go Back"
            style={{
                position: "fixed",
                top: "16px",
                left: "16px",
                zIndex: 1000,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                background: "rgba(15, 23, 42, 0.85)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "12px",
                color: "#e2e8f0",
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                transition: "all 0.2s",
                letterSpacing: "0.01em"
            }}
            onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(30, 41, 59, 0.95)";
                e.currentTarget.style.transform = "translateX(-2px)";
            }}
            onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(15, 23, 42, 0.85)";
                e.currentTarget.style.transform = "translateX(0)";
            }}
        >
            ← Back
        </button>
    );
}

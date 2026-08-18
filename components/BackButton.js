"use client";
import { useRouter } from "next/navigation";

/**
 * Reusable Back Button component.
 * Shows a styled "← Go Back" button. Uses router.back() by default,
 * or navigates to a specific fallback href if provided.
 */
export default function BackButton({ href = null, label = "← Go Back", style = {} }) {
    const router = useRouter();

    const handleClick = () => {
        if (href) {
            router.push(href);
        } else {
            router.back();
        }
    };

    return (
        <button
            onClick={handleClick}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "10px",
                color: "#94a3b8",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                backdropFilter: "blur(8px)",
                ...style
            }}
            onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                e.currentTarget.style.color = "#e2e8f0";
            }}
            onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "#94a3b8";
            }}
        >
            ← {label === "← Go Back" ? "Go Back" : label}
        </button>
    );
}

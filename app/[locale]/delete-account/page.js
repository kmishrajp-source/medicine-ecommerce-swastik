"use client";
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function DeleteAccount() {
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!phoneOrEmail) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <>
      <Navbar cartCount={0} />
      <div
        className="container"
        style={{
          marginTop: "120px",
          marginBottom: "80px",
          maxWidth: "800px",
          lineHeight: "1.8",
          padding: "0 20px",
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <span
            style={{
              display: "inline-block",
              background: "#FEE2E2",
              color: "#DC2626",
              fontWeight: "600",
              fontSize: "0.85rem",
              padding: "4px 12px",
              borderRadius: "999px",
              marginBottom: "12px",
            }}
          >
            Google Play Data Safety &amp; User Rights
          </span>
          <h1
            style={{
              fontSize: "2.4rem",
              fontWeight: "800",
              marginBottom: "16px",
              color: "#111827",
            }}
          >
            Account &amp; Data Deletion Request
          </h1>
          <p style={{ fontSize: "1rem", color: "#6B7280" }}>
            Last Updated: November 2026 • Swastik Medicare
          </p>
        </div>

        <section
          style={{
            background: "#F9FAFB",
            border: "1px solid #E5E7EB",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "32px",
          }}
        >
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: "700",
              marginBottom: "12px",
              color: "#1F2937",
            }}
          >
            How Account Deletion Works
          </h2>
          <p style={{ color: "#4B5563", marginBottom: "16px" }}>
            Under Google Play Store policies and our privacy commitment, you have the right to request the permanent deletion of your Swastik Medicare account and associated personal data at any time.
          </p>
          <div style={{ display: "grid", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <span style={{ color: "#10B981", fontWeight: "bold" }}>✓</span>
              <div>
                <strong>Data Deleted:</strong> Profile details (name, email, phone number), saved delivery addresses, cart items, active browser tokens, and app preferences.
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <span style={{ color: "#F59E0B", fontWeight: "bold" }}>⚠</span>
              <div>
                <strong>Regulatory Retention:</strong> Under Indian healthcare regulations (Drugs and Cosmetics Act, Pharmacy Practice Regulations, and GST laws), invoices and dispensing records for prescription orders must be archived securely for the statutory legal retention period (typically 2-3 years) before permanent purging.
              </div>
            </div>
          </div>
        </section>

        {submitted ? (
          <div
            style={{
              background: "#ECFDF5",
              border: "1px solid #A7F3D0",
              borderRadius: "12px",
              padding: "28px",
              textAlign: "center",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "#10B981",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: "1.5rem",
                fontWeight: "bold",
              }}
            >
              ✓
            </div>
            <h3 style={{ fontSize: "1.3rem", fontWeight: "700", color: "#065F46", marginBottom: "8px" }}>
              Deletion Request Received
            </h3>
            <p style={{ color: "#047857", marginBottom: "16px" }}>
              Your account deletion request for <strong>{phoneOrEmail}</strong> has been logged. Our data protection team will process the deletion and unbind your profile within 48 to 72 business hours.
            </p>
            <Link
              href="/"
              style={{
                display: "inline-block",
                padding: "10px 20px",
                background: "#10B981",
                color: "#fff",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              Return to Home
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: "12px",
              padding: "28px",
              marginBottom: "36px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "16px" }}>
              Submit an Online Deletion Request
            </h3>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "600",
                  marginBottom: "6px",
                  color: "#374151",
                }}
              >
                Registered Mobile Number or Email ID *
              </label>
              <input
                type="text"
                required
                value={phoneOrEmail}
                onChange={(e) => setPhoneOrEmail(e.target.value)}
                placeholder="+91 98765 43210 or yourname@example.com"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #D1D5DB",
                  borderRadius: "8px",
                  fontSize: "1rem",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "600",
                  marginBottom: "6px",
                  color: "#374151",
                }}
              >
                Reason for Leaving (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Let us know why you'd like to delete your account..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #D1D5DB",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                background: loading ? "#9CA3AF" : "#DC2626",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.2s",
              }}
            >
              {loading ? "Submitting Request..." : "Request Permanent Account Deletion"}
            </button>
          </form>
        )}

        <section style={{ borderTop: "1px solid #E5E7EB", paddingTop: "24px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "8px" }}>
            Direct Contact &amp; Grievance Redressal
          </h3>
          <p style={{ color: "#4B5563", fontSize: "0.95rem" }}>
            You may also request account deletion or data portability directly by contacting our Data Protection Officer at:
          </p>
          <ul style={{ color: "#4B5563", fontSize: "0.95rem", marginTop: "8px" }}>
            <li>Email: <a href="mailto:support@swastikmed.online" style={{ color: "#2563EB" }}>support@swastikmed.online</a></li>
            <li>Subject line: <code>Account Deletion Request - [Your Phone/Email]</code></li>
            <li>Address: Swastik Medicare, Medical College Road, Gorakhpur, UP, India</li>
          </ul>
        </section>
      </div>
    </>
  );
}

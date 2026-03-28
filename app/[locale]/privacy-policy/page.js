"use client";
import Navbar from "@/components/Navbar";

export default function PrivacyPolicy() {
    return (
        <>
            <Navbar cartCount={0} />
            <div className="container" style={{ marginTop: "120px", marginBottom: "60px", maxWidth: "800px", lineHeight: "1.8" }}>
                <h1 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "40px", borderBottom: "4px solid #2563EB", display: "inline-block" }}>
                    Privacy Policy
                </h1>
                
                <p style={{ fontSize: "1.1rem", color: "#4B5563", marginBottom: "30px" }}>
                    Last Updated: March 24, 2026
                </p>

                <section style={{ marginBottom: "40px" }}>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "15px", color: "#111827" }}>1. Introduction</h2>
                    <p>
                        Swastik Medicare ("we," "our," or "us"), owned by <strong>Pranshu Investment Ltd</strong>, is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
                    </p>
                </section>

                <section style={{ marginBottom: "40px" }}>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "15px", color: "#111827" }}>2. Information We Collect</h2>
                    <ul>
                        <li><strong>Personal Information:</strong> Name, phone number, email address, and billing information provided during registration or checkout.</li>
                        <li><strong>Health Data:</strong> Prescriptions and medical history uploaded for service fulfillment.</li>
                        <li><strong>Usage Data:</strong> IP addresses, browser types, and interaction logs for security and performance monitoring.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: "40px" }}>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "15px", color: "#111827" }}>3. How We Use Your Information</h2>
                    <p>
                        We use your data to provide healthcare services, process orders, verify identities via OTP, and ensure the security of our directory listings. <strong>We do not sell your personal contact information to third parties.</strong>
                    </p>
                </section>

                <section style={{ marginBottom: "40px" }}>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "15px", color: "#111827" }}>4. Data Security</h2>
                    <p>
                        We implement industry-standard security measures, including Row Level Security (RLS) and encrypted sessions, to protect your data. Sensitive contact details are masked for unauthorized users.
                    </p>
                </section>

                <div style={{ padding: "30px", background: "#F3F4F6", borderRadius: "16px", marginTop: "60px", textAlign: "center" }}>
                    <p style={{ margin: 0, fontWeight: "600" }}>Owned and Operated by:</p>
                    <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: "800", color: "#111827" }}>Pranshu Investment Ltd</p>
                    <p style={{ margin: 0, color: "#6B7280" }}>Gorakhpur, India</p>
                </div>
            </div>
        </>
    );
}

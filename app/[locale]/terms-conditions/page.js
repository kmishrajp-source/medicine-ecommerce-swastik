"use client";
import Navbar from "@/components/Navbar";

export default function TermsConditions() {
    return (
        <>
            <Navbar cartCount={0} />
            <div className="container" style={{ marginTop: "120px", marginBottom: "60px", maxWidth: "800px", lineHeight: "1.8" }}>
                <h1 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "40px", borderBottom: "4px solid #10B981", display: "inline-block" }}>
                    Terms & Conditions
                </h1>
                
                <p style={{ fontSize: "1.1rem", color: "#4B5563", marginBottom: "30px" }}>
                    Last Updated: March 24, 2026
                </p>

                <section style={{ marginBottom: "40px" }}>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "15px", color: "#111827" }}>1. Global Agreement</h2>
                    <p>
                        By accessing Swastik Medicare, you agree to comply with these Terms and Conditions. The platform is owned by <strong>Pranshu Investment Ltd</strong>.
                    </p>
                </section>

                <section style={{ marginBottom: "40px" }}>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "15px", color: "#111827" }}>2. Service Description</h2>
                    <p>
                        Swastik Medicare provides a directory of healthcare services and facilitates lead generation and order management. We do not provide direct medical advice.
                    </p>
                </section>

                <section style={{ marginBottom: "40px" }}>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "15px", color: "#111827" }}>3. User Responsibilities</h2>
                    <p>
                        Users must provide accurate information, including phone numbers for OTP verification. Scraping or automated harvesting of directory data is strictly prohibited and protected by rate-limiting measures.
                    </p>
                </section>

                <section style={{ marginBottom: "40px" }}>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "15px", color: "#111827" }}>4. Role-Based Access</h2>
                    <p>
                        Certain features, such as full contact details and order management, require a verified account. Admin sections are strictly reserved for authorized personnel of Pranshu Investment Ltd.
                    </p>
                </section>

                <section style={{ marginBottom: "40px" }}>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "15px", color: "#111827" }}>5. Limitation of Liability</h2>
                    <p>
                        Pranshu Investment Ltd shall not be liable for any indirect or consequential damages arising from the use of the platform.
                    </p>
                </section>

                <div style={{ padding: "30px", background: "#F3F4F6", borderRadius: "16px", marginTop: "60px", textAlign: "center" }}>
                    <p style={{ margin: 0, fontWeight: "600" }}>Legal Entity:</p>
                    <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: "800", color: "#111827" }}>Pranshu Investment Ltd</p>
                </div>
            </div>
        </>
    );
}

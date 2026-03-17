import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Policy() {
    return (
        <>
            <Navbar />
            <div className="container" style={{ marginTop: '120px', paddingBottom: '60px', maxWidth: '900px' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '40px', color: 'var(--primary)' }}>Legal & Policies</h1>

                <section style={{ background: 'white', padding: '40px', borderRadius: '16px', marginBottom: '30px', boxShadow: 'var(--shadow-sm)' }}>
                    <h2 id="privacy" style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>🔒 Privacy Policy</h2>
                    <p style={{ marginBottom: '15px' }}><strong>Last Updated: March 3, 2026</strong></p>
                    <p>At Swastik Medicare, we are committed to protecting your health and personal information. This policy explains how we handle your data in accordance with Google Play Developer policies.</p>

                    <h3 style={{ marginTop: '20px' }}>1. Data We Collect</h3>
                    <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                        <li><strong>Personal Identification:</strong> Name, phone number, and email address for account management.</li>
                        <li><strong>Health Information:</strong> Prescription images and medication history to fulfill legal pharmacy requirements.</li>
                        <li><strong>Location Data:</strong> We collect precise location data to connect you with the nearest pharmacy and track delivery agents in real-time.</li>
                        <li><strong>Device Information:</strong> Basic device ID and manufacturer info for security and push notifications.</li>
                    </ul>

                    <h3 style={{ marginTop: '20px' }}>2. Data Safety & Usage</h3>
                    <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                        <li>We do not sell your personal or medical data to third-party advertisers.</li>
                        <li>Medical records/Prescriptions are only accessible to verified pharmacists and authorized clinical staff.</li>
                        <li>All communications are encrypted using SSL/TLS protocols.</li>
                    </ul>

                    <h3 style={{ marginTop: '20px' }}>3. Data Retention & Deletion</h3>
                    <p>We retain your data as long as your account is active. You can request account deletion and data removal at any time by:</p>
                    <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                        <li>Going to <strong>Account Settings &rarr; Delete Account</strong> in the app.</li>
                        <li>Emailing our data officer at <strong>swastilmedicare.gelp@gmail.com</strong>.</li>
                    </ul>
                    <p>Note: Some data might be retained for legal compliance (e.g., pharmacy audit logs) as required by local medicine laws.</p>
                </section>

                <section style={{ background: 'white', padding: '40px', borderRadius: '16px', marginBottom: '30px', boxShadow: 'var(--shadow-sm)' }}>
                    <h2 id="terms" style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>📄 Terms & Conditions</h2>
                    <p>By using our platform, you agree to the following terms...</p>
                    <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                        <li>You must provide a valid prescription for Rx medicines.</li>
                        <li>We are a platform connecting you to verified sellers and professionals.</li>
                        <li>Prices are subject to change based on manufacturer updates.</li>
                    </ul>
                </section>

                <section style={{ background: 'white', padding: '40px', borderRadius: '16px', marginBottom: '30px', boxShadow: 'var(--shadow-sm)' }}>
                    <h2 id="partner-agreement" style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>🤝 Partner Distribution Agreement</h2>
                    <p>This agreement outlines the terms for those joining the Swastik Medicare ecosystem as Delivery Partners or Growth Partners.</p>
                    <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                        <li><strong>Eligibility:</strong> Partners must be at least 18 years of age and possess valid identification.</li>
                        <li><strong>Identity Verification:</strong> You agree to provide a valid Government ID (Aadhaar/DL) for verification. The registration fee is non-refundable if verification fails.</li>
                        <li><strong>Compliance:</strong> You agree to represent the brand professionally and follow distribution protocols.</li>
                        <li><strong>Legal Authority:</strong> By registering, you warrant that you have full legal authority to bind yourself or your organization to these terms.</li>
                    </ul>
                </section>
            </div>
            <Footer />
        </>
    );
}

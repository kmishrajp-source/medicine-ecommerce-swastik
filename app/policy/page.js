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
                    <p>At Swastik Medicare, we prioritize your data privacy...</p>
                    <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                        <li>We do not share your medical records with third parties without consent.</li>
                        <li>All payment data is encrypted and handled by secure gateways.</li>
                        <li>We use cookies to improve your browsing experience.</li>
                    </ul>
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
                    <h2 id="refund" style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>💸 Return & Refund Policy</h2>
                    <p>We offer a hassle-free return policy for damaged or incorrect items...</p>
                    <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                        <li>Returns accepted within 7 days of delivery.</li>
                        <li>Refunds are processed to the original payment method within 5-7 business days.</li>
                        <li>Cut strips or opened medicines are not eligible for return.</li>
                    </ul>
                </section>
            </div>
            <Footer />
        </>
    );
}

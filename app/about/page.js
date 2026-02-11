import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function About() {
    return (
        <>
            <Navbar />
            <div className="container" style={{ marginTop: '120px', paddingBottom: '60px', maxWidth: '800px' }}>
                <h1 style={{ color: 'var(--primary)', marginBottom: '20px' }}>About Swastik Medicare</h1>
                <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                    <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '20px', color: '#444' }}>
                        **Swastik Medicare** is a next-generation healthcare platform committed to making quality healthcare accessible, affordable, and transparent for everyone. We believe that health is the real wealth (Swasthya is Sampada), and our mission is to deliver it to your doorstep.
                    </p>

                    <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Our Mission</h3>
                    <p style={{ marginBottom: '20px', color: '#666' }}>
                        To bridge the gap between patients and healthcare providers by leveraging technology to provide seamless delivery of medicines, doctor consultations, and diagnostic services.
                    </p>

                    <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Why Choose Us?</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ marginBottom: '10px' }}>✅ **100% Genuine Medicines**: Sourced directly from manufacturers and authorized distributors.</li>
                        <li style={{ marginBottom: '10px' }}>✅ **Fast Delivery**: Express delivery options to get your essentials when you need them.</li>
                        <li style={{ marginBottom: '10px' }}>✅ **Verified Partners**: All our doctors, labs, and ambulance providers are rigorously verified.</li>
                        <li style={{ marginBottom: '10px' }}>✅ **24/7 Support**: We are always here to help you with your healthcare needs.</li>
                    </ul>

                    <div style={{ marginTop: '40px', padding: '20px', background: '#F3F4F6', borderRadius: '12px', textAlign: 'center' }}>
                        <h4>Our Founder</h4>
                        <p style={{ marginTop: '10px', fontStyle: 'italic' }}>"Building a healthier future for India, one prescription at a time."</p>
                        <p style={{ marginTop: '5px', fontWeight: 'bold' }}>- Kaushalesh Mishra</p>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

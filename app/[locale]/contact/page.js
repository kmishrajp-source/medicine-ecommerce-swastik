import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Contact() {
    return (
        <>
            <Navbar />
            <div className="container" style={{ marginTop: '120px', paddingBottom: '60px', maxWidth: '800px' }}>
                <h1 style={{ color: 'var(--primary)', marginBottom: '20px' }}>Contact Us</h1>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>

                    {/* Contact Info */}
                    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                        <h3 style={{ marginBottom: '20px' }}>Get in Touch</h3>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ fontWeight: 'bold', color: '#333' }}>📍 Head Office</div>
                            <p style={{ color: '#666' }}>98-B, Mayur Vihar Phase II,<br />Delhi, India - 110091</p>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ fontWeight: 'bold', color: '#333' }}>📞 Phone</div>
                            <p style={{ color: 'var(--primary)', fontWeight: 'bold' }}>+91 79921 22974</p>
                            <p style={{ color: '#666', fontSize: '0.9rem' }}>Mon-Sat: 9 AM - 8 PM</p>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ fontWeight: 'bold', color: '#333' }}>💬 WhatsApp AI Assistant</div>
                            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '10px' }}>Get instant help with medicine availability, prescriptions, and order tracking.</p>
                            <a href="https://wa.me/917992122974" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ background: '#25D366', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                                <i className="fa-brands fa-whatsapp" style={{ fontSize: '1.2rem' }}></i> Chat on WhatsApp
                            </a>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ fontWeight: 'bold', color: '#333' }}>📧 Email</div>
                            <p style={{ color: 'var(--primary)' }}>swastikmedicare.help@gmail.com</p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                        <h3 style={{ marginBottom: '20px' }}>Send a Message</h3>
                        <form>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#666' }}>Your Name</label>
                                <input type="text" placeholder="Enter name" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#666' }}>Email / Phone</label>
                                <input type="text" placeholder="Enter email or phone" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#666' }}>Message</label>
                                <textarea placeholder="How can we help?" rows="4" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Send Message</button>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

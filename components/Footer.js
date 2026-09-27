import { Link } from '@/i18n/navigation';

export default function Footer() {
    return (
        <footer style={{ background: '#111827', color: 'white', paddingTop: '60px', paddingBottom: '20px', marginTop: '60px' }}>
            <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>

                {/* Column 1: Brand */}
                <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#3B82F6' }}>
                        <i className="fa-solid fa-heart-pulse"></i> Swastik Medicare
                    </h2>
                    <p style={{ color: '#9CA3AF', lineHeight: '1.6' }}>
                        Your trusted healthcare partner. From medicines to doctors, diagnostics to ambulance - we cover it all.
                    </p>
                    <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                        <a href="https://wa.me/917992122974" style={{ color: 'white', fontSize: '1.2rem' }}><i className="fa-brands fa-whatsapp"></i></a>
                        <a href="#" style={{ color: 'white', fontSize: '1.2rem' }}><i className="fa-brands fa-facebook"></i></a>
                        <a href="#" style={{ color: 'white', fontSize: '1.2rem' }}><i className="fa-brands fa-twitter"></i></a>
                        <a href="#" style={{ color: 'white', fontSize: '1.2rem' }}><i className="fa-brands fa-instagram"></i></a>
                        <a href="#" style={{ color: 'white', fontSize: '1.2rem' }}><i className="fa-brands fa-linkedin"></i></a>
                    </div>
                </div>

                {/* Column 2: Quick Links */}
                <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', borderBottom: '2px solid #3B82F6', display: 'inline-block' }}>Services</h3>
                    <ul style={{ listStyle: 'none', padding: 0, color: '#D1D5DB' }}>
                        <li style={{ marginBottom: '10px' }}><Link href="/shop" style={{ color: 'inherit', textDecoration: 'none' }}>Order Medicine</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link href="/doctors" style={{ color: 'inherit', textDecoration: 'none' }}>Book Doctor</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link href="/labs" style={{ color: 'inherit', textDecoration: 'none' }}>Lab Tests</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link href="/bio/genetic-tests" style={{ color: '#A78BFA', textDecoration: 'none', fontWeight: 'bold' }}>🧬 Genetic Testing</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link href="/ambulance" style={{ color: 'inherit', textDecoration: 'none' }}>Book Ambulance</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link href="/ayurveda" style={{ color: '#059669', textDecoration: 'none', fontWeight: 'bold' }}>Ayurveda Research</Link></li>
                    </ul>
                </div>

                {/* Column 3: Research & Data */}
                <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', borderBottom: '2px solid #7C3AED', display: 'inline-block' }}>Research &amp; Data</h3>
                    <ul style={{ listStyle: 'none', padding: 0, color: '#D1D5DB' }}>
                        <li style={{ marginBottom: '10px' }}><Link href="/bio/bioinformatics" style={{ color: 'inherit', textDecoration: 'none' }}>Bioinformatics Hub</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link href="/bio/genetic-tests" style={{ color: '#A78BFA', textDecoration: 'none', fontWeight: 'bold' }}>🧬 Genetic Test Labs</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link href="/ayurveda/research" style={{ color: 'inherit', textDecoration: 'none' }}>Ayurveda Research</Link></li>
                    </ul>
                </div>

                {/* Column 4: Company */}
                <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', borderBottom: '2px solid #3B82F6', display: 'inline-block' }}>Company</h3>
                    <ul style={{ listStyle: 'none', padding: 0, color: '#D1D5DB' }}>
                        <li style={{ marginBottom: '10px' }}><Link href="/about" style={{ color: 'inherit', textDecoration: 'none' }}>About Us</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link href="/contact" style={{ color: 'inherit', textDecoration: 'none' }}>Contact Us</Link></li>
                        <li style={{ marginBottom: '10px' }}><a href="mailto:swastikmedicare.help@gmail.com" style={{ color: '#9CA3AF', textDecoration: 'none', fontSize: '0.9rem' }}>swastikmedicare.help@gmail.com</a></li>
                        <li style={{ marginBottom: '10px' }}><Link href="/advertise" style={{ color: 'inherit', textDecoration: 'none' }}>Advertise With Us</Link></li>
                    </ul>
                </div>

                {/* Column 4: Legal */}
                <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', borderBottom: '2px solid #3B82F6', display: 'inline-block' }}>Legal</h3>
                    <ul style={{ listStyle: 'none', padding: 0, color: '#D1D5DB' }}>
                        <li style={{ marginBottom: '10px' }}><Link href="/legal/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link href="/legal/terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms & Conditions</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link href="/legal/refund" style={{ color: 'inherit', textDecoration: 'none' }}>Refund Policy</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link href="/shipping-delivery-policy" style={{ color: 'inherit', textDecoration: 'none' }}>Shipping & Delivery Policy</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link href="/prescription-policy" style={{ color: 'inherit', textDecoration: 'none' }}>Prescription Policy</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link href="/medical-disclaimer" style={{ color: 'inherit', textDecoration: 'none' }}>Medical Disclaimer</Link></li>
                    </ul>
                </div>
            </div>

            <div style={{ textAlign: 'center', borderTop: '1px solid #374151', paddingTop: '20px', color: '#6B7280', fontSize: '0.9rem' }}>
                &copy; {new Date().getFullYear()} Swastik Medicare. All rights reserved. | <Link href="/developer" style={{ color: '#6B7280' }}>Developer Settings</Link>
            </div>
        </footer>
    );
}

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
                        <li style={{ marginBottom: '10px' }}><Link href="/ambulance" style={{ color: 'inherit', textDecoration: 'none' }}>Book Ambulance</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link href="/shop/ayurvedic" style={{ color: 'inherit', textDecoration: 'none' }}>Ayurveda</Link></li>
                    </ul>
                </div>

                {/* Column 3: Company */}
                <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', borderBottom: '2px solid #3B82F6', display: 'inline-block' }}>Company</h3>
                    <ul style={{ listStyle: 'none', padding: 0, color: '#D1D5DB' }}>
                        <li style={{ marginBottom: '10px' }}><Link href="/about" style={{ color: 'inherit', textDecoration: 'none' }}>About Us</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link href="/contact" style={{ color: 'inherit', textDecoration: 'none' }}>Contact Us</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link href="/partner" style={{ color: 'inherit', textDecoration: 'none' }}>Partner Portal</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link href="/advertise" style={{ color: 'inherit', textDecoration: 'none' }}>Advertise With Us</Link></li>
                    </ul>
                </div>

                {/* Column 4: Legal */}
                <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', borderBottom: '2px solid #3B82F6', display: 'inline-block' }}>Legal</h3>
                    <ul style={{ listStyle: 'none', padding: 0, color: '#D1D5DB' }}>
                        <li style={{ marginBottom: '10px' }}><Link href="/policy#privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link href="/policy#terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms & Conditions</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link href="/policy#refund" style={{ color: 'inherit', textDecoration: 'none' }}>Refund Policy</Link></li>
                    </ul>
                </div>
            </div>

            <div style={{ textAlign: 'center', borderTop: '1px solid #374151', paddingTop: '20px', color: '#6B7280', fontSize: '0.9rem' }}>
                &copy; {new Date().getFullYear()} Swastik Medicare. All rights reserved. | <Link href="/developer" style={{ color: '#6B7280' }}>Developer Settings</Link>
            </div>
        </footer>
    );
}

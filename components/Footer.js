import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function Footer() {
    const t = useTranslations('Footer');
    const tContact = useTranslations('Contact');

    return (
        <footer style={{ background: '#111827', color: 'white', paddingTop: '60px', paddingBottom: '20px', marginTop: '60px' }}>
            <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>

                {/* Column 1: Brand */}
                <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#3B82F6' }}>
                        <i className="fa-solid fa-heart-pulse"></i> Swastik Medicare
                    </h2>
                    <p style={{ color: '#9CA3AF', lineHeight: '1.6' }}>
                        {t('brand_desc')}
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
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', borderBottom: '2px solid #3B82F6', display: 'inline-block' }}>{t('services')}</h3>
                    <ul style={{ listStyle: 'none', padding: 0, color: '#D1D5DB' }}>
                        <li style={{ marginBottom: '10px' }}><Link href="/shop" style={{ color: 'inherit', textDecoration: 'none' }}>{t('order_medicine')}</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link href="/doctors" style={{ color: 'inherit', textDecoration: 'none' }}>{t('book_doctor')}</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link href="/labs" style={{ color: 'inherit', textDecoration: 'none' }}>{t('lab_tests')}</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link href="/ambulance" style={{ color: 'inherit', textDecoration: 'none' }}>{t('book_ambulance')}</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link href="/shop/ayurvedic" style={{ color: 'inherit', textDecoration: 'none' }}>{t('ayurveda')}</Link></li>
                    </ul>
                </div>

                {/* Column 3: Company */}
                <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', borderBottom: '2px solid #3B82F6', display: 'inline-block' }}>{t('company')}</h3>
                    <ul style={{ listStyle: 'none', padding: 0, color: '#D1D5DB' }}>
                        <li style={{ marginBottom: '10px' }}><Link href="/about" style={{ color: 'inherit', textDecoration: 'none' }}>{t('about_us')}</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link href="/contact" style={{ color: 'inherit', textDecoration: 'none' }}>{t('contact_us')}</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link href="/partner" style={{ color: 'inherit', textDecoration: 'none' }}>{t('partner_portal')}</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link href="/advertise" style={{ color: 'inherit', textDecoration: 'none' }}>{t('advertise')}</Link></li>
                    </ul>
                </div>

                {/* Column 4: Legal */}
                <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', borderBottom: '2px solid #3B82F6', display: 'inline-block' }}>{t('legal')}</h3>
                    <ul style={{ listStyle: 'none', padding: 0, color: '#D1D5DB' }}>
                        <li style={{ marginBottom: '10px' }}><Link href="/privacy-policy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link href="/terms-conditions" style={{ color: 'inherit', textDecoration: 'none' }}>Terms & Conditions</Link></li>
                        <li style={{ marginBottom: '10px' }}><Link href="/policy#refund" style={{ color: 'inherit', textDecoration: 'none' }}>{t('refund')}</Link></li>
                    </ul>
                </div>

                {/* Column 5: Contact */}
                <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', borderBottom: '2px solid #3B82F6', display: 'inline-block' }}>{tContact('call_us')}</h3>
                    <ul style={{ listStyle: 'none', padding: 0, color: '#D1D5DB' }}>
                        <li style={{ marginBottom: '10px' }}><i className="fa-solid fa-envelope" style={{ marginRight: '10px', color: '#3B82F6' }}></i> {tContact('support_email')}</li>
                        <li style={{ marginBottom: '10px' }}><i className="fa-solid fa-phone" style={{ marginRight: '10px', color: '#3B82F6' }}></i> +91 79921 22974</li>
                        <li style={{ marginBottom: '10px' }}><i className="fa-brands fa-whatsapp" style={{ marginRight: '10px', color: '#25D366' }}></i> {tContact('whatsapp')} Support</li>
                    </ul>
                </div>
            </div>

            {/* Regulatory Compliance & Trust Badges */}
            <div className="container" style={{ borderTop: '1px solid #374151', paddingTop: '30px', paddingBottom: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                
                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className="fa-solid fa-shield-halved" style={{ fontSize: '1.5rem', color: '#10B981' }}></i>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px' }}>100% Secure Checkout</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>256-bit SSL Encrypted</div>
                        </div>
                    </div>
                    
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className="fa-solid fa-file-contract" style={{ fontSize: '1.5rem', color: '#F59E0B' }}></i>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px' }}>Drug Licensed Network</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Verified Pharmacy Partners</div>
                        </div>
                    </div>
                </div>

                <div style={{ maxWidth: '800px', textAlign: 'center', fontSize: '0.75rem', color: '#6B7280', lineHeight: '1.6' }}>
                    {t('disclaimer')}
                </div>
            </div>

            <div style={{ textAlign: 'center', backgroundColor: '#030712', padding: '20px', color: '#6B7280', fontSize: '0.9rem', borderTop: '1px solid #1f2937' }}>
                <p style={{ marginBottom: '10px' }}>Owned by Pranshu Investment Ltd</p>
                &copy; {new Date().getFullYear()} Swastik Medicare. All rights reserved. | <Link href="/developer" style={{ color: '#6B7280' }}>Developer Settings</Link>
            </div>
        </footer>
    );
}

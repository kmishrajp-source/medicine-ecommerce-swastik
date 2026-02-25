"use client";
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const changeLanguage = (e) => {
        const nextLocale = e.target.value;
        router.replace(pathname, { locale: nextLocale });
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '10px' }}>
            <i className="fa-solid fa-language" style={{ color: '#047857', fontSize: '1.2rem' }}></i>
            <select
                value={locale}
                onChange={changeLanguage}
                className="glass"
                style={{
                    padding: '6px 30px 6px 10px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    border: '1px solid #10B981',
                    color: '#047857',
                    background: '#ECFDF5',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23047857%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 10px top 50%',
                    backgroundSize: '10px auto',
                }}
                title="Select Language"
            >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="bn">বাংলা (Bengali)</option>
            </select>
        </div>
    );
}

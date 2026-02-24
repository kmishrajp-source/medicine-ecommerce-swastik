"use client";
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const toggleLanguage = () => {
        const nextLocale = locale === 'en' ? 'hi' : 'en';
        // useRouter from next-intl automatically maintains the rest of the path
        router.replace(pathname, { locale: nextLocale });
    };

    return (
        <button
            onClick={toggleLanguage}
            className="btn glass"
            style={{
                marginLeft: '10px',
                padding: '6px 12px',
                fontSize: '0.9rem',
                fontWeight: 600,
                border: '1px solid #10B981',
                color: '#047857',
                background: '#ECFDF5',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
            }}
            title={locale === 'en' ? "Switch to Hindi" : "Switch to English"}
        >
            <i className="fa-solid fa-language"></i>
            {locale === 'en' ? 'हिंदी' : 'Eng'}
        </button>
    );
}

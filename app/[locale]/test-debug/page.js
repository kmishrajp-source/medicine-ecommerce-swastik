"use client";
import { useTranslations } from 'next-intl';

export default function TestDebug() {
    const t = useTranslations('Navigation');
    return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
            <h1>Debug Page</h1>
            <p>If you see this, basic Next-Intl is working.</p>
            <p>Home Translation: {t('home')}</p>
        </div>
    );
}

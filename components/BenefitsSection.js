"use client";
import { useTranslations } from 'next-intl';

export default function BenefitsSection() {
    const t = useTranslations('Conversion');
    
    const benefits = [
        { title: 'Increase Patient Calls', desc: 'Get direct patient inquiries via phone. Verified doctors see 3x more calls.', icon: 'fa-phone-volume', color: 'bg-blue-50 text-blue-600' },
        { title: 'WhatsApp Inquiries', desc: 'Secure high-quality leads directly on your WhatsApp. No middleman.', icon: 'fa-brands fa-whatsapp', color: 'bg-emerald-50 text-emerald-600' },
        { title: 'Gorakhpur Visibility', desc: 'Stand out as a premium provider in local healthcare searches.', icon: 'fa-eye', color: 'bg-indigo-50 text-indigo-600' }
    ];

    return (
        <div className="py-20 bg-[#f8fafc]">
            <div className="max-w-7xl mx-auto px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4">{t('benefits_title')}</h2>
                    <div className="w-20 h-1.5 bg-indigo-600 mx-auto rounded-full"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {benefits.map((b, i) => (
                        <div key={i} className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-50 transition-all hover:-translate-y-2 hover:shadow-2xl">
                            <div className={`w-14 h-14 ${b.color} rounded-2xl flex items-center justify-center text-xl mb-6 shadow-sm`}>
                                <i className={`${b.icon}`}></i>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-3">{b.title}</h3>
                            <p className="text-slate-500 font-bold text-sm leading-relaxed">{b.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

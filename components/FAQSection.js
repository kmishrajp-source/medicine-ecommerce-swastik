"use client";
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function FAQSection() {
    const t = useTranslations('Conversion');
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        { q: 'How do I list my practice?', a: 'Just enter your phone number in the hero section and click "Start Free Listing". Our team will contact you within 2 minutes.' },
        { q: 'Is there any hidden setup cost?', a: 'No, there is zero setup cost for the Basic plan. You only pay the monthly subscription fee.' },
        { q: 'How many leads can I expect?', a: 'On average, featured doctors in Gorakhpur receive 15-20 verified patient leads per week.' },
        { q: 'Can I cancel my subscription anytime?', a: 'Yes, Swastik Medicare offers a no-questions-asked cancellation policy for monthly plans.' }
    ];

    return (
        <div className="py-20 bg-slate-50">
            <div className="max-w-3xl mx-auto px-8">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4">{t('faq_title')}</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Everything you need to know about growing with us</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div key={i} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                            <button 
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full p-6 text-left flex justify-between items-center hover:bg-slate-50 transition-colors"
                            >
                                <span className="font-black text-slate-800 tracking-tight">{faq.q}</span>
                                <i className={`fa-solid fa-chevron-down text-indigo-500 transition-transform ${openIndex === i ? 'rotate-180' : ''}`}></i>
                            </button>
                            {openIndex === i && (
                                <div className="p-6 pt-0 text-sm font-bold text-slate-500 leading-relaxed border-t border-slate-50">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

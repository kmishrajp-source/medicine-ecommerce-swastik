import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function Home() {
  // Pulling translations from the "HomePage" namespace in our JSON dictionaries
  const t = useTranslations('HomePage');

  return (
    <div className="min-h-screen bg-blue-50 font-sans flex flex-col items-center justify-center p-6 text-center">

      <div className="bg-white rounded-3xl shadow-xl p-10 md:p-16 max-w-2xl w-full border border-blue-100">

        <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <span className="text-white text-4xl font-black text-shadow-sm">+</span>
        </div>

        {/* These text variables switch between English and Hindi based on the URL (/en vs /hi) */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 tracking-tight mb-4 leading-tight">
          {t('title')}
        </h1>

        <p className="text-xl text-gray-600 mb-10 max-w-lg mx-auto leading-relaxed">
          {t('subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/doctors" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            {t('cta')}
          </Link>
          <Link href="/wallet" className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold py-4 px-8 rounded-full text-lg shadow-sm border border-emerald-200 transition-colors">
            {useTranslations('Navigation')('wallet')}
          </Link>
        </div>

      </div>

    </div>
  );
}

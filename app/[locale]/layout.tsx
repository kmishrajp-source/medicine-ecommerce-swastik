import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import PwaRegistrar from "@/components/PwaRegistrar";
import FCMProvider from "@/components/FCMProvider";
import CartDrawer from "@/components/CartDrawer";

import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import AIRecoveryAssistant from "@/components/AIRecoveryAssistant";
import CustomerSupportWidget from "@/components/CustomerSupportWidget";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Swastik Medicare - Premium Online Pharmacy & Healthcare",
  description: "Order medicines, upload prescriptions, and get fast home delivery in Gorakhpur.",
  manifest: "/manifest.json",
  metadataBase: new URL("https://medicine-ecommerce-swastik-main.vercel.app"),
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Swastik Medicare",
  },
  formatDetection: {
    telephone: true,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5, // Improved for accessibility
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import Provider from "@/components/SessionProvider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {

  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Swastik Medicare",
    "url": "https://medicine-ecommerce-swastik-main.vercel.app",
    "logo": "https://medicine-ecommerce-swastik-main.vercel.app/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-9999999999",
      "contactType": "customer service",
      "areaServed": "IN",
      "availableLanguage": ["en", "Hindi"]
    },
    "sameAs": [
      "https://facebook.com/swastikmedicare",
      "https://twitter.com/swastikmedicare",
      "https://instagram.com/swastikmedicare"
    ]
  };

  return (
    <html lang={locale}>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4338ca" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={outfit.className}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Provider>
            <FCMProvider>
              <CartProvider>
                <PwaRegistrar />
                {children}

                {/* FLOATING ENGAGEMENT TOOLS */}
                <div className="fixed bottom-8 right-8 z-[2000] flex flex-col gap-4">
                    <a 
                        href="https://wa.me/919999999999?text=Hello, I need help with Swastik Medicare."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center text-3xl shadow-2xl hover:bg-emerald-600 hover:scale-110 active:scale-95 transition-all group relative"
                        aria-label="Chat on WhatsApp"
                    >
                         <div className="absolute right-full mr-4 bg-white px-4 py-2 rounded-xl text-slate-900 text-xs font-black uppercase tracking-widest shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                            Chat on WhatsApp
                         </div>
                         <i className="fa-brands fa-whatsapp"></i>
                    </a>
                </div>
                <CartDrawer />
                <FloatingWhatsApp />
                <CustomerSupportWidget />
                <AIRecoveryAssistant />
              </CartProvider>
            </FCMProvider>
          </Provider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

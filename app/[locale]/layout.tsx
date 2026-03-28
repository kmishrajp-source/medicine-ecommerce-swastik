import type { Metadata } from "next";
// Forced deploy trigger: healthcare-crm-v1
import { Outfit } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";

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

import { getMessages, setRequestLocale } from 'next-intl/server';
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
  
  // Ensure the locale is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering for this locale
  setRequestLocale(locale);
  
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4338ca" />
      </head>
      <body className={outfit.className}>
        <ClientProviders messages={messages} locale={locale}>
          <div className="main-wrapper">
            {children}
            {/* Remote emergency hotfix WhatsApp button integration */}
            <div className="fixed bottom-8 right-8 z-[2000] flex flex-col gap-4">
                <a 
                    href="https://wa.me/917992122974?text=Hello, I need help with Swastik Medicare."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center text-3xl shadow-2xl hover:bg-emerald-600 hover:scale-110 active:scale-95 transition-all group relative"
                    aria-label="Chat on WhatsApp"
                >
                     <i className="fa-brands fa-whatsapp"></i>
                </a>
            </div>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
// Forced deploy trigger: healthcare-crm-v2
import { Outfit } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";
import SwastikVoiceAssistant from "@/components/SwastikVoiceAssistant";
import SwastikChatWidget from "@/components/SwastikChatWidget";
import AIRecoveryAssistant from "@/components/AIRecoveryAssistant";
import Script from "next/script";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Swastik Medicare - AI-Powered Digital Healthcare Platform",
  description: "India's premier HealthTech platform. Order medicines, consult top doctors online, book lab tests, and manage unified health records with AI intelligence.",
  keywords: "HealthTech, Swastik Medicare, AI Healthcare, Online Pharmacy, Telemedicine, Gorakhpur, ePharmacy, ABDM, Digital Health, Lab Tests, Doctor Consultation, Healthcare Startup",
  manifest: "/manifest.json",
  metadataBase: new URL("https://medicine-ecommerce-swastik-main.vercel.app"),
  openGraph: {
    title: "Swastik Medicare | Next-Gen HealthTech Ecosystem",
    description: "Connecting patients, doctors, pharmacies, and labs through AI. Discover the future of healthcare.",
    url: "https://medicine-ecommerce-swastik-main.vercel.app",
    siteName: "Swastik Medicare",
    images: [
      {
        url: "/og-image.jpg", // We will just point to a placeholder/existing asset
        width: 1200,
        height: 630,
        alt: "Swastik Medicare AI Health Ecosystem",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Swastik Medicare - AI-Powered HealthTech",
    description: "Transforming healthcare with AI prescription safety, telemedicine, and digital pharmacies.",
    images: ["/og-image.jpg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Swastik Medicare",
  },
  formatDetection: {
    telephone: true,
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Pharmacy",
    "name": "Swastik Medicare",
    "image": "https://www.swastikmed.online/medicine-bg.jpg",
    "@id": "https://www.swastikmed.online",
    "url": "https://www.swastikmed.online",
    "telephone": "+917992122974",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Gorakhpur",
      "addressLocality": "Gorakhpur",
      "addressRegion": "UP",
      "postalCode": "273001",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 26.7606,
      "longitude": 83.3732
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "00:00",
      "closes": "23:59"
    }
  };

  return (
    <html lang={locale}>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4338ca" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={outfit.className}>
        <ClientProviders messages={messages} locale={locale}>
          <div className="main-wrapper">
            {children}
          </div>
        </ClientProviders>
        
        <SwastikVoiceAssistant />
        <SwastikChatWidget />
        <AIRecoveryAssistant />

        {/* Global Tracking Scripts */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID || 'G-PLACEHOLDER'}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID || 'G-PLACEHOLDER'}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
        
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID || 'PLACEHOLDER_FB_PIXEL'}');
            fbq('track', 'PageView');
          `}
        </Script>
      </body>
    </html>
  );
}

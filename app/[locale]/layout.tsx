import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import PwaRegistrar from "@/components/PwaRegistrar";
import FCMProvider from "@/components/FCMProvider";
import CartDrawer from "@/components/CartDrawer";

import FloatingWhatsApp from "@/components/FloatingWhatsApp";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Swastik Medicare - Premium Online Pharmacy",
  description: "Order medicines, upload prescriptions, and get fast home delivery.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Swastik Medicare",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

import Provider from "@/components/SessionProvider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

// ...

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {

  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={outfit.className}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Provider>
            <FCMProvider>
              <CartProvider>
                <PwaRegistrar />
                {children}
                <CartDrawer />
                <FloatingWhatsApp />
              </CartProvider>
            </FCMProvider>
          </Provider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import PwaRegistrar from "@/components/PwaRegistrar";
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

// ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={outfit.className}>
        <Provider>
          <CartProvider>
            <PwaRegistrar />
            {children}
            <CartDrawer />
            <FloatingWhatsApp />
          </CartProvider>
        </Provider>
      </body>
    </html>
  );
}

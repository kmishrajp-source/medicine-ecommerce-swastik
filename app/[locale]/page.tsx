import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Swastik Medicare - Premium Online Pharmacy & Healthcare",
    description: "Order medicines online, find top doctors in Gorakhpur, and get fast home delivery with Swastik Medicare.",
    metadataBase: new URL("https://medicine-ecommerce-swastik.vercel.app"),
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  // Enable static rendering for this locale
  setRequestLocale(locale);
  
  return <HomeClient />;
}

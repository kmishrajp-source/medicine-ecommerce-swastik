import TrustClient from "./TrustClient.js";
import { setRequestLocale } from "next-intl/server";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  
  return {
    title: "Trust & Compliance - Swastik Medicare",
    description: "Swastik Medicare is committed to maintaining high standards of healthcare compliance, patient safety, transparency, security, and ethical business practices.",
    alternates: {
      canonical: `https://medicine-ecommerce-swastik-main.vercel.app/${locale}/trust`,
    },
  };
}

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TrustClient />;
}

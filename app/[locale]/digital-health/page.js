import DigitalHealthClient from "./DigitalHealthClient.js";
import { setRequestLocale } from "next-intl/server";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  
  return {
    title: "ABDM Ready Digital Health Platform - Swastik Medicare",
    description: "Swastik Medicare is building an interoperable healthcare platform aligned with the Ayushman Bharat Digital Mission (ABDM). Create your ABHA ID, manage secure digital health records, and connect with verified doctors.",
    alternates: {
      canonical: `https://medicine-ecommerce-swastik-main.vercel.app/${locale}/digital-health`,
    },
  };
}

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DigitalHealthClient />;
}

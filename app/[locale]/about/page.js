import AboutClient from "./AboutClient.js";
import { setRequestLocale } from "next-intl/server";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  
  return {
    title: "About Swastik Medicare - Healthcare Technology Startup",
    description: "Swastik Medicare is a healthcare technology startup developing AI-powered digital healthcare infrastructure that connects patients, doctors, pharmacies, diagnostics, and emergency services.",
    alternates: {
      canonical: `https://medicine-ecommerce-swastik-main.vercel.app/${locale}/about`,
    },
  };
}

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AboutClient />;
}

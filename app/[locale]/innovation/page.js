import InnovationClient from "./InnovationClient.js";
import { setRequestLocale } from "next-intl/server";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  
  return {
    title: "Innovation & Technology - Swastik Medicare HealthTech",
    description: "Explore the proprietary AI healthcare models and cloud-native architecture powering Swastik Medicare's digital health ecosystem.",
    alternates: {
      canonical: `https://medicine-ecommerce-swastik-main.vercel.app/${locale}/innovation`,
    },
  };
}

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <InnovationClient />;
}

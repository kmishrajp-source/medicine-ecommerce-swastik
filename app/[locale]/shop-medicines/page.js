import ShopClient from "./ShopClient.js";
import { setRequestLocale, getTranslations } from "next-intl/server";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Shop" });

  return {
    title: "Shop Medicines Online - Swastik Medicare",
    description: "Browse and order a wide range of medicines from verified pharmacies. Fast home delivery and best prices.",
    alternates: {
      canonical: `https://medicine-ecommerce-swastik-main.vercel.app/${locale}/shop-medicines`,
    },
  };
}

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ShopClient />;
}

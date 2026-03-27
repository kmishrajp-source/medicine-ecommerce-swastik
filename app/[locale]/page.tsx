import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Homepage" });

  const baseUrl = "https://medicine-ecommerce-swastik-main.vercel.app";
  const url = `${baseUrl}/${locale}`;

  return {
    title: t("seo_title") || "Swastik Medicare - Premium Online Pharmacy & Healthcare",
    description: t("seo_description") || "Order medicines online, find top doctors in Gorakhpur, and get fast home delivery with Swastik Medicare.",
    alternates: {
      canonical: url,
      languages: {
        "en": `${baseUrl}/en`,
        "hi": `${baseUrl}/hi`,
      },
    },
    openGraph: {
      title: t("seo_title") || "Swastik Medicare",
      description: t("seo_description") || "Your trusted healthcare partner.",
      url: url,
      siteName: "Swastik Medicare",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Swastik Medicare - Healthcare Delivered",
        },
      ],
      locale: locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("seo_title") || "Swastik Medicare",
      description: t("seo_description") || "Your trusted healthcare partner.",
      images: ["/og-image.jpg"],
    },
    keywords: ["online pharmacy", "doctor consultation", "medicine delivery", "Gorakhpur healthcare", "Swastik Medicare"],
  };
}

export default function Page() {
  return <HomeClient />;
}

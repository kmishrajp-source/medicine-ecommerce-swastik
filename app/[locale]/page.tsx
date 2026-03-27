import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Swastik Medicare - Premium Online Pharmacy & Healthcare",
    description: "Order medicines online, find top doctors in Gorakhpur, and get fast home delivery with Swastik Medicare.",
    metadataBase: new URL("https://medicine-ecommerce-swastik-main.vercel.app"),
  };
}

export default function Page() {
  return <HomeClient />;
}

import DoctorsClient from "./DoctorsClient";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  
  return {
    title: "Find Top Doctors in Gorakhpur - Swastik Medicare",
    description: "Connect with the best healthcare professionals in Gorakhpur. Book appointments and consult with verified doctors.",
    alternates: {
      canonical: `https://medicine-ecommerce-swastik-main.vercel.app/${locale}/doctors`,
    },
  };
}

export default function Page() {
  return <DoctorsClient />;
}

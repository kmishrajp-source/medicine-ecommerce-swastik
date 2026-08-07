import HomeopathyDoctorsClient from "./HomeopathyDoctorsClient.js";
import { setRequestLocale } from "next-intl/server";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  
  return {
    title: "Find Top Homeopathic Doctors - Swastik Medicare",
    description: "Connect with the best homeopathic healthcare professionals. Book appointments and consult with verified doctors online.",
    alternates: {
      canonical: `https://medicine-ecommerce-swastik-main.vercel.app/${locale}/doctors/homeopathy`,
    },
  };
}

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomeopathyDoctorsClient />;
}

import Navbar from "@/components/Navbar";
import { notFound } from "next/navigation";
import HospitalProfileClient from "./HospitalProfileClient";

async function getHospital(id) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pharmacy-app-weld.vercel.app';
        const res = await fetch(`${baseUrl}/api/hospitals/${id}`, { next: { revalidate: 3600 } });
        if (!res.ok) return null;
        const data = await res.json();
        if (data.success) return data.hospital;
        return null;
    } catch (e) {
        return null;
    }
}

export async function generateMetadata({ params }) {
    const { id } = await params;
    const hospital = await getHospital(id);
    if (!hospital) return { title: "Hospital Not Found | Swastik Medicare" };
    return {
        title: `${hospital.name} - ${hospital.city || 'Gorakhpur'} | Swastik Medicare`,
        description: `View details, specialties, and contact information for ${hospital.name} located at ${hospital.address}.`,
    };
}

export default async function HospitalProfilePage({ params }) {
    const { id } = await params;
    const hospital = await getHospital(id);

    if (!hospital) notFound();

    return (
        <>
            <Navbar />
            <HospitalProfileClient hospital={hospital} />
        </>
    );
}

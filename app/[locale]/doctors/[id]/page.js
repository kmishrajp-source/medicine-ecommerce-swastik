import Navbar from "@/components/Navbar";
import { notFound } from "next/navigation";
import DoctorProfileClient from "./DoctorProfileClient";

// Module 4: Standalone High-Conversion Doctor Profile
async function getDoctor(id) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pharmacy-app-weld.vercel.app';
        const res = await fetch(`${baseUrl}/api/doctors/${id}`, { next: { revalidate: 3600 } });
        if (!res.ok) return null;
        const data = await res.json();
        if (data.success) return data.doctor;
        return null;
    } catch (e) {
        return null;
    }
}

export async function generateMetadata({ params }) {
    const { id } = await params;
    const doctor = await getDoctor(id);
    if (!doctor) return { title: "Doctor Not Found | Swastik Medicare" };
    return {
        title: `${doctor.name || "Specialist"} - ${doctor.specialization} in ${doctor.city || 'Gorakhpur'} | Swastik Medicare`,
        description: `Consult with ${doctor.name || "our specialist"} (${doctor.specialization}). ${doctor.experience || 'Experienced'} years of practice. View phone and contact details instantly.`,
    };
}

export default async function DoctorProfilePage({ params }) {
    const { id } = await params;
    const doctor = await getDoctor(id);

    if (!doctor) notFound();

    return (
        <>
            <Navbar />
            <DoctorProfileClient doctor={doctor} />
        </>
    );
}

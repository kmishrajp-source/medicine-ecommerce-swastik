import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id || null;

        const body = await req.json();
        const {
            projectTitle,
            researchArea,
            objective,
            problemStatement,
            budgetRange,
            deadline,
            organizationName,
            organizationType,
            country,
            contactName,
            contactEmail,
            contactPhone,
            position,
            hasDataset,
            datasetType,
            datasetSize,
            needsLabWork,
            needsClinical
        } = body;

        // Validation
        if (!projectTitle || !objective || !organizationName || !contactName || !contactEmail) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Create the Submission in a Transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Check or Create Organization
            let org = await tx.researchOrganization.findFirst({
                where: { name: organizationName }
            });

            if (!org) {
                org = await tx.researchOrganization.create({
                    data: {
                        name: organizationName,
                        type: organizationType || "Other",
                        country: country || "Unknown"
                    }
                });
            }

            // 2. Check or Create Contact
            let contact = await tx.researchContact.findFirst({
                where: { email: contactEmail, organizationId: org.id }
            });

            if (!contact) {
                contact = await tx.researchContact.create({
                    data: {
                        userId: userId,
                        organizationId: org.id,
                        name: contactName,
                        email: contactEmail,
                        phone: contactPhone,
                        position: position
                    }
                });
            }

            // 3. Create the Project
            const project = await tx.researchProject.create({
                data: {
                    title: projectTitle,
                    researchArea: researchArea || "General",
                    objective: objective,
                    problemStatement: problemStatement || "",
                    budgetRange: budgetRange,
                    deadline: deadline ? new Date(deadline) : null,
                    organizationId: org.id,
                    contactId: contact.id,
                    hasDataset: hasDataset || false,
                    datasetType: datasetType,
                    datasetSize: datasetSize,
                    needsLabWork: needsLabWork || false,
                    needsClinical: needsClinical || false,
                    status: "NEW_INQUIRY"
                }
            });

            return project;
        });

        return NextResponse.json({
            success: true,
            message: "Research project submitted successfully",
            data: result
        }, { status: 201 });

    } catch (error) {
        console.error("Research submission error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to submit research project. Please try again." },
            { status: 500 }
        );
    }
}

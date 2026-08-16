import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendSMS } from "@/lib/sms";

export const dynamic = "force-dynamic";

// Helper function to extract YYYY year from a license number string
function getLicenseYear(licenseNo) {
    if (!licenseNo) return null;
    const match = licenseNo.match(/\b(20\d{2})\b/);
    return match ? parseInt(match[1]) : null;
}

// GET /api/cron/license-compliance
// Automated compliance sweep for Pharmacy, Doctor, and Stockist license expiries
export async function GET(req) {
    try {
        // 1. Authenticate the cron request via CRON_SECRET check
        const authHeader = req.headers.get("authorization");
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const now = new Date();
        const currentYear = now.getFullYear();
        
        let expiringSoonCount = 0;
        let expiredCount = 0;
        let unverifiedCount = 0;
        const issues = [];

        // ---------------------------------------------------------
        // 1. Check Retail Pharmacies (Retailers)
        // ---------------------------------------------------------
        const retailers = await prisma.retailer.findMany({
            where: { isDirectory: false }
        });

        for (const ret of retailers) {
            const hasLicense = ret.licenseNumber && !ret.licenseNumber.toLowerCase().includes("pending");
            
            if (!hasLicense) {
                unverifiedCount++;
                issues.push({
                    partnerId: ret.id,
                    partnerName: ret.shopName,
                    partnerType: "RETAILER",
                    phone: ret.phone,
                    issueType: "MISSING_LICENSE",
                    message: "License number is missing or pending verification"
                });
                
                if (ret.phone) {
                    await sendSMS(
                        ret.phone,
                        `Swastik Medicare: Dear Partner, your pharmacy ${ret.shopName} does not have a verified Form 20/21 drug license. Please upload it on your dashboard to activate online ordering.`
                    ).catch(console.error);
                }
            } else {
                // If the retailer has a license, check if it's verified
                if (!ret.verified || ret.status !== "verified") {
                    unverifiedCount++;
                    issues.push({
                        partnerId: ret.id,
                        partnerName: ret.shopName,
                        partnerType: "RETAILER",
                        phone: ret.phone,
                        issueType: "UNVERIFIED_LICENSE",
                        message: "License is registered but not verified by admin"
                    });
                }

                // Check for year/expiry (5-year validity heuristic)
                const licenseYear = getLicenseYear(ret.licenseNumber);
                if (licenseYear) {
                    const expiryYear = licenseYear + 5;
                    if (expiryYear < currentYear) {
                        expiredCount++;
                        issues.push({
                            partnerId: ret.id,
                            partnerName: ret.shopName,
                            partnerType: "RETAILER",
                            phone: ret.phone,
                            issueType: "EXPIRED_LICENSE",
                            message: `License ${ret.licenseNumber} expired in ${expiryYear}`
                        });

                        if (ret.phone) {
                            await sendSMS(
                                ret.phone,
                                `Swastik Medicare Compliance: Dear ${ret.shopName}, your pharmacy drug license (${ret.licenseNumber}) has expired. Please renew and upload your new Form 20/21 immediately on the portal to prevent account suspension.`
                            ).catch(console.error);
                        }
                    } else if (expiryYear === currentYear) {
                        expiringSoonCount++;
                        issues.push({
                            partnerId: ret.id,
                            partnerName: ret.shopName,
                            partnerType: "RETAILER",
                            phone: ret.phone,
                            issueType: "EXPIRING_LICENSE",
                            message: `License ${ret.licenseNumber} expires this year (${expiryYear})`
                        });

                        if (ret.phone) {
                            await sendSMS(
                                ret.phone,
                                `Swastik Medicare Compliance: Dear ${ret.shopName}, your pharmacy drug license (${ret.licenseNumber}) is expiring soon in ${expiryYear}. Please renew and upload your new license certificate to avoid profile suspension.`
                            ).catch(console.error);
                        }
                    }
                }
            }
        }

        // ---------------------------------------------------------
        // 2. Check Doctors
        // ---------------------------------------------------------
        const doctors = await prisma.doctor.findMany({
            where: { isDirectory: false }
        });

        for (const doc of doctors) {
            if (!doc.verified || doc.status !== "verified") {
                unverifiedCount++;
                issues.push({
                    partnerId: doc.id,
                    partnerName: doc.name || "Dr. Partner",
                    partnerType: "DOCTOR",
                    phone: doc.phone,
                    issueType: "UNVERIFIED_DOCTOR",
                    message: "Professional medical credentials are unverified"
                });

                if (doc.phone) {
                    await sendSMS(
                        doc.phone,
                        `Swastik Medicare Compliance: Dear Dr. ${doc.name || "Partner"}, your professional profile is currently unverified. Please upload your State Medical Council registration certificate to activate consulting.`
                    ).catch(console.error);
                }
            }
        }

        // ---------------------------------------------------------
        // 3. Check Stockists
        // ---------------------------------------------------------
        const stockists = await prisma.stockist.findMany();
        for (const stk of stockists) {
            if (!stk.verified) {
                unverifiedCount++;
                issues.push({
                    partnerId: stk.id,
                    partnerName: stk.agencyName,
                    partnerType: "STOCKIST",
                    phone: stk.phone,
                    issueType: "UNVERIFIED_STOCKIST",
                    message: "Stockist agency profile is unverified"
                });

                if (stk.phone) {
                    await sendSMS(
                        stk.phone,
                        `Swastik Medicare Compliance: Dear Stockist, your agency ${stk.agencyName} is unverified. Please upload your drug license and GSTIN to activate bulk bidding.`
                    ).catch(console.error);
                }
            }
        }

        // ---------------------------------------------------------
        // 4. Check Stockist Directories (Stand-alone list)
        // ---------------------------------------------------------
        const stockistDirectories = await prisma.stockistDirectory.findMany({
            where: { isActive: true }
        });

        for (const sDir of stockistDirectories) {
            if (!sDir.verified) {
                unverifiedCount++;
                issues.push({
                    partnerId: sDir.id,
                    partnerName: sDir.agencyName,
                    partnerType: "STOCKIST_DIRECTORY",
                    phone: sDir.phone,
                    issueType: "UNVERIFIED_STOCKIST_DIR",
                    message: "Stockist directory profile is unverified"
                });
            }

            const licenseYear = getLicenseYear(sDir.licenseNumber);
            if (licenseYear) {
                const expiryYear = licenseYear + 5;
                if (expiryYear < currentYear) {
                    expiredCount++;
                    issues.push({
                        partnerId: sDir.id,
                        partnerName: sDir.agencyName,
                        partnerType: "STOCKIST_DIRECTORY",
                        phone: sDir.phone,
                        issueType: "EXPIRED_STOCKIST_LICENSE",
                        message: `Stockist directory license ${sDir.licenseNumber} expired in ${expiryYear}`
                    });
                } else if (expiryYear === currentYear) {
                    expiringSoonCount++;
                    issues.push({
                        partnerId: sDir.id,
                        partnerName: sDir.agencyName,
                        partnerType: "STOCKIST_DIRECTORY",
                        phone: sDir.phone,
                        issueType: "EXPIRING_STOCKIST_LICENSE",
                        message: `Stockist directory license ${sDir.licenseNumber} expires this year (${expiryYear})`
                    });
                }
            }
        }

        // ---------------------------------------------------------
        // 5. System Health Logging & Admin Notifications
        // ---------------------------------------------------------
        const report = {
            totalPharmaciesScanned: retailers.length,
            totalDoctorsScanned: doctors.length,
            totalStockistsScanned: stockists.length + stockistDirectories.length,
            expiringSoonCount,
            expiredCount,
            unverifiedCount,
            totalIssues: issues.length,
            timestamp: now.toISOString(),
            status: expiredCount > 0 ? "COMPLIANCE_SWEEP_ALERT" : "COMPLIANCE_SWEEP_HEALTHY"
        };

        // Create a log in SystemHealthLog
        if (issues.length > 0) {
            await prisma.systemHealthLog.create({
                data: {
                    component: "COMPLIANCE",
                    issueType: "LICENSE_COMPLIANCE_SWEEP",
                    severity: expiredCount > 0 ? "CRITICAL" : "WARNING",
                    message: `Compliance Sweep: Found ${expiredCount} expired, ${expiringSoonCount} expiring, and ${unverifiedCount} unverified partner profiles.`,
                    details: issues
                }
            }).catch(console.error);

            // Notify Admin of the issues
            const adminPhone = process.env.ADMIN_PHONE || "917992122974";
            await sendSMS(
                adminPhone,
                `Swastik Medicare: Compliance sweep completed with warnings.\nTotal issues: ${issues.length}\nExpired: ${expiredCount}\nExpiring soon: ${expiringSoonCount}\nUnverified: ${unverifiedCount}\nPlease review the Admin Compliance Logs.`
            ).catch(console.error);
        }

        return NextResponse.json({
            success: true,
            report,
            issues
        });

    } catch (error) {
        console.error("License Compliance Cron Error:", error);
        
        // Log crash event
        try {
            await prisma.systemHealthLog.create({
                data: {
                    component: "COMPLIANCE",
                    issueType: "COMPLIANCE_CRON_FAILED",
                    severity: "CRITICAL",
                    message: `License compliance sweep job failed: ${error.message}`
                }
            });
        } catch (e) {}

        return NextResponse.json({ error: "Failed to execute compliance sweep", details: error.message }, { status: 500 });
    }
}

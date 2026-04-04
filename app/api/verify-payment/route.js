import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { sendSMS } from "@/lib/sms";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { assignOrderToNearestRetailer } from "@/utils/routing";
import { splitOrderIntoSubOrders } from "@/utils/marketplace";
import { triggerWebhook } from "@/lib/webhooks";
import { WhatsAppTriggers } from "@/lib/whatsapp";
import { logFailure } from "@/lib/logger";
import { settlePartnerPayment } from "@/lib/settlements";
import { processContactUnlock, distributeLeadCommission } from "@/lib/finance";

export async function POST(req) {
    try {
        const {
            orderCreationId,
            razorpayPaymentId,
            razorpaySignature,
            amount,
            items,
            address,
            guestName,
            guestEmail,
            guestPhone,
            lat,
            lng,
            orderType,
            appointmentId,
            targetId,
            targetType,
            leadId
        } = await req.json();

        // 1. Verify Signature
        const signature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
        signature.update(orderCreationId + "|" + razorpayPaymentId);
        const digest = signature.digest("hex");

        if (digest !== razorpaySignature) {
            await logFailure({
                userId: session?.user?.id || null,
                userRole: session?.user?.role || 'CUSTOMER',
                actionType: 'payment_verification',
                errorType: 'security',
                errorMessage: 'Payment signature mismatch - possible tampering',
                pageUrl: '/checkout',
                details: { orderCreationId, razorpayPaymentId }
            });
            return NextResponse.json({ error: "Transaction not legit!" }, { status: 400 });
        }

        // 1.5 Handle Appointment Bookings
        if (orderType === 'APPOINTMENT') {
            const appointment = await prisma.appointment.update({
                where: { id: appointmentId },
                data: { status: "Confirmed" },
                include: { doctor: { include: { user: true } }, patient: true }
            });

            // Handle Hospital Payout (If applicable)
            if (appointment.hospitalId) {
                await settlePartnerPayment({
                    type: 'APPOINTMENT',
                    id: appointment.id,
                    amount: parseFloat(amount),
                    partnerId: appointment.hospitalId,
                    partnerType: 'HOSPITAL'
                });
            }

            // Notify Doctor
            if (appointment.doctor.phone) {
                await sendSMS(
                    appointment.doctor.phone,
                    `Swastik Medicare: New Video Consultation booked by ${appointment.patient.name} for ${appointment.date.toLocaleString()}. Log in to view details.`
                );
                await WhatsAppTriggers.doctorAppointmentAlert(appointment.doctor.phone, appointment.id, appointment.patient.name, appointment.date.toLocaleString());
            }

            // Notify Patient (WhatsApp)
            if (appointment.patient.phone) {
                await WhatsAppTriggers.appointmentConfirmed(appointment.patient.phone, appointment.id, appointment.doctor.user.name, appointment.date.toLocaleString());
            }

            // 1.6 Handle Publisher Commission
            if (appointment.publisherId) {
                const commission = parseFloat(amount) * 0.1; // 10% commission
                const publisher = await prisma.publisher.findUnique({
                    where: { id: appointment.publisherId },
                    include: { user: true }
                });

                if (publisher && publisher.userId) {
                    await prisma.user.update({
                        where: { id: publisher.userId },
                        data: { 
                            walletBalance: { increment: commission },
                            transactions: {
                                create: {
                                    amount: commission,
                                    type: "CREDIT",
                                    description: `Commission for Appointment: ${appointment.doctor.user.name}`
                                }
                            }
                        }
                    });

                    await prisma.publisherLead.create({
                        data: {
                            publisherId: publisher.id,
                            userId: appointment.patientId,
                            leadId: appointment.id,
                            commission: commission,
                            status: "completed"
                        }
                    });
                }
            }

            return NextResponse.json({
                success: true,
                appointmentId: appointment.id,
                message: "Appointment Confirmed & Payment Routed to Doctor"
            });
        }

        // 1.7 Handle Contact Unlocks
        if (orderType === 'UNLOCK') {
            const session = await getServerSession(authOptions);
            if (session?.user) {
                await processContactUnlock(session.user.id, targetId, targetType, razorpayPaymentId);
                return NextResponse.json({ success: true, message: "Contact Unlocked Successfully" });
            }
        }

        // 1.8 Handle Lead Commissions
        if (orderType === 'LEAD') {
            await distributeLeadCommission(leadId, amount);
            return NextResponse.json({ success: true, message: "Lead Commission Distributed" });
        }

        // 1.9 Handle Plan Purchases (Partner Onboarding)
        if (orderType === 'PLAN_PURCHASE') {
            const session = await getServerSession(authOptions);
            const planId = targetId; // from landing page
            
            if (session?.user) {
                // Update User Role/Status
                await prisma.user.update({
                    where: { id: session.user.id },
                    data: { 
                        role: 'PARTNER', // General partner role or specific
                        // Assuming metadata/status fields exist or use a generic flag
                        isVerified: planId === 'featured'
                    }
                });

                // Auto-convert any Lead matching this user's phone
                const user = await prisma.user.findUnique({ where: { id: session.user.id } });
                if (user?.phone) {
                    const cleanPhone = user.phone.slice(-10);
                    await prisma.lead.updateMany({
                        where: {
                            guestPhone: { contains: cleanPhone },
                            status: { not: 'converted' }
                        },
                        data: { status: 'converted' }
                    });
                }

                // Log Revenue
                await prisma.partnerRevenue.create({
                    data: {
                        partnerId: session.user.id,
                        partnerType: 'PARTNER',
                        revenueType: 'LISTING_FEE',
                        amount: parseFloat(amount),
                        paymentStatus: 'paid'
                    }
                });

                // Notify Partner (WhatsApp)
                const partnerPhone = user?.phone || guestPhone;
                if (partnerPhone) {
                    await WhatsAppTriggers.planPurchaseConfirmed(partnerPhone, planId === 'featured' ? 'Featured Partner' : 'Basic Partner');
                }

                return NextResponse.json({ success: true, message: "Plan Activated & Partner Verified" });
            }
        }

        // 2. Multi-Step Atomic Transaction
        const { newOrder, userId } = await prisma.$transaction(async (tx) => {
            // Identify User
            let effectiveUserId = null;
            const currentSession = await getServerSession(authOptions);

            if (currentSession?.user) {
                effectiveUserId = currentSession.user.id;
            } else {
                // Unique Guest Handling
                const uniqueGuestEmail = guestPhone ? `guest-${guestPhone}@swastik.com` : `guest-${Date.now()}@swastik.com`;
                const guestUser = await tx.user.upsert({
                    where: { email: uniqueGuestEmail },
                    update: { name: guestName || 'Guest User', phone: guestPhone },
                    create: {
                        email: uniqueGuestEmail,
                        name: guestName || 'Guest User',
                        password: '$2a$10$GuestPlaceholderHash',
                        role: 'CUSTOMER',
                        phone: guestPhone
                    }
                });
                effectiveUserId = guestUser.id;
            }

            // Prepare Items
            const medicineItems = items.filter(i => !i.isLab);
            const labItems = items.filter(i => i.isLab);

            const orderItems = medicineItems.map(item => ({
                productId: String(item.id),
                quantity: parseInt(item.quantity),
                price: parseFloat(item.price)
            }));

            // Create Order
            const createdOrder = await tx.order.create({
                data: {
                    userId: effectiveUserId,
                    guestName: guestName || (effectiveUserId ? null : 'Guest'),
                    guestEmail: guestEmail || (effectiveUserId ? null : 'guest@swastik.com'),
                    guestPhone: guestPhone,
                    address: address,
                    lat: lat ? parseFloat(lat) : null,
                    lng: lng ? parseFloat(lng) : null,
                    total: parseFloat(amount),
                    status: "Processing",
                    paymentMethod: "ONLINE",
                    isPaid: true,
                    isDelivered: false,
                    items: {
                        create: orderItems
                    }
                }
            });

            // Create Lab Bookings
            if (labItems.length > 0) {
                for (const labItem of labItems) {
                    const testIdRaw = String(labItem.id).replace('lab-', '');
                    await tx.labBooking.create({
                        data: {
                            patientId: effectiveUserId,
                            testId: testIdRaw,
                            status: "Paid"
                        }
                    });
                }
            }

            return { newOrder: createdOrder, userId: effectiveUserId };
        });

        // 3.3 Handle Manufacturer Settlements (If items belong to a manufacturer)
        if (medicineItems.length > 0) {
            try {
                // Fetch products to check manufacturers
                const productIds = medicineItems.map(i => String(i.id));
                const dbProducts = await prisma.product.findMany({
                    where: { id: { in: productIds } },
                    select: { id: true, manufacturerId: true }
                });

                const manufacturerMap = {};
                medicineItems.forEach(item => {
                    const p = dbProducts.find(dbP => dbP.id === String(item.id));
                    if (p && p.manufacturerId) {
                        if (!manufacturerMap[p.manufacturerId]) manufacturerMap[p.manufacturerId] = 0;
                        manufacturerMap[p.manufacturerId] += (item.price * item.quantity);
                    }
                });

                for (const [mId, mAmount] of Object.entries(manufacturerMap)) {
                    await settlePartnerPayment({
                        type: 'PRODUCT',
                        id: newOrder.id,
                        amount: mAmount,
                        partnerId: mId,
                        partnerType: 'MANUFACTURER'
                    });
                }
            } catch (err) {
                console.error("Manufacturer Settlement Failed:", err);
            }
        }

        // 3.5 Execute HyperLocal Routing (Non-Blocking)
        if (newOrder && newOrder.lat && newOrder.lng) {
            assignOrderToNearestRetailer(newOrder.id).catch(e => console.error("Routing Exception:", e));
            // New Marketplace Split
            splitOrderIntoSubOrders(newOrder.id).catch(e => console.error("Marketplace Split Exception:", e));
            // Webhook Event
            triggerWebhook("payment_success", newOrder.id, { amount });
            // WhatsApp Customer Trigger
            const phone = guestPhone || session?.user?.phone;
            if (phone) WhatsAppTriggers.orderConfirmed(phone, newOrder.id, amount, "N/A");
        }

        // 4. Send SMS
        const customerPhone = guestPhone || session?.user?.phone || "";
        const adminPhone = "9161364908"; // Hardcoded as requested
        const orderId = newOrder.id.slice(-6).toUpperCase();

        // Customer SMS
        if (customerPhone) {
            await sendSMS(
                customerPhone,
                `Dear Customer, your order from Swastik Medicare has been billed successfully.\n\nInvoice No: SM${orderId}\nAmount: ₹${amount}\nStatus: Confirmed\n\nInvoice sent to your email.\nThank you for trusting Swastik Medicare.`
            );
        }

        // Admin SMS
        await sendSMS(
            adminPhone,
            `New Order Received! ID: #${orderId}, Amt: ₹${amount}, Customer: ${guestName || "Guest"}. Check Admin Dashboard.`
        );

        return NextResponse.json({
            success: true,
            orderId: newOrder.id,
            message: "Payment Verified & Order Placed"
        });

    } catch (error) {
        console.error("Payment Verification Error:", error);
        await logFailure({
            userId: session?.user?.id || null,
            userRole: session?.user?.role || 'CUSTOMER',
            actionType: 'payment_verification',
            errorType: 'server',
            errorMessage: error.message,
            pageUrl: '/checkout',
            details: { orderCreationId, razorpayPaymentId }
        });
        return NextResponse.json({ error: "Payment verification failed", details: error.message }, { status: 500 });
    }
}

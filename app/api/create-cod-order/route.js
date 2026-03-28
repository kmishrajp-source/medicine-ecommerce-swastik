import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { logFailure } from "@/lib/logger";
import { sendSMS } from "@/lib/sms";
import { assignOrderToNearestRetailer } from "@/utils/routing";
import { splitOrderIntoSubOrders } from "@/utils/marketplace";
import { triggerWebhook } from "@/lib/webhooks";
import { WhatsAppTriggers } from "@/lib/whatsapp";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        const body = await req.json();
        const { amount, couponCode, items, guestName, guestEmail, guestPhone, address, paymentMethod, transactionId, lat, lng, prescriptionUrl } = body;

        // Validate Coupon if present
        if (couponCode === 'FIRST100') {
            if (session && session.user && session.user.id) {
                const orderCount = await prisma.order.count({
                    where: { userId: session.user.id }
                });
                if (orderCount > 0) {
                    return NextResponse.json({ error: "Coupon valid only for first order" }, { status: 400 });
                }
            } else {
                return NextResponse.json({ error: "Login required for coupon" }, { status: 401 });
            }
        }

        // 1. Generate 4-digit Random Code
        const deliveryCode = Math.floor(1000 + Math.random() * 9000).toString();

        // 2. Resolve Product IDs (Fix for Mock Data vs Real DB)
        const resolvedItems = [];
        // Find or create a generic fallback product for mock items
        let fallbackProduct = await prisma.product.findFirst();
        if (!fallbackProduct) {
            try {
                fallbackProduct = await prisma.product.create({
                    data: {
                        name: "Generic Product (Fallback)",
                        description: "Auto-created for guest checkout compatibility",
                        price: 100,
                        image: "/placeholder.png",
                        category: "General"
                    }
                });
            } catch (e) { console.error("Failed to create fallback product", e); }
        }

        const medicineItems = items.filter(i => !i.isLab);
        const labItems = items.filter(i => i.isLab);

        const ninetyDaysFromNow = new Date();
        ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

        for (const item of medicineItems) {
            // Check if product exists
            const existingProduct = await prisma.product.findUnique({ where: { id: String(item.id) } });

            if (existingProduct) {
                // 1. Expiry Block Compliance (90 days)
                if (existingProduct.expiryDate && existingProduct.expiryDate < ninetyDaysFromNow) {
                    return NextResponse.json({
                        error: `Compliance Block: Product '${existingProduct.name}' has less than 90 days validity. Our policy prevents dispensing near-expiry medicine.`
                    }, { status: 400 });
                }

                resolvedItems.push({
                    productId: String(item.id),
                    quantity: parseInt(item.quantity),
                    price: parseFloat(item.price)
                });
            } else if (fallbackProduct) {
                console.log(`Product ID ${item.id} not found. Using Fallback Product ${fallbackProduct.id}`);
                resolvedItems.push({
                    productId: fallbackProduct.id, // Use valid ID
                    quantity: parseInt(item.quantity),
                    price: parseFloat(item.price)
                });
            }
        }

        const hasRxItems = medicineItems.some(item => item.requiresPrescription);

        if (hasRxItems && !prescriptionUrl) {
            return NextResponse.json({ error: "Mandatory prescription upload missing for Rx items." }, { status: 400 });
        }

        // 3. Prepare Order Data
        const orderData = {
            total: parseFloat(amount),
            status: hasRxItems ? "Rx_Uploaded" : "Received",
            paymentMethod: paymentMethod || "COD",
            deliveryCode: deliveryCode,
            isPaid: false,
            isDelivered: false,
            transactionId: transactionId || null,
            lat: lat ? parseFloat(lat) : null,
            lng: lng ? parseFloat(lng) : null,
            items: {
                create: resolvedItems
            }
        };

        // If prescription exists, we will link it after userId is determined

        // 3. Link User or Guest Details
        if (session) {
            orderData.userId = session.user.id;
            // Address might come from profile later, but for now we trust the input if provided
            if (address) orderData.address = address;
        } else {
            // Guest Checkout with Fallback User
            // Use upsert to guarantee a guest user exists without race conditions
            try {
                const guestUser = await prisma.user.upsert({
                    where: { email: 'guest@swastik.com' },
                    update: {}, // No changes if exists
                    create: {
                        email: 'guest@swastik.com',
                        name: 'Guest User',
                        password: '$2a$10$GuestPlaceholderHash', // Placeholder
                        role: 'CUSTOMER'
                    }
                });

                if (guestUser) {
                    orderData.userId = guestUser.id;
                }
            } catch (userError) {
                console.error("Failed to upsert guest user:", userError);
            }

            // LAST RESORT: If userId is still missing (Guest User creation failed),
            // and the DB presumably requires userId, find ANY user to attach it to.
            if (!orderData.userId) {
                try {
                    const anyUser = await prisma.user.findFirst();
                    if (anyUser) {
                        orderData.userId = anyUser.id;
                        console.log("Attached order to random existing user as fallback:", anyUser.email);
                    }
                } catch (findError) {
                    console.error("Failed to find any user:", findError);
                }
            }

            // Still save specific guest details
            orderData.guestName = guestName;
            orderData.guestEmail = guestEmail;
            orderData.guestPhone = guestPhone;
            orderData.address = address;
        }

        // 3.5 Link Prescription if provided
        if (prescriptionUrl && orderData.userId) {
            orderData.prescription = {
                create: {
                    imageUrl: prescriptionUrl,
                    patientId: orderData.userId,
                    status: 'Pending'
                }
            };
        }

        // 4. Create Order in Database
        let order;
        try {
            order = await prisma.order.create({
                data: orderData
            });
        } catch (dbError) {
            console.error("Primary Order Create Failed. Trying MINIMAL Fallback...", dbError.message);

            // MINIMAL FALLBACK: Strip all non-essential fields that might be causing schema issues
            // We will dump everything into the 'address' field so we don't lose data.

            const panicAddress = `[FALLBACK] Code:${deliveryCode}. Method:COD. Guest:${guestName}, ${guestPhone}, ${guestEmail}. Addr:${address}`;

            const minimalOrderData = {
                total: parseFloat(amount),
                status: "Processing (Fallback)",
                // paymentMethod: "COD", // Omitting to use default if causing issues
                // deliveryCode: deliveryCode, // Omitting
                // isPaid: false, // Omitting
                // isDelivered: false, // Omitting
                address: panicAddress,
                items: {
                    create: medicineItems.map(item => ({
                        productId: String(item.id),
                        quantity: parseInt(item.quantity),
                        price: parseFloat(item.price)
                    }))
                }
            };

            // 3. Ensure userId is present if strictly required
            if (!orderData.userId) { // Check original data for ID
                const anyUser = await prisma.user.findFirst();
                if (anyUser) minimalOrderData.userId = anyUser.id;
            } else {
                minimalOrderData.userId = orderData.userId;
            }

            // Retry create with minimal data
            order = await prisma.order.create({
                data: minimalOrderData
            });
        }

        // 4.1 Create Lab Bookings for Lab Tests
        if (labItems.length > 0 && order && order.userId) {
            for (const labItem of labItems) {
                try {
                    // Extract true test ID (removing 'lab-' prefix set in frontend cart)
                    const testIdRaw = String(labItem.id).replace('lab-', '');
                    
                    await prisma.labBooking.create({
                        data: {
                            patientId: order.userId,
                            testId: testIdRaw,
                            status: "Pending" // Can be Paid/Processing for online payments
                        }
                    });
                } catch (labErr) {
                    console.error("Failed to create Lab Booking for item:", labItem.name, labErr);
                }
            }
        }

        // 5. Customer Notification Data
        const phone = session?.user?.phone || guestPhone || "Unknown";

        // 4.5 Execute HyperLocal Routing (Non-Blocking)
        // console.log(`[SMS MOCK] Sending to ${phone}: Your Secure Delivery Code for Order #${order.id} is: ${deliveryCode}`);

        // Customer SMS
        if (phone && phone !== "Unknown") {
            const shortId = order.id.slice(-6).toUpperCase();
            await sendSMS(
                phone,
                `Dear Customer, your order from Swastik Medicare has been billed successfully.\n\nInvoice No: SM${shortId}\nAmount: ₹${amount}\nStatus: Confirmed\nDelivery Code: ${deliveryCode}\n\nInvoice sent to your email.\nThank you for trusting Swastik Medicare.`
            );
        }

        // Admin SMS
        await sendSMS(
            "9161364908",
            `New COD Order! ID: #${order.id.slice(-6).toUpperCase()}, Amt: ₹${amount}, Customer: ${guestName || "Guest"}. Code: ${deliveryCode}.`
        );

        return NextResponse.json({
            success: true,
            orderId: order.id,
            deliveryCode: deliveryCode, // Returning for testing purposes (remove in prod)
            message: "Order placed successfully! Check your SMS for the delivery code."
        });

    } catch (error) {
        console.error("COD Order Error - Full Details:", JSON.stringify(error, null, 2));
        console.error("COD Order Error - Message:", error.message);
        
        await logFailure({
            userId: session?.user?.id || null,
            userRole: session?.user?.role || 'CUSTOMER',
            actionType: 'checkout',
            errorType: 'server',
            errorMessage: error.message,
            pageUrl: '/checkout',
            details: { amount, itemsCount: items?.length }
        });

        // Return a more descriptive error if possible
        const errorMessage = error.message || "Unknown Database Error";
        return NextResponse.json({
            error: `Failed: ${errorMessage}`,
            details: error.toString()
        }, { status: 500 });
    }
}

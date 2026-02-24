import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { sendSMS } from "@/lib/sms";
import { assignOrderToNearestRetailer } from "@/utils/routing";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        const { amount, couponCode, items, guestName, guestEmail, guestPhone, address, paymentMethod, lat, lng } = await req.json();

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

        for (const item of items) {
            // Check if product exists
            const existingProduct = await prisma.product.findUnique({ where: { id: String(item.id) } });

            if (existingProduct) {
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

        // 3. Prepare Order Data
        const orderData = {
            total: parseFloat(amount),
            status: "Processing",
            paymentMethod: paymentMethod || "COD",
            deliveryCode: deliveryCode,
            isPaid: false,
            isDelivered: false,
            lat: lat ? parseFloat(lat) : null,
            lng: lng ? parseFloat(lng) : null,
            items: {
                create: resolvedItems
            }
        };

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
                    create: items.map(item => ({
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

        // 4.5 Execute HyperLocal Routing (Non-Blocking)
        if (order && order.lat && order.lng) {
            assignOrderToNearestRetailer(order.id).catch(e => console.error("Routing Exception:", e));
        }

        // 5. Send SMS
        const phone = session?.user?.phone || guestPhone || "Unknown";
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
        // Return a more descriptive error if possible
        const errorMessage = error.message || "Unknown Database Error";
        return NextResponse.json({
            error: `Failed: ${errorMessage}`,
            details: error.toString()
        }, { status: 500 });
    }
}

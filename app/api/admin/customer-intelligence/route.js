import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { CustomerIntelligenceAgent } from "@/lib/agents/CustomerIntelligenceAgent";

// Basic helper to generate 4-digit code
function generateDeliveryCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

// Generate referral code
function generateReferralCode(name) {
    const cleanName = (name || "CUST").replace(/[^a-zA-Z]/g, "").toUpperCase();
    const base = cleanName.length >= 3 ? cleanName.substring(0, 3) : (cleanName + "X").substring(0, 3);
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${base}${rand}`;
}

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !["ADMIN", "SUPER_ADMIN", "CRM_STAFF"].includes(session.user?.role)) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const action = searchParams.get("action");
        const area = searchParams.get("area") || "Gorakhpur";

        // =====================================================================
        // ACTIONS
        // =====================================================================
        
        // Stage 1 & 2: Identify Potential Businesses from Directory or Mocks
        if (action === "get-directory-leads") {
            const serviceType = searchParams.get("serviceType") || "retailer";
            
            let dbEntries = [];
            if (serviceType === "retailer") {
                dbEntries = await prisma.retailer.findMany({
                    where: { isDirectory: true, city: { contains: area, mode: 'insensitive' } },
                    take: 20
                });
            } else if (serviceType === "doctor") {
                dbEntries = await prisma.doctor.findMany({
                    where: { isDirectory: true, city: { contains: area, mode: 'insensitive' } },
                    take: 20
                });
            }

            // Return mock entries if database is empty so the system has fully functional data immediately
            if (dbEntries.length === 0) {
                const isRetail = serviceType === "retailer";
                const mockList = isRetail ? [
                    { id: "dir-ret-1", shopName: "Gorakhpur Pharmacy & Wellness", phone: "9876543201", address: "Golghar Crossing, Gorakhpur", rating: 4.5, ratingCount: 120, lat: 26.7606, lng: 83.3731, city: area },
                    { id: "dir-ret-2", shopName: "Durga Medical Store", phone: "9876543202", address: "Medical College Road, Gorakhpur", rating: 3.9, ratingCount: 45, lat: 26.7900, lng: 83.3900, city: area },
                    { id: "dir-ret-3", shopName: "Swadeshi Meds & Diagnostics", phone: "9876543203", address: "Buxipur Market, Gorakhpur", rating: 4.8, ratingCount: 210, lat: 26.7550, lng: 83.3680, city: area },
                    { id: "dir-ret-4", shopName: "Arogya Pharma Hub", phone: "9876543204", address: "Shahpur Area, Gorakhpur", rating: 4.1, ratingCount: 65, lat: 26.7720, lng: 83.3550, city: area },
                    { id: "dir-ret-5", shopName: "City Meds Gorakhpur", phone: "9876543205", address: "Railway Station Road, Gorakhpur", rating: 3.5, ratingCount: 18, lat: 26.7650, lng: 83.3850, city: area }
                ] : [
                    { id: "dir-doc-1", name: "Dr. Alok Srivastava (Pediatrics)", phone: "9876543211", hospital: "Srivastava Clinic", specialization: "Pediatrics", rating: 4.6, ratingCount: 95, lat: 26.7620, lng: 83.3710, city: area },
                    { id: "dir-doc-2", name: "Dr. Meera Pandey (Gynecology)", phone: "9876543212", hospital: "Matritva Nursing Home", specialization: "Gynecology", rating: 4.2, ratingCount: 110, lat: 26.7850, lng: 83.3880, city: area },
                    { id: "dir-doc-3", name: "Dr. R. K. Singh (Cardiology)", phone: "9876543213", hospital: "Gorakhpur Heart Care", specialization: "Cardiology", rating: 4.9, ratingCount: 320, lat: 26.7580, lng: 83.3620, city: area },
                    { id: "dir-doc-4", name: "Dr. Amit Verma (General Medicine)", phone: "9876543214", hospital: "Verma Clinic", specialization: "General Medicine", rating: 3.8, ratingCount: 30, lat: 26.7710, lng: 83.3590, city: area },
                    { id: "dir-doc-5", name: "Dr. S. K. Gupta (Dermatology)", phone: "9876543215", hospital: "Gupta Skin Clinic", specialization: "Dermatology", rating: 4.4, ratingCount: 88, lat: 26.7690, lng: 83.3790, city: area }
                ];
                return NextResponse.json({ success: true, directoryLeads: mockList, isMock: true });
            }

            const formattedLeads = dbEntries.map(e => ({
                id: e.id,
                shopName: e.shopName || e.name,
                name: e.name || e.shopName,
                phone: e.phone,
                address: e.address || e.location || "Gorakhpur",
                rating: e.rating || 4.0,
                ratingCount: e.ratingCount || 10,
                lat: e.lat || 26.76,
                lng: e.lng || 83.37,
                city: e.city,
                specialization: e.specialization || undefined
            }));

            return NextResponse.json({ success: true, directoryLeads: formattedLeads, isMock: false });
        }

        // Stage 3: Fetch active leads from Lead Database
        if (action === "get-leads") {
            const leads = await prisma.lead.findMany({
                where: { area: { contains: area, mode: 'insensitive' } },
                include: { assignedAgent: { select: { id: true, name: true } } },
                orderBy: { createdAt: "desc" }
            });
            return NextResponse.json({ success: true, leads });
        }

        // Helper data fetching (Agents and Products)
        if (action === "get-agents-products") {
            const [agents, products] = await Promise.all([
                prisma.user.findMany({
                    where: { role: { in: ["ADMIN", "CRM_STAFF", "OPERATIONS", "AGENT"] } }, // Fetch any staff role since we need salespeople
                    select: { id: true, name: true, role: true }
                }),
                prisma.product.findMany({
                    take: 60,
                    select: { id: true, name: true, price: true, category: true }
                })
            ]);

            return NextResponse.json({ success: true, agents, products });
        }

        // Stage 10 & 11: Repeat-Order Monitoring & Customer RFM Health Score
        if (action === "monitor-customers") {
            // Find all converted accounts
            const customers = await prisma.user.findMany({
                where: { role: { in: ["CUSTOMER", "RETAILER"] } },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    deviceId: true,
                    role: true,
                    createdAt: true,
                    orders: {
                        select: {
                            id: true,
                            total: true,
                            status: true,
                            createdAt: true
                        }
                    },
                    retailer: {
                        select: {
                            shopName: true,
                            city: true
                        }
                    }
                }
            });

            // Map and calculate statistics for each converted profile
            const monitoredData = customers.map(cust => {
                const orders = cust.orders || [];
                const completedOrders = orders.filter(o => o.status !== "Cancelled");
                const totalSpend = completedOrders.reduce((sum, o) => sum + o.total, 0);
                const orderCount = completedOrders.length;
                const avgOrderValue = orderCount > 0 ? totalSpend / orderCount : 0;
                
                // Recency calculation
                let daysSinceLastOrder = 999;
                let lastOrderDate = null;
                if (completedOrders.length > 0) {
                    const sortedOrders = [...completedOrders].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
                    lastOrderDate = sortedOrders[0].createdAt;
                    daysSinceLastOrder = Math.max(0, Math.floor((Date.now() - new Date(lastOrderDate).getTime()) / (1000 * 60 * 60 * 24)));
                }

                // Compute Customer Health Score (0-100)
                // Recency: 40% weight (100 minus 4 points per day idle)
                const recencyScore = Math.max(0, 100 - (daysSinceLastOrder * 4));
                // Frequency: 30% weight (10 points per order)
                const frequencyScore = Math.min(100, orderCount * 12);
                // Monetary Volume: 30% weight (spend volume)
                const monetaryScore = Math.min(100, (totalSpend / 1500) * 100);

                const healthScore = Math.round((recencyScore * 0.4) + (frequencyScore * 0.3) + (monetaryScore * 0.3));

                // Classification status
                let orderStatus = "On Track";
                if (orderCount === 0) {
                    orderStatus = "No Purchases Yet";
                } else if (daysSinceLastOrder > 30) {
                    orderStatus = "Churn Risk";
                } else if (daysSinceLastOrder > 15) {
                    orderStatus = "Slowing Down";
                }

                // AI recommendation generation
                let recommendation = "";
                let campaignTrigger = null;
                if (orderStatus === "Churn Risk") {
                    recommendation = "CRITICAL: Trigger reactivation coupon (15% off) and schedule immediate salesperson call.";
                    campaignTrigger = "RECOVER_15";
                } else if (orderStatus === "Slowing Down") {
                    recommendation = "WARNING: Schedule physical check-in visit. Offer dynamic 10% discount on their top medicines.";
                    campaignTrigger = "VISIT_10";
                } else if (orderStatus === "No Purchases Yet") {
                    recommendation = "ONBOARDING: Send welcome WhatsApp sequence with B2B wholesale prices catalog.";
                    campaignTrigger = "WELCOME_CATALOG";
                } else {
                    // On track!
                    if (healthScore >= 75) {
                        recommendation = "VIP UPSELL: Offer bulk booking deals. Introduce premium vitamins category with 18% margin benefits.";
                        campaignTrigger = "UPSELL_VITAMINS";
                    } else {
                        recommendation = "ENGAGE: Send educational materials on new inventory items.";
                        campaignTrigger = "CONTENT_ENGAGE";
                    }
                }

                return {
                    id: cust.id,
                    name: cust.name,
                    shopName: cust.retailer?.shopName || cust.name,
                    email: cust.email,
                    phone: cust.deviceId || "N/A",
                    role: cust.role,
                    city: cust.retailer?.city || "Gorakhpur",
                    totalSpend: parseFloat(totalSpend.toFixed(2)),
                    orderCount,
                    avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
                    lastOrderDate,
                    daysSinceLastOrder,
                    healthScore,
                    orderStatus,
                    recommendation,
                    campaignTrigger
                };
            });

            return NextResponse.json({ success: true, monitoredCustomers: monitoredData });
        }

        // AGENTIC SYSTEM: Find inactive customers and draft retention campaigns
        if (action === "find-inactive-customers") {
            const result = await CustomerIntelligenceAgent.processInactivityTrigger();
            return NextResponse.json(result);
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (err) {
        console.error("GET Customer Finding API Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user?.role)) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const action = searchParams.get("action");

        const body = await req.json();

        // =====================================================================
        // STAGE 3: Import Directory Businesses to Lead Database
        // =====================================================================
        if (action === "import-leads") {
            const { leads } = body;
            if (!leads || !Array.isArray(leads) || leads.length === 0) {
                return NextResponse.json({ error: "No leads to import" }, { status: 400 });
            }

            let importCount = 0;
            for (const lead of leads) {
                // Check if already in Lead Database
                const exists = await prisma.lead.findFirst({
                    where: { guestPhone: lead.phone }
                });

                if (!exists) {
                    // Create Lead
                    const detailsJson = JSON.stringify({
                        rating: lead.rating || 4.0,
                        ratingCount: lead.ratingCount || 10,
                        lat: lead.lat || 26.76,
                        lng: lead.lng || 83.37,
                        specialization: lead.specialization || ""
                    });

                    await prisma.lead.create({
                        data: {
                            guestName: lead.shopName || lead.name,
                            guestPhone: lead.phone,
                            guestEmail: `${lead.phone}@swastik-lead.com`,
                            area: lead.city || "Gorakhpur",
                            serviceType: lead.specialization ? "doctor" : "retailer",
                            status: "new",
                            source: "directory",
                            notes: lead.address || "",
                            details: detailsJson,
                            tags: ["cold"],
                            qualityScore: 0
                        }
                    });
                    importCount++;
                }
            }

            return NextResponse.json({ success: true, imported: importCount });
        }

        // =====================================================================
        // STAGE 4 & 5: AI Lead Scoring and A/B/C Priority Classification
        // =====================================================================
        if (action === "score-leads") {
            const { area } = body;
            if (!area) {
                return NextResponse.json({ error: "Area parameter required" }, { status: 400 });
            }

            const leads = await prisma.lead.findMany({
                where: { area: { contains: area, mode: 'insensitive' }, status: "new" }
            });

            let scoredCount = 0;

            for (const lead of leads) {
                let score = 50; // Starting baseline

                // Extract details
                let rating = 4.0;
                let ratingCount = 10;
                if (lead.details) {
                    try {
                        const parsed = JSON.parse(lead.details);
                        rating = parsed.rating || rating;
                        ratingCount = parsed.ratingCount || ratingCount;
                    } catch(e){}
                }

                // Heuristic 1: Rating Boost
                if (rating >= 4.5) score += 15;
                else if (rating >= 4.0) score += 8;
                else if (rating < 3.8) score -= 10;

                // Heuristic 2: Business Maturity / Popularity
                if (ratingCount > 100) score += 15;
                else if (ratingCount > 50) score += 8;
                else if (ratingCount < 10) score -= 5;

                // Heuristic 3: Contact Completeness
                if (lead.guestPhone) score += 10;
                if (lead.guestEmail && !lead.guestEmail.includes("swastik-lead")) score += 5;

                // Heuristic 4: Type importance
                if (lead.serviceType === "retailer") score += 10; // Retailers order more frequently
                if (lead.serviceType === "doctor") score += 5;

                // Cap score between 0 and 100
                score = Math.max(0, Math.min(100, score));

                // Classification A/B/C
                let priorityTag = "priority-c";
                if (score >= 80) priorityTag = "priority-a";
                else if (score >= 50) priorityTag = "priority-b";

                const updatedTags = [priorityTag];
                if (score >= 80) updatedTags.push("hot");
                else if (score >= 50) updatedTags.push("warm");
                else updatedTags.push("cold");

                // Save score and tag to DB
                await prisma.lead.update({
                    where: { id: lead.id },
                    data: {
                        qualityScore: score,
                        planType: priorityTag.toUpperCase().split("-")[1], // "A", "B", "C"
                        tags: updatedTags
                    }
                });

                scoredCount++;
            }

            return NextResponse.json({ success: true, scored: scoredCount });
        }

        // =====================================================================
        // STAGE 6: Salesperson Route Planning Optimization
        // =====================================================================
        if (action === "plan-route") {
            const { leadIds, agentId } = body;
            if (!leadIds || !Array.isArray(leadIds) || !agentId) {
                return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
            }

            // Assign leads to salesperson
            await prisma.lead.updateMany({
                where: { id: { in: leadIds } },
                data: { assignedAgentId: agentId }
            });

            // Fetch and sort them to calculate geographic sequence (simple TSP heuristic)
            const assignedLeads = await prisma.lead.findMany({
                where: { id: { in: leadIds } }
            });

            // Map leads to have lat/lng coordinates (fallback to seed values if missing in JSON)
            const mappedLeads = assignedLeads.map(l => {
                let lat = 26.76;
                let lng = 83.37;
                if (l.details) {
                    try {
                        const parsed = JSON.parse(l.details);
                        lat = parsed.lat || lat;
                        lng = parsed.lng || lng;
                    } catch(e){}
                }
                return { ...l, lat, lng };
            });

            // Sort using nearest-neighbor route starting from a central reference point in Gorakhpur/Lucknow
            let currentLat = 26.7588; // Reference center lat
            let currentLng = 83.3731; // Reference center lng
            
            const optimizedRoute = [];
            const remaining = [...mappedLeads];

            while (remaining.length > 0) {
                // Find nearest
                let nearestIndex = 0;
                let minDistance = Infinity;

                for (let i = 0; i < remaining.length; i++) {
                    const l = remaining[i];
                    // Simple distance approximation (Euclidean)
                    const d = Math.sqrt(Math.pow(l.lat - currentLat, 2) + Math.pow(l.lng - currentLng, 2));
                    if (d < minDistance) {
                        minDistance = d;
                        nearestIndex = i;
                    }
                }

                // Add to route
                const nextLead = remaining.splice(nearestIndex, 1)[0];
                optimizedRoute.push(nextLead);
                currentLat = nextLead.lat;
                currentLng = nextLead.lng;
            }

            // Update details on each lead to store its sequence rank
            for (let i = 0; i < optimizedRoute.length; i++) {
                const lead = optimizedRoute[i];
                let parsedDetails = {};
                if (lead.details) {
                    try { parsedDetails = JSON.parse(lead.details); } catch(e){}
                }
                parsedDetails.routeIndex = i + 1;

                await prisma.lead.update({
                    where: { id: lead.id },
                    data: { details: JSON.stringify(parsedDetails) }
                });
            }

            return NextResponse.json({ success: true, message: "Route planned successfully", route: optimizedRoute });
        }

        // =====================================================================
        // STAGE 7: Log Visit / WhatsApp / Call Outreach
        // =====================================================================
        if (action === "log-interaction") {
            const { leadId, type, notes } = body; // type is "visit", "whatsapp", "call"
            if (!leadId || !type) {
                return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
            }

            const lead = await prisma.lead.findUnique({ where: { id: leadId } });
            if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

            let parsedDetails = {};
            if (lead.details) {
                try { parsedDetails = JSON.parse(lead.details); } catch(e){}
            }

            // Add interaction log
            if (!parsedDetails.interactions) parsedDetails.interactions = [];
            parsedDetails.interactions.push({
                type,
                notes: notes || `Logged outreach: ${type}`,
                date: new Date().toISOString()
            });

            // Update status and last contacted
            await prisma.lead.update({
                where: { id: leadId },
                data: {
                    status: "contacted",
                    lastContactDate: new Date(),
                    lastAction: type,
                    details: JSON.stringify(parsedDetails)
                }
            });

            return NextResponse.json({ success: true, interactions: parsedDetails.interactions });
        }

        // =====================================================================
        // STAGE 8: Save Quotation Builder Data
        // =====================================================================
        if (action === "save-quotation") {
            const { leadId, items, discount } = body; // items: [{id, name, price, quantity}]
            if (!leadId || !items || !Array.isArray(items)) {
                return NextResponse.json({ error: "Invalid quotation data" }, { status: 400 });
            }

            const lead = await prisma.lead.findUnique({ where: { id: leadId } });
            if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

            let parsedDetails = {};
            if (lead.details) {
                try { parsedDetails = JSON.parse(lead.details); } catch(e){}
            }

            // Calculate totals
            const rawSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const discountAmount = rawSubtotal * ((discount || 0) / 100);
            const subtotal = rawSubtotal - discountAmount;
            const tax = subtotal * 0.12; // 12% GST standard
            const totalAmount = subtotal + tax;

            parsedDetails.quotation = {
                items,
                discount: discount || 0,
                rawSubtotal: parseFloat(rawSubtotal.toFixed(2)),
                tax: parseFloat(tax.toFixed(2)),
                totalAmount: parseFloat(totalAmount.toFixed(2)),
                status: "APPROVED",
                createdAt: new Date().toISOString()
            };

            await prisma.lead.update({
                where: { id: leadId },
                data: {
                    status: "follow_up", // Move to follow_up pipeline status
                    amount: totalAmount,
                    details: JSON.stringify(parsedDetails)
                }
            });

            return NextResponse.json({ success: true, quotation: parsedDetails.quotation });
        }

        // =====================================================================
        // STAGE 9: Convert Lead to Customer Account & Submit First Order
        // =====================================================================
        if (action === "convert-lead") {
            const { leadId } = body;
            if (!leadId) return NextResponse.json({ error: "Lead ID required" }, { status: 400 });

            const lead = await prisma.lead.findUnique({ where: { id: leadId } });
            if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

            // Extract quotation
            let parsedDetails = {};
            if (lead.details) {
                try { parsedDetails = JSON.parse(lead.details); } catch(e){}
            }

            const quote = parsedDetails.quotation;
            if (!quote || !quote.items || quote.items.length === 0) {
                return NextResponse.json({ error: "No quotation exists for this lead. Please create a quote first." }, { status: 400 });
            }

            // Check if user already exists
            const userPhone = lead.guestPhone;
            const userEmail = lead.guestEmail || `${userPhone}@swastik.com`;
            let user = await prisma.user.findFirst({
                where: { OR: [{ email: userEmail }, { deviceId: userPhone }] }
            });

            const defaultPassword = `Swastik@${userPhone.slice(-4)}`; // Generate default password

            if (!user) {
                const hashedPassword = await bcrypt.hash(defaultPassword, 10);
                const isRetailer = lead.serviceType === "retailer";
                
                // Create user
                user = await prisma.user.create({
                    data: {
                        name: lead.guestName,
                        email: userEmail,
                        password: hashedPassword,
                        role: isRetailer ? "RETAILER" : "CUSTOMER",
                        deviceId: userPhone,
                        phoneVerified: true,
                        referralCode: generateReferralCode(lead.guestName)
                    }
                });

                // Create profile
                if (isRetailer) {
                    await prisma.retailer.create({
                        data: {
                            userId: user.id,
                            shopName: lead.guestName,
                            address: lead.notes || "Gorakhpur",
                            phone: userPhone,
                            city: lead.area || "Gorakhpur",
                            verified: true,
                            status: "verified",
                            licenseNumber: `L-${userPhone}`
                        }
                    });
                } else {
                    await prisma.doctor.create({
                        data: {
                            userId: user.id,
                            name: lead.guestName,
                            phone: userPhone,
                            city: lead.area || "Gorakhpur",
                            specialization: parsedDetails.specialization || "General Medicine",
                            verified: true,
                            status: "verified"
                        }
                    });
                }
            }

            // Create Order in DB
            const deliveryCode = generateDeliveryCode();
            const newOrder = await prisma.order.create({
                data: {
                    userId: user.id,
                    total: parseFloat(quote.totalAmount),
                    status: "Processing",
                    paymentMethod: "COD", // B2B Typically Cash On Delivery or invoice credit
                    deliveryCode,
                    items: {
                        create: quote.items.map(item => ({
                            productId: item.id,
                            quantity: item.quantity,
                            price: item.price
                        }))
                    }
                }
            });

            // Mark Lead as converted
            await prisma.lead.update({
                where: { id: leadId },
                data: {
                    status: "converted",
                    userId: user.id
                }
            });

            return NextResponse.json({
                success: true,
                message: "Lead successfully converted to customer",
                user: { id: user.id, email: user.email, role: user.role, password: defaultPassword },
                orderId: newOrder.id
            });
        }

        // =====================================================================
        // STAGE 12: Trigger Retention Action (Coupons)
        // =====================================================================
        if (action === "trigger-retention") {
            const { customerId, code, discountVal } = body;
            if (!customerId || !code) {
                return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
            }

            // Create a custom coupon record in PostgreSQL
            const newCoupon = await prisma.coupon.create({
                data: {
                    code,
                    discount: parseFloat(discountVal || 10),
                    type: "percentage",
                    minAmount: 500,
                    isActive: true,
                    description: `Retention coupon for customer ID: ${customerId}`
                }
            });

            return NextResponse.json({
                success: true,
                message: `Retention campaign successfully deployed. Coupon code '${code}' generated and sent via mock SMS/WhatsApp.`,
                coupon: newCoupon
            });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (err) {
        console.error("POST Customer Finding API Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

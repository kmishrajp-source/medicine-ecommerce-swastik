import prisma from "@/lib/prisma";

// ─── Intent Detection Helpers ────────────────────────────────────────────────

export function detectIntent(msg) {
    const text = msg.toLowerCase();

    // Registration intents
    if (/register|signup|sign up|join|create.{0,10}account|new.{0,10}account|enroll|onboard/i.test(text)) {
        if (/retailer|pharmacy|pharma|shop|store|medicine.{0,10}shop|drug.{0,10}store/i.test(text))  return "register_retailer";
        if (/delivery|transporter|transport|driver|agent|logistics|courier|deliver/i.test(text))       return "register_delivery";
        if (/doctor|physician|clinic|specialist/i.test(text))                                          return "register_doctor";
        if (/hospital|nursing.?home|health.?centre/i.test(text))                                       return "register_hospital";
        if (/lab|diagnostic|pathology|test.?centre/i.test(text))                                       return "register_lab";
        return "register_customer"; // default
    }

    // Business & Retailer FAQs
    if (/payout|commission|margin|payment cycle|settlement|get paid|earnings/i.test(text) && /retailer|pharmacy|partner/i.test(text)) return "faq_retailer_payout";
    if (/accept order|how to accept|manage order/i.test(text) && /retailer|pharmacy/i.test(text)) return "faq_retailer_orders";
    if (/offline|online|vacation|close shop/i.test(text)) return "faq_retailer_status";
    
    // Doctor FAQs
    if (/consultation fee|doctor fee|charge patients/i.test(text) && /doctor/i.test(text)) return "faq_doctor_fees";

    // Delivery FAQs
    if (/delivery fee|agent payout|how much.*earn/i.test(text) && /delivery|agent/i.test(text)) return "faq_agent_payout";

    // Customer FAQs
    if (/return|refund|cancel order|replace/i.test(text)) return "faq_return_refund";
    if (/upload prescription|how to upload|prescription required/i.test(text)) return "faq_prescription";
    if (/referral|refer and earn|bonus/i.test(text)) return "faq_referral";
    if (/substitute|generic|alternative/i.test(text)) return "faq_substitute";

    // Login / account help
    if (/login|sign.?in|forgot.{0,10}password|reset.{0,10}password|can.{0,5}t.{0,10}log/i.test(text)) return "login_help";

    // Order / tracking
    if (/track|where.{0,10}order|status.{0,10}order|order.{0,10}status/i.test(text)) return "order_track";

    // Delivery areas / timing
    if (/deliver.{0,10}area|cover.{0,10}area|available.{0,10}area|which.{0,10}city|which.{0,10}area|how.{0,10}long|delivery.{0,10}time/i.test(text)) return "delivery_info";

    // Pricing / charges
    if (/price|cost|charge|fee|free.{0,10}delivery|minimum.{0,10}order/i.test(text)) return "pricing_info";

    // Enhanced Medicine detection
    const explicitMedicine = text.match(/(?:do you have|i need|looking for|buy|order|price of|cost of).{1,5}\b([a-z0-9-]{3,20})\b/i);
    const commonDrugMatch = text.match(/\b(paracetamol|ibuprofen|aspirin|crocin|metformin|amlodipine|atorvastatin|amoxicillin|azithromycin|pantoprazole|omeprazole|cetirizine|dolo|combiflam|montair|telmisartan)\b/);
    
    if (explicitMedicine && explicitMedicine[1]) {
        return { type: "medicine", drug: explicitMedicine[1] };
    } else if (commonDrugMatch) {
        return { type: "medicine", drug: commonDrugMatch[0] };
    }

    // Symptom matching for doctors
    const symptoms = text;
    if (/headache|fever|cold|cough|flu|pain/i.test(symptoms)) return { type: "symptom", specialty: "General Physician" };
    if (/heart|chest pain|blood pressure/i.test(symptoms)) return { type: "symptom", specialty: "Cardiologist" };
    if (/skin|rash|acne|hair/i.test(symptoms)) return { type: "symptom", specialty: "Dermatologist" };
    if (/tooth|teeth|gum/i.test(symptoms)) return { type: "symptom", specialty: "Dentist" };
    if (/stomach|digestion|acidity/i.test(symptoms)) return { type: "symptom", specialty: "Gastroenterologist" };
    if (/bone|joint|fracture|back pain/i.test(symptoms)) return { type: "symptom", specialty: "Orthopedic" };
    if (/eye|vision|sight/i.test(symptoms)) return { type: "symptom", specialty: "Ophthalmologist" };
    if (/child|baby|pediatric/i.test(symptoms)) return { type: "symptom", specialty: "Pediatrician" };
    if (/doctor|sick|ill/i.test(symptoms) && !/register/i.test(symptoms)) return { type: "symptom", specialty: "General Physician" };

    // Lab Test matching
    const labMatch = text.match(/\b(blood|sugar|lipid|cbc|thyroid|urine|liver|kidney|hba1c|cholesterol|vitamin).{0,10}(test|profile|panel)\b/i);
    if (labMatch) return { type: "lab_test", testName: `${labMatch[1]} ${labMatch[2]}` };
    
    if (/book.{0,10}lab|lab.{0,10}test/i.test(text)) return { type: "lab_test", testName: "General" };

    // Greetings
    if (/^hi|^hello|^hey|^greetings/i.test(text)) return "general";

    return "unknown";
}

// ─── Response Templates ──────────────────────────────────────────────────────

const RESPONSES = {
    // ---- Registrations ----
    register_customer: `👋 **Welcome to Swastik Medicare!**\n\nCreating a customer account is quick and free. Here's how:\n\n**Step 1:** Go to our sign-up page 👉 https://swastikmed.online/en/signup\n**Step 2:** Enter your details\n**Step 3:** Click **Register** — that's it!\n\nNeed help? WhatsApp us at **+91-XXXXXXXXXX**`,
    register_retailer: `🏪 **Join as a Pharmacy Partner!**\n\nGrow your business with Swastik Medicare. Register here:\n👉 https://swastikmed.online/en/retailer/register\n\nFill in your shop details and drug license. Your account will be reviewed within 24 hours.`,
    register_delivery: `🚚 **Join as a Delivery Agent!**\n\nEarn money by delivering medicines. Register here:\n👉 https://swastikmed.online/en/agent/register\n\nYou'll need your Vehicle Number and Driving License.`,
    register_doctor: `👨‍⚕️ **Register as a Doctor!**\n\nReach more patients. Register here:\n👉 https://swastikmed.online/en/doctor/register`,
    register_hospital: `🏥 **Register your Hospital!**\n\nList your hospital: https://swastikmed.online/en/hospital/register`,
    register_lab: `🔬 **Register your Lab!**\n\nList your lab: https://swastikmed.online/en/lab/register`,

    // ---- Business FAQs ----
    faq_retailer_payout: `💰 **Retailer Payouts & Commissions**\n\n- **Settlement Cycle:** Payouts are processed every **Tuesday and Friday** directly to your registered bank account.\n- **Commission:** Swastik Medicare charges a flat **5% platform fee** on orders. The remaining 95% goes to you!\n- Track earnings in your Retailer Dashboard under "Revenue".`,
    faq_retailer_orders: `📦 **Accepting Orders (Retailers)**\n\n1. When a nearby customer orders, your dashboard will ring.\n2. Click **Accept** within 5 minutes.\n3. Pack the medicine and mark it "Ready for Pickup".\n4. A Swastik delivery agent will arrive shortly!`,
    faq_retailer_status: `🔴 **Going Offline (Retailers)**\n\nNeed to close your shop or taking a break? Go to your Dashboard and toggle your status to **"Offline"**. You won't receive new orders until you toggle it back to **"Online"**.`,
    faq_doctor_fees: `💸 **Doctor Consultation Fees**\n\nYou set your own consultation fee! Swastik Medicare deducts a small **10% platform fee** per booking. Payouts are credited weekly.`,
    faq_agent_payout: `🛵 **Delivery Agent Earnings**\n\nDelivery agents earn a base fee per order + distance bonus. Payments are calculated daily and transferred to your account **weekly (every Monday)**.`,

    // ---- Customer FAQs ----
    faq_return_refund: `↩️ **Returns & Refunds**\n\n- **Medicines:** Can be returned within **3 days** if unopened and seal is intact.\n- **Refunds:** Processed to your original payment method within **3-5 business days**.\n- Need to cancel? You can cancel an order from "My Orders" before it is dispatched.`,
    faq_prescription: `📋 **Uploading Prescriptions**\n\nCertain medicines require a valid doctor's prescription.\n1. Add the medicine to your cart.\n2. During checkout, you'll be prompted to **Upload Prescription**.\n3. Our pharmacist will verify it within 10 minutes!`,
    faq_referral: `🎁 **Refer & Earn**\n\nShare your referral code with friends! When they place their first order, **both of you receive ₹50** in your Swastik Wallet. Find your code in your Profile.`,
    faq_substitute: `💊 **Medicine Substitutes**\n\nIf a prescribed brand is unavailable, our pharmacists may suggest an exact generic substitute with the same active ingredients. You must explicitly **approve** the substitute before we dispatch it.`,

    // ---- General ----
    login_help: `🔐 **Login Help**\n\n**Customers:** https://swastikmed.online/en/login\n**Forgot Password?** https://swastikmed.online/en/forgot-password\n\n**Retailers:** https://swastikmed.online/en/retailer/login`,
    order_track: `📦 **Track Your Order**\n\nGo to your profile page 👉 https://swastikmed.online/en/profile or use the tracking link sent via SMS/WhatsApp.`,
    delivery_info: `🗺️ **Delivery Areas & Timing**\n\nWe deliver in Gorakhpur and Delhi NCR.\n⏱️ **Delivery Time:** 10 to 60 minutes.\n📦 **Free delivery** on orders above ₹500.`,
    pricing_info: `💰 **Pricing**\n\n- 🆓 Free Delivery above ₹500\n- 💊 Medicines as per MRP\n- 📋 Save 5% on monthly auto-refills`,
    general: `👋 **Hi! I'm Sofiya, your Swastik AI Assistant.**\n\nI can help you with:\n🏥 **Registrations** (Customer, Pharmacy, Doctor)\n💊 **Medicine Checks** (e.g. "Do you have Paracetamol?")\n💰 **Business FAQs** (Payouts, Commissions, Orders)\n↩️ **Customer Help** (Refunds, Prescriptions, Tracking)\n\nWhat can I help you with today?`,
    unknown: `I'm not quite sure about that. I am constantly learning! You can ask me about:\n- Finding medicines or doctors\n- How to register as a retailer/partner\n- Returns, refunds, and order tracking\n- Partner commissions and payouts\n\nIf you need human support, please contact us at swastikmedicare.help@gmail.com.`
};

// ─── Main Processor ──────────────────────────────────────────────────────────

export async function processChatMessage(message) {
    try {
        if (!message || message.trim() === "") return { responseText: "How can I help you?", sources: [] };

        const intent = detectIntent(message);

        // Handle medicine-specific queries with Database Stock Check
        if (intent && typeof intent === "object" && intent.type === "medicine") {
            const drugName = intent.drug;
            let responseText = "";
            let sources = [];

            try {
                const dbProduct = await prisma.product.findFirst({
                    where: { name: { contains: drugName, mode: 'insensitive' } }
                });

                if (dbProduct) {
                    responseText = `✅ **We have ${dbProduct.name} in stock!**\n\n*   **Price:** ₹${dbProduct.price}\n*   **Stock Status:** ${dbProduct.stock > 0 ? "Available" : "Out of Stock"}\n\n🛒 **Buy Now:** https://swastikmed.online/en/shop-medicines\n\n`;
                    sources.push("Swastik Inventory");
                }

                // OpenFDA lookup
                const fdaRes = await fetch(`https://api.fda.gov/drug/label.json?search=active_ingredient:"${drugName}"&limit=1`);
                const fdaData = await fdaRes.json();

                if (fdaData.results && fdaData.results.length > 0) {
                    const info = fdaData.results[0];
                    const dosage = info.dosage_and_administration ? info.dosage_and_administration[0].substring(0, 200) + "..." : "Consult label for dosage.";
                    
                    if (!dbProduct) responseText = `💊 **${drugName.toUpperCase()} Information:**\n\n`;
                    responseText += `**Medical Info (OpenFDA):**\n*   **Usage Guidance:** ${dosage}\n\n⚠️ **Safety Note:** Always follow prescription.`;
                    sources.push("OpenFDA");
                } else if (!dbProduct) {
                    responseText = `I couldn't find detailed stock for **${drugName}** right now.\n\n🛒 Search our catalog: https://swastikmed.online/en/shop-medicines`;
                }
            } catch (err) {
                console.error("Medicine lookup failed", err);
                if (!responseText) responseText = `Please browse our shop for ${drugName}: https://swastikmed.online/en/shop-medicines`;
            }

            return { responseText, sources, disclaimer: "Informational guidance only." };
        }

        // Handle symptom queries with Doctor Matchmaking
        if (intent && typeof intent === "object" && intent.type === "symptom") {
            const specialty = intent.specialty;
            const doctor = await prisma.doctor.findFirst({
                where: { specialization: { contains: specialty, mode: 'insensitive' }, isDirectory: false },
                include: { user: true }
            });

            let responseText = `👨‍⚕️ **Doctor Recommendation**\n\nBased on your symptoms, I recommend a **${specialty}**.\n\n`;
            if (doctor) {
                const docName = doctor.user?.name || doctor.name || "Doctor";
                responseText += `I found **Dr. ${docName}** available.\n*   **Fee:** ₹${doctor.consultationFee}\n\n🔗 **Book:** https://swastikmed.online/en/doctors/${doctor.id}`;
            } else {
                responseText += `👉 Browse doctors: https://swastikmed.online/en/doctors`;
            }
            return { responseText, sources: ["Swastik Health Network"], disclaimer: "Not a medical diagnosis." };
        }

        // Handle Lab Test matching
        if (intent && typeof intent === "object" && intent.type === "lab_test") {
            const testName = intent.testName;
            let responseText = "";
            if (testName === "General") {
                responseText = `🔬 **Diagnostic Labs**\n\nWe offer home collection for many tests.\n👉 **Book:** https://swastikmed.online/en/labs`;
            } else {
                const labTest = await prisma.labTest.findFirst({
                    where: { name: { contains: testName, mode: 'insensitive' } },
                    include: { lab: true }
                });

                if (labTest && labTest.lab) {
                    responseText = `🔬 **Lab Test Available**\n\n**${labTest.name}** at **${labTest.lab.name}**.\n*   **Price:** ₹${labTest.price}\n\n🔗 **Book:** https://swastikmed.online/en/labs/${labTest.lab.id}`;
                } else {
                    responseText = `🔬 **Lab Test**\n\nI couldn't find a direct match for ${testName}.\n👉 **Browse Labs:** https://swastikmed.online/en/labs`;
                }
            }
            return { responseText, sources: ["Swastik Health Network"], disclaimer: "Results must be interpreted by a professional." };
        }

        // Standard Text Responses
        const intentKey = typeof intent === "string" ? intent : "unknown";
        const responseText = RESPONSES[intentKey] || RESPONSES.unknown;
        
        return { 
            responseText, 
            sources: [], 
            disclaimer: intentKey.startsWith("register") || intentKey.startsWith("faq") || intentKey === "general" ? null : "Informational guidance only."
        };

    } catch (error) {
        console.error("AI Brain Error:", error);
        return { responseText: "I'm having a little trouble thinking right now. Please try again later.", sources: [] };
    }
}

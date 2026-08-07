import prisma from "@/lib/prisma";
import fs from 'fs';
import path from 'path';

let genericMedicines = [];
try {
    const dataPath = path.join(process.cwd(), 'data', 'generic-medicines.json');
    genericMedicines = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
} catch (e) {
    console.error("Failed to load generic medicines", e);
}

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

    // Talk to representative / dispatch
    if (/representative|dispatch|speak to|talk to|human|agent support|call support|contact us/i.test(text)) return "talk_to_rep";

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
    
    // Drug Interaction Check
    const allKnownDrugs = [...new Set([...genericMedicines.map(m => m.genericName.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '')), "paracetamol", "ibuprofen", "aspirin", "amoxicillin", "cetirizine", "pantoprazole", "omeprazole", "diclofenac", "azithromycin", "ciprofloxacin"])].filter(d => d.length > 3);
    let mentionedDrugs = [];
    for (const drug of allKnownDrugs) {
        if (text.includes(drug)) {
            if (!mentionedDrugs.includes(drug)) mentionedDrugs.push(drug);
        }
    }
    // Only trigger interaction if the user is asking about mixing/taking them together, or just mentions multiple drugs in a query
    if (mentionedDrugs.length > 1 && (text.includes("and") || text.includes("with") || text.includes("together") || text.includes("mix"))) {
        return { type: "drug_interaction", drugs: mentionedDrugs };
    }

    // Chronic Refill Setup Intent (user confirms they want a refill reminder)
    if (/yes.*refill|set.*refill|setup.*refill|remind me|auto.?refill|monthly.?remind|subscribe/i.test(text)) {
        return { type: "setup_refill" };
    }

    // Chronic medicine detection — proactively offer refill reminder
    const chronicDrugMatch = text.match(/\b(metformin|glimepiride|glibenclamide|sitagliptin|januvia|atorvastatin|rosuvastatin|telmisartan|amlodipine|losartan|atenolol|metoprolol|levothyroxine|thyronorm|eltroxin|aspirin|clopidogrel|ramipril|enalapril|lisinopril|furosemide|spironolactone)\b/i);
    if (chronicDrugMatch) {
        const drugName = chronicDrugMatch[0];
        // Map drug to category for the response
        let chronicCategory = "chronic condition";
        if (/metformin|glimepiride|glibenclamide|sitagliptin|januvia/.test(drugName.toLowerCase())) chronicCategory = "Diabetes";
        else if (/atorvastatin|rosuvastatin/.test(drugName.toLowerCase())) chronicCategory = "Cholesterol";
        else if (/telmisartan|amlodipine|losartan|atenolol|metoprolol|ramipril|enalapril|lisinopril/.test(drugName.toLowerCase())) chronicCategory = "Blood Pressure";
        else if (/levothyroxine|thyronorm|eltroxin/.test(drugName.toLowerCase())) chronicCategory = "Thyroid";
        else if (/aspirin|clopidogrel/.test(drugName.toLowerCase())) chronicCategory = "Heart / Blood Thinner";
        return { type: "chronic_medicine", drug: drugName, category: chronicCategory };
    }

    if (explicitMedicine && explicitMedicine[1]) {
        return { type: "medicine", drug: explicitMedicine[1] };
    } else if (commonDrugMatch) {
        return { type: "medicine", drug: commonDrugMatch[0] };
    }

    // Generic Alternative Match
    for (const med of genericMedicines) {
        if (!med.commonBrand) continue;
        const brands = med.commonBrand.split('/').map(b => b.trim().toLowerCase());
        for (const brand of brands) {
            if (brand.length > 2 && text.includes(brand)) {
                return { type: "generic_alternative", med, requestedBrand: brand };
            }
        }
    }

    // Enhanced OTC Medicine Symptom matching
    const otcMatch = text.match(/\b(headache|fever|acidity|gas|heartburn|cold|cough|runny nose|sneeze|allergies|allergy|diarrhea|loose motion|constipation|muscle pain|sprain|body ache|sore throat|itching|fungal|mouth ulcer)\b/i);
    if (otcMatch && !/doctor|hospital|clinic/i.test(text)) {
        let drugName = "paracetamol"; // default for fever/headache
        const matchStr = otcMatch[0].toLowerCase();
        if (/acidity|gas|heartburn/.test(matchStr)) drugName = "pantoprazole";
        else if (/cold|runny nose|sneeze|allergies|allergy/.test(matchStr)) drugName = "cetirizine";
        else if (/cough|sore throat/.test(matchStr)) drugName = "dextromethorphan";
        else if (/diarrhea|loose motion/.test(matchStr)) drugName = "loperamide";
        else if (/constipation/.test(matchStr)) drugName = "bisacodyl";
        else if (/muscle pain|sprain|body ache/.test(matchStr)) drugName = "diclofenac";
        else if (/itching|fungal/.test(matchStr)) drugName = "clotrimazole";
        else if (/mouth ulcer/.test(matchStr)) drugName = "choline salicylate";
        
        return { type: "otc_symptom", symptom: matchStr, drug: drugName };
    }

    // Symptom matching for doctors
    const symptoms = text;
    if (/flu|severe pain/i.test(symptoms)) return { type: "symptom", specialty: "General Physician" };
    if (/heart|chest pain|blood pressure/i.test(symptoms)) return { type: "symptom", specialty: "Cardiologist" };
    if (/skin|rash|acne|hair/i.test(symptoms)) return { type: "symptom", specialty: "Dermatologist" };
    if (/tooth|teeth|gum/i.test(symptoms)) return { type: "symptom", specialty: "Dentist" };
    if (/stomach|digestion/i.test(symptoms)) return { type: "symptom", specialty: "Gastroenterologist" };
    if (/bone|joint|fracture|back pain/i.test(symptoms)) return { type: "symptom", specialty: "Orthopedic" };
    if (/eye|vision|sight/i.test(symptoms)) return { type: "symptom", specialty: "Ophthalmologist" };
    if (/child|baby|pediatric/i.test(symptoms)) return { type: "symptom", specialty: "Pediatrician" };
    if (/doctor|sick|ill|pain/i.test(symptoms) && !/register/i.test(symptoms)) return { type: "symptom", specialty: "General Physician" };

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

    // ---- Human Support ----
    talk_to_rep: `🙋 **Talk to a Swastik Representative**\n\nOur team is here to help you right away!\n\n📞 **Call / WhatsApp:** [+91-7992122974](https://wa.me/917992122974?text=I%20need%20help%20from%20a%20representative)\n📧 **Email:** swastikmedicare.help@gmail.com\n💬 **WhatsApp Chat:** https://wa.me/917992122974\n\n⏰ **Support Hours:** 7 AM – 10 PM, 7 days a week.\n\nYou can also type your issue here and I'll do my best to assist instantly! 😊`,

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

        // 1. Detect if the user is providing a phone number (Lead Capture)
        const phoneMatch = message.match(/(?:ph|phone|call me at|my number is)?\s*(\+?91)?\s*([6-9]\d{9})\b/i);
        if (phoneMatch) {
            const rawPhone = phoneMatch[2];
            try {
                // Save to leads database
                await prisma.lead.create({
                    data: {
                        source: "AI_Chatbot",
                        type: "B2C",
                        phone: rawPhone,
                        notes: `Captured via Chatbot. User's full message: "${message}"`,
                        status: "new",
                        qualityScore: 80,
                        tags: ["CHATBOT_LEAD"]
                    }
                });
                return { responseText: `✅ **Got it!**\n\nI have alerted our dispatch team. A Swastik Medicare representative will call you shortly at **+91-${rawPhone}**.`, sources: [] };
            } catch (err) {
                console.error("Lead capture failed:", err);
            }
        }

        const intent = detectIntent(message);

        // Define the soft prompt to append to high-value queries
        const callbackPrompt = `\n\n📞 **Need instant help booking?** Type your 10-digit phone number here and our team will call you back immediately!`;


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

            responseText += callbackPrompt;

            return { responseText, sources, disclaimer: "Informational guidance only." };
        }

        // Handle Drug Interaction Check
        if (intent && typeof intent === "object" && intent.type === "drug_interaction") {
            const { drugs } = intent;
            let responseText = `⚠️ **Drug Interaction Check: ${drugs.map(d => d.toUpperCase()).join(' + ')}**\n\n`;
            let sources = ["OpenFDA Interaction API"];
            
            try {
                const fdaRes = await fetch(`https://api.fda.gov/drug/label.json?search=active_ingredient:"${drugs[0]}"&limit=1`);
                const fdaData = await fdaRes.json();
                
                let foundInteraction = false;
                if (fdaData.results && fdaData.results.length > 0 && fdaData.results[0].drug_interactions) {
                    const interactionsText = fdaData.results[0].drug_interactions[0].toLowerCase();
                    const secondDrug = drugs[1];
                    if (interactionsText.includes(secondDrug)) {
                        foundInteraction = true;
                        const idx = interactionsText.indexOf(secondDrug);
                        const snippet = fdaData.results[0].drug_interactions[0].substring(Math.max(0, idx - 50), idx + 150).replace(/\n/g, ' ');
                        responseText += `🚨 **Potential Interaction Found!**\n\nAccording to the FDA label for ${drugs[0].toUpperCase()}:\n*"...${snippet}..."*\n\n`;
                    }
                }
                
                if (!foundInteraction) {
                    responseText += `🔍 I checked the FDA database for interactions between **${drugs[0].toUpperCase()}** and the other medications, but could not find a specific warning in the primary label.\n\nHowever, **always consult a doctor or pharmacist** before mixing medications, as severe interactions can still occur.\n\n`;
                }
            } catch (err) {
                console.error("Interaction check failed", err);
                responseText += `Unable to connect to the FDA database right now. Please consult a doctor before combining these medications.\n\n`;
            }

            responseText += callbackPrompt;
            return { responseText, sources, disclaimer: "This checker is for informational purposes only. Do not rely on it for medical decisions." };
        }

        // Handle Generic Alternative
        if (intent && typeof intent === "object" && intent.type === "generic_alternative") {
            const { med, requestedBrand } = intent;
            let responseText = `💡 **Smart Savings Alert!**\n\nYou asked about **${requestedBrand.toUpperCase()}** (Brand Price: ₹${med.brandedPrice.toFixed(2)}).\n\nDid you know you can get the exact same medicine with the generic name **${med.genericName.toUpperCase()}** for just **₹${med.genericPrice.toFixed(2)}**?\n\n*   **Use Case:** ${med.useCase}\n*   **Savings:** You save ₹${(med.brandedPrice - med.genericPrice).toFixed(2)}\n\n🛒 **Search for ${med.genericName} here:** https://swastikmed.online/en/shop-medicines\n\n`;
            
            responseText += callbackPrompt;
            return { responseText, sources: ["Swastik Health Generic Database"], disclaimer: "Always consult your doctor before switching medications." };
        }

        // Handle Chronic Medicine Detection → Offer Refill Reminder
        if (intent && typeof intent === "object" && intent.type === "chronic_medicine") {
            const { drug, category } = intent;
            let responseText = `💊 **Chronic Medication Detected: ${drug.toUpperCase()}**\n\n`;
            let sources = ["Swastik Health Network"];

            try {
                const dbProduct = await prisma.product.findFirst({
                    where: { name: { contains: drug, mode: 'insensitive' } }
                });

                if (dbProduct) {
                    responseText += `✅ **In Stock:** ${dbProduct.name} — ₹${dbProduct.price}\n🛒 **Order Now:** https://swastikmed.online/en/shop-medicines\n\n`;
                    sources.push("Swastik Inventory");
                } else {
                    responseText += `🛒 **Search for ${drug} in our store:** https://swastikmed.online/en/shop-medicines\n\n`;
                }
            } catch (err) {
                console.error("Chronic medicine inventory check failed", err);
            }

            responseText += `♻️ **Never Miss a Dose!**\n\nSince **${drug.toUpperCase()}** is used daily for **${category}**, would you like me to set up a **free monthly auto-refill reminder**?\n\nJust type **"yes, set refill"** and I'll remind you 5 days before your medicine runs out every month!\n\n⚠️ _Always take this medication as prescribed by your doctor. Do not stop suddenly._`;

            responseText += callbackPrompt;
            return { responseText, sources, disclaimer: "Always follow your doctor's prescription for chronic medications." };
        }

        // Handle Refill Setup Confirmation
        if (intent && typeof intent === "object" && intent.type === "setup_refill") {
            const responseText = `✅ **Refill Reminder Set Up!**\n\nPlease log in to your Swastik account to activate your monthly auto-refill subscription:\n👉 https://swastikmed.online/en/profile\n\nOnce active, we will send you a **WhatsApp reminder 5 days before** your medicine runs out each month — so you never miss a dose!\n\n💊 **Your health is our priority.** 🙏`;
            return { responseText, sources: ["Swastik Subscription System"], disclaimer: null };
        }

        // Handle OTC Symptom matching
        if (intent && typeof intent === "object" && intent.type === "otc_symptom") {
            const { symptom, drug } = intent;
            let responseText = `🩺 **Symptom Check: ${symptom.charAt(0).toUpperCase() + symptom.slice(1)}**\n\nFor minor ${symptom}, an Over-The-Counter (OTC) medicine like **${drug.toUpperCase()}** is commonly used.\n\n`;
            let sources = ["Swastik Health Network"];

            try {
                // Check inventory
                const dbProduct = await prisma.product.findFirst({
                    where: { name: { contains: drug, mode: 'insensitive' } }
                });

                if (dbProduct) {
                    responseText += `✅ **Available in Store:** ${dbProduct.name} (₹${dbProduct.price})\n🛒 **Buy Now:** https://swastikmed.online/en/shop-medicines\n\n`;
                } else {
                    responseText += `🛒 **Search for ${drug} in our store:** https://swastikmed.online/en/shop-medicines\n\n`;
                }

                // OpenFDA lookup for dosage
                const fdaRes = await fetch(`https://api.fda.gov/drug/label.json?search=active_ingredient:"${drug}"&limit=1`);
                const fdaData = await fdaRes.json();

                if (fdaData.results && fdaData.results.length > 0) {
                    const info = fdaData.results[0];
                    const dosage = info.dosage_and_administration ? info.dosage_and_administration[0].substring(0, 300) + "..." : "Consult label for dosage.";
                    responseText += `📋 **Typical Dosage (OpenFDA):**\n${dosage}\n\n`;
                    sources.push("OpenFDA");
                }
            } catch (err) {
                console.error("OTC lookup failed", err);
            }

            responseText += `⚠️ **Disclaimer:** This is not medical advice. If your ${symptom} is severe or persists, please consult a doctor immediately.\n\n👨‍⚕️ Need a doctor? Browse here: https://swastikmed.online/en/doctors`;
            
            return { responseText, sources, disclaimer: "Not a medical diagnosis. Always consult a physician." };
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
            
            // Soft ask for phone number
            responseText += callbackPrompt;

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

            responseText += callbackPrompt;

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

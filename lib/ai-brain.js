import prisma from "@/lib/prisma";
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { dispatchToViaSocket } from "@/lib/viasocket";

let genericMedicines = [];
try {
    const dataPath = path.join(process.cwd(), 'data', 'generic-medicines.json');
    genericMedicines = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
} catch (e) {
    console.error("Failed to load generic medicines", e);
}

// ─── Response Templates (Unchanged) ──────────────────────────────────────────
const RESPONSES = {
    // ---- Registrations ----
    register_customer: `👋 **Welcome to Swastik Medicare!**\n\nCreating a customer account is quick and free:\n\n**Step 1:** 👉 https://swastikmed.online/en/signup\n**Step 2:** Enter your name, phone & password\n**Step 3:** Click **Register** — that's it!\n\n📞 Need help? WhatsApp us: [+91-7992122974](https://wa.me/917992122974)`,
    register_retailer: `🏪 **Join as a Pharmacy Partner (Retailer)!**\n\n**Why Partner with Swastik Medicare?**\n- 📈 **Zero Marketing Cost:** Get direct orders from patients nearby.\n- 💰 **High Earnings:** You keep **95%** of the order value (flat 5% platform fee).\n- 🚀 **Fast Settlement:** Payouts transferred directly to your bank every Tuesday & Friday.\n- 🛵 **We Handle Delivery:** Our Swastik delivery agents pick up and deliver for you.\n- 📱 **Smart Dashboard:** Manage inventory, track orders, and view revenue analytics.\n\n👉 **Register Now:** https://swastikmed.online/en/retailer/register\n*(Requires valid Drug License & Shop details. Approval in 24 hours.)*`,
    register_delivery: `🚚 **Join as a Delivery Agent (Rider)!**\n\n**Benefits of Riding with Swastik:**\n- 💸 **Earn More:** Get a flat base fee per delivery PLUS distance bonus (₹/km).\n- 🕒 **Flexible Hours:** Work when you want. Toggle online/offline from your app.\n- 🎯 **Hyper-Local Orders:** Most deliveries are within a 5-8 km radius.\n- 💳 **Weekly Payouts:** Your earnings are deposited directly into your bank account every Monday.\n\n👉 **Register Now:** https://swastikmed.online/en/agent/register\n*(Requires Smartphone, 2-Wheeler, and valid Driving License.)*`,
    register_doctor: `👨‍⚕️ **Register as a Doctor!**\n\n**Grow Your Digital Practice:**\n- 🩺 **Wider Reach:** Connect with thousands of patients across Gorakhpur & Delhi NCR.\n- 💵 **Set Your Own Fees:** You decide your consultation charges. (We charge a nominal 10% fee).\n- 📅 **Smart Scheduling:** Manage your OPD hours and online consultations seamlessly.\n- 📝 **Digital Prescriptions:** Generate e-prescriptions that patients can instantly order from.\n- 📈 **Build Reputation:** Verified profiles get higher visibility.\n\n👉 **Register Now:** https://swastikmed.online/en/doctor/register`,
    register_hospital: `🏥 **Register your Hospital!**\n\nList your hospital on our platform:\n👉 https://swastikmed.online/en/hospital/register`,
    register_lab: `🔬 **Register your Lab!**\n\nList your diagnostic lab:\n👉 https://swastikmed.online/en/lab/register`,

    // ---- Business FAQs ----
    faq_retailer_payout: `💰 **Retailer Payouts & Commissions**\n\n- **Settlement Cycle:** Payouts are processed every **Tuesday and Friday** directly to your registered bank account.\n- **Commission:** Swastik Medicare charges a flat **5% platform fee** on orders. The remaining 95% goes to you!\n- Track earnings in your Retailer Dashboard under "Revenue".`,
    faq_retailer_orders: `📦 **Accepting Orders (Retailers)**\n\n1. When a nearby customer orders, your dashboard will ring.\n2. Click **Accept** within 5 minutes.\n3. Pack the medicine and mark it "Ready for Pickup".\n4. A Swastik delivery agent will arrive shortly!`,
    faq_retailer_status: `🔴 **Going Offline (Retailers)**\n\nGo to your Dashboard and toggle your status to **"Offline"**. You won't receive new orders until you toggle back to **"Online"**.`,
    faq_doctor_fees: `💸 **Doctor Consultation Fees**\n\nYou set your own consultation fee! Swastik Medicare deducts a small **10% platform fee** per booking. Payouts credited weekly.`,
    faq_agent_payout: `🛵 **Delivery Agent Earnings**\n\nBase fee per order + distance bonus. Payments calculated daily, transferred to your account **weekly (every Monday)**.`,

    // ---- Customer FAQs ----
    faq_return_refund: `↩️ **Returns & Refunds**\n\n- **Medicines:** Can be returned within **3 days** if unopened and seal is intact.\n- **Refunds:** Processed to your original payment method within **3-5 business days**.\n- Cancel from "My Orders" before dispatch.`,
    faq_prescription: `📋 **Uploading Prescriptions**\n\nSome medicines require a valid doctor's prescription.\n1. Add the medicine to your cart.\n2. During checkout, **Upload Prescription**.\n3. Our pharmacist verifies in 10 minutes!\n\nYou can also use the 📎 button below to scan a prescription right here!`,
    faq_referral: `🎁 **Refer & Earn**\n\nShare your referral code with friends! When they place their first order, **both of you get ₹50** in Swastik Wallet.\n👉 Find your code: https://swastikmed.online/en/refer-and-earn`,
    faq_substitute: `💊 **Medicine Substitutes**\n\nIf a prescribed brand is unavailable, our pharmacists suggest an exact generic substitute with the same active ingredients. You must **approve** it before dispatch.\n\n🔍 Find generic alternatives: https://swastikmed.online/en/generic-medicines`,

    // ---- Human Support ----
    talk_to_rep: `🙋 **Talk to a Swastik Representative**\n\nOur team is here to help!\n\n📞 **Call / WhatsApp:** [+91-7992122974](https://wa.me/917992122974?text=I%20need%20help%20from%20a%20representative)\n📧 **Email:** swastikmedicare.help@gmail.com\n\n⏰ **Support Hours:** 7 AM – 10 PM, 7 days a week.`,

    // ---- Platform Feature Help ----
    ambulance_help: `🚑 **Ambulance Service**\n\nNeed an ambulance? Here's how:\n\n🔴 **Emergency?** → Call **108** immediately!\n🟡 **Non-Emergency?** → Browse available ambulances on our platform:\n👉 https://swastikmed.online/en/ambulance\n\nWe show verified ambulance providers with:\n- Vehicle type (Basic / ICU / Advanced)\n- Real-time availability\n- Direct call button\n\n⚠️ For life-threatening emergencies, always call 108 first.`,

    hospital_help: `🏥 **Find Hospitals**\n\nSearch for hospitals by specialty, services or location:\n👉 https://swastikmed.online/en/hospitals\n\nYou can find:\n- ✅ **Verified hospitals** with quality badge\n- 🔍 Search by specialty (Cardiology, Orthopedics, etc.)\n- 📞 Direct call to hospital\n- 📍 Address and directions\n\nNeed a specific department? Just tell me — e.g. *"hospital with cardiology"*`,

    insurance_help: `🛡️ **Health Insurance**\n\nSwastik Medicare helps with insurance:\n👉 https://swastikmed.online/en/medical-insurance\n\n- 📋 **Browse insurance plans** from top providers\n- 🏥 **Check hospital network** covered by your policy\n- 📎 **Claim assistance** — we guide you through the process\n\n⚠️ Note: Swastik does not sell insurance directly. We provide information and connect you to verified providers.`,

    health_records_help: `📋 **My Health Records**\n\nAccess your digital health records securely:\n👉 https://swastikmed.online/en/my-health-records\n\n- 📄 Past prescriptions\n- 🧪 Lab reports\n- 🏥 Visit history\n- 🔐 ABHA (Ayushman Bharat Health Account) integration\n\nAll records are encrypted and only visible to you.`,

    homeopathy_help: `🌿 **Homeopathy & Alternative Medicine**\n\nWe also cover alternative medicine:\n👉 https://swastikmed.online/en/shop-medicines\n\nBrowse homeopathic medicines in our catalog. Filter by category to find Homeopathy and Ayurvedic products.\n\n⚠️ Always consult a qualified practitioner before using alternative medicines.`,

    subscription_help: `🔄 **Subscription & Auto-Refill**\n\nNever miss your daily medicines!\n👉 https://swastikmed.online/en/subscriptions\n\n- 📅 Set a **monthly auto-refill** for chronic medicines\n- 💰 **Save 5%** on subscription orders\n- 🔔 Get a **WhatsApp reminder** 5 days before refill\n\nTo set up: type *"set refill for Metformin"* or visit your profile.`,

    about_swastik: `🏢 **About Swastik Medicare**\n\nSwastik Medicare is **India's AI-powered digital healthcare network** connecting patients, doctors, pharmacies, labs, and hospitals.\n\n🌍 **Currently serving:** Delhi & Gorakhpur\n🤖 **AI-Powered:** Smart search, medicine alternatives, symptom matching\n💊 **Services:** Medicine delivery, doctor consultations, lab tests, ambulance, insurance\n🏪 **For Businesses:** Retailers, delivery agents, doctors, hospitals, labs can join our partner network\n\n**Owned by** Pranshu Investment Ltd\n🌐 https://swastikmed.online`,

    how_it_works: `🔄 **How Swastik Medicare Works**\n\n**For Customers:**\n1. 🔍 Search for a medicine, doctor, or lab test\n2. 🛒 Add to cart or book an appointment\n3. 💳 Pay online or COD\n4. 🚚 Get medicine delivered in 10-60 minutes!\n\n**For Pharmacies:**\n1. Register your shop → Get orders from nearby customers → Earn 95% of order value\n\n**For Doctors:**\n1. Register → Get patient appointments → Set your own fees\n\n**For Delivery Agents:**\n1. Register → Accept deliveries → Earn per order + distance bonus\n\n👉 **Get Started:** https://swastikmed.online/en/signup`,

    savings_help: `💰 **How to Save on Swastik Medicare**\n\n1. 💊 **Generic Alternatives** — Save up to 80% with exact equivalent generic medicines\n   👉 https://swastikmed.online/en/generic-medicines\n2. 🔄 **Monthly Subscription** — 5% off on auto-refill orders\n3. 🎁 **Refer & Earn** — ₹50 for you + ₹50 for your friend\n4. 🆓 **Free Delivery** on orders above ₹500\n5. 🏷️ **Coupons** — Check our latest offers on the home page`,

    search_medicine_help: `💊 **How to Search for Medicines**\n\nSwastik's AI-powered search makes finding medicines easy and affordable!\n\n**1. Direct Search:** Just type the medicine name (e.g., *"Price of Crocin"* or *"Do you have Metformin?"*).\n**2. Generic Alternatives:** Our AI automatically suggests high-quality generic equivalents that cost up to 80% less! It checks active ingredients instantly.\n**3. Symptom Search:** Have a minor issue? Type *"I have a headache"* and we'll suggest safe OTC (Over-The-Counter) options.\n**4. Prescription Upload:** Don't want to search? Click the 📎 icon to upload your doctor's prescription, and we will find everything for you.\n\nTry it now! Ask me for a medicine.`,

    search_doctor_help: `👨‍⚕️ **How to Find the Right Doctor**\n\nSwastik Medicare connects you with top verified doctors.\n\n**1. By Specialty:** Search for *"Cardiologist"* or *"Skin Specialist"*.\n**2. By Symptom:** Just tell me what's wrong! (e.g., *"I have severe back pain"* or *"My child has a fever"*). The AI will analyze your symptoms and recommend the exact type of specialist you need.\n**3. Book Instantly:** See doctor availability, fees, and clinic locations. Book online consultations or in-person visits instantly.\n\nTry it out: *"Find a doctor for chest pain"*`,

    // ---- General ----
    login_help: `🔐 **Login Help**\n\n**Customers:** https://swastikmed.online/en/login\n**Forgot Password?** https://swastikmed.online/en/forgot-password\n**Retailers:** https://swastikmed.online/en/retailer/login\n**Delivery Agents:** https://swastikmed.online/en/delivery`,
    order_track: `📦 **Track Your Order**\n\nGo to your profile 👉 https://swastikmed.online/en/profile — your active orders and tracking are all there.\n\nYou can also use the tracking link sent via SMS/WhatsApp.`,
    delivery_info: `🗺️ **Delivery Areas & Timing**\n\n📍 We deliver in **Gorakhpur** and **Delhi NCR**.\n⏱️ **Delivery Time:** 10 to 60 minutes.\n📦 **Free delivery** on orders above ₹500.\n🕐 **Hours:** 7 AM – 10 PM, 7 days a week.`,
    pricing_info: `💰 **Pricing**\n\n- 🆓 Free Delivery above ₹500\n- 💊 Medicines at MRP (save more with generics!)\n- 📋 Save 5% on monthly auto-refills\n- 🎁 ₹50 referral bonus for both you and your friend`,
    general: `👋 **Hi! I'm Sofiya, your Swastik AI Assistant.** 🤖\n\nHere's **everything** I can help you with:\n\n💊 **Medicines** — Search, order, find generic alternatives, upload prescription\n👨‍⚕️ **Doctors** — Find by specialty, book appointment, get recommendations\n🏥 **Hospitals** — Search by specialty, check services, find verified facilities\n🧪 **Lab Tests** — Find labs, book tests, home sample collection\n🚑 **Ambulance** — Emergency assist, find nearby ambulance, call 108\n🛡️ **Insurance** — Browse plans, check hospital network, claim help\n📋 **Health Records** — View prescriptions, lab reports, ABHA records\n🚚 **Delivery & Tracking** — Track your order, delivery status\n\n🏪 **For Partners:**\n- Register as Pharmacy / Doctor / Delivery Agent / Hospital / Lab\n- Check payouts, commissions, and orders\n\n🔍 **Try asking me:**\n- *"Find a cardiologist"*\n- *"Do you have Paracetamol?"*\n- *"Generic alternative for Glycomet"*\n- *"I have fever, what should I take?"*\n- *"How to upload prescription?"*\n- *"Track my order"*\n\nWhat would you like help with? 😊`,
};

// ─── TOOL DEFINITIONS ────────────────────────────────────────────────────────
const tools = [
    {
        type: "function",
        function: {
            name: "search_medicine",
            description: "Search the Swastik product database and OpenFDA for a specific medicine, drug, or OTC product.",
            parameters: {
                type: "object",
                properties: {
                    drug_name: { type: "string", description: "The name of the medicine, e.g., 'Paracetamol', 'Glycomet'" }
                },
                required: ["drug_name"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "check_drug_interaction",
            description: "Check for adverse interactions between two or more medications.",
            parameters: {
                type: "object",
                properties: {
                    drugs: { type: "array", items: { type: "string" }, description: "Array of drug names to check" }
                },
                required: ["drugs"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "find_generic_alternative",
            description: "Find cheaper generic alternatives for a branded medicine.",
            parameters: {
                type: "object",
                properties: {
                    brand_name: { type: "string", description: "The branded medicine name, e.g., 'Glycomet'" }
                },
                required: ["brand_name"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "search_doctor",
            description: "Search for doctors by specialty or symptom.",
            parameters: {
                type: "object",
                properties: {
                    specialty_or_symptom: { type: "string", description: "Specialty (e.g., 'Cardiologist') or symptom (e.g., 'chest pain')" }
                },
                required: ["specialty_or_symptom"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "search_lab_test",
            description: "Search and book lab tests.",
            parameters: {
                type: "object",
                properties: {
                    test_name: { type: "string", description: "Name of the lab test, e.g., 'CBC', 'Lipid Profile'" }
                },
                required: ["test_name"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_swastik_info",
            description: "Get static platform information, FAQs, registration links, or ambulance/hospital info.",
            parameters: {
                type: "object",
                properties: {
                    topic: { 
                        type: "string", 
                        enum: Object.keys(RESPONSES),
                        description: "The topic key to retrieve information about."
                    }
                },
                required: ["topic"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "capture_lead",
            description: "Capture the user's phone number to trigger a callback from a human representative.",
            parameters: {
                type: "object",
                properties: {
                    phone: { type: "string", description: "The 10-digit Indian phone number" },
                    notes: { type: "string", description: "Any context about why they want a callback" }
                },
                required: ["phone"]
            }
        }
    }
];

// ─── TOOL HANDLERS ───────────────────────────────────────────────────────────
async function handleToolCall(toolCall) {
    const name = toolCall.function.name;
    const args = JSON.parse(toolCall.function.arguments);

    let result = { disclaimer: null, sources: [] };

    try {
        if (name === "search_medicine") {
            const { drug_name } = args;
            const dbProduct = await prisma.product.findFirst({
                where: { name: { contains: drug_name, mode: 'insensitive' } }
            });

            let openFdaData = null;
            try {
                const fdaRes = await fetch(`https://api.fda.gov/drug/label.json?search=active_ingredient:"${drug_name}"&limit=1`);
                if (fdaRes.ok) {
                    const data = await fdaRes.json();
                    if (data.results && data.results.length > 0) {
                        const info = data.results[0];
                        openFdaData = {
                            usage: info.dosage_and_administration ? info.dosage_and_administration[0].substring(0, 200) + "..." : null,
                            warnings: info.warnings ? info.warnings[0].substring(0, 200) + "..." : null
                        };
                    }
                }
            } catch (e) {
                console.error("FDA fetch error", e);
            }

            result.data = {
                found_in_store: !!dbProduct,
                product_details: dbProduct ? { name: dbProduct.name, price: dbProduct.price, stock: dbProduct.stock > 0 ? "In Stock" : "Out of Stock" } : null,
                buy_link: "https://swastikmed.online/en/shop-medicines",
                openfda_info: openFdaData
            };
            result.sources.push("Swastik Inventory");
            if (openFdaData) result.sources.push("OpenFDA");
            result.disclaimer = "Informational guidance only. Always follow prescription.";
        }

        else if (name === "check_drug_interaction") {
            const { drugs } = args;
            let interactions = [];
            
            try {
                const fdaRes = await fetch(`https://api.fda.gov/drug/label.json?search=active_ingredient:"${drugs[0]}"&limit=1`);
                if (fdaRes.ok) {
                    const data = await fdaRes.json();
                    if (data.results?.[0]?.drug_interactions) {
                        const interactionsText = data.results[0].drug_interactions[0].toLowerCase();
                        for (let i = 1; i < drugs.length; i++) {
                            const secondDrug = drugs[i].toLowerCase();
                            if (interactionsText.includes(secondDrug)) {
                                const idx = interactionsText.indexOf(secondDrug);
                                const snippet = data.results[0].drug_interactions[0].substring(Math.max(0, idx - 50), idx + 150).replace(/\n/g, ' ');
                                interactions.push({ drugA: drugs[0], drugB: secondDrug, warning: snippet });
                            }
                        }
                    }
                }
            } catch (e) { console.error("FDA interaction error", e); }

            result.data = {
                drugs_checked: drugs,
                interactions_found: interactions.length > 0,
                interactions_details: interactions,
                warning: interactions.length === 0 ? "No specific warnings found in primary label, but severe interactions can still occur." : "Potential interactions found."
            };
            result.sources.push("OpenFDA Interaction API");
            result.disclaimer = "This checker is for informational purposes only. Do not rely on it for medical decisions.";
        }

        else if (name === "find_generic_alternative") {
            const { brand_name } = args;
            let matched = null;
            for (const med of genericMedicines) {
                if (!med.commonBrand) continue;
                const brands = med.commonBrand.split('/').map(b => b.trim().toLowerCase());
                if (brands.some(b => b.includes(brand_name.toLowerCase()) || brand_name.toLowerCase().includes(b))) {
                    matched = med;
                    break;
                }
            }
            if (matched) {
                result.data = {
                    found: true,
                    generic_name: matched.genericName,
                    branded_price: matched.brandedPrice,
                    generic_price: matched.genericPrice,
                    savings: matched.brandedPrice - matched.genericPrice,
                    use_case: matched.useCase,
                    buy_link: "https://swastikmed.online/en/shop-medicines"
                };
                result.sources.push("Swastik Health Generic Database");
                result.disclaimer = "Always consult your doctor before switching medications.";
            } else {
                result.data = { found: false, message: "No generic alternative found in database." };
            }
        }

        else if (name === "search_doctor") {
            const { specialty_or_symptom } = args;
            
            // Basic symptom to specialty mapping if it doesn't look like a specialty
            let specialty = specialty_or_symptom;
            const s = specialty.toLowerCase();
            if (/cold|cough|flu|fever|headache|runny nose|sore throat|body ache|weakness|viral/.test(s)) specialty = "General Physician";
            else if (/heart|chest pain|blood pressure|bp|palpitation/.test(s)) specialty = "Cardiologist";
            else if (/skin|rash|acne|hair|itch/.test(s)) specialty = "Dermatologist";
            else if (/tooth|teeth|gum|dental/.test(s)) specialty = "Dentist";
            else if (/stomach|digestion|acidity|gas|ibs/.test(s)) specialty = "Gastroenterologist";
            else if (/bone|joint|fracture|back pain|knee/.test(s)) specialty = "Orthopedic";
            else if (/eye|vision|sight/.test(s)) specialty = "Ophthalmologist";
            else if (/child|baby|pediatric|kid/.test(s)) specialty = "Pediatrician";
            else if (/anxiety|depression|mental|stress|sleep/.test(s)) specialty = "Psychiatrist";
            else if (/urine|kidney|uti/.test(s)) specialty = "Nephrologist";
            else if (/period|gynec|pregnancy|women|pcod/.test(s)) specialty = "Gynecologist";

            const doctor = await prisma.doctor.findFirst({
                where: { specialization: { contains: specialty, mode: 'insensitive' } },
                include: { user: true }
            });

            if (doctor) {
                const docName = doctor.user?.name || doctor.name || "Doctor";
                result.data = {
                    found: true,
                    recommended_specialty: specialty,
                    doctor_name: `Dr. ${docName}`,
                    specialization: doctor.specialization,
                    fee: doctor.consultationFee,
                    book_link: `https://swastikmed.online/en/doctors/${doctor.id}`
                };
            } else {
                result.data = {
                    found: false,
                    recommended_specialty: specialty,
                    browse_link: `https://swastikmed.online/en/doctors`,
                    message: `No ${specialty} found in database right now. Browse all available doctors.`
                };
            }
            result.sources.push("Swastik Health Network");
            result.disclaimer = "Not a medical diagnosis.";
        }

        else if (name === "search_lab_test") {
            const { test_name } = args;
            if (test_name.toLowerCase().includes("general") || test_name.toLowerCase().includes("all")) {
                result.data = { browse_link: "https://swastikmed.online/en/labs", message: "Multiple tests available." };
            } else {
                const labTest = await prisma.labTest.findFirst({
                    where: { name: { contains: test_name, mode: 'insensitive' } },
                    include: { lab: true }
                });
                if (labTest && labTest.lab) {
                    result.data = {
                        found: true,
                        test_name: labTest.name,
                        lab_name: labTest.lab.name,
                        price: labTest.price,
                        book_link: `https://swastikmed.online/en/labs/${labTest.lab.id}`
                    };
                } else {
                    result.data = { found: false, browse_link: "https://swastikmed.online/en/labs" };
                }
            }
            result.sources.push("Swastik Health Network");
            result.disclaimer = "Results must be interpreted by a professional.";
        }

        else if (name === "get_swastik_info") {
            const { topic } = args;
            result.data = { info: RESPONSES[topic] || RESPONSES.unknown };
            if (!topic.startsWith("register") && !topic.startsWith("faq") && topic !== "general") {
                result.disclaimer = "Informational guidance only.";
            }
        }

        else if (name === "capture_lead") {
            const { phone, notes } = args;
            const newLead = await prisma.lead.create({
                data: {
                    source: "AI_Chatbot",
                    type: "B2C",
                    phone: phone,
                    notes: `Captured via Chatbot. Notes: "${notes || 'No notes'}"`,
                    status: "new",
                    qualityScore: 80,
                    tags: ["CHATBOT_LEAD"]
                }
            });
            
            // Dispatch to viaSocket CRM webhook
            await dispatchToViaSocket("ai_lead_captured", {
                leadId: newLead.id,
                phone: phone,
                notes: notes,
                source: "AI_Chatbot"
            });
            
            result.data = { success: true, message: "Lead captured. Dispatch team alerted." };
        }
    } catch (err) {
        console.error("Tool execution failed:", name, err);
        result.data = { error: "Failed to execute tool" };
    }

    return {
        tool_call_id: toolCall.id,
        role: "tool",
        name: name,
        content: JSON.stringify(result.data),
        _disclaimer: result.disclaimer,
        _sources: result.sources
    };
}

// ─── Main Processor (Orchestrator) ───────────────────────────────────────────
export async function processChatMessage(message, messagesHistory = []) {
    try {
        if (!message || message.trim() === "") return { responseText: "How can I help you?", sources: [] };

        if (!process.env.OPENAI_API_KEY) {
            console.warn('[AI Brain Orchestrator] OPENAI_API_KEY not set — using static fallback.');
            return { responseText: RESPONSES.unknown, sources: [] };
        }

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const systemPrompt = `You are Sofiya, a warm, knowledgeable AI healthcare orchestrator for Swastik Medicare (India).

Swastik Medicare offers: medicine delivery (Gorakhpur & Delhi NCR), doctor consultations, lab tests, ambulance, health insurance, and a pharmacy partner network.

**YOUR OBJECTIVES:**
1. **Understand Intent:** Determine if the user's request requires a Swastik service.
2. **Use Tools:** If they need a medicine, doctor, lab test, generic alternative, interaction check, or standard info (delivery, tracking, ambulance, insurance, FAQs), CALL THE APPROPRIATE TOOL.
3. **DO NOT INVENT DATA:** Never make up prices, stock, doctor names, or delivery ETAs. ONLY use data returned by the tools.
4. **General Healthcare:** For general medical questions (e.g., "What is diabetes?"), answer directly with helpful, concise info. 
5. **General Education:** For pure general knowledge (e.g., "Why is the sky blue?"), answer directly and simply.
6. **Multi-turn:** Remember previous context from the chat history. Ask for missing necessary info (e.g. location for doctors) but don't overwhelm the user.
7. **Language:** ALWAYS reply in the exact language the user wrote in (Hindi, Hinglish, or English). Keep a warm, human, and professional tone.
8. **Emergency:** If an emergency is described, immediately provide emergency advice and call get_swastik_info({ topic: "ambulance_help" }).

**CRITICAL RULES FOR DOCTOR/SYMPTOM QUERIES:**
- If the user mentions ANY symptom (cold, fever, cough, pain, etc.) AND wants a doctor → you MUST call search_doctor with those symptoms. Do NOT call get_swastik_info for this.
- If the user says "find me a doctor", "I need a doctor", "doctor chahiye", or describes feeling unwell → ALWAYS call search_doctor first.
- When search_doctor returns a result: greet the user warmly, mention the symptom they described, tell them the recommended doctor type found, share the booking link. 
- When search_doctor returns no doctor found: still be helpful, explain you recommend a General Physician for their symptoms, and give the browse link.

When you receive tool results, explain them naturally to the user. E.g. "I found Paracetamol in stock for ₹20. You can order it here: [link]."`;

        // Prepare the messages array for OpenAI
        const openAiMessages = [
            { role: 'system', content: systemPrompt }
        ];

        // Format history correctly
        if (messagesHistory && messagesHistory.length > 0) {
            // Filter out system/tool messages if any somehow made it to frontend, though unlikely
            messagesHistory.forEach(msg => {
                if (msg.role === 'user' || msg.role === 'assistant') {
                    openAiMessages.push({ role: msg.role, content: msg.text || msg.content });
                }
            });
        } else {
            openAiMessages.push({ role: 'user', content: message });
        }

        console.log('[AI Brain Orchestrator] Invoking OpenAI with tools...');

        // ── First Call ──
        let completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: openAiMessages,
            tools: tools,
            tool_choice: "auto",
            max_tokens: 500,
            temperature: 0.3,
        });

        let responseMessage = completion.choices[0].message;
        let globalDisclaimer = null;
        let globalSources = new Set();

        // ── If Tool Call ──
        if (responseMessage.tool_calls) {
            openAiMessages.push(responseMessage); // Add assistant's tool calls to history

            for (const toolCall of responseMessage.tool_calls) {
                console.log(`[AI Brain Orchestrator] Tool Call: ${toolCall.function.name}`);
                const toolResponse = await handleToolCall(toolCall);
                
                openAiMessages.push({
                    tool_call_id: toolResponse.tool_call_id,
                    role: toolResponse.role,
                    name: toolResponse.name,
                    content: toolResponse.content
                });

                if (toolResponse._disclaimer) globalDisclaimer = toolResponse._disclaimer;
                if (toolResponse._sources) toolResponse._sources.forEach(s => globalSources.add(s));
            }

            // ── Second Call (to generate final text) ──
            completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: openAiMessages,
                max_tokens: 500,
                temperature: 0.3,
            });
            responseMessage = completion.choices[0].message;
        }

        let aiText = responseMessage.content;
        
        // Safety Fallback if OpenAI failed to return text
        if (!aiText) aiText = "I'm having trouble retrieving that information right now.";

        // General disclaimer for non-tool medical answers
        if (!globalDisclaimer && (message.toLowerCase().includes('what is') || message.toLowerCase().includes('how to treat') || message.toLowerCase().includes('symptom'))) {
            globalDisclaimer = "AI-generated response. For medical decisions, consult a qualified doctor.";
            globalSources.add("Swastik AI (OpenAI)");
        }

        // Soft ask for phone number (Callback Prompt)
        if (openAiMessages.some(m => m.role === 'tool')) {
            aiText += `\n\n📞 **Need instant help?** Type your 10-digit phone number here and our team will call you back!`;
        }

        return {
            responseText: aiText,
            sources: Array.from(globalSources),
            disclaimer: globalDisclaimer
        };

    } catch (error) {
        console.error("AI Brain Orchestrator Error:", error);
        
        // Handle specific OpenAI errors safely
        const errMsg = error?.message || '';
        if (errMsg.includes('401') || errMsg.includes('key')) console.warn('[AI Brain] OpenAI Auth Error');
        else if (errMsg.includes('429')) console.warn('[AI Brain] OpenAI Rate Limit');

        // Fallback to legacy behaviour using old intent detector logic, but simpler:
        return { responseText: "I'm having a little trouble thinking right now, but you can always browse our medicines at https://swastikmed.online/en/shop-medicines or call us directly!", sources: [] };
    }
}

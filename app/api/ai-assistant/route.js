import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ─── Intent Detection Helpers ────────────────────────────────────────────────

function detectIntent(msg) {
    // Registration intents
    if (/register|signup|sign up|join|create.{0,10}account|new.{0,10}account|enroll|onboard/i.test(msg)) {
        if (/retailer|pharmacy|pharma|shop|store|medicine.{0,10}shop|drug.{0,10}store/i.test(msg))  return "register_retailer";
        if (/delivery|transporter|transport|driver|agent|logistics|courier|deliver/i.test(msg))       return "register_delivery";
        if (/doctor|physician|clinic|specialist/i.test(msg))                                          return "register_doctor";
        if (/hospital|nursing.?home|health.?centre/i.test(msg))                                       return "register_hospital";
        if (/lab|diagnostic|pathology|test.?centre/i.test(msg))                                       return "register_lab";
        return "register_customer"; // default
    }

    // Login / account help
    if (/login|sign.?in|forgot.{0,10}password|reset.{0,10}password|can.{0,5}t.{0,10}log/i.test(msg)) return "login_help";

    // Order / tracking
    if (/track|where.{0,10}order|status.{0,10}order|order.{0,10}status/i.test(msg)) return "order_track";

    // Delivery areas / timing
    if (/deliver.{0,10}area|cover.{0,10}area|available.{0,10}area|which.{0,10}city|which.{0,10}area|how.{0,10}long|delivery.{0,10}time/i.test(msg)) return "delivery_info";

    // Pricing / charges
    if (/price|cost|charge|fee|free.{0,10}delivery|minimum.{0,10}order/i.test(msg)) return "pricing_info";

    // Medicine keywords
    const drugMatch = msg.toLowerCase().match(/\b(paracetamol|ibuprofen|aspirin|crocin|metformin|amlodipine|atorvastatin|amoxicillin|azithromycin|pantoprazole|omeprazole|cetirizine|dolo|combiflam|montair|telmisartan)\b/);
    if (drugMatch) return { type: "medicine", drug: drugMatch[0] };

    // Symptom matching for doctors
    const symptoms = msg.toLowerCase();
    if (/headache|fever|cold|cough|flu|pain/i.test(symptoms)) return { type: "symptom", specialty: "General Physician" };
    if (/heart|chest pain|blood pressure/i.test(symptoms)) return { type: "symptom", specialty: "Cardiologist" };
    if (/skin|rash|acne|hair/i.test(symptoms)) return { type: "symptom", specialty: "Dermatologist" };
    if (/tooth|teeth|gum/i.test(symptoms)) return { type: "symptom", specialty: "Dentist" };
    if (/stomach|digestion|acidity/i.test(symptoms)) return { type: "symptom", specialty: "Gastroenterologist" };
    if (/bone|joint|fracture|back pain/i.test(symptoms)) return { type: "symptom", specialty: "Orthopedic" };
    if (/eye|vision|sight/i.test(symptoms)) return { type: "symptom", specialty: "Ophthalmologist" };
    if (/child|baby|pediatric/i.test(symptoms)) return { type: "symptom", specialty: "Pediatrician" };
    if (/doctor|sick|ill/i.test(symptoms) && !/register/i.test(symptoms)) return { type: "symptom", specialty: "General Physician" };

    return "general";
}

// ─── Response Templates ──────────────────────────────────────────────────────

const RESPONSES = {
    register_customer: `👋 **Welcome to Swastik Medicare!**

Creating a customer account is quick and free. Here's how:

**Step 1:** Go to our sign-up page 👉 https://swastikmed.online/en/signup
**Step 2:** Enter your **Name**, **Email**, and **Password**
**Step 3:** Optionally enter a **Referral Code** to earn a welcome bonus
**Step 4:** Click **Register** — that's it!

✅ After registration you can:
- Order medicines with home delivery
- Book doctor appointments
- Upload prescriptions
- Earn rewards through referrals

🔗 **Register Now:** https://swastikmed.online/en/signup

Need help? WhatsApp us at **+91-XXXXXXXXXX** or email **swastikmedicare.help@gmail.com**`,

    register_retailer: `🏪 **Join as a Pharmacy / Retailer Partner!**

Grow your pharmacy business with Swastik Medicare. Here's how to register:

**Step 1:** Go to 👉 https://swastikmed.online/en/retailer/register
**Step 2:** Fill in your shop details:
   - Shop Name
   - Email & Password
   - Phone Number
   - Shop Address
   - Drug License Number
**Step 3:** Accept terms & submit

✅ As a registered pharmacy partner you get:
- 📦 Receive online orders from nearby customers
- 💰 Welcome onboarding bonus in your wallet
- 📊 Inventory management dashboard
- 🚚 Delivery agent network
- 📈 Revenue tracking via CRM

⚠️ Your account will be reviewed and activated within 24 hours.

🔗 **Register as Retailer:** https://swastikmed.online/en/retailer/register`,

    register_delivery: `🚚 **Join as a Delivery Agent / Transporter!**

Earn money by delivering medicines in your area. Here's how to register:

**Step 1:** Go to 👉 https://swastikmed.online/en/agent/register
**Step 2:** Fill in your details:
   - Full Name
   - Email & Phone
   - Password
   - Vehicle Number
   - Driving License Number
**Step 3:** Submit your application

✅ As a Delivery Partner you get:
- 🛵 Flexible working hours
- 💰 Per-delivery earnings
- 📱 Easy-to-use delivery app dashboard
- 📊 Daily earnings tracker

⚠️ Your application will be reviewed within 24-48 hours.

🔗 **Register as Delivery Agent:** https://swastikmed.online/en/agent/register`,

    register_doctor: `👨‍⚕️ **Register as a Doctor on Swastik Medicare!**

Reach more patients in your area. Here's how:

**Step 1:** Go to 👉 https://swastikmed.online/en/doctor/register
**Step 2:** Fill in your professional details (Name, Specialisation, Clinic Address, MCI Number)
**Step 3:** Submit for verification

✅ Benefits:
- Get listed in our Healthcare Directory
- Receive appointment bookings online
- Manage your calendar & prescriptions digitally

🔗 **Register as Doctor:** https://swastikmed.online/en/doctor/register`,

    register_hospital: `🏥 **Register your Hospital / Clinic!**

List your hospital on Swastik Medicare to reach more patients.

🔗 **Register here:** https://swastikmed.online/en/hospital/register

Required details: Hospital Name, Address, Contact Number, Departments & Facilities offered.

Your listing will be live after admin verification (usually within 24 hours).`,

    register_lab: `🔬 **Register your Diagnostic Lab!**

List your lab on Swastik Medicare to attract more test bookings.

🔗 **Register here:** https://swastikmed.online/en/lab/register

Required details: Lab Name, Address, Contact Number, NABL/ICMR Accreditation (if any), Available Tests.`,

    login_help: `🔐 **Login Help**

**To login as a Customer:**
👉 https://swastikmed.online/en/login

**Forgot your password?**
👉 https://swastikmed.online/en/forgot-password
Enter your registered email and we'll send you a reset link.

**For Retailers:**
👉 https://swastikmed.online/en/retailer/login

**For Delivery Agents:**
👉 https://swastikmed.online/en/agent/register (check with admin if already registered)

Still having trouble? Email us at **swastikmedicare.help@gmail.com** or WhatsApp us for instant support.`,

    order_track: `📦 **Track Your Order**

To track your order:
**Option 1:** Go to your profile page 👉 https://swastikmed.online/en/profile

**Option 2:** Use the direct tracking link:
👉 https://swastikmed.online/en/track/[your-order-id]

You can also view all your past orders in your profile dashboard under **"My Orders"**.

If your order is delayed, please WhatsApp us or call our support line.`,

    delivery_info: `🗺️ **Delivery Areas & Timing**

We currently deliver in:
- 📍 **Gorakhpur** — LIVE & Active (10 to 60 minutes)
- 📍 **Delhi NCR** — Available
- 📍 **Noida (Sector 62)** — Available
- 📍 **Indirapuram** — Available
- 📍 **Vaishali** — Available
- 📍 **Greater Noida West** — Available

⏱️ **Delivery Time:** 10 to 60 minutes depending on distance and availability.

📦 Free delivery on orders above **₹500**.

We are expanding rapidly! Contact us to check if we serve your specific area.`,

    pricing_info: `💰 **Pricing & Charges**

- 🆓 **Free Delivery** on orders above ₹500
- 🛵 Small delivery fee on orders below ₹500 (varies by distance)
- 💊 Medicine prices are as per MRP
- 📋 **Subscription Plan:** Save 5% on monthly auto-refill for chronic medicines
- 👨‍⚕️ **Doctor Consultation:** Prices vary by doctor

**Retailer / Partner Listings:**
- Basic Plan: ₹299/month
- Featured Plan: ₹999/month
- One-time Listing Fee: ₹1000

For bulk orders or corporate accounts, contact us directly.`,

    general: `👋 **Hi! I'm Sofiya, your Swastik AI Assistant.**

I can help you with:

🏥 **Registration Help:**
- "How to register as a customer?"
- "How to join as a pharmacy / retailer?"
- "How to become a delivery agent?"
- "Register as a doctor"

💊 **Medicine Information:**
- Ask about any medicine e.g. "Tell me about Paracetamol"

📦 **Order & Delivery:**
- "How to track my order?"
- "Which areas do you deliver to?"
- "What are delivery charges?"

🔐 **Account Help:**
- "I forgot my password"
- "How to login?"

Just type your question and I'll guide you! 😊`
};

// ─── Main Handler ────────────────────────────────────────────────────────────

export async function POST(req) {
    try {
        const { message } = await req.json();

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const intent = detectIntent(message);

        // Handle medicine-specific queries with OpenFDA lookup
        if (intent && typeof intent === "object" && intent.type === "medicine") {
            const drugName = intent.drug;
            let responseText = "";
            let sources = [];

            try {
                const fdaRes = await fetch(`https://api.fda.gov/drug/label.json?search=active_ingredient:"${drugName}"&limit=1`);
                const fdaData = await fdaRes.json();

                if (fdaData.results && fdaData.results.length > 0) {
                    const info = fdaData.results[0];
                    const dosage = info.dosage_and_administration
                        ? info.dosage_and_administration[0].substring(0, 300) + "..."
                        : "Consult label for dosage.";
                    const indications = info.indications_and_usage
                        ? info.indications_and_usage[0].substring(0, 200) + "..."
                        : "Commonly used for pain/fever.";

                    responseText = `💊 **${drugName.charAt(0).toUpperCase() + drugName.slice(1)} Information:**\n\n`;
                    responseText += `*   **Common Use:** ${indications}\n`;
                    responseText += `*   **Typical Guidance:** ${dosage}\n\n`;
                    responseText += `⚠️ **Safety Note:** Always follow the dosage on your prescription. Consult a doctor if symptoms persist beyond 48 hours.\n\n`;
                    responseText += `🛒 Order ${drugName} on Swastik Medicare: https://swastikmed.online/en/shop-medicines`;
                    sources.push("OpenFDA");
                } else {
                    responseText = `I found a reference to **${drugName}**, but detailed FDA labels are not available right now. Generally it is used for symptom relief. Please consult a doctor for specific dosage.\n\n🛒 Search for it: https://swastikmed.online/en/shop-medicines`;
                }
            } catch (err) {
                console.error("OpenFDA fetch failed", err);
                responseText = `I recognise **${drugName}** but I'm having trouble fetching official data right now. Please consult your pharmacist or doctor for dosage guidance.`;
            }

            return NextResponse.json({
                success: true,
                response: responseText,
                disclaimer: "Informational guidance only. Not a medical diagnosis. Consult a doctor before taking any medication.",
                sources
            });
        }

        // Handle symptom queries with Doctor Matchmaking
        if (intent && typeof intent === "object" && intent.type === "symptom") {
            const specialty = intent.specialty;
            
            // Search database for an online booking-enabled doctor
            const doctor = await prisma.doctor.findFirst({
                where: { 
                    specialization: { contains: specialty, mode: 'insensitive' },
                    isDirectory: false
                },
                include: { user: true }
            });

            let responseText = "";
            if (doctor) {
                const docName = doctor.user?.name || doctor.name || "Doctor";
                responseText = `👨‍⚕️ **Doctor Recommendation**\n\n`;
                responseText += `Based on your symptoms, I recommend consulting a **${specialty}**.\n\n`;
                responseText += `I have found **Dr. ${docName}** available for consultation on our platform.\n`;
                responseText += `*   **Specialization:** ${doctor.specialization}\n`;
                responseText += `*   **Consultation Fee:** ₹${doctor.consultationFee}\n\n`;
                responseText += `🔗 **Book Appointment Now:** https://swastikmed.online/en/doctors/${doctor.id}`;
            } else {
                responseText = `👨‍⚕️ **Doctor Recommendation**\n\n`;
                responseText += `Based on your symptoms, I recommend seeing a **${specialty}**. `;
                responseText += `Currently, I couldn't find an available doctor in that exact specialty online.\n\n`;
                responseText += `👉 Please browse our full directory to find a doctor near you: https://swastikmed.online/en/doctors`;
            }

            return NextResponse.json({
                success: true,
                response: responseText,
                disclaimer: "Informational guidance only. Not a medical diagnosis. Consult a doctor for professional medical advice.",
                sources: ["Swastik Health Network"]
            });
        }

        // Handle all other intents using templates
        const intentKey = typeof intent === "string" ? intent : "general";
        const responseText = RESPONSES[intentKey] || RESPONSES.general;

        return NextResponse.json({
            success: true,
            response: responseText,
            disclaimer: intentKey.startsWith("register") || intentKey === "general"
                ? null
                : "Informational guidance only. Not a medical diagnosis.",
            sources: []
        });

    } catch (error) {
        console.error("AI Assistant Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

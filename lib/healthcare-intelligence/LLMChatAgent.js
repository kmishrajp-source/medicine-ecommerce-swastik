import OpenAI from 'openai';

// ─────────────────────────────────────────────────────────────────────────────
// SWASTIK VOICE AI — INTELLIGENT RULE-BASED FALLBACK
// This covers ALL common questions that the Voice AI receives. These responses
// fire instantly when OpenAI is unavailable (quota, rate limit, or no API key).
// Bilingual: Hindi + English for every topic.
// ─────────────────────────────────────────────────────────────────────────────

function detectHindi(q) {
  return /[\u0900-\u097F]/.test(q) ||
    ['kaise', 'kya', 'mujhe', 'kitna', 'kaisa', 'iska', 'kahan', 'kab',
     'chahiye', 'lagta', 'bata', 'buk', 'haspatal', 'dawai', 'swastik ai',
     'referral', 'commission', 'kamai', 'paisa', 'paise'].some(w => q.includes(w));
}

// ─── Knowledge Base ────────────────────────────────────────────────────────
const KB = [
  // ── HOSPITAL BOOKING ────────────────────────────────────────────────────
  {
    keywords: ['hospital', 'haspatal', 'admit', 'opd', 'book hospital', 'buk hospital', 'अस्पताल', 'बुक'],
    intentKeywords: ['how', 'kaise', 'book', 'buk', 'कैसे', 'बुक'],
    en: `🏥 *How to Book a Hospital / Doctor Appointment:*\n\n1️⃣ Tap **"Doctor Consult"** in the top menu\n2️⃣ Choose your specialist (Cardiologist, Neurologist, etc.)\n3️⃣ Pick an available slot → Confirm booking\n\n✅ You'll get a WhatsApp confirmation instantly!\n\n🔗 Go to: /doctors`,
    hi: `🏥 *Hospital / Doctor Appointment कैसे Book करें:*\n\n1️⃣ ऊपर **"Doctor Consult"** पर tap करें\n2️⃣ अपना specialist चुनें (Cardiologist, Neurologist, आदि)\n3️⃣ Available slot चुनें → Booking confirm करें\n\n✅ WhatsApp पर तुरंत confirmation आएगा!\n\n🔗 जाएं: /doctors`
  },

  // ── MEDICINE ORDER / DELIVERY ────────────────────────────────────────────
  {
    keywords: ['medicine', 'dawa', 'dawai', 'दवा', 'दवाई', 'order', 'delivery', 'ऑर्डर', 'डिलीवरी', 'buy medicine'],
    intentKeywords: ['how', 'kaise', 'कैसे', 'order', 'buy', 'kharidna', 'मंगवाना'],
    en: `💊 *How to Order Medicines:*\n\n1️⃣ Search medicine in the top search bar\n2️⃣ Add to cart → Go to Checkout\n3️⃣ Enter address → Choose payment (Online / COD)\n4️⃣ Track delivery in real-time from your Profile\n\n🚚 Delivery in Gorakhpur: Usually within 2-4 hours`,
    hi: `💊 *Medicine Order कैसे करें:*\n\n1️⃣ ऊपर search bar में medicine search करें\n2️⃣ Cart में add करें → Checkout पर जाएं\n3️⃣ Address डालें → Payment method चुनें (Online / Cash)\n4️⃣ Profile में जाकर real-time delivery track करें\n\n🚚 Gorakhpur में delivery: आमतौर पर 2-4 घंटे में`
  },

  // ── PRESCRIPTION UPLOAD ──────────────────────────────────────────────────
  {
    keywords: ['prescription', 'rx', 'पर्ची', 'doctor slip', 'upload prescription'],
    intentKeywords: [],
    en: `📋 *Prescription Upload:*\n\nFor medicines that require a doctor's prescription:\n1️⃣ Add medicines to cart\n2️⃣ At checkout, you'll see an "Upload Prescription" section\n3️⃣ Upload a clear photo or PDF of your prescription\n4️⃣ Our pharmacist will verify before dispatch\n\n📞 Need help? WhatsApp: +91 7992122974`,
    hi: `📋 *Prescription Upload:*\n\nRx medicines के लिए:\n1️⃣ Cart में medicine add करें\n2️⃣ Checkout पर "Prescription Upload" section दिखेगा\n3️⃣ Doctor की पर्ची की clear photo या PDF upload करें\n4️⃣ हमारे pharmacist verify करेंगे\n\n📞 Help चाहिए? WhatsApp: +91 7992122974`
  },

  // ── REFERRAL / COMMISSION ────────────────────────────────────────────────
  {
    keywords: ['referral', 'refer', 'commission', 'kamai', 'earn', 'paisa', 'रेफरल', 'कमीशन', 'कमाई', 'पैसे', 'refer and earn'],
    intentKeywords: [],
    en: `💰 *Referral & Earn Program:*\n\n✅ Share your unique referral code with friends\n✅ When they place their first order, you earn ₹50 in your Swastik Wallet\n✅ No limit — refer unlimited friends!\n\n📍 Find your code: Profile → Your Referral Code\n\n🎉 Your friend also gets a ₹50 welcome bonus on first delivery!`,
    hi: `💰 *Referral & Earn Program:*\n\n✅ अपना unique referral code friends को share करें\n✅ जब वो पहला order करें, आपको ₹50 Swastik Wallet में मिलेंगे\n✅ कोई limit नहीं — जितने चाहें उतने refer करें!\n\n📍 Code देखें: Profile → Your Referral Code\n\n🎉 आपके friend को भी पहले order पर ₹50 welcome bonus मिलेगा!`
  },

  // ── ORDER TRACKING ───────────────────────────────────────────────────────
  {
    keywords: ['track', 'order status', 'where is my order', 'ऑर्डर कहाँ', 'track order', 'delivery status'],
    intentKeywords: [],
    en: `📍 *Track Your Order:*\n\n1️⃣ Go to your **Profile** page\n2️⃣ Click **"My Orders"**\n3️⃣ Tap the **"Track"** button on your order\n4️⃣ See live GPS location of your rider!\n\nOr share your Order ID here and we'll check for you.`,
    hi: `📍 *Order Track करें:*\n\n1️⃣ अपने **Profile** page पर जाएं\n2️⃣ **"My Orders"** पर click करें\n3️⃣ अपने order पर **"Track"** button tap करें\n4️⃣ Rider की live GPS location देखें!\n\nया यहाँ Order ID share करें, हम check करते हैं।`
  },

  // ── LAB TEST ─────────────────────────────────────────────────────────────
  {
    keywords: ['lab', 'test', 'blood test', 'cbc', 'diabetes test', 'खून जांच', 'लैब', 'जांच'],
    intentKeywords: [],
    en: `🧪 *Book a Lab Test:*\n\n1️⃣ Use the **"Lab Tests"** section in the menu\n2️⃣ Search for your test (CBC, Lipid Profile, HbA1c, etc.)\n3️⃣ Choose home collection or visit a partner lab\n4️⃣ Get reports digitally on your profile\n\n✅ Prices up to 60% lower than private labs!`,
    hi: `🧪 *Lab Test Book करें:*\n\n1️⃣ Menu में **"Lab Tests"** section पर जाएं\n2️⃣ अपना test search करें (CBC, Lipid Profile, HbA1c, आदि)\n3️⃣ Home collection या partner lab visit choose करें\n4️⃣ Reports profile पर digitally मिलेंगी\n\n✅ Private labs से 60% तक कम price!`
  },

  // ── AMBULANCE ────────────────────────────────────────────────────────────
  {
    keywords: ['ambulance', 'emergency', '108', 'एम्बुलेंस', 'आपातकाल'],
    intentKeywords: [],
    en: `🚑 *Ambulance / Emergency:*\n\n⚡ **For immediate emergency: Call 108**\n\nFor Swastik Ambulance Service:\n1️⃣ Click **"Ambulance"** in the menu\n2️⃣ Choose type (Basic / ICU / Advanced)\n3️⃣ Enter pickup location → Confirm\n\n📞 WhatsApp Emergency: +91 7992122974`,
    hi: `🚑 *Ambulance / Emergency:*\n\n⚡ **तुरंत emergency के लिए: 108 dial करें**\n\nSwastik Ambulance Service के लिए:\n1️⃣ Menu में **"Ambulance"** पर click करें\n2️⃣ Type चुनें (Basic / ICU / Advanced)\n3️⃣ Pickup location डालें → Confirm करें\n\n📞 WhatsApp Emergency: +91 7992122974`
  },

  // ── GENERIC MEDICINES ────────────────────────────────────────────────────
  {
    keywords: ['generic', 'jan aushadhi', 'pmbjp', 'सस्ती दवा', 'जेनेरिक', 'cheap medicine', 'generic store'],
    intentKeywords: [],
    en: `🌿 *Generic Medicines & Jan Aushadhi:*\n\nGeneric medicines have the same active ingredients as branded ones but cost up to 80% less!\n\n✅ Find PMBJP Jan Aushadhi Kendras near you → Menu: **"Generic Stores"**\n✅ We also deliver generic medicines — search in the medicine shop\n\n💊 Example: Metformin 500mg costs ₹15 (generic) vs ₹180 (branded)`,
    hi: `🌿 *Generic Medicines & Jan Aushadhi:*\n\nGeneric medicines branded medicines जैसी ही होती हैं, लेकिन 80% तक सस्ती!\n\n✅ Nearby PMBJP Jan Aushadhi Kendra खोजें → Menu: **"Generic Stores"**\n✅ हम generic medicines delivery भी करते हैं — medicine shop में search करें\n\n💊 Example: Metformin 500mg — Generic ₹15, Branded ₹180`
  },

  // ── DOCTOR CONSULTATION ──────────────────────────────────────────────────
  {
    keywords: ['doctor', 'consult', 'डॉक्टर', 'consultation', 'video call', 'online doctor'],
    intentKeywords: [],
    en: `👨‍⚕️ *Consult a Doctor Online:*\n\n1️⃣ Go to **"Doctor Consult"** in the menu\n2️⃣ Browse specialists (General Physician, Cardiologist, etc.)\n3️⃣ Book a video or in-person consultation\n4️⃣ Get digital prescription after the call\n\n💡 First-time consultations often start from just ₹99!`,
    hi: `👨‍⚕️ *Online Doctor से Consult करें:*\n\n1️⃣ Menu में **"Doctor Consult"** पर जाएं\n2️⃣ Specialist browse करें (General Physician, Cardiologist, आदि)\n3️⃣ Video या in-person consultation book करें\n4️⃣ Call के बाद digital prescription मिलेगी\n\n💡 First consultation अक्सर सिर्फ ₹99 से शुरू!`
  },

  // ── WALLET / PAYMENT ─────────────────────────────────────────────────────
  {
    keywords: ['wallet', 'balance', 'payment', 'pay', 'razorpay', 'upi', 'वॉलेट', 'पेमेंट', 'पैसे कैसे दें'],
    intentKeywords: [],
    en: `💳 *Payment Methods on Swastik:*\n\n✅ **Online** — UPI, Debit/Credit Card, Netbanking via Razorpay\n✅ **Cash on Delivery (COD)** — Pay cash to the rider\n✅ **Scan & Pay** — PhonePe QR code at checkout\n✅ **Wallet** — Use your Swastik wallet balance\n\nAll online payments are 100% secure.`,
    hi: `💳 *Swastik पर Payment कैसे करें:*\n\n✅ **Online** — UPI, Debit/Credit Card, Netbanking (Razorpay)\n✅ **Cash on Delivery (COD)** — Rider को cash दें\n✅ **Scan & Pay** — Checkout पर PhonePe QR scan करें\n✅ **Wallet** — Swastik wallet balance use करें\n\nसभी online payments 100% secure हैं।`
  },
];

// ─── Intelligent Rule-Based Matcher ──────────────────────────────────────────
function matchKB(query) {
  const q = query.toLowerCase();
  const isHindi = detectHindi(q);

  // Score each KB entry
  let best = null;
  let bestScore = 0;

  for (const entry of KB) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (q.includes(kw)) score += 2;
    }
    for (const kw of (entry.intentKeywords || [])) {
      if (q.includes(kw)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  if (best && bestScore >= 2) {
    return isHindi ? best.hi : best.en;
  }
  return null;
}

// ─── LLMChatAgent ─────────────────────────────────────────────────────────────
export class LLMChatAgent {
  static async handleQuery(query) {
    const isHindi = detectHindi(query.toLowerCase());

    // ── 1. Try rule-based KB first (instant, no API needed) ─────────────────
    const kbAnswer = matchKB(query);
    if (kbAnswer) {
      return { found: true, intent: 'MEDICAL_AI', message: kbAnswer };
    }

    // ── 2. Try OpenAI if API key is present ─────────────────────────────────
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are Swastik AI, a warm and knowledgeable healthcare assistant for Swastik Medicare (India).

**Swastik Medicare Core Services:**
1. Medicine Delivery — same-day delivery in Gorakhpur and nearby cities
2. Lab Tests — home collection or partner labs, 60% cheaper
3. Doctor Consultations — video/in-person with specialists
4. Hospital Booking — OPD appointments, verified hospitals
5. Ambulance — Basic, ICU, Advanced; Call 108 for emergency
6. Generic Medicines / PMBJP Jan Aushadhi Kendras — up to 80% savings
7. Referral Program — earn ₹50 for every friend you refer

**Rules:**
- Answer in the SAME language the user wrote in (Hindi or English)
- If Hindi/Hinglish: reply in clear Hindi with emojis
- Keep responses SHORT (3-5 lines max) — displayed in a chat widget
- Always include an actionable next step or link
- For medical questions: give brief helpful info + "consult a doctor" disclaimer`
            },
            { role: 'user', content: query }
          ],
          max_tokens: 200,
          temperature: 0.4,
        });

        return {
          found: true,
          intent: 'MEDICAL_AI',
          message: completion.choices[0].message.content
        };
      } catch (openaiError) {
        console.warn('[LLMChatAgent] OpenAI call failed:', openaiError.message);
        // Fall through to smart fallback below
      }
    }

    // ── 3. Smart generic fallback (always works, bilingual) ─────────────────
    const genericFallback = isHindi
      ? `🤖 *Swastik AI यहाँ है!*\n\nमैं आपकी इन विषयों में मदद कर सकता हूँ:\n\n💊 Medicine order करना\n🏥 Hospital/Doctor appointment book करना\n🧪 Lab test book करना\n🚑 Ambulance service\n💰 Referral से कमाई\n📍 Order track करना\n\nकृपया अपना सवाल थोड़ा और specific लिखें — जैसे "medicine order kaise kare" या "doctor book kaise kare"।`
      : `🤖 *Hi! I'm Swastik AI.*\n\nI can help you with:\n\n💊 Ordering medicines\n🏥 Booking hospital / doctor appointments\n🧪 Lab tests & home collection\n🚑 Ambulance booking\n💰 Referral rewards\n📍 Tracking your order\n\nPlease ask your question more specifically — e.g. "How to order medicine?" or "How to book a doctor appointment?"`;

    return { found: true, intent: 'MEDICAL_AI', message: genericFallback };
  }
}

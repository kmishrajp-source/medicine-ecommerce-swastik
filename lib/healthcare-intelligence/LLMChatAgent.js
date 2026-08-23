import OpenAI from 'openai';

// ─────────────────────────────────────────────────────────────────────────────
// SWASTIK VOICE AI — INTELLIGENT RULE-BASED FALLBACK
// This covers ALL common questions that the Voice AI receives. These responses
// fire instantly when OpenAI is unavailable (quota, rate limit, or no API key).
// Bilingual: Hindi + English for every topic.
// ─────────────────────────────────────────────────────────────────────────────

function detectHindi(q) {
  return /[\u0900-\u097F]/.test(q) ||
    ['kaise', 'kya', 'mujhe', 'kitna', 'kaisa', 'iska', 'kahan', 'kab', 'bukhar', 'khasi',
     'chahiye', 'lagta', 'bata', 'buk', 'haspatal', 'dawai', 'swastik ai', 'dard', 'pet',
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
    en: `📋 *Prescription Upload & Dosage Help:*\n\nFor medicines that require a doctor's prescription:\n1️⃣ Add medicines to cart\n2️⃣ At checkout, click "Upload Prescription"\n3️⃣ Upload a clear photo or PDF\n4️⃣ Our pharmacist will verify before dispatch\n\n🤔 *Need help understanding doses (e.g., BD, OD, SOS)?* Send a picture to our WhatsApp support!\n📞 WhatsApp: +91 7992122974`,
    hi: `📋 *Prescription Upload & Dosage Help:*\n\nRx medicines के लिए:\n1️⃣ Cart में medicine add करें\n2️⃣ Checkout पर "Prescription Upload" पर click करें\n3️⃣ Doctor की पर्ची की clear photo upload करें\n4️⃣ हमारे pharmacist verify करेंगे\n\n🤔 *क्या आपको दवा खाने का समय (BD, OD, खाली पेट) समझना है?* हमें WhatsApp पर पर्ची भेजें!\n📞 WhatsApp: +91 7992122974`
  },

  // ── REFERRAL / COMMISSION ────────────────────────────────────────────────
  {
    keywords: ['referral', 'refer', 'commission', 'kamai', 'earn', 'paisa', 'रेफरल', 'कमीशन', 'कमाई', 'पैसे', 'refer and earn'],
    intentKeywords: [],
    en: `💰 *Referral & Earn Program:*\n\n✅ Share your unique referral code with friends\n✅ When they place their first order, you earn ₹50 in your Swastik Wallet\n✅ No limit — refer unlimited friends!\n\n📍 Find your code: Profile → Your Referral Code\n\n🎉 Your friend also gets a ₹50 welcome bonus on first delivery!`,
    hi: `💰 *Referral & Earn Program:*\n\n✅ अपना unique referral code friends को share करें\n✅ जब वो पहला order करें, आपको ₹50 Swastik Wallet में मिलेंगे\n✅ कोई limit नहीं — जितने चाहें उतने refer करें!\n\n📍 Code देखें: Profile → Your Referral Code\n\n🎉 आपके friend को भी पहले order पर ₹50 welcome bonus मिलेगा!`
  },

  // ── SYMPTOM CHECKER ──────────────────────────────────────────────────────
  {
    keywords: ['symptom', 'pain', 'fever', 'cough', 'bukhar', 'khasi', 'dard', 'pet dard', 'headache', 'sir dard'],
    intentKeywords: ['checker', 'check', 'kya hai', 'ilaaj', 'remedy', 'bimari', 'disease'],
    en: `✨ *Swastik Symptom Checker:*\n\nI can help provide preliminary information about your symptoms. Please tell me:\n1. What exactly are you feeling? (e.g., fever, stomach pain)\n2. For how long?\n3. Any other symptoms?\n\n⚠️ *Disclaimer: I am an AI. Please book a doctor for a proper diagnosis.* → /doctors`,
    hi: `✨ *Swastik Symptom Checker:*\n\nमैं आपके लक्षणों (symptoms) के आधार पर प्राथमिक जानकारी दे सकती हूँ। कृपया बतायें:\n1. आपको क्या तकलीफ है? (जैसे: बुखार, पेट दर्द)\n2. कितने दिनों से है?\n3. कोई अन्य लक्षण?\n\n⚠️ *चेतावनी: मैं एक AI हूँ। सही इलाज के लिए कृपया डॉक्टर से सलाह लें।* → /doctors`
  },

  // ── MEDICINE SIDE EFFECTS ────────────────────────────────────────────────
  {
    keywords: ['side effect', 'nuksan', 'reaction', 'allergy', 'interaction'],
    intentKeywords: ['medicine', 'dawa', 'tablet'],
    en: `💊 *Medicine Side Effects & Info:*\n\nPlease tell me the **name of the medicine** you want to know about. I can tell you:\n• Common side effects\n• How and when to take it\n• Generic alternatives (to save money!)\n\n⚠️ *Always consult your doctor before stopping or changing any medication.*`,
    hi: `💊 *Medicine Side Effects & Info:*\n\nकृपया मुझे **दवा का नाम** बताएं। मैं आपको बता सकती हूँ:\n• इसके common side effects (नुकसान)\n• इसे कब और कैसे लेना है (खाली पेट या खाने के बाद)\n• इसके जेनेरिक विकल्प (पैसे बचाने के लिए!)\n\n⚠️ *कोई भी दवा बदलने या बंद करने से पहले डॉक्टर से जरूर पूछें।*`
  },

  // ── LAB REPORTS ──────────────────────────────────────────────────────────
  {
    keywords: ['lab report', 'report', 'test result', 'blood report', 'cbc', 'lipid', 'explain', 'samjhao'],
    intentKeywords: [],
    en: `📄 *Lab Report Explainer:*\n\nIf you have a lab report (like CBC, Thyroid, or Lipid profile), you can type the values here (e.g., "Hemoglobin 10.5"). I can help explain what it means in simple words.\n\n🧪 Want to book a new test? Go to: /labs`,
    hi: `📄 *Lab Report Explainer:*\n\nअगर आपके पास कोई लैब रिपोर्ट (जैसे CBC, Thyroid, Lipid) है, तो आप उसकी value यहाँ लिख सकते हैं (जैसे: "Hemoglobin 10.5"). मैं इसे आसान भाषा में समझाने में मदद करूँगी।\n\n🧪 नया टेस्ट बुक करना है? यहाँ जाएँ: /labs`
  },

  // ── ORDER TRACKING ───────────────────────────────────────────────────────
  {
    keywords: ['track', 'order status', 'where is my order', 'ऑर्डर कहाँ', 'track order', 'delivery status'],
    intentKeywords: [],
    en: `📍 *Track Your Order:*\n\n1️⃣ Go to your **Profile** page\n2️⃣ Click **"My Orders"**\n3️⃣ Tap the **"Track"** button on your order\n4️⃣ See live GPS location of your rider!\n\nOr share your Order ID here and we'll check for you.`,
    hi: `📍 *Order Track करें:*\n\n1️⃣ अपने **Profile** page पर जाएं\n2️⃣ **"My Orders"** पर click करें\n3️⃣ अपने order पर **"Track"** button tap करें\n4️⃣ Rider की live GPS location देखें!\n\nया यहाँ Order ID share करें, हम check करते हैं।`
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

    // ── 1. Try rule-based KB first for generic "how to" questions ─────────────────
    // We only want the KB to intercept if the user asks broad how-to questions.
    // If they ask specific medical questions ("what is paracetamol", "i have fever"), we want the LLM to handle it.
    const isBroadHowTo = ['how', 'kaise', 'book', 'order', 'track', 'referral', 'commission', 'earn'].some(w => query.toLowerCase().includes(w));
    
    if (isBroadHowTo) {
        const kbAnswer = matchKB(query);
        if (kbAnswer) {
          return { found: true, intent: 'MEDICAL_AI', message: kbAnswer };
        }
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
              content: `You are Sofiya, a warm, highly knowledgeable, and professional healthcare AI assistant for Swastik Medicare (India).

**Your Core Roles:**
1. **Symptom Checker**: If a user describes symptoms (e.g., fever, pain), provide preliminary advice, possible common causes, and home care tips. ⚠️ *CRITICAL: Always append a bold disclaimer recommending they consult a doctor.*
2. **Medicine Advisor**: If asked about a medicine, explain its uses, common side effects, and how to take it (e.g., "khali pet", "khane ke baad"). Suggest generic alternatives to save money.
3. **Lab Report Explainer**: If a user shares lab values (e.g., HbA1c 7.5), explain what it means simply without medical jargon.
4. **Prescription Helper**: Help patients understand doctor dosages (BD = twice a day, OD = once a day, SOS = as needed) in simple terms.
5. **Swastik Guide**: Explain how to order medicines, book doctors, book lab tests, track delivery, or earn referral commissions.

**Rules for Response:**
- Answer in the EXACT SAME language the user wrote in (Hindi, Hinglish, or English).
- If Hindi/Hinglish: reply in clear, friendly Hindi (written in Devnagari or Romanized based on user input) with emojis.
- Keep responses CONCISE but INFORMATIVE (3-6 lines). Use bullet points. Use markdown (bolding) for important medicine names or warnings.
- Always include an actionable next step or link (e.g., "Book a doctor here: /doctors").`
            },
            { role: 'user', content: query }
          ],
          max_tokens: 300, // Increased to allow for slightly longer medical explanations
          temperature: 0.3, // Lower temperature for more factual medical responses
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
    // If the LLM fails and it wasn't caught by the broad KB rule, we check KB again.
    const fallbackKb = matchKB(query);
    if (fallbackKb) {
        return { found: true, intent: 'MEDICAL_AI', message: fallbackKb };
    }

    const genericFallback = isHindi
      ? `🤖 *Swastik AI यहाँ है!*\n\nमैं आपकी इन विषयों में मदद कर सकती हूँ:\n\n✨ Symptom Checker (लक्षण जांचें)\n💊 दवाओं के नुकसान (Side Effects) व जानकारी\n📄 लैब रिपोर्ट समझना\n📋 डॉक्टर की पर्ची (Dosage) समझना\n🏥 Hospital/Doctor appointment book करना\n\nकृपया अपना सवाल पूछें।`
      : `🤖 *Hi! I'm Sofiya, Swastik AI.*\n\nI can help you with:\n\n✨ Checking Symptoms\n💊 Medicine Side Effects & Doses\n📄 Explaining Lab Reports\n📋 Understanding Doctor Prescriptions\n🏥 Booking Doctors & Hospitals\n\nPlease ask your medical question!`;

    return { found: true, intent: 'MEDICAL_AI', message: genericFallback };
  }
}

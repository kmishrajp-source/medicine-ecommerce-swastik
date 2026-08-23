import prisma from '@/lib/prisma';

// ─── Static hospital knowledge base for when DB is empty ──────────────────────
const HOSPITAL_BOOKING_GUIDE = {
  en: {
    howToBook: "To book a hospital appointment on Swastik Medicare:\n1. Click **Doctor Consult** in the top menu\n2. Select your specialist (Cardiologist, Neurologist, etc.)\n3. Choose a time slot and confirm booking\n4. You'll get a WhatsApp confirmation instantly.",
    link: "/doctors",
    linkLabel: "Book Doctor / Hospital →"
  },
  hi: {
    howToBook: "Swastik Medicare पर hospital appointment book करने के लिए:\n1. ऊपर menu में **Doctor Consult** पर click करें\n2. अपना specialist चुनें (Cardiologist, Neurologist, etc.)\n3. Time slot चुनें और booking confirm करें\n4. आपको WhatsApp पर तुरंत confirmation मिलेगी।",
    link: "/doctors",
    linkLabel: "Doctor / Hospital Book करें →"
  }
};

// ─── Detect if query is in Hindi/Hinglish ─────────────────────────────────────
function detectHindi(q) {
  // Devanagari unicode range or common Hinglish patterns
  return /[\u0900-\u097F]/.test(q) ||
    q.includes('kaise') || q.includes('kya') || q.includes('mujhe') ||
    q.includes('haspatal') || q.includes('buk') || q.includes('kitna') ||
    q.includes('kaisa') || q.includes('aapke') || q.includes('swasthya');
}

export class HospitalAgent {
  static async handleQuery(query, userId) {
    const lowerQuery = query.toLowerCase();
    const isHindi = detectHindi(lowerQuery);

    // ── Detect "how to book" intent ──────────────────────────────────────────
    const isBookingQuery =
      lowerQuery.includes('book') || lowerQuery.includes('buk') ||
      lowerQuery.includes('appoint') || lowerQuery.includes('appointment') ||
      lowerQuery.includes('how') || lowerQuery.includes('kaise') ||
      lowerQuery.includes('कैसे') || lowerQuery.includes('बुक') ||
      lowerQuery.includes('अपॉइंटमेंट');

    // ── Detect specialty from query ───────────────────────────────────────────
    let matchedDepartment = null;
    if (lowerQuery.includes('cardiology') || lowerQuery.includes('heart') || lowerQuery.includes('dil')) matchedDepartment = 'Cardiology';
    if (lowerQuery.includes('emergency') || lowerQuery.includes('casualty') || lowerQuery.includes('aapat')) matchedDepartment = 'Emergency';
    if (lowerQuery.includes('pediatric') || lowerQuery.includes('child') || lowerQuery.includes('bachcha')) matchedDepartment = 'Pediatrics';
    if (lowerQuery.includes('orthop') || lowerQuery.includes('bone') || lowerQuery.includes('haddi')) matchedDepartment = 'Orthopedics';
    if (lowerQuery.includes('neuro') || lowerQuery.includes('brain') || lowerQuery.includes('dimag')) matchedDepartment = 'Neurology';
    if (lowerQuery.includes('gynec') || lowerQuery.includes('maternity') || lowerQuery.includes('mahila')) matchedDepartment = 'Gynecology';
    if (lowerQuery.includes('eye') || lowerQuery.includes('ophthal') || lowerQuery.includes('aankh')) matchedDepartment = 'Ophthalmology';

    // ── Try DB first ──────────────────────────────────────────────────────────
    let hospitals = [];
    try {
      const whereClause = matchedDepartment ? {
        hospitalServices: { some: { department: { contains: matchedDepartment, mode: 'insensitive' } } }
      } : {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { specialties: { contains: query, mode: 'insensitive' } }
        ]
      };

      hospitals = await prisma.hospital.findMany({
        where: whereClause,
        take: 3,
        include: {
          hospitalServices: true,
          insuranceNetworks: { include: { company: true } }
        },
        orderBy: { rating: 'desc' }
      });
    } catch (dbErr) {
      console.warn('[HospitalAgent] DB query failed:', dbErr.message);
    }

    // ── If we have DB results, return them ────────────────────────────────────
    if (hospitals && hospitals.length > 0) {
      return {
        found: true,
        hospitals: hospitals.map(h => ({
          id: h.id,
          name: h.name,
          address: h.address,
          rating: h.rating,
          verified: h.verified,
          services: h.hospitalServices.map(s => s.department),
          acceptedInsurances: h.insuranceNetworks.map(n => n.company.name),
          contact: h.phone
        }))
      };
    }

    // ── Smart fallback: booking guide + how-to ───────────────────────────────
    const guide = isHindi ? HOSPITAL_BOOKING_GUIDE.hi : HOSPITAL_BOOKING_GUIDE.en;

    if (isBookingQuery) {
      return {
        found: true,
        intent: 'HOSPITAL_BOOKING_GUIDE',
        message: isHindi
          ? `🏥 *Hospital Appointment कैसे Book करें?*\n\nSwastik Medicare पर आप 3 आसान steps में hospital appointment book कर सकते हैं:\n\n1️⃣ ऊपर **"Doctor Consult"** menu पर click करें\n2️⃣ अपना specialist या department चुनें (Cardiology, Neurology, Orthopedics, आदि)\n3️⃣ Available time slot चुनें → Booking confirm करें ✅\n\nBooking confirm होने पर आपको WhatsApp पर तुरंत message मिलेगा।`
          : `🏥 *How to Book a Hospital Appointment?*\n\nYou can book in 3 easy steps on Swastik Medicare:\n\n1️⃣ Click **"Doctor Consult"** in the top navigation menu\n2️⃣ Choose your specialist or department (Cardiology, Neurology, etc.)\n3️⃣ Select an available time slot → Confirm booking ✅\n\nYou'll receive a WhatsApp confirmation instantly after booking.`,
        actions: [
          { label: isHindi ? '👨‍⚕️ Doctor Book करें' : '👨‍⚕️ Book a Doctor', link: '/doctors' },
          { label: isHindi ? '🏥 Hospitals देखें' : '🏥 View Hospitals', link: '/hospitals' },
          { label: isHindi ? '📞 Support से बात करें' : '📞 Chat with Support', link: 'https://wa.me/917992122974' },
        ]
      };
    }

    // ── General hospital info response ────────────────────────────────────────
    return {
      found: true,
      intent: 'HOSPITAL_INFO',
      message: isHindi
        ? `🏥 *Swastik Medicare Hospital Network*\n\nहम Gorakhpur और nearby cities में verified hospitals के साथ tie-up में हैं।\n\n• **OPD Appointments** — Doctor Consult menu से book करें\n• **Emergency** — 108 call करें या WhatsApp करें\n• **Insurance Cashless** — हमारे partner hospitals में available\n\nKिसी specific hospital या department के बारे में जानना है?`
        : `🏥 *Swastik Medicare Hospital Network*\n\nWe partner with verified hospitals in Gorakhpur and nearby cities.\n\n• **OPD Appointments** — Book via Doctor Consult menu\n• **Emergency Services** — Call 108 or WhatsApp us\n• **Cashless Insurance** — Available at partner hospitals\n\nLooking for a specific hospital or department?`,
      actions: [
        { label: isHindi ? '👨‍⚕️ Doctor Book करें' : '👨‍⚕️ Book a Doctor', link: '/doctors' },
        { label: isHindi ? '🏥 Hospitals देखें' : '🏥 View Hospitals', link: '/hospitals' },
        { label: isHindi ? '🚑 Ambulance चाहिए' : '🚑 Need Ambulance', link: '/ambulance' },
      ]
    };
  }
}

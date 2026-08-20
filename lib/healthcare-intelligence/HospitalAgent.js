import prisma from '@/lib/prisma';

// Symptom → specialist mapping for smart AI suggestions
const SYMPTOM_MAP = [
  { symptoms: ['itch', 'itching', 'rash', 'skin', 'allergy', 'hives', 'eczema', 'खुजली', 'चकत्ते'], specialist: 'Dermatologist', dept: 'Dermatology', icon: '🩺' },
  { symptoms: ['pain', 'ache', 'hurt', 'swelling', 'joint', 'bone', 'back', 'दर्द', 'सूजन'], specialist: 'Orthopedic Specialist', dept: 'Orthopedics', icon: '🦴' },
  { symptoms: ['chest', 'heart', 'palpitation', 'breath', 'cardiac', 'सीना', 'दिल'], specialist: 'Cardiologist', dept: 'Cardiology', icon: '❤️' },
  { symptoms: ['fever', 'cold', 'cough', 'flu', 'throat', 'viral', 'infection', 'बुखार', 'खांसी', 'सर्दी'], specialist: 'General Physician', dept: 'General Medicine', icon: '🌡️' },
  { symptoms: ['stomach', 'gastric', 'acidity', 'vomit', 'nausea', 'diarrhea', 'constipation', 'पेट', 'उल्टी', 'दस्त'], specialist: 'Gastroenterologist', dept: 'Gastroenterology', icon: '🫁' },
  { symptoms: ['eye', 'vision', 'blur', 'आंख', 'नज़र'], specialist: 'Ophthalmologist', dept: 'Ophthalmology', icon: '👁️' },
  { symptoms: ['ear', 'nose', 'throat', 'ent', 'कान', 'नाक', 'गला'], specialist: 'ENT Specialist', dept: 'ENT', icon: '👂' },
  { symptoms: ['head', 'migraine', 'dizzy', 'nerve', 'neuro', 'सिर', 'माइग्रेन'], specialist: 'Neurologist', dept: 'Neurology', icon: '🧠' },
  { symptoms: ['child', 'baby', 'infant', 'kid', 'बच्चा', 'शिशु'], specialist: 'Pediatrician', dept: 'Pediatrics', icon: '👶' },
  { symptoms: ['urine', 'kidney', 'diabetes', 'sugar', 'thyroid', 'hormone', 'मधुमेह', 'शुगर', 'किडनी'], specialist: 'Endocrinologist / Nephrologist', dept: 'Endocrinology', icon: '💉' },
  { symptoms: ['mental', 'anxiety', 'depression', 'stress', 'sleep', 'तनाव', 'मानसिक'], specialist: 'Psychiatrist', dept: 'Psychiatry', icon: '🧘' },
  { symptoms: ['gynec', 'period', 'pregnancy', 'woman', 'menstrual', 'महिला', 'गर्भ', 'पीरियड'], specialist: 'Gynecologist', dept: 'Gynecology', icon: '🌸' },
];

// Static curated hospitals — shown as fallback when DB is empty
const STATIC_GORAKHPUR_HOSPITALS = [
  {
    name: "AIIMS Gorakhpur",
    address: "Kunaaghat, Gorakhpur, UP 273008",
    phone: "0551-2207700",
    specialties: "Multi-specialty, Cardiology, Neurology, Oncology, Pediatrics",
    rating: 4.8,
    verified: true,
    openingHours: "24/7",
  },
  {
    name: "BRD Medical College & Hospital",
    address: "Medical Road, Gorakhpur, UP 273013",
    phone: "0551-2501736",
    specialties: "General Medicine, Surgery, Orthopedics, Gynecology",
    rating: 4.2,
    verified: true,
    openingHours: "24/7",
  },
  {
    name: "Regency Hospital Gorakhpur",
    address: "Near Medical College Road, Moglaha, Gorakhpur",
    phone: "+91-9228052805",
    specialties: "Critical Care, Nephrology, Urology, Gastroenterology, Dermatology",
    rating: 4.6,
    verified: true,
    openingHours: "24/7",
  },
  {
    name: "Rana Hospital",
    address: "7, Park Road, Gorakhpur",
    phone: "0551-2201234",
    specialties: "Neurology, Neurosurgery, Orthopedics",
    rating: 4.7,
    verified: true,
    openingHours: "9 AM – 9 PM",
  },
  {
    name: "Synergy Super Specialty Hospital",
    address: "Near Rail Museum, Gorakhpur",
    phone: "0551-2205566",
    specialties: "Oncology, Cancer Care, Bone Marrow Transplant",
    rating: 4.5,
    verified: true,
    openingHours: "24/7",
  },
];

function detectSymptomSpecialist(query) {
  const q = query.toLowerCase();
  for (const entry of SYMPTOM_MAP) {
    if (entry.symptoms.some(s => q.includes(s))) {
      return entry;
    }
  }
  return null;
}

export class HospitalAgent {
  static async handleQuery(query, userId) {
    const q = query.toLowerCase();
    
    // Detect symptom-based specialist first
    const symptomMatch = detectSymptomSpecialist(query);
    
    // Build DB where clause
    let whereClause = {};
    if (symptomMatch) {
      whereClause = {
        OR: [
          { specialties: { contains: symptomMatch.dept, mode: 'insensitive' } },
          { specialties: { contains: symptomMatch.specialist, mode: 'insensitive' } },
        ]
      };
    } else if (q.includes("cardiology") || q.includes("heart")) {
      whereClause = { specialties: { contains: "Cardiology", mode: 'insensitive' } };
    } else if (q.includes("emergency") || q.includes("casualty")) {
      whereClause = { specialties: { contains: "Emergency", mode: 'insensitive' } };
    } else if (q.includes("pediatric") || q.includes("child")) {
      whereClause = { specialties: { contains: "Pediatrics", mode: 'insensitive' } };
    } else {
      whereClause = {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { specialties: { contains: query, mode: 'insensitive' } },
        ]
      };
    }

    let hospitals = [];
    try {
      hospitals = await prisma.hospital.findMany({
        where: whereClause,
        take: 3,
        orderBy: { rating: 'desc' }
      });

      // If still empty, try without filter (return all hospitals)
      if (hospitals.length === 0) {
        hospitals = await prisma.hospital.findMany({
          take: 3,
          orderBy: { rating: 'desc' }
        });
      }
    } catch (err) {
      console.error('HospitalAgent DB error:', err);
    }

    // If DB has records, return them
    if (hospitals && hospitals.length > 0) {
      return {
        found: true,
        symptomMatch: symptomMatch || null,
        hospitals: hospitals.map(h => ({
          id: h.id,
          name: h.name,
          address: h.address,
          rating: h.rating,
          verified: h.verified,
          specialties: h.specialties,
          contact: h.phone,
          openingHours: h.openingHours,
        }))
      };
    }

    // ── FALLBACK: DB is empty → use static curated list ──────────────
    // Filter static hospitals by symptom if possible
    let staticResults = STATIC_GORAKHPUR_HOSPITALS;
    if (symptomMatch) {
      const filtered = STATIC_GORAKHPUR_HOSPITALS.filter(h =>
        h.specialties.toLowerCase().includes(symptomMatch.dept.toLowerCase()) ||
        h.specialties.toLowerCase().includes(symptomMatch.specialist.toLowerCase().split('/')[0].trim())
      );
      if (filtered.length > 0) staticResults = filtered;
    }

    return {
      found: true,
      isStaticFallback: true,
      symptomMatch: symptomMatch || null,
      message: symptomMatch
        ? `Based on your symptoms, I recommend seeing a ${symptomMatch.icon} **${symptomMatch.specialist}**. Here are top hospitals in Gorakhpur:`
        : "Here are the top hospitals in Gorakhpur network:",
      hospitals: staticResults.map(h => ({
        name: h.name,
        address: h.address,
        rating: h.rating,
        verified: h.verified,
        specialties: h.specialties,
        contact: h.phone,
        openingHours: h.openingHours,
      }))
    };
  }
}

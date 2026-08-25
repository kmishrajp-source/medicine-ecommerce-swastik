/**
 * Medical Intent Mapping Utility
 * Bridges the gap between layman search terms and professional medical specialties.
 */

const INTENT_MAP = {
    "lungs": ["Pulmonologist", "Chest Specialist", "General Physician", "Pulmonology", "Respiratory Medicine"],
    "breathing": ["Pulmonologist", "Chest Specialist", "Pulmonology", "Respiratory Medicine"],
    "asthma": ["Pulmonologist", "Pulmonology", "Respiratory Medicine"],
    "cough": ["Pulmonologist", "ENT Specialist", "General Physician"],
    "chest": ["Cardiologist", "Pulmonologist", "Chest Specialist"],
    "heart": ["Cardiologist", "Cardiology"],
    "blood pressure": ["Cardiologist", "General Physician"],
    "bp": ["Cardiologist", "General Physician"],
    "skin": ["Dermatologist", "Dermatology"],
    "pimple": ["Dermatologist"],
    "rash": ["Dermatologist", "General Physician"],
    "hair": ["Dermatologist"],
    "stomach": ["Gastroenterologist", "Gastro", "Gastroenterology"],
    "digestion": ["Gastroenterologist", "General Physician", "Gastroenterology"],
    "gas": ["Gastroenterologist", "General Physician"],
    "acidity": ["Gastroenterologist"],
    "bones": ["Orthopaedic", "Orthopedics", "Orthopedic"],
    "fracture": ["Orthopaedic", "Orthopedics", "Orthopedic"],
    "joint": ["Orthopaedic", "Rheumatologist", "Orthopedics"],
    "pain": ["Orthopaedic", "General Physician", "Neurologist"],
    "brain": ["Neurologist", "Neurology", "Neurosurgery"],
    "nerves": ["Neurologist", "Neurology"],
    "headache": ["Neurologist", "General Physician"],
    "kids": ["Paediatrician", "Pediatrics"],
    "child": ["Paediatrician", "Pediatrics"],
    "baby": ["Paediatrician", "Pediatrics"],
    "women": ["Gynaecologist", "Obstetrics", "Gynecology"],
    "pregnancy": ["Gynaecologist", "Obstetrics", "Gynecology"],
    "delivery": ["Gynaecologist", "Obstetrics", "Gynecology"],
    "period": ["Gynaecologist", "Gynecology"],
    "ear": ["ENT Specialist", "ENT"],
    "nose": ["ENT Specialist", "ENT"],
    "throat": ["ENT Specialist", "ENT"],
    "teeth": ["Dentist", "Dental", "Dentistry"],
    "tooth": ["Dentist", "Dental", "Dentistry"],
    "gum": ["Dentist", "Dental", "Dentistry"],
    "eye": ["Ophthalmologist", "Eye Specialist", "Ophthalmology"],
    "vision": ["Ophthalmologist", "Ophthalmology"],
    "urine": ["Urologist", "Urology"],
    "kidney": ["Nephrologist", "Urologist", "Nephrology"],
    "sugar": ["Diabetologist", "Endocrinologist", "General Physician", "Diabetology", "Endocrinology", "Diabetes Specialist"],
    "diabetes": ["Diabetologist", "Endocrinologist", "Diabetology", "Endocrinology", "Diabetes Specialist"],
    "thyroid": ["Endocrinologist", "Endocrinology"],
    "fever": ["General Physician", "Internal Medicine"],
    "cold": ["General Physician", "ENT Specialist"],
    "cancer": ["Oncologist", "Oncology"],
    "tumor": ["Oncologist", "Oncology"],
    "mental": ["Psychiatrist", "Psychiatry", "Clinical Psychology", "Psychologist"],
    "stress": ["Psychiatrist", "Psychiatry", "Clinical Psychology"],
    "emergency": ["Emergency Medicine", "Emergency", "Emergency Doctor", "Critical Care"],
    "urgent": ["Emergency Medicine", "Emergency Doctor", "General Physician"],
    "liver": ["Hepatologist", "Hepatology", "Gastroenterologist"]
};

/**
 * Normalizes a query and returns associated medical specialties
 * @param {string} query 
 * @returns {string[]}
 */
export const getSpecialtiesFromQuery = (query) => {
    if (!query) return [];
    
    const normalizedQuery = query.toLowerCase().trim();
    const results = new Set();
    
    // Check for direct matches or partial matches in the map
    Object.keys(INTENT_MAP).forEach(keyword => {
        // Only allow partial matching of keywords if the user has typed at least 3 characters
        const isPartialMatch = normalizedQuery.length >= 3 && keyword.includes(normalizedQuery);
        if (normalizedQuery.includes(keyword) || isPartialMatch) {
            INTENT_MAP[keyword].forEach(specialty => results.add(specialty));
        }
    });

    return Array.from(results);
};

export default INTENT_MAP;

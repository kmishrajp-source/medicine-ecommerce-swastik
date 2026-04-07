/**
 * Medical Intent Mapping Utility
 * Bridges the gap between layman search terms and professional medical specialties.
 */

const INTENT_MAP = {
    "lungs": ["Pulmonologist", "Chest Specialist", "General Physician", "Pulmonology"],
    "breathing": ["Pulmonologist", "Chest Specialist", "Pulmonology"],
    "asthma": ["Pulmonologist", "Pulmonology"],
    "cough": ["Pulmonologist", "ENT Specialist", "General Physician"],
    "chest": ["Cardiologist", "Pulmonologist", "Chest Specialist"],
    "heart": ["Cardiologist", "Cardiology"],
    "blood pressure": ["Cardiologist", "General Physician"],
    "bp": ["Cardiologist", "General Physician"],
    "skin": ["Dermatologist", "Dermatology"],
    "pimple": ["Dermatologist"],
    "rash": ["Dermatologist", "General Physician"],
    "hair": ["Dermatologist"],
    "stomach": ["Gastroenterologist", "Gastro"],
    "digestion": ["Gastroenterologist", "General Physician"],
    "gas": ["Gastroenterologist", "General Physician"],
    "acidity": ["Gastroenterologist"],
    "bones": ["Orthopaedic", "Orthopedics"],
    "fracture": ["Orthopaedic"],
    "joint": ["Orthopaedic", "Rheumatologist"],
    "pain": ["Orthopaedic", "General Physician", "Neurologist"],
    "brain": ["Neurologist", "Neurology"],
    "nerves": ["Neurologist", "Neurology"],
    "headache": ["Neurologist", "General Physician"],
    "kids": ["Paediatrician", "Pediatrics"],
    "child": ["Paediatrician", "Pediatrics"],
    "baby": ["Paediatrician", "Pediatrics"],
    "women": ["Gynaecologist", "Obstetrics"],
    "pregnancy": ["Gynaecologist", "Obstetrics"],
    "delivery": ["Gynaecologist", "Obstetrics"],
    "period": ["Gynaecologist"],
    "ear": ["ENT Specialist", "ENT"],
    "nose": ["ENT Specialist", "ENT"],
    "throat": ["ENT Specialist", "ENT"],
    "teeth": ["Dentist", "Dental"],
    "tooth": ["Dentist", "Dental"],
    "gum": ["Dentist", "Dental"],
    "eye": ["Ophthalmologist", "Eye Specialist"],
    "vision": ["Ophthalmologist"],
    "urine": ["Urologist", "Urology"],
    "kidney": ["Nephrologist", "Urologist"],
    "sugar": ["Diabetologist", "Endocrinologist", "General Physician"],
    "diabetes": ["Diabetologist", "Endocrinologist"],
    "thyroid": ["Endocrinologist"],
    "fever": ["General Physician", "Internal Medicine"],
    "cold": ["General Physician", "ENT Specialist"]
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
        if (normalizedQuery.includes(keyword) || keyword.includes(normalizedQuery)) {
            INTENT_MAP[keyword].forEach(specialty => results.add(specialty));
        }
    });

    return Array.from(results);
};

export default INTENT_MAP;

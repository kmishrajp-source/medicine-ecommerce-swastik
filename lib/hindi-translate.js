// lib/hindi-translate.js
// Free Hindi/Hinglish to English Translation Dictionary

const HINDI_TO_ENGLISH = {
    "bukhar": "fever", "bukhaar": "fever",
    "sar dard": "headache", "sir dard": "headache", "sardard": "headache",
    "dard": "pain", "khasi": "cough", "khansi": "cough",
    "zukam": "cold", "nazla": "cold",
    "pet dard": "stomach pain", "pet mein dard": "stomach pain",
    "gas banna": "gas", "gas": "gas", "jalan": "heartburn",
    "ulti": "vomiting", "ultee": "vomiting", "matli": "nausea",
    "dast": "diarrhea", "loose motion": "diarrhea", "kabz": "constipation",
    "khujli": "itching", "daad": "fungal infection",
    "munh ka ghav": "mouth ulcer", "munh mein chale": "mouth ulcer",
    "gala dard": "sore throat", "gale mein dard": "sore throat",
    "chakkar": "dizziness", "thakaan": "fatigue", "kamzori": "weakness",
    "bp high": "high blood pressure", "sugar": "diabetes",
    "madhumeh": "diabetes", "thyroid": "thyroid",
    "crocin": "paracetamol", "dolo": "paracetamol", "disprin": "aspirin",
    "combiflam": "ibuprofen", "brufen": "ibuprofen",
    "pan tablet": "pantoprazole", "omez": "omeprazole",
    "glycomet": "metformin", "zoryl": "glimepiride",
    "telma": "telmisartan", "stamlo": "amlodipine",
    "thyronorm": "levothyroxine", "cetzine": "cetirizine",
    "montair": "montelukast", "augmentin": "amoxicillin",
    "azee": "azithromycin", "ciplox": "ciprofloxacin",
    "volini": "diclofenac", "voveran": "diclofenac",
    "dawa chahiye": "i need medicine", "dawa do": "i need medicine",
    "kitne ka hai": "what is the price of", "keemat": "price",
    "stock hai": "is it in stock", "uplabdh hai": "is it available",
    "doctor chahiye": "i need a doctor", "doctor dikhana hai": "i need a doctor",
    "test karwana hai": "i need a lab test",
    "dawai ki yaad dilao": "set refill reminder",
    "remind karo": "yes set refill", "reminder chahiye": "yes set refill",
    "generic dawa": "generic alternative", "sasta alternative": "cheaper generic alternative",
    "account banana hai": "register customer", "register karna hai": "register customer",
    "refund chahiye": "refund", "order kahan hai": "track order",
};

export function isHindiMessage(text) {
    if (/[\u0900-\u097F]/.test(text)) return true;
    const lowerText = text.toLowerCase();
    return Object.keys(HINDI_TO_ENGLISH).some(word => lowerText.includes(word));
}

export function translateToEnglish(text) {
    let translated = text.toLowerCase();
    let wasHindi = false;
    for (const [hindi, english] of Object.entries(HINDI_TO_ENGLISH)) {
        if (translated.includes(hindi)) {
            translated = translated.replace(new RegExp(hindi.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), english);
            wasHindi = true;
        }
    }
    return { translated, wasHindi };
}

export function addHindiPrefix(responseText, wasHindi) {
    if (!wasHindi) return responseText;
    return `🇮🇳 _(Aapka sandesh samjha gaya! Hindi mein help ke liye hum yahan hain.)_\n\n${responseText}`;
}

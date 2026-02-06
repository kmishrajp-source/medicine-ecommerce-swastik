export const MEDICINES = Array.from({ length: 100 }, (_, i) => {
    const id = i + 1;
    const categories = ["Pain Relief", "Antibiotics", "Supplements", "Allergy", "Diabetes", "Cardiology", "Dermatology", "Gastrointestinal"];
    const category = categories[i % categories.length];

    // Helper to generate realistic prices in INR
    const basePrice = (Math.random() * 500) + 50;
    const price = Math.floor(basePrice);

    let name = "";
    let description = "";
    let requiresPrescription = false;

    // Categorization logic for names
    switch (category) {
        case "Pain Relief":
            const painMeds = ["Paracetamol 650mg", "Dolo 650", "Ibuprofen 400mg", "Combiflam", "Diclofenac Gel", "Aspirin 75mg", "Tramadol", "Zerodol-P", "Aceclofenac", "Voveran SR"];
            name = painMeds[i % painMeds.length];
            description = "Relief from body pain, fever, and inflammation.";
            requiresPrescription = name.includes("Tramadol");
            break;
        case "Antibiotics":
            const antibiotics = ["Amoxicillin 500mg", "Azithromycin 500mg", "Cefixime 200mg", "Ofloxacin", "Augmentin 625", "Doxycycline", "Metronidazole", "Clindamycin", "Levofloxacin", "Ciprobid"];
            name = antibiotics[i % antibiotics.length];
            description = "Antibiotic medication for bacterial infections.";
            requiresPrescription = true;
            break;
        case "Supplements":
            const supplements = ["Vitamin C 500mg", "Zincovit", "Shelcal 500", "Neurobion Forte", "Evion 400", "Cod Liver Oil", "Multivitamin & Minerals", "Iron Folic Acid", "Calcium + D3", "B-Complex"];
            name = supplements[i % supplements.length];
            description = "Nutritional supplement for general wellness.";
            requiresPrescription = false;
            break;
        case "Allergy":
            const allergyMeds = ["Cetirizine 10mg", "Allegra 120mg", "Montelukast", "Levocetirizine", "Avil 25", "Cetzine", "Montek LC", "Benadryl Syrup", "Okacet", "Histafree"];
            name = allergyMeds[i % allergyMeds.length];
            description = "Effective relief from allergy symptoms.";
            requiresPrescription = name.includes("Montelukast");
            break;
        case "Diabetes":
            const diabetesMeds = ["Metformin 500mg", "Glycomet GP1", "Janumet 50/500", "Teneligliptin", "Glimepiride", "Vildagliptin", "Insulin Glargine", "Human Mixtard", "Galvus Met", "Sugar Free Gold"];
            name = diabetesMeds[i % diabetesMeds.length];
            description = "Helps control blood sugar levels.";
            requiresPrescription = !name.includes("Sugar Free");
            break;
        case "Cardiology":
            const cardioMeds = ["Atorvastatin 10mg", "Telmisartan 40mg", "Amlodipine 5mg", "Ecosprin 75", "Rosuvastatin", "Concor 5", "Losartan", "Clopidogrel", "Sorbitrate", "Metoprolol"];
            name = cardioMeds[i % cardioMeds.length];
            description = "For heart health and blood pressure management.";
            requiresPrescription = true;
            break;
        case "Dermatology":
            const dermaMeds = ["Betnovate-C", "Candid B Cream", "Panderm Plus", "Aloe Vera Gel", "Permethrin Lotion", "Clotrimazole Powder", "Ketoconazole Soap", "Fusidic Acid", "Benzoyl Peroxide", "Calamine Lotion"];
            name = dermaMeds[i % dermaMeds.length];
            description = "Skin care and treatment for infections.";
            requiresPrescription = name.includes("Betnovate") || name.includes("Panderm");
            break;
        case "Gastrointestinal":
            const gastroMeds = ["Pantoprazole 40mg", "Omeprazole", "Digene Gel", "Gelusil", "Buscopan", "Cremaffin", "Dulcoflex", "Eno Sachet", "Ondansetron", "Ranitidine"];
            name = gastroMeds[i % gastroMeds.length];
            description = "For acidity, gas, and digestive relief.";
            requiresPrescription = name.includes("Ondansetron");
            break;
        default:
            name = "Generic Medicine " + id;
            description = "General healthcare product.";
    }

    // Assign consistent images based on category to keep it looking nice
    let image = "";
    switch (category) {
        case "Pain Relief": image = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=200"; break;
        case "Antibiotics": image = "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&q=80&w=200"; break;
        case "Supplements": image = "https://images.unsplash.com/photo-1550572017-ed10144c5f45?auto=format&fit=crop&q=80&w=200"; break;
        case "Allergy": image = "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&q=80&w=200"; break;
        case "Diabetes": image = "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=200"; break;
        case "Cardiology": image = "https://plus.unsplash.com/premium_photo-1668487826871-2f2cac436dc5?auto=format&fit=crop&q=80&w=200"; break;
        case "Dermatology": image = "https://images.unsplash.com/photo-1556228720-19de77890032?auto=format&fit=crop&q=80&w=200"; break;
        case "Gastrointestinal": image = "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80&w=200"; break;
    }

    return {
        id,
        name: `${name} (#${id})`, // Adding ID to make names unique enough for the list
        category,
        price,
        image,
        description,
        requiresPrescription
    };
});

export const CATEGORIES = ["All", "Pain Relief", "Antibiotics", "Supplements", "Allergy", "Diabetes", "Cardiology", "Dermatology", "Gastrointestinal"];

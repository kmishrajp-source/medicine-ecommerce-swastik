const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// We store the Ayurveda sub-category in the `uses` field prefixed with "AYU_CAT:"
// e.g. uses: "AYU_CAT:Diabetes Care | Controls blood sugar naturally"
const medicines = [
    // === DIABETES CARE ===
    { name: 'Madhunashini Vati', description: 'Ayurvedic medicine for blood sugar management and diabetes control.', price: 130, category: 'Ayurvedic', uses: 'AYU_CAT:Diabetes Care | Controls blood sugar, improves insulin sensitivity naturally', brand: 'Patanjali', salt: 'Karela, Jamun, Neem, Gudmar', stock: 80, requiresPrescription: false, image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=400&q=80' },
    { name: 'Diabecon DS Himalaya', description: 'Clinically proven Ayurvedic formula to regulate blood glucose levels.', price: 175, category: 'Ayurvedic', uses: 'AYU_CAT:Diabetes Care | Regulates blood glucose, supports pancreatic health', brand: 'Himalaya', salt: 'Shilajit, Gudmar, Pitasara', stock: 60, requiresPrescription: false, image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=400&q=80' },
    { name: 'Karela Jamun Juice', description: 'Natural bitter gourd and black plum juice for blood sugar balance.', price: 90, category: 'Ayurvedic', uses: 'AYU_CAT:Diabetes Care | Balances blood sugar, improves digestion', brand: 'Baidyanath', salt: 'Karela (Bitter Gourd), Jamun', stock: 120, requiresPrescription: false, image: 'https://images.unsplash.com/photo-1622480916113-9000ac49b79d?auto=format&fit=crop&w=400&q=80' },

    // === LIVER CARE ===
    { name: 'Liv.52 DS Himalaya', description: "India's #1 liver tonic. Restores liver function and protects against toxins.", price: 185, category: 'Ayurvedic', uses: 'AYU_CAT:Liver Care | Restores liver function, protects against hepatic damage', brand: 'Himalaya', salt: 'Himsra, Kasani, Mandur Bhasma', stock: 150, requiresPrescription: false, image: 'https://images.unsplash.com/photo-1576671081837-49000212a370?auto=format&fit=crop&w=400&q=80' },
    { name: 'Arogyavardhini Vati', description: 'Classical Ayurvedic tablet for liver, skin, and metabolic health.', price: 95, category: 'Ayurvedic', uses: 'AYU_CAT:Liver Care | Detoxifies liver, improves metabolism and digestion', brand: 'Baidyanath', salt: 'Kutki, Triphala, Shilajit, Guggul', stock: 70, requiresPrescription: false, image: 'https://images.unsplash.com/photo-1576671081837-49000212a370?auto=format&fit=crop&w=400&q=80' },
    { name: 'Kumariasava', description: 'Ayurvedic liver tonic with aloe vera for fatty liver and digestion.', price: 135, category: 'Ayurvedic', uses: 'AYU_CAT:Liver Care | Treats fatty liver, improves appetite and digestion', brand: 'Dabur', salt: 'Aloe Vera, Triphala, Nagarmotha', stock: 55, requiresPrescription: false, image: 'https://images.unsplash.com/photo-1576671081837-49000212a370?auto=format&fit=crop&w=400&q=80' },

    // === LUNG & RESPIRATORY ===
    { name: 'Vasavaleha', description: 'Classical Ayurvedic jam for cough, bronchitis, and respiratory health.', price: 115, category: 'Ayurvedic', uses: 'AYU_CAT:Lung & Respiratory | Treats cough, bronchitis and chest congestion', brand: 'Dabur', salt: 'Vasa (Adhatoda), Pippali, Honey', stock: 90, requiresPrescription: false, image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=400&q=80' },
    { name: 'Sitopaladi Churna', description: 'Traditional Ayurvedic powder for cough, cold, and lung congestion.', price: 75, category: 'Ayurvedic', uses: 'AYU_CAT:Lung & Respiratory | Relieves cough, cold and clears lung congestion', brand: 'Patanjali', salt: 'Mishri, Vanshalochan, Pippali, Cardamom', stock: 100, requiresPrescription: false, image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=400&q=80' },
    { name: 'Chyawanprash Special', description: 'Immunity and lung strengthening Ayurvedic supplement with 40+ herbs.', price: 350, category: 'Ayurvedic', uses: 'AYU_CAT:Lung & Respiratory | Strengthens lungs, boosts immunity and stamina', brand: 'Dabur', salt: 'Amla, Ashwagandha, Giloy, Brahmi', stock: 60, requiresPrescription: false, image: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&w=400&q=80' },

    // === NEURO & BRAIN ===
    { name: 'Brahmi Vati Gold', description: 'Ayurvedic gold-infused tablet for brain health, memory and concentration.', price: 380, category: 'Ayurvedic', uses: 'AYU_CAT:Neuro & Brain | Enhances memory, focus and cognitive performance', brand: 'Baidyanath', salt: 'Brahmi, Shankhpushpi, Swarna Bhasma', stock: 30, requiresPrescription: false, image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=400&q=80' },
    { name: 'Ashwagandha Capsules', description: 'Reduces stress, improves brain function, and boosts memory.', price: 199, category: 'Ayurvedic', uses: 'AYU_CAT:Neuro & Brain | Improves memory, reduces mental fatigue and brain fog', brand: 'Patanjali', salt: 'Ashwagandha (Withania somnifera)', stock: 150, requiresPrescription: false, image: 'https://images.unsplash.com/photo-1626240243171-460ce01df1e8?auto=format&fit=crop&w=400&q=80' },
    { name: 'Medhya Rasayana Syrup', description: 'Ayurvedic brain tonic for mental clarity, focus, and cognitive strength.', price: 145, category: 'Ayurvedic', uses: 'AYU_CAT:Neuro & Brain | Promotes mental clarity and sharpens intellect', brand: 'Himalaya', salt: 'Brahmi, Mandukaparni, Yashtimadhu', stock: 80, requiresPrescription: false, image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=400&q=80' },

    // === MIND & MENTAL WELLNESS ===
    { name: 'Jatamansi Churna', description: 'Natural Ayurvedic herb for anxiety, insomnia, and emotional balance.', price: 85, category: 'Ayurvedic', uses: 'AYU_CAT:Mind & Mental Wellness | Calms anxiety, improves sleep and emotional stability', brand: 'Baidyanath', salt: 'Nardostachys Jatamansi', stock: 70, requiresPrescription: false, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80' },
    { name: 'Shankh Pushpi Syrup', description: 'Classic Ayurvedic nervine tonic for stress relief and sleep quality.', price: 99, category: 'Ayurvedic', uses: 'AYU_CAT:Mind & Mental Wellness | Relieves stress, promotes restful sleep', brand: 'Dabur', salt: 'Shankhpushpi, Brahmi, Jatamansi', stock: 90, requiresPrescription: false, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80' },
    { name: 'Ashwagandha Churna', description: '100% natural stress relief, anxiety reduction, and immunity booster.', price: 85, category: 'Ayurvedic', uses: 'AYU_CAT:Mind & Mental Wellness | Reduces cortisol, relieves stress and anxiety', brand: 'Patanjali', salt: 'Ashwagandha root powder', stock: 100, requiresPrescription: false, image: 'https://images.unsplash.com/photo-1626240243171-460ce01df1e8?auto=format&fit=crop&w=400&q=80' },

    // === SKIN CARE ===
    { name: 'Manjistha Capsules', description: 'Powerful blood purifier for acne, blemishes, and skin disorders.', price: 140, category: 'Ayurvedic', uses: 'AYU_CAT:Skin Care | Purifies blood, clears acne and improves skin complexion', brand: 'Himalaya', salt: 'Rubia Cordifolia (Manjistha)', stock: 80, requiresPrescription: false, image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=400&q=80' },
    { name: 'Neem Capsules', description: 'Antibacterial and antifungal for clear skin, acne control, and detox.', price: 120, category: 'Ayurvedic', uses: 'AYU_CAT:Skin Care | Controls acne, fungal infections and detoxifies skin', brand: 'Patanjali', salt: 'Neem (Azadirachta Indica)', stock: 120, requiresPrescription: false, image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=400&q=80' },
    { name: 'Sariva Churna', description: 'Ayurvedic herb for skin glow, blood purification, and inflammatory skin conditions.', price: 78, category: 'Ayurvedic', uses: 'AYU_CAT:Skin Care | Brightens skin tone, reduces inflammation and purifies blood', brand: 'Baidyanath', salt: 'Hemidesmus Indicus (Anantmool)', stock: 60, requiresPrescription: false, image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=400&q=80' },

    // === JOINT & BONE CARE ===
    { name: 'Shallaki Tablet Himalaya', description: 'Clinically proven for joint pain, arthritis, and bone inflammation.', price: 195, category: 'Ayurvedic', uses: 'AYU_CAT:Joint & Bone Care | Reduces joint inflammation, pain and stiffness in arthritis', brand: 'Himalaya', salt: 'Boswellia Serrata (Shallaki)', stock: 70, requiresPrescription: false, image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80' },
    { name: 'Mahayogaraj Guggul', description: 'Classical Ayurvedic formulation for arthritis, gout, and joint stiffness.', price: 160, category: 'Ayurvedic', uses: 'AYU_CAT:Joint & Bone Care | Treats gout, arthritis and chronic joint disorders', brand: 'Baidyanath', salt: 'Guggul, Triphala, Trikatu, Panchmoola', stock: 50, requiresPrescription: false, image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80' },

    // === HEART CARE ===
    { name: 'Arjuna Capsules', description: 'Traditional Ayurvedic cardiotonic for heart muscle strength and circulation.', price: 150, category: 'Ayurvedic', uses: 'AYU_CAT:Heart Care | Strengthens heart muscle and improves cardiac circulation', brand: 'Himalaya', salt: 'Terminalia Arjuna', stock: 60, requiresPrescription: false, image: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&w=400&q=80' },
    { name: 'Hridayarnava Ras', description: 'Classical Ayurvedic cardiac tonic for palpitations and heart weakness.', price: 280, category: 'Ayurvedic', uses: 'AYU_CAT:Heart Care | Treats palpitations, chest pain and cardiac weakness', brand: 'Baidyanath', salt: 'Swarna Bhasma, Arjuna, Mukta Bhasma', stock: 25, requiresPrescription: false, image: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&w=400&q=80' },

    // === IMMUNITY & WELLNESS ===
    { name: 'Giloy Ghanvati', description: 'Immunity-boosting Ayurvedic tablet from Guduchi extract (holy herb).', price: 75, category: 'Ayurvedic', uses: 'AYU_CAT:Immunity & Wellness | Boosts immunity, fights infections and fevers', brand: 'Patanjali', salt: 'Tinospora Cordifolia (Giloy)', stock: 200, requiresPrescription: false, image: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&w=400&q=80' },
    { name: 'Triphala Churna', description: 'Classic digestive and immunity tonic. Detoxifies body and improves gut health.', price: 65, category: 'Ayurvedic', uses: 'AYU_CAT:Immunity & Wellness | Detoxifies body, boosts immunity and digestive health', brand: 'Dabur', salt: 'Amalaki, Bibhitaki, Haritaki', stock: 180, requiresPrescription: false, image: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&w=400&q=80' },
];

async function seed() {
    console.log('Seeding Ayurvedic medicines...');
    for (const med of medicines) {
        const existing = await prisma.product.findFirst({ where: { name: med.name } });
        if (existing) {
            await prisma.product.update({ where: { id: existing.id }, data: med });
            console.log(`Updated: ${med.name}`);
        } else {
            await prisma.product.create({ data: med });
            console.log(`Created: ${med.name}`);
        }
    }
    console.log(`\n✅ Done! ${medicines.length} Ayurvedic medicines seeded.`);
}

seed().catch(console.error).finally(() => prisma.$disconnect());

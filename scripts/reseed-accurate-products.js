const { Client } = require('pg');
require('dotenv').config();

const ACCURATE_PRODUCTS = [
  // 1. Pain Relief & Anti-inflammatory
  {
    name: "Dolo 650 Tablet",
    brand: "Dolo",
    salt: "Paracetamol (650mg)",
    composition: "Paracetamol 650 mg",
    category: "Pain Relief",
    price: 30.50,
    mrp: 34.15,
    discount: 11,
    packSize: "Strip of 15 tablets",
    manufacturer: "Micro Labs Ltd",
    requiresPrescription: false,
    isOTC: true,
    isScheduleH1: false,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    description: "Dolo 650 contains Paracetamol 650mg, effective for high fever, body ache, headache, and mild to moderate pain relief."
  },
  {
    name: "Calpol 500 Tablet",
    brand: "Calpol",
    salt: "Paracetamol (500mg)",
    composition: "Paracetamol 500 mg",
    category: "Pain Relief",
    price: 18.00,
    mrp: 21.00,
    discount: 14,
    packSize: "Strip of 15 tablets",
    manufacturer: "GSK India",
    requiresPrescription: false,
    isOTC: true,
    isScheduleH1: false,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    description: "Fast-acting analgesic and antipyretic formulation for temperature reduction and fever management."
  },
  {
    name: "Combiflam Tablet",
    brand: "Combiflam",
    salt: "Ibuprofen (400mg) + Paracetamol (325mg)",
    composition: "Ibuprofen 400 mg + Paracetamol 325 mg",
    category: "Pain Relief",
    price: 45.00,
    mrp: 52.80,
    discount: 15,
    packSize: "Strip of 20 tablets",
    manufacturer: "Sanofi India Ltd",
    requiresPrescription: false,
    isOTC: true,
    isScheduleH1: false,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    description: "Proven dual-action anti-inflammatory pain reliever for dental pain, muscular sprains, joint pain, and fever."
  },
  {
    name: "Meftal-Spas Tablet",
    brand: "Meftal-Spas",
    salt: "Mefenamic Acid (250mg) + Dicyclomine (10mg)",
    composition: "Mefenamic Acid 250 mg + Dicyclomine Hydrochloride 10 mg",
    category: "Pain Relief",
    price: 48.00,
    mrp: 57.00,
    discount: 16,
    packSize: "Strip of 10 tablets",
    manufacturer: "Blue Cross Laboratories",
    requiresPrescription: true,
    isOTC: false,
    isScheduleH1: false,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    description: "Antispasmodic and analgesic for relief from menstrual abdominal cramps, intestinal colic, and biliary spasm."
  },
  {
    name: "Zerodol-SP Tablet",
    brand: "Zerodol",
    salt: "Aceclofenac (100mg) + Paracetamol (325mg) + Serratiopeptidase (15mg)",
    composition: "Aceclofenac 100 mg + Paracetamol 325 mg + Serratiopeptidase 15 mg",
    category: "Pain Relief",
    price: 112.00,
    mrp: 135.00,
    discount: 17,
    packSize: "Strip of 10 tablets",
    manufacturer: "Ipca Laboratories Ltd",
    requiresPrescription: true,
    isOTC: false,
    isScheduleH1: false,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    description: "Triple action enzyme-antiinflammatory tablet for acute swelling, post-surgical inflammation, and severe joint arthritis."
  },
  {
    name: "Volini Pain Relief Gel",
    brand: "Volini",
    salt: "Diclofenac Diethylamine + Methyl Salicylate + Menthol + Linseed Oil",
    composition: "Diclofenac Diethylamine 1.16% w/w + Linseed Oil 3% + Methyl Salicylate 10% + Menthol 5%",
    category: "Pain Relief",
    price: 135.00,
    mrp: 155.00,
    discount: 13,
    packSize: "Tube of 50 gm",
    manufacturer: "Sun Pharmaceutical Industries",
    requiresPrescription: false,
    isOTC: true,
    isScheduleH1: false,
    image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400&auto=format&fit=crop&q=80",
    description: "Fast-absorbing topical pain relief gel with micro-particles for deep penetration into backache, neck pain, and joint sprains."
  },

  // 2. Antibiotics & Anti-Infectives
  {
    name: "Augmentin 625 Duo Tablet",
    brand: "Augmentin",
    salt: "Amoxicillin (500mg) + Clavulanic Acid (125mg)",
    composition: "Amoxicillin Trihydrate 500 mg + Potassium Clavulanate 125 mg",
    category: "Antibiotics",
    price: 198.00,
    mrp: 228.50,
    discount: 13,
    packSize: "Strip of 10 tablets",
    manufacturer: "GSK India",
    requiresPrescription: true,
    isOTC: false,
    isScheduleH1: true,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    description: "Broad-spectrum penicillin antibiotic combined with beta-lactamase inhibitor for bacterial respiratory, skin, bone, and urinary tract infections."
  },
  {
    name: "Azithral 500 Tablet",
    brand: "Azithral",
    salt: "Azithromycin (500mg)",
    composition: "Azithromycin Dihydrate 500 mg",
    category: "Antibiotics",
    price: 118.00,
    mrp: 136.00,
    discount: 13,
    packSize: "Strip of 5 tablets",
    manufacturer: "Alembic Pharmaceuticals",
    requiresPrescription: true,
    isOTC: false,
    isScheduleH1: true,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    description: "Macrolide antibiotic for treating bacterial throat infections, bronchitis, pneumonia, sinusitis, and dermatological infections."
  },
  {
    name: "Taxim-O 200 Tablet",
    brand: "Taxim-O",
    salt: "Cefixime (200mg)",
    composition: "Cefixime Trihydrate 200 mg",
    category: "Antibiotics",
    price: 105.00,
    mrp: 122.50,
    discount: 14,
    packSize: "Strip of 10 tablets",
    manufacturer: "Alkem Laboratories Ltd",
    requiresPrescription: true,
    isOTC: false,
    isScheduleH1: true,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    description: "Third-generation cephalosporin antibiotic for typhoid fever, uncomplicated urinary infections, and ear-nose-throat infections."
  },
  {
    name: "Ciplox 500 Tablet",
    brand: "Ciplox",
    salt: "Ciprofloxacin (500mg)",
    composition: "Ciprofloxacin Hydrochloride 500 mg",
    category: "Antibiotics",
    price: 42.00,
    mrp: 48.80,
    discount: 14,
    packSize: "Strip of 10 tablets",
    manufacturer: "Cipla Ltd",
    requiresPrescription: true,
    isOTC: false,
    isScheduleH1: true,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    description: "Fluoroquinolone antibiotic for bacterial gastroenteritis, skin infections, bone infections, and persistent urinary tract infections."
  },
  {
    name: "Flagyl 400 Tablet",
    brand: "Flagyl",
    salt: "Metronidazole (400mg)",
    composition: "Metronidazole 400 mg",
    category: "Antibiotics",
    price: 24.00,
    mrp: 28.50,
    discount: 15,
    packSize: "Strip of 15 tablets",
    manufacturer: "Abbott India Ltd",
    requiresPrescription: true,
    isOTC: false,
    isScheduleH1: true,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    description: "Nitroimidazole antiprotozoal and antibacterial agent for amoebiasis, giardiasis, dental abscesses, and anaerobic bacterial infections."
  },

  // 3. Gastrointestinal & Acid Reducers
  {
    name: "Pan 40 Tablet",
    brand: "Pan",
    salt: "Pantoprazole (40mg)",
    composition: "Pantoprazole Sodium Gastro-resistant 40 mg",
    category: "Gastrointestinal",
    price: 145.00,
    mrp: 172.00,
    discount: 16,
    packSize: "Strip of 15 tablets",
    manufacturer: "Alkem Laboratories Ltd",
    requiresPrescription: true,
    isOTC: false,
    isScheduleH1: false,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    description: "Proton pump inhibitor (PPI) that reduces stomach acid secretion; treats GERD, gastric ulcers, and erosive esophagitis."
  },
  {
    name: "Pan-D Capsule",
    brand: "Pan-D",
    salt: "Pantoprazole (40mg) + Domperidone (30mg SR)",
    composition: "Pantoprazole 40 mg + Domperidone 30 mg Sustained Release",
    category: "Gastrointestinal",
    price: 185.00,
    mrp: 218.00,
    discount: 15,
    packSize: "Strip of 15 capsules",
    manufacturer: "Alkem Laboratories Ltd",
    requiresPrescription: true,
    isOTC: false,
    isScheduleH1: false,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    description: "Combination medicine treating acid reflux accompanied by nausea, dyspepsia, bloating, and vomiting sensations."
  },
  {
    name: "Rantac 150 Tablet",
    brand: "Rantac",
    salt: "Ranitidine (150mg)",
    composition: "Ranitidine Hydrochloride 150 mg",
    category: "Gastrointestinal",
    price: 36.00,
    mrp: 44.00,
    discount: 18,
    packSize: "Strip of 30 tablets",
    manufacturer: "JB Chemicals & Pharmaceuticals",
    requiresPrescription: false,
    isOTC: true,
    isScheduleH1: false,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    description: "H2 blocker providing rapid relief from hyperacidity, heartburn, sour belching, and indigestion."
  },
  {
    name: "Gelusil Antacid Syrup (Mint)",
    brand: "Gelusil",
    salt: "Aluminium Hydroxide + Magnesium Hydroxide + Dimethicone",
    composition: "Aluminium Hydroxide 250mg + Magnesium Hydroxide 250mg + Simethicone 50mg per 5ml",
    category: "Gastrointestinal",
    price: 110.00,
    mrp: 125.00,
    discount: 12,
    packSize: "Bottle of 200 ml",
    manufacturer: "Pfizer India",
    requiresPrescription: false,
    isOTC: true,
    isScheduleH1: false,
    image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400&auto=format&fit=crop&q=80",
    description: "Soothing antacid liquid for immediate neutralizing of stomach acidity and gas bubbles in stomach and intestines."
  },
  {
    name: "Ondem 4 Tablet",
    brand: "Ondem",
    salt: "Ondansetron (4mg)",
    composition: "Ondansetron Hydrochloride 4 mg",
    category: "Gastrointestinal",
    price: 52.00,
    mrp: 61.20,
    discount: 15,
    packSize: "Strip of 10 tablets",
    manufacturer: "Alkem Laboratories Ltd",
    requiresPrescription: true,
    isOTC: false,
    isScheduleH1: false,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    description: "Antiemetic agent for rapid control of severe nausea and vomiting induced by gastroenteritis, motion sickness, or medications."
  },

  // 4. Cardiology & Hypertension
  {
    name: "Telma 40 Tablet",
    brand: "Telma",
    salt: "Telmisartan (40mg)",
    composition: "Telmisartan 40 mg",
    category: "Cardiology",
    price: 195.00,
    mrp: 232.00,
    discount: 16,
    packSize: "Strip of 30 tablets",
    manufacturer: "Glenmark Pharmaceuticals",
    requiresPrescription: true,
    isOTC: false,
    isScheduleH1: false,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    description: "Angiotensin II receptor antagonist for long-term management of high blood pressure and cardiac risk reduction."
  },
  {
    name: "Telma-H Tablet",
    brand: "Telma-H",
    salt: "Telmisartan (40mg) + Hydrochlorothiazide (12.5mg)",
    composition: "Telmisartan 40 mg + Hydrochlorothiazide 12.5 mg",
    category: "Cardiology",
    price: 240.00,
    mrp: 285.00,
    discount: 15,
    packSize: "Strip of 30 tablets",
    manufacturer: "Glenmark Pharmaceuticals",
    requiresPrescription: true,
    isOTC: false,
    isScheduleH1: false,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    description: "Dual antihypertensive combination with thiazide diuretic for stubborn hypertension requiring synergistic blood pressure control."
  },
  {
    name: "Amlokind 5 Tablet",
    brand: "Amlokind",
    salt: "Amlodipine (5mg)",
    composition: "Amlodipine Besylate 5 mg",
    category: "Cardiology",
    price: 28.00,
    mrp: 35.00,
    discount: 20,
    packSize: "Strip of 15 tablets",
    manufacturer: "Mankind Pharma",
    requiresPrescription: true,
    isOTC: false,
    isScheduleH1: false,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    description: "Calcium channel blocker that relaxes arterial blood vessels, improving blood flow and reducing heart strain."
  },
  {
    name: "Atorva 10 Tablet",
    brand: "Atorva",
    salt: "Atorvastatin (10mg)",
    composition: "Atorvastatin Calcium 10 mg",
    category: "Cardiology",
    price: 88.00,
    mrp: 105.00,
    discount: 16,
    packSize: "Strip of 15 tablets",
    manufacturer: "Zydus Lifesciences",
    requiresPrescription: true,
    isOTC: false,
    isScheduleH1: false,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    description: "HMG-CoA reductase inhibitor (statin) that lowers LDL bad cholesterol and triglycerides to prevent heart attacks."
  },
  {
    name: "Ecosprin 75 Tablet",
    brand: "Ecosprin",
    salt: "Aspirin (75mg)",
    composition: "Aspirin (Acetylsalicylic Acid) Gastro-resistant 75 mg",
    category: "Cardiology",
    price: 8.50,
    mrp: 10.20,
    discount: 16,
    packSize: "Strip of 14 tablets",
    manufacturer: "USV Ltd",
    requiresPrescription: true,
    isOTC: false,
    isScheduleH1: false,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    description: "Low-dose antiplatelet medication used to prevent blood clots, ischemic strokes, and recurrent heart attacks."
  },

  // 5. Diabetes Management
  {
    name: "Glycomet 500 SR Tablet",
    brand: "Glycomet",
    salt: "Metformin (500mg SR)",
    composition: "Metformin Hydrochloride Sustained Release 500 mg",
    category: "Diabetes",
    price: 42.00,
    mrp: 50.00,
    discount: 16,
    packSize: "Strip of 20 tablets",
    manufacturer: "USV Ltd",
    requiresPrescription: true,
    isOTC: false,
    isScheduleH1: false,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    description: "First-line biguanide oral antidiabetic medicine improving insulin sensitivity and controlling HbA1c in Type 2 Diabetes."
  },
  {
    name: "Glycomet-GP 1 Tablet",
    brand: "Glycomet-GP",
    salt: "Glimepiride (1mg) + Metformin (500mg SR)",
    composition: "Glimepiride 1 mg + Metformin Hydrochloride 500 mg Sustained Release",
    category: "Diabetes",
    price: 95.00,
    mrp: 115.00,
    discount: 17,
    packSize: "Strip of 15 tablets",
    manufacturer: "USV Ltd",
    requiresPrescription: true,
    isOTC: false,
    isScheduleH1: false,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    description: "Dual oral hypoglycemic agent stimulating pancreatic insulin secretion and decreasing hepatic glucose production."
  },
  {
    name: "Galvus Met 50/500 Tablet",
    brand: "Galvus Met",
    salt: "Vildagliptin (50mg) + Metformin (500mg)",
    composition: "Vildagliptin 50 mg + Metformin Hydrochloride 500 mg",
    category: "Diabetes",
    price: 320.00,
    mrp: 375.00,
    discount: 15,
    packSize: "Strip of 15 tablets",
    manufacturer: "Novartis / Abbott",
    requiresPrescription: true,
    isOTC: false,
    isScheduleH1: false,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    description: "DPP-4 inhibitor combined with metformin providing glycemic control without inducing hypoglycemic episodes or weight gain."
  },
  {
    name: "Thyronorm 50mcg Tablet",
    brand: "Thyronorm",
    salt: "Thyroxine Sodium (50mcg)",
    composition: "Thyroxine Sodium 50 mcg (0.05 mg)",
    category: "Diabetes",
    price: 135.00,
    mrp: 158.00,
    discount: 14,
    packSize: "Bottle of 120 tablets",
    manufacturer: "Abbott India Ltd",
    requiresPrescription: true,
    isOTC: false,
    isScheduleH1: false,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    description: "Synthetic levothyroxine hormone replacement therapy for managing underactive thyroid glands (hypothyroidism)."
  },

  // 6. Respiratory, Cough & Allergy
  {
    name: "Ascoril LS Syrup",
    brand: "Ascoril",
    salt: "Levosalbutamol + Ambroxol + Guaiphenesin",
    composition: "Levosalbutamol 1mg + Ambroxol Hydrochloride 30mg + Guaiphenesin 50mg per 5ml",
    category: "Respiratory",
    price: 108.00,
    mrp: 126.00,
    discount: 14,
    packSize: "Bottle of 100 ml",
    manufacturer: "Glenmark Pharmaceuticals",
    requiresPrescription: true,
    isOTC: false,
    isScheduleH1: false,
    image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400&auto=format&fit=crop&q=80",
    description: "Triple bronchodilator, mucolytic, and expectorant syrup for relieving productive wet cough, chest congestion, and bronchitis."
  },
  {
    name: "Montair LC Tablet",
    brand: "Montair",
    salt: "Montelukast (10mg) + Levocetirizine (5mg)",
    composition: "Montelukast Sodium 10 mg + Levocetirizine Dihydrochloride 5 mg",
    category: "Respiratory",
    price: 180.00,
    mrp: 212.00,
    discount: 15,
    packSize: "Strip of 15 tablets",
    manufacturer: "Cipla Ltd",
    requiresPrescription: true,
    isOTC: false,
    isScheduleH1: false,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    description: "Dual leukotriene receptor antagonist and antihistamine for allergic rhinitis, seasonal sneezing, runny nose, and asthma prophylaxis."
  },
  {
    name: "Allegra 120mg Tablet",
    brand: "Allegra",
    salt: "Fexofenadine (120mg)",
    composition: "Fexofenadine Hydrochloride 120 mg",
    category: "Antiallergic",
    price: 185.00,
    mrp: 218.00,
    discount: 15,
    packSize: "Strip of 10 tablets",
    manufacturer: "Sanofi India Ltd",
    requiresPrescription: false,
    isOTC: true,
    isScheduleH1: false,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    description: "Non-drowsy second-generation antihistamine relieving skin allergies, chronic urticaria (hives), allergic conjunctivitis, and dust allergy."
  },
  {
    name: "Asthalin 100mcg Inhaler",
    brand: "Asthalin",
    salt: "Salbutamol (100mcg per puff)",
    composition: "Salbutamol (Albuterol) Inhalation Aerosol 100 mcg / actuation",
    category: "Respiratory",
    price: 148.00,
    mrp: 172.00,
    discount: 14,
    packSize: "Inhaler of 200 metered doses",
    manufacturer: "Cipla Ltd",
    requiresPrescription: true,
    isOTC: false,
    isScheduleH1: false,
    image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400&auto=format&fit=crop&q=80",
    description: "Quick-relief rescue bronchodilator inhaler opening airways during acute asthma attacks and chronic obstructive pulmonary disease (COPD)."
  },

  // 7. Vitamins, Minerals & Supplements
  {
    name: "Becosules Z Capsule",
    brand: "Becosules",
    salt: "B-Complex Vitamins + Vitamin C + Zinc",
    composition: "Thiamine 10mg + Riboflavin 10mg + Pyridoxine 3mg + Niacinamide 50mg + Calcium Pantothenate 12.5mg + Cyanocobalamin 5mcg + Folic Acid 1mg + Vitamin C 150mg + Zinc 41.4mg",
    category: "Vitamins",
    price: 42.00,
    mrp: 49.50,
    discount: 15,
    packSize: "Strip of 20 capsules",
    manufacturer: "Pfizer India Ltd",
    requiresPrescription: false,
    isOTC: true,
    isScheduleH1: false,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    description: "Comprehensive multivitamin formulation for healing mouth ulcers, boosting immunity, overcoming physical fatigue, and tissue repair."
  },
  {
    name: "Shelcal 500 Tablet",
    brand: "Shelcal",
    salt: "Calcium Carbonate (500mg elemental) + Vitamin D3 (250 IU)",
    composition: "Calcium Carbonate derived from Oyster Shell 1250mg eq to Elemental Calcium 500mg + Vitamin D3 250 IU",
    category: "Supplements",
    price: 110.00,
    mrp: 131.00,
    discount: 16,
    packSize: "Strip of 15 tablets",
    manufacturer: "Torrent Pharmaceuticals",
    requiresPrescription: false,
    isOTC: true,
    isScheduleH1: false,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    description: "High-absorption calcium and cholecalciferol formulation maintaining bone mineral density and preventing osteoporosis and fractures."
  },
  {
    name: "Evion 400 Capsule",
    brand: "Evion",
    salt: "Vitamin E (Tocopheryl Acetate 400mg)",
    composition: "Vitamin E (Tocopheryl Acetate) 400 mg",
    category: "Vitamins",
    price: 32.00,
    mrp: 37.80,
    discount: 15,
    packSize: "Strip of 10 green softgels",
    manufacturer: "Procter & Gamble Health",
    requiresPrescription: false,
    isOTC: true,
    isScheduleH1: false,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    description: "Potent antioxidant vitamin nourishing skin tissue, strengthening hair roots, managing nocturnal leg cramps, and cell vitality."
  },
  {
    name: "Uprise-D3 60K Capsule",
    brand: "Uprise-D3",
    salt: "Cholecalciferol (Vitamin D3 60,000 IU)",
    composition: "Cholecalciferol 60,000 International Units",
    category: "Supplements",
    price: 115.00,
    mrp: 136.00,
    discount: 15,
    packSize: "Strip of 4 softgels (Weekly dose)",
    manufacturer: "Alkem Laboratories Ltd",
    requiresPrescription: false,
    isOTC: true,
    isScheduleH1: false,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    description: "High-potency weekly vitamin D3 softgel correcting clinical vitamin D deficiency, bone weakness, and muscle fatigue."
  },
  {
    name: "Neurobion Forte Tablet",
    brand: "Neurobion",
    salt: "Vitamin B1 + B2 + B3 + B5 + B6 + B12",
    composition: "Thiamine 10mg + Riboflavin 10mg + Nicotinamide 45mg + Calcium Pantothenate 50mg + Pyridoxine 3mg + Cyanocobalamin 15mcg",
    category: "Vitamins",
    price: 36.00,
    mrp: 41.50,
    discount: 13,
    packSize: "Strip of 30 tablets",
    manufacturer: "Procter & Gamble Health",
    requiresPrescription: false,
    isOTC: true,
    isScheduleH1: false,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    description: "Doctor-prescribed nerve-rejuvenating vitamin formula for tingling, numbness in fingers and toes, and diabetic neuropathy."
  },

  // 8. Dermatology & Antifungals
  {
    name: "Candiforce 200 Capsule",
    brand: "Candiforce",
    salt: "Itraconazole (200mg)",
    composition: "Itraconazole Pellets 200 mg",
    category: "Dermatology",
    price: 185.00,
    mrp: 224.00,
    discount: 17,
    packSize: "Strip of 10 capsules",
    manufacturer: "Mankind Pharma",
    requiresPrescription: true,
    isOTC: false,
    isScheduleH1: true,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    description: "Systemic antifungal medication eliminating stubborn ringworm (tinea cruris/corporis), fungal nail infections, and candidiasis."
  },
  {
    name: "Betnovate-N Cream",
    brand: "Betnovate",
    salt: "Betamethasone (0.1% w/w) + Neomycin (0.5% w/w)",
    composition: "Betamethasone Valerate 0.1% w/w + Neomycin Sulphate 0.5% w/w",
    category: "Dermatology",
    price: 52.00,
    mrp: 60.50,
    discount: 14,
    packSize: "Tube of 20 gm",
    manufacturer: "GSK India Ltd",
    requiresPrescription: true,
    isOTC: false,
    isScheduleH1: false,
    image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400&auto=format&fit=crop&q=80",
    description: "Topical corticosteroid with antibacterial protection for eczema, severe dermatitis, psoriasis flare-ups, and insect bites."
  },
  {
    name: "T-Bact 2% Ointment",
    brand: "T-Bact",
    salt: "Mupirocin (2% w/w)",
    composition: "Mupirocin 2.0% w/w in Water-Soluble Ointment Base",
    category: "Dermatology",
    price: 120.00,
    mrp: 139.00,
    discount: 14,
    packSize: "Tube of 7.5 gm",
    manufacturer: "GSK India Ltd",
    requiresPrescription: true,
    isOTC: false,
    isScheduleH1: true,
    image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400&auto=format&fit=crop&q=80",
    description: "Topical antibiotic ointment eradicating staphylococcal bacterial skin infections, impetigo, infected cuts, and folliculitis."
  },

  // 9. Ayurvedic & Natural Formulations
  {
    name: "Dabur Chyawanprash (Awaleha)",
    brand: "Dabur",
    salt: "Amla + 40 Ayurvedic Herbs",
    composition: "Emblica officinalis (Amla) 46.7g + Dashmoola + Ashwagandha + Pippali per 100g",
    category: "Ayurvedic",
    price: 365.00,
    mrp: 395.00,
    discount: 8,
    packSize: "Jar of 1 kg",
    manufacturer: "Dabur India Ltd",
    requiresPrescription: false,
    isOTC: true,
    isScheduleH1: false,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Chyawanprash.jpg/800px-Chyawanprash.jpg",
    description: "Classic time-tested Ayurvedic Rasayana formula rich in natural Vitamin C and bioflavonoids for respiratory vitality and stamina."
  },
  {
    name: "Himalaya Liv 52 DS Tablet",
    brand: "Himalaya",
    salt: "Himsra (Capparis spinosa) + Kasani (Cichorium intybus)",
    composition: "Himsra 130mg + Kasani 130mg + Mandur Bhasma 66mg + Kakamachi 64mg",
    category: "Ayurvedic",
    price: 175.00,
    mrp: 195.00,
    discount: 10,
    packSize: "Bottle of 60 tablets",
    manufacturer: "Himalaya Wellness Company",
    requiresPrescription: false,
    isOTC: true,
    isScheduleH1: false,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    description: "Double strength hepatoprotective herbal formulation promoting appetite, protecting liver parenchyma from toxins, and aiding alcohol recovery."
  },
  {
    name: "Baidyanath Ashwagandha Churna",
    brand: "Baidyanath",
    salt: "Pure Withania Somnifera Root Powder",
    composition: "100% Micro-pulverized Organic Ashwagandha Roots",
    category: "Ayurvedic",
    price: 180.00,
    mrp: 210.00,
    discount: 14,
    packSize: "Container of 100 gm",
    manufacturer: "Shree Baidyanath Ayurved Bhawan",
    requiresPrescription: false,
    isOTC: true,
    isScheduleH1: false,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Ashwagandha_Roots_and_Powder.jpg/800px-Ashwagandha_Roots_and_Powder.jpg",
    description: "Adaptogenic restorative Ayurvedic herb decreasing cortisol stress hormones, supporting sound sleep, and strengthening neuromuscular stamina."
  },
  {
    name: "Triphala Churna",
    brand: "Baidyanath",
    salt: "Amalaki + Bibhitaki + Haritaki",
    composition: "Emblica officinalis + Terminalia bellirica + Terminalia chebula in equal parts",
    category: "Ayurvedic",
    price: 110.00,
    mrp: 125.00,
    discount: 12,
    packSize: "Container of 100 gm",
    manufacturer: "Shree Baidyanath Ayurved Bhawan",
    requiresPrescription: false,
    isOTC: true,
    isScheduleH1: false,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Triphala_Powder.jpg/800px-Triphala_Powder.jpg",
    description: "Traditional gentle bowel tonic promoting digestive peristalsis, colon detoxification, ocular health, and metabolic balance."
  },

  // 10. Medical Devices & Diagnostics
  {
    name: "Accu-Chek Active Blood Glucose Test Strips (50s)",
    brand: "Accu-Chek",
    salt: "Glucose Oxidase Biosensor Strips",
    composition: "50 Blood Glucose Test Strips with Code Chip",
    category: "General",
    price: 895.00,
    mrp: 1049.00,
    discount: 15,
    packSize: "Box of 50 strips",
    manufacturer: "Roche Diabetes Care",
    requiresPrescription: false,
    isOTC: true,
    isScheduleH1: false,
    image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400&auto=format&fit=crop&q=80",
    description: "Accurate capillary blood glucose monitoring strips requiring only 1-2 microlitres of blood with 5-second test results."
  },
  {
    name: "Dr. Morepen Finger Tip Pulse Oximeter PO-09",
    brand: "Dr. Morepen",
    salt: "Photoplethysmography Dual Wavelength Sensor",
    composition: "OLED Dual Color Display Pulse Oximeter Unit with Lanyard & Batteries",
    category: "General",
    price: 749.00,
    mrp: 1250.00,
    discount: 40,
    packSize: "1 Device Unit",
    manufacturer: "Dr. Morepen Laboratories",
    requiresPrescription: false,
    isOTC: true,
    isScheduleH1: false,
    image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400&auto=format&fit=crop&q=80",
    description: "Medical-grade non-invasive blood oxygen saturation (SpO2) and pulse rate monitor with multi-directional visual display."
  },
  {
    name: "Omron HEM 7120 Fully Automatic Digital Blood Pressure Monitor",
    brand: "Omron",
    salt: "Oscillometric Pressure Sensor",
    composition: "Digital Monitor Unit + Medium Arm Cuff (22-32 cm) + 4 AA Batteries",
    category: "General",
    price: 1899.00,
    mrp: 2440.00,
    discount: 22,
    packSize: "1 BP Monitor Kit",
    manufacturer: "Omron Healthcare",
    requiresPrescription: false,
    isOTC: true,
    isScheduleH1: false,
    image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400&auto=format&fit=crop&q=80",
    description: "Clinically validated one-touch upper arm blood pressure measurement device with irregular heartbeat detector and cuff wrap guide."
  }
];

async function reseed() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database!');

    // 1. Identify referenced product IDs
    const oi = await client.query('SELECT DISTINCT "productId" FROM "OrderItem";');
    const sl = await client.query('SELECT DISTINCT "productId" FROM "StockLog";');
    const pi = await client.query('SELECT DISTINCT "productId" FROM "PharmacyInventory";');

    const referencedIds = Array.from(new Set([
      ...oi.rows.map(r => r.productId),
      ...sl.rows.map(r => r.productId),
      ...pi.rows.map(r => r.productId)
    ]));

    console.log(`Preserving ${referencedIds.length} referenced products to maintain foreign key integrity.`);

    // 2. Clean up any weird names in referenced products
    await client.query(`
      UPDATE "Product"
      SET "name" = 'Zerodol-SP Tablet', "category" = 'Pain Relief', "price" = 115.0, "mrp" = 135.0, "description" = 'Aceclofenac + Paracetamol + Serratiopeptidase tablet for acute pain and inflammation relief.'
      WHERE "id" = 'cmrt7xbq904n6ys6y9a4dez7c';
    `);
    await client.query(`
      UPDATE "Product"
      SET "name" = 'Augmentin 625 Duo Tablet', "category" = 'Antibiotics', "price" = 204.0, "mrp" = 228.0, "description" = 'Amoxicillin + Clavulanic Acid broad-spectrum antibacterial tablet.'
      WHERE "id" = 'cmrt7xbq904ndys6ys6fc30qx';
    `);
    await client.query(`
      UPDATE "Product"
      SET "name" = 'Dolo 650 Tablet', "category" = 'Pain Relief', "price" = 31.0, "mrp" = 34.0, "description" = 'Paracetamol 650mg for fever and acute pain relief.'
      WHERE "id" = 'cmsc01ohk0006ibnl5u82jjd2';
    `);

    // 3. Delete unreferenced scrambled products
    console.log('Deleting unreferenced scrambled products...');
    const delRes = await client.query(
      `DELETE FROM "Product" WHERE "id" != ALL($1)`,
      [referencedIds]
    );
    console.log(`Deleted ${delRes.rowCount} scrambled products.`);

    // 4. Insert accurate products
    console.log(`Inserting ${ACCURATE_PRODUCTS.length} authentic, CDSCO-compliant medicines...`);
    for (const p of ACCURATE_PRODUCTS) {
      await client.query(`
        INSERT INTO "Product" (
          "id", "name", "brand", "salt", "composition", "category",
          "price", "mrp", "discount", "packSize", "manufacturer",
          "requiresPrescription", "isOTC", "isScheduleH1", "image",
          "description", "stock", "createdAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 100, NOW()
        )
      `, [
        `prod-${p.brand.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
        p.name,
        p.brand,
        p.salt,
        p.composition,
        p.category,
        p.price,
        p.mrp,
        p.discount,
        p.packSize,
        p.manufacturer,
        p.requiresPrescription,
        p.isOTC,
        p.isScheduleH1,
        p.image,
        p.description
      ]);
    }

    const finalCount = await client.query('SELECT count(*) FROM "Product"');
    console.log(`Reseeding complete! Total authentic products in database: ${finalCount.rows[0].count}`);

  } catch (err) {
    console.error('Reseed error:', err);
  } finally {
    await client.end();
  }
}

reseed();


const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding 100+ Homeopathic Medicines...");

  const baseMedicines = [
    "Aconitum Napellus", "Allium Cepa", "Antimonium Tartaricum", "Apis Mellifica", "Argentum Nitricum",
    "Arnica Montana", "Arsenicum Album", "Belladonna", "Bryonia Alba", "Calcarea Carbonica",
    "Calcarea Fluorica", "Calcarea Phosphorica", "Calendula Officinalis", "Cantharis", "Carbo Vegetabilis",
    "Causticum", "Chamomilla", "China Officinalis", "Cimicifuga Racemosa", "Cocculus Indicus",
    "Coffea Cruda", "Colocynthis", "Conium Maculatum", "Cuprum Metallicum", "Drosera Rotundifolia",
    "Dulcamara", "Eupatorium Perfoliatum", "Euphrasia Officinalis", "Ferrum Phosphoricum", "Gelsemium Sempervirens",
    "Glonoine", "Graphites", "Hamamelis Virginiana", "Hepar Sulphuris Calcareum", "Hypericum Perforatum",
    "Ignatia Amara", "Ipecacuanha", "Kali Bichromicum", "Kali Carbonicum", "Kali Phosphoricum",
    "Lachesis Muta", "Ledum Palustre", "Lycopodium Clavatum", "Magnesia Phosphorica", "Mercurius Solubilis",
    "Natrum Muriaticum", "Natrum Phosphoricum", "Natrum Sulphuricum", "Nitricum Acidum", "Nux Vomica",
    "Phosphorus", "Phytolacca Decandra", "Pulsatilla Pratensis", "Rhus Toxicodendron", "Ruta Graveolens",
    "Sanguinaria Canadensis", "Secale Cornutum", "Sepia Officinalis", "Silicea", "Spigelia Anthelmia",
    "Spongia Tosta", "Staphysagria", "Sulphur", "Symphytum Officinale", "Thuja Occidentalis",
    "Urtica Urens", "Veratrum Album", "Zincum Metallicum", "Agnus Castus", "Alumina",
    "Ambra Grisea", "Ammonium Carbonicum", "Anacardium Orientale", "Aurum Metallicum", "Baryta Carbonica",
    "Berberis Vulgaris", "Borax", "Cactus Grandiflorus", "Camphora", "Cannabis Sativa",
    "Capsicum Annuum", "Chelidonium Majus", "Cina", "Clematis Erecta", "Cyclamen Europaeum",
    "Digitalis Purpurea", "Equisetum Hyemale", "Ferrum Metallicum", "Fluoricum Acidum", "Helleborus Niger",
    "Hyoscyamus Niger", "Iris Versicolor", "Kreosotum", "Lilium Tigrinum", "Magnesia Carbonica",
    "Mezereum", "Murex Purpurea", "Oleander", "Opium", "Palladium"
  ];

  const brands = ["SBL", "Dr. Reckeweg", "Schwabe", "Adel", "Bakson's"];
  const potencies = ["30 CH", "200 CH", "1M"];
  
  let totalAdded = 0;

  for (let i = 0; i < baseMedicines.length; i++) {
    const baseName = baseMedicines[i];
    
    // Generate 1-2 variations for each base medicine
    const numVariations = i < 20 ? 2 : 1; // Create around 120 total products

    for (let j = 0; j < numVariations; j++) {
      const brand = brands[(i + j) % brands.length];
      const potency = potencies[(i + j) % potencies.length];
      const name = `${brand} ${baseName} Dilution ${potency}`;
      
      const mrp = Math.floor(Math.random() * 150) + 85; // 85 to 235
      const discount = Math.floor(Math.random() * 15) + 5; // 5 to 20
      const price = mrp - discount;

      const med = {
        name: name,
        description: `Highly effective homeopathic remedy - ${baseName}. Manufactured by ${brand}. Safe and natural healing.`,
        price: parseFloat(price.toFixed(2)),
        mrp: parseFloat(mrp.toFixed(2)),
        discount: parseFloat(discount.toFixed(2)),
        image: "https://www.netmeds.com/images/product-v1/600x600/834376/sbl_arnica_montana_dilution_30_ch_30_ml_0.jpg", // placeholder
        category: "Homeopathy",
        brand: brand,
        requiresPrescription: false,
        isOTC: true
      };

      const existing = await prisma.product.findFirst({ where: { name: med.name } });
      if (!existing) {
        await prisma.product.create({ data: med });
        totalAdded++;
        if (totalAdded % 10 === 0) {
            console.log(`+ Created ${totalAdded} products so far...`);
        }
      }
    }
  }

  console.log(`\nHomeopathy Seeding Complete! Added ${totalAdded} new medicines.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

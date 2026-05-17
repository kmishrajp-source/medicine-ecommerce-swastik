
const salts = [
    "Paracetamol","Amoxicillin","Cetirizine","Pantoprazole","Diclofenac",
    "Ibuprofen","Aceclofenac","Azithromycin","Cefixime","Metformin",
    "Glimepiride","Teneligliptin","Vildagliptin","Dapagliflozin","Sitagliptin"
];

const brands = [
    "Dolo","Calpol","Crocin","Pan","Pantocid","Cetzine","Okacet","Zyrtec",
    "Voveran","Dynapar","Combiflam","Brufen","Zerodol","Hifenac","Acenac"
];

const dosages = ["500mg","650mg","100mg","200mg","250mg","400mg","40mg","20mg","10mg"];

const categories = ["General","Pain Relief","Antibiotics","Supplements","Diabetes"];

function generateCSV() {
    let csv = "id,name,description,price,image,category,requiresPrescription,stock,salt,manufacturer,mrp,discount,isOTC\n";
    
    for (let i = 0; i < 1000; i++) {
        const salt = salts[Math.floor(Math.random() * salts.length)];
        const brand = brands[Math.floor(Math.random() * brands.length)];
        const dose = dosages[Math.floor(Math.random() * dosages.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const price = Math.floor(Math.random() * 800) + 20;
        const discount = Math.floor(Math.random() * 25);
        const name = `${brand} ${dose} Batch ${i}`;
        const isRx = ["Antibiotics","Diabetes"].includes(category);
        const id = `prod_${i}`;
        const desc = `${name} contains ${salt}. Premium quality medicine.`;
        const img = `https://images.unsplash.com/photo-1584308666744-24d59b298f0d?auto=format&fit=crop&w=200&q=80`;
        const manu = "Swastik Pharma Labs";
        const mrp = Math.floor(price * 1.2);

        csv += `"${id}","${name}","${desc}",${price},"${img}","${category}",${isRx},100,"${salt}","${manu}",${mrp},${discount},${!isRx}\n`;
    }
    return csv;
}

const fs = require('fs');
fs.writeFileSync('medicine-directory.csv', generateCSV());
console.log('✅ Generated medicine-directory.csv');

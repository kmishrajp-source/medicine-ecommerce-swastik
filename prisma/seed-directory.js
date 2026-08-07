const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const stockists = [
  { agencyName: "Gupta Medical Agency", ownerName: "Ramesh Gupta", phone: "9415100001", address: "Golghar, Near Clock Tower", city: "Gorakhpur", pincode: "273001", state: "Uttar Pradesh", speciality: "General Medicines", licenseNumber: "UP-GKP-STK-001", source: "field_agent" },
  { agencyName: "Shree Ram Medical Distributors", ownerName: "Suresh Ram", phone: "9415100002", address: "Civil Lines, Medical Square", city: "Gorakhpur", pincode: "273001", state: "Uttar Pradesh", speciality: "Surgical & General", licenseNumber: "UP-GKP-STK-002", source: "field_agent" },
  { agencyName: "Agarwal Pharma Stockist", ownerName: "Dinesh Agarwal", phone: "9415100003", address: "Padrauna Road, Sahjanwa", city: "Gorakhpur", pincode: "273209", state: "Uttar Pradesh", speciality: "Chronic Disease Medicines", licenseNumber: "UP-GKP-STK-003", source: "field_agent" },
  { agencyName: "Mishra Brothers Medical", ownerName: "Santosh Mishra", phone: "9415100004", address: "Mohaddipur, Main Market", city: "Gorakhpur", pincode: "273008", state: "Uttar Pradesh", speciality: "General & Pediatric", licenseNumber: "UP-GKP-STK-004", source: "field_agent" },
  { agencyName: "Bajaj Medical Agency", ownerName: "Vijay Bajaj", phone: "9415100005", address: "Betiahata Chowk", city: "Gorakhpur", pincode: "273001", state: "Uttar Pradesh", speciality: "Cardiology & Diabetes", licenseNumber: "UP-GKP-STK-005", source: "field_agent" },
  { agencyName: "Kumar Medical Stockist", ownerName: "Rajesh Kumar", phone: "9415100006", address: "Unaula Market, Shahpur", city: "Gorakhpur", pincode: "273006", state: "Uttar Pradesh", speciality: "General Medicines", licenseNumber: "UP-GKP-STK-006", source: "field_agent" },
  { agencyName: "Sharma Pharma House", ownerName: "Alok Sharma", phone: "9415100007", address: "Rapti Nagar, Phase 2", city: "Gorakhpur", pincode: "273016", state: "Uttar Pradesh", speciality: "Oncology & Specialty", licenseNumber: "UP-GKP-STK-007", source: "field_agent" },
  { agencyName: "Singh Medical Distributors", ownerName: "Ajay Pratap Singh", phone: "9415100008", address: "Taramandal Road, Gorakhpur", city: "Gorakhpur", pincode: "273015", state: "Uttar Pradesh", speciality: "Orthopedic & Pain", licenseNumber: "UP-GKP-STK-008", source: "field_agent" },
  { agencyName: "Varshney Drug House", ownerName: "Mukesh Varshney", phone: "9415100009", address: "Railway Road, Near Platform", city: "Gorakhpur", pincode: "273012", state: "Uttar Pradesh", speciality: "General Medicines", licenseNumber: "UP-GKP-STK-009", source: "field_agent" },
  { agencyName: "Pandey Medical Store & Stockist", ownerName: "Ravi Pandey", phone: "9415100010", address: "Pipraich Road, Pipraich", city: "Gorakhpur", pincode: "273152", state: "Uttar Pradesh", speciality: "General & Veterinary", licenseNumber: "UP-GKP-STK-010", source: "field_agent" },
  // Deoria
  { agencyName: "Deoria Medical Agency", ownerName: "Ram Naresh Yadav", phone: "9450200001", address: "Collectorate Road, Deoria", city: "Deoria", pincode: "274001", state: "Uttar Pradesh", speciality: "General Medicines", licenseNumber: "UP-DEO-STK-001", source: "field_agent" },
  { agencyName: "Pathak Brothers Pharma", ownerName: "Hari Pathak", phone: "9450200002", address: "Station Road, Deoria", city: "Deoria", pincode: "274001", state: "Uttar Pradesh", speciality: "General & Chronic", licenseNumber: "UP-DEO-STK-002", source: "field_agent" },
  // Basti
  { agencyName: "Basti Pharma Distributors", ownerName: "Sanjay Tiwari", phone: "9839300001", address: "Civil Lines, Basti", city: "Basti", pincode: "272001", state: "Uttar Pradesh", speciality: "General Medicines", licenseNumber: "UP-BST-STK-001", source: "field_agent" },
  { agencyName: "Tripathi Medical Agency", ownerName: "Akhilesh Tripathi", phone: "9839300002", address: "Collector Ganj, Basti", city: "Basti", pincode: "272001", state: "Uttar Pradesh", speciality: "Surgical Items", licenseNumber: "UP-BST-STK-002", source: "field_agent" },
  // Maharajganj
  { agencyName: "Maharajganj Drug Agency", ownerName: "Kamlesh Srivastava", phone: "9415400001", address: "Sadar Bazar, Maharajganj", city: "Maharajganj", pincode: "273303", state: "Uttar Pradesh", speciality: "General Medicines", licenseNumber: "UP-MRJ-STK-001", source: "field_agent" },
  // Kushinagar
  { agencyName: "Kushinagar Medical Traders", ownerName: "Pramod Gupta", phone: "9415500001", address: "Padrauna Chowk, Kushinagar", city: "Kushinagar", pincode: "274304", state: "Uttar Pradesh", speciality: "General Medicines", licenseNumber: "UP-KSN-STK-001", source: "field_agent" },
  // Lucknow
  { agencyName: "Lucknow Pharma Stockist", ownerName: "Anil Mehta", phone: "9415600001", address: "Aminabad Market, Lucknow", city: "Lucknow", pincode: "226018", state: "Uttar Pradesh", speciality: "Specialty Medicines", licenseNumber: "UP-LKO-STK-001", source: "field_agent" },
  { agencyName: "Capital Medical Agency", ownerName: "Pradeep Srivastava", phone: "9415600002", address: "Hazratganj, Lucknow", city: "Lucknow", pincode: "226001", state: "Uttar Pradesh", speciality: "General & Oncology", licenseNumber: "UP-LKO-STK-002", source: "field_agent" },
];

const distributors = [
  // Gorakhpur
  { companyName: "Eastern UP Pharma Distributors Pvt Ltd", ownerName: "Vivek Agarwal", phone: "9415700001", address: "Industrial Area, Gorakhpur", city: "Gorakhpur", pincode: "273001", state: "Uttar Pradesh", drugLicenseNo: "UP-GKP-DIS-001", brands: "Sun Pharma;Cipla;GSK;Abbott", coverageArea: "Gorakhpur;Deoria;Kushinagar;Maharajganj", source: "field_agent" },
  { companyName: "Gorakhpur Medical Distributors", ownerName: "Sunil Kesharwani", phone: "9415700002", address: "Golghar Industrial Zone", city: "Gorakhpur", pincode: "273001", state: "Uttar Pradesh", drugLicenseNo: "UP-GKP-DIS-002", brands: "Alkem;Mankind;Lupin;Zydus", coverageArea: "Gorakhpur;Basti;Siddharthnagar", source: "field_agent" },
  { companyName: "North India Pharma Corp", ownerName: "Ashok Bansal", phone: "9415700003", address: "Transport Nagar, Gorakhpur", city: "Gorakhpur", pincode: "273008", state: "Uttar Pradesh", drugLicenseNo: "UP-GKP-DIS-003", brands: "Pfizer;Sanofi;Novartis;AstraZeneca", coverageArea: "Eastern UP;Bihar Border", source: "field_agent" },
  { companyName: "Swastik Medical Distributors", ownerName: "Hemant Lal Gupta", phone: "9415700004", address: "Mohaddipur Warehouse, Gorakhpur", city: "Gorakhpur", pincode: "273008", state: "Uttar Pradesh", drugLicenseNo: "UP-GKP-DIS-004", brands: "Mankind;Intas;Torrent;Cadila", coverageArea: "Gorakhpur;Deoria;Padrauna", source: "field_agent" },
  { companyName: "Radhika Pharma Distribution", ownerName: "Rakesh Chandra", phone: "9415700005", address: "Sahjanwa Road, Gorakhpur", city: "Gorakhpur", pincode: "273209", state: "Uttar Pradesh", drugLicenseNo: "UP-GKP-DIS-005", brands: "Abbott;Dr Reddy;Cipla;Glaxo", coverageArea: "Gorakhpur;Siddharthnagar;Basti", source: "field_agent" },
  { companyName: "Maa Vaishno Drug Distributors", ownerName: "Shiv Shankar Yadav", phone: "9415700006", address: "Jungle Dhusad, Gorakhpur", city: "Gorakhpur", pincode: "273004", state: "Uttar Pradesh", drugLicenseNo: "UP-GKP-DIS-006", brands: "Generic;Branded;OTC;Surgical", coverageArea: "Gorakhpur Rural;Villages", source: "field_agent" },
  // Deoria
  { companyName: "Deoria Pharma House", ownerName: "Ramesh Prasad Yadav", phone: "9450800001", address: "Sadar Market, Deoria", city: "Deoria", pincode: "274001", state: "Uttar Pradesh", drugLicenseNo: "UP-DEO-DIS-001", brands: "Mankind;Cipla;Sun Pharma", coverageArea: "Deoria;Kushinagar;Padrauna", source: "field_agent" },
  // Basti
  { companyName: "Basti Drug House Pvt Ltd", ownerName: "Shyam Narayan", phone: "9839900001", address: "Indl Area, Basti", city: "Basti", pincode: "272001", state: "Uttar Pradesh", drugLicenseNo: "UP-BST-DIS-001", brands: "Lupin;Alkem;Intas;Zuventus", coverageArea: "Basti;Siddharthnagar;Ambedkarnagar", source: "field_agent" },
  // Varanasi
  { companyName: "Kashi Pharma Distributors", ownerName: "Praveen Chaturvedi", phone: "9415900001", address: "Lanka, Varanasi", city: "Varanasi", pincode: "221005", state: "Uttar Pradesh", drugLicenseNo: "UP-VNS-DIS-001", brands: "Cipla;Sun;Zydus;Torrent;GSK", coverageArea: "Varanasi;Jaunpur;Ghazipur;Mirzapur", source: "field_agent" },
  // Lucknow
  { companyName: "UP State Pharma Distributors Ltd", ownerName: "Manoj Tiwari", phone: "9415900002", address: "Vibhuti Khand, Gomti Nagar, Lucknow", city: "Lucknow", pincode: "226010", state: "Uttar Pradesh", drugLicenseNo: "UP-LKO-DIS-001", brands: "Pfizer;Abbott;Novartis;Merck;GSK", coverageArea: "All UP Districts", source: "field_agent" },
  { companyName: "Capital City Medicines Pvt Ltd", ownerName: "Deepak Shukla", phone: "9415900003", address: "Aliganj Industrial, Lucknow", city: "Lucknow", pincode: "226024", state: "Uttar Pradesh", drugLicenseNo: "UP-LKO-DIS-002", brands: "Mankind;Lupin;Alkem;Cipla;Intas", coverageArea: "Lucknow;Unnao;Sitapur;Hardoi", source: "field_agent" },
  // Maharajganj
  { companyName: "Indo Nepal Pharma Distributors", ownerName: "Binod Chaudhary", phone: "9451000001", address: "Nautanwa Road, Maharajganj", city: "Maharajganj", pincode: "273303", state: "Uttar Pradesh", drugLicenseNo: "UP-MRJ-DIS-001", brands: "Generic;Ayurvedic;OTC;Branded", coverageArea: "Maharajganj;Nepal Border Areas", source: "field_agent" },
];

async function main() {
  console.log('🌱 Seeding Stockist Directory...');
  let stockistCreated = 0;
  for (const s of stockists) {
    await prisma.stockistDirectory.create({ data: s }).catch(e => console.log(`  ⚠️ Skip: ${s.agencyName} - ${e.message.split('\n')[0]}`));
    stockistCreated++;
    process.stdout.write(`\r  ✅ ${stockistCreated}/${stockists.length} stockists`);
  }
  console.log(`\n✅ Stockist Directory: ${stockistCreated} entries added`);

  console.log('\n🌱 Seeding Distributor Directory...');
  let distCreated = 0;
  for (const d of distributors) {
    await prisma.distributor.create({ data: d }).catch(e => console.log(`  ⚠️ Skip: ${d.companyName} - ${e.message.split('\n')[0]}`));
    distCreated++;
    process.stdout.write(`\r  ✅ ${distCreated}/${distributors.length} distributors`);
  }
  console.log(`\n✅ Distributor Directory: ${distCreated} entries added`);

  console.log('\n🎉 Seed complete!');
  console.log(`   📦 ${stockistCreated} Stockists across Gorakhpur, Deoria, Basti, Lucknow, Varanasi`);
  console.log(`   🚚 ${distCreated} Distributors covering Eastern UP and major cities`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

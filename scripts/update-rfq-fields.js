const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'lib', 'healthmart', 'categories.js');
let code = fs.readFileSync(filePath, 'utf8');

const target = `    rfqFields: [
      { name: "medicineType", label: "Medicine Classification", type: "select", options: ["Generic Formulations", "Branded Medicines", "Bulk Institutional Supply", "OTC Healthcare Products"], required: true },
      { name: "prescriptionAvailable", label: "Do you have a valid Doctor's Prescription?", type: "select", options: ["Yes - Valid Prescription Ready", "No - OTC Only", "Institutional Purchase Order"], required: true },
      { name: "orderType", label: "Procurement Type", type: "select", options: ["Individual Patient Order", "Pharmacy Bulk Restocking", "Hospital / Nursing Home Supply", "Clinic Supply"], required: true },
      { name: "packSize", label: "Pack Size or Units Required", type: "text", placeholder: "e.g., 50 strips, 500 bottles, 10,000 tablets", required: true }
    ],`;

const replacement = `    rfqFields: [
      { name: "medicineType", label: "Medicine Classification", type: "select", options: ["Generic Formulations", "Branded Medicines", "Bulk Institutional Supply", "OTC Healthcare Products"], required: true },
      { name: "dosageForm", label: "Dosage Form", type: "select", options: ["Tablets", "Capsules", "Syrup / Suspension", "Injection / Infusion", "Ointment / Topical Gel", "Eye / Ear Drops", "Inhaler / Respules", "Other"], required: true },
      { name: "strength", label: "Strength / Concentration", type: "text", placeholder: "e.g., 500mg, 650mg, 10mg/5ml, 1gm", required: true },
      { name: "prescriptionAvailable", label: "Do you have a valid Doctor's Prescription?", type: "select", options: ["Yes - Valid Prescription Ready", "No - OTC Only", "Institutional Purchase Order"], required: true },
      { name: "orderType", label: "Procurement Type", type: "select", options: ["Individual Patient Order", "Pharmacy Bulk Restocking", "Hospital / Nursing Home Supply", "Clinic Supply"], required: true },
      { name: "packSize", label: "Pack Size or Units Required", type: "text", placeholder: "e.g., 50 strips, 500 bottles, 10,000 tablets", required: true }
    ],`;

if (!code.includes('Dosage Form')) {
  const normCode = code.replace(/\r\n/g, '\n');
  const normTarget = target.replace(/\r\n/g, '\n');
  const normReplacement = replacement.replace(/\r\n/g, '\n');
  const updated = normCode.replace(normTarget, normReplacement);
  fs.writeFileSync(filePath, updated, 'utf8');
  console.log('categories.js updated successfully!');
} else {
  console.log('Already updated.');
}


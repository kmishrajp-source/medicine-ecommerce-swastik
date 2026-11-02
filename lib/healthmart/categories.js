/**
 * Swastik HealthMart — Master Category Definitions & Configuration
 * 
 * Defines the 13 unified healthcare marketplace categories with their
 * specific workflows, credential requirements, comparison fields, and RFQ schemas.
 */

export const HEALTHMART_CATEGORIES = [
  {
    id: "cat-pharmacy",
    slug: "pharmacy-and-medicines",
    name: "Pharmacies & Permitted Medicines",
    description: "Licensed retail pharmacies, wholesale distributors, bulk medicines, and generic formulations.",
    serviceType: "pharmacy",
    icon: "fa-solid fa-pills",
    badge: "Drug License Regulated",
    requiredCredentials: ["State Drug License (Form 20/21)", "GST Registration", "Pharmacist Registration Number"],
    permittedWorkflow: "CATALOG_AND_RFQ",
    supportsQuotationComparison: true,
    supportsDirectBooking: true,
    supportsOnlinePayment: true,
    requiresManualConfirmation: true,
    applicableLocationRules: { defaultRadiusKm: 15, interCitySupported: true },
    rfqFields: [
      { name: "medicineType", label: "Medicine Classification", type: "select", options: ["Generic Formulations", "Branded Medicines", "Bulk Institutional Supply", "OTC Healthcare Products"], required: true },
      { name: "dosageForm", label: "Dosage Form", type: "select", options: ["Tablets", "Capsules", "Syrup / Suspension", "Injection / Infusion", "Ointment / Topical Gel", "Eye / Ear Drops", "Inhaler / Respules", "Other"], required: true },
      { name: "strength", label: "Strength / Concentration", type: "text", placeholder: "e.g., 500mg, 650mg, 10mg/5ml, 1gm", required: true },
      { name: "prescriptionAvailable", label: "Do you have a valid Doctor's Prescription?", type: "select", options: ["Yes - Valid Prescription Ready", "No - OTC Only", "Institutional Purchase Order"], required: true },
      { name: "orderType", label: "Procurement Type", type: "select", options: ["Individual Patient Order", "Pharmacy Bulk Restocking", "Hospital / Nursing Home Supply", "Clinic Supply"], required: true },
      { name: "packSize", label: "Pack Size or Units Required", type: "text", placeholder: "e.g., 50 strips, 500 bottles, 10,000 tablets", required: true }
    ],
    isActive: true,
    sortOrder: 1
  },
  {
    id: "cat-doctors",
    slug: "doctors-and-clinics",
    name: "Doctors & Clinical Practices",
    description: "Verified specialist physicians, polyclinics, teleconsultants, and second-opinion panels.",
    serviceType: "doctor",
    icon: "fa-solid fa-user-doctor",
    badge: "Medical Council Verified",
    requiredCredentials: ["NMC / State Medical Council Registration", "MBBS / MD / MS Degree Certificate", "Clinical Establishment Act Registration"],
    permittedWorkflow: "CONSULTATION_AND_RFQ",
    supportsQuotationComparison: true,
    supportsDirectBooking: true,
    supportsOnlinePayment: true,
    requiresManualConfirmation: true,
    applicableLocationRules: { defaultRadiusKm: 30, teleconsultPanIndia: true },
    rfqFields: [
      { name: "specialty", label: "Medical Specialty Needed", type: "select", options: ["Cardiology", "Neurology", "Orthopedics", "Gynecology & Obstetrics", "Pediatrics", "Dermatology", "General Medicine", "Oncology", "Psychiatry", "ENT"], required: true },
      { name: "consultationMode", label: "Consultation Preference", type: "select", options: ["In-Clinic Visit", "Video Teleconsultation", "Second Opinion Panel", "Corporate Doctor On-Site"], required: true },
      { name: "timeframe", label: "Preferred Schedule", type: "select", options: ["Today / Urgent", "Within 48 Hours", "This Week", "Routine Appointment"], required: true },
      { name: "patientBrief", label: "Brief Symptoms / Consultation Objective", type: "textarea", placeholder: "Do not submit sensitive records without doctor consent. State general condition.", required: true }
    ],
    isActive: true,
    sortOrder: 2
  },
  {
    id: "cat-laboratories",
    slug: "diagnostic-laboratories",
    name: "Diagnostic Laboratories & Pathology",
    description: "NABL/NABH accredited diagnostics, routine blood tests, molecular testing, and health check packages.",
    serviceType: "laboratory",
    icon: "fa-solid fa-flask-vial",
    badge: "NABL / Quality Assured",
    requiredCredentials: ["Clinical Establishment License", "Pathologist MCI Registration", "NABL / NABH Accreditation Certificate (if claimed)"],
    permittedWorkflow: "RFQ_AND_QUOTE",
    supportsQuotationComparison: true,
    supportsDirectBooking: true,
    supportsOnlinePayment: true,
    requiresManualConfirmation: true,
    applicableLocationRules: { defaultRadiusKm: 25, homeCollectionSupported: true },
    rfqFields: [
      { name: "testCategory", label: "Test or Investigation Category", type: "select", options: ["Routine Blood Chemistry (CBC, LFT, KFT, Lipid)", "Cardiac & Diabetes Panels", "Thyroid & Hormone Profiles", "Molecular / Genetic Testing", "Corporate Health Screening Package", "Radiology / Imaging (X-Ray, Ultrasound, CT, MRI)"], required: true },
      { name: "collectionType", label: "Sample Collection Mode", type: "select", options: ["Home Sample Collection Required", "Lab Walk-In Visit", "Institutional Camp at Workplace / Community"], required: true },
      { name: "participantCount", label: "Number of Individuals for Testing", type: "number", placeholder: "e.g., 1 (individual) or 50 (corporate screening)", required: true },
      { name: "preferredDate", label: "Preferred Date of Collection", type: "date", required: true }
    ],
    isActive: true,
    sortOrder: 3
  },
  {
    id: "cat-hospitals",
    slug: "hospitals-and-nursing-homes",
    name: "Hospitals & Multi-Specialty Centers",
    description: "NABH-accredited hospitals, surgical nursing homes, ICU bed availability, and institutional tie-ups.",
    serviceType: "hospital",
    icon: "fa-solid fa-hospital",
    badge: "NABH / Regulated Facility",
    requiredCredentials: ["State Health Dept License", "Fire Safety NOC", "Pollution Control Board Biomedical Waste Authorization", "NABH Accreditation"],
    permittedWorkflow: "RFQ_AND_QUOTE",
    supportsQuotationComparison: true,
    supportsDirectBooking: false,
    supportsOnlinePayment: false,
    requiresManualConfirmation: true,
    applicableLocationRules: { defaultRadiusKm: 50, interStateSupported: true },
    rfqFields: [
      { name: "facilityNeed", label: "Requirement Scope", type: "select", options: ["Planned Surgery / Procedure Package", "ICU / HDU Bed Reservation", "Corporate Healthcare Empanelment", "Maternity / Day Care Package", "Third-Party Hospital Service Contract"], required: true },
      { name: "roomCategory", label: "Desired Room / Ward Tier", type: "select", options: ["General Ward", "Semi-Private Room", "Private Deluxe Room", "ICU / CCU Support", "Not Applicable / Corporate Tier"], required: true },
      { name: "insuranceCoverage", label: "TPA / Insurance Policy Type", type: "select", options: ["Cashless Health Insurance", "Reimbursement Policy", "Ayushman Bharat / PMJAY", "Corporate Direct Billing", "Self Pay"], required: true }
    ],
    isActive: true,
    sortOrder: 4
  },
  {
    id: "cat-ambulances",
    slug: "ambulance-and-medical-transport",
    name: "Ambulance & Medical Transport",
    description: "Scheduled non-emergency patient transfer, ICU on wheels, air ambulance coordination, and events medical standbys.",
    serviceType: "ambulance",
    icon: "fa-solid fa-truck-medical",
    badge: "Transport & RTO Certified",
    requiredCredentials: ["Commercial Vehicle Fitness & RTO Permit", "Ambulance Fitment Certification", "EMT / Paramedic Staff Credentials"],
    permittedWorkflow: "EMERGENCY_OR_RFQ",
    supportsQuotationComparison: true,
    supportsDirectBooking: true,
    supportsOnlinePayment: true,
    requiresManualConfirmation: true,
    applicableLocationRules: { defaultRadiusKm: 100, interCitySupported: true },
    rfqFields: [
      { name: "urgencyTier", label: "Medical Urgency Notice", type: "select", options: ["NON-EMERGENCY: Planned Hospital Transfer", "NON-EMERGENCY: Intercity Patient Relocation", "NON-EMERGENCY: Discharge to Home", "EVENT STANDBY: Corporate / Sports Gathering"], required: true },
      { name: "ambulanceType", label: "Vehicle Equipment Level", type: "select", options: ["Basic Life Support (BLS with Oxygen)", "Advance Life Support (ALS with Ventilator & Defibrillator)", "ICU on Wheels with Doctor on Board", "Patient Transport Vehicle (Wheelchair/Stretcher)"], required: true },
      { name: "pickupLocation", label: "Exact Pickup Address / Hospital", type: "text", required: true },
      { name: "destinationLocation", label: "Destination Hospital or Residence", type: "text", required: true },
      { name: "transferDate", label: "Scheduled Transfer Date & Time", type: "datetime-local", required: true }
    ],
    isActive: true,
    sortOrder: 5
  },
  {
    id: "cat-home-healthcare",
    slug: "home-healthcare-providers",
    name: "Home Healthcare & Nursing Services",
    description: "Qualified home nurses, post-operative care, elderly care attendants, home physiotherapy, and palliative care.",
    serviceType: "home_healthcare",
    icon: "fa-solid fa-house-chimney-medical",
    badge: "Agency Background Checked",
    requiredCredentials: ["Agency Registration Certificate", "GNM/B.Sc Nursing Staff Verification", "Police Verification of Caregivers"],
    permittedWorkflow: "RFQ_AND_QUOTE",
    supportsQuotationComparison: true,
    supportsDirectBooking: true,
    supportsOnlinePayment: true,
    requiresManualConfirmation: true,
    applicableLocationRules: { defaultRadiusKm: 30 },
    rfqFields: [
      { name: "careType", label: "Required Caregiver Type", type: "select", options: ["Registered Nurse (GNM / B.Sc)", "General Patient Attendant (Semi-Skilled)", "Senior Citizen Care Companion", "Home Physiotherapist", "Post-Stroke Rehabilitation"], required: true },
      { name: "shiftDuration", label: "Shift Requirement", type: "select", options: ["12 Hours Day Shift", "12 Hours Night Shift", "24 Hours Live-In Care", "Per-Visit (1 to 2 hours)"], required: true },
      { name: "contractDuration", label: "Expected Duration of Care", type: "select", options: ["1 to 7 Days", "1 to 4 Weeks", "1 to 3 Months", "Long-Term (Over 3 Months)"], required: true }
    ],
    isActive: true,
    sortOrder: 6
  },
  {
    id: "cat-ayurveda",
    slug: "ayurveda-services",
    name: "Ayurveda & Panchakarma Centers",
    description: "Certified BAMS practitioners, authentic Panchakarma centers, and classical Ayurvedic wellness therapy.",
    serviceType: "ayurveda",
    icon: "fa-solid fa-spa",
    badge: "AYUSH Ministry Certified",
    requiredCredentials: ["BAMS Degree & State Ayurvedic Board Registration", "AYUSH Manufacturing / Clinical License"],
    permittedWorkflow: "RFQ_AND_QUOTE",
    supportsQuotationComparison: true,
    supportsDirectBooking: true,
    supportsOnlinePayment: false,
    requiresManualConfirmation: true,
    applicableLocationRules: { defaultRadiusKm: 40 },
    rfqFields: [
      { name: "therapyType", label: "Ayurvedic Treatment Focus", type: "select", options: ["Panchakarma Detox Program", "Chronic Joint & Spine Care (Sandhigata Vata)", "Digestive & Metabolic Disorders", "Skin & Lifestyle Management", "General Consultation with BAMS Vaidya"], required: true },
      { name: "treatmentLocation", label: "Facility Preference", type: "select", options: ["Ayurvedic Hospital / Inpatient Center", "Outpatient Clinic Visit", "Therapist Home Visit"], required: true }
    ],
    isActive: true,
    sortOrder: 7
  },
  {
    id: "cat-homeopathy",
    slug: "homeopathy-services",
    name: "Homeopathy Clinics & Formulations",
    description: "Registered BHMS doctors, classical constitutional treatment, and genuine German/Indian dilution suppliers.",
    serviceType: "homeopathy",
    icon: "fa-solid fa-leaf",
    badge: "Central Council Homeopathy",
    requiredCredentials: ["BHMS Degree & State Homeopathic Board Registration", "Homeopathic Drug Sale License"],
    permittedWorkflow: "RFQ_AND_QUOTE",
    supportsQuotationComparison: true,
    supportsDirectBooking: true,
    supportsOnlinePayment: true,
    requiresManualConfirmation: true,
    applicableLocationRules: { defaultRadiusKm: 30 },
    rfqFields: [
      { name: "conditionFocus", label: "Health Concern", type: "select", options: ["Pediatric & Immunity Support", "Allergies & Respiratory Asthma", "Chronic Skin Conditions", "Hair & Hormonal Balance", "General Classical Consultation"], required: true },
      { name: "consultationMode", label: "Preferred Mode", type: "select", options: ["In-Clinic Doctor Consultation", "Online Video Consult + Medicine Courier"], required: true }
    ],
    isActive: true,
    sortOrder: 8
  },
  {
    id: "cat-medical-equipment",
    slug: "medical-equipment-and-supplies",
    name: "Medical Equipment & Hospital Supplies",
    description: "Surgical instruments, ICU monitors, oxygen concentrators, hospital beds, diagnostic devices, and disposables.",
    serviceType: "medical_equipment",
    icon: "fa-solid fa-stethoscope",
    badge: "CDSCO / ISO Certified",
    requiredCredentials: ["CDSCO Medical Device Import / Wholesale License", "ISO 13485 Certification", "GST Registration", "OEM Authorized Dealership"],
    permittedWorkflow: "RFQ_AND_QUOTE",
    supportsQuotationComparison: true,
    supportsDirectBooking: false,
    supportsOnlinePayment: false,
    requiresManualConfirmation: true,
    applicableLocationRules: { defaultRadiusKm: 500, panIndiaSupplies: true },
    rfqFields: [
      { name: "equipmentCategory", label: "Equipment Category", type: "select", options: ["ICU & Critical Care Equipment (Monitors, Defibrillators, Syringe Pumps)", "Hospital Furniture (ICU Electric Beds, OT Tables, Wheelchairs)", "Oxygen & Respiratory Therapy (Concentrators, BiPAP/CPAP, Cylinders)", "Diagnostic & Laboratory Analyzers", "Surgical Disposables & Consumables", "Home Patient Mobility Aids"], required: true },
      { name: "specifications", label: "Technical Specifications / Brand Preference", type: "textarea", placeholder: "Specify model, power input, FDA/CE compliance, or exact technical requirements", required: true },
      { name: "quantity", label: "Quantity Required", type: "number", placeholder: "e.g., 5 units, 20 beds, 500 kits", required: true },
      { name: "warrantyRequirement", label: "Warranty Expectation", type: "select", options: ["1 Year Standard Warranty", "2 to 3 Years Comprehensive Warranty", "Extended AMC / CMC Required", "Consumable / No Warranty"], required: true },
      { name: "installationRequired", label: "On-Site Installation & Training Required?", type: "select", options: ["Yes - Installation, Calibration & Staff Training Required", "No - Self Installation / Plug & Play"], required: true },
      { name: "budgetRange", label: "Estimated Budget Range (INR)", type: "select", options: ["Under ₹25,000", "₹25,000 to ₹1,00,000", "₹1,00,000 to ₹5,00,000", "₹5,00,000 to ₹25,00,000", "Above ₹25,00,000"], required: false }
    ],
    isActive: true,
    sortOrder: 9
  },
  {
    id: "cat-staffing",
    slug: "healthcare-staffing",
    name: "Healthcare Staffing & Manpower",
    description: "Recruitment of registered doctors, staff nurses, lab technicians, pharmacists, hospital ward boys, and admin staff.",
    serviceType: "staffing",
    icon: "fa-solid fa-user-group",
    badge: "Licensed Manpower Agency",
    requiredCredentials: ["Private Security / Staffing Agency License", "Labour Department Registration", "EPF & ESI Compliance Code"],
    permittedWorkflow: "RFQ_AND_QUOTE",
    supportsQuotationComparison: true,
    supportsDirectBooking: false,
    supportsOnlinePayment: false,
    requiresManualConfirmation: true,
    applicableLocationRules: { defaultRadiusKm: 250 },
    rfqFields: [
      { name: "cadreType", label: "Professional Cadre Required", type: "select", options: ["Duty Medical Officers (MBBS / AYUSH)", "ICU / OT Trained Staff Nurses (GNM / B.Sc)", "General Ward Nurses", "DMLT / Lab Technicians", "Registered Pharmacists", "Hospital Attendants & GDA Ward Staff"], required: true },
      { name: "headcount", label: "Number of Positions Needed", type: "number", placeholder: "e.g., 2, 10, 25", required: true },
      { name: "engagementModel", label: "Engagement Contract Model", type: "select", options: ["Permanent Placement / Recruitment Fee", "Contractual Outsourcing (Monthly Payroll)", "Locum / Temporary Coverage (1 to 3 months)"], required: true },
      { name: "shiftArrangement", label: "Duty Shifts Required", type: "select", options: ["Rotational 3-Shifts (24x7)", "Day Shifts Only", "Night Shifts Only"], required: true },
      { name: "expectedStartDate", label: "Expected Onboarding Date", type: "date", required: true }
    ],
    isActive: true,
    sortOrder: 10
  },
  {
    id: "cat-corporate",
    slug: "corporate-healthcare",
    name: "Corporate Healthcare & Occupational Health",
    description: "Annual executive health checkups, on-premise occupational health centers (OHC), wellness camps, and ER doctors.",
    serviceType: "corporate",
    icon: "fa-solid fa-briefcase-medical",
    badge: "Enterprise Empanelled",
    requiredCredentials: ["Corporate Wellness Empanelment", "Factories Act Medical Compliance Authority", "ISO 9001 / Healthcare Provider Accreditation"],
    permittedWorkflow: "RFQ_AND_QUOTE",
    supportsQuotationComparison: true,
    supportsDirectBooking: false,
    supportsOnlinePayment: false,
    requiresManualConfirmation: true,
    applicableLocationRules: { defaultRadiusKm: 500, panIndiaSupplies: true },
    rfqFields: [
      { name: "corporateScope", label: "Corporate Requirement Scope", type: "select", options: ["Annual Employee Health Checkup (AEC)", "On-Site Occupational Health Center (OHC) Setup", "Corporate Vaccination Drive", "Mental Wellness & Employee Assistance Program (EAP)", "Executive Preventive Health Screenings"], required: true },
      { name: "employeeCohortSize", label: "Total Employee / Participant Strength", type: "select", options: ["25 to 100 Employees", "101 to 500 Employees", "501 to 2,500 Employees", "2,500+ Multi-Location Workforce"], required: true },
      { name: "facilityLocations", label: "Workplace Locations / Factory Sites", type: "text", placeholder: "e.g., Gorakhpur Plant + Lucknow Head Office", required: true },
      { name: "serviceTimeline", label: "Execution Window / Target Month", type: "text", placeholder: "e.g., Q3 FY27 or November 2026", required: true }
    ],
    isActive: true,
    sortOrder: 11
  },
  {
    id: "cat-healthcare-it",
    slug: "healthcare-it-and-software",
    name: "Healthcare IT, EMR & Software",
    description: "Hospital Information Systems (HIS), ABDM M1/M2/M3 certified EMRs, pharmacy billing ERP, and telemetry solutions.",
    serviceType: "healthcare_it",
    icon: "fa-solid fa-laptop-medical",
    badge: "ABDM / HIPAA Compliant",
    requiredCredentials: ["ABDM Sandbox / Production Milestone Certificate", "ISO 27001 Information Security Certification", "CERT-In Audited"],
    permittedWorkflow: "RFQ_AND_QUOTE",
    supportsQuotationComparison: true,
    supportsDirectBooking: false,
    supportsOnlinePayment: false,
    requiresManualConfirmation: true,
    applicableLocationRules: { panIndiaSupplies: true },
    rfqFields: [
      { name: "softwareType", label: "Software Solution Category", type: "select", options: ["Hospital Information Management System (HIMS)", "ABDM Integrated Electronic Health Records (EHR)", "Diagnostic Lab Information Management System (LIMS)", "Retail & Wholesale Pharmacy Inventory ERP", "Telemedicine & Patient Portal Suite"], required: true },
      { name: "deploymentType", label: "Hosting Preference", type: "select", options: ["Cloud SaaS (Managed & High Availability)", "On-Premise Local Server", "Hybrid"], required: true },
      { name: "bedOrUserScale", label: "Hospital Bed Size or Daily Patient Volume", type: "text", placeholder: "e.g., 50 beds, 200 OPD footfalls/day", required: true }
    ],
    isActive: true,
    sortOrder: 12
  },
  {
    id: "cat-approved-services",
    slug: "approved-healthcare-business-services",
    name: "Approved Healthcare Business Services",
    description: "Biomedical waste management, hospital laundry/linen, radiation safety audits (AERB), and medical gas piping (MGPS).",
    serviceType: "business_services",
    icon: "fa-solid fa-shield-halved",
    badge: "State / AERB Certified",
    requiredCredentials: ["Pollution Control Board Authorization", "AERB Safety Officer Certification", "PESO Medical Gas License"],
    permittedWorkflow: "RFQ_AND_QUOTE",
    supportsQuotationComparison: true,
    supportsDirectBooking: false,
    supportsOnlinePayment: false,
    requiresManualConfirmation: true,
    applicableLocationRules: { defaultRadiusKm: 200 },
    rfqFields: [
      { name: "businessServiceType", label: "Specific Service Required", type: "select", options: ["Common Biomedical Waste Treatment Facility (CBWTF)", "AERB Radiation Safety Audit & Lead Shielding", "Medical Gas Pipeline System (MGPS) Annual Maintenance", "Hospital Infection Control & Specialized Sanitization", "NABH / NABL Accreditation Consultancy"], required: true },
      { name: "facilityType", label: "Your Healthcare Facility Profile", type: "select", options: ["Multi-Specialty Hospital (>100 beds)", "Nursing Home (20 to 50 beds)", "Diagnostic Imaging Center", "Dental / Day Care Clinic"], required: true },
      { name: "workScopeDetails", label: "Detailed Requirement Description", type: "textarea", required: true }
    ],
    isActive: true,
    sortOrder: 13
  }
];

export function getCategoryBySlug(slug) {
  return HEALTHMART_CATEGORIES.find(c => c.slug === slug) || null;
}

export function getCategoryById(id) {
  return HEALTHMART_CATEGORIES.find(c => c.id === id) || null;
}


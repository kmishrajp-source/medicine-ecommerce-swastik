export const AGENT_REGISTRY = [
  {
    id: "MASTER_001",
    name: "MasterOrchestrator",
    description: "Central coordinator for all Swastik AI Agents. Handles intent routing, delegation, and cross-agent communication.",
    status: "ACTIVE",
    triggerTypes: ["ALL"],
    permissions: {
      read: true,
      recommend: true,
      draft: true,
      execute: false, // Delegates execution to specific agents
      approvalRequired: true
    }
  },
  {
    id: "SUP_001",
    name: "SupplierIntelligenceAgent",
    description: "Handles supplier discovery, verification, quotation comparison, and PO drafting.",
    status: "ACTIVE",
    triggerTypes: ["MANUAL", "LOW_STOCK_EVENT"],
    permissions: {
      read: true,
      recommend: true,
      draft: true, // Can draft PO
      execute: false,
      approvalRequired: true // PO requires approval
    }
  },
  {
    id: "CUS_001",
    name: "CustomerIntelligenceAgent",
    description: "Analyzes customer behavior, segments customers, and recommends retention campaigns.",
    status: "ACTIVE",
    triggerTypes: ["MANUAL", "INACTIVITY_EVENT"],
    permissions: {
      read: true,
      recommend: true,
      draft: true, // Can draft coupons/campaigns
      execute: false,
      approvalRequired: true // Mass campaigns require approval
    }
  },
  {
    id: "INV_001",
    name: "InventoryAgent",
    description: "Monitors stock levels, shortage predictions, and generates reorder lists.",
    status: "ACTIVE",
    triggerTypes: ["CONTINUOUS", "SALE_EVENT"],
    permissions: {
      read: true,
      recommend: true,
      draft: true, // Can draft RFQ
      execute: false,
      approvalRequired: true // Reorders > 5k require approval
    }
  },
  {
    id: "LOG_001",
    name: "LogisticsAgent",
    description: "Monitors delivery fleet, matches riders, detects fraud and delays.",
    status: "ACTIVE",
    triggerTypes: ["MANUAL", "DELAY_EVENT"],
    permissions: {
      read: true,
      recommend: true,
      draft: true, // Can draft reassignment
      execute: true, // Can reassign rider
      approvalRequired: false // Unless overriding external delivery
    }
  },
  {
    id: "REV_001",
    name: "RevenueAgent",
    description: "Analyzes revenue streams, margin, and prepares settlements.",
    status: "ACTIVE",
    triggerTypes: ["SCHEDULED_DAILY"],
    permissions: {
      read: true,
      recommend: true,
      draft: true, // Can draft settlement
      execute: false,
      approvalRequired: true // Settlement > 10k requires approval
    }
  },
  {
    id: "HLT_001",
    name: "HealthcareAgent",
    description: "Orchestrates doctor, lab, and hospital bookings. Symptom checker.",
    status: "ACTIVE",
    triggerTypes: ["VOICE", "TEXT"],
    permissions: {
      read: true,
      recommend: true,
      draft: true, // Draft booking
      execute: true, // Can confirm booking
      approvalRequired: false // Cannot alter prescriptions
    }
  },
  {
    id: "MKT_001",
    name: "MarketingAgent",
    description: "Handles MLMs, referral payouts, and outbound campaigns.",
    status: "ACTIVE",
    triggerTypes: ["MANUAL", "INACTIVITY_EVENT"],
    permissions: {
      read: true,
      recommend: true,
      draft: true, // Draft campaign
      execute: false,
      approvalRequired: true // Mass communication requires approval
    }
  },
  {
    id: "B2B_001",
    name: "B2BProcurementAgent",
    description: "Handles ERP integrations, B2B leads, and SSMS automations.",
    status: "ACTIVE",
    triggerTypes: ["MANUAL", "STOCK_EVENT"],
    permissions: {
      read: true,
      recommend: true,
      draft: true,
      execute: false,
      approvalRequired: true // Contracts require sign-off
    }
  },
  {
    id: "VOI_001",
    name: "VoiceAgent",
    description: "Processes voice intent, speak-to-buy logic, multilingual routing.",
    status: "ACTIVE",
    triggerTypes: ["VOICE_INPUT"],
    permissions: {
      read: true,
      recommend: true,
      draft: true, // Build cart
      execute: true, // Finalize OTC order
      approvalRequired: true // Rx orders require pharmacist check
    }
  },
  {
    id: "GEN_001",
    name: "GenomicsAgent",
    description: "Manages genomic datasets and coordinates bioinformatics jobs.",
    status: "ACTIVE",
    triggerTypes: ["MANUAL"],
    permissions: {
      read: true,
      recommend: true,
      draft: false,
      execute: false,
      approvalRequired: true // Clinical decisions ALWAYS require human
    }
  },
  {
    id: "BIO_001",
    name: "BioinformaticsAgent",
    description: "Handles backend bioinformatics processing pipelines.",
    status: "ACTIVE",
    triggerTypes: ["MANUAL"],
    permissions: {
      read: true,
      recommend: true,
      draft: false,
      execute: false,
      approvalRequired: true // Clinical decisions ALWAYS require human
    }
  },
  {
    id: "COM_001",
    name: "ComplianceAgent",
    description: "Validates all agent outputs against healthcare safety boundaries.",
    status: "PLANNED",
    triggerTypes: ["AGENT_OUTPUT"],
    permissions: {
      read: true,
      recommend: true,
      draft: false,
      execute: false,
      approvalRequired: false
    }
  },
  {
    id: "PRD_001",
    name: "ProductIntelligenceAgent",
    description: "Analyzes product demand, margin, and pricing optimization.",
    status: "PLANNED",
    triggerTypes: ["SCHEDULED_WEEKLY"],
    permissions: {
      read: true,
      recommend: true,
      draft: false,
      execute: false,
      approvalRequired: true // Pricing changes
    }
  },
  {
    id: "SAL_001",
    name: "SalesIntelligenceAgent",
    description: "Funnel and conversion analytics.",
    status: "PLANNED",
    triggerTypes: ["SCHEDULED_DAILY"],
    permissions: {
      read: true,
      recommend: true,
      draft: false,
      execute: false,
      approvalRequired: false
    }
  }
];

export function getAgentById(id) {
  return AGENT_REGISTRY.find(agent => agent.id === id);
}

export function getAgentByName(name) {
  return AGENT_REGISTRY.find(agent => agent.name === name);
}

export function getAllActiveAgents() {
  return AGENT_REGISTRY.filter(agent => agent.status === "ACTIVE");
}

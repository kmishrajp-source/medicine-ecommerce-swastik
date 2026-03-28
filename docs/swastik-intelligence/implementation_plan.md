# Healthcare Lead Conversion System Implementation Plan

This system aims to convert healthcare leads (doctors/retailers) into active partners using CRM tools and WhatsApp automation.

## Proposed Changes

### [Component Name: Database Schema] [DONE]
#### [MODIFY] [schema.prisma](file:///c:/Users/hp/./gemini/antigravity/scratch/pharmacy-app/prisma/schema.prisma)
Extend `Lead` and `User` models:
- **User**: Add `AGENT` role.
- **Lead**: Add `area`, `assignedAgentId` (relation to User), `lastContactDate`, `source`.
- **New Model: PartnerRevenue**: Track `listing_fee` or `lead_fee` for partners.
- **New Model: WhatsAppBatch**: Track bulk messaging status.

---

### [Component Name: Dashboards] [DONE]
#### [NEW] [Agent Dashboard](file:///c:/Users/hp/./gemini/antigravity/scratch/pharmacy-app/app/[locale]/agent/dashboard/page.js)
- List of assigned leads.
- Quick Call/WhatsApp buttons.
- Status update & note taking.
- Performance stats (Conversions/Calls).

#### [NEW] [Admin CRM Dashboard](file:///c:/Users/hp/./gemini/antigravity/scratch/pharmacy-app/app/[locale]/admin/crm/page.js)
- Lead board with filtering by Agent/Area/Status.
- CSV Upload for leads.
- Analytics (Conversion %, Total Revenue).
- Agent Leaderboard.

---

### [Component Name: Payments & Contact Unlock] [DONE]
#### [NEW] [Razorpay Payment Component](file:///c:/Users/hp/./gemini/antigravity/scratch/pharmacy-app/components/RazorpayPayment.js)
- Reusable "Pay & Continue" button.
- Handles `amount`, `type` (unlock, lead, booking), and `targetId`.

#### [NEW] [Create Order API](file:///c:/Users/hp/./gemini/antigravity/scratch/pharmacy-app/app/api/create-order/route.js)
- Direct API to create Razorpay orders for all types.

#### [MODIFY] [Unified Payment Verification](file:///c:/Users/hp/./gemini/antigravity/scratch/pharmacy-app/app/api/verify-payment/route.js)
- Integrate `type="unlock"` to create `ContactUnlock` records.
- Integrate `type="lead"` to log publisher commissions.
- Ensure signature verification and financial logging via `lib/finance.js`.

---

### [Component Name: WhatsApp & CRM Automation] [DONE]
#### [NEW] [WhatsApp Webhook](file:///c:/Users/hp/./gemini/antigravity/scratch/pharmacy-app/app/api/whatsapp/webhook/route.js)
- Listener for incoming Meta/WATI/Twilio messages.
- Logic: If message contains "YES" -> update `Lead` status to `interested`.
- **Real-Time Tracking**: Handles `delivered` and `read` status callbacks.

#### [MODIFY] [Admin CRM Dashboard](file:///c:/Users/hp/./gemini/antigravity/scratch/pharmacy-app/app/[locale]/admin/crm/page.js)
- Added "WhatsApp Campaigns" table with Delivered/Read analytics.
- Integrated "Export CSV" and "Payment History" views.

---

### [Component Name: Premium Directory & Intelligence] [DONE]
#### [NEW] [Gorakhpur Clinic Directory](file:///c:/Users/hp/./gemini/antigravity/scratch/pharmacy-app/app/[locale]/gorakhpur/clinics/page.js)
- High-density layout mimicking Practo's UX.
- Symptom-based shortcuts (Medindia Style).
- Trust Score & Premium Verified Badges.

#### [NEW] [Verified Badge Component](file:///c:/Users/hp/./gemini/antigravity/scratch/pharmacy-app/components/VerifiedBadge.js)
- Premium animated component for site-wide data trust.

---

## Technical Audit & Stability
The platform has been hardened against build-time crashes:
- All SDK (Firebase/Razorpay) initializers are now guarded via `process.env` checks.
- Auth imports have been standardized using absolute `@/` aliases.

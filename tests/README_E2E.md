# Swastik Medicare E2E Automation System

This suite provides comprehensive validation of the platform's critical business logic, covering everything from User Registration to Admin Ledger audits.

## 📂 Test Modules
1. **User Registration** (`auth.e2e.spec.ts`)
2. **Login & Session** (`auth.e2e.spec.ts`)
3. **Product Browsing** (`shopping.e2e.spec.ts`)
4. **Cart Management** (`shopping.e2e.spec.ts`)
5. **Checkout Flow** (`financials.e2e.spec.ts`)
6. **Wallet System** (`financials.e2e.spec.ts`)
7. **Referral Rewards** (`financials.e2e.spec.ts`)
8. **Payment Integration** (`financials.e2e.spec.ts`)
9. **Order Lifecycle** (`admin-orders.e2e.spec.ts`)
10. **Admin Portal** (`admin-orders.e2e.spec.ts`)

## 🛠️ Safety Features
- **OTP Bypass**: Automates verification by reading mocked OTPs directly from the `SMSLog` database table.
- **Data Cleanup**: A teardown script automatically removes test users, orders, and wallet transactions after execution.
- **Sandbox Mode**: Designed for Vercel Staging or Dedicated Test accounts on live.

## 🚀 How to Run

### Prerequisite: Database Access
The system requires `PRISMA_DATABASE_URL` to perform OTP retrieval and data cleanup.

### Run All Tests
```powershell
./scripts/run-regression.ps1 -TargetURL "https://medicine-ecommerce-swastik.vercel.app/en"
```

### Run a Single Module (Headed/Visual)
```bash
npx playwright test auth.e2e.spec.ts --project=chromium --headed
```

## 📊 Reporting
After execution, a full HTML report is generated in `playwright-report/`. This includes:
- Pass/Fail status per step.
- Automated screenshots on any failure.
- Full trace logs for debugging.

const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// 1. In User model, add marketplaceOrders relation if not present
if (!schema.includes('marketplaceOrders')) {
  schema = schema.replace(
    '  marketplaceDisputesFiled   MarketplaceDispute[]     @relation("DisputeBuyer")',
    '  marketplaceDisputesFiled   MarketplaceDispute[]     @relation("DisputeBuyer")\n  marketplaceOrders          MarketplaceOrder[]       @relation("BuyerOrders")'
  );
}

// 2. In BuyerEnquiry model, add acceptedQuotationId and order
if (!schema.includes('acceptedQuotationId')) {
  schema = schema.replace(
    '  source               String                 @default("marketplace_web")',
    '  source               String                 @default("marketplace_web")\n  acceptedQuotationId  String?'
  );
  schema = schema.replace(
    '  disputes             MarketplaceDispute[]',
    '  disputes             MarketplaceDispute[]\n  order                MarketplaceOrder?'
  );
}

// 3. In ProviderQuotation model, add verificationBadge, rating, and order
if (!schema.includes('verificationBadge')) {
  schema = schema.replace(
    '  isRevised            Boolean                 @default(false)',
    '  isRevised            Boolean                 @default(false)\n  verificationBadge    String?                 @default("SWASTIK_VERIFIED")\n  rating               Float?                  @default(4.7)'
  );
  schema = schema.replace(
    '  revisions            QuotationRevision[]',
    '  revisions            QuotationRevision[]\n  order                MarketplaceOrder?'
  );
}

// 4. Append MarketplaceOrder at the bottom if not present
if (!schema.includes('model MarketplaceOrder')) {
  schema += `

model MarketplaceOrder {
  id                   String            @id @default(cuid())
  orderNumber          String            @unique
  enquiryId            String            @unique
  enquiry              BuyerEnquiry      @relation(fields: [enquiryId], references: [id])
  quotationId          String            @unique
  quotation            ProviderQuotation @relation(fields: [quotationId], references: [id])
  buyerUserId          String?
  buyerUser            User?             @relation("BuyerOrders", fields: [buyerUserId], references: [id])
  providerId           String
  providerBusinessName String
  totalAmount          Float
  currency             String            @default("INR")
  paymentTerms         String?
  warrantyTerms        String?
  timelineDelivery     String?
  status               String            @default("ORDER_CONFIRMED")
  deliveryStatus       String            @default("PENDING_DISPATCH")
  trackingNumber       String?
  courierName          String?
  deliveryNotes        String?
  dispatchedAt         DateTime?
  deliveredAt          DateTime?
  cancelledAt          DateTime?
  createdAt            DateTime          @default(now())
  updatedAt            DateTime          @updatedAt

  @@index([enquiryId])
  @@index([providerId])
}
`;
}

fs.writeFileSync('prisma/schema.prisma', schema, 'utf8');
console.log('schema.prisma updated successfully!');


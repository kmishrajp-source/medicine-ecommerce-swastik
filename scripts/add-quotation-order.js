const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

const target = `  revisions            QuotationRevision[]

  @@index([enquiryId, status])`;

const replacement = `  verificationBadge    String?                 @default("SWASTIK_VERIFIED")
  rating               Float?                  @default(4.7)
  items                QuotationItem[]
  revisions            QuotationRevision[]
  order                MarketplaceOrder?

  @@index([enquiryId, status])`;

// Remove duplicate items/revisions if present
schema = schema.replace(
`  items                QuotationItem[]
  revisions            QuotationRevision[]

  @@index([enquiryId, status])`,
replacement
);

fs.writeFileSync('prisma/schema.prisma', schema, 'utf8');
console.log('Replaced ProviderQuotation items/order');


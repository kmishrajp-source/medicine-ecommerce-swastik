const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// 1. Add marketplaceOrders in User
schema = schema.replace(
  '  marketplaceDisputesFiled MarketplaceDispute[]      @relation("DisputeBuyer")',
  '  marketplaceDisputesFiled MarketplaceDispute[]      @relation("DisputeBuyer")\n  marketplaceOrders        MarketplaceOrder[]        @relation("BuyerOrders")'
);

// 2. Add order in ProviderQuotation
if (!schema.includes('  order                MarketplaceOrder?')) {
  schema = schema.replace(
    '  revisions            QuotationRevision[]',
    '  revisions            QuotationRevision[]\n  order                MarketplaceOrder?'
  );
}

fs.writeFileSync('prisma/schema.prisma', schema, 'utf8');
console.log('Fixed relations in schema.prisma');


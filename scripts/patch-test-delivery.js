const fs = require('fs');

let code = fs.readFileSync('scripts/test-healthmart-e2e.mjs', 'utf8');

code = code.replace(
  'const { status, json } = await api("PATCH", `/api/marketplace/orders/${orderId}/delivery`, stage);',
  'const { status, json } = await api("PATCH", `/api/marketplace/orders/${orderId}/delivery`, { deliveryStatus: stage.status, status: stage.status, notes: stage.notes });'
);

fs.writeFileSync('scripts/test-healthmart-e2e.mjs', code, 'utf8');
console.log('test-healthmart-e2e.mjs updated!');


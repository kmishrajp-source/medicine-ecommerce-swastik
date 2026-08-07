const fs = require('fs');
const sql = fs.readFileSync('all_tables.sql', 'utf8');
const tablesToExtract = ['StockBroadcast', 'LiveStockQuote', 'StockistDirectory', 'RiderLocationLog', 'DeliveryAlert', 'RiderCashAccount', 'CashTransaction', 'CashDeposit', 'Distributor', 'CompetitorBill', 'Coupon', 'CampaignLead', 'BroadcastCampaign', 'BroadcastLog'];

let output = '';
tablesToExtract.forEach(table => {
    const regex = new RegExp('CREATE TABLE "' + table + '" [^;]+;', 'g');
    const match = sql.match(regex);
    if (match) { output += match.join('\n\n') + '\n\n'; }
});

const fkRegex = /ALTER TABLE "([^"]+)" ADD CONSTRAINT "[^"]+" FOREIGN KEY [^;]+;/g;
let fks = [];
let match;
while ((match = fkRegex.exec(sql)) !== null) {
    if (tablesToExtract.includes(match[1])) {
        fks.push(match[0]);
    }
}
output += fks.join('\n') + '\n';
fs.writeFileSync('new_tables.sql', output);
console.log('Created new_tables.sql');

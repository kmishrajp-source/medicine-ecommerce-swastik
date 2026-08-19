const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
let content = fs.readFileSync(envPath);

// Check for and strip BOM (EF BB BF for UTF-8 BOM)
if (content[0] === 0xEF && content[1] === 0xBB && content[2] === 0xBF) {
    console.log('Found UTF-8 BOM — stripping it...');
    content = content.slice(3);
}

// Write back as clean UTF-8 without BOM
fs.writeFileSync(envPath, content);
console.log('Done. .env is now clean UTF-8 without BOM.');
console.log('First 3 bytes:', content[0], content[1], content[2]);

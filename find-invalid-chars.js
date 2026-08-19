const fs = require('fs');
const content = fs.readFileSync('prisma/schema.prisma', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let j = 0; j < line.length; j++) {
        const code = line.charCodeAt(j);
        // Flag non-ASCII, non-printable chars (except common ones)
        if (code > 127 && code !== 0xFEFF) {
            console.log(`Line ${i + 1}, Col ${j + 1}: char code ${code} (U+${code.toString(16).toUpperCase()}) in: "${line.substring(Math.max(0,j-10), j+20).replace(/\n/g,'\\n')}"`);
        }
    }
}
console.log('Scan complete.');

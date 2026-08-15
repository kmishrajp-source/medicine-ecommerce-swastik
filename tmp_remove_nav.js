const fs = require('fs');

const path = 'components/Navbar.js';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// Remove Mobile Menus (Lines 326 to 370)
// Line 326 is index 325. Total lines to remove = 370 - 326 + 1 = 45.
lines.splice(325, 45);

// Remove Desktop Menus (Lines 228 to 286)
// Line 228 is index 227. Total lines to remove = 286 - 228 + 1 = 59.
lines.splice(227, 59);

fs.writeFileSync(path, lines.join('\n'));
console.log("Successfully removed Company, My Health, and AI Tools menus.");

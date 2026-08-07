const fs = require('fs');
const path = require('path');

const srcAppDir = 'C:\\Users\\hp\\Downloads\\medicine-ecommerce-swastik-main\\medicine-ecommerce-swastik-main\\app';
const destAppDir = 'C:\\Users\\hp\\.gemini\\antigravity\\scratch\\medicine-ecommerce-swastik\\app';

function copyMissingFiles(src, dest) {
    if (!fs.existsSync(src)) return;
    const stats = fs.statSync(src);
    
    if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        const files = fs.readdirSync(src);
        for (const file of files) {
            copyMissingFiles(path.join(src, file), path.join(dest, file));
        }
    } else {
        if (!fs.existsSync(dest)) {
            fs.copyFileSync(src, dest);
            console.log(`Copied: ${dest}`);
        }
    }
}

copyMissingFiles(srcAppDir, destAppDir);

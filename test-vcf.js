const rawContactText = `BEGIN:VCARD
VERSION:3.0
FN:Zambian Friend
TEL;TYPE=CELL:+2609721393995
END:VCARD
BEGIN:VCARD
VERSION:3.0
FN:Indian Friend
TEL;TYPE=CELL:+919456971034
END:VCARD
BEGIN:VCARD
VERSION:3.0
TEL;TYPE=CELL:9654102760
END:VCARD
`;

const parsed = [];
let currentName = 'Customer';
const lines = rawContactText.split('\n');
for (const line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine) continue;

    if (cleanLine.startsWith('FN:')) {
        currentName = cleanLine.substring(3).trim();
    } 
    else if (!cleanLine.includes(':') && !cleanLine.includes(';') && /[a-zA-Z]{3,}/.test(cleanLine)) {
        currentName = cleanLine.replace(/[\,\;\"]/g, '').trim();
    }

    const potentialPhones = cleanLine.match(/(?:\+?\d[\d\-\s]{8,}\d)/g);
    if (potentialPhones) {
        let validIndianPhone = null;
        for (const match of potentialPhones) {
            let clean = match.replace(/[\s\-]/g, '');
            if (clean.startsWith('+')) {
                if (!clean.startsWith('+91')) continue; 
                clean = clean.substring(3);
            } else if (clean.startsWith('91') && clean.length === 12) {
                clean = clean.substring(2);
            } else if (clean.startsWith('0') && clean.length === 11) {
                clean = clean.substring(1);
            }
            if (/^[6-9]\d{9}$/.test(clean)) {
                validIndianPhone = clean;
                break;
            }
        }

        if (validIndianPhone) {
            let nameToUse = currentName;
            
            if (!cleanLine.toUpperCase().includes('TEL;') && !cleanLine.toUpperCase().includes('TYPE=')) {
                const textWithoutPhone = cleanLine.replace(validIndianPhone, '').replace(/[\,\;\:\+91\"]/g, '').trim();
                if (textWithoutPhone.length > 2 && /[a-zA-Z]/.test(textWithoutPhone)) {
                    nameToUse = textWithoutPhone;
                }
            }
            
            parsed.push({ name: nameToUse, phone: validIndianPhone });
            currentName = 'Customer'; 
        }
    }
}

console.log(parsed);

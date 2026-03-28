const fs = require('fs');
const path = require('path');

function exportData() {
    const filePath = path.join(__dirname, '..', 'data', 'gorakhpur-healthcare.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Export to JSON (already exists but for clarity)
    fs.writeFileSync(path.join(__dirname, '..', 'public', 'gorakhpur-healthcare-export.json'), JSON.stringify(data, null, 2));
    console.log("JSON export created at public/gorakhpur-healthcare-export.json");

    // Export to CSV
    const headers = ['id', 'name', 'type', 'specialization', 'doctorName', 'phone', 'address', 'locality', 'fee', 'rating', 'reviews', 'verified'];
    const csvRows = [headers.join(',')];

    for (const item of data) {
        const row = headers.map(header => {
            const val = item[header] !== undefined ? item[header] : 'NULL';
            // Escapes commas and quotes for CSV
            return `"${String(val).replace(/"/g, '""')}"`;
        });
        csvRows.push(row.join(','));
    }

    fs.writeFileSync(path.join(__dirname, '..', 'public', 'gorakhpur-healthcare-export.csv'), csvRows.join('\n'));
    console.log("CSV export created at public/gorakhpur-healthcare-export.csv");
}

exportData();

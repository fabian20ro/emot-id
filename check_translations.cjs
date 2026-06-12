
const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, 'src/models/catalog');

try {
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
    let missingCount = 0;

    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        for (const key in data) {
            const entry = data[key];
            if (entry.description && entry.description.en && !entry.description.ro) {
                console.log(`[${file}] Missing 'ro' translation in description for: ${key}`);
                missingCount++;
            }
            if (entry.label && entry.label.en && !entry.label.ro) {
                console.log(`[${file}] Missing 'ro' translation in label for: ${key}`);
                missingCount++;
            }
            if (entry.needs && entry.needs.en && !entry.needs.ro) {
                console.log(`[${file}] Missing 'ro' translation in needs for: ${key}`);
                missingCount++;
            }
        }
    });

    if (missingCount === 0) {
        console.log('No missing translations found in catalog.');
    } else {
        console.log(`Found ${missingCount} missing translations.`);
    }
} catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
}

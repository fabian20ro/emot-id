
const fs = require('fs');
const path = require('path');

const root = __dirname;
const enPath = path.join(root, 'src/i18n/en.json');
const roPath = path.join(root, 'src/i18n/ro.json');

try {
    const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    const roData = JSON.parse(fs.readFileSync(roPath, 'utf8'));

    const enKeys = Object.keys(enData);
    const roKeys = Object.keys(roData);

    let untranslatedCount = 0;
    let untranslatedKeys = [];

    enKeys.forEach(key => {
        if (roData[key] === enData[key]) {
            untranslatedKeys.push(key);
            untranslatedCount++;
        }
    });

    if (untranslatedCount === 0) {
        console.log('No untranslated keys found (all ro values differ from en)');
    } else {
        console.log(`Found ${untranslatedCount} untranslated keys in ro.json:`);
        untranslatedKeys.forEach(key => console.log(` - ${key}`));
    }

} catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
}

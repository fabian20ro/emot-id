
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

    const missingInRo = enKeys.filter(key => !roKeys.includes(key));

    if (missingInRo.length === 0) {
        console.log('All keys in en.json are present in ro.json');
    } else {
        console.log(`Found ${missingInRo.length} missing keys in ro.json:`);
        missingInRo.forEach(key => console.log(` - ${key}`));
    }

    const extraInRo = roKeys.filter(key => !enKeys.includes(key));
    if (extraInRo.length > 0) {
        console.log(`Found ${extraInRo.length} extra keys in ro.json:`);
        extraInRo.forEach(key => console.log(` - ${key}`));
    }

} catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
}

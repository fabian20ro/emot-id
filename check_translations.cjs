
const fs = require('fs');
const path = require('path');

const CATALOG_DIR = path.join(__dirname, 'src/models/catalog');
const I18N_EN = path.join(__dirname, 'src/i18n/en.json');
const I18N_RO = path.join(__dirname, 'src/i18n/ro.json');

function checkCatalog() {
  let missingCount = 0;
  try {
    const files = fs.readdirSync(CATALOG_DIR).filter(f => f.endsWith('.json'));
    files.forEach(file => {
      const filePath = path.join(CATALOG_DIR, file);
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
  } catch (err) {
    console.error('Error reading catalog:', err.message);
  }
  return missingCount;
}

function checkI18nParity() {
  let missingCount = 0;
  try {
    const en = JSON.parse(fs.readFileSync(I18N_EN, 'utf8'));
    const ro = JSON.parse(fs.readFileSync(I18N_RO, 'utf8'));

    const checkNested = (enObj, roObj, path) => {
      for (const key in enObj) {
        const currentPath = path ? `${path}.${key}` : key;
        if (typeof enObj[key] === 'object' && enObj[key] !== null && !Array.isArray(enObj[key])) {
          if (!roObj[key]) {
            console.log(`[i18n] Missing object '${currentPath}' in ro.json`);
            missingCount++;
            continue;
          }
          checkNested(enObj[key], roObj[key], currentPath);
        } else {
          if (roObj[key] === undefined) {
            console.log(`[i18n] Missing key '${currentPath}' in ro.json`);
            missingCount++;
          }
        }
      }
    };
    checkNested(en, ro, '');
  } catch (err) {
    console.error('Error reading i18n files:', err.message);
  }
  return missingCount;
}

const catalogMissing = checkCatalog();
const i18nMissing = checkI18nParity();

if (catalogMissing === 0 && i18nMissing === 0) {
  console.log('No missing translations found in catalog or i18n parity check.');
} else {
  if (catalogMissing > 0) console.log(`Catalog: Found ${catalogMissing} missing translations.`);
  if (i18nMissing > 0) console.log(`i18n: Found ${i18nMissing} missing translations/keys.`);
  process.exit(1);
}

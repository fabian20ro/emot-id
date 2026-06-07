import { test, expect } from 'vitest';
import en from './en.json';
import ro from './ro.json';

function getKeys(obj, prefix = '') {
  const keys = new Set();
  for (const key in obj) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    keys.add(newKey);
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      obj[key] && getKeys(obj[key], newKey).forEach(k => keys.add(k));
    }
  }
  return keys;
}

test('English vs Romanian translation keys integrity', () => {
  const enKeys = getKeys(en);
  const roKeys = getKeys(ro);

  const missingInRo = [...enKeys].filter(key => !roKeys.has(key));

  if (missingInRo.length > 0) {
    console.error('Missing keys in Romanian translation:', missingInRo);
  }
  
  expect(missingInRo, `Missing keys in Romanian translation: ${missingInRo.join(', ')}`).toHaveLength(0);
});

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

function validateValues(obj, prefix = '') {
  for (const key in obj) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    const val = obj[key];
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      validateValues(val, newKey);
    } else {
      expect(typeof val, `Value at ${newKey} is not a string`).toBe('string');
    }
  }
}

test('English vs Romanian translation keys integrity', () => {
  const enKeys = getKeys(en);
  const roKeys = getKeys(ro);

  const missingInRo = [...enKeys].filter(key => !roKeys.has(key));
  expect(missingInRo, `Missing keys in Romanian translation: ${missingInRo.join(', ')}`).toHaveLength(0);
});

test('All translation values are strings', () => {
  validateValues(en);
  validateValues(ro);
});

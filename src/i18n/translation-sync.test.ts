import { test, expect } from 'vitest';
import en from './en.json';
import ro from './ro.json';

function getKeys(obj: Record<string, unknown>, prefix = '') {
  const keys = new Set<string>();
  for (const key in obj) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    keys.add(newKey);
    const value = obj[key];
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      getKeys(value as Record<string, unknown>, newKey).forEach(k => keys.add(k));
    }
  }
  return keys;
}

function validateValues(obj: Record<string, unknown>, prefix = '') {
  for (const key in obj) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    const val = obj[key];
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      validateValues(val as Record<string, unknown>, newKey);
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
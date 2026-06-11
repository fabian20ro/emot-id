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

test('English vs Romanian translation keys integrity', () => {
  const enKeys = getKeys(en);
  const roKeys = getKeys(ro);

  const missingInRo = [...enKeys].filter(key => !roKeys.has(key));
  expect(missingInRo, `Missing keys in Romanian translation: ${missingInRo.join(', ')}`).toHaveLength(0);
});

test('Romanian values should be different from English values', () => {
  const isPlaceholder = (str: string) => 
    str.includes('{') || 
    str.includes('}') || 
    str.includes('(') || 
    str.includes(')') ||
    str.toLowerCase().startsWith('...') ||
    str.toLowerCase().endsWith('...');

  const knownIdentical = ['app.title', 'app.subtitle', 'app de', 'app.languageRo', 'app.languageEn', 'selectionBar.clear', 'selectionBar.cleared', 'selectionBar.undo', 'onboarding.next', 'onboarding.back', 'menu.languageRo', 'menu.languageEn', 'onboarding.selectModel', 'onboarding.getStarted', 'menu.model'];

  const checkDifferences = (objEn: Record<string, unknown>, objRo: Record<string, unknown>, prefix = '') => {
    for (const key in objEn) {
      const currentPrefix = prefix ? `${prefix}.${key}` : key;
      const valEn = objEn[key];
      const valRo = objRo[key];

      if (typeof valEn === 'object' && valEn !== null && !Array.isArray(valEn)) {
        checkDifferences(valEn as Record<string, unknown>, valRo as Record<string, unknown>, currentPrefix);
      } else if (typeof valEn === 'string' && typeof valRo === 'string') {
        if (valEn.trim() === valRo.trim() && !isPlaceholder(valEn) && !knownIdentical.includes(currentPrefix)) {
          expect(valEn.toLowerCase(), `Key ${currentPrefix} is not translated (is identical to English)`).not.toBe(valRo.toLowerCase());
        }
      }
    }
  };

  checkDifferences(en, ro);
});

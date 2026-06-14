import { describe, it, expect } from 'vitest';
import en from './en.json';
import ro from './ro.json';

describe('i18n integrity', () => {
  const languages = [
    { name: 'en', data: en },
    { name: 'ro', data: ro }
  ];

  languages.forEach(({ name, data }) => {
    describe(`Language: ${name}`, () => {
      it('should have the required aiPrompt key in analyze', () => {
        expect(data.analyze).toHaveProperty('aiPrompt');
      });

      it('should contain the {emotions} placeholder for replacement', () => {
        expect(data.analyze.aiPrompt).toContain('{emotions}');
      });

      it('should have the required aiPromptMultiple key in analyze', () => {
        expect(data.analyze).toHaveProperty('aiPromptMultiple');
      });

      it('should contain the {region} placeholder for somatic prompts', () => {
        expect(data.somatic.guidedPrompt).toContain('{region}');
        expect(data.somatic.guidedPause).toContain('{region}');
      });

      it('should have identical keys for all nested objects (en vs ro)', () => {
        const checkKeys = (obj1: any, obj2: any, path = '') => {
          Object.keys(obj1).forEach(key => {
            const currentPath = path ? `${path}.${key}` : key;
            if (typeof obj1[key] === 'object' && obj1[key] !== null && !Array.isArray(obj1[key])) {
              if (typeof obj2[key] === 'object' && obj2[key] !== null && !Array.isArray(obj2[key])) {
                checkKeys(obj1[key], obj2[key], currentPath);
              } else {
                throw new Error(`Key ${currentPath} is an object in en.json but not in ro.json`);
              }
            } else {
              if (key in obj2 === false) {
                throw new Error(`Key ${currentPath} is missing in ro.json`);
              }
            }
          });
        };
        checkKeys(en, ro);
      });
    });
  });
});

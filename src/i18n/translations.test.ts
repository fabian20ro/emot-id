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
    });
  });
});

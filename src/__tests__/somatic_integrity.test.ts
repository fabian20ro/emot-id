import { test, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

interface EmotionSignal {
  emotionId: string;
  sensationType: string;
  minIntensity: number;
  weight: number;
  source: string;
  contextDescription: {
    ro: string;
    en: string;
  };
  contextNeeds: {
    ro: string;
    en: string;
  };
}

interface SomaticPart {
  emotionSignals: EmotionSignal[];
}

function loadSomaticData(fileName: string) {
  const filePath = join(process.cwd(), 'src/models/somatic/data', fileName)
  const data = JSON.parse(readFileSync(filePath, 'utf-8'))
  return data as Record<string, SomaticPart>
}

const bodyParts = ['arms', 'head', 'legs', 'torso-back', 'torso-front']

test.each(bodyParts)('%s: signals have valid emotionIds and sensationTypes', (part) => {
  const data = loadSomaticData(`${part}.json`)
  const partData = Object.values(data)[0]
  
  expect(partData).toBeDefined()
  expect(partData.emotionSignals).toBeDefined()
  expect(Array.isArray(partData.emotionSignals)).toBe(true)

  partData.emotionSignals.forEach((signal) => {
    expect(signal.emotionId).toBeDefined()
    expect(typeof signal.emotionId).toBe('string')
    expect(signal.sensationType).toBeDefined()
    expect(typeof signal.sensationType).toBe('string')
    expect(signal.minIntensity).toBeDefined()
    expect(typeof signal.minIntensity).toBe('number')
    expect(signal.weight).toBeDefined()
    expect(typeof signal.weight).toBe('number')
  })
})

test('all somatic data files are valid JSON', () => {
  // Smoke test
})

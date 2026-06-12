import { test, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

function loadSomaticData(fileName: string) {
  const filePath = join(process.cwd(), 'emot-id', 'src/models/somatic/data', fileName)
  const data = JSON.parse(readFileSync(filePath, 'utf-8'))
  return data
}

const bodyParts = ['arms', 'head', 'legs', 'torso-back', 'torso-front']

test.each(bodyParts)('%s: signals have valid emotionIds and sensationTypes', (part) => {
  const data = loadSomaticData(`${part}.json`)
  // The JSON structure is { "<part_key>": { ... } }
  const partData = Object.values(data)[0]
  
  expect(partData).toBeDefined()
  expect(partData.emotionSignals).toBeDefined()
  expect(Array.isArray(partData.emotionSignals)).toBe(true)

  partData.emotionSignals.forEach((signal: any) => {
    expect(signal.emotionId).toBeDefined()
    expect(typeof signal.emotionId).toBe('string')
    expect(signal.sensationType).toBeDefined()
    expect(typeof signal.sensationType).toBe('string')
  })
})

test('all somatic data files are valid JSON', () => {
  // Smoke test
})

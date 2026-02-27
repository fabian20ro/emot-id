const fs = require('fs')
const path = require('path')

const dataDir = 'src/models/somatic/data'
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'))

let totalSignals = 0
let withContext = 0
let withContextNeeds = 0

for (const file of files) {
  const filePath = path.join(dataDir, file)
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))

  for (const [regionId, region] of Object.entries(data)) {
    for (const signal of region.emotionSignals) {
      totalSignals++

      // Remove duplicated fields (resolved from catalog at runtime)
      delete signal.emotionLabel
      delete signal.emotionColor

      // Rename emotionDescription → contextDescription (body-region-specific framing)
      if (signal.emotionDescription) {
        signal.contextDescription = signal.emotionDescription
        delete signal.emotionDescription
        withContext++
      }

      // Rename emotionNeeds → contextNeeds (body-region-specific needs)
      if (signal.emotionNeeds) {
        signal.contextNeeds = signal.emotionNeeds
        delete signal.emotionNeeds
        withContextNeeds++
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n')
  console.log(`Slimmed ${filePath}`)
}

console.log(`\nTotal signals: ${totalSignals}`)
console.log(`With contextDescription: ${withContext}`)
console.log(`With contextNeeds: ${withContextNeeds}`)

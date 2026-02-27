const fs = require('fs')
const path = require('path')

const dataDir = 'src/models/plutchik/data'
const overlayDir = 'src/models/plutchik/overlays'

// Create overlays directory
if (!fs.existsSync(overlayDir)) fs.mkdirSync(overlayDir, { recursive: true })

const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'))
for (const f of files) {
  const data = JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'))
  const overlay = {}
  for (const [id, e] of Object.entries(data)) {
    // Keep only Plutchik-specific fields + color
    const entry = { color: e.color }
    if (e.category !== undefined) entry.category = e.category
    if (e.intensity !== undefined) entry.intensity = e.intensity
    if (e.opposite !== undefined) entry.opposite = e.opposite
    if (e.spawns !== undefined) entry.spawns = e.spawns
    if (e.components !== undefined) entry.components = e.components
    overlay[id] = entry
  }
  fs.writeFileSync(path.join(overlayDir, f), JSON.stringify(overlay, null, 2) + '\n')
  console.log(`${f}: ${Object.keys(overlay).length} entries`)
}

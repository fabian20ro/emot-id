const fs = require('fs')
const data = JSON.parse(fs.readFileSync('src/models/dimensional/data.json', 'utf8'))
const overlay = {}
for (const [id, e] of Object.entries(data)) {
  overlay[id] = {
    color: e.color,
    valence: e.valence,
    arousal: e.arousal,
    quadrant: e.quadrant,
  }
}
fs.writeFileSync('src/models/dimensional/overlay.json', JSON.stringify(overlay, null, 2) + '\n')
console.log('Wrote overlay.json with', Object.keys(overlay).length, 'entries')

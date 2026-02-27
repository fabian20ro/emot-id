const fs = require('fs')
const path = require('path')
const dir = 'src/models/plutchik/data'
const cats = {}
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
  const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
  for (const [id, e] of Object.entries(data)) {
    const cat = e.category || 'NONE'
    if (!cats[cat]) cats[cat] = []
    cats[cat].push(id)
  }
}
for (const [cat, ids] of Object.entries(cats)) {
  console.log(cat + ' (' + ids.length + '): ' + ids.join(', '))
}

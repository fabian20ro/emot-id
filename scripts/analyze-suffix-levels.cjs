const fs = require('fs')
const path = require('path')
const dir = 'src/models/wheel/data'
const wheel = {}
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
  Object.assign(wheel, JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')))
}

const suffixPattern = /^(.+)_(sad|disg|fear|bad)$/
const groups = {}
for (const [id, e] of Object.entries(wheel)) {
  const m = id.match(suffixPattern)
  if (m) {
    const base = m[1]
    if (!groups[base]) groups[base] = { base: wheel[base] || null, variants: [] }
    groups[base].variants.push({ id, level: e.level, parent: e.parent, children: e.children })
  }
}

for (const [base, g] of Object.entries(groups)) {
  console.log('\n=== ' + base + ' ===')
  if (g.base) {
    console.log('  BASE: level=' + g.base.level + ' parent=' + g.base.parent + ' children=' + JSON.stringify(g.base.children))
  }
  for (const v of g.variants) {
    console.log('  ' + v.id + ': level=' + v.level + ' parent=' + v.parent + ' children=' + JSON.stringify(v.children))
  }

  // Can merge?
  const allL2 = g.variants.every(v => v.level === 2)
  const baseL2 = g.base && g.base.level === 2
  const noBase = !g.base

  if (allL2 && (noBase || baseL2)) {
    const parents = g.variants.map(v => v.parent)
    if (g.base) parents.unshift(g.base.parent)
    console.log('  → CAN MERGE: ' + base + ' with parents=[' + parents.join(', ') + ']')
  } else {
    console.log('  → CANNOT MERGE (level mismatch or base has children)')
  }
}

const fs = require('fs')
const path = require('path')
const dir = 'src/models/wheel/data'
const wheel = {}
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
  const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
  Object.assign(wheel, data)
}

// Find suffix duplicates
const suffixPattern = /^(.+)_(sad|disg|fear|bad)$/
const suffixed = {}
for (const [id, e] of Object.entries(wheel)) {
  const m = id.match(suffixPattern)
  if (m) {
    const base = m[1]
    if (!suffixed[base]) suffixed[base] = []
    suffixed[base].push({ id, suffix: m[2], parent: e.parent, level: e.level })
  }
}

for (const [base, variants] of Object.entries(suffixed)) {
  const hasNonSuffixed = !!wheel[base]
  console.log(base + ':')
  if (hasNonSuffixed) {
    console.log('  [base] parent=' + wheel[base].parent + ' level=' + wheel[base].level)
  } else {
    console.log('  [no base version]')
  }
  for (const v of variants) {
    console.log('  ' + v.id + ' parent=' + v.parent + ' level=' + v.level)
  }
}

// Also check compound IDs that look like they MIGHT be suffixes but aren't
console.log('\nCompound IDs (not suffix dups):')
const compoundPattern = /^[a-z]+_[a-z]+$/
for (const id of Object.keys(wheel)) {
  if (compoundPattern.test(id) && !suffixPattern.test(id)) {
    console.log('  ' + id + ' parent=' + wheel[id].parent)
  }
}

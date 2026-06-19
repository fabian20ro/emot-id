const fs = require('fs')
const path = require('path')
const dir = path.join(process.cwd(), 'src/models/wheel/overlays')
const wheel = {}
if (!fs.existsSync(dir)) {
  console.error('Error: Directory not found: ' + dir)
  process.exit(1)
}
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
  const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
  Object.assign(wheel, data)
}

// Find suffix duplicates
const suffixPattern = /^(.+)_(sad|disg|fear|bad)$/
const suffixed = {}
let duplicatesFound = false

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
    console.log('  [base] parent=' + (wheel[base].parent ? wheel[base].parent.join(',') : 'none') + ' level=' + wheel[base].level)
  } else {
    console.log('  [no base version]')
  }
  for (const v of variants) {
    console.log('  ' + v.id + ' parent=' + (v.parent ? v.parent.join(',') : 'none') + ' level=' + v.level)
  }
  // If the base itself has a suffix that's the same as the base? Not possible with the regex.
  // But if we have duplicates in the variants list...
  if (variants.length > 1) {
    console.log('  [WARNING] Multiple variants for base ' + base)
    duplicatesFound = true
  }
}

// Also check compound IDs that look like they MIGHT be suffixes but aren't
console.log('\nCompound IDs (not suffix dups):')
const compoundPattern = /^[a-z]+_[a-z]+$/
for (const id of Object.keys(wheel)) {
  if (compoundPattern.test(id) && !suffixPattern.test(id)) {
    console.log('  ' + id + ' parent=' + (wheel[id].parent ? wheel[id].parent.join(',') : 'none'))
  }
}

if (duplicatesFound) {
  console.error('\n[ERROR] Duplicate variants detected for a base.')
  process.exit(1)
}

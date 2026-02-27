const fs = require('fs')
const path = require('path')

// 1. Load all wheel data
const dataDir = 'src/models/wheel/data'
const wheel = {}
for (const f of fs.readdirSync(dataDir).filter(f => f.endsWith('.json'))) {
  Object.assign(wheel, JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8')))
}

// 2. Load existing catalog
const catDir = 'src/models/catalog'
const catFiles = [
  'primary-affects.json', 'positive.json', 'negative-high.json', 'negative-low.json',
  'social.json', 'complex.json', 'somatic-only.json', 'wheel-branches.json',
  'wheel-leaves.json', 'plutchik-variants.json', 'dimensional-only.json'
]
const catalog = {}
for (const f of catFiles) {
  Object.assign(catalog, JSON.parse(fs.readFileSync(path.join(catDir, f), 'utf8')))
}

// 3. Define suffix merges (confirmed by analysis)
// CAN MERGE: all L2, same level
const MERGES = [
  {
    canonicalId: 'embarrassed',
    remove: ['embarrassed_sad', 'embarrassed_disg'],
    // Take description from embarrassed_sad (richer, sad-context)
    descriptionSource: 'embarrassed_sad',
    label: { ro: 'Jenat', en: 'Embarrassed' },
  },
  {
    canonicalId: 'inferior',
    remove: ['inferior_sad', 'inferior_fear'],
    descriptionSource: 'inferior_sad',
    label: { ro: 'Inferior', en: 'Inferior' },
  },
  {
    canonicalId: 'humbled',
    remove: ['humbled_sad'],
    descriptionSource: 'humbled_sad',
    label: { ro: 'Smerit', en: 'Humbled' },
  },
  {
    canonicalId: 'exposed',
    remove: ['exposed_sad'],
    // exposed already exists, just add parent
    descriptionSource: 'exposed', // keep existing
    existing: true,
  },
  {
    canonicalId: 'helpless',
    remove: ['helpless_sad'],
    descriptionSource: 'helpless', // keep existing
    existing: true,
  },
]

// CANNOT MERGE (level mismatch) - keep as-is:
// disappointed_disg (L1, parent=disgusted, has children) vs disappointed_sad (L2, parent=hurt)
// overwhelmed (L1, parent=bad, has children) vs overwhelmed_bad (L2) / overwhelmed_fear (L2)

// 4. Build merge maps
const removedIds = new Set()
const mergedParents = {} // canonicalId -> [parents]
const mergedEmotions = {} // canonicalId -> full wheel emotion (for new catalog entries)

for (const merge of MERGES) {
  const parents = []

  if (merge.existing) {
    // Already exists in wheel - collect all parents
    const base = wheel[merge.canonicalId]
    if (base.parent) parents.push(base.parent)
  }

  for (const removeId of merge.remove) {
    const e = wheel[removeId]
    if (e.parent) parents.push(e.parent)
    removedIds.add(removeId)
  }

  mergedParents[merge.canonicalId] = parents

  if (!merge.existing) {
    // Need to create new catalog entry from the description source
    const source = wheel[merge.descriptionSource]
    mergedEmotions[merge.canonicalId] = {
      id: merge.canonicalId,
      label: merge.label,
      description: source.description,
      needs: source.needs,
      color: source.color, // use color from the first source
    }
  }
}

// 5. Fix children arrays - replace suffixed IDs with canonical IDs
const childReplacements = {}
for (const merge of MERGES) {
  for (const removeId of merge.remove) {
    childReplacements[removeId] = merge.canonicalId
  }
}

// 6. Build overlay entries
// An overlay entry has: level, color, parents (for L1/L2), children (for L0/L1)
const overlays = {}

for (const [id, e] of Object.entries(wheel)) {
  if (removedIds.has(id)) continue // skip removed suffix duplicates

  const overlay = {
    level: e.level,
    color: e.color,
  }

  // Parents
  if (mergedParents[id]) {
    // This is a merged emotion with explicit parents
    overlay.parents = mergedParents[id]
  } else if (e.parent) {
    overlay.parents = [e.parent]
  } else {
    overlay.parents = [] // L0 root
  }

  // Children (fix suffixed IDs)
  if (e.children && e.children.length > 0) {
    const fixedChildren = e.children.map(c => childReplacements[c] || c)
    // Deduplicate (in case both suffixed IDs pointed to same parent)
    overlay.children = [...new Set(fixedChildren)]
  }

  overlays[id] = overlay
}

// 6b. Add NEW merged canonical entries (embarrassed, inferior, humbled)
// These didn't exist in the original wheel data
for (const merge of MERGES) {
  if (!merge.existing && !overlays[merge.canonicalId]) {
    const source = wheel[merge.descriptionSource]
    overlays[merge.canonicalId] = {
      level: 2, // all merged entries are L2
      color: source.color,
      parents: mergedParents[merge.canonicalId],
    }
    console.log(`Added merged overlay entry: ${merge.canonicalId} with parents=${JSON.stringify(mergedParents[merge.canonicalId])}`)
  }
}

// 7. Split overlays by L0 branch
function getL0Ancestor(id) {
  let current = id
  let depth = 0
  while (depth < 10) {
    const o = overlays[current]
    if (!o) return null
    if (o.level === 0) return current
    if (o.parents.length === 0) return null
    current = o.parents[0] // follow first parent for file placement
    depth++
  }
  return null
}

const byBranch = {}
for (const [id, o] of Object.entries(overlays)) {
  let branch
  if (o.level === 0) {
    branch = id
  } else {
    branch = getL0Ancestor(id) || 'unknown'
  }
  if (!byBranch[branch]) byBranch[branch] = {}
  byBranch[branch][id] = o
}

// 8. Write overlay files
const overlaysDir = 'src/models/wheel/overlays'
if (!fs.existsSync(overlaysDir)) fs.mkdirSync(overlaysDir, { recursive: true })

for (const [branch, entries] of Object.entries(byBranch)) {
  const filePath = path.join(overlaysDir, `${branch}.json`)
  fs.writeFileSync(filePath, JSON.stringify(entries, null, 2) + '\n')
  console.log(`Wrote ${filePath} (${Object.keys(entries).length} entries)`)
}

// 9. Update catalog files
// 9a. Create new canonical entries for merged emotions (embarrassed, inferior, humbled)
const wheelLeaves = JSON.parse(fs.readFileSync(path.join(catDir, 'wheel-leaves.json'), 'utf8'))
const wheelBranches = JSON.parse(fs.readFileSync(path.join(catDir, 'wheel-branches.json'), 'utf8'))

// Add new canonical entries to wheel-leaves
for (const [id, e] of Object.entries(mergedEmotions)) {
  wheelLeaves[id] = e
  console.log(`Added canonical entry: ${id}`)
}

// Remove suffixed entries from catalog
for (const removeId of removedIds) {
  if (wheelLeaves[removeId]) {
    delete wheelLeaves[removeId]
    console.log(`Removed suffixed entry from wheel-leaves: ${removeId}`)
  }
  if (wheelBranches[removeId]) {
    delete wheelBranches[removeId]
    console.log(`Removed suffixed entry from wheel-branches: ${removeId}`)
  }
}

// Write updated catalog files
fs.writeFileSync(path.join(catDir, 'wheel-leaves.json'), JSON.stringify(wheelLeaves, null, 2) + '\n')
fs.writeFileSync(path.join(catDir, 'wheel-branches.json'), JSON.stringify(wheelBranches, null, 2) + '\n')

// 10. Summary
const totalOverlay = Object.values(byBranch).reduce((sum, b) => sum + Object.keys(b).length, 0)
console.log(`\nTotal overlay entries: ${totalOverlay}`)
console.log(`Removed IDs: ${[...removedIds].join(', ')}`)
console.log(`New canonical IDs: ${Object.keys(mergedEmotions).join(', ')}`)
console.log(`Multi-parent IDs: ${Object.keys(mergedParents).join(', ')}`)

// Verify all overlay IDs exist in catalog
const updatedCatalog = {}
for (const f of catFiles) {
  Object.assign(updatedCatalog, JSON.parse(fs.readFileSync(path.join(catDir, f), 'utf8')))
}

const missing = []
for (const id of Object.keys(overlays)) {
  if (!updatedCatalog[id]) missing.push(id)
}
if (missing.length > 0) {
  console.error(`\nERROR: ${missing.length} overlay IDs missing from catalog:`, missing.join(', '))
} else {
  console.log('\nAll overlay IDs found in catalog.')
}

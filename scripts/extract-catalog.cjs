/**
 * Extract canonical emotion data from all model files
 * and generate the catalog JSON files.
 *
 * Run: node scripts/extract-catalog.cjs
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const CATALOG_DIR = path.join(ROOT, 'src/models/catalog')

// --- Read all model data ---

function readJsonDir(dir) {
  const result = {}
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
    Object.assign(result, data)
  }
  return result
}

const plutchik = readJsonDir(path.join(ROOT, 'src/models/plutchik/data'))
const wheel = readJsonDir(path.join(ROOT, 'src/models/wheel/data'))
const dimensional = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/models/dimensional/data.json'), 'utf8'))

// Extract somatic emotion signals
const somaticSignals = new Map()
const somaticDir = path.join(ROOT, 'src/models/somatic/data')
for (const f of fs.readdirSync(somaticDir).filter(f => f.endsWith('.json'))) {
  const data = JSON.parse(fs.readFileSync(path.join(somaticDir, f), 'utf8'))
  for (const region of Object.values(data)) {
    if (region.emotionSignals) {
      for (const signal of region.emotionSignals) {
        if (!somaticSignals.has(signal.emotionId) && signal.emotionDescription) {
          somaticSignals.set(signal.emotionId, signal)
        }
      }
    }
  }
}

// --- Distress tier mapping ---
const HIGH_DISTRESS = new Set([
  'despair', 'rage', 'terror', 'grief', 'shame', 'loathing',
  'worthless', 'helpless', 'apathetic',
  'empty', 'powerless', 'abandoned', 'victimized', 'numb',
  'violated', 'depressed', 'distressed',
  'hopeless', 'anguished', 'panicked',
])
const WATCH_DISTRESS = new Set(['self_blaming', 'unworthy', 'self_loathing'])

// --- Build canonical entries ---

function makeCanonical(id, source, distressTier) {
  const entry = {
    id,
    label: source.label,
    description: source.description || { ro: '', en: '' },
    needs: source.needs || { ro: '', en: '' },
    color: source.color,
  }
  if (distressTier) entry.distressTier = distressTier
  return entry
}

function distressTierFor(id) {
  if (HIGH_DISTRESS.has(id)) return 'high'
  if (WATCH_DISTRESS.has(id)) return 'watch'
  return undefined
}

// Collect all canonical entries
const catalog = {}

// 1. Plutchik primaries
const plutchikPrimaries = ['joy', 'trust', 'fear', 'surprise', 'sadness', 'disgust', 'anger', 'anticipation']
const plutchikIntensityIds = Object.keys(plutchik).filter(id => {
  const e = plutchik[id]
  return e.category === 'intensity'
})
const plutchikDyadIds = Object.keys(plutchik).filter(id => {
  const e = plutchik[id]
  return e.category === 'dyad' || e.category === 'secondary_dyad' ||
         e.category === 'tertiary_dyad' || e.category === 'opposite_dyad'
})

// All plutchik
for (const [id, e] of Object.entries(plutchik)) {
  catalog[id] = makeCanonical(id, e, distressTierFor(id))
}

// 2. Wheel - use wheel data but prefer plutchik/dimensional description if richer
for (const [id, e] of Object.entries(wheel)) {
  if (!catalog[id]) {
    catalog[id] = makeCanonical(id, e, distressTierFor(id))
  }
  // If wheel has a description but catalog doesn't, use wheel's
  if (catalog[id].description.en === '' && e.description) {
    catalog[id].description = e.description
  }
  if (catalog[id].needs.en === '' && e.needs) {
    catalog[id].needs = e.needs
  }
}

// 3. Dimensional
for (const [id, e] of Object.entries(dimensional)) {
  if (!catalog[id]) {
    catalog[id] = makeCanonical(id, e, distressTierFor(id))
  }
  // If dimensional has a richer description, prefer it
  if (catalog[id].description.en === '' && e.description) {
    catalog[id].description = e.description
  }
  if (catalog[id].needs.en === '' && e.needs) {
    catalog[id].needs = e.needs
  }
}

// 4. Somatic-only emotions (not in other models)
for (const [id, signal] of somaticSignals) {
  if (!catalog[id]) {
    catalog[id] = {
      id,
      label: signal.emotionLabel,
      description: signal.emotionDescription || { ro: '', en: '' },
      needs: signal.emotionNeeds || { ro: '', en: '' },
      color: signal.emotionColor,
    }
    const tier = distressTierFor(id)
    if (tier) catalog[id].distressTier = tier
  }
}

// --- Add missing emotions for Quick Check-in ---
// numb and overwhelmed need full entries
if (!catalog['numb']) {
  catalog['numb'] = {
    id: 'numb',
    label: { ro: 'Amorțeală', en: 'Numb' },
    description: {
      ro: 'Amorțeala emoțională este o stare de deconectare de la propriile sentimente — nu durere, nu bucurie, ci un gol protector. Poate fi un răspuns la suprasolicitare emoțională, traumă sau epuizare. Amorțeala este adesea un mecanism de protecție al minții care se activează când intensitatea emoțională depășește capacitatea de procesare. Nu este lipsă de sentimente, ci suspendarea lor temporară.',
      en: 'Emotional numbness is a state of disconnection from your own feelings — not pain, not joy, but a protective void. It can be a response to emotional overload, trauma, or exhaustion. Numbness is often a protective mechanism of the mind that activates when emotional intensity exceeds processing capacity. It is not an absence of feelings, but their temporary suspension.',
    },
    needs: {
      ro: 'reconectare treptată și siguranță',
      en: 'gradual reconnection and safety',
    },
    color: '#6B7280',
    distressTier: 'high',
  }
}

// --- Categorize into files ---

const primaryAffects = {}
const positive = {}
const negativeHigh = {}
const negativeLow = {}
const social = {}
const complex = {}
const somaticOnly = {}
const wheelBranches = {}
const wheelLeaves = {}
const plutchikVariants = {}
const dimensionalOnly = {}

// Primary affects: the 8 Plutchik primaries
for (const id of plutchikPrimaries) {
  if (catalog[id]) primaryAffects[id] = catalog[id]
}

// Plutchik variants: intensity + dyads unique to Plutchik
for (const id of [...plutchikIntensityIds, ...plutchikDyadIds]) {
  if (catalog[id] && !primaryAffects[id]) {
    // Check if it's also in wheel or dimensional
    if (!wheel[id] && !dimensional[id]) {
      plutchikVariants[id] = catalog[id]
    }
  }
}

// Dimensional only: emotions in dimensional but not in wheel or plutchik
for (const id of Object.keys(dimensional)) {
  if (!wheel[id] && !plutchik[id] && !primaryAffects[id]) {
    dimensionalOnly[id] = catalog[id]
  }
}

// Somatic-only emotions
const somaticOnlyIds = ['emotional-holding', 'emotional-withdrawal', 'disconnection', 'overwhelm', 'exhaustion', 'stress', 'worry', 'calm', 'excitement', 'tenderness', 'gratitude', 'hope', 'love', 'pride', 'guilt']
for (const id of somaticOnlyIds) {
  // Only if not in other models
  if (catalog[id] && !plutchik[id] && !wheel[id] && !dimensional[id]) {
    somaticOnly[id] = catalog[id]
  }
}

// Wheel L0 roots and L1 branches
const wheelL0 = Object.entries(wheel).filter(([, e]) => e.level === 0)
const wheelL1 = Object.entries(wheel).filter(([, e]) => e.level === 1)
const wheelL2 = Object.entries(wheel).filter(([, e]) => e.level === 2)

for (const [id] of wheelL0) {
  if (!primaryAffects[id] && !plutchikVariants[id] && !dimensionalOnly[id]) {
    wheelBranches[id] = catalog[id]
  }
}
for (const [id] of wheelL1) {
  if (!primaryAffects[id] && !plutchikVariants[id] && !dimensionalOnly[id]) {
    wheelBranches[id] = catalog[id]
  }
}

// Wheel L2 leaves
for (const [id] of wheelL2) {
  if (!primaryAffects[id] && !plutchikVariants[id] && !dimensionalOnly[id] && !somaticOnly[id]) {
    wheelLeaves[id] = catalog[id]
  }
}

// Now categorize shared/cross-model emotions
// Positive emotions (shared across models)
const positiveIds = ['serene', 'content', 'peaceful', 'satisfied', 'delighted', 'amused', 'relief', 'tender', 'compassion', 'happy', 'excited']
for (const id of positiveIds) {
  if (catalog[id] && (wheel[id] || dimensional[id]) && !primaryAffects[id]) {
    positive[id] = catalog[id]
    // Remove from other categories
    delete wheelBranches[id]
    delete wheelLeaves[id]
    delete dimensionalOnly[id]
  }
}

// Negative high emotions (shared)
const negativeHighIds = ['anxiety', 'rage', 'terror', 'grief', 'shame', 'despair', 'angry', 'frustrated', 'stressed', 'tense', 'nervous', 'distressed']
for (const id of negativeHighIds) {
  if (catalog[id] && !primaryAffects[id]) {
    negativeHigh[id] = catalog[id]
    delete wheelBranches[id]
    delete wheelLeaves[id]
    delete dimensionalOnly[id]
    delete plutchikVariants[id]
  }
}

// Negative low emotions (shared)
const negativeLowIds = ['bored', 'lonely', 'depressed', 'melancholic', 'apathetic', 'tired', 'sad', 'numb', 'resigned', 'lethargic', 'gloomy', 'pensive']
for (const id of negativeLowIds) {
  if (catalog[id] && !primaryAffects[id]) {
    negativeLow[id] = catalog[id]
    delete wheelBranches[id]
    delete wheelLeaves[id]
    delete dimensionalOnly[id]
  }
}

// Social emotions
const socialIds = ['contempt', 'jealousy', 'envy', 'embarrassed', 'love', 'pride', 'guilt']
for (const id of socialIds) {
  // Only if in multiple models
  if (catalog[id] && !primaryAffects[id] && !plutchikVariants[id]) {
    const inModels = [!!plutchik[id], !!wheel[id], !!dimensional[id], somaticSignals.has(id)].filter(Boolean).length
    if (inModels >= 2) {
      social[id] = catalog[id]
      delete wheelBranches[id]
      delete wheelLeaves[id]
      delete dimensionalOnly[id]
      delete somaticOnly[id]
    }
  }
}

// Complex emotions (shared)
const complexIds = ['nostalgia', 'dor', 'awe']
for (const id of complexIds) {
  if (catalog[id] && !primaryAffects[id]) {
    complex[id] = catalog[id]
    delete wheelBranches[id]
    delete wheelLeaves[id]
    delete dimensionalOnly[id]
    delete plutchikVariants[id]
  }
}

// Catch-all: anything in catalog not yet assigned
const allAssigned = new Set([
  ...Object.keys(primaryAffects),
  ...Object.keys(positive),
  ...Object.keys(negativeHigh),
  ...Object.keys(negativeLow),
  ...Object.keys(social),
  ...Object.keys(complex),
  ...Object.keys(somaticOnly),
  ...Object.keys(wheelBranches),
  ...Object.keys(wheelLeaves),
  ...Object.keys(plutchikVariants),
  ...Object.keys(dimensionalOnly),
])

for (const id of Object.keys(catalog)) {
  if (!allAssigned.has(id)) {
    // Determine best category
    if (plutchik[id] && !wheel[id] && !dimensional[id]) {
      plutchikVariants[id] = catalog[id]
    } else if (wheel[id] && wheel[id].level === 2) {
      wheelLeaves[id] = catalog[id]
    } else if (wheel[id] && (wheel[id].level === 0 || wheel[id].level === 1)) {
      wheelBranches[id] = catalog[id]
    } else if (dimensional[id] && !wheel[id]) {
      dimensionalOnly[id] = catalog[id]
    } else if (somaticSignals.has(id) && !plutchik[id] && !wheel[id] && !dimensional[id]) {
      somaticOnly[id] = catalog[id]
    } else {
      // Default: if negative, put in negative-high; if positive, positive; else social
      social[id] = catalog[id]
    }
  }
}

// --- Write files ---
function writeJson(filename, data) {
  const filepath = path.join(CATALOG_DIR, filename)
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2) + '\n')
  console.log(`${filename}: ${Object.keys(data).length} entries`)
}

writeJson('primary-affects.json', primaryAffects)
writeJson('positive.json', positive)
writeJson('negative-high.json', negativeHigh)
writeJson('negative-low.json', negativeLow)
writeJson('social.json', social)
writeJson('complex.json', complex)
writeJson('somatic-only.json', somaticOnly)
writeJson('wheel-branches.json', wheelBranches)
writeJson('wheel-leaves.json', wheelLeaves)
writeJson('plutchik-variants.json', plutchikVariants)
writeJson('dimensional-only.json', dimensionalOnly)

// Verify completeness
const allWritten = new Set([
  ...Object.keys(primaryAffects),
  ...Object.keys(positive),
  ...Object.keys(negativeHigh),
  ...Object.keys(negativeLow),
  ...Object.keys(social),
  ...Object.keys(complex),
  ...Object.keys(somaticOnly),
  ...Object.keys(wheelBranches),
  ...Object.keys(wheelLeaves),
  ...Object.keys(plutchikVariants),
  ...Object.keys(dimensionalOnly),
])

const missing = Object.keys(catalog).filter(id => !allWritten.has(id))
console.log(`\nTotal in catalog: ${Object.keys(catalog).length}`)
console.log(`Total written: ${allWritten.size}`)
if (missing.length > 0) {
  console.log(`Missing (${missing.length}):`)
  missing.forEach(id => console.log(`  ${id}`))
}

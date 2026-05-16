/**
 * Verifies matching logic + dual localStorage keys (no Vite import).
 * Run: node scripts/verify-matching.mjs
 */

const SKETCHAI_KEY = 'sketchai_reports'
const CRIMINAL_KEY = 'clearsight-criminal-reports'

const MATCH_FIELDS = [
  { key: 'face_shape', formKey: 'faceShape' },
  { key: 'skin_tone', formKey: 'skinTone' },
  { key: 'age_range', formKey: 'ageRange' },
  { key: 'eye_shape', formKey: 'eyeShape' },
  { key: 'eye_color', formKey: 'eyeColor' },
  { key: 'nose_type', formKey: 'noseType' },
  { key: 'hair_color', formKey: 'hairColor' },
  { key: 'hair_length', formKey: 'hairLength' },
  { key: 'facial_hair', formKey: 'facialHair' },
  { key: 'build', formKey: 'build' },
  { key: 'height', formKey: 'height' },
  { key: 'glasses', formKey: 'glasses' },
]

function normalizeValue(value) {
  if (value == null) return ''
  return String(value).trim().toLowerCase()
}

function getDescriptorValue(obj, dbKey, formKey) {
  if (!obj || typeof obj !== 'object') return ''
  if (obj[dbKey] != null && obj[dbKey] !== '') return obj[dbKey]
  if (obj[formKey] != null && obj[formKey] !== '') return obj[formKey]
  return obj[dbKey] ?? obj[formKey] ?? ''
}

function getMatchType(score) {
  if (score >= 90) return 'exact'
  if (score >= 70) return 'high'
  if (score >= 50) return 'possible'
  return null
}

function normalizeStoredReport(report) {
  if (!report || typeof report !== 'object') return null
  const reportId = report.reportId ?? report.id
  if (!reportId) return null
  const caseNumber = report.caseNumber ?? report.case_number ?? ''
  const createdDate = report.createdDate ?? report.created_at ?? ''
  const descriptors =
    report.descriptors && typeof report.descriptors === 'object'
      ? report.descriptors
      : report
  return { reportId, caseNumber, createdDate, descriptors }
}

function compareDescriptors(currentDescriptors, savedDescriptors) {
  const matchedFields = []
  const unmatchedFields = []
  let comparedCount = 0

  for (const { key, formKey } of MATCH_FIELDS) {
    const left = getDescriptorValue(currentDescriptors, key, formKey)
    const right = getDescriptorValue(savedDescriptors, key, formKey)
    const leftNorm = normalizeValue(left)
    const rightNorm = normalizeValue(right)
    if (leftNorm === '' && rightNorm === '') continue
    comparedCount += 1
    if (leftNorm === rightNorm) matchedFields.push(key)
    else unmatchedFields.push(key)
  }

  const matchScore =
    comparedCount > 0
      ? Math.round((matchedFields.length / comparedCount) * 100)
      : 0

  return { matchScore, matchedFields, unmatchedFields }
}

function findMatches(currentDescriptors, reports) {
  return reports
    .map((report) => {
      const { matchScore, matchedFields, unmatchedFields } = compareDescriptors(
        currentDescriptors,
        report.descriptors,
      )
      const matchType = getMatchType(matchScore)
      if (!matchType) return null
      return {
        caseNumber: report.caseNumber,
        matchScore,
        matchType,
        matchedFields,
        unmatchedFields,
        reportId: report.reportId,
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.matchScore - a.matchScore)
}

function loadReportsForMatching(storage) {
  const byId = new Map()

  const sketchRaw = storage.get(SKETCHAI_KEY)
  const sketch = sketchRaw ? JSON.parse(sketchRaw) : []
  for (const report of sketch) {
    const normalized = normalizeStoredReport(report)
    if (normalized) byId.set(normalized.reportId, normalized)
  }

  const criminalRaw = storage.get(CRIMINAL_KEY)
  const criminal = criminalRaw ? JSON.parse(criminalRaw) : []
  for (const report of criminal) {
    const normalized = normalizeStoredReport(report)
    if (normalized && !byId.has(normalized.reportId)) {
      byId.set(normalized.reportId, normalized)
    }
  }

  return [...byId.values()]
}

// --- fixtures ---
const storage = new Map()

storage.set(
  CRIMINAL_KEY,
  JSON.stringify([
    {
      id: 'criminal-aaa',
      case_number: 'CR-2026-1001',
      created_at: '2026-05-17T10:00:00.000Z',
      face_shape: 'Oval',
      skin_tone: 'Medium',
      age_range: '30s',
      eye_shape: 'Almond',
      eye_color: 'Brown',
      nose_type: 'Straight',
      hair_color: 'Black',
      hair_length: 'Short',
      facial_hair: 'None',
      build: 'Medium',
      height: 'Average',
      glasses: 'None',
    },
    {
      id: 'criminal-bbb',
      case_number: 'CR-2026-1002',
      created_at: '2026-05-17T11:00:00.000Z',
      face_shape: 'Oval',
      skin_tone: 'Medium',
      age_range: '30s',
      eye_shape: 'Almond',
      eye_color: 'Brown',
      nose_type: 'Straight',
      hair_color: 'Black',
      hair_length: 'Short',
      facial_hair: 'Clean shaven',
      build: 'Medium',
      height: 'Average',
      glasses: 'None',
    },
  ]),
)

storage.set(
  SKETCHAI_KEY,
  JSON.stringify([
    {
      reportId: 'sketch-ccc',
      caseNumber: 'CSR-2026-0099',
      descriptors: { faceShape: 'Round', skinTone: 'Dark', ageRange: '20s' },
    },
  ]),
)

const witnessForm = {
  faceShape: 'Oval',
  skinTone: 'Medium',
  ageRange: '30s',
  eyeShape: 'Almond',
  eyeColor: 'Brown',
  noseType: 'Straight',
  hairColor: 'Black',
  hairLength: 'Short',
  facialHair: 'None',
  build: 'Medium',
  height: 'Average',
  glasses: 'None',
}

const reports = loadReportsForMatching(storage)
const matches = findMatches(witnessForm, reports)

console.log('--- verify-matching ---')
console.log('Reports loaded:', reports.length, '(expect 3)')
console.log('Matches found:', matches.length)

for (const m of matches) {
  console.log(
    `  ${m.matchType.toUpperCase()} ${m.matchScore}% | ${m.caseNumber} | ${m.reportId}`,
  )
}

let failed = false

if (reports.length !== 3) {
  console.error('FAIL: Expected 3 reports from both stores')
  failed = true
}

const criminalMatches = matches.filter((m) =>
  String(m.reportId).startsWith('criminal-'),
)
if (criminalMatches.length < 2) {
  console.error(
    'FAIL: Expected 2 matches from clearsight-criminal-reports (Save Report path)',
  )
  failed = true
}

const top = matches[0]
if (!top || top.matchScore < 90) {
  console.error('FAIL: Top match should be exact (>=90%) for near-identical descriptors')
  failed = true
}

const lowOverlap = findMatches(
  { faceShape: 'Round', skinTone: 'Dark' },
  reports,
)
if (lowOverlap.some((m) => m.reportId === 'sketch-ccc' && m.matchScore < 50)) {
  console.error('FAIL: sketch-ccc should not match weak partial descriptors')
  failed = true
}

if (failed) process.exit(1)
console.log('PASS: Matching logic and dual-store loading behave as expected.')

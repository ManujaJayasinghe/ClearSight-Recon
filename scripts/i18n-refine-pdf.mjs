import { readFileSync, writeFileSync } from 'node:fs'

// RefinementPage
let refine = readFileSync('src/pages/RefinementPage.jsx', 'utf8')
if (!refine.includes('useTranslation')) {
  refine = refine.replace(
    "import { useCallback, useEffect, useMemo, useRef, useState } from 'react'",
    "import { useCallback, useEffect, useMemo, useRef, useState } from 'react'\nimport { useTranslation } from 'react-i18next'",
  )
  refine = refine.replace(
    `const STATUS_MESSAGES = {
  [GenerationStatus.BUILDING_PROMPT]: 'Building portrait prompt…',
  [GenerationStatus.REQUESTING]: 'Regenerating composite…',
}
`,
    '',
  )
  refine = refine.replace(
    'export default function RefinementPage() {\n  const location = useLocation()',
    `export default function RefinementPage() {
  const { t } = useTranslation()
  const STATUS_MESSAGES = useMemo(
    () => ({
      [GenerationStatus.BUILDING_PROMPT]: t('refine.statusBuilding'),
      [GenerationStatus.REQUESTING]: t('refine.statusRegenerating'),
    }),
    [t],
  )
  const location = useLocation()`,
  )
  refine = refine.replace(
    "createHistoryEntry(imageUrl, description, 'Original', seed)",
    "createHistoryEntry(imageUrl, description, t('refine.original'), seed)",
  )
  refine = refine.replace(
    "showToast(`Restored: ${entry.label}`)",
    "showToast(t('refine.restored', { label: entry.label }))",
  )
  refine = refine.replace(
    'err?.message ??\n            \'Could not regenerate the sketch. Please try another adjustment.\',',
    "err?.message ?? t('refine.regenFailed')",
  )
  refine = refine.replace(
    "showToast('Regeneration failed. Please try again.', 'error')",
    "showToast(t('refine.regenFailedToast'), 'error')",
  )
  refine = refine.replace(
    "setStatusMessage(STATUS_MESSAGES[status] ?? 'Processing…')",
    "setStatusMessage(STATUS_MESSAGES[status] ?? t('refine.statusProcessing'))",
  )
  refine = refine.replace(
    'showToast(`${label} — sketch updated`)',
    "showToast(t('refine.sketchUpdated', { label }))",
  )
}

const refineShortcutKeys = ['nose', 'hair', 'beard', 'eyes', 'age', 'skin']
refine = refine.replace(
  `{REFINEMENT_SHORTCUT_GROUPS.map(({ keys, description }) => (
                <li key={keys}>
                  <span className="refine-shortcuts__keys">{keys}</span>
                  {description}
                </li>
              ))}`,
  `{REFINEMENT_SHORTCUT_GROUPS.map(({ keys }, index) => (
                <li key={keys}>
                  <span className="refine-shortcuts__keys">{keys}</span>
                  {t(\`refine.shortcuts.\${['nose', 'hair', 'beard', 'eyes', 'age', 'skin'][index]}\`)}
                </li>
              ))}`,
)

refine = refine.replace(
  `<span className="refine-controls__group-label">{group}</span>`,
  `<span className="refine-controls__group-label">{t(\`refine.groups.\${group}\`, { defaultValue: group })}</span>`,
)
refine = refine.replace(
  `<span className="refine-btn__label">{label}</span>`,
  `<span className="refine-btn__label">{t(\`refine.controls.\${id}\`, { defaultValue: label })}</span>`,
)

const refineText = [
  ['Step 3 — Refinement', "t('refine.eyebrow')"],
  ['Sketch Refinement', "t('refine.title')"],
  [
    'Generate a composite on the result page before refining features.',
    "t('refine.missingDescription')",
  ],
  ['Go to Sketch Result', "t('refine.goToResult')"],
  [
    'Adjust features and regenerate the composite until it matches witness\n          testimony. Select any recent version below to compare or restore.',
    "t('refine.description')",
  ],
  ['Current composite sketch', "t('refine.previewAria')"],
  ['Current Composite', "t('refine.currentComposite')"],
  ['Refined composite sketch', "t('refine.refinedAlt')"],
  [
    'Applying adjustment and regenerating sketch…',
    "t('refine.statusApplying')",
  ],
  ['Viewing: ${activeEntry.label}', "t('refine.statusViewing', { label: activeEntry.label })"],
  ['Loading sketch…', "t('refine.statusLoading')"],
  ['Quick adjustments', "t('refine.controlsAria')"],
  ['Quick Adjustments', "t('refine.quickAdjustments')"],
  [
    'Each control updates the witness description and generates a new\n            composite. Hold <kbd>Alt</kbd> and press a shortcut key for faster\n            adjustments.',
    '{t(\'refine.controlsSub\')}',
  ],
  ['Keyboard shortcuts', "t('refine.shortcutsTitle')"],
  ['This Looks Right — Export PDF', "t('refine.exportPdf')"],
  ['Version history', "t('refine.historyAria')"],
  ['Version History', "t('refine.historyTitle')"],
  [
    'Last {MAX_HISTORY} generated versions — click a thumbnail to restore',
    "{t('refine.historySub', { count: MAX_HISTORY })}",
  ],
  ['`Slot ${index + 1}`', "t('refine.slot', { n: index + 1 })"],
  ['`Restore ${entry.label}`', "t('refine.restoreAria', { label: entry.label })"],
  ['Back to Report', "t('refine.backToReport')"],
]

for (const [from, to] of refineText) {
  if (from.includes('${')) {
    // skip complex
    continue
  }
  if (refine.includes(from)) {
    if (to.startsWith('t(') || to.startsWith('{t(')) {
      const jsx = to.startsWith('{') ? to : `{${to}}`
      refine = refine.replaceAll(from, jsx.replace(/^\{|\}$/g, '').startsWith('t') ? `{${to}}` : to)
    }
  }
}

writeFileSync('src/pages/RefinementPage.jsx', refine)

// PdfExportPage
let pdf = readFileSync('src/pages/PdfExportPage.jsx', 'utf8')
if (!pdf.includes('useTranslation')) {
  pdf = pdf.replace(
    "import { Link, useLocation } from 'react-router-dom'",
    "import { Link, useLocation } from 'react-router-dom'\nimport { useTranslation } from 'react-i18next'",
  )
  pdf = pdf.replace(
    'export default function PdfExportPage() {\n  const location = useLocation()',
    'export default function PdfExportPage() {\n  const { t } = useTranslation()\n  const location = useLocation()',
  )
}

const pdfPairs = [
  ['Step 4 — Export', "{t('pdf.eyebrow')}"],
  ['PDF Export', "{t('pdf.title')}"],
  [
    'Generate an official forensic composite report for case documentation\n          and distribution to authorized personnel.',
    "{t('pdf.description')}",
  ],
  ['Official Composite Report', "{t('pdf.officialReport')}"],
  ['Front View', "{t('pdf.frontView')}"],
  ['Side Profile', "{t('pdf.sideProfile')}"],
  ['Front view composite', "{t('pdf.frontAlt')}"],
  ['Side profile composite', "{t('pdf.sideAlt')}"],
  ['Front composite', "{t('pdf.frontPlaceholder')}"],
  ['Side profile not generated', "{t('pdf.sideNotGenerated')}"],
  ['<strong>Case ID:</strong>', '<strong>{t(\'pdf.caseId\')}</strong>'],
  ['<strong>Date:</strong>', '<strong>{t(\'pdf.date\')}</strong>'],
  ['<strong>Investigator:</strong>', '<strong>{t(\'pdf.investigator\')}</strong>'],
  ['<strong>Witness ID:</strong>', '<strong>{t(\'pdf.witnessId\')}</strong>'],
  ['<strong>Age range:</strong>', '<strong>{t(\'pdf.ageRange\')}</strong>'],
  ['[Authorized User]', "{t('pdf.authorizedUser')}"],
  ['OFFICIAL USE ONLY', "{t('pdf.officialStamp')}"],
  [
    'No composite images were provided. Complete generation on the result\n          page first.',
    "{t('pdf.noImagesError')}",
  ],
  ['Export Options', "{t('pdf.exportOptions')}"],
  ['Case ID', "{t('pdf.caseId').replace(':', '')}"],
  ['Lead Investigator', "{t('pdf.leadInvestigator')}"],
  ['Name and badge number', "{t('pdf.investigatorPlaceholder')}"],
  ['Report Notes', "{t('pdf.reportNotes')}"],
  [
    'Optional notes to include in the PDF footer',
    "{t('pdf.notesPlaceholder')}",
  ],
  ['Back to Refinement', "{t('pdf.backToRefine')}"],
  ['Download PDF Report', "{t('pdf.downloadPdf')}"],
  ['New Session', "{t('pdf.newSession')}"],
]

for (const [from, to] of pdfPairs) {
  if (pdf.includes(from)) {
    pdf = pdf.replaceAll(from, to)
  }
}

writeFileSync('src/pages/PdfExportPage.jsx', pdf)
console.log('Updated RefinementPage and PdfExportPage')

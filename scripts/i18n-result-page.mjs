import { readFileSync, writeFileSync } from 'node:fs'

let s = readFileSync('src/pages/ResultPage.jsx', 'utf8')

if (!s.includes('useTranslation')) {
  s = s.replace(
    "import { useEffect, useMemo, useRef, useState } from 'react'",
    "import { useEffect, useMemo, useRef, useState } from 'react'\nimport { useTranslation } from 'react-i18next'",
  )
  s = s.replace(
    'const VARIATION_COUNT = 3\n\nconst STATUS_MESSAGES = {',
    'const VARIATION_COUNT = 3\n\nfunction useStatusMessages(t) {\n  return useMemo(\n    () => ({\n      [GenerationStatus.BUILDING_PROMPT]: t(\'result.statusBuildingPrompt\'),\n      [GenerationStatus.REQUESTING]: t(\'result.statusRequesting\', { count: VARIATION_COUNT }),\n    }),\n    [t],\n  )\n}\n\nfunction useSideStatusMessages(t) {\n  return useMemo(\n    () => ({\n      [GenerationStatus.BUILDING_PROMPT]: t(\'result.statusSideBuilding\'),\n      [GenerationStatus.REQUESTING]: t(\'result.statusSideRequesting\'),\n    }),\n    [t],\n  )\n}\n\nconst _REMOVED_STATUS_MESSAGES = {',
  )
  s = s.replace(
    `const STATUS_MESSAGES = {
  [GenerationStatus.BUILDING_PROMPT]: 'Building portrait prompt…',
  [GenerationStatus.REQUESTING]: \`Generating \${VARIATION_COUNT} composite variations (may take 3–6 minutes)…\`,
}

const SIDE_STATUS_MESSAGES = {
  [GenerationStatus.BUILDING_PROMPT]: 'Building side-profile prompt…',
  [GenerationStatus.REQUESTING]: 'Generating side profile…',
}

`,
    '',
  )
  s = s.replace(
    'export default function ResultPage() {\n  const location = useLocation()',
    'export default function ResultPage() {\n  const { t } = useTranslation()\n  const STATUS_MESSAGES = useStatusMessages(t)\n  const SIDE_STATUS_MESSAGES = useSideStatusMessages(t)\n  const location = useLocation()',
  )
}

// Remove leftover _REMOVED block if script run twice
s = s.replace(
  /const _REMOVED_STATUS_MESSAGES = \{[\s\S]*?\}\n\n/,
  '',
)

const pairs = [
  ['Step 2 — Generation', "t('result.eyebrow')"],
  ['Suspect Composite Report', "t('result.title')"],
  [
    'No witness description was provided. Complete the witness form to\n            generate a composite sketch.',
    "t('result.missingDescription')",
  ],
  ['Go to Witness Form', "t('result.goToForm')"],
  ['Case Reference', "t('result.caseReference')"],
  ['Generated', "t('result.generated')"],
  ['In progress…', "t('result.inProgress')"],
  ['Primary Composite — Subject No. 1', "t('result.primaryComposite')"],
  ['Select the closest match', "t('result.selectMatchAria')"],
  [
    'Select the variation that best matches the witness description.',
    "t('result.variationsHint')",
  ],
  ['Front View', "t('result.frontView')"],
  ['Side Profile', "t('result.sideProfile')"],
  ['Generation failed', "t('result.generationFailed')"],
  ['Side profile failed', "t('result.sideProfileFailed')"],
  ['Try Again', "t('result.tryAgain')"],
  ['Front view suspect composite', "t('result.frontAlt')"],
  ['Side profile suspect composite', "t('result.sideAlt')"],
  [
    'Generate a 90° side-profile view from the same witness\n                        description.',
    "t('result.sidePlaceholder')",
  ],
  ['Generating Side Profile…', "t('result.generatingSide')"],
  ['Generate Side Profile', "t('result.generateSide')"],
  ['Regenerating…', "t('result.regenerating')"],
  ['Regenerate Side Profile', "t('result.regenerateSide')"],
  [
    'Witness Description Summary',
    "t('result.summaryHeading')",
  ],
  [
    'Consolidated intake fields submitted during composite session.\n                Verify accuracy before refinement or export.',
    "t('result.summarySub')",
  ],
  [
    'No witness details were entered. Return to the form to add a\n                    description.',
    "t('result.summaryEmpty')",
  ],
  ['Generating composite…', "t('result.generatingBadge')"],
  [
    'This report is for investigative use only. Distribution limited to\n              authorized personnel. Composite subject to witness verification.',
    "t('result.footerNote')",
  ],
  ['Report actions', "t('result.reportActionsAria')"],
  ['Refine This Sketch', "t('result.refineSketch')"],
  ['Export PDF', "t('result.exportPdf')"],
  ['Start Over', "t('result.startOver')"],
  ['Official Use Only', "t('result.officialStamp')"],
  [
    'Generation is in progress. Leave and return to the form?',
    "t('result.leaveConfirm')",
  ],
  [
    'Unable to generate the composite sketch. Please try again.',
    "t('result.errorFront')",
  ],
  [
    'Unable to generate the side profile. Please try again.',
    "t('result.errorSide')",
  ],
  ['Processing…', "t('result.statusProcessing')"],
  [
    `${'{urls.length}'} composite variations generated`,
    "t('result.toastVariations', { count: urls.length })",
  ],
  ['Front composite generation failed', "t('result.toastFrontFailed')"],
  ['Side profile generated successfully', "t('result.toastSideSuccess')"],
  ['Side profile generation failed', "t('result.toastSideFailed')"],
]

for (const [from, to] of pairs) {
  if (s.includes(from)) {
    s = s.replaceAll(from, `{${to.replace(/^t\(/, '').replace(/\)$/, '')}}`) // skip broken
  }
}

writeFileSync('src/pages/ResultPage.jsx', s)
console.log('Partial update - manual review needed')

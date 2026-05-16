import { readFileSync, writeFileSync } from 'node:fs'

let s = readFileSync('src/pages/WitnessFormPage.jsx', 'utf8')

if (!s.includes('useTranslation')) {
  s = s.replace(
    "import { useMemo, useState, useCallback } from 'react'",
    "import { useMemo, useState, useCallback } from 'react'\nimport { useTranslation } from 'react-i18next'",
  )
  s = s.replace(
    "import { FORM_SECTIONS } from '../constants/witnessFormSections'",
    "import { FORM_SECTIONS } from '../constants/witnessFormSections'\nimport { translateSectionTitle } from '../i18n/formOption'",
  )
  s = s.replace(
    'export default function WitnessFormPage() {\n  const navigate = useNavigate()',
    "export default function WitnessFormPage() {\n  const { t } = useTranslation()\n  const navigate = useNavigate()\n  const fl = (key) => t(`form.fields.${key}`)",
  )
}

s = s.replace(/label="[^"]*"\r?\n(\s+name="([^"]+)")/g, (m, namePart, field) => {
  if (field === 'scarLocation') {
    return `label={t('form.scarLocationLabel')}\n${namePart}`
  }
  return `label={fl('${field}')}\n${namePart}`
})

s = s.replace(/(<FormSelect[\s\S]*?\n\s+name="([^"]+)")/g, (m, tag, field) => {
  if (tag.includes('optionField')) return m
  return `${tag}\n              optionField="${field}"`
})

s = s.replaceAll('placeholder="Select…"', "placeholder={t('form.selectPlaceholder')}")
s = s.replaceAll(
  'placeholder="Select location"',
  "placeholder={t('form.selectLocation')}",
)
s = s.replace(
  "'Clear all witness description fields? This cannot be undone.'",
  "t('form.clearConfirm')",
)
s = s.replace(
  "setSubmitError('Please complete all required fields before generating.')",
  "setSubmitError(t('form.submitError'))",
)
s = s.replace(
  '<span className="page__eyebrow">Step 1 — Intake</span>',
  '<span className="page__eyebrow">{t(\'form.eyebrow\')}</span>',
)
s = s.replace(
  '<h1 className="page__title">Witness Description Form</h1>',
  '<h1 className="page__title">{t(\'form.title\')}</h1>',
)
s = s.replace(
  /<p className="page__description">[\s\S]*?<\/p>/,
  '<p className="page__description">{t(\'form.description\')}</p>',
)
s = s.replace('title={section.title}', 'title={translateSectionTitle(section.id)}')
s = s.replace('>Clear Form<', ">{t('form.clearForm')}<")
s = s.replace('>Generate Composite Sketch<', ">{t('form.generateSketch')}<")

const ph = {
  scars: 'form.placeholders.scars',
  tattoos: 'form.placeholders.tattoos',
  birthmarks: 'form.placeholders.birthmarks',
  otherFeatures: 'form.placeholders.otherFeatures',
}
for (const [field, key] of Object.entries(ph)) {
  s = s.replace(
    new RegExp(`name="${field}"[\\s\\S]*?placeholder="[^"]*"`, 'm'),
    (block) => block.replace(/placeholder="[^"]*"/, `placeholder={t('${key}')}`),
  )
}

writeFileSync('src/pages/WitnessFormPage.jsx', s)
console.log('Updated WitnessFormPage.jsx')

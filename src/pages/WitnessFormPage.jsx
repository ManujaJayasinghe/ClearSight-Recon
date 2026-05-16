import { useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import CollapsibleFormSection from '../components/CollapsibleFormSection'
import FormProgressBar from '../components/FormProgressBar'
import FormSectionNav from '../components/FormSectionNav'
import FormSelect from '../components/FormSelect'
import {
  INITIAL_WITNESS_FORM,
  FACE_STRUCTURE_FIELDS,
  FORM_OPTIONS,
  FIELD_LABELS,
} from '../constants/witnessForm'
import { FORM_SECTIONS } from '../constants/witnessFormSections'
import { getFormProgress } from '../utils/witnessFormProgress'
import './Page.css'
import './WitnessFormPage.css'

function FormTextarea({ id, name, label, value, onChange, placeholder }) {
  return (
    <div className="form-field form-field--full">
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  )
}

function validateFaceStructure(form) {
  const errors = {}
  for (const field of FACE_STRUCTURE_FIELDS) {
    if (!form[field]?.trim()) {
      errors[field] = `${FIELD_LABELS[field]} is required`
    }
  }
  return errors
}

function sectionDomId(sectionId) {
  return `section-${sectionId}`
}

export default function WitnessFormPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL_WITNESS_FORM)
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [openSectionId, setOpenSectionId] = useState(FORM_SECTIONS[0].id)

  const progress = useMemo(() => getFormProgress(form), [form])

  const scrollToSection = useCallback((sectionId) => {
    setOpenSectionId(sectionId)
    requestAnimationFrame(() => {
      document.getElementById(sectionDomId(sectionId))?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }, [])

  const goToAdjacentSection = useCallback(
    (direction, currentId) => {
      const index = FORM_SECTIONS.findIndex((s) => s.id === currentId)
      const nextIndex = index + direction
      if (nextIndex >= 0 && nextIndex < FORM_SECTIONS.length) {
        scrollToSection(FORM_SECTIONS[nextIndex].id)
      }
    },
    [scrollToSection],
  )

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleClearForm = () => {
    if (
      !window.confirm(
        'Clear all witness description fields? This cannot be undone.',
      )
    ) {
      return
    }
    setForm({ ...INITIAL_WITNESS_FORM })
    setFieldErrors({})
    setSubmitError('')
    setOpenSectionId(FORM_SECTIONS[0].id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    const errors = validateFaceStructure(form)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      scrollToSection('face')
      return
    }

    setFieldErrors({})
    navigate('/result', { state: { description: form } })
  }

  const renderSectionFields = (sectionId) => {
    switch (sectionId) {
      case 'face':
        return (
          <>
            <FormSelect
              id="faceShape"
              name="faceShape"
              label="Face shape"
              value={form.faceShape}
              options={FORM_OPTIONS.faceShape}
              onChange={handleChange}
              required
              error={fieldErrors.faceShape}
            />
            <FormSelect
              id="skinTone"
              name="skinTone"
              label="Skin tone"
              value={form.skinTone}
              options={FORM_OPTIONS.skinTone}
              onChange={handleChange}
              required
              error={fieldErrors.skinTone}
            />
            <FormSelect
              id="ageRange"
              name="ageRange"
              label="Age range"
              value={form.ageRange}
              options={FORM_OPTIONS.ageRange}
              onChange={handleChange}
              required
              error={fieldErrors.ageRange}
            />
          </>
        )
      case 'eyes':
        return (
          <>
            <FormSelect
              id="eyeShape"
              name="eyeShape"
              label="Eye shape"
              value={form.eyeShape}
              options={FORM_OPTIONS.eyeShape}
              onChange={handleChange}
            />
            <FormSelect
              id="eyeColor"
              name="eyeColor"
              label="Eye color"
              value={form.eyeColor}
              options={FORM_OPTIONS.eyeColor}
              onChange={handleChange}
            />
            <FormSelect
              id="eyeSize"
              name="eyeSize"
              label="Eye size"
              value={form.eyeSize}
              options={FORM_OPTIONS.eyeSize}
              onChange={handleChange}
            />
          </>
        )
      case 'nose':
        return (
          <>
            <FormSelect
              id="noseType"
              name="noseType"
              label="Nose type"
              value={form.noseType}
              options={FORM_OPTIONS.noseType}
              onChange={handleChange}
            />
            <FormSelect
              id="noseSize"
              name="noseSize"
              label="Nose size"
              value={form.noseSize}
              options={FORM_OPTIONS.noseSize}
              onChange={handleChange}
            />
          </>
        )
      case 'mouth':
        return (
          <>
            <FormSelect
              id="lipThickness"
              name="lipThickness"
              label="Lip thickness"
              value={form.lipThickness}
              options={FORM_OPTIONS.lipThickness}
              onChange={handleChange}
            />
            <FormSelect
              id="mouthWidth"
              name="mouthWidth"
              label="Mouth width"
              value={form.mouthWidth}
              options={FORM_OPTIONS.mouthWidth}
              onChange={handleChange}
            />
          </>
        )
      case 'hair':
        return (
          <>
            <FormSelect
              id="hairColor"
              name="hairColor"
              label="Hair color"
              value={form.hairColor}
              options={FORM_OPTIONS.hairColor}
              onChange={handleChange}
            />
            <FormSelect
              id="hairLength"
              name="hairLength"
              label="Hair length"
              value={form.hairLength}
              options={FORM_OPTIONS.hairLength}
              onChange={handleChange}
            />
            <FormSelect
              id="hairStyle"
              name="hairStyle"
              label="Hair style"
              value={form.hairStyle}
              options={FORM_OPTIONS.hairStyle}
              onChange={handleChange}
            />
          </>
        )
      case 'facial-hair':
        return (
          <FormSelect
            id="facialHair"
            name="facialHair"
            label="Facial hair"
            value={form.facialHair}
            options={FORM_OPTIONS.facialHair}
            onChange={handleChange}
          />
        )
      case 'distinguishing':
        return (
          <>
            <FormTextarea
              id="scars"
              name="scars"
              label="Scars (location and description)"
              value={form.scars}
              onChange={handleChange}
              placeholder="e.g. scar on left cheek"
            />
            <FormTextarea
              id="tattoos"
              name="tattoos"
              label="Tattoos (location and type)"
              value={form.tattoos}
              onChange={handleChange}
              placeholder="e.g. tribal tattoo on right forearm"
            />
            <FormTextarea
              id="birthmarks"
              name="birthmarks"
              label="Birthmarks or moles"
              value={form.birthmarks}
              onChange={handleChange}
              placeholder="e.g. mole below right eye"
            />
            <FormSelect
              id="glasses"
              name="glasses"
              label="Glasses"
              value={form.glasses}
              options={FORM_OPTIONS.glasses}
              onChange={handleChange}
            />
            <FormTextarea
              id="otherFeatures"
              name="otherFeatures"
              label="Other notable features"
              value={form.otherFeatures}
              onChange={handleChange}
              placeholder="Any additional distinguishing details"
            />
          </>
        )
      case 'build':
        return (
          <>
            <FormSelect
              id="height"
              name="height"
              label="Height"
              value={form.height}
              options={FORM_OPTIONS.height}
              onChange={handleChange}
            />
            <FormSelect
              id="build"
              name="build"
              label="Build"
              value={form.build}
              options={FORM_OPTIONS.build}
              onChange={handleChange}
            />
          </>
        )
      default:
        return null
    }
  }

  return (
    <article className="page witness-form-page">
      <header className="page__header">
        <span className="page__eyebrow">Step 1 — Intake</span>
        <h1 className="page__title">Witness Description Form</h1>
        <p className="page__description">
          Complete each section below. Face structure is required before
          generating a sketch. Use the section shortcuts to jump between groups.
        </p>
      </header>

      <div className="form-sticky-toolbar">
        <FormProgressBar
          completedCount={progress.completedCount}
          totalCount={progress.totalCount}
          percent={progress.percent}
        />
        <FormSectionNav
          completedIds={progress.completedIds}
          activeSectionId={openSectionId}
          onJump={scrollToSection}
        />
      </div>

      <form onSubmit={handleSubmit} noValidate className="witness-form">
        {FORM_SECTIONS.map((section, index) => (
          <CollapsibleFormSection
            key={section.id}
            id={sectionDomId(section.id)}
            title={section.title}
            isOpen={openSectionId === section.id}
            onToggle={() => {
              const willOpen = openSectionId !== section.id
              setOpenSectionId(willOpen ? section.id : '')
              if (willOpen) {
                requestAnimationFrame(() => {
                  document
                    .getElementById(sectionDomId(section.id))
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                })
              }
            }}
            isComplete={progress.completedIds.has(section.id)}
            isRequired={section.required}
            hasPrev={index > 0}
            hasNext={index < FORM_SECTIONS.length - 1}
            onPrev={() => goToAdjacentSection(-1, section.id)}
            onNext={() => goToAdjacentSection(1, section.id)}
          >
            {renderSectionFields(section.id)}
          </CollapsibleFormSection>
        ))}

        {submitError ? (
          <p className="form-submit-error" role="alert">
            {submitError}
          </p>
        ) : null}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn--secondary btn--large"
            onClick={handleClearForm}
          >
            Clear Form
          </button>
          <button type="submit" className="btn btn--primary btn--large">
            Generate Composite Sketch
          </button>
        </div>
      </form>
    </article>
  )
}

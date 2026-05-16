import { useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import CollapsibleFormSection from '../components/CollapsibleFormSection'
import FormProgressBar from '../components/FormProgressBar'
import FormSectionNav from '../components/FormSectionNav'
import FormSelect from '../components/FormSelect'
import {
  INITIAL_WITNESS_FORM,
  FORM_OPTIONS,
  REQUIRED_FIELDS,
} from '../constants/witnessForm'
import { FORM_SECTIONS } from '../constants/witnessFormSections'
import {
  getFormProgress,
  validateRequiredFields,
  getFirstSectionWithErrors,
} from '../utils/witnessFormProgress'
import './Page.css'
import './WitnessFormPage.css'

function FormTextarea({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  error,
}) {
  return (
    <div
      className={`form-field form-field--full${error ? ' form-field--error' : ''}`}
    >
      <label htmlFor={id}>
        {label}
        {required ? <span className="form-field__required"> *</span> : null}
      </label>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error ? (
        <span id={`${id}-error`} className="form-field__error" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  )
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

  const fieldProps = (name) => ({
    required: REQUIRED_FIELDS.has(name),
    error: fieldErrors[name],
  })

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
    setForm((prev) => {
      const next = { ...prev, [name]: value }
      if (name === 'scarLocation' && value === 'None') {
        next.scars = ''
      }
      if (name === 'birthmarkLocation' && value === 'None') {
        next.birthmarks = ''
      }
      return next
    })
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

    const errors = validateRequiredFields(form)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setSubmitError('Please complete all required fields before generating.')
      scrollToSection(getFirstSectionWithErrors(errors))
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
              id="gender"
              name="gender"
              label="Gender"
              value={form.gender}
              options={FORM_OPTIONS.gender}
              onChange={handleChange}
              {...fieldProps('gender')}
            />
            <FormSelect
              id="ethnicity"
              name="ethnicity"
              label="Ethnicity / regional origin"
              value={form.ethnicity}
              options={FORM_OPTIONS.ethnicity}
              onChange={handleChange}
            />
            <FormSelect
              id="faceShape"
              name="faceShape"
              label="Face shape"
              value={form.faceShape}
              options={FORM_OPTIONS.faceShape}
              onChange={handleChange}
              {...fieldProps('faceShape')}
            />
            <FormSelect
              id="skinTone"
              name="skinTone"
              label="Skin tone"
              value={form.skinTone}
              options={FORM_OPTIONS.skinTone}
              onChange={handleChange}
            />
            <FormSelect
              id="ageRange"
              name="ageRange"
              label="Age range"
              value={form.ageRange}
              options={FORM_OPTIONS.ageRange}
              onChange={handleChange}
            />
            <FormSelect
              id="foreheadSize"
              name="foreheadSize"
              label="Forehead size"
              value={form.foreheadSize}
              options={FORM_OPTIONS.foreheadSize}
              onChange={handleChange}
            />
            <FormSelect
              id="foreheadShape"
              name="foreheadShape"
              label="Forehead shape"
              value={form.foreheadShape}
              options={FORM_OPTIONS.foreheadShape}
              onChange={handleChange}
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
              {...fieldProps('eyeShape')}
            />
            <FormSelect
              id="eyeColor"
              name="eyeColor"
              label="Eye color"
              value={form.eyeColor}
              options={FORM_OPTIONS.eyeColor}
              onChange={handleChange}
              {...fieldProps('eyeColor')}
            />
            <FormSelect
              id="eyeSize"
              name="eyeSize"
              label="Eye size"
              value={form.eyeSize}
              options={FORM_OPTIONS.eyeSize}
              onChange={handleChange}
              {...fieldProps('eyeSize')}
            />
            <FormSelect
              id="eyebrowThickness"
              name="eyebrowThickness"
              label="Eyebrow thickness"
              value={form.eyebrowThickness}
              options={FORM_OPTIONS.eyebrowThickness}
              onChange={handleChange}
              {...fieldProps('eyebrowThickness')}
            />
            <FormSelect
              id="eyebrowShape"
              name="eyebrowShape"
              label="Eyebrow shape"
              value={form.eyebrowShape}
              options={FORM_OPTIONS.eyebrowShape}
              onChange={handleChange}
              {...fieldProps('eyebrowShape')}
            />
            <FormSelect
              id="eyebrowColor"
              name="eyebrowColor"
              label="Eyebrow color"
              value={form.eyebrowColor}
              options={FORM_OPTIONS.eyebrowColor}
              onChange={handleChange}
              {...fieldProps('eyebrowColor')}
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
              {...fieldProps('noseType')}
            />
            <FormSelect
              id="noseSize"
              name="noseSize"
              label="Nose size"
              value={form.noseSize}
              options={FORM_OPTIONS.noseSize}
              onChange={handleChange}
              {...fieldProps('noseSize')}
            />
            <FormSelect
              id="nostrilWidth"
              name="nostrilWidth"
              label="Nostril width"
              value={form.nostrilWidth}
              options={FORM_OPTIONS.nostrilWidth}
              onChange={handleChange}
              {...fieldProps('nostrilWidth')}
            />
            <FormSelect
              id="noseBridgeHeight"
              name="noseBridgeHeight"
              label="Nose bridge height"
              value={form.noseBridgeHeight}
              options={FORM_OPTIONS.noseBridgeHeight}
              onChange={handleChange}
              {...fieldProps('noseBridgeHeight')}
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
              {...fieldProps('lipThickness')}
            />
            <FormSelect
              id="mouthWidth"
              name="mouthWidth"
              label="Mouth width"
              value={form.mouthWidth}
              options={FORM_OPTIONS.mouthWidth}
              onChange={handleChange}
              {...fieldProps('mouthWidth')}
            />
            <FormSelect
              id="lipColor"
              name="lipColor"
              label="Lip color"
              value={form.lipColor}
              options={FORM_OPTIONS.lipColor}
              onChange={handleChange}
              {...fieldProps('lipColor')}
            />
            <FormSelect
              id="philtrumLength"
              name="philtrumLength"
              label="Philtrum length"
              value={form.philtrumLength}
              options={FORM_OPTIONS.philtrumLength}
              onChange={handleChange}
              {...fieldProps('philtrumLength')}
            />
          </>
        )
      case 'jawline':
        return (
          <>
            <FormSelect
              id="cheekboneProminence"
              name="cheekboneProminence"
              label="Cheekbone prominence"
              value={form.cheekboneProminence}
              options={FORM_OPTIONS.cheekboneProminence}
              onChange={handleChange}
            />
            <FormSelect
              id="jawShape"
              name="jawShape"
              label="Jaw shape"
              value={form.jawShape}
              options={FORM_OPTIONS.jawShape}
              onChange={handleChange}
            />
            <FormSelect
              id="jawWidth"
              name="jawWidth"
              label="Jaw width"
              value={form.jawWidth}
              options={FORM_OPTIONS.jawWidth}
              onChange={handleChange}
            />
            <FormSelect
              id="faceSymmetry"
              name="faceSymmetry"
              label="Face symmetry"
              value={form.faceSymmetry}
              options={FORM_OPTIONS.faceSymmetry}
              onChange={handleChange}
            />
          </>
        )
      case 'ears':
        return (
          <>
            <FormSelect
              id="earSize"
              name="earSize"
              label="Ear size"
              value={form.earSize}
              options={FORM_OPTIONS.earSize}
              onChange={handleChange}
            />
            <FormSelect
              id="earProtrusion"
              name="earProtrusion"
              label="Ear protrusion"
              value={form.earProtrusion}
              options={FORM_OPTIONS.earProtrusion}
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
              {...fieldProps('hairColor')}
            />
            <FormSelect
              id="hairLength"
              name="hairLength"
              label="Hair length"
              value={form.hairLength}
              options={FORM_OPTIONS.hairLength}
              onChange={handleChange}
              {...fieldProps('hairLength')}
            />
            <FormSelect
              id="hairStyle"
              name="hairStyle"
              label="Hair style"
              value={form.hairStyle}
              options={FORM_OPTIONS.hairStyle}
              onChange={handleChange}
              {...fieldProps('hairStyle')}
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
            {...fieldProps('facialHair')}
          />
        )
      case 'distinguishing':
        return (
          <>
            <FormSelect
              id="scarLocation"
              name="scarLocation"
              label="Scar location (on face)"
              value={form.scarLocation}
              options={FORM_OPTIONS.scarLocation}
              onChange={handleChange}
              placeholder="Select location"
              {...fieldProps('scarLocation')}
            />
            <FormTextarea
              id="scars"
              name="scars"
              label="Scar description"
              value={form.scars}
              onChange={handleChange}
              placeholder="e.g. long diagonal scar, small circular scar"
              disabled={form.scarLocation === 'None'}
              {...fieldProps('scars')}
            />
            <FormTextarea
              id="tattoos"
              name="tattoos"
              label="Tattoos (location and type)"
              value={form.tattoos}
              onChange={handleChange}
              placeholder='e.g. tribal tattoo on right forearm, or "None"'
              {...fieldProps('tattoos')}
            />
            <FormSelect
              id="birthmarkLocation"
              name="birthmarkLocation"
              label="Birthmark / mole location"
              value={form.birthmarkLocation}
              options={FORM_OPTIONS.birthmarkLocation}
              onChange={handleChange}
              placeholder="Select location"
              {...fieldProps('birthmarkLocation')}
            />
            <FormTextarea
              id="birthmarks"
              name="birthmarks"
              label="Birthmark / mole description"
              value={form.birthmarks}
              onChange={handleChange}
              placeholder="e.g. dark brown mole, small flat birthmark"
              disabled={form.birthmarkLocation === 'None'}
              {...fieldProps('birthmarks')}
            />
            <FormSelect
              id="glasses"
              name="glasses"
              label="Glasses"
              value={form.glasses}
              options={FORM_OPTIONS.glasses}
              onChange={handleChange}
              {...fieldProps('glasses')}
            />
            <FormTextarea
              id="otherFeatures"
              name="otherFeatures"
              label="Other notable features"
              value={form.otherFeatures}
              onChange={handleChange}
              placeholder='Any additional details, or "None"'
              {...fieldProps('otherFeatures')}
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
      case 'neck':
        return (
          <>
            <FormSelect
              id="neckLength"
              name="neckLength"
              label="Neck length"
              value={form.neckLength}
              options={FORM_OPTIONS.neckLength}
              onChange={handleChange}
            />
            <FormSelect
              id="neckWidth"
              name="neckWidth"
              label="Neck width"
              value={form.neckWidth}
              options={FORM_OPTIONS.neckWidth}
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
          Complete all required sections (marked with *) before generating a
          sketch. Jawline, ears, build, and neck details are optional.
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
            isComplete={
              section.required
                ? progress.completedIds.has(section.id)
                : false
            }
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

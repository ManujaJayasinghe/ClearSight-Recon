import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import CompositeImage from '../components/CompositeImage'
import CompositeLoading from '../components/CompositeLoading'
import ShieldIcon from '../components/ShieldIcon'
import { useToast } from '../context/useToast'
import { SITE_NAME } from '../constants/site'
import { generateCaseReference } from '../utils/caseReference'
import {
  buildSideProfilePrompt,
  generateFace,
  generateFaceVariations,
  GenerationStatus,
} from '../utils/generateFace'
import { buildWitnessSummarySections } from '../utils/witnessSummary'
import './ResultPage.css'

const VARIATION_COUNT = 3

const STATUS_MESSAGES = {
  [GenerationStatus.BUILDING_PROMPT]: 'Building portrait prompt…',
  [GenerationStatus.REQUESTING]: `Generating ${VARIATION_COUNT} composite variations (may take 3–6 minutes)…`,
}

const SIDE_STATUS_MESSAGES = {
  [GenerationStatus.BUILDING_PROMPT]: 'Building side-profile prompt…',
  [GenerationStatus.REQUESTING]: 'Generating side profile…',
}

function formatGeneratedAt(date) {
  return date.toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export default function ResultPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const description = location.state?.description
  const sideBusyRef = useRef(false)
  const frontBusyRef = useRef(false)

  const caseReference = useMemo(() => generateCaseReference(), [])
  const [variationUrls, setVariationUrls] = useState([])
  const [variationSeeds, setVariationSeeds] = useState([])
  const [selectedVariationIndex, setSelectedVariationIndex] = useState(0)
  const imageUrl = variationUrls[selectedVariationIndex] ?? null
  const activeSeed = variationSeeds[selectedVariationIndex] ?? undefined
  const [phase, setPhase] = useState(() => (description ? 'loading' : 'missing'))
  const [statusMessage, setStatusMessage] = useState(STATUS_MESSAGES[GenerationStatus.BUILDING_PROMPT])
  const [errorMessage, setErrorMessage] = useState('')
  const [completedAt, setCompletedAt] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [sideProfileUrl, setSideProfileUrl] = useState(null)
  const [sidePhase, setSidePhase] = useState('idle')
  const [sideStatusMessage, setSideStatusMessage] = useState('')
  const [sideErrorMessage, setSideErrorMessage] = useState('')

  const summarySections = useMemo(
    () => buildWitnessSummarySections(description ?? {}),
    [description],
  )

  useEffect(() => {
    if (!description) return

    let cancelled = false

    async function run() {
      if (frontBusyRef.current) return
      frontBusyRef.current = true
      setPhase('loading')
      setErrorMessage('')
      setVariationUrls([])
      setVariationSeeds([])
      setSelectedVariationIndex(0)
      setCompletedAt(null)
      setSideProfileUrl(null)
      setSidePhase('idle')
      setSideErrorMessage('')
      setStatusMessage(STATUS_MESSAGES[GenerationStatus.BUILDING_PROMPT])

      try {
        const { urls, seeds } = await generateFaceVariations(description, VARIATION_COUNT, {
          onStatusChange: (status) => {
            if (!cancelled) {
              setStatusMessage(STATUS_MESSAGES[status] ?? 'Processing…')
            }
          },
        })
        if (cancelled) return
        setVariationUrls(urls)
        setVariationSeeds(seeds ?? [])
        setSelectedVariationIndex(0)
        setCompletedAt(new Date())
        setPhase('success')
        showToast(`${urls.length} composite variations generated`)
      } catch (err) {
        if (cancelled) return
        setErrorMessage(
          err?.message ??
            'Unable to generate the composite sketch. Please try again.',
        )
        setPhase('error')
        showToast('Front composite generation failed', 'error')
      } finally {
        frontBusyRef.current = false
      }
    }

    run()

    return () => {
      cancelled = true
      frontBusyRef.current = false
    }
  }, [description, retryCount, showToast])

  const handleRetryFront = () => {
    if (phase === 'loading' || frontBusyRef.current) return
    setRetryCount((n) => n + 1)
  }

  const handleGenerateSideProfile = async () => {
    if (
      !description ||
      !imageUrl ||
      sidePhase === 'loading' ||
      sideBusyRef.current
    ) {
      return
    }

    sideBusyRef.current = true
    setSidePhase('loading')
    setSideErrorMessage('')
    setSideStatusMessage(SIDE_STATUS_MESSAGES[GenerationStatus.BUILDING_PROMPT])

    try {
      const sidePrompt = buildSideProfilePrompt(description)
      const { imageUrl: sideUrl } = await generateFace(description, {
        prompt: sidePrompt,
        view: 'side',
        onStatusChange: (status) => {
          setSideStatusMessage(SIDE_STATUS_MESSAGES[status] ?? 'Processing…')
        },
      })
      setSideProfileUrl(sideUrl)
      setSidePhase('success')
      showToast('Side profile generated successfully')
    } catch (err) {
      setSideErrorMessage(
        err?.message ??
          'Unable to generate the side profile. Please try again.',
      )
      setSidePhase('error')
      showToast('Side profile generation failed', 'error')
    } finally {
      setSideStatusMessage('')
      sideBusyRef.current = false
    }
  }

  const reportState = {
    imageUrl,
    seed: activeSeed,
    sideProfileImageUrl: sideProfileUrl,
    description: description ?? {},
    caseReference,
    generatedAt: completedAt?.toISOString() ?? null,
  }

  const displayTimestamp = completedAt ?? null
  const actionsDisabled = phase !== 'success' || !imageUrl
  const canGenerateSide =
    phase === 'success' && imageUrl && sidePhase !== 'loading'

  if (phase === 'missing') {
    return (
      <article className="page page--wide result-page">
        <header className="page__header">
          <span className="page__eyebrow">Step 2 — Generation</span>
          <h1 className="page__title">Suspect Composite Report</h1>
          <p className="page__description">
            No witness description was provided. Complete the witness form to
            generate a composite sketch.
          </p>
        </header>
        <Link to="/form" className="btn btn--primary">
          Go to Witness Form
        </Link>
      </article>
    )
  }

  return (
    <article className="page page--wide result-page">
      <section className="result-report__wrapper">
        <section className="result-report">
          <header className="result-report__banner">
            <div className="result-report__brand">
              <span className="result-report__brand-icon" aria-hidden="true">
                <ShieldIcon size={40} />
              </span>
              <div>
                <span className="result-report__dept">{SITE_NAME}</span>
                <h1 className="result-report__title">
                  Suspect Composite Report
                </h1>
              </div>
            </div>

            <dl className="result-report__meta">
              <div className="result-report__meta-row">
                <dt className="result-report__meta-label">Case Reference</dt>
                <dd className="result-report__meta-value">{caseReference}</dd>
              </div>
              <div className="result-report__meta-row">
                <dt className="result-report__meta-label">Generated</dt>
                <dd className="result-report__meta-value">
                  {displayTimestamp
                    ? formatGeneratedAt(displayTimestamp)
                    : phase === 'loading'
                      ? 'In progress…'
                      : '—'}
                </dd>
              </div>
            </dl>
          </header>

          <main className="result-report__body">
            <aside className="result-report__image-panel">
              <span className="result-report__image-label">
                Primary Composite — Subject No. 1
              </span>
              {phase === 'success' && variationUrls.length > 1 ? (
                <div
                  className="result-report__variations"
                  role="listbox"
                  aria-label="Select the closest match"
                >
                  {variationUrls.map((url, index) => (
                    <button
                      key={`${url}-${index}`}
                      type="button"
                      role="option"
                      aria-selected={index === selectedVariationIndex}
                      aria-label={`Variation ${index + 1}`}
                      className={`result-report__variation${index === selectedVariationIndex ? ' result-report__variation--selected' : ''}`}
                      onClick={() => setSelectedVariationIndex(index)}
                    >
                      <CompositeImage
                        src={url}
                        alt={`Composite variation ${index + 1}`}
                        className="result-report__variation-image"
                      />
                      <span className="result-report__variation-label">
                        {index + 1}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
              <p
                className={`result-report__variations-hint${phase === 'success' && variationUrls.length > 1 ? '' : ' result-report__variations-hint--hidden'}`}
              >
                Select the variation that best matches the witness description.
              </p>
              <div className="result-report__views">
                <div className="result-report__view">
                  <span className="result-report__view-tag">Front View</span>
                  <figure
                    className={`result-report__image-frame${phase === 'loading' ? ' result-report__image-frame--loading' : ''}${phase === 'error' ? ' result-report__image-frame--error' : ''}`}
                  >
                    {phase === 'loading' ? (
                      <CompositeLoading message={statusMessage} />
                    ) : null}
                    {phase === 'error' ? (
                      <div className="result-report__error" role="alert">
                        <p className="result-report__error-title">
                          Generation failed
                        </p>
                        <p className="result-report__error-message">
                          {errorMessage}
                        </p>
                        <button
                          type="button"
                          className={`btn btn--primary${phase === 'loading' ? ' btn--loading' : ''}`}
                          onClick={handleRetryFront}
                          disabled={phase === 'loading'}
                          aria-busy={phase === 'loading'}
                        >
                          Try Again
                        </button>
                      </div>
                    ) : null}
                    {phase === 'success' && imageUrl ? (
                      <CompositeImage
                        src={imageUrl}
                        alt="Front view suspect composite"
                        className="result-report__image"
                      />
                    ) : null}
                  </figure>
                </div>

                <div className="result-report__view">
                  <span className="result-report__view-tag">Side Profile</span>
                  <figure
                    className={`result-report__image-frame${sidePhase === 'loading' ? ' result-report__image-frame--loading' : ''}${sidePhase === 'error' ? ' result-report__image-frame--error' : ''}${sidePhase === 'idle' ? ' result-report__image-frame--empty' : ''}`}
                  >
                    {sidePhase === 'loading' ? (
                      <CompositeLoading message={sideStatusMessage} />
                    ) : null}
                    {sidePhase === 'error' ? (
                      <div className="result-report__error" role="alert">
                        <p className="result-report__error-title">
                          Side profile failed
                        </p>
                        <p className="result-report__error-message">
                          {sideErrorMessage}
                        </p>
                        <button
                          type="button"
                          className={`btn btn--primary${sidePhase === 'loading' ? ' btn--loading' : ''}`}
                          onClick={handleGenerateSideProfile}
                          disabled={sidePhase === 'loading'}
                          aria-busy={sidePhase === 'loading'}
                        >
                          Try Again
                        </button>
                      </div>
                    ) : null}
                    {sidePhase === 'success' && sideProfileUrl ? (
                      <CompositeImage
                        src={sideProfileUrl}
                        alt="Side profile suspect composite"
                        className="result-report__image"
                      />
                    ) : null}
                    {sidePhase === 'idle' ? (
                      <p className="result-report__view-placeholder">
                        Generate a 90° side-profile view from the same witness
                        description.
                      </p>
                    ) : null}
                  </figure>
                </div>
              </div>

              {canGenerateSide && sidePhase !== 'success' ? (
                <button
                  type="button"
                  className={`btn btn--secondary result-report__side-btn${sidePhase === 'loading' ? ' btn--loading' : ''}`}
                  onClick={handleGenerateSideProfile}
                  disabled={sidePhase === 'loading'}
                  aria-busy={sidePhase === 'loading'}
                >
                  {sidePhase === 'loading'
                    ? 'Generating Side Profile…'
                    : 'Generate Side Profile'}
                </button>
              ) : null}
              {sidePhase === 'loading' ? (
                <p
                  className="result-report__side-loading-note"
                  aria-live="polite"
                >
                  {sideStatusMessage || 'Generating side profile…'}
                </p>
              ) : null}
              {sidePhase === 'success' ? (
                <button
                  type="button"
                  className={`btn btn--secondary result-report__side-btn${sidePhase === 'loading' ? ' btn--loading' : ''}`}
                  onClick={handleGenerateSideProfile}
                  disabled={sidePhase === 'loading'}
                  aria-busy={sidePhase === 'loading'}
                >
                  {sidePhase === 'loading'
                    ? 'Regenerating…'
                    : 'Regenerate Side Profile'}
                </button>
              ) : null}

              <p className="result-report__image-caption">
                {phase === 'loading'
                  ? `Rendering ${VARIATION_COUNT} front composite variations from witness testimony…`
                  : phase === 'error'
                    ? 'Composite could not be rendered. Adjust the description or retry.'
                    : sidePhase === 'loading'
                      ? 'Front view complete. Side profile generation in progress…'
                      : variationUrls.length > 1
                        ? 'Choose the closest match above, then refine or export.'
                        : 'AI-generated forensic composites based on witness testimony.'}
              </p>
            </aside>

            <section className="result-report__summary-panel">
              <h2 className="result-report__summary-heading">
                Witness Description Summary
              </h2>
              <p className="result-report__summary-sub">
                Consolidated intake fields submitted during composite session.
                Verify accuracy before refinement or export.
              </p>

              <div className="result-report__summary-sections">
                {summarySections.length === 0 ? (
                  <p className="result-report__summary-empty">
                    No witness details were entered. Return to the form to add a
                    description.
                  </p>
                ) : (
                  summarySections.map((section) => (
                    <section key={section.id} className="result-report__section">
                      <header className="result-report__section-header">
                        <h3 className="result-report__section-title">
                          {section.title}
                        </h3>
                        <span className="result-report__section-count">
                          {section.filledCount} of {section.totalCount} fields
                        </span>
                      </header>
                      <dl className="result-report__field-list">
                        {section.fields.map((field) => (
                          <div
                            key={field.key}
                            className={`result-report__field${field.isFullWidth ? ' result-report__field--full' : ''}`}
                          >
                            <dt className="result-report__field-label">
                              {field.label}
                            </dt>
                            <dd className="result-report__field-value">
                              {field.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </section>
                  ))
                )}
              </div>

              {phase === 'loading' ? (
                <span className="result-report__generating-badge">
                  Generating composite…
                </span>
              ) : null}
            </section>
          </main>

          <footer className="result-report__footer">
            <p className="result-report__footer-note">
              This report is for investigative use only. Distribution limited to
              authorized personnel. Composite subject to witness verification.
            </p>
            <nav
              className="result-report__actions btn-group--stack-mobile"
              aria-label="Report actions"
            >
              {actionsDisabled ? (
                <span className="btn btn--primary btn--disabled" aria-disabled="true">
                  Refine This Sketch
                </span>
              ) : (
                <Link
                  to="/refine"
                  state={reportState}
                  className="btn btn--primary"
                >
                  Refine This Sketch
                </Link>
              )}
              {actionsDisabled ? (
                <span className="btn btn--secondary btn--disabled" aria-disabled="true">
                  Export PDF
                </span>
              ) : (
                <Link
                  to="/pdf-export"
                  state={reportState}
                  className="btn btn--secondary"
                >
                  Export PDF
                </Link>
              )}
              <Link
                to="/form"
                className="btn btn--secondary"
                onClick={(e) => {
                  if (phase === 'loading' || sidePhase === 'loading') {
                    e.preventDefault()
                    if (
                      window.confirm(
                        'Generation is in progress. Leave and return to the form?',
                      )
                    ) {
                      navigate('/form')
                    }
                  }
                }}
              >
                Start Over
              </Link>
            </nav>
          </footer>

          <span className="result-report__stamp" aria-hidden="true">
            Official Use Only
          </span>
        </section>
      </section>
    </article>
  )
}

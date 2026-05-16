import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
import SaveReportModal from '../components/SaveReportModal'
import './ResultPage.css'

const VARIATION_COUNT = 3

function useStatusMessages(t) {
  return useMemo(
    () => ({
      [GenerationStatus.BUILDING_PROMPT]: t('result.statusBuildingPrompt'),
      [GenerationStatus.REQUESTING]: t('result.statusRequesting', {
        count: VARIATION_COUNT,
      }),
    }),
    [t],
  )
}

function useSideStatusMessages(t) {
  return useMemo(
    () => ({
      [GenerationStatus.BUILDING_PROMPT]: t('result.statusSideBuilding'),
      [GenerationStatus.REQUESTING]: t('result.statusSideRequesting'),
    }),
    [t],
  )
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
  const { t } = useTranslation()
  const STATUS_MESSAGES = useStatusMessages(t)
  const SIDE_STATUS_MESSAGES = useSideStatusMessages(t)
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
  const [saveReportOpen, setSaveReportOpen] = useState(false)
  const [reportSaved, setReportSaved] = useState(false)

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
              setStatusMessage(STATUS_MESSAGES[status] ?? t('result.statusProcessing'))
            }
          },
        })
        if (cancelled) return
        setVariationUrls(urls)
        setVariationSeeds(seeds ?? [])
        setSelectedVariationIndex(0)
        setCompletedAt(new Date())
        setPhase('success')
        showToast(t('result.toastVariations', { count: urls.length }))
      } catch (err) {
        if (cancelled) return
        setErrorMessage(err?.message ?? t('result.errorFront'))
        setPhase('error')
        showToast(t('result.toastFrontFailed'), 'error')
      } finally {
        frontBusyRef.current = false
      }
    }

    run()

    return () => {
      cancelled = true
      frontBusyRef.current = false
    }
  }, [description, retryCount, showToast, t, STATUS_MESSAGES])

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
          setSideStatusMessage(
            SIDE_STATUS_MESSAGES[status] ?? t('result.statusProcessing'),
          )
        },
      })
      setSideProfileUrl(sideUrl)
      setSidePhase('success')
      showToast(t('result.toastSideSuccess'))
    } catch (err) {
      setSideErrorMessage(err?.message ?? t('result.errorSide'))
      setSidePhase('error')
      showToast(t('result.toastSideFailed'), 'error')
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
          <span className="page__eyebrow">{t('result.eyebrow')}</span>
          <h1 className="page__title">{t('result.title')}</h1>
          <p className="page__description">{t('result.missingDescription')}</p>
        </header>
        <Link to="/form" className="btn btn--primary">
          {t('result.goToForm')}
        </Link>
      </article>
    )
  }

  const selectedImageNumber = selectedVariationIndex + 1
  const canSaveReport =
    phase === 'success' && Boolean(imageUrl) && Boolean(description) && !reportSaved

  return (
    <article className="page page--wide result-page">
      {saveReportOpen && imageUrl && description ? (
        <SaveReportModal
          descriptors={description}
          imageUrl={imageUrl}
          selectedImageNumber={selectedImageNumber}
          onCancel={() => setSaveReportOpen(false)}
          onSaved={() => {
            setSaveReportOpen(false)
            setReportSaved(true)
            showToast('Criminal report saved successfully')
          }}
        />
      ) : null}

      <section className="result-report__wrapper">
        <section className="result-report">
          <header className="result-report__banner">
            <div className="result-report__brand">
              <span className="result-report__brand-icon" aria-hidden="true">
                <ShieldIcon size={40} />
              </span>
              <div>
                <span className="result-report__dept">{SITE_NAME}</span>
                <h1 className="result-report__title">{t('result.title')}</h1>
              </div>
            </div>

            <dl className="result-report__meta">
              <div className="result-report__meta-row">
                <dt className="result-report__meta-label">{t('result.caseReference')}</dt>
                <dd className="result-report__meta-value">{caseReference}</dd>
              </div>
              <div className="result-report__meta-row">
                <dt className="result-report__meta-label">{t('result.generated')}</dt>
                <dd className="result-report__meta-value">
                  {displayTimestamp
                    ? formatGeneratedAt(displayTimestamp)
                    : phase === 'loading'
                      ? t('result.inProgress')
                      : '—'}
                </dd>
              </div>
            </dl>
          </header>

          <main className="result-report__body">
            <aside className="result-report__image-panel">
              <span className="result-report__image-label">
                {t('result.primaryComposite')}
              </span>
              {phase === 'success' && variationUrls.length > 1 ? (
                <div
                  className="result-report__variations"
                  role="listbox"
                  aria-label={t('result.selectMatchAria')}
                >
                  {variationUrls.map((url, index) => (
                    <button
                      key={`${url}-${index}`}
                      type="button"
                      role="option"
                      aria-selected={index === selectedVariationIndex}
                      aria-label={t('result.variation', { n: index + 1 })}
                      className={`result-report__variation${index === selectedVariationIndex ? ' result-report__variation--selected' : ''}`}
                      onClick={() => {
                        setSelectedVariationIndex(index)
                        setReportSaved(false)
                      }}
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
                {t('result.variationsHint')}
              </p>

              {canSaveReport ? (
                <div className="result-report__save-wrap">
                  <button
                    type="button"
                    className="btn btn--primary result-report__save-btn"
                    onClick={() => setSaveReportOpen(true)}
                  >
                    Save Criminal Report
                  </button>
                  <p className="result-report__save-hint">
                    Save the selected composite and witness descriptors to the
                    criminal reports database.
                  </p>
                </div>
              ) : null}

              {reportSaved && !saveReportOpen ? (
                <p className="result-report__saved-badge" role="status">
                  Criminal report saved to database.
                </p>
              ) : null}

              <div className="result-report__views">
                <div className="result-report__view">
                  <span className="result-report__view-tag">{t('result.frontView')}</span>
                  <figure
                    className={`result-report__image-frame${phase === 'loading' ? ' result-report__image-frame--loading' : ''}${phase === 'error' ? ' result-report__image-frame--error' : ''}`}
                  >
                    {phase === 'loading' ? (
                      <CompositeLoading message={statusMessage} />
                    ) : null}
                    {phase === 'error' ? (
                      <div className="result-report__error" role="alert">
                        <p className="result-report__error-title">
                          {t('result.generationFailed')}
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
                          {t('result.tryAgain')}
                        </button>
                      </div>
                    ) : null}
                    {phase === 'success' && imageUrl ? (
                      <CompositeImage
                        src={imageUrl}
                        alt={t('result.frontAlt')}
                        className="result-report__image"
                      />
                    ) : null}
                  </figure>
                </div>

                <div className="result-report__view">
                  <span className="result-report__view-tag">{t('result.sideProfile')}</span>
                  <figure
                    className={`result-report__image-frame${sidePhase === 'loading' ? ' result-report__image-frame--loading' : ''}${sidePhase === 'error' ? ' result-report__image-frame--error' : ''}${sidePhase === 'idle' ? ' result-report__image-frame--empty' : ''}`}
                  >
                    {sidePhase === 'loading' ? (
                      <CompositeLoading message={sideStatusMessage} />
                    ) : null}
                    {sidePhase === 'error' ? (
                      <div className="result-report__error" role="alert">
                        <p className="result-report__error-title">
                          {t('result.sideProfileFailed')}
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
                          {t('result.tryAgain')}
                        </button>
                      </div>
                    ) : null}
                    {sidePhase === 'success' && sideProfileUrl ? (
                      <CompositeImage
                        src={sideProfileUrl}
                        alt={t('result.sideAlt')}
                        className="result-report__image"
                      />
                    ) : null}
                    {sidePhase === 'idle' ? (
                      <p className="result-report__view-placeholder">
                        {t('result.sidePlaceholder')}
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
                    ? t('result.generatingSide')
                    : t('result.generateSide')}
                </button>
              ) : null}
              {sidePhase === 'loading' ? (
                <p
                  className="result-report__side-loading-note"
                  aria-live="polite"
                >
                  {sideStatusMessage || t('result.statusSideRequesting')}
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
                    ? t('result.regenerating')
                    : t('result.regenerateSide')}
                </button>
              ) : null}

              <p className="result-report__image-caption">
                {phase === 'loading'
                  ? t('result.captionLoading', { count: VARIATION_COUNT })
                  : phase === 'error'
                    ? t('result.captionError')
                    : sidePhase === 'loading'
                      ? t('result.captionSideLoading')
                      : variationUrls.length > 1
                        ? t('result.captionChoose')
                        : t('result.captionDefault')}
              </p>
            </aside>

            <section className="result-report__summary-panel">
              <h2 className="result-report__summary-heading">
                {t('result.summaryHeading')}
              </h2>
              <p className="result-report__summary-sub">{t('result.summarySub')}</p>

              <div className="result-report__summary-sections">
                {summarySections.length === 0 ? (
                  <p className="result-report__summary-empty">
                    {t('result.summaryEmpty')}
                  </p>
                ) : (
                  summarySections.map((section) => (
                    <section key={section.id} className="result-report__section">
                      <header className="result-report__section-header">
                        <h3 className="result-report__section-title">
                          {section.title}
                        </h3>
                        <span className="result-report__section-count">
                          {t('result.fieldsOf', {
                            filled: section.filledCount,
                            total: section.totalCount,
                          })}
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
                  {t('result.generatingBadge')}
                </span>
              ) : null}
            </section>
          </main>

          <footer className="result-report__footer">
            <p className="result-report__footer-note">{t('result.footerNote')}</p>
            <nav
              className="result-report__actions btn-group--stack-mobile"
              aria-label={t('result.reportActionsAria')}
            >
              {actionsDisabled ? (
                <span className="btn btn--primary btn--disabled" aria-disabled="true">
                  {t('result.refineSketch')}
                </span>
              ) : (
                <Link
                  to="/refine"
                  state={reportState}
                  className="btn btn--primary"
                >
                  {t('result.refineSketch')}
                </Link>
              )}
              {actionsDisabled ? (
                <span className="btn btn--secondary btn--disabled" aria-disabled="true">
                  {t('result.exportPdf')}
                </span>
              ) : (
                <Link
                  to="/pdf-export"
                  state={reportState}
                  className="btn btn--secondary"
                >
                  {t('result.exportPdf')}
                </Link>
              )}
              <Link
                to="/form"
                className="btn btn--secondary"
                onClick={(e) => {
                  if (phase === 'loading' || sidePhase === 'loading') {
                    e.preventDefault()
                    if (window.confirm(t('result.leaveConfirm'))) {
                      navigate('/form')
                    }
                  }
                }}
              >
                {t('result.startOver')}
              </Link>
            </nav>
          </footer>

          <span className="result-report__stamp" aria-hidden="true">
            {t('result.officialStamp')}
          </span>
        </section>
      </section>
    </article>
  )
}

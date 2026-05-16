import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import CompositeImage from '../components/CompositeImage'
import CompositeLoading from '../components/CompositeLoading'
import {
  REFINEMENT_KEY_MAP,
  REFINEMENT_SHORTCUT_GROUPS,
  getShortcutLabel,
} from '../constants/refinementShortcuts'
import { useToast } from '../context/useToast'
import { generateCaseReference } from '../utils/caseReference'
import { generateFace, GenerationStatus } from '../utils/generateFace'
import {
  applyRefinement,
  getRefinementLabel,
  REFINEMENT_CONTROLS,
} from '../utils/refinementAdjustments'
import './Page.css'
import './RefinementPage.css'

const MAX_HISTORY = 4

const STATUS_MESSAGES = {
  [GenerationStatus.BUILDING_PROMPT]: 'Building portrait prompt…',
  [GenerationStatus.REQUESTING]: 'Regenerating composite…',
}

/**
 * @param {string} imageUrl
 * @param {object} description
 * @param {string} label
 * @param {number|undefined} seed  fal.ai seed — kept so refinements reuse the same face identity
 */
function createHistoryEntry(imageUrl, description, label, seed) {
  return {
    id: crypto.randomUUID(),
    imageUrl,
    description: { ...description },
    label,
    seed,
  }
}

function groupControls(controls) {
  const groups = new Map()
  for (const control of controls) {
    if (!groups.has(control.group)) {
      groups.set(control.group, [])
    }
    groups.get(control.group).push(control)
  }
  return [...groups.entries()]
}

export default function RefinementPage() {
  const location = useLocation()
  const { showToast } = useToast()
  const routeState = location.state ?? {}
  const incomingImageUrl = routeState.imageUrl
  const incomingDescription = routeState.description
  const generateBusyRef = useRef(false)

  const [{ history, activeId }, setSession] = useState(() => {
    const imageUrl = location.state?.imageUrl
    const description = location.state?.description
    const seed = location.state?.seed
    if (!imageUrl || !description) {
      return { history: [], activeId: null }
    }
    const entry = createHistoryEntry(imageUrl, description, 'Original', seed)
    return { history: [entry], activeId: entry.id }
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [caseReference] = useState(
    () => routeState.caseReference ?? generateCaseReference(),
  )

  const controlGroups = useMemo(() => groupControls(REFINEMENT_CONTROLS), [])

  const activeEntry =
    history.find((e) => e.id === activeId) ?? history[history.length - 1] ?? null

  /**
   * Regenerate the composite, optionally locking face identity via seed.
   * @param {object} description
   * @param {string} label
   * @param {number|undefined} seed  Pass activeEntry.seed to preserve face identity
   */
  const regenerate = useCallback(
    async (description, label, seed) => {
      if (generateBusyRef.current) return

      generateBusyRef.current = true
      setIsGenerating(true)
      setErrorMessage('')
      setStatusMessage(STATUS_MESSAGES[GenerationStatus.BUILDING_PROMPT])

      try {
        const { imageUrl, seed: returnedSeed } = await generateFace(description, {
          seed,
          onStatusChange: (status) => {
            setStatusMessage(STATUS_MESSAGES[status] ?? 'Processing…')
          },
        })

        const entry = createHistoryEntry(imageUrl, description, label, returnedSeed ?? seed)
        setSession((prev) => {
          const nextHistory = [...prev.history, entry].slice(-MAX_HISTORY)
          return { history: nextHistory, activeId: entry.id }
        })
        showToast(`${label} — sketch updated`)
      } catch (err) {
        setErrorMessage(
          err?.message ??
            'Could not regenerate the sketch. Please try another adjustment.',
        )
        showToast('Regeneration failed. Please try again.', 'error')
      } finally {
        setIsGenerating(false)
        setStatusMessage('')
        generateBusyRef.current = false
      }
    },
    [showToast],
  )

  const handleAdjustment = useCallback(
    (actionId) => {
      if (!activeEntry || isGenerating || generateBusyRef.current) return
      const updated = applyRefinement(activeEntry.description, actionId)
      // Pass the current entry's seed to keep face identity stable across adjustments
      regenerate(updated, getRefinementLabel(actionId), activeEntry.seed)
    },
    [activeEntry, isGenerating, regenerate],
  )

  useEffect(() => {
    function onKeyDown(e) {
      if (isGenerating || !activeEntry || generateBusyRef.current) return
      if (!e.altKey || e.ctrlKey || e.metaKey) return
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      const actionId = REFINEMENT_KEY_MAP[e.key]
      if (!actionId) return

      e.preventDefault()
      handleAdjustment(actionId)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeEntry, isGenerating, handleAdjustment])

  const handleRestore = (entry) => {
    if (isGenerating || entry.id === activeId) return
    setSession((prev) => ({ ...prev, activeId: entry.id }))
    setErrorMessage('')
    showToast(`Restored: ${entry.label}`)
  }

  const exportState = activeEntry
    ? {
        imageUrl: activeEntry.imageUrl,
        sideProfileImageUrl: routeState.sideProfileImageUrl ?? null,
        description: activeEntry.description,
        caseReference,
        generatedAt: new Date().toISOString(),
      }
    : null

  const historySlots = useMemo(() => {
    const slots = [...history]
    while (slots.length < MAX_HISTORY) {
      slots.unshift(null)
    }
    return slots.slice(-MAX_HISTORY)
  }, [history])

  if (!incomingImageUrl || !incomingDescription) {
    return (
      <article className="page page--wide refine-page">
        <header className="page__header">
          <span className="page__eyebrow">Step 3 — Refinement</span>
          <h1 className="page__title">Sketch Refinement</h1>
          <p className="page__description">
            Generate a composite on the result page before refining features.
          </p>
        </header>
        <Link to="/result" className="btn btn--primary">
          Go to Sketch Result
        </Link>
      </article>
    )
  }

  return (
    <article className="page page--wide refine-page">
      <header className="page__header">
        <span className="page__eyebrow">Step 3 — Refinement</span>
        <h1 className="page__title">Sketch Refinement</h1>
        <p className="page__description">
          Adjust features and regenerate the composite until it matches witness
          testimony. Select any recent version below to compare or restore.
        </p>
      </header>

      <div className="refine-workspace">
        <section className="refine-preview" aria-label="Current composite sketch">
          <h2 className="refine-preview__heading">Current Composite</h2>
          <figure
            className={`refine-preview__frame${isGenerating ? ' refine-preview__frame--loading' : ''}`}
            aria-busy={isGenerating}
          >
            {isGenerating ? (
              <CompositeLoading message={statusMessage} />
            ) : activeEntry ? (
              <CompositeImage
                src={activeEntry.imageUrl}
                alt="Refined composite sketch"
                className="refine-preview__image"
              />
            ) : null}
          </figure>
          <p className="refine-preview__status">
            {isGenerating
              ? 'Applying adjustment and regenerating sketch…'
              : activeEntry
                ? `Viewing: ${activeEntry.label}`
                : 'Loading sketch…'}
          </p>
        </section>

        <section className="refine-controls" aria-label="Quick adjustments">
          <h2 className="refine-controls__heading">Quick Adjustments</h2>
          <p className="refine-controls__sub">
            Each control updates the witness description and generates a new
            composite. Hold <kbd>Alt</kbd> and press a shortcut key for faster
            adjustments.
          </p>

          <aside className="refine-shortcuts" aria-label="Keyboard shortcuts">
            <p className="refine-shortcuts__title">Keyboard shortcuts</p>
            <ul className="refine-shortcuts__list">
              {REFINEMENT_SHORTCUT_GROUPS.map(({ keys, description }) => (
                <li key={keys}>
                  <span className="refine-shortcuts__keys">{keys}</span>
                  {description}
                </li>
              ))}
            </ul>
          </aside>

          {errorMessage ? (
            <p className="refine-error" role="alert">
              {errorMessage}
            </p>
          ) : null}

          {controlGroups.map(([group, buttons]) => (
            <div key={group} className="refine-controls__group">
              <span className="refine-controls__group-label">{group}</span>
              <div className="refine-controls__buttons">
                {buttons.map(({ id, label }) => {
                  const shortcut = getShortcutLabel(id)
                  return (
                    <button
                      key={id}
                      type="button"
                      className={`refine-btn${isGenerating ? ' refine-btn--loading' : ''}`}
                      disabled={isGenerating || !activeEntry}
                      aria-busy={isGenerating}
                      onClick={() => handleAdjustment(id)}
                    >
                      <span className="refine-btn__label">{label}</span>
                      {shortcut ? (
                        <span className="refine-btn__shortcut">
                          <kbd>{shortcut}</kbd>
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          <div className="refine-controls__export">
            {exportState ? (
              <Link
                to="/pdf-export"
                state={exportState}
                className="btn btn--primary"
              >
                This Looks Right — Export PDF
              </Link>
            ) : (
              <span className="btn btn--primary btn--disabled" aria-disabled="true">
                This Looks Right — Export PDF
              </span>
            )}
          </div>
        </section>
      </div>

      <section className="refine-history" aria-label="Version history">
        <h2 className="refine-history__heading">Version History</h2>
        <p className="refine-history__sub">
          Last {MAX_HISTORY} generated versions — click a thumbnail to restore
        </p>
        <div className="refine-history__strip">
          {historySlots.map((entry, index) => (
            <div key={entry?.id ?? `empty-${index}`} className="refine-history__slot">
              <span className="refine-history__slot-label">
                {entry ? entry.label : `Slot ${index + 1}`}
              </span>
              {entry ? (
                <button
                  type="button"
                  className={`refine-history__thumb${entry.id === activeId ? ' refine-history__thumb--active' : ''}`}
                  onClick={() => handleRestore(entry)}
                  disabled={isGenerating}
                  aria-label={`Restore ${entry.label}`}
                  aria-current={entry.id === activeId ? 'true' : undefined}
                >
                  <CompositeImage src={entry.imageUrl} alt="" />
                </button>
              ) : (
                <div className="refine-history__thumb" aria-hidden="true">
                  <span className="refine-history__empty">—</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="refine-back">
        <Link to="/result" state={routeState} className="btn btn--secondary">
          Back to Report
        </Link>
      </div>
    </article>
  )
}

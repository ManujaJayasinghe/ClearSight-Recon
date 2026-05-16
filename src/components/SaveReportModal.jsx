import { useState } from 'react'
import { Link } from 'react-router-dom'
import CompositeImage from './CompositeImage'
import { translateFieldLabel, translateFormOption } from '../i18n/formOption'
import { saveReport } from '../services/reportService'
import './SaveReportModal.css'

const KEY_DESCRIPTOR_FIELDS = [
  { formKey: 'ethnicity' },
  { formKey: 'faceShape' },
  { formKey: 'skinTone' },
  { formKey: 'ageRange' },
  { formKey: 'facialHair' },
]

/**
 * @param {{
 *   descriptors: Record<string, string>,
 *   imageUrl: string,
 *   selectedImageNumber: number,
 *   onCancel: () => void,
 *   onSaved: () => void,
 * }} props
 */
export default function SaveReportModal({
  descriptors,
  imageUrl,
  selectedImageNumber,
  onCancel,
  onSaved,
}) {
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedReport, setSavedReport] = useState(null)

  const summaryItems = KEY_DESCRIPTOR_FIELDS.map(({ formKey }) => {
    const raw = descriptors?.[formKey] ?? ''
    if (!String(raw).trim()) return null
    return {
      formKey,
      label: translateFieldLabel(formKey),
      value: translateFormOption(formKey, String(raw)),
    }
  }).filter(Boolean)

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const report = await saveReport(
        descriptors,
        imageUrl,
        selectedImageNumber,
        notes,
      )
      setSavedReport(report)
    } catch (err) {
      setError(
        err?.message ?? 'Failed to save the criminal report. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="save-report-overlay"
      role="presentation"
      onClick={saving || savedReport ? undefined : onCancel}
    >
      <div
        className="save-report-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-report-title"
        onClick={(e) => e.stopPropagation()}
      >
        {!savedReport ? (
          <>
            <header className="save-report-modal__header">
              <h2 id="save-report-title" className="save-report-modal__title">
                Confirm criminal report
              </h2>
              <button
                type="button"
                className="save-report-modal__close"
                onClick={onCancel}
                disabled={saving}
                aria-label="Close"
              />
            </header>

            <div className="save-report-modal__body">
              <figure className="save-report-modal__preview">
                <CompositeImage
                  src={imageUrl}
                  alt={`Selected composite variation ${selectedImageNumber}`}
                  className="save-report-modal__preview-image"
                />
                <figcaption>
                  Selected variation {selectedImageNumber}
                </figcaption>
              </figure>

              <section className="save-report-modal__summary">
                <h3 className="save-report-modal__summary-title">Key descriptors</h3>
                {summaryItems.length > 0 ? (
                  <dl className="save-report-modal__summary-list">
                    {summaryItems.map(({ formKey, label, value }) => (
                      <div key={formKey} className="save-report-modal__summary-row">
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="save-report-modal__summary-empty">
                    No key descriptors were recorded.
                  </p>
                )}
              </section>

              <div className="form-field form-field--full">
                <label htmlFor="save-report-notes">Additional case notes</label>
                <textarea
                  id="save-report-notes"
                  name="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes for this case file"
                  disabled={saving}
                  rows={4}
                />
              </div>

              {error ? (
                <p className="save-report-modal__error" role="alert">
                  {error}
                </p>
              ) : null}
            </div>

            <footer className="save-report-modal__footer">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={onCancel}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn btn--primary${saving ? ' btn--loading' : ''}`}
                onClick={handleSave}
                disabled={saving}
                aria-busy={saving}
              >
                {saving ? 'Saving report...' : 'Save Report'}
              </button>
            </footer>
          </>
        ) : (
          <>
            <header className="save-report-modal__header save-report-modal__header--success">
              <h2 id="save-report-title" className="save-report-modal__title">
                Report saved successfully
              </h2>
            </header>

            <div className="save-report-modal__body save-report-modal__body--success">
              <p className="save-report-modal__success-lead">
                The criminal report has been stored in the database.
              </p>
              <p className="save-report-modal__case-number">
                Case number:{' '}
                <strong>{savedReport.case_number}</strong>
              </p>
            </div>

            <footer className="save-report-modal__footer save-report-modal__footer--success">
              <Link
                to={`/reports/${savedReport.id}`}
                className="btn btn--primary"
                onClick={onSaved}
              >
                View Report
              </Link>
              <Link to="/form" className="btn btn--secondary" onClick={onSaved}>
                Start New Case
              </Link>
            </footer>
          </>
        )}
      </div>
    </div>
  )
}


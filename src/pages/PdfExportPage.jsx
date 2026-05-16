import { Link, useLocation } from 'react-router-dom'
import CompositeImage from '../components/CompositeImage'
import ShieldIcon from '../components/ShieldIcon'
import { DEFAULT_CASE_ID, SITE_NAME } from '../constants/site'
import './Page.css'

export default function PdfExportPage() {
  const location = useLocation()
  const {
    imageUrl,
    sideProfileImageUrl,
    description,
    caseReference,
    generatedAt,
  } = location.state ?? {}

  const caseId = caseReference ?? DEFAULT_CASE_ID
  const reportDate = generatedAt
    ? new Date(generatedAt).toLocaleDateString()
    : new Date().toLocaleDateString()

  const hasFront = Boolean(imageUrl)
  const hasSide = Boolean(sideProfileImageUrl)

  return (
    <article className="page pdf-export-page">
      <header className="page__header">
        <span className="page__eyebrow">Step 4 — Export</span>
        <h1 className="page__title">PDF Export</h1>
        <p className="page__description">
          Generate an official forensic composite report for case documentation
          and distribution to authorized personnel.
        </p>
      </header>

      <div className="page__card pdf-preview-card">
        <div className="pdf-preview-card__header">
          <ShieldIcon size={32} />
          <div>
            <span className="pdf-preview-card__dept">{SITE_NAME}</span>
            <span className="pdf-preview-card__title">Official Composite Report</span>
          </div>
        </div>
        <div className="pdf-preview-card__body pdf-preview-card__body--dual">
          <div className="pdf-preview-card__sketches">
            <figure className="pdf-preview-card__sketch">
              <span className="pdf-preview-card__sketch-label">Front View</span>
              {hasFront ? (
                <CompositeImage src={imageUrl} alt="Front view composite" />
              ) : (
                <div className="sketch-preview sketch-preview--compact">
                  <span>Front composite</span>
                </div>
              )}
            </figure>
            <figure className="pdf-preview-card__sketch">
              <span className="pdf-preview-card__sketch-label">Side Profile</span>
              {hasSide ? (
                <CompositeImage
                  src={sideProfileImageUrl}
                  alt="Side profile composite"
                />
              ) : (
                <div className="sketch-preview sketch-preview--compact">
                  <span>Side profile not generated</span>
                </div>
              )}
            </figure>
          </div>
          <div className="pdf-preview-card__details">
            <p><strong>Case ID:</strong> {caseId}</p>
            <p><strong>Date:</strong> {reportDate}</p>
            <p><strong>Investigator:</strong> [Authorized User]</p>
            <p><strong>Witness ID:</strong> W-001</p>
            {description?.ageRange ? (
              <p><strong>Age range:</strong> {description.ageRange}</p>
            ) : null}
          </div>
        </div>
        <div className="pdf-preview-card__stamp">OFFICIAL USE ONLY</div>
      </div>

      {!hasFront ? (
        <p className="form-submit-error" role="alert">
          No composite images were provided. Complete generation on the result
          page first.
        </p>
      ) : null}

      <div className="page__card">
        <h2>Export Options</h2>
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="case-id">Case ID</label>
            <input id="case-id" name="caseId" type="text" defaultValue={caseId} />
          </div>
          <div className="form-field">
            <label htmlFor="investigator">Lead Investigator</label>
            <input id="investigator" name="investigator" type="text" placeholder="Name and badge number" />
          </div>
          <div className="form-field form-field--full">
            <label htmlFor="export-notes">Report Notes</label>
            <textarea
              id="export-notes"
              name="exportNotes"
              placeholder="Optional notes to include in the PDF footer"
            />
          </div>
        </div>

        <div className="btn-group btn-group--stack-mobile">
          <Link to="/refine" state={location.state} className="btn btn--secondary">
            Back to Refinement
          </Link>
          <button type="button" className="btn btn--primary" disabled={!hasFront}>
            Download PDF Report
          </button>
          <Link to="/" className="btn btn--secondary">
            New Session
          </Link>
        </div>
      </div>
    </article>
  )
}

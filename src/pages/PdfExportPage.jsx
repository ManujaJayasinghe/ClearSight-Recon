import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import CompositeImage from '../components/CompositeImage'
import ExportPDF from '../components/ExportPDF'
import Logo from '../components/Logo'
import { useToast } from '../context/useToast'
import { DEFAULT_CASE_ID, SITE_NAME } from '../constants/site'
import { translateFormOption } from '../i18n/formOption'
import './Page.css'

export default function PdfExportPage() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const location = useLocation()
  const [investigator, setInvestigator] = useState('')
  const [exportNotes, setExportNotes] = useState('')
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
  const caseIdLabel = t('pdf.caseId').replace(':', '')

  return (
    <article className="page page--wide pdf-export-page">
      <header className="page__header">
        <span className="page__eyebrow">{t('pdf.eyebrow')}</span>
        <h1 className="page__title">{t('pdf.title')}</h1>
        <p className="page__description">{t('pdf.description')}</p>
      </header>

      <div className="page__card pdf-preview-card">
        <div className="pdf-preview-card__header">
          <Logo size={40} />
          <div>
            <span className="pdf-preview-card__dept">{SITE_NAME}</span>
            <span className="pdf-preview-card__title">{t('pdf.officialReport')}</span>
          </div>
        </div>

        <div className="pdf-preview-card__body pdf-preview-card__body--dual">
          <div className="pdf-preview-card__sketches">
            <figure className="pdf-preview-card__sketch">
              <span className="pdf-preview-card__sketch-label">{t('pdf.frontView')}</span>
              {hasFront ? (
                <CompositeImage src={imageUrl} alt={t('pdf.frontAlt')} />
              ) : (
                <div className="sketch-preview sketch-preview--compact">
                  <span>{t('pdf.frontPlaceholder')}</span>
                </div>
              )}
            </figure>
            <figure className="pdf-preview-card__sketch">
              <span className="pdf-preview-card__sketch-label">{t('pdf.sideProfile')}</span>
              {hasSide ? (
                <CompositeImage src={sideProfileImageUrl} alt={t('pdf.sideAlt')} />
              ) : (
                <div className="sketch-preview sketch-preview--compact">
                  <span>{t('pdf.sideNotGenerated')}</span>
                </div>
              )}
            </figure>
          </div>
          <div className="pdf-preview-card__details">
            <p>
              <strong>{t('pdf.caseId')}</strong> {caseId}
            </p>
            <p>
              <strong>{t('pdf.date')}</strong> {reportDate}
            </p>
            <p>
              <strong>{t('pdf.investigator')}</strong> {t('pdf.authorizedUser')}
            </p>
            <p>
              <strong>{t('pdf.witnessId')}</strong> W-001
            </p>
            {description?.ageRange ? (
              <p>
                <strong>{t('pdf.ageRange')}</strong>{' '}
                {translateFormOption('ageRange', description.ageRange)}
              </p>
            ) : null}
          </div>
        </div>
        <div className="pdf-preview-card__stamp">{t('pdf.officialStamp')}</div>
      </div>

      {!hasFront ? (
        <p className="form-submit-error" role="alert">
          {t('pdf.noImagesError')}
        </p>
      ) : null}

      <div className="page__card">
        <h2>{t('pdf.exportOptions')}</h2>
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="case-id">{caseIdLabel}</label>
            <input id="case-id" name="caseId" type="text" defaultValue={caseId} />
          </div>
          <div className="form-field">
            <label htmlFor="investigator">{t('pdf.leadInvestigator')}</label>
            <input
              id="investigator"
              name="investigator"
              type="text"
              value={investigator}
              onChange={(e) => setInvestigator(e.target.value)}
              placeholder={t('pdf.investigatorPlaceholder')}
            />
          </div>
          <div className="form-field form-field--full">
            <label htmlFor="export-notes">{t('pdf.reportNotes')}</label>
            <textarea
              id="export-notes"
              name="exportNotes"
              value={exportNotes}
              onChange={(e) => setExportNotes(e.target.value)}
              placeholder={t('pdf.notesPlaceholder')}
            />
          </div>
        </div>

        <div className="btn-group btn-group--stack-mobile">
          <Link to="/refine" state={location.state} className="btn btn--secondary">
            {t('pdf.backToRefine')}
          </Link>
          <ExportPDF
            imageUrl={imageUrl}
            sideProfileImageUrl={sideProfileImageUrl}
            description={description ?? {}}
            caseReference={caseId}
            generatedAt={generatedAt}
            investigator={investigator}
            notes={exportNotes}
            disabled={!hasFront}
            onSaved={() => {
              showToast(
                t('pdf.savedForMatching', 'Report saved for future matching.'),
              )
            }}
          />
          <Link to="/" className="btn btn--secondary">
            {t('pdf.newSession')}
          </Link>
        </div>
      </div>
    </article>
  )
}


import { useMemo } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import CompositeImage from '../components/CompositeImage'
import { INITIAL_WITNESS_FORM } from '../constants/witnessForm'
import { translateFieldLabel, translateFormOption } from '../i18n/formOption'
import { deleteReport, getReportById } from '../services/reportStorage'
import './Page.css'
import './ReportDetail.css'

/** @type {Record<string, string>} */
const DB_FIELD_TO_FORM_KEY = {
  face_shape: 'faceShape',
  skin_tone: 'skinTone',
  age_range: 'ageRange',
  eye_shape: 'eyeShape',
  eye_color: 'eyeColor',
  nose_type: 'noseType',
  hair_color: 'hairColor',
  hair_length: 'hairLength',
  facial_hair: 'facialHair',
  build: 'build',
  height: 'height',
  glasses: 'glasses',
}

/**
 * @param {string} dbKey
 */
function labelForDbField(dbKey) {
  const formKey = DB_FIELD_TO_FORM_KEY[dbKey] ?? dbKey
  return translateFieldLabel(formKey)
}

/**
 * @param {string} iso
 */
function formatCreatedDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * @param {Record<string, string>} descriptors
 */
function buildDescriptorRows(descriptors) {
  if (!descriptors || typeof descriptors !== 'object') return []

  return Object.keys(INITIAL_WITNESS_FORM)
    .filter((formKey) => {
      const raw = descriptors[formKey]
      return raw != null && String(raw).trim() !== ''
    })
    .map((formKey) => {
      const raw = String(descriptors[formKey]).trim()
      const translated = translateFormOption(formKey, raw)
      return {
        formKey,
        feature: translateFieldLabel(formKey),
        value: translated || raw,
      }
    })
}

export default function ReportDetail() {
  const { reportId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const matchContext = location.state?.matchContext ?? null

  const report = useMemo(
    () => (reportId ? getReportById(reportId) : null),
    [reportId],
  )

  const descriptorRows = useMemo(
    () => buildDescriptorRows(report?.descriptors),
    [report],
  )

  const handleDelete = () => {
    if (!reportId) return
    const confirmed = window.confirm(
      t(
        'reportDetail.deleteConfirm',
        'Delete this record permanently? This cannot be undone.',
      ),
    )
    if (!confirmed) return
    deleteReport(reportId)
    navigate('/form')
  }

  const handleExportAgain = () => {
    if (!report) return
    navigate('/pdf-export', {
      state: {
        imageUrl: report.imageUrl,
        description: report.descriptors ?? {},
        caseReference: report.caseNumber,
        generatedAt: report.createdDate,
      },
    })
  }

  const handleBackToGeneration = () => {
    if (location.state?.returnTo) {
      navigate(location.state.returnTo.pathname, {
        state: location.state.returnTo.state,
      })
      return
    }
    navigate('/result', {
      state: { description: report?.descriptors ?? {} },
    })
  }

  if (!report) {
    return (
      <article className="page report-detail">
        <header className="page__header">
          <h1 className="page__title">
            {t('reportDetail.notFound', 'Report not found')}
          </h1>
        </header>
        <Link to="/form" className="btn btn--secondary">
          {t('reportDetail.backToForm', 'Back to Form')}
        </Link>
      </article>
    )
  }

  return (
    <article className="page page--wide report-detail">
      <header className="report-detail__header">
        <button
          type="button"
          className="report-detail__back-link"
          onClick={handleBackToGeneration}
        >
          {t('reportDetail.backToGeneration', 'Back to Generation')}
        </button>
        <h1 className="report-detail__case">{report.caseNumber || '—'}</h1>
        <p className="report-detail__created">
          {t('reportDetail.created', 'Created')}{' '}
          {formatCreatedDate(report.createdDate)}
        </p>
      </header>

      {matchContext ? (
        <section
          className={`report-detail__match-banner report-detail__match-banner--${matchContext.matchType ?? 'possible'}`}
          role="status"
        >
          <p className="report-detail__match-score">
            {t('reportDetail.matchScore', 'Match score')}:{' '}
            <strong>{matchContext.matchScore}%</strong>
          </p>
          <p className="report-detail__match-warning">
            {t(
              'reportDetail.matchWarning',
              'This record may match your current suspect',
            )}
          </p>
          {matchContext.matchedFields?.length > 0 ? (
            <div className="report-detail__match-tags-wrap">
              <span className="report-detail__match-tags-label">
                {t('match.matchedFields', 'Matched Fields')}
              </span>
              <ul className="report-detail__match-tags report-detail__match-tags--matched">
                {matchContext.matchedFields.map((field) => (
                  <li key={field}>{labelForDbField(field)}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {matchContext.unmatchedFields?.length > 0 ? (
            <div className="report-detail__match-tags-wrap">
              <span className="report-detail__match-tags-label">
                {t('match.differences', 'Differences')}
              </span>
              <ul className="report-detail__match-tags report-detail__match-tags--diff">
                {matchContext.unmatchedFields.map((field) => (
                  <li key={field}>{labelForDbField(field)}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      {report.imageUrl ? (
        <section className="page__card report-detail__image-card">
          <CompositeImage
            src={report.imageUrl}
            alt={t('reportDetail.compositeAlt', 'Saved composite sketch')}
            className="report-detail__image"
          />
        </section>
      ) : null}

      <section className="page__card report-detail__table-card">
        <h2 className="report-detail__table-heading">
          {t('reportDetail.descriptionHeading', 'Witness description')}
        </h2>
        {descriptorRows.length === 0 ? (
          <p className="report-detail__empty">
            {t('reportDetail.noDescriptors', 'No description fields recorded.')}
          </p>
        ) : (
          <table className="report-detail__table">
            <thead>
              <tr>
                <th scope="col">{t('reportDetail.featureCol', 'Feature')}</th>
                <th scope="col">{t('reportDetail.valueCol', 'Value')}</th>
              </tr>
            </thead>
            <tbody>
              {descriptorRows.map(({ formKey, feature, value }) => (
                <tr key={formKey}>
                  <th scope="row">{feature}</th>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <nav className="report-detail__actions" aria-label={t('reportDetail.actionsAria', 'Report actions')}>
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleExportAgain}
          disabled={!report.imageUrl}
        >
          {t('reportDetail.exportAgain', 'Export PDF Again')}
        </button>
        <button
          type="button"
          className="btn btn--secondary report-detail__btn-delete"
          onClick={handleDelete}
        >
          {t('reportDetail.deleteRecord', 'Delete This Record')}
        </button>
        <Link to="/form" className="btn btn--secondary">
          {t('reportDetail.backToForm', 'Back to Form')}
        </Link>
      </nav>
    </article>
  )
}

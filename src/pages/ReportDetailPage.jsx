import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import CompositeImage from '../components/CompositeImage'
import { getReportById } from '../services/reportService'
import {
  buildReportSections,
  formatReportDate,
} from '../utils/reportFields'
import './Page.css'
import './ReportDetailPage.css'

export default function ReportDetailPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await getReportById(id)
        if (!cancelled) setReport(data)
      } catch (err) {
        if (!cancelled) {
          setError(err?.message ?? 'Failed to load report.')
          setReport(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id])

  const sections = useMemo(
    () => (report ? buildReportSections(report) : []),
    [report],
  )

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <article className="page report-detail-page">
        <p className="report-detail-page__status">
          {t('reports.detailLoading', 'Loading report…')}
        </p>
      </article>
    )
  }

  if (error || !report) {
    return (
      <article className="page report-detail-page">
        <header className="page__header">
          <h1 className="page__title">
            {t('reports.detailNotFound', 'Report not found')}
          </h1>
          <p className="page__description">
            {error || t('reports.detailNotFoundDesc', 'This report could not be loaded.')}
          </p>
        </header>
        <Link to="/reports" className="btn btn--primary">
          {t('reports.backToReports', 'Back to Reports')}
        </Link>
      </article>
    )
  }

  return (
    <article className="page page--wide report-detail-page report-detail-page--printable">
      <header className="page__header report-detail-page__no-print">
        <span className="page__eyebrow">
          {t('reports.detailEyebrow', 'Criminal report')}
        </span>
        <h1 className="page__title">{report.case_number}</h1>
        <p className="page__description">
          {t('reports.detailCreated', 'Created')} {formatReportDate(report.created_at)}
          {report.selected_image_number
            ? ` · ${t('reports.detailVariation', 'Variation')} ${report.selected_image_number}`
            : ''}
        </p>
      </header>

      <header className="report-detail-page__print-header" aria-hidden="true">
        <h1>{report.case_number}</h1>
        <p>{formatReportDate(report.created_at)}</p>
      </header>

      {report.generated_image_url ? (
        <section className="page__card report-detail-page__hero">
          <CompositeImage
            src={report.generated_image_url}
            alt={`Composite for ${report.case_number}`}
            className="report-detail-page__hero-image"
          />
        </section>
      ) : null}

      <div className="report-detail-page__sections">
        {sections.length === 0 ? (
          <section className="page__card">
            <p className="report-detail-page__empty">
              {t('reports.detailNoFields', 'No descriptor fields recorded.')}
            </p>
          </section>
        ) : (
          sections.map((section) => (
            <section key={section.id} className="page__card report-detail-page__section">
              <h2 className="report-detail-page__section-title">{section.title}</h2>
              <dl className="report-detail-page__fields">
                {section.fields.map(({ formKey, label, value }) => (
                  <div key={formKey} className="report-detail-page__field">
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))
        )}

        <section className="page__card report-detail-page__section report-detail-page__notes-section">
          <h2 className="report-detail-page__section-title">
            {t('reports.notesTitle', 'Notes')}
          </h2>
          {report.notes?.trim() ? (
            <p className="report-detail-page__notes-text">{report.notes}</p>
          ) : (
            <p className="report-detail-page__empty">
              {t('reports.notesEmpty', 'No additional notes recorded.')}
            </p>
          )}
        </section>
      </div>

      <div className="report-detail-page__actions report-detail-page__no-print">
        <Link to="/reports" className="btn btn--secondary">
          {t('reports.backToReports', 'Back to Reports')}
        </Link>
        <button type="button" className="btn btn--primary" onClick={handlePrint}>
          {t('reports.printReport', 'Print Report')}
        </button>
      </div>
    </article>
  )
}


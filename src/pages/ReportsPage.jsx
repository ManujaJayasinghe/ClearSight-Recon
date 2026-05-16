import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import CompositeImage from '../components/CompositeImage'
import { getAllReports, isUsingLocalReportStorage } from '../services/reportService'
import { isSupabaseError } from '../utils/isSupabaseError'
import {
  formatReportDateShort,
  getCardDescriptorSummary,
  getReportDisplayValue,
  getReportRawValue,
} from '../utils/reportFields'
import './Page.css'
import './ReportsPage.css'

const SORT_NEWEST = 'newest'
const SORT_OLDEST = 'oldest'

/**
 * @param {object} report
 * @param {string} query
 */
function reportMatchesSearch(report, query) {
  if (!query) return true
  const q = query.toLowerCase()

  const caseNumber = (report.case_number ?? '').toLowerCase()
  if (caseNumber.includes(q)) return true

  const ethnicityRaw = getReportRawValue(report, 'ethnicity').toLowerCase()
  const ethnicityDisplay = (
    getReportDisplayValue(report, 'ethnicity') ?? ''
  ).toLowerCase()
  if (ethnicityRaw.includes(q) || ethnicityDisplay.includes(q)) return true

  const ageRaw = getReportRawValue(report, 'ageRange').toLowerCase()
  const ageDisplay = (getReportDisplayValue(report, 'ageRange') ?? '').toLowerCase()
  if (ageRaw.includes(q) || ageDisplay.includes(q)) return true

  return false
}

export default function ReportsPage() {
  const { t } = useTranslation()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState(SORT_NEWEST)
  const [reloadKey, setReloadKey] = useState(0)

  const localStorageMode = isUsingLocalReportStorage()

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await getAllReports()
        if (!cancelled) setReports(data)
      } catch (err) {
        if (!cancelled) {
          const message = err?.message ?? 'Failed to load criminal reports.'
          setError(
            isSupabaseError(err)
              ? `${message} Verify Supabase credentials in .env and run supabase/criminal_reports.sql.`
              : message,
          )
          setReports([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const filteredReports = useMemo(() => {
    const query = search.trim()
    let list = reports.filter((report) => reportMatchesSearch(report, query))

    list = [...list].sort((a, b) => {
      const aTime = new Date(a.created_at ?? 0).getTime()
      const bTime = new Date(b.created_at ?? 0).getTime()
      return sort === SORT_OLDEST ? aTime - bTime : bTime - aTime
    })

    return list
  }, [reports, search, sort])

  return (
    <article className="page page--wide reports-page">
      <header className="page__header">
        <span className="page__eyebrow">{t('reports.eyebrow', 'Criminal database')}</span>
        <h1 className="page__title">{t('reports.title', 'Criminal Reports')}</h1>
        <p className="page__description">
          {t(
            'reports.description',
            'Search and review saved suspect composite reports from the database.',
          )}
        </p>
      </header>

      <div className="reports-page__toolbar page__card">
        <div className="reports-page__search-wrap">
          <label htmlFor="reports-search" className="reports-page__search-label">
            {t('reports.searchLabel', 'Search')}
          </label>
          <input
            id="reports-search"
            type="search"
            className="reports-page__search"
            placeholder={t(
              'reports.searchPlaceholder',
              'Case number, ethnicity, or age range…',
            )}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="reports-page__sort-wrap">
          <label htmlFor="reports-sort" className="reports-page__sort-label">
            {t('reports.sortLabel', 'Sort')}
          </label>
          <select
            id="reports-sort"
            className="reports-page__sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value={SORT_NEWEST}>
              {t('reports.sortNewest', 'Newest First')}
            </option>
            <option value={SORT_OLDEST}>
              {t('reports.sortOldest', 'Oldest First')}
            </option>
          </select>
        </div>
      </div>

      {localStorageMode ? (
        <div className="page__card reports-page__setup" role="status">
          <p>
            <strong>Local mode.</strong> Reports are saved in this browser. Add{' '}
            <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>{' '}
            to <code>.env</code> for cloud storage.
          </p>
        </div>
      ) : null}

      {loading ? (
        <p className="reports-page__status">{t('reports.loading', 'Loading reports…')}</p>
      ) : null}

      {error ? (
        <div className="page__card reports-page__error" role="alert">
          <p className="form-submit-error">{error}</p>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => setReloadKey((k) => k + 1)}
          >
            {t('reports.retry', 'Retry')}
          </button>
        </div>
      ) : null}

      {!loading && !error && filteredReports.length === 0 ? (
        <div className="page__card reports-page__empty">
          <p>
            {search.trim()
              ? t('reports.noResults', 'No reports match your search.')
              : t('reports.noReports', 'No criminal reports have been saved yet.')}
          </p>
          <Link to="/form" className="btn btn--primary">
            {t('reports.startForm', 'Start Witness Form')}
          </Link>
        </div>
      ) : null}

      {!loading && !error && filteredReports.length > 0 ? (
        <ul className="reports-page__grid">
          {filteredReports.map((report) => {
            const descriptors = getCardDescriptorSummary(report)
            return (
              <li key={report.id} className="reports-page__card page__card">
                <div className="reports-page__thumb-wrap">
                  {report.generated_image_url ? (
                    <CompositeImage
                      src={report.generated_image_url}
                      alt=""
                      className="reports-page__thumb"
                    />
                  ) : (
                    <div className="reports-page__thumb-placeholder">
                      {t('reports.noImage', 'No image')}
                    </div>
                  )}
                </div>

                <div className="reports-page__card-body">
                  <h2 className="reports-page__case">{report.case_number}</h2>
                  <p className="reports-page__date">
                    {formatReportDateShort(report.created_at)}
                  </p>

                  {descriptors.length > 0 ? (
                    <ul className="reports-page__descriptors">
                      {descriptors.map(({ label, value }) => (
                        <li key={label}>
                          <span className="reports-page__desc-label">{label}</span>
                          <span className="reports-page__desc-value">{value}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <Link
                    to={`/reports/${report.id}`}
                    className="btn btn--secondary reports-page__view-btn"
                  >
                    {t('reports.viewFull', 'View Full Report')}
                  </Link>
                </div>
              </li>
            )
          })}
        </ul>
      ) : null}
    </article>
  )
}



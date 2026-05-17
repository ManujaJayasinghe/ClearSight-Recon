import { useTranslation } from 'react-i18next'
import { translateFieldLabel } from '../i18n/formOption'
import Logo from './Logo'
import '../styles/matchSeverity.css'
import './MatchModal.css'

/** @type {Record<string, string>} DB column → witness form field key */
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

const HEADER_BY_TYPE = {
  exact: {
    titleKey: 'match.headerExact',
    titleDefault: 'Existing Record Found',
  },
  high: {
    titleKey: 'match.headerHigh',
    titleDefault: 'Similar Suspect Found',
  },
  possible: {
    titleKey: 'match.headerPossible',
    titleDefault: 'Possible Match Found',
  },
}

const MATCH_TYPE_LABEL = {
  exact: { key: 'match.typeExact', default: 'Exact Match' },
  high: { key: 'match.typeHigh', default: 'High Match' },
  possible: { key: 'match.typePossible', default: 'Possible Match' },
}

const SEVERITY_ARIA = {
  exact: 'Exact match — highest severity',
  high: 'High match — similar suspect',
  possible: 'Possible match — review recommended',
}

/**
 * @param {string} dbKey
 */
function labelForField(dbKey) {
  const formKey = DB_FIELD_TO_FORM_KEY[dbKey] ?? dbKey
  const translated = translateFieldLabel(formKey)
  if (translated !== formKey) return translated
  return dbKey
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/**
 * @param {string} dateStr e.g. "2026-05-16 14:32"
 */
function formatCreatedDisplay(dateStr) {
  if (!dateStr) return ''
  const parsed = Date.parse(dateStr.replace(' ', 'T'))
  if (Number.isNaN(parsed)) return dateStr

  const d = new Date(parsed)
  const datePart = d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const timePart = d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${datePart} at ${timePart}`
}

/**
 * @param {{
 *   matches: {
 *     caseNumber: string,
 *     createdDate: string,
 *     matchScore: number,
 *     matchType: 'exact' | 'high' | 'possible',
 *     matchedFields: string[],
 *     unmatchedFields: string[],
 *     reportId: string,
 *   }[],
 *   onViewReport: (reportId: string) => void,
 *   onContinue: () => void,
 *   onClose: () => void,
 * }} props
 */
export default function MatchModal({
  matches,
  onViewReport,
  onContinue,
  onClose,
}) {
  const { t } = useTranslation()

  if (!matches?.length) return null

  const headerType = matches[0].matchType
  const headerCopy = HEADER_BY_TYPE[headerType] ?? HEADER_BY_TYPE.possible
  const singleMatch = matches.length === 1
  const matchCount = matches.length

  return (
    <div className="match-modal-overlay" role="presentation">
      <div
        className="match-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-modal-title"
      >
        <header
          className={`match-modal__header match-modal__header--${headerType}`}
        >
          <div className="match-modal__header-inner">
            <Logo size={40} className="match-modal__logo" />
            <div className="match-modal__header-text">
              <h2 id="match-modal-title" className="match-modal__title">
                {t(headerCopy.titleKey, headerCopy.titleDefault)}
              </h2>
              <p className="match-modal__subtitle">
                {matchCount === 1
                  ? t(
                      'match.recordsFoundOne',
                      '1 matching record found in the database',
                    )
                  : t(
                      'match.recordsFoundMany',
                      '{{count}} matching records found in the database',
                      { count: matchCount },
                    )}
              </p>
            </div>
          </div>
        </header>

        <ul className="match-modal__list">
          {matches.map(
            (
              {
                reportId,
                caseNumber,
                createdDate,
                matchScore,
                matchType,
                matchedFields,
                unmatchedFields,
              },
            ) => {
              const showCardContinue = singleMatch

              return (
                <li
                  key={reportId}
                  className={`match-modal-card match-modal-card--${matchType}`}
                  aria-label={`${SEVERITY_ARIA[matchType] ?? 'Match'}: ${caseNumber}, ${matchScore}%`}
                >
                  <div className="match-modal-card__top">
                    <div className="match-modal-card__identity">
                      <span
                        className={`match-severity-pill match-severity-pill--${matchType}`}
                      >
                        {t(
                          MATCH_TYPE_LABEL[matchType]?.key,
                          MATCH_TYPE_LABEL[matchType]?.default,
                        )}
                      </span>
                      <p className="match-modal-card__case">
                        {caseNumber || '—'}
                      </p>
                      <p className="match-modal-card__created">
                        {t('match.createdLabel', 'Created')}{' '}
                        {formatCreatedDisplay(createdDate) || '—'}
                      </p>
                    </div>
                    <div className="match-modal-card__score-wrap">
                      <span
                        className={`match-modal-card__badge match-modal-card__badge--${matchType}`}
                      >
                        {matchScore}% {t('match.matchLabel', 'MATCH')}
                      </span>
                      <span
                        className={`match-modal-card__type-label match-modal-card__type-label--${matchType}`}
                      >
                        {t(
                          MATCH_TYPE_LABEL[matchType]?.key,
                          MATCH_TYPE_LABEL[matchType]?.default,
                        )}
                      </span>
                    </div>
                  </div>

                  {matchedFields?.length > 0 ? (
                    <section className="match-modal-card__section">
                      <h4 className="match-modal-card__section-label">
                        {t('match.matchedFields', 'Matched Fields')}
                      </h4>
                      <ul className="match-modal-card__tags match-modal-card__tags--matched">
                        {matchedFields.map((field) => (
                          <li key={field} className="match-modal-card__tag">
                            {labelForField(field)}
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}

                  {unmatchedFields?.length > 0 ? (
                    <section className="match-modal-card__section">
                      <h4 className="match-modal-card__section-label">
                        {t('match.differences', 'Differences')}
                      </h4>
                      <ul className="match-modal-card__tags match-modal-card__tags--diff">
                        {unmatchedFields.map((field) => (
                          <li key={field} className="match-modal-card__tag">
                            {labelForField(field)}
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}

                  <div className="match-modal-card__actions">
                    <button
                      type="button"
                      className="btn match-modal-card__btn-view"
                      onClick={() => onViewReport(reportId)}
                    >
                      {t('match.viewReport', 'View Full Report')}
                    </button>
                    {showCardContinue ? (
                      <button
                        type="button"
                        className="btn match-modal-card__btn-continue"
                        onClick={onContinue}
                      >
                        {t(
                          'match.continueAnyway',
                          'Continue Generating Anyway',
                        )}
                      </button>
                    ) : null}
                  </div>
                </li>
              )
            },
          )}
        </ul>

        <footer className="match-modal__footer">
          <button
            type="button"
            className="btn match-modal__footer-continue"
            onClick={onContinue}
          >
            {t('match.continueAnyway', 'Continue Generating Anyway')}
          </button>
          <button
            type="button"
            className="match-modal__footer-cancel"
            onClick={onClose}
          >
            {t('match.cancel', 'Cancel')}
          </button>
        </footer>
      </div>
    </div>
  )
}

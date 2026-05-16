import { useTranslation } from 'react-i18next'
import { translateFieldLabel } from '../i18n/formOption'
import './MatchWarningModal.css'

/** @type {Record<string, string>} DB column → witness form field key */
const DB_FIELD_TO_FORM_KEY = {
  gender: 'gender',
  ethnicity: 'ethnicity',
  face_shape: 'faceShape',
  skin_tone: 'skinTone',
  age_range: 'ageRange',
  eye_shape: 'eyeShape',
  eye_color: 'eyeColor',
  eye_size: 'eyeSize',
  eyebrow_thickness: 'eyebrowThickness',
  eyebrow_shape: 'eyebrowShape',
  nose_type: 'noseType',
  nose_size: 'noseSize',
  nostril_width: 'nostrilWidth',
  nose_bridge: 'noseBridgeHeight',
  lip_thickness: 'lipThickness',
  mouth_width: 'mouthWidth',
  hair_color: 'hairColor',
  hair_length: 'hairLength',
  hair_style: 'hairStyle',
  facial_hair: 'facialHair',
  cheekbone_prominence: 'cheekboneProminence',
  jaw_shape: 'jawShape',
  jaw_width: 'jawWidth',
  forehead_size: 'foreheadSize',
  scar_location: 'scarLocation',
  scar_description: 'scars',
  birthmark_location: 'birthmarkLocation',
  birthmark_description: 'birthmarks',
  other_features: 'otherFeatures',
}

/**
 * @param {string} dbKey
 */
function labelForMatchedField(dbKey) {
  const formKey = DB_FIELD_TO_FORM_KEY[dbKey] ?? dbKey
  const translated = translateFieldLabel(formKey)
  if (translated !== formKey) return translated
  return dbKey.replace(/_/g, ' ')
}

/**
 * @param {string} iso
 */
function formatReportDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * @param {{
 *   matches: { report: object, score: number, level: string, matchedFields: string[] }[],
 *   onViewReport: (id: string) => void,
 *   onContinue: () => void,
 *   onClose: () => void,
 * }} props
 */
export default function MatchWarningModal({
  matches,
  onViewReport,
  onContinue,
  onClose,
}) {
  const { t } = useTranslation()

  if (!matches?.length) return null

  const levelHeaders = {
    exact: t('match.headerExact', 'Existing Record Found'),
    high: t('match.headerHigh', 'Similar Suspect Found'),
    possible: t('match.headerPossible', 'Possible Match Found'),
  }

  return (
    <div
      className="match-modal-overlay"
      role="presentation"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        className="match-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="match-modal__header">
          <h2 id="match-modal-title" className="match-modal__title">
            {t('match.title', 'Database matches found')}
          </h2>
          <p className="match-modal__subtitle">
            {t(
              'match.subtitle',
              'Review similar records before generating a new composite. Matches are ordered by score.',
            )}
          </p>
          <button
            type="button"
            className="match-modal__close"
            onClick={onClose}
            aria-label={t('match.close', 'Close')}
          />
        </header>

        <ul className="match-modal__list">
          {matches.map(({ report, score, level, matchedFields }) => (
            <li
              key={report.id}
              className={`match-card match-card--${level}`}
            >
              <h3 className={`match-card__banner match-card__banner--${level}`}>
                {levelHeaders[level] ?? t('match.headerDefault', 'Match Found')}
              </h3>

              <div className="match-card__body">
                <dl className="match-card__meta">
                  <div>
                    <dt>{t('match.caseNumber', 'Case number')}</dt>
                    <dd>{report.case_number ?? '—'}</dd>
                  </div>
                  <div>
                    <dt>{t('match.created', 'Created')}</dt>
                    <dd>{formatReportDate(report.created_at)}</dd>
                  </div>
                  <div>
                    <dt>{t('match.matchPercent', 'Match')}</dt>
                    <dd className="match-card__score">{score}%</dd>
                  </div>
                </dl>

                {matchedFields?.length > 0 ? (
                  <div className="match-card__tags-wrap">
                    <span className="match-card__tags-label">
                      {t('match.matchedFields', 'Matched fields')}
                    </span>
                    <ul className="match-card__tags">
                      {matchedFields.map((field) => (
                        <li key={field} className="match-card__tag">
                          {labelForMatchedField(field)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="match-card__actions">
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => onViewReport(report.id)}
                  >
                    {t('match.viewReport', 'View Full Report')}
                  </button>
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={onContinue}
                  >
                    {t('match.continueAnyway', 'Continue Generating Anyway')}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <footer className="match-modal__footer">
          <button
            type="button"
            className="btn btn--primary btn--large"
            onClick={onContinue}
          >
            {t('match.continueAnyway', 'Continue Generating Anyway')}
          </button>
        </footer>
      </div>
    </div>
  )
}

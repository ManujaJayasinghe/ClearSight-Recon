import { useTranslation } from 'react-i18next'

export default function FormProgressBar({ completedCount, totalCount, percent }) {
  const { t } = useTranslation()

  return (
    <div className="form-progress" aria-label={t('form.progressLabel')}>
      <div className="form-progress__header">
        <span className="form-progress__label">{t('form.progressLabel')}</span>
        <span className="form-progress__count">
          {t('form.progressCount', { completed: completedCount, total: totalCount })}
        </span>
      </div>
      <div
        className="form-progress__track"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={t('form.progressPercent', { percent })}
      >
        <div
          className="form-progress__fill"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

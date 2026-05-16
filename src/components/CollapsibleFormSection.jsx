import { useId } from 'react'
import { useTranslation } from 'react-i18next'

export default function CollapsibleFormSection({
  id,
  title,
  isOpen,
  onToggle,
  isComplete,
  isRequired,
  children,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}) {
  const { t } = useTranslation()
  const panelId = useId()
  const headerId = `${id}-header`

  return (
    <section
      id={id}
      className={`collapsible-section page__card${isOpen ? ' collapsible-section--open' : ''}${isComplete ? ' collapsible-section--complete' : ''}`}
    >
      <button
        type="button"
        id={headerId}
        className="collapsible-section__trigger"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className="collapsible-section__trigger-left">
          <span
            className={`collapsible-section__status${isComplete ? ' collapsible-section__status--done' : ''}`}
            aria-hidden="true"
          />
          <span className="collapsible-section__title">
            {title}
            {isRequired ? (
              <span className="collapsible-section__required">
                {t('form.required')}
              </span>
            ) : null}
          </span>
        </span>
        <span className="collapsible-section__chevron" aria-hidden="true" />
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        className="collapsible-section__panel"
        hidden={!isOpen}
      >
        <div className="form-grid">{children}</div>

        {(hasPrev || hasNext) && (
          <div className="collapsible-section__nav">
            {hasPrev ? (
              <button
                type="button"
                className="btn btn--secondary btn--section-nav"
                onClick={onPrev}
              >
                {t('form.previous')}
              </button>
            ) : (
              <span />
            )}
            {hasNext ? (
              <button
                type="button"
                className="btn btn--secondary btn--section-nav"
                onClick={onNext}
              >
                {t('form.nextSection')}
              </button>
            ) : null}
          </div>
        )}
      </div>
    </section>
  )
}

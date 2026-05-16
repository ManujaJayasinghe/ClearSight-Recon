import { useTranslation } from 'react-i18next'
import { FORM_SECTIONS } from '../constants/witnessFormSections'
import { translateSectionShortTitle } from '../i18n/formOption'

export default function FormSectionNav({ completedIds, activeSectionId, onJump }) {
  const { t } = useTranslation()

  return (
    <nav className="form-section-nav" aria-label={t('form.sectionNavAria')}>
      <ul>
        {FORM_SECTIONS.map((section) => {
          const isComplete = completedIds.has(section.id)
          const isActive = activeSectionId === section.id
          return (
            <li key={section.id}>
              <button
                type="button"
                className={`form-section-nav__btn${isComplete ? ' form-section-nav__btn--complete' : ''}${isActive ? ' form-section-nav__btn--active' : ''}`}
                onClick={() => onJump(section.id)}
              >
                {translateSectionShortTitle(section.id)}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

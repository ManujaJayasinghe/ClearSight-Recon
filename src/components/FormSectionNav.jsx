import { FORM_SECTIONS } from '../constants/witnessFormSections'

export default function FormSectionNav({ completedIds, activeSectionId, onJump }) {
  return (
    <nav className="form-section-nav" aria-label="Jump to form section">
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
                {section.shortTitle}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

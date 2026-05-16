import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '../i18n'
import './LanguageSwitcher.css'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.language === LANGUAGES.si ? LANGUAGES.si : LANGUAGES.en

  return (
    <div
      className="language-switcher"
      role="group"
      aria-label="Select language"
    >
      <button
        type="button"
        className={`language-switcher__btn${current === LANGUAGES.en ? ' language-switcher__btn--active' : ''}`}
        onClick={() => i18n.changeLanguage(LANGUAGES.en)}
        aria-pressed={current === LANGUAGES.en}
      >
        ENG
      </button>
      <button
        type="button"
        className={`language-switcher__btn${current === LANGUAGES.si ? ' language-switcher__btn--active' : ''}`}
        onClick={() => i18n.changeLanguage(LANGUAGES.si)}
        aria-pressed={current === LANGUAGES.si}
      >
        SIN
      </button>
    </div>
  )
}

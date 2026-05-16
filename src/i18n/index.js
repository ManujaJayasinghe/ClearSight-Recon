import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import si from './locales/si.json'

export const LANGUAGE_STORAGE_KEY = 'clearsight-language'
export const LANGUAGES = {
  en: 'en',
  si: 'si',
}

function getStoredLanguage() {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (stored === LANGUAGES.si || stored === LANGUAGES.en) {
      return stored
    }
  } catch {
    /* ignore */
  }
  return LANGUAGES.en
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    si: { translation: si },
  },
  lng: getStoredLanguage(),
  fallbackLng: LANGUAGES.en,
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lng)
  } catch {
    /* ignore */
  }
  document.documentElement.lang = lng === LANGUAGES.si ? 'si' : 'en'
})

document.documentElement.lang = i18n.language === LANGUAGES.si ? 'si' : 'en'

export default i18n

import LanguageSwitcher from './LanguageSwitcher'
import './AppHeader.css'

export default function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header__spacer" aria-hidden="true" />
      <LanguageSwitcher />
    </header>
  )
}

import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SITE_NAME } from '../constants/site'
import ShieldIcon from './ShieldIcon'
import './Sidebar.css'

const navItems = [
  { to: '/', labelKey: 'nav.home', end: true },
  { to: '/form', labelKey: 'nav.witnessForm' },
  { to: '/result', labelKey: 'nav.sketchResult' },
  { to: '/refine', labelKey: 'nav.refinement' },
  { to: '/pdf-export', labelKey: 'nav.pdfExport' },
  { to: '/reports', labelKey: 'nav.reports' },
]

export default function Sidebar() {
  const { t } = useTranslation()

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__badge">
          <ShieldIcon size={36} />
        </div>
        <div className="sidebar__brand-text">
          <span className="sidebar__title">{SITE_NAME}</span>
          <span className="sidebar__subtitle">{t('site.tagline')}</span>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label={t('nav.mainAria')}>
        <ul>
          {navItems.map(({ to, labelKey, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
                }
              >
                {t(labelKey)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

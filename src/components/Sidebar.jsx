import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileDown,
  FolderOpen,
  Home,
  ScanFace,
  SlidersHorizontal,
} from 'lucide-react'
import { APP_VERSION, SITE_NAME } from '../constants/site'
import BrandTitle from './BrandTitle'
import Logo from './Logo'
import './Sidebar.css'

const navItems = [
  { to: '/', labelKey: 'nav.home', end: true, Icon: Home },
  { to: '/form', labelKey: 'nav.witnessForm', Icon: ClipboardList },
  { to: '/result', labelKey: 'nav.sketchResult', Icon: ScanFace },
  { to: '/refine', labelKey: 'nav.refinement', Icon: SlidersHorizontal },
  { to: '/pdf-export', labelKey: 'nav.pdfExport', Icon: FileDown },
  { to: '/reports', labelKey: 'nav.reports', Icon: FolderOpen },
]

/**
 * @param {{
 *   to: string,
 *   label: string,
 *   end?: boolean,
 *   Icon: import('lucide-react').LucideIcon,
 *   collapsed?: boolean,
 *   variant?: 'sidebar' | 'tab',
 * }} props
 */
function NavItem({ to, label, end, Icon, collapsed = false, variant = 'sidebar' }) {
  const linkClass =
    variant === 'tab' ? 'sidebar-tab__link' : 'sidebar__link'

  return (
    <li className={variant === 'tab' ? 'sidebar-tab__item' : 'sidebar__item'}>
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
          `${linkClass}${isActive ? ` ${linkClass}--active` : ''}`
        }
        data-tooltip={collapsed ? label : undefined}
        title={collapsed ? label : undefined}
      >
        <Icon className={`${linkClass}-icon`} size={20} strokeWidth={2} aria-hidden />
        <span className={`${linkClass}-label`}>{label}</span>
      </NavLink>
    </li>
  )
}

/**
 * @param {{ collapsed: boolean, onToggleCollapsed: () => void }} props
 */
export default function Sidebar({ collapsed, onToggleCollapsed }) {
  const { t } = useTranslation()

  return (
    <>
      <aside
        className={`sidebar sidebar--desktop${collapsed ? ' sidebar--collapsed' : ''}`}
        aria-label={t('nav.mainAria')}
      >
        <div className="sidebar__header">
          <div className="sidebar__brand" aria-label={SITE_NAME}>
            <div className="sidebar__badge">
              <Logo size={40} className="sidebar__logo" />
            </div>
            <div className="sidebar__brand-text">
              <BrandTitle name={SITE_NAME} size="sidebar" />
              <span className="sidebar__subtitle">{t('site.tagline')}</span>
            </div>
          </div>

          <button
            type="button"
            className="sidebar__toggle"
            onClick={onToggleCollapsed}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight size={18} strokeWidth={2} aria-hidden />
            ) : (
              <ChevronLeft size={18} strokeWidth={2} aria-hidden />
            )}
          </button>
        </div>

        <nav className="sidebar__nav">
          <ul>
            {navItems.map(({ to, labelKey, end, Icon }) => (
              <NavItem
                key={to}
                to={to}
                end={end}
                label={t(labelKey)}
                Icon={Icon}
                collapsed={collapsed}
              />
            ))}
          </ul>
        </nav>

        <footer className="sidebar__footer">
          <span className="sidebar__version">v{APP_VERSION}</span>
          <span className="sidebar__credit">Built with Fal AI</span>
        </footer>
      </aside>

      <nav className="sidebar-tab" aria-label={t('nav.mainAria')}>
        <ul className="sidebar-tab__list">
          {navItems.map(({ to, labelKey, end, Icon }) => (
            <NavItem
              key={to}
              to={to}
              end={end}
              label={t(labelKey)}
              Icon={Icon}
              variant="tab"
            />
          ))}
        </ul>
      </nav>
    </>
  )
}

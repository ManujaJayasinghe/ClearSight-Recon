import { NavLink } from 'react-router-dom'
import { SITE_NAME, SITE_TAGLINE } from '../constants/site'
import ShieldIcon from './ShieldIcon'
import './Sidebar.css'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/form', label: 'Witness Description' },
  { to: '/result', label: 'Sketch Result' },
  { to: '/refine', label: 'Refinement' },
  { to: '/pdf-export', label: 'PDF Export' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__badge">
          <ShieldIcon size={36} />
        </div>
        <div className="sidebar__brand-text">
          <span className="sidebar__title">{SITE_NAME}</span>
          <span className="sidebar__subtitle">{SITE_TAGLINE}</span>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="Main navigation">
        <ul>
          {navItems.map(({ to, label, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

import { Outlet } from 'react-router-dom'
import { ToastProvider } from '../context/ToastContext.jsx'
import { useSidebarCollapsed } from '../hooks/useSidebarCollapsed'
import AppHeader from './AppHeader'
import ErrorBoundary from './ErrorBoundary'
import Sidebar from './Sidebar'
import './Layout.css'

export default function Layout() {
  const [sidebarCollapsed, toggleSidebarCollapsed] = useSidebarCollapsed()

  return (
    <ToastProvider>
      <div
        className={`app-layout${sidebarCollapsed ? ' app-layout--sidebar-collapsed' : ''}`}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapsed={toggleSidebarCollapsed}
        />
        <div className="app-content">
          <AppHeader />
          <main className="app-main">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}

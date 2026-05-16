import { Outlet } from 'react-router-dom'
import { ToastProvider } from '../context/ToastContext.jsx'
import AppHeader from './AppHeader'
import Sidebar from './Sidebar'
import './Layout.css'

export default function Layout() {
  return (
    <ToastProvider>
      <div className="app-layout">
        <Sidebar />
        <div className="app-content">
          <AppHeader />
          <main className="app-main">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}

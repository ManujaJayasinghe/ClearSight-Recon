import { Outlet } from 'react-router-dom'
import { ToastProvider } from '../context/ToastContext.jsx'
import Sidebar from './Sidebar'
import './Layout.css'

export default function Layout() {
  return (
    <ToastProvider>
      <div className="app-layout">
        <Sidebar />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </ToastProvider>
  )
}

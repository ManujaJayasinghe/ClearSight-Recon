import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import WitnessFormPage from './pages/WitnessFormPage'
import ResultPage from './pages/ResultPage'
import RefinementPage from './pages/RefinementPage'
import PdfExportPage from './pages/PdfExportPage'
import ReportsPage from './pages/ReportsPage'
import ReportDetailPage from './pages/ReportDetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="form" element={<WitnessFormPage />} />
          <Route path="result" element={<ResultPage />} />
          <Route path="refine" element={<RefinementPage />} />
          <Route path="refinement" element={<Navigate to="/refine" replace />} />
          <Route path="pdf-export" element={<PdfExportPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="reports/:id" element={<ReportDetailPage />} />
          <Route path="witness-form" element={<Navigate to="/form" replace />} />
          <Route path="sketch-result" element={<Navigate to="/result" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

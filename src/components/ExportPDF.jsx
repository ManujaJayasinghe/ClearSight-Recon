import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { jsPDF } from 'jspdf'
import { SITE_NAME } from '../constants/site'
import { translateFormOption } from '../i18n/formOption'
import { saveReport } from '../services/reportStorage'

/**
 * @param {string} url
 * @returns {Promise<{ dataUrl: string, format: 'JPEG' | 'PNG' } | null>}
 */
async function loadImageAsDataUrl(url) {
  if (!url) return null

  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const blob = await response.blob()
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
    const format = blob.type.includes('png') ? 'PNG' : 'JPEG'
    return { dataUrl: String(dataUrl), format }
  } catch {
    return null
  }
}

/**
 * @param {{
 *   imageUrl: string,
 *   sideProfileImageUrl?: string | null,
 *   description: Record<string, string>,
 *   caseReference: string,
 *   generatedAt?: string | null,
 *   investigator?: string,
 *   notes?: string,
 *   onSaved?: (report: object) => void,
 *   disabled?: boolean,
 * }} props
 */
export default function ExportPDF({
  imageUrl,
  sideProfileImageUrl = null,
  description,
  caseReference,
  generatedAt,
  investigator = '',
  notes = '',
  onSaved,
  disabled = false,
}) {
  const { t } = useTranslation()
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')

  const handleExport = useCallback(async () => {
    if (!imageUrl || exporting) return

    setExporting(true)
    setError('')

    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = doc.internal.pageSize.getWidth()
      let y = 16

      doc.setFontSize(16)
      doc.setTextColor(10, 22, 40)
      doc.text(SITE_NAME, 14, y)
      y += 8

      doc.setFontSize(12)
      doc.text(t('pdf.officialReport', 'Official Composite Report'), 14, y)
      y += 10

      doc.setFontSize(10)
      doc.setTextColor(60, 70, 85)
      doc.text(`${t('pdf.caseId', 'Case ID:')} ${caseReference}`, 14, y)
      y += 6

      const reportDate = generatedAt
        ? new Date(generatedAt).toLocaleDateString()
        : new Date().toLocaleDateString()
      doc.text(`${t('pdf.date', 'Date:')} ${reportDate}`, 14, y)
      y += 6

      if (investigator.trim()) {
        doc.text(`${t('pdf.leadInvestigator', 'Lead Investigator')}: ${investigator.trim()}`, 14, y)
        y += 6
      }

      if (description?.ageRange) {
        doc.text(
          `${t('pdf.ageRange', 'Age range:')} ${translateFormOption('ageRange', description.ageRange)}`,
          14,
          y,
        )
        y += 6
      }

      const frontImage = await loadImageAsDataUrl(imageUrl)
      if (frontImage) {
        y += 4
        doc.setFontSize(9)
        doc.text(t('pdf.frontView', 'Front View'), 14, y)
        y += 4
        const imgW = 70
        const imgH = 70
        doc.addImage(frontImage.dataUrl, frontImage.format, 14, y, imgW, imgH)
        y += imgH + 8
      }

      const sideImage = await loadImageAsDataUrl(sideProfileImageUrl)
      if (sideImage) {
        doc.setFontSize(9)
        doc.text(t('pdf.sideProfile', 'Side Profile'), 14, y)
        y += 4
        const imgW = 70
        const imgH = 70
        doc.addImage(sideImage.dataUrl, sideImage.format, 14, y, imgW, imgH)
        y += imgH + 8
      }

      if (notes.trim()) {
        doc.setFontSize(9)
        const noteLines = doc.splitTextToSize(notes.trim(), pageW - 28)
        doc.text(`${t('pdf.reportNotes', 'Report Notes')}:`, 14, y)
        y += 5
        doc.text(noteLines, 14, y)
        y += noteLines.length * 5 + 4
      }

      doc.setFontSize(8)
      doc.setTextColor(120, 130, 145)
      doc.text(t('pdf.officialStamp', 'OFFICIAL USE ONLY'), 14, Math.min(y, 285))

      const fileName = `${caseReference.replace(/[^\w-]+/g, '_')}_report.pdf`
      doc.save(fileName)

      const saved = saveReport({
        caseNumber: caseReference,
        descriptors: description ?? {},
        imageUrl,
      })
      onSaved?.(saved)
    } catch (err) {
      setError(err?.message ?? t('pdf.exportFailed', 'Failed to export PDF.'))
    } finally {
      setExporting(false)
    }
  }, [
    imageUrl,
    sideProfileImageUrl,
    description,
    caseReference,
    generatedAt,
    investigator,
    notes,
    exporting,
    onSaved,
    t,
  ])

  return (
    <div className="export-pdf">
      <button
        type="button"
        className={`btn btn--primary${exporting ? ' btn--loading' : ''}`}
        onClick={handleExport}
        disabled={disabled || !imageUrl || exporting}
        aria-busy={exporting}
      >
        {exporting
          ? t('pdf.exporting', 'Exporting…')
          : t('pdf.downloadPdf', 'Download PDF Report')}
      </button>
      {error ? (
        <p className="form-submit-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

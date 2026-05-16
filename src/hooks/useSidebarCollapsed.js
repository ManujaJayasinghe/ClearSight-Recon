import { useCallback, useState } from 'react'

const STORAGE_KEY = 'clearsight-sidebar-collapsed'

function readCollapsed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function writeCollapsed(value) {
  try {
    localStorage.setItem(STORAGE_KEY, String(value))
  } catch {
    // localStorage may be unavailable
  }
}

/**
 * @returns {[boolean, () => void]}
 */
export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(readCollapsed)

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      writeCollapsed(next)
      return next
    })
  }, [])

  return [collapsed, toggleCollapsed]
}

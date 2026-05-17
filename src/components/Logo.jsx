import { SITE_NAME } from '../constants/site'
import './Logo.css'

const LOGO_SRC = '/logo.png'

/**
 * @param {{
 *   size?: number,
 *   className?: string,
 *   alt?: string,
 * }} props
 */
export default function Logo({ size = 48, className = '', alt }) {
  return (
    <img
      src={LOGO_SRC}
      alt={alt ?? `${SITE_NAME} logo`}
      className={`app-logo${className ? ` ${className}` : ''}`}
      style={{ height: size, width: 'auto' }}
      decoding="async"
    />
  )
}

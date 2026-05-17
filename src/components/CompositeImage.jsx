import { useState } from 'react'
import './CompositeImage.css'

function CompositeImageInner({ src, alt, className = '' }) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <p
        className={`composite-image composite-image--failed${className ? ` ${className}` : ''}`}
        role="img"
        aria-label={alt || 'Image failed to load'}
      >
        Image unavailable
      </p>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`composite-image${loaded ? ' composite-image--visible' : ''}${className ? ` ${className}` : ''}`}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      decoding="async"
      referrerPolicy="no-referrer"
    />
  )
}

export default function CompositeImage({ src, alt, className = '' }) {
  if (!src) return null
  return (
    <CompositeImageInner key={src} src={src} alt={alt} className={className} />
  )
}

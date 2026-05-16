import { useState } from 'react'
import './CompositeImage.css'

function CompositeImageInner({ src, alt, className = '' }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <img
      src={src}
      alt={alt}
      className={`composite-image${loaded ? ' composite-image--visible' : ''}${className ? ` ${className}` : ''}`}
      onLoad={() => setLoaded(true)}
      decoding="async"
    />
  )
}

export default function CompositeImage({ src, alt, className = '' }) {
  if (!src) return null
  return (
    <CompositeImageInner key={src} src={src} alt={alt} className={className} />
  )
}

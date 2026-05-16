import './CompositeLoading.css'

export default function CompositeLoading({ message = 'Generating composite sketch…' }) {
  return (
    <div className="composite-loading" role="status" aria-live="polite" aria-busy="true">
      <div className="composite-loading__frame">
        <span className="composite-loading__scan" aria-hidden="true" />
        <div className="composite-loading__silhouette" aria-hidden="true">
          <svg viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="60" cy="38" rx="28" ry="32" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M24 130c4-28 20-42 36-42s32 14 36 42"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span
          className="composite-loading__ring composite-loading__ring--outer"
          aria-hidden="true"
        />
        <span
          className="composite-loading__ring composite-loading__ring--inner"
          aria-hidden="true"
        />
      </div>
      <p className="composite-loading__message">{message}</p>
      <p className="composite-loading__hint">
        Building forensic composite from witness description
      </p>
    </div>
  )
}

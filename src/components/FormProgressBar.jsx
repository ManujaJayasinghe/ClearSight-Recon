export default function FormProgressBar({ completedCount, totalCount, percent }) {
  return (
    <div className="form-progress" aria-label="Form completion progress">
      <div className="form-progress__header">
        <span className="form-progress__label">Form progress</span>
        <span className="form-progress__count">
          {completedCount} of {totalCount} sections complete
        </span>
      </div>
      <div
        className="form-progress__track"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${percent} percent`}
      >
        <div
          className="form-progress__fill"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

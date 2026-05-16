import { Link } from 'react-router-dom'
import { SITE_NAME } from '../constants/site'
import ShieldIcon from '../components/ShieldIcon'
import './Page.css'

export default function HomePage() {
  return (
    <article className="page">
      <header className="page__header">
        <span className="page__eyebrow">Forensic Composite System</span>
        <h1 className="page__title">{SITE_NAME}</h1>
        <p className="page__description">
          Transform witness descriptions into accurate forensic sketches. This
          secure workflow guides investigators from initial testimony through
          refinement and official PDF export.
        </p>
      </header>

      <div className="page__card hero-card">
        <div className="hero-card__icon">
          <ShieldIcon size={64} />
        </div>
        <div>
          <h2>Begin a New Composite Session</h2>
          <p className="hero-card__text">
            Start by capturing the witness description. The system will generate
            an initial sketch, allow iterative refinement, and produce a
            court-ready PDF for case files.
          </p>
          <div className="hero-actions">
            <Link to="/form" className="btn btn--primary">
              Start Witness Form
            </Link>
          </div>
        </div>
      </div>

      <div className="feature-grid">
        <div className="feature-card">
          <h3>Witness Intake</h3>
          <p>Structured form for facial features, build, and distinguishing marks.</p>
        </div>
        <div className="feature-card">
          <h3>AI Sketch Generation</h3>
          <p>Convert descriptions into preliminary composite sketches.</p>
        </div>
        <div className="feature-card">
          <h3>Official Export</h3>
          <p>Generate stamped PDF reports for investigative records.</p>
        </div>
      </div>
    </article>
  )
}

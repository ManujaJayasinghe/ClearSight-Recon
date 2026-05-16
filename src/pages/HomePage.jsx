import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SITE_NAME } from '../constants/site'
import ShieldIcon from '../components/ShieldIcon'
import './Page.css'

export default function HomePage() {
  const { t } = useTranslation()

  return (
    <article className="page">
      <header className="page__header">
        <span className="page__eyebrow">{t('home.eyebrow')}</span>
        <h1 className="page__title">{SITE_NAME}</h1>
        <p className="page__description">{t('home.description')}</p>
      </header>

      <div className="page__card hero-card">
        <div className="hero-card__icon">
          <ShieldIcon size={64} />
        </div>
        <div>
          <h2>{t('home.heroTitle')}</h2>
          <p className="hero-card__text">{t('home.heroText')}</p>
          <div className="hero-actions">
            <Link to="/form" className="btn btn--primary">
              {t('home.startForm')}
            </Link>
          </div>
        </div>
      </div>

      <div className="feature-grid">
        <div className="feature-card">
          <h3>{t('home.featureIntakeTitle')}</h3>
          <p>{t('home.featureIntakeText')}</p>
        </div>
        <div className="feature-card">
          <h3>{t('home.featureAiTitle')}</h3>
          <p>{t('home.featureAiText')}</p>
        </div>
        <div className="feature-card">
          <h3>{t('home.featureExportTitle')}</h3>
          <p>{t('home.featureExportText')}</p>
        </div>
      </div>
    </article>
  )
}

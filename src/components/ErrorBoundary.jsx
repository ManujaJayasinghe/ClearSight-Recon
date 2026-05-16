import { Component } from 'react'
import { Link } from 'react-router-dom'
import { isSupabaseError } from '../utils/isSupabaseError'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  handleRetry = () => {
    this.setState({ error: null })
    window.location.reload()
  }

  render() {
    const { error } = this.state
    if (error) {
      const supabaseFailure = isSupabaseError(error)

      return (
        <article className="page page--wide error-boundary">
          <header className="page__header">
            <span className="page__eyebrow">Error</span>
            <h1 className="page__title">
              {supabaseFailure
                ? 'Database connection problem'
                : 'Something went wrong'}
            </h1>
            <p className="page__description">
              {supabaseFailure
                ? 'ClearSight could not reach Supabase. Your witness form and sketches on this device are not affected. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env, then retry.'
                : 'This page could not be displayed. Try refreshing, or return home.'}
            </p>
          </header>
          <p className="form-submit-error" role="alert">
            {error?.message ?? String(error)}
          </p>
          <div className="error-boundary__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={this.handleRetry}
            >
              Retry
            </button>
            <Link to="/" className="btn btn--secondary">
              Back to home
            </Link>
            {supabaseFailure ? (
              <Link to="/form" className="btn btn--secondary">
                Back to witness form
              </Link>
            ) : null}
          </div>
        </article>
      )
    }

    return this.props.children
  }
}

import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    const { error } = this.state
    if (error) {
      return (
        <article className="page page--wide">
          <header className="page__header">
            <span className="page__eyebrow">Error</span>
            <h1 className="page__title">Something went wrong</h1>
            <p className="page__description">
              This page could not be displayed. Try refreshing, or return home.
            </p>
          </header>
          <p className="form-submit-error" role="alert">
            {error?.message ?? String(error)}
          </p>
          <a href="/" className="btn btn--primary">
            Back to home
          </a>
        </article>
      )
    }

    return this.props.children
  }
}

import React from 'react'

// Top-level error boundary so a Firestore hiccup, a CDN fail, or a
// render exception shows a friendly recover screen instead of a blank
// page. Logs to console for debugging; the user can reload the app.
class ErrorBoundary extends React.Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('Uncaught error:', error, info)
  }

  handleReload = () => {
    this.setState({ error: null })
    window.location.reload()
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-green-50 via-purple-50 to-yellow-50">
        <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl text-center">
          <div className="text-5xl mb-3" aria-hidden="true">😕</div>
          <h1 className="text-xl font-black font-display mb-1 text-gray-800">Something went wrong</h1>
          <p className="text-sm text-gray-500 font-semibold mb-5">
            The app hit an unexpected error. Try reloading — your data is safe in the cloud.
          </p>
          <pre className="text-[10px] font-mono bg-gray-50 rounded-lg p-2 mb-4 text-left text-gray-500 max-h-24 overflow-auto">
            {String(this.state.error?.message || this.state.error)}
          </pre>
          <button
            type="button"
            onClick={this.handleReload}
            className="w-full py-3 rounded-xl font-extrabold text-white text-sm bg-gradient-to-r from-green-500 to-purple-500"
          >
            Reload
          </button>
        </div>
      </div>
    )
  }
}

export default ErrorBoundary

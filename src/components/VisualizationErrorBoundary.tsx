import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  onReset?: () => void
  language?: 'ro' | 'en'
}

interface State {
  hasError: boolean
}

const messages = {
  en: {
    error: 'Something went wrong displaying this model.',
    retry: 'Try again',
  },
  ro: {
    error: 'Ceva nu a functionat la afisarea acestui model.',
    retry: 'Incearca din nou',
  },
}

export class VisualizationErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('Visualization error:', error, info.componentStack)
    }
  }

  render() {
    if (this.state.hasError) {
      const t = messages[this.props.language ?? 'en']
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-3">
            <p className="text-gray-300">{t.error}</p>
            <button
              onClick={() => {
                this.setState({ hasError: false })
                this.props.onReset?.()
              }}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-500 transition-colors"
            >
              {t.retry}
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

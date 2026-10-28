import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logger } from '../utils/logger';
import { ExclamationTriangleIcon, ArrowPathIcon, HomeIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorId: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: null,
      showDetails: false,
    };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const errorId = logger.error(
      error.message || 'Unhandled React Component Error',
      'ErrorBoundary',
      error,
      { componentStack: errorInfo.componentStack }
    );
    this.setState({ errorId });
  }

  private handleReset = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
      showDetails: false,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleHome = () => {
    window.location.href = '/';
  };

  private handleClearAndLogin = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.href = '/login';
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-lg w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
              <ExclamationTriangleIcon className="w-9 h-9" />
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {this.props.fallbackTitle || 'Something went wrong'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              An unexpected issue occurred while rendering this section. Our system logged this event for review.
            </p>

            {this.state.errorId && (
              <div className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-700/60 rounded-md text-xs font-mono text-slate-600 dark:text-slate-300 mb-6">
                Ref ID: {this.state.errorId}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white font-medium text-sm hover:opacity-95 transition-all shadow-sm"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Try Again
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              >
                Reload Window
              </button>
              <button
                type="button"
                onClick={this.handleHome}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-all"
              >
                <HomeIcon className="w-4 h-4" />
                Go to Home
              </button>
              <button
                type="button"
                onClick={this.handleClearAndLogin}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                Reset Session
              </button>
            </div>

            {this.state.error && (
              <div className="text-left mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
                >
                  {this.state.showDetails ? 'Hide technical diagnostics' : 'Show technical diagnostics'}
                </button>

                {this.state.showDetails && (
                  <pre className="mt-3 p-3 bg-slate-900 text-slate-200 rounded-lg text-xs font-mono overflow-x-auto max-h-48 whitespace-pre-wrap">
                    {this.state.error.name}: {this.state.error.message}
                    {this.state.error.stack ? `\n\n${this.state.error.stack}` : ''}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

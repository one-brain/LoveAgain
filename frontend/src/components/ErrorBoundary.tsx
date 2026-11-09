import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, Card } from '@fluentui/react-components';
import {
  Warning24Regular,
  ArrowClockwise20Regular,
  Home20Regular,
  SignOut20Regular,
} from '@fluentui/react-icons';
import { logger } from '../utils/logger';

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
        <div className="min-h-[50vh] flex items-center justify-center p-6 bg-background">
          <Card className="max-w-lg w-full bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8 text-center">
            <div className="w-12 h-12 bg-destructive-light text-destructive rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border">
              <Warning24Regular />
            </div>

            <h2 className="text-title3 font-semibold text-foreground mb-2">
              {this.props.fallbackTitle || 'Something went wrong'}
            </h2>
            <p className="text-body1 text-muted-foreground mb-5">
              An unexpected issue occurred while rendering this section. Our system logged this event for review.
            </p>

            {this.state.errorId && (
              <div className="inline-block px-3 py-1 bg-muted rounded-md text-caption1 font-mono tabular text-muted-foreground mb-5 border border-border">
                Ref ID: {this.state.errorId}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <Button
                appearance="primary"
                size="large"
                icon={<ArrowClockwise20Regular />}
                onClick={this.handleReset}
                className="w-full min-h-11"
              >
                Try again
              </Button>
              <Button
                appearance="secondary"
                size="large"
                onClick={this.handleReload}
                className="w-full min-h-11"
              >
                Reload window
              </Button>
              <Button
                appearance="secondary"
                size="large"
                icon={<Home20Regular />}
                onClick={this.handleHome}
                className="w-full min-h-11"
              >
                Go to home
              </Button>
              <Button
                appearance="outline"
                size="large"
                icon={<SignOut20Regular />}
                onClick={this.handleClearAndLogin}
                className="w-full min-h-11 !text-destructive"
              >
                Reset session
              </Button>
            </div>

            {this.state.error && (
              <div className="text-left mt-4 pt-4 border-t border-border">
                <Button
                  appearance="subtle"
                  size="small"
                  onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                >
                  {this.state.showDetails ? 'Hide technical diagnostics' : 'Show technical diagnostics'}
                </Button>

                {this.state.showDetails && (
                  <pre className="mt-3 p-3 bg-muted text-foreground rounded-md text-caption1 font-mono overflow-x-auto max-h-48 whitespace-pre-wrap border border-border">
                    {this.state.error.name}: {this.state.error.message}
                    {this.state.error.stack ? `\n\n${this.state.error.stack}` : ''}
                  </pre>
                )}
              </div>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

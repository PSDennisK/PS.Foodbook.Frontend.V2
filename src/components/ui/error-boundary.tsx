'use client';

import { Component, type ReactNode } from 'react';

import { logger } from '@/lib/utils/logger';
import { Button } from './button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  componentName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to monitoring service
    logger.error('Error Boundary caught an error', 'ErrorBoundary', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="max-w-md space-y-4">
            <div className="text-6xl">⚠️</div>
            <h2 className="text-2xl font-semibold text-destructive">Er is iets misgegaan</h2>
            <p className="text-muted-foreground">
              Er is een onverwachte fout opgetreden. Probeer de pagina te verversen of neem contact
              op met ondersteuning als het probleem blijft bestaan.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm font-medium">
                  Technische details (alleen zichtbaar in development)
                </summary>
                <pre className="mt-2 overflow-auto rounded bg-muted p-4 text-xs">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <div className="flex gap-2 justify-center mt-4">
              <Button onClick={this.handleReset} variant="default">
                Opnieuw proberen
              </Button>
              <Button onClick={() => window.location.reload()} variant="outline">
                Pagina verversen
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Simplified Error Boundary for specific components
 * Shows a minimal error message without full page takeover
 */
export class ComponentErrorBoundary extends ErrorBoundary {
  render(): ReactNode {
    if (this.state.hasError) {
      const componentName = this.props.componentName || 'Component';

      return (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
          <p className="text-sm text-destructive font-medium">
            {componentName} kon niet worden geladen
          </p>
          <Button onClick={this.handleReset} variant="ghost" size="sm" className="mt-2">
            Opnieuw proberen
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

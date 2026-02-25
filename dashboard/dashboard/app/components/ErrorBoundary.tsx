"use client";

import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Suppress Web3 extension errors
    if (error.message?.includes('Cannot redefine property') ||
        error.message?.includes('StacksProvider') ||
        error.stack?.includes('chrome-extension://')) {
      console.warn('Suppressed Web3 extension error:', error.message);
      return { hasError: false, error: null };
    }

    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Suppress Web3 extension errors in console
    if (error.message?.includes('Cannot redefine property') ||
        error.message?.includes('StacksProvider') ||
        error.stack?.includes('chrome-extension://')) {
      console.warn('Suppressed Web3 extension error in componentDidCatch');
      this.setState({ hasError: false, error: null });
      return;
    }

    console.error('Error caught by boundary:', error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-red-800 rounded-lg p-6 text-center">
        <div className="text-red-400 text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-slate-400 text-sm mb-4">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

// Hook for using error boundary
export function useErrorHandler() {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    // Suppress Web3 extension errors
    if (error.message?.includes('Cannot redefine property') ||
        error.message?.includes('StacksProvider') ||
        error.stack?.includes('chrome-extension://')) {
      console.warn('Suppressed Web3 extension error in useErrorHandler');
      return;
    }

    console.error('Error handled:', error, errorInfo);
    // Could send to error reporting service here
  };
}

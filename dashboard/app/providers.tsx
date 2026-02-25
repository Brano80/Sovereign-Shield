"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5000,
            refetchInterval: 300000, // Refetch every 5 minutes (300 seconds) for updates
          },
        },
      })
  );

  // Suppress Web3 extension errors and network errors globally
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      // Suppress specific Web3 extension errors, SSE errors, and network/backend errors
      const message = args.join(' ');
      if (message.includes('Cannot redefine property: StacksProvider') ||
          message.includes('chrome-extension://') ||
          message.includes('Object.defineProperties') ||
          message.includes('Web3 extension') ||
          message.includes('SSE') ||
          message.includes('EventSource') ||
          message.includes('Network error - Backend may be unavailable') ||
          message.includes('Failed to connect to backend') ||
          message.includes('API Request Failed') && message.includes('Network error')) {
        return; // Suppress the error
      }
      originalError.apply(console, args);
    };

    // Suppress unhandled promise rejections from extensions
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.toString() || '';
      if (reason.includes('Cannot redefine property') ||
          reason.includes('StacksProvider') ||
          reason.includes('chrome-extension://')) {
        event.preventDefault(); // Prevent the error from showing
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      console.error = originalError;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}


'use client'

import React, { useCallback } from 'react'
import { ErrorBoundary } from './ErrorBoundary'

interface DashboardErrorBoundaryProps {
  children: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export const DashboardErrorBoundary: React.FC<DashboardErrorBoundaryProps> = ({ 
  children, 
  onError 
}) => {
  // Memoize the error handler to prevent infinite loops
  const handleError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    console.error('Dashboard error:', error)
    if (onError) {
      onError(error, errorInfo)
    }
  }, [onError])

  return (
    <ErrorBoundary
      level="page"
      showReload={true}
      showHome={true}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  )
}

interface DataFetchErrorBoundaryProps {
  children: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  onRetry?: () => void
}

export const DataFetchErrorBoundary: React.FC<DataFetchErrorBoundaryProps> = ({ 
  children, 
  onError,
  onRetry 
}) => {
  // Memoize the error handler to prevent infinite loops
  const handleError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    console.error('Data fetch error:', error)
    if (onError) {
      onError(error, errorInfo)
    }
  }, [onError])

  return (
    <ErrorBoundary
      level="section"
      showReload={false}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  )
}

interface FormErrorBoundaryProps {
  children: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export const FormErrorBoundary: React.FC<FormErrorBoundaryProps> = ({ 
  children, 
  onError 
}) => {
  // Memoize the error handler to prevent infinite loops
  const handleError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    console.error('Form error:', error)
    if (onError) {
      onError(error, errorInfo)
    }
  }, [onError])

  return (
    <ErrorBoundary
      level="component"
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  )
}

interface ComponentErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export const ComponentErrorBoundary: React.FC<ComponentErrorBoundaryProps> = ({ 
  children, 
  fallback,
  onError 
}) => {
  // Memoize the error handler to prevent infinite loops
  const handleError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    if (onError) {
      onError(error, errorInfo)
    }
  }, [onError])

  return (
    <ErrorBoundary
      level="component"
      fallback={fallback}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  )
}
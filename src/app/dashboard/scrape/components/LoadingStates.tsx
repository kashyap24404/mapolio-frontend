'use client'

import React from 'react'

interface LoadingStateProps {
  message?: string
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-muted rounded w-48"></div>
        <div className="h-32 bg-muted rounded w-96"></div>
        <div className="h-32 bg-muted rounded w-96"></div>
        {message && <p className="text-center text-muted-foreground">{message}</p>}
      </div>
    </div>
  )
}

export const ContentLoadingState: React.FC = () => {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-32 bg-muted rounded w-full"></div>
      <div className="h-32 bg-muted rounded w-full"></div>
    </div>
  )
}

export const ErrorState: React.FC<{ error: string; onRetry: () => void }> = ({ 
  error, 
  onRetry 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold">Error Loading Data</h1>
        <p className="text-muted-foreground">{error}</p>
        <button 
          onClick={onRetry} 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Retry
        </button>
      </div>
    </div>
  )
}
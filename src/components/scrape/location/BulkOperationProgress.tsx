import React from 'react'
import { Loader2 } from 'lucide-react'

interface BulkOperationProgressProps {
  isProcessing: boolean
  operationType: string
  progress?: number
  itemsProcessed?: number
  totalItems?: number
}

export const BulkOperationProgress: React.FC<BulkOperationProgressProps> = ({
  isProcessing,
  operationType,
  progress = 0,
  itemsProcessed = 0,
  totalItems = 0
}) => {
  if (!isProcessing) return null

  return (
    <div className="px-3 py-2 border-b border-border bg-muted/30">
      <div className="flex items-center space-x-3">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <div className="flex-1">
          <div className="text-sm font-medium text-foreground">
            {operationType}...
          </div>
          {totalItems > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              {itemsProcessed} of {totalItems.toLocaleString()} items
            </div>
          )}
        </div>
        {progress > 0 && (
          <div className="text-xs text-muted-foreground">
            {Math.round(progress)}%
          </div>
        )}
      </div>
      
      {/* Progress Bar */}
      {progress > 0 && (
        <div className="mt-2 w-full bg-muted rounded-full h-1.5">
          <div 
            className="bg-primary rounded-full h-1.5 transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}
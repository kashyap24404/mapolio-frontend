'use client'

import React, { useState, useEffect } from 'react'
import { CheckSquare, Square, Minus, ChevronDown, ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LocationNode, SelectionState } from './types'

interface LocationNodeProps {
  node: LocationNode
  isExpanded: boolean
  isLoading: boolean
  selectionState: SelectionState
  onToggleSelection: (node: LocationNode) => void
  onToggleExpansion: (nodeId: string, node: LocationNode) => void
  expandedNodes: Set<string>
  loadingNodes: Set<string>
  getSelectionState: (node: LocationNode) => SelectionState
  disabled?: boolean // Add disabled prop
}

const renderSelectionIcon = (state: SelectionState) => {
  switch (state) {
    case 'selected':
      return <CheckSquare className="h-4 w-4 text-primary" />
    case 'partial':
      return <Minus className="h-4 w-4 text-primary" />
    default:
      return <Square className="h-4 w-4 text-muted-foreground" />
  }
}

export const LocationNodeComponent: React.FC<LocationNodeProps> = ({
  node,
  isExpanded,
  isLoading,
  selectionState,
  onToggleSelection,
  onToggleExpansion,
  expandedNodes,
  loadingNodes,
  getSelectionState,
  disabled = false // Add disabled prop
}) => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Render the component content
  const renderContent = () => {
    // Don't render on server to prevent hydration mismatches
    if (!isClient) {
      return (
        <div>
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-muted rounded"></div>
              <div className="w-4 h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-24"></div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div>
        <div
          className={cn(
            "flex items-center justify-between px-3 py-2 cursor-pointer transition-colors",
            "hover:bg-muted/50",
            selectionState === 'selected' && "bg-muted/30",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          style={{ paddingLeft: `${12 + node.level * 16}px` }}
          onClick={() => !disabled && onToggleSelection(node)} // Disable click when disabled
        >
          <div className="flex items-center space-x-2">
            {node.hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  !disabled && onToggleExpansion(node.id, node) // Disable click when disabled
                }}
                className="p-0.5 hover:bg-muted-foreground/20 rounded"
                disabled={isLoading || disabled} // Disable when loading or disabled
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>
            )}
            {!node.hasChildren && <div className="w-4" />}
            
            {renderSelectionIcon(selectionState)}
            
            <span className="text-sm font-medium">{node.name}</span>
            
            {/* Show zip count for levels above zip code */}
            {node.level < 3 && (
              <span className="text-xs text-muted-foreground">
                ({node.totalZipCodes || 0} zip{(node.totalZipCodes || 0) !== 1 ? 's' : ''})
              </span>
            )}
          </div>
        </div>

        {isExpanded && node.children && (
          <div className="border-l border-muted ml-3">
            {node.children.map(childNode => {
              const childExpanded = expandedNodes.has(childNode.id)
              const childLoading = loadingNodes.has(childNode.id)
              const childSelectionState = getSelectionState(childNode)
              
              return (
                <LocationNodeComponent
                  key={childNode.id}
                  node={childNode}
                  isExpanded={childExpanded}
                  isLoading={childLoading}
                  selectionState={childSelectionState}
                  onToggleSelection={onToggleSelection}
                  onToggleExpansion={onToggleExpansion}
                  expandedNodes={expandedNodes}
                  loadingNodes={loadingNodes}
                  getSelectionState={getSelectionState}
                  disabled={disabled} // Pass disabled prop to child component
                />
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return renderContent()
}
import { useState, useMemo } from 'react'
import { LocationNode } from './types'

export const useLocationSearch = (locationTree: LocationNode[]) => {
  const [searchTerm, setSearchTerm] = useState('')

  // Filter tree based on search term
  const filteredTree = useMemo(() => {
    if (!searchTerm.trim()) return locationTree

    const filterNodes = (nodes: LocationNode[]): LocationNode[] => {
      const filtered: LocationNode[] = []

      for (const node of nodes) {
        const nameMatches = node.name.toLowerCase().includes(searchTerm.toLowerCase())
        const hasMatchingChildren = node.children && filterNodes(node.children).length > 0

        if (nameMatches || hasMatchingChildren) {
          filtered.push({
            ...node,
            children: node.children ? filterNodes(node.children) : undefined
          })
        }
      }

      return filtered
    }

    return filterNodes(locationTree)
  }, [locationTree, searchTerm])

  // Auto-expand nodes that contain search results
  const getAutoExpandedNodes = useMemo(() => {
    if (!searchTerm.trim()) return new Set<string>()

    const expandedIds = new Set<string>()

    const expandMatchingNodes = (nodes: LocationNode[]) => {
      for (const node of nodes) {
        if (node.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          // Expand parent nodes
          let currentPath = [...node.path]
          while (currentPath.length > 1) {
            currentPath.pop()
            expandedIds.add(currentPath[currentPath.length - 1])
          }
        }
        if (node.children) {
          expandMatchingNodes(node.children)
        }
      }
    }

    expandMatchingNodes(locationTree)
    return expandedIds
  }, [locationTree, searchTerm])

  return {
    searchTerm,
    setSearchTerm,
    filteredTree,
    autoExpandedNodes: getAutoExpandedNodes
  }
}
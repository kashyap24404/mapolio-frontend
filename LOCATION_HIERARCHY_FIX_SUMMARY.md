# Location Hierarchy Selection Fix

## Issue Description
When selecting a top-level location (like a city or county) in the hierarchical location selector, only the specific node was being selected, but not its child locations (zip codes). This meant that if a user selected "Los Angeles", they would only get results for the city itself, not the individual zip codes within Los Angeles.

## Root Cause
The issue was in the `toggleNodeSelection` function in `useLocationSelection.ts`. When a parent node was selected, the function was only adding that specific node to the selection without including its children.

## Solution
1. **Added `getAllChildPaths` function**: This function recursively gets all child paths for a given node (e.g., all zip codes within a city, all cities and zip codes within a county, etc.)

2. **Modified `toggleNodeSelection` function**: 
   - When selecting a parent node, it now includes all child nodes in the selection
   - When deselecting a parent node, it removes the parent and all its children from the selection
   - Properly handles deduplication to avoid adding the same paths multiple times

3. **Updated component integration**: 
   - Modified `HierarchicalLocationDropdown` to pass `locationData` to the `useLocationSelection` hook
   - This allows the hook to access the full location hierarchy data needed for child path calculation

## Files Modified
1. `src/components/scrape/location/useLocationSelection.ts` - Core logic fix
2. `src/components/scrape/location-dropdown/index.tsx` - Integration update

## How It Works
When a user selects a location node:
1. If it's a leaf node (zip code), only that node is selected
2. If it's a parent node (city, county, or state):
   - All child nodes are automatically included in the selection
   - The selection state properly reflects when all children are selected
   - Deselecting the parent removes both the parent and all children from selection

This ensures that when a user selects "Los Angeles", they get results for the entire city including all zip codes within it.
# Handling React Hydration Issues in Next.js

This document explains the hydration issues that can occur in Next.js applications and how to prevent them.

## What is Hydration?

Hydration is the process where React attaches event listeners and initializes the client-side application state to the server-rendered HTML. During hydration, React compares the server-rendered HTML with the client-side React component tree to ensure they match.

## Common Causes of Hydration Mismatches

1. **Browser Extensions**: Extensions like password managers or ad blockers can modify the DOM after server rendering but before hydration.

2. **Client-Only Code**: Using `typeof window !== 'undefined'` checks or accessing browser APIs during render.

3. **Random Values**: Using `Math.random()`, `Date.now()`, or other non-deterministic values during render.

4. **User Locale**: Formatting dates or numbers based on user's locale without providing a server-side equivalent.

5. **External Data**: Relying on external data that changes between server render and client render.

## Solutions Implemented

### 1. Client-Side Only Rendering

We've implemented a pattern where components don't render on the server until the client is ready:

```tsx
import React, { useState, useEffect } from 'react'

export default function Component() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Don't render on server to prevent hydration mismatches
  if (!isClient) {
    return (
      // Return skeleton/loading UI that matches the expected structure
      <div className="h-10 bg-muted rounded"></div>
    )
  }

  // Actual component implementation
  return (
    <div>Real component content</div>
  )
}
```

### 2. Skeleton Loading States

For components that need to render something during server-side rendering, we provide skeleton/loading states that match the structure of the final component:

```tsx
// Don't render on server to prevent hydration mismatches
if (!isClient) {
  return (
    <div className="space-y-3">
      <div className="h-6 bg-muted rounded w-1/3"></div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-1/5"></div>
        <div className="h-10 bg-muted rounded"></div>
      </div>
    </div>
  )
}
```

## Best Practices to Prevent Hydration Issues

### 1. Avoid Browser-Specific Code in Render

```tsx
// ❌ Bad - This can cause hydration issues
function Component() {
  if (typeof window !== 'undefined') {
    // Client-only code
    return <div>Client only</div>
  }
  return <div>Server only</div>
}

// ✅ Good - Use useEffect for client-only code
function Component() {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  if (!isClient) return <div>Loading...</div>
  
  return <div>Client only</div>
}
```

### 2. Avoid Non-Deterministic Values

```tsx
// ❌ Bad - This will cause hydration mismatch
function Component() {
  const id = Math.random() // Different on server and client
  return <div id={id}>Content</div>
}

// ✅ Good - Use useEffect to set non-deterministic values
function Component() {
  const [id, setId] = useState(null)
  
  useEffect(() => {
    setId(Math.random())
  }, [])
  
  return <div id={id || 'loading'}>Content</div>
}
```

### 3. Use CSS for Random-Looking Elements

```tsx
// ❌ Bad - Random values cause hydration issues
function Component() {
  const randomWidth = Math.floor(Math.random() * 100) + 50
  return <div style={{ width: `${randomWidth}px` }}>Content</div>
}

// ✅ Good - Use CSS animations or fixed values
function Component() {
  return <div className="animated-width">Content</div>
}
```

### 4. Handle External Data Properly

```tsx
// ❌ Bad - External data might change
function Component() {
  const [data, setData] = useState(null)
  
  // This runs on both server and client, but might return different data
  useEffect(() => {
    fetch('/api/data').then(res => res.json()).then(setData)
  }, [])
  
  return <div>{data?.content || 'Loading...'}</div>
}

// ✅ Good - Fetch data on server and pass as props, or use loading states
function Component({ initialData }) {
  const [data, setData] = useState(initialData)
  
  useEffect(() => {
    if (!initialData) {
      fetch('/api/data').then(res => res.json()).then(setData)
    }
  }, [initialData])
  
  return <div>{data?.content || 'Loading...'}</div>
}
```

## Browser Extension Issues

Some browser extensions (like 1Password, LastPass, Google Translate, etc.) can modify the DOM after server rendering but before hydration. This causes React to detect a mismatch between the server-rendered HTML and the client-side component tree.

### Solution

The client-side only rendering pattern we've implemented prevents this issue by ensuring that the component structure is only created on the client side, after any browser extensions have finished modifying the DOM.

## Testing for Hydration Issues

1. **Check the Console**: Look for hydration mismatch warnings in the browser console.

2. **Disable JavaScript**: Temporarily disable JavaScript in your browser to see if the server-rendered HTML looks correct.

3. **Test with Extensions**: Test your application with common browser extensions enabled.

4. **Use React DevTools**: The React DevTools can help identify components that are causing hydration issues.

## References

- [React Hydration Documentation](https://react.dev/reference/react-dom/client/hydrateRoot)
- [Next.js Hydration Documentation](https://nextjs.org/docs/pages/building-your-application/rendering/client-side-rendering)
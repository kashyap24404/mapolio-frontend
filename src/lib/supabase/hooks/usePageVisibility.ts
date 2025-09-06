"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook to track page visibility and provide utilities for handling visibility changes
 * Helps prevent unnecessary data fetching and operations when the page is not visible
 */
export const usePageVisibility = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFirstVisible, setIsFirstVisible] = useState(true);
  const lastVisibilityChange = useRef<number>(Date.now());
  const visibilityChangeTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Debounce visibility changes to prevent rapid toggling
  const VISIBILITY_DEBOUNCE_MS = 1000; // 1 second debounce
  
  const handleVisibilityChange = useCallback(() => {
    const now = Date.now();
    const currentlyVisible = document.visibilityState === 'visible';
    
    // Clear any existing timer
    if (visibilityChangeTimer.current) {
      clearTimeout(visibilityChangeTimer.current);
    }
    
    // Debounce the visibility change
    visibilityChangeTimer.current = setTimeout(() => {
      setIsVisible(currentlyVisible);
      lastVisibilityChange.current = now;
      
      // Track if this is the first time becoming visible
      if (currentlyVisible && !isFirstVisible) {
        setIsFirstVisible(false);
      } else if (currentlyVisible && isFirstVisible) {
        setIsFirstVisible(false);
      }
    }, VISIBILITY_DEBOUNCE_MS);
  }, [isFirstVisible]);
  
  useEffect(() => {
    // Set initial visibility state
    setIsVisible(document.visibilityState === 'visible');
    
    // Add event listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (visibilityChangeTimer.current) {
        clearTimeout(visibilityChangeTimer.current);
      }
    };
  }, [handleVisibilityChange]);
  
  /**
   * Check if enough time has passed since the last visibility change
   * Useful for preventing rapid API calls
   */
  const hasBeenHiddenLongEnough = useCallback((minHiddenTime: number = 5000) => {
    if (isVisible) return false;
    return Date.now() - lastVisibilityChange.current >= minHiddenTime;
  }, [isVisible]);
  
  /**
   * Check if the page just became visible (useful for triggering refreshes)
   */
  const justBecameVisible = useCallback((timeWindow: number = 2000) => {
    if (!isVisible) return false;
    return Date.now() - lastVisibilityChange.current <= timeWindow;
  }, [isVisible]);
  
  return {
    isVisible,
    isFirstVisible,
    hasBeenHiddenLongEnough,
    justBecameVisible,
    lastVisibilityChange: lastVisibilityChange.current
  };
};

/**
 * Hook for components that should pause operations when not visible
 * Returns whether the component should be actively fetching data or running operations
 */
export const useActiveOnVisible = (options: {
  pauseWhenHidden?: boolean;
  resumeDelay?: number;
} = {}) => {
  const { pauseWhenHidden = true, resumeDelay = 1000 } = options;
  const { isVisible, justBecameVisible } = usePageVisibility();
  const [isActive, setIsActive] = useState(isVisible);
  const resumeTimer = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (!pauseWhenHidden) {
      setIsActive(true);
      return;
    }
    
    if (isVisible) {
      // Clear any existing resume timer
      if (resumeTimer.current) {
        clearTimeout(resumeTimer.current);
      }
      
      // Resume after a short delay to prevent rapid toggling
      resumeTimer.current = setTimeout(() => {
        setIsActive(true);
      }, resumeDelay);
    } else {
      // Immediately pause when hidden
      setIsActive(false);
      if (resumeTimer.current) {
        clearTimeout(resumeTimer.current);
      }
    }
    
    return () => {
      if (resumeTimer.current) {
        clearTimeout(resumeTimer.current);
      }
    };
  }, [isVisible, pauseWhenHidden, resumeDelay]);
  
  return {
    isActive,
    isVisible,
    justBecameVisible: justBecameVisible()
  };
};
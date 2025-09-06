"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useSupabase } from '@/lib/supabase/hooks';
import { useActiveOnVisible } from '@/lib/supabase/hooks/usePageVisibility';
import { ScrapingService } from '@/components/scrape/services/scrapingService';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Define the Task interface
export interface Task {
  id: string;
  status: 'running' | 'completed' | 'failed';
  progress?: number;
  message?: string;
  created_at: string;
  completed_at?: string;
  search_query?: string;
  location?: string;
  total_results?: number;
  credits_used?: number;
  error_message?: string;
  config?: any;
  result_json_url?: string;
  result_csv_url?: string;
}

interface TasksDataContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  refreshTasks: () => Promise<void>;
  getTaskById: (taskId: string) => Task | undefined;
  subscriptionStatus: string;
}

// Create the context with default values
const TasksDataContext = createContext<TasksDataContextType | undefined>(undefined);

// Provider component
export const TasksDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useSupabase();
  const { isActive, isVisible, justBecameVisible } = useActiveOnVisible({ pauseWhenHidden: true, resumeDelay: 3000 });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('initializing');
  const [dataFetched, setDataFetched] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  
  // Use useRef to store the channel instance for Singleton pattern
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isMountedRef = useRef(true);
  const userIdRef = useRef<string | null>(null); // Track user ID changes
  const FETCH_DEBOUNCE_MS = 10000; // 10 seconds minimum between fetches

  // Function to load tasks with debouncing
  const loadTasks = async (force = false) => {
    console.log('TasksDataContext: loadTasks called', { force, user: !!user, isMounted: isMountedRef.current })
    
    if (!user) {
      setLoading(false)
      return
    }
    
    if (!isMountedRef.current) {
      console.log('TasksDataContext: Component unmounted, skipping fetch')
      return
    }
    
    const now = Date.now()
    
    // Don't fetch if page is not active and not forced
    if (!force && !isActive) {
      console.log('TasksDataContext: Skipping fetch - page not active')
      return
    }
    
    // Prevent too frequent fetches unless forced
    if (!force && now - lastFetchTime < FETCH_DEBOUNCE_MS) {
      console.log('TasksDataContext: Skipping fetch - too recent')
      // But ensure we have data if we don't have any
      if (tasks.length === 0) {
        console.log('TasksDataContext: No tasks, forcing fetch despite debounce')
      } else {
        return
      }
    }
    
    try {
      console.log('TasksDataContext: Loading tasks for user:', user.id)
      setLastFetchTime(now)
      
      // Use the enhanced scraping service with proper timeout handling
      const { success, tasks: fetchedTasks, error: fetchError } = await ScrapingService.getRecentTasks(user.id, 50)
      
      if (!isMountedRef.current) {
        console.log('TasksDataContext: Component unmounted during fetch, skipping state update')
        return
      }
      
      if (success && fetchedTasks) {
        console.log('TasksDataContext: Successfully loaded', fetchedTasks.length, 'tasks')
        setTasks(fetchedTasks)
        setError(null)
        setDataFetched(true)
      } else {
        console.error('TasksDataContext: Failed to load tasks:', fetchError)
        setError(fetchError || 'Failed to load tasks')
        setTasks([]) // Ensure tasks is always set to empty array on error
      }
    } catch (err) {
      if (!isMountedRef.current) {
        console.log('TasksDataContext: Component unmounted during error handling')
        return
      }
      console.error('TasksDataContext: Error loading tasks:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setTasks([]) // Ensure tasks is always set to empty array on error
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
        console.log('TasksDataContext: Loading completed, setLoading(false)')
      }
    }
  };

  // Function to get a specific task by ID
  const getTaskById = (taskId: string): Task | undefined => {
    return tasks.find(task => task.id === taskId);
  };

  // Setup real-time subscription
  const setupRealTimeSubscription = () => {
    if (!user) return;
    
    console.log('TasksDataContext: Setting up real-time subscription for user tasks');
    setSubscriptionStatus('initializing');
    
    // --- The Singleton Guard ---
    // If the channelRef already has a channel, it means the subscription is already active
    // or is in the process of being set up. Do not create a new one.
    if (channelRef.current) {
      console.log('TasksDataContext: Subscription already active');
      return;
    }
    
    try {
      // --- Channel Creation ---
      // Create the channel and store it in the ref immediately.
      const channelName = `tasks-changes-${user.id}`;
      channelRef.current = supabase.channel(channelName);
      
      // --- Subscription Logic ---
      // Set up all the event listeners on the channel stored in the ref.
      channelRef.current
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'scraper_task',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('TasksDataContext: New task inserted:', payload);
            
            // Create a new task from the payload
            const newTask: Task = {
              id: payload.new.id,
              status: payload.new.status,
              created_at: payload.new.created_at,
              progress: payload.new.progress,
              total_results: payload.new.total_results,
              credits_used: payload.new.credits_used,
              error_message: payload.new.error_message,
              config: payload.new.config,
              result_json_url: payload.new.result_json_url,
              result_csv_url: payload.new.result_csv_url,
              message: payload.new.status === 'running' ? `Processing... ${payload.new.progress || 0}%` :
                      payload.new.status === 'completed' ? `Found ${payload.new.total_results || 0} results` :
                      payload.new.status === 'failed' ? (payload.new.error_message || 'Task failed') : 'Unknown status'
            };
            
            // Add the new task to the tasks array
            setTasks(prevTasks => [newTask, ...prevTasks]);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'scraper_task',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('TasksDataContext: Task updated:', payload)
            console.log('TasksDataContext: URL fields:', {
              result_json_url: payload.new.result_json_url,
              result_csv_url: payload.new.result_csv_url
            });
            
            // Update the specific task in our list
            setTasks(prevTasks => 
              prevTasks.map(task => 
                task.id === payload.new.id 
                  ? { 
                      ...task,
                      status: payload.new.status,
                      progress: payload.new.progress,
                      total_results: payload.new.total_results,
                      credits_used: payload.new.credits_used,
                      error_message: payload.new.error_message,
                      result_json_url: payload.new.result_json_url,
                      result_csv_url: payload.new.result_csv_url,
                      message: payload.new.status === 'running' ? `Processing... ${payload.new.progress || 0}%` :
                              payload.new.status === 'completed' ? `Found ${payload.new.total_results || 0} results` :
                              payload.new.status === 'failed' ? (payload.new.error_message || 'Task failed') : 'Unknown status'
                    }
                  : task
              )
            );
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'scraper_task',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('TasksDataContext: Task deleted:', payload);
            
            // Remove the deleted task from our list
            setTasks(prevTasks => prevTasks.filter(task => task.id !== payload.old.id));
          }
        )
        .subscribe((status: any, error?: Error) => {
          console.log('TasksDataContext: Subscription status:', status);
          setSubscriptionStatus(status);
          
          if (error) {
            console.error('TasksDataContext: Subscription error:', error);
            // If there's an error with the subscription, reload tasks only if we haven't fetched recently and page is active
            if (Date.now() - lastFetchTime > FETCH_DEBOUNCE_MS && isActive) {
              loadTasks(true);
            }
          }
        });
      
    } catch (error) {
      console.error('TasksDataContext: Error setting up real-time subscription:', error);
      // If we can't set up real-time, at least load the tasks once if we haven't recently and page is active
      if (Date.now() - lastFetchTime > FETCH_DEBOUNCE_MS && isActive) {
        loadTasks(true);
      }
    }
  };

  // Load tasks and setup subscription when user is available
  useEffect(() => {
    // Check if user has actually changed to prevent unnecessary re-initialization
    if (!user) {
      setTasks([]);
      setLoading(false);
      setDataFetched(false);
      userIdRef.current = null;
      return;
    }
    
    // If user ID hasn't changed and we already have data, don't re-initialize
    if (userIdRef.current === user.id && dataFetched && channelRef.current) {
      console.log('TasksDataContext: User unchanged and data already loaded, skipping initialization')
      // But still fetch tasks if we don't have any
      if (tasks.length === 0) {
        loadTasks(true) // Force fetch if no tasks
      }
      return
    }
    
    // Update user ID reference
    userIdRef.current = user.id
    
    // Clean up existing subscription before creating new one
    if (channelRef.current) {
      console.log('TasksDataContext: Cleaning up existing subscription')
      try {
        supabase.removeChannel(channelRef.current)
      } catch (error) {
        console.error('TasksDataContext: Error removing channel:', error)
      }
      channelRef.current = null
    }
    
    // Only load tasks if we haven't fetched them yet or if user changes
    loadTasks(true) // Force initial fetch
    setupRealTimeSubscription()
    
    // Cleanup function
    return () => {
      // Clean up subscription properly using the ref
      if (channelRef.current) {
        console.log('TasksDataContext: Cleaning up subscription')
        try {
          supabase.removeChannel(channelRef.current)
        } catch (error) {
          console.error('TasksDataContext: Error removing channel:', error)
        }
        channelRef.current = null
      }
    }
  }, [user?.id]) // Remove tasks.length from dependencies to prevent infinite loops
  
  // Handle page visibility changes for refresh when returning to tab
  useEffect(() => {
    // If the page just became visible and we have a user, refresh the tasks
    if (justBecameVisible && user && isActive && dataFetched) {
      console.log('TasksDataContext: Page became visible, refreshing tasks')
      loadTasks(true) // Force refresh when page becomes visible
    }
  }, [justBecameVisible, user?.id, isActive, dataFetched])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Public method to refresh tasks
  const refreshTasks = async () => {
    setLoading(true);
    await loadTasks(true); // Force refresh
  };

  return (
    <TasksDataContext.Provider
      value={{
        tasks,
        loading,
        error,
        refreshTasks,
        getTaskById,
        subscriptionStatus
      }}
    >
      {children}
    </TasksDataContext.Provider>
  );
};

// Custom hook to use the context
export const useTasksData = () => {
  const context = useContext(TasksDataContext);
  if (context === undefined) {
    throw new Error('useTasksData must be used within a TasksDataProvider');
  }
  return context;
};
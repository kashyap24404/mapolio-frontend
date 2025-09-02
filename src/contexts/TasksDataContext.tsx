"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useSupabase } from '@/lib/supabase-provider';
import { ScrapingService } from '@/components/scrape/scrapingService';
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('initializing');
  const [dataFetched, setDataFetched] = useState(false);
  
  // Use useRef to store the channel instance for Singleton pattern
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Function to load tasks
  const loadTasks = async () => {
    if (!user) return;
    
    try {
      console.log('TasksDataContext: Loading tasks for user:', user.id);
      
      const { success, tasks: fetchedTasks, error: fetchError } = await ScrapingService.getRecentTasks(user.id, 50);
      
      if (success && fetchedTasks) {
        setTasks(fetchedTasks);
        setError(null);
        setDataFetched(true);
      } else {
        setError(fetchError || 'Failed to load tasks');
      }
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
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
            // If there's an error with the subscription, reload tasks to ensure data is fresh
            loadTasks();
          }
        });
      
    } catch (error) {
      console.error('TasksDataContext: Error setting up real-time subscription:', error);
      // If we can't set up real-time, at least load the tasks once
      loadTasks();
    }
  };

  // Load tasks and setup subscription when user is available
  useEffect(() => {
    // Only load tasks if we haven't fetched them yet or if user changes
    if (user && !dataFetched) {
      loadTasks();
      setupRealTimeSubscription();
    }
    
    // Cleanup function
    return () => {
      // Clean up subscription properly using the ref
      if (channelRef.current) {
        console.log('TasksDataContext: Cleaning up subscription');
        try {
          supabase.removeChannel(channelRef.current);
        } catch (error) {
          console.error('TasksDataContext: Error removing channel:', error);
        }
        channelRef.current = null;
      }
    };
  }, [user, dataFetched]);

  // Public method to refresh tasks
  const refreshTasks = async () => {
    setLoading(true);
    await loadTasks();
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
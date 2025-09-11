import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Database task structure
export interface ScrapingTaskDB {
  id: string;
  user_id: string;
  category: string;
  country: string;
  data_type: string;
  rating: string;
  config?: {
    search_query?: string;
    location_rules?: string[];
    data_fields?: string[];
    rating_filter?: string;
    advanced_options?: {
      extract_single_image?: boolean;
      max_reviews?: number;
    };
    [key: string]: string | string[] | boolean | number | undefined | object;
  };
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  total_results: number;
  credits_used: number;
  created_at: string;
  updated_at: string;
  error_message?: string;
  result_json_url?: string;
  result_csv_url?: string;
}

// Frontend-compatible task structure
export interface ScrapingTask {
  id: string;
  user_id: string;
  category: string;
  country: string;
  data_type: string;
  rating: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  total_records: number;
  processed_records: number;
  created_at: string;
  updated_at: string;
  error_message?: string;
  results_url?: string;
  
  // Include original database fields for reference
  config?: ScrapingTaskDB['config'];
  total_results?: number;
  credits_used?: number;
  result_json_url?: string;
  result_csv_url?: string;
}

interface TasksState {
  // Data
  tasks: ScrapingTask[];
  recentTasks: ScrapingTask[];
  
  // Loading states
  isLoadingTasks: boolean;
  isLoadingRecentTasks: boolean;
  
  // Error states
  tasksError: string | null;
  recentTasksError: string | null;
  
  // Real-time subscription
  subscription: RealtimeChannel | null;
  isSubscribed: boolean;
}

interface TasksActions {
  // Actions
  setTasks: (tasks: ScrapingTask[]) => void;
  setRecentTasks: (tasks: ScrapingTask[]) => void;
  addTask: (task: ScrapingTask) => void;
  updateTask: (taskId: string, updates: Partial<ScrapingTask>) => void;
  removeTask: (taskId: string) => void;
  
  setLoading: (key: keyof Pick<TasksState, 'isLoadingTasks' | 'isLoadingRecentTasks'>, loading: boolean) => void;
  setError: (key: keyof Pick<TasksState, 'tasksError' | 'recentTasksError'>, error: string | null) => void;
  
  setSubscription: (subscription: RealtimeChannel | null) => void;
  setIsSubscribed: (subscribed: boolean) => void;
  
  clearAllErrors: () => void;
  reset: () => void;
}

type TasksStoreState = TasksState & TasksActions;

const initialState: TasksState = {
  tasks: [],
  recentTasks: [],
  
  isLoadingTasks: false,
  isLoadingRecentTasks: false,
  
  tasksError: null,
  recentTasksError: null,
  
  subscription: null,
  isSubscribed: false,
};

export const useTasksStore = create<TasksStoreState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setTasks: (tasks) => set({ tasks }, false, 'tasks/setTasks'),
      setRecentTasks: (tasks) => set({ recentTasks: tasks }, false, 'tasks/setRecentTasks'),
      
      addTask: (task) => set((state) => ({
        tasks: [task, ...state.tasks],
        recentTasks: [task, ...state.recentTasks.slice(0, 4)],
      }), false, 'tasks/addTask'),
      
      updateTask: (taskId, updates) => set((state) => ({
        tasks: state.tasks.map(task => 
          task.id === taskId ? { ...task, ...updates } : task
        ),
        recentTasks: state.recentTasks.map(task => 
          task.id === taskId ? { ...task, ...updates } : task
        ),
      }), false, 'tasks/updateTask'),
      
      removeTask: (taskId) => set((state) => ({
        tasks: state.tasks.filter(task => task.id !== taskId),
        recentTasks: state.recentTasks.filter(task => task.id !== taskId),
      }), false, 'tasks/removeTask'),

      setLoading: (key, loading) => set({ [key]: loading }, false, `tasks/setLoading/${key}`),
      setError: (key, error) => set({ [key]: error }, false, `tasks/setError/${key}`),

      setSubscription: (subscription) => set({ subscription }, false, 'tasks/setSubscription'),
      setIsSubscribed: (subscribed) => set({ isSubscribed: subscribed }, false, 'tasks/setIsSubscribed'),

      clearAllErrors: () => set({
        tasksError: null,
        recentTasksError: null,
      }, false, 'tasks/clearAllErrors'),

      reset: () => set(initialState, false, 'tasks/reset'),
    }),
    {
      name: 'tasks-store',
    }
  )
);
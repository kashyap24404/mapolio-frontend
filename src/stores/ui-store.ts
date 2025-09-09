import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UIState {
  isSidebarOpen: boolean;
  isLoading: boolean;
  error: string | null;
  activeTab: string;
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setActiveTab: (tab: string) => void;
  clearError: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      isSidebarOpen: false,
      isLoading: false,
      error: null,
      activeTab: 'overview',

      setSidebarOpen: (open) => set({ isSidebarOpen: open }, false, 'ui/setSidebarOpen'),
      setLoading: (loading) => set({ isLoading: loading }, false, 'ui/setLoading'),
      setError: (error) => set({ error }, false, 'ui/setError'),
      setActiveTab: (tab) => set({ activeTab: tab }, false, 'ui/setActiveTab'),
      clearError: () => set({ error: null }, false, 'ui/clearError'),
    }),
    {
      name: 'ui-store',
    }
  )
);
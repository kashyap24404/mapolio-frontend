import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UIState {
  isSidebarOpen: boolean;
  isLoading: boolean;
  error: string | null;
  activeTab: string;
}

interface UIActions {
  // Actions
  setSidebarOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setActiveTab: (tab: string) => void;
  clearError: () => void;
}

type UIStoreState = UIState & UIActions;

const initialState: UIState = {
  isSidebarOpen: false,
  isLoading: false,
  error: null,
  activeTab: 'overview',
};

export const useUIStore = create<UIStoreState>()(
  devtools(
    (set) => ({
      ...initialState,

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
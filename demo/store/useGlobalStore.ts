/**
 * 全局 Store（优化版）
 * 添加持久化支持
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  description?: string;
  duration?: number;
}

interface GlobalState {
  // 当前模块
  currentModule: string;
  // 通知列表（不持久化）
  notifications: Notification[];
  // 加载状态（不持久化）
  loading: boolean;
  // 全局错误（不持久化）
  error: Error | null;
  // 用户偏好设置（持久化）
  preferences: {
    theme: 'light' | 'dark';
    language: 'zh-CN' | 'en-US';
    autoSave: boolean;
  };
  
  // Actions
  setCurrentModule: (module: string) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setPreferences: (preferences: Partial<GlobalState['preferences']>) => void;
}

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => ({
      currentModule: 'dashboard',
      notifications: [],
      loading: false,
      error: null,
      preferences: {
        theme: 'light',
        language: 'zh-CN',
        autoSave: true
      },
      
      setCurrentModule: (module) => set({ currentModule: module }),
      
      addNotification: (notification) => set((state) => ({
        notifications: [
          ...state.notifications,
          { ...notification, id: `notif-${Date.now()}-${Math.random()}` }
        ]
      })),
      
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      
      setPreferences: (preferences) => set((state) => ({
        preferences: { ...state.preferences, ...preferences }
      })),
    }),
    {
      name: 'global-storage',
      // 只持久化部分状态
      partialize: (state) => ({
        currentModule: state.currentModule,
        preferences: state.preferences
      })
    }
  )
);

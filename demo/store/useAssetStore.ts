/**
 * 资产 Store（优化版）
 * 移除冗余数据，只保留筛选和搜索状态
 * 实际数据从useOntologyStore获取
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AssetState {
  // 筛选条件
  filters: {
    zone?: string;
    deviceCategory?: string;
    criticalityLevel?: string;
    status?: string;
  };
  // 搜索关键词
  searchKeyword: string;
  // 排序方式
  sortBy: 'name' | 'zone' | 'criticalityLevel' | 'lastModified';
  sortOrder: 'asc' | 'desc';
  
  // Actions
  setFilters: (filters: AssetState['filters']) => void;
  setSearchKeyword: (keyword: string) => void;
  setSorting: (sortBy: AssetState['sortBy'], sortOrder: AssetState['sortOrder']) => void;
  clearFilters: () => void;
}

export const useAssetStore = create<AssetState>()(
  persist(
    (set) => ({
      filters: {},
      searchKeyword: '',
      sortBy: 'name',
      sortOrder: 'asc',
      
      setFilters: (filters) => set({ filters }),
      setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
      setSorting: (sortBy, sortOrder) => set({ sortBy, sortOrder }),
      clearFilters: () => set({ filters: {}, searchKeyword: '' }),
    }),
    {
      name: 'asset-storage',
      // 持久化筛选和排序状态
      partialize: (state) => ({
        filters: state.filters,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder
      })
    }
  )
);

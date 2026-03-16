/**
 * 驾驶舱 Store（优化版）
 * 添加持久化支持
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type LayerType = 'business' | 'network' | 'attack_defense';

interface CockpitState {
  // 当前图层
  currentLayer: LayerType;
  // 图层可见性
  layerVisibility: Record<LayerType, boolean>;
  // 缩放级别（不持久化）
  zoomLevel: number;
  // 是否显示标签
  showLabels: boolean;
  // 是否显示区域
  showZones: boolean;
  
  // Actions
  setCurrentLayer: (layer: LayerType) => void;
  toggleLayerVisibility: (layer: LayerType) => void;
  setZoomLevel: (level: number) => void;
  toggleLabels: () => void;
  toggleZones: () => void;
  reset: () => void;
}

const initialState = {
  currentLayer: 'network' as LayerType,
  layerVisibility: {
    business: true,
    network: true,
    attack_defense: true,
  },
  zoomLevel: 1,
  showLabels: true,
  showZones: true,
};

export const useCockpitStore = create<CockpitState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setCurrentLayer: (layer) => set({ currentLayer: layer }),
      
      toggleLayerVisibility: (layer) => set((state) => ({
        layerVisibility: {
          ...state.layerVisibility,
          [layer]: !state.layerVisibility[layer]
        }
      })),
      
      setZoomLevel: (level) => set({ zoomLevel: level }),
      toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),
      toggleZones: () => set((state) => ({ showZones: !state.showZones })),
      
      reset: () => set(initialState),
    }),
    {
      name: 'cockpit-storage',
      // 持久化视图设置，不持久化缩放级别
      partialize: (state) => ({
        currentLayer: state.currentLayer,
        layerVisibility: state.layerVisibility,
        showLabels: state.showLabels,
        showZones: state.showZones
      })
    }
  )
);

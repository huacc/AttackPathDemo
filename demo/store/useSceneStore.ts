/**
 * 场景管理 Store（优化版）
 * 添加持久化支持
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Scene, NetworkNode, NetworkConnection } from '../types';

interface SceneState {
  // 当前场景
  currentScene: Scene | null;
  // 场景列表
  scenes: Scene[];
  // 选中的节点（不持久化）
  selectedNodeIds: string[];
  // 选中的连接（不持久化）
  selectedConnectionIds: string[];
  
  // Actions
  setCurrentScene: (scene: Scene | null) => void;
  setScenes: (scenes: Scene[]) => void;
  selectNodes: (nodeIds: string[]) => void;
  selectConnections: (connectionIds: string[]) => void;
  clearSelection: () => void;
  addNode: (node: NetworkNode) => void;
  updateNode: (nodeId: string, updates: Partial<NetworkNode>) => void;
  removeNode: (nodeId: string) => void;
  addConnection: (connection: NetworkConnection) => void;
  removeConnection: (connectionId: string) => void;
}

export const useSceneStore = create<SceneState>()(
  persist(
    (set) => ({
      currentScene: null,
      scenes: [],
      selectedNodeIds: [],
      selectedConnectionIds: [],
      
      setCurrentScene: (scene) => set({ currentScene: scene }),
      setScenes: (scenes) => set({ scenes }),
      selectNodes: (nodeIds) => set({ selectedNodeIds: nodeIds }),
      selectConnections: (connectionIds) => set({ selectedConnectionIds: connectionIds }),
      clearSelection: () => set({ selectedNodeIds: [], selectedConnectionIds: [] }),
      
      addNode: (node) => set((state) => {
        if (!state.currentScene) return state;
        return {
          currentScene: {
            ...state.currentScene,
            nodes: [...state.currentScene.nodes, node]
          }
        };
      }),
      
      updateNode: (nodeId, updates) => set((state) => {
        if (!state.currentScene) return state;
        return {
          currentScene: {
            ...state.currentScene,
            nodes: state.currentScene.nodes.map(node =>
              node.nodeId === nodeId ? { ...node, ...updates } : node
            )
          }
        };
      }),
      
      removeNode: (nodeId) => set((state) => {
        if (!state.currentScene) return state;
        return {
          currentScene: {
            ...state.currentScene,
            nodes: state.currentScene.nodes.filter(node => node.nodeId !== nodeId)
          }
        };
      }),
      
      addConnection: (connection) => set((state) => {
        if (!state.currentScene) return state;
        return {
          currentScene: {
            ...state.currentScene,
            connections: [...state.currentScene.connections, connection]
          }
        };
      }),
      
      removeConnection: (connectionId) => set((state) => {
        if (!state.currentScene) return state;
        return {
          currentScene: {
            ...state.currentScene,
            connections: state.currentScene.connections.filter(conn => conn.connectionId !== connectionId)
          }
        };
      }),
    }),
    {
      name: 'scene-storage',
      // 只持久化场景数据，不持久化选中状态
      partialize: (state) => ({
        currentScene: state.currentScene,
        scenes: state.scenes
      })
    }
  )
);

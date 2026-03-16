/**
 * 知识图谱 Store
 */
import { create } from 'zustand';
import { ATTACKMatrix, D3FENDMatrix, AttackDefenseMapping } from '../types';

interface KnowledgeGraphNode {
  id: string;
  type: string;
  label: string;
  data: any;
}

interface KnowledgeGraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  data: any;
}

interface KnowledgeState {
  // ATT&CK 数据
  attackMatrix: ATTACKMatrix | null;
  // D3FEND 数据
  defenseMatrix: D3FENDMatrix | null;
  // 攻防映射
  mappings: AttackDefenseMapping[];
  // 图谱节点和边
  graphNodes: KnowledgeGraphNode[];
  graphEdges: KnowledgeGraphEdge[];
  
  // Actions
  setAttackMatrix: (matrix: ATTACKMatrix) => void;
  setDefenseMatrix: (matrix: D3FENDMatrix) => void;
  setMappings: (mappings: AttackDefenseMapping[]) => void;
  setGraphData: (nodes: KnowledgeGraphNode[], edges: KnowledgeGraphEdge[]) => void;
}

export const useKnowledgeStore = create<KnowledgeState>((set) => ({
  attackMatrix: null,
  defenseMatrix: null,
  mappings: [],
  graphNodes: [],
  graphEdges: [],
  
  setAttackMatrix: (matrix) => set({ attackMatrix: matrix }),
  setDefenseMatrix: (matrix) => set({ defenseMatrix: matrix }),
  setMappings: (mappings) => set({ mappings }),
  setGraphData: (nodes, edges) => set({ graphNodes: nodes, graphEdges: edges }),
}));

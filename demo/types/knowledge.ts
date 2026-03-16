/**
 * 知识图谱相关类型定义
 */

// 知识实例类型
export type KnowledgeInstanceType = 'Observable' | 'InternalState' | 'Inference' | 'Entity' | 'Concept';

// 知识关系类型
export type KnowledgeRelationType = 'supports' | 'infers' | 'manifests_as' | 'strengthens' | 'associated_with';

// 知识图谱节点
export interface KnowledgeGraphNode {
  id: string;
  label: string;
  type: KnowledgeInstanceType;
  size?: number;
  style?: {
    fill?: string;
    stroke?: string;
    lineWidth?: number;
  };
}

// 知识图谱边
export interface KnowledgeGraphEdge {
  source: string;
  target: string;
  label?: string;
  type: KnowledgeRelationType;
  style?: {
    stroke?: string;
    lineWidth?: number;
  };
}

// 知识图谱
export interface KnowledgeGraph {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
}

// 知识图谱统计
export interface KnowledgeGraphStatistics {
  totalNodes: number;
  totalEdges: number;
  nodesByType: Record<KnowledgeInstanceType, number>;
  edgesByType: Record<KnowledgeRelationType, number>;
}

// 节点颜色映射
export const KNOWLEDGE_NODE_COLORS: Record<KnowledgeInstanceType, string> = {
  Observable: '#5B8FF9',
  InternalState: '#5AD8A6',
  Inference: '#F6BD16',
  Entity: '#E86452',
  Concept: '#6DC8EC'
};

// 边颜色映射
export const KNOWLEDGE_EDGE_COLORS: Record<KnowledgeRelationType, string> = {
  supports: '#5B8FF9',
  infers: '#5AD8A6',
  manifests_as: '#F6BD16',
  strengthens: '#E86452',
  associated_with: '#6DC8EC'
};

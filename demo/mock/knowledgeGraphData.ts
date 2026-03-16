/**
 * 知识图谱 Mock 数据（v2.0 - 完全重构版）
 *
 * 重构原则：
 * 1. 所有节点基于知识实例生成，确保无孤立节点
 * 2. 所有边的source和target都是有效节点ID
 * 3. 构建完整的推理链：Observable → Inference → InternalState
 * 4. 清晰的关系语义（supports, infers, manifests_as, strengthens, associated_with）
 *
 * 知识图谱结构：
 * - Chain 1: OBS_001 + OBS_002 + OBS_003 → INF_001 → STATE_001 (欺骗检测链)
 * - Chain 2: OBS_003 + OBS_004 + OBS_005 → INF_002 → STATE_002 (压力反应链)
 * - Chain 3: OBS_001 + OBS_006 → INF_003 → STATE_003 (记忆扭曲链)
 * - Chain 4: OBS_001 + OBS_006 → INF_004 → STATE_004 (认知偏差链)
 * - Cross-Chain: STATE_001 + STATE_002 → STATE_004 (交叉影响)
 *
 * @version 2.0.0
 * @date 2026-01-29
 */

import {
  KnowledgeGraph,
  KnowledgeGraphNode,
  KnowledgeGraphEdge,
  KnowledgeRelationType,
  KnowledgeInstanceType,
  KnowledgeGraphStatistics,
  KNOWLEDGE_NODE_COLORS,
  KNOWLEDGE_EDGE_COLORS
} from '../types/index';

import {
  KNOWLEDGE_BASE_ID,
  ALL_KNOWLEDGE_INSTANCES,
  KNOWLEDGE_INSTANCE_STATISTICS
} from './knowledgeInstanceData';

// ============================================================
// 辅助函数
// ============================================================

/**
 * 根据节点类型获取节点大小
 */
function getNodeSize(type: KnowledgeInstanceType): number {
  const sizeMap: Record<KnowledgeInstanceType, number> = {
    Observable: 30,      // 可观测特征 - 中等
    InternalState: 40,   // 心理状态 - 较大（重要结论）
    Inference: 35,       // 推理规则 - 中等偏大
    Entity: 25,          // 实体 - 较小
    Action: 28           // 动作 - 中等偏小
  };
  return sizeMap[type] || 30;
}

/**
 * 根据节点类型获取节点图标
 */
function getNodeIcon(type: KnowledgeInstanceType): string {
  const iconMap: Record<KnowledgeInstanceType, string> = {
    Observable: 'eye',           // 可观测 - 眼睛
    InternalState: 'mind',       // 心理状态 - 大脑
    Inference: 'rule',           // 推理规则 - 规则
    Entity: 'user',              // 实体 - 用户
    Action: 'action'             // 动作 - 动作
  };
  return iconMap[type] || 'default';
}

// ============================================================
// 知识图谱节点数据 - 与实例一一对应
// ============================================================

/**
 * 从知识实例生成图谱节点
 * 节点与实例一一对应，保证无孤立节点
 */
export const KNOWLEDGE_GRAPH_NODES: KnowledgeGraphNode[] = ALL_KNOWLEDGE_INSTANCES.map(instance => {
  // 从attributeValues中提取confidence或reliability
  const confidenceOrReliability = instance.attributeValues.find(
    attr => attr.attributeName === 'confidence' || attr.attributeName === 'reliability'
  );

  return {
    id: instance.instanceId,
    instanceId: instance.instanceId,
    label: instance.instanceName,
    nodeType: instance.instanceType,
    sourceOntologyId: instance.sourceOntologyId,
    sourceOntologyName: instance.sourceOntologyName,
    properties: {
      confidence: confidenceOrReliability ? Number(confidenceOrReliability.value) : undefined,
      description: instance.metadata.description,
      tags: instance.metadata.tags
    },
    style: {
      color: KNOWLEDGE_NODE_COLORS[instance.instanceType],
      size: getNodeSize(instance.instanceType),
      icon: getNodeIcon(instance.instanceType)
    }
  };
});

// ============================================================
// 知识图谱边数据 - 构建推理链
// ============================================================

/**
 * 知识图谱的边（关系）列表
 *
 * 关系类型说明：
 * - supports: Observable支撑Inference（证据支持规则）
 * - infers: Inference推断出InternalState（规则推断状态）
 * - manifests_as: InternalState表现为Observable（状态表现为特征）
 * - strengthens: 强化关系（多个证据增强置信度）
 * - associated_with: 关联关系（状态之间的交互影响）
 */
export const KNOWLEDGE_GRAPH_EDGES: KnowledgeGraphEdge[] = [
  // ============================================================
  // Chain 1: 欺骗检测推理链
  // OBS_001 + OBS_002 + OBS_003 → INF_001 → STATE_001
  // ============================================================

  {
    id: 'EDGE_001',
    source: 'INST_OBS_001',
    target: 'INST_INF_001',
    relationType: 'supports',
    relationLabel: '支撑',
    confidence: 0.85,
    properties: {
      description: '陈述前后不一致支撑欺骗倾向检测',
      weight: 0.4,
      evidenceType: '语言证据'
    }
  },
  {
    id: 'EDGE_002',
    source: 'INST_OBS_002',
    target: 'INST_INF_001',
    relationType: 'supports',
    relationLabel: '支撑',
    confidence: 0.80,
    properties: {
      description: '回避眼神接触支撑欺骗倾向检测',
      weight: 0.3,
      evidenceType: '行为证据'
    }
  },
  {
    id: 'EDGE_003',
    source: 'INST_OBS_003',
    target: 'INST_INF_001',
    relationType: 'supports',
    relationLabel: '支撑',
    confidence: 0.75,
    properties: {
      description: '语速异常加快支撑欺骗倾向检测',
      weight: 0.3,
      evidenceType: '生理证据'
    }
  },
  {
    id: 'EDGE_004',
    source: 'INST_INF_001',
    target: 'INST_STATE_001',
    relationType: 'infers',
    relationLabel: '推断',
    confidence: 0.82,
    properties: {
      description: '欺骗检测规则推断出欺骗意图',
      inferenceStrength: '高',
      inferenceType: '规则推理'
    }
  },

  // ============================================================
  // Chain 2: 压力反应推理链
  // OBS_003 + OBS_004 + OBS_005 → INF_002 → STATE_002
  // ============================================================

  {
    id: 'EDGE_005',
    source: 'INST_OBS_003',
    target: 'INST_INF_002',
    relationType: 'supports',
    relationLabel: '支撑',
    confidence: 0.85,
    properties: {
      description: '语速加快支撑高压力反应检测',
      weight: 0.35,
      evidenceType: '语言生理证据'
    }
  },
  {
    id: 'EDGE_006',
    source: 'INST_OBS_004',
    target: 'INST_INF_002',
    relationType: 'supports',
    relationLabel: '支撑',
    confidence: 0.90,
    properties: {
      description: '心率升高支撑高压力反应检测',
      weight: 0.4,
      evidenceType: '生理证据'
    }
  },
  {
    id: 'EDGE_007',
    source: 'INST_OBS_005',
    target: 'INST_INF_002',
    relationType: 'supports',
    relationLabel: '支撑',
    confidence: 0.82,
    properties: {
      description: '手部颤抖支撑高压力反应检测',
      weight: 0.25,
      evidenceType: '行为证据'
    }
  },
  {
    id: 'EDGE_008',
    source: 'INST_INF_002',
    target: 'INST_STATE_002',
    relationType: 'infers',
    relationLabel: '推断',
    confidence: 0.88,
    properties: {
      description: '压力检测规则推断出高度压力状态',
      inferenceStrength: '高',
      inferenceType: '规则推理'
    }
  },

  // ============================================================
  // Chain 3: 记忆扭曲推理链
  // OBS_001 + OBS_006 → INF_003 → STATE_003
  // ============================================================

  {
    id: 'EDGE_009',
    source: 'INST_OBS_001',
    target: 'INST_INF_003',
    relationType: 'supports',
    relationLabel: '支撑',
    confidence: 0.80,
    properties: {
      description: '陈述矛盾支撑记忆扭曲检测',
      weight: 0.5,
      evidenceType: '语言证据'
    }
  },
  {
    id: 'EDGE_010',
    source: 'INST_OBS_006',
    target: 'INST_INF_003',
    relationType: 'supports',
    relationLabel: '支撑',
    confidence: 0.85,
    properties: {
      description: '对话记录支撑记忆扭曲检测',
      weight: 0.5,
      evidenceType: '文档证据'
    }
  },
  {
    id: 'EDGE_011',
    source: 'INST_INF_003',
    target: 'INST_STATE_003',
    relationType: 'infers',
    relationLabel: '推断',
    confidence: 0.75,
    properties: {
      description: '记忆扭曲检测规则推断出记忆扭曲倾向',
      inferenceStrength: '中',
      inferenceType: '规则推理'
    }
  },

  // ============================================================
  // Chain 4: 认知偏差推理链
  // OBS_001 + OBS_006 → INF_004 → STATE_004
  // ============================================================

  {
    id: 'EDGE_012',
    source: 'INST_OBS_001',
    target: 'INST_INF_004',
    relationType: 'supports',
    relationLabel: '支撑',
    confidence: 0.75,
    properties: {
      description: '陈述矛盾支撑认知偏差检测',
      weight: 0.5,
      evidenceType: '语言证据'
    }
  },
  {
    id: 'EDGE_013',
    source: 'INST_OBS_006',
    target: 'INST_INF_004',
    relationType: 'supports',
    relationLabel: '支撑',
    confidence: 0.80,
    properties: {
      description: '对话记录支撑认知偏差检测',
      weight: 0.5,
      evidenceType: '文档证据'
    }
  },
  {
    id: 'EDGE_014',
    source: 'INST_INF_004',
    target: 'INST_STATE_004',
    relationType: 'infers',
    relationLabel: '推断',
    confidence: 0.70,
    properties: {
      description: '认知偏差检测规则推断出确认偏差倾向',
      inferenceStrength: '中',
      inferenceType: '规则推理'
    }
  },

  // ============================================================
  // 状态之间的交叉影响关系
  // ============================================================

  {
    id: 'EDGE_015',
    source: 'INST_STATE_001',
    target: 'INST_STATE_002',
    relationType: 'associated_with',
    relationLabel: '关联',
    confidence: 0.78,
    properties: {
      description: '欺骗意图与高度压力状态相互关联：欺骗行为增加心理压力',
      associationType: '因果关联'
    }
  },
  {
    id: 'EDGE_016',
    source: 'INST_STATE_002',
    target: 'INST_STATE_003',
    relationType: 'strengthens',
    relationLabel: '增强',
    confidence: 0.75,
    properties: {
      description: '高度压力状态增强记忆扭曲倾向',
      strengthenType: '压力导致认知负荷过重'
    }
  },
  {
    id: 'EDGE_017',
    source: 'INST_STATE_001',
    target: 'INST_STATE_004',
    relationType: 'strengthens',
    relationLabel: '增强',
    confidence: 0.72,
    properties: {
      description: '欺骗意图增强确认偏差倾向',
      strengthenType: '自我辩护机制'
    }
  },
  {
    id: 'EDGE_018',
    source: 'INST_STATE_002',
    target: 'INST_STATE_004',
    relationType: 'strengthens',
    relationLabel: '增强',
    confidence: 0.70,
    properties: {
      description: '高度压力状态增强确认偏差倾向',
      strengthenType: '压力下的认知简化'
    }
  }
];

// ============================================================
// 辅助查询函数
// ============================================================

/**
 * 获取节点的出边
 */
export function getOutgoingEdges(nodeId: string): KnowledgeGraphEdge[] {
  return KNOWLEDGE_GRAPH_EDGES.filter(edge => edge.source === nodeId);
}

/**
 * 获取节点的入边
 */
export function getIncomingEdges(nodeId: string): KnowledgeGraphEdge[] {
  return KNOWLEDGE_GRAPH_EDGES.filter(edge => edge.target === nodeId);
}

/**
 * 按关系类型获取边
 */
export function getEdgesByType(relationType: KnowledgeRelationType): KnowledgeGraphEdge[] {
  return KNOWLEDGE_GRAPH_EDGES.filter(edge => edge.relationType === relationType);
}

/**
 * 按节点类型获取节点
 */
export function getNodesByType(nodeType: KnowledgeInstanceType): KnowledgeGraphNode[] {
  return KNOWLEDGE_GRAPH_NODES.filter(node => node.nodeType === nodeType);
}

/**
 * 获取节点的邻居节点ID列表（用于邻域查询）
 * @param nodeId 节点ID
 * @param direction 方向：outgoing/incoming/all
 * @returns 邻居节点ID列表
 */
export function getNeighborNodes(
  nodeId: string,
  direction: 'outgoing' | 'incoming' | 'all' = 'all'
): string[] {
  const neighbors = new Set<string>();

  if (direction === 'outgoing' || direction === 'all') {
    getOutgoingEdges(nodeId).forEach(edge => {
      neighbors.add(edge.target);
    });
  }

  if (direction === 'incoming' || direction === 'all') {
    getIncomingEdges(nodeId).forEach(edge => {
      neighbors.add(edge.source);
    });
  }

  return Array.from(neighbors);
}

// ============================================================
// 知识图谱统计信息
// ============================================================

/**
 * 计算节点类型统计
 */
function calculateNodesByType(): Record<KnowledgeInstanceType, number> {
  const stats: Record<KnowledgeInstanceType, number> = {
    Observable: 0,
    InternalState: 0,
    Inference: 0,
    Entity: 0,
    Action: 0
  };

  KNOWLEDGE_GRAPH_NODES.forEach(node => {
    stats[node.nodeType]++;
  });

  return stats;
}

/**
 * 计算关系类型统计
 */
function calculateEdgesByType(): Record<KnowledgeRelationType, number> {
  const stats: Record<KnowledgeRelationType, number> = {
    supports: 0,
    infers: 0,
    manifests_as: 0,
    strengthens: 0,
    associated_with: 0,
    triggered_by: 0,
    influences: 0,
    part_of: 0
  };

  KNOWLEDGE_GRAPH_EDGES.forEach(edge => {
    stats[edge.relationType]++;
  });

  return stats;
}

/**
 * 知识图谱统计信息
 */
export const KNOWLEDGE_GRAPH_STATISTICS: KnowledgeGraphStatistics = {
  totalNodes: KNOWLEDGE_GRAPH_NODES.length,
  totalEdges: KNOWLEDGE_GRAPH_EDGES.length,
  nodesByType: calculateNodesByType(),
  edgesByType: calculateEdgesByType()
};

// ============================================================
// 完整知识图谱对象
// ============================================================

/**
 * 完整的知识图谱数据
 */
export const KNOWLEDGE_GRAPH: KnowledgeGraph = {
  graphId: 'GRAPH_PSY_001',
  knowledgeBaseId: KNOWLEDGE_BASE_ID,
  name: '司法审讯心理分析知识图谱',
  description: '基于心理学本体构建的知识图谱，展示Observable → Inference → InternalState的完整推理链',
  nodes: KNOWLEDGE_GRAPH_NODES,
  edges: KNOWLEDGE_GRAPH_EDGES,
  statistics: KNOWLEDGE_GRAPH_STATISTICS,
  metadata: {
    version: '2.0.0',
    createdAt: '2026-01-29T16:00:00Z',
    updatedAt: '2026-01-29T16:00:00Z',
    author: 'Psychology System Team'
  }
};

// ============================================================
// 使用示例
// ============================================================

/**
 * 使用示例：
 *
 * // 1. 获取完整图谱
 * import { KNOWLEDGE_GRAPH } from './knowledgeGraphData';
 * console.log('图谱节点数:', KNOWLEDGE_GRAPH.nodes.length);
 * console.log('图谱边数:', KNOWLEDGE_GRAPH.edges.length);
 *
 * // 2. 获取节点的邻居
 * import { getNeighborNodes } from './knowledgeGraphData';
 * const neighbors = getNeighborNodes('INST_OBS_001', 'outgoing');
 * console.log('邻居节点:', neighbors);
 *
 * // 3. 按类型筛选
 * import { getNodesByType, getEdgesByType } from './knowledgeGraphData';
 * const observables = getNodesByType('Observable');
 * const supportsEdges = getEdgesByType('supports');
 * console.log('Observable节点:', observables.length);
 * console.log('supports边:', supportsEdges.length);
 *
 * // 4. 获取统计信息
 * import { KNOWLEDGE_GRAPH_STATISTICS } from './knowledgeGraphData';
 * console.log('统计信息:', KNOWLEDGE_GRAPH_STATISTICS);
 */

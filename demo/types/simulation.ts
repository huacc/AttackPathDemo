/**
 * 推演仿真相关类型定义
 */

// ==================== 攻击阶段 ====================

export interface AttackPhase {
  phaseId: string;
  phaseIndex: number;
  targetNodeId: string;
  techniqueId: string;
  vulnerabilityId?: string;
  successRate: number;
  estimatedTime: number;
  timestamp?: string;
  status?: 'pending' | 'in_progress' | 'success' | 'failed' | 'blocked';
}

// ==================== 攻击路径 ====================

export type PathStatus = 'discovered' | 'simulating' | 'completed' | 'failed';

export interface AttackPath {
  pathId: string;
  sceneId: string;
  startNodeId: string;
  endNodeId: string;
  threatActorId?: string;
  phases: AttackPhase[];
  totalSuccessRate: number;
  totalTime: number;
  impactedNodes: string[];
  status: PathStatus;
  discoveredAt: string;
}

// ==================== 损伤评估 ====================

export type DamageType = 'data_breach' | 'service_disruption' | 'system_compromise' | 'financial_loss';

export interface DamageAssessment {
  pathId: string;
  affectedNodeCount: number;
  dataBreachRisk: number;
  businessImpact: number;
  economicLoss?: number;
  damageByZone: Record<string, number>;
  damageByType: Record<DamageType, number>;
  damageRadius: number;
}

// ==================== 防御仿真结果 ====================

export interface DefenseSimulationResult {
  simulationId: string;
  pathId: string;
  defenseScenarioId: string;
  detectionRate: number;
  blockRate: number;
  avgResponseTime: number;
  businessImpact: number;
  attackSuccessRateChange: number;
  vulnerabilityImprovement: Record<string, number>;
}

// ==================== 推演结果 ====================

export interface SimulationResult {
  simulationId: string;
  sceneId: string;
  algorithmType: string;
  startTime: string;
  endTime: string;
  paths: AttackPath[];
  damageAssessments: Record<string, DamageAssessment>;
  defenseResults?: DefenseSimulationResult[];
  summary: {
    totalPathsFound: number;
    avgSuccessRate: number;
    avgPathLength: number;
    criticalNodesCompromised: number;
  };
}

// ==================== 时间轴事件 ====================

export type EventType =
  | 'attack_start'
  | 'exploit_attempt'
  | 'exploit_success'
  | 'exploit_fail'
  | 'defense_detect'
  | 'defense_block'
  | 'lateral_move'
  | 'data_exfil'
  | 'node_compromised';

export type EventSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface TimelineEvent {
  eventId: string;
  timestamp: string;
  eventType: EventType;
  sourceNodeId?: string;
  targetNodeId: string;
  techniqueId?: string;
  severity: EventSeverity;
  description: string;
  metadata?: Record<string, any>;
}

// ==================== 态势统计 ====================

export interface SituationStatistics {
  timestamp: string;
  attackCount: number;
  blockCount: number;
  compromisedNodeCount: number;
  onlineNodeCount: number;
  securityScoreByZone: Record<string, number>;
}

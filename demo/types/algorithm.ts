/**
 * 算法引擎相关类型定义
 */

// ==================== 算法类型 ====================

export type AlgorithmCategory = 'attack' | 'defense' | 'evaluation' | 'scene_construction';

export type AttackAlgorithmType = 'random_walk' | 'bayesian_decision' | 'breadth_first' | 'depth_first';

export type DefenseAlgorithmType = 'particle_swarm';

export type EvaluationAlgorithmType =
  | 'defense_depth_layered'
  | 'defense_effectiveness'
  | 'business_availability'
  | 'vulnerability_assessment'
  | 'coverage_analysis';

export type SceneConstructionAlgorithmType = 'graph_theory';

// ==================== 算法配置 ====================

export interface AlgorithmParameter {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'enum';
  defaultValue: any;
  description: string;
  range?: [number, number];
  options?: string[];
}

export interface AlgorithmConfig {
  algorithmId: string;
  parameters: Record<string, any>;
}

// ==================== 算法定义 ====================

export interface Algorithm {
  algorithmId: string;
  name: string;
  category: AlgorithmCategory;
  type: AttackAlgorithmType | DefenseAlgorithmType | EvaluationAlgorithmType | SceneConstructionAlgorithmType;
  description: string;
  parameters: AlgorithmParameter[];
  applicableScenarios: string[];
  complexity?: string;
  accuracy?: number;
}

// ==================== 评估模型 ====================

export interface EvaluationModel {
  modelId: string;
  name: string;
  description: string;
  algorithmId: string;
  metrics: {
    name: string;
    weight: number;
    description: string;
  }[];
}

// ==================== 算法执行结果 ====================

export interface AlgorithmExecutionResult {
  executionId: string;
  algorithmId: string;
  startTime: string;
  endTime: string;
  status: 'success' | 'failed' | 'timeout';
  result: any;
  metrics?: {
    executionTime: number;
    memoryUsage?: number;
    accuracy?: number;
  };
  error?: string;
}

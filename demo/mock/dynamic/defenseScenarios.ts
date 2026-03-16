/**
 * P6.1 防御场景 Mock 数据
 * 预置4种防御场景：防护手段纵深、应用层级纵深、网络纵深、攻击阶段纵深
 */

import { defenseMeasures } from '../static/defenseMeasures';
import { networkNodes } from '../static/networkNodes';

// 防御部署
export interface DefenseDeployment {
  measureId: string;
  measureName: string;
  deployedNodeIds: string[];
  deployedNodeNames: string[];
  effectivenessScore: number;
}

// 防御效果
export interface DefenseEffect {
  attackSuccessRateReduction: number; // 攻击成功率降低百分比
  detectionRateIncrease: number; // 检测率提升百分比
  responseTimeReduction: number; // 响应时间缩短百分比
  coverageIncrease: number; // 覆盖度提升百分比
}

// 仿真结果对比
export interface SimulationComparison {
  withoutDefense: {
    attackSuccessRate: number;
    detectionRate: number;
    averageResponseTime: number; // 分钟
    affectedNodesCount: number;
  };
  withDefense: {
    attackSuccessRate: number;
    detectionRate: number;
    averageResponseTime: number; // 分钟
    affectedNodesCount: number;
  };
  improvement: {
    successRateReduction: number; // 百分比
    detectionRateIncrease: number; // 百分比
    responseTimeReduction: number; // 百分比
    affectedNodesReduction: number; // 百分比
  };
}

// 防御场景
export interface DefenseScenario {
  scenarioId: string;
  scenarioName: string;
  scenarioType: 'protection_depth' | 'application_depth' | 'network_depth' | 'killchain_depth';
  description: string;
  deployments: DefenseDeployment[];
  expectedEffect: DefenseEffect;
  simulationResult: SimulationComparison;
  totalCost: number; // 万元
  deploymentTime: number; // 小时
  maintenanceBurden: 'low' | 'medium' | 'high';
  createdAt: string;
}

// 场景1：防护手段纵深（WAF + IDS + EDR + DLP）
export const SCENARIO_PROTECTION_DEPTH: DefenseScenario = {
  scenarioId: 'defense-scenario-001',
  scenarioName: '防护手段纵深防御',
  scenarioType: 'protection_depth',
  description: '在关键节点部署多层防护设备（WAF、IDS、EDR、DLP），形成纵深防御体系',
  deployments: [
    {
      measureId: 'def-001',
      measureName: 'Web应用防火墙(WAF)',
      deployedNodeIds: ['node-dmz-01', 'node-dmz-03'],
      deployedNodeNames: ['API网关', 'Web应用服务器'],
      effectivenessScore: 0.85
    },
    {
      measureId: 'def-002',
      measureName: '入侵检测系统(IDS)',
      deployedNodeIds: ['node-dmz-01', 'node-intra-01', 'node-intra-02'],
      deployedNodeNames: ['API网关', '核心交换机', '应用服务器'],
      effectivenessScore: 0.78
    },
    {
      measureId: 'def-003',
      measureName: '端点检测响应(EDR)',
      deployedNodeIds: ['node-intra-10', 'node-intra-11', 'node-intra-15', 'node-intra-24'],
      deployedNodeNames: ['财务部工作站', '人力资源部工作站', '研发部工作站', '管理员工作站'],
      effectivenessScore: 0.82
    },
    {
      measureId: 'def-004',
      measureName: '数据防泄漏(DLP)',
      deployedNodeIds: ['node-intra-04', 'node-intra-12'],
      deployedNodeNames: ['MySQL数据库服务器', 'PostgreSQL数据库'],
      effectivenessScore: 0.88
    }
  ],
  expectedEffect: {
    attackSuccessRateReduction: 65,
    detectionRateIncrease: 75,
    responseTimeReduction: 50,
    coverageIncrease: 80
  },
  simulationResult: {
    withoutDefense: {
      attackSuccessRate: 0.72,
      detectionRate: 0.25,
      averageResponseTime: 120,
      affectedNodesCount: 8
    },
    withDefense: {
      attackSuccessRate: 0.25,
      detectionRate: 0.88,
      averageResponseTime: 60,
      affectedNodesCount: 3
    },
    improvement: {
      successRateReduction: 65,
      detectionRateIncrease: 63,
      responseTimeReduction: 50,
      affectedNodesReduction: 62.5
    }
  },
  totalCost: 180,
  deploymentTime: 48,
  maintenanceBurden: 'high',
  createdAt: '2026-03-15T10:00:00Z'
};

// 场景2：应用层级纵深（代码审计 + WAF + 输入验证 + 加密）
export const SCENARIO_APPLICATION_DEPTH: DefenseScenario = {
  scenarioId: 'defense-scenario-002',
  scenarioName: '应用层级纵深防御',
  scenarioType: 'application_depth',
  description: '针对应用层进行全方位安全加固，包括代码审计、WAF防护、输入验证和数据加密',
  deployments: [
    {
      measureId: 'def-005',
      measureName: '静态代码分析(SAST)',
      deployedNodeIds: ['node-dmz-03', 'node-intra-02'],
      deployedNodeNames: ['Web应用服务器', '应用服务器'],
      effectivenessScore: 0.75
    },
    {
      measureId: 'def-001',
      measureName: 'Web应用防火墙(WAF)',
      deployedNodeIds: ['node-dmz-01', 'node-dmz-03'],
      deployedNodeNames: ['API网关', 'Web应用服务器'],
      effectivenessScore: 0.85
    },
    {
      measureId: 'def-006',
      measureName: '输入验证与过滤',
      deployedNodeIds: ['node-dmz-03', 'node-intra-02'],
      deployedNodeNames: ['Web应用服务器', '应用服务器'],
      effectivenessScore: 0.80
    },
    {
      measureId: 'def-007',
      measureName: '数据加密(TLS/SSL)',
      deployedNodeIds: ['node-dmz-01', 'node-dmz-03', 'node-intra-04', 'node-intra-12'],
      deployedNodeNames: ['API网关', 'Web应用服务器', 'MySQL数据库服务器', 'PostgreSQL数据库'],
      effectivenessScore: 0.90
    }
  ],
  expectedEffect: {
    attackSuccessRateReduction: 70,
    detectionRateIncrease: 60,
    responseTimeReduction: 40,
    coverageIncrease: 75
  },
  simulationResult: {
    withoutDefense: {
      attackSuccessRate: 0.75,
      detectionRate: 0.30,
      averageResponseTime: 100,
      affectedNodesCount: 6
    },
    withDefense: {
      attackSuccessRate: 0.22,
      detectionRate: 0.78,
      averageResponseTime: 60,
      affectedNodesCount: 2
    },
    improvement: {
      successRateReduction: 70.7,
      detectionRateIncrease: 48,
      responseTimeReduction: 40,
      affectedNodesReduction: 66.7
    }
  },
  totalCost: 120,
  deploymentTime: 72,
  maintenanceBurden: 'medium',
  createdAt: '2026-03-15T11:00:00Z'
};

// 场景3：网络纵深（防火墙 + VLAN + VPN + 微分段）
export const SCENARIO_NETWORK_DEPTH: DefenseScenario = {
  scenarioId: 'defense-scenario-003',
  scenarioName: '网络纵深防御',
  scenarioType: 'network_depth',
  description: '通过网络分段隔离、防火墙策略、VPN加密和微分段技术构建网络纵深防御',
  deployments: [
    {
      measureId: 'def-008',
      measureName: '下一代防火墙(NGFW)',
      deployedNodeIds: ['node-dmz-01', 'node-intra-01'],
      deployedNodeNames: ['API网关', '核心交换机'],
      effectivenessScore: 0.88
    },
    {
      measureId: 'def-009',
      measureName: 'VLAN隔离',
      deployedNodeIds: ['node-intra-01', 'node-intra-02'],
      deployedNodeNames: ['核心交换机', '应用服务器'],
      effectivenessScore: 0.75
    },
    {
      measureId: 'def-010',
      measureName: 'VPN加密通道',
      deployedNodeIds: ['node-dmz-01', 'node-intra-01'],
      deployedNodeNames: ['API网关', '核心交换机'],
      effectivenessScore: 0.85
    },
    {
      measureId: 'def-011',
      measureName: '微分段技术',
      deployedNodeIds: ['node-intra-03', 'node-intra-04', 'node-intra-05', 'node-intra-06'],
      deployedNodeNames: ['域控制器', 'MySQL数据库服务器', '文件服务器', '邮件服务器'],
      effectivenessScore: 0.82
    }
  ],
  expectedEffect: {
    attackSuccessRateReduction: 60,
    detectionRateIncrease: 70,
    responseTimeReduction: 45,
    coverageIncrease: 85
  },
  simulationResult: {
    withoutDefense: {
      attackSuccessRate: 0.68,
      detectionRate: 0.28,
      averageResponseTime: 110,
      affectedNodesCount: 10
    },
    withDefense: {
      attackSuccessRate: 0.27,
      detectionRate: 0.82,
      averageResponseTime: 60,
      affectedNodesCount: 4
    },
    improvement: {
      successRateReduction: 60.3,
      detectionRateIncrease: 54,
      responseTimeReduction: 45.5,
      affectedNodesReduction: 60
    }
  },
  totalCost: 200,
  deploymentTime: 96,
  maintenanceBurden: 'high',
  createdAt: '2026-03-15T12:00:00Z'
};

// 场景4：攻击阶段纵深（按Kill Chain阶段部署）
export const SCENARIO_KILLCHAIN_DEPTH: DefenseScenario = {
  scenarioId: 'defense-scenario-004',
  scenarioName: '攻击阶段纵深防御',
  scenarioType: 'killchain_depth',
  description: '按照Kill Chain攻击链各阶段部署针对性防御措施，实现全链路防护',
  deployments: [
    {
      measureId: 'def-012',
      measureName: '威胁情报平台(TIP)',
      deployedNodeIds: ['node-dmz-01', 'node-intra-01'],
      deployedNodeNames: ['API网关', '核心交换机'],
      effectivenessScore: 0.78
    },
    {
      measureId: 'def-002',
      measureName: '入侵检测系统(IDS)',
      deployedNodeIds: ['node-dmz-01', 'node-intra-01', 'node-intra-02'],
      deployedNodeNames: ['API网关', '核心交换机', '应用服务器'],
      effectivenessScore: 0.78
    },
    {
      measureId: 'def-013',
      measureName: '安全信息事件管理(SIEM)',
      deployedNodeIds: ['node-intra-01'],
      deployedNodeNames: ['核心交换机'],
      effectivenessScore: 0.85
    },
    {
      measureId: 'def-014',
      measureName: '安全编排自动化响应(SOAR)',
      deployedNodeIds: ['node-intra-01'],
      deployedNodeNames: ['核心交换机'],
      effectivenessScore: 0.88
    },
    {
      measureId: 'def-003',
      measureName: '端点检测响应(EDR)',
      deployedNodeIds: ['node-intra-10', 'node-intra-11', 'node-intra-15'],
      deployedNodeNames: ['财务部工作站', '人力资源部工作站', '研发部工作站'],
      effectivenessScore: 0.82
    }
  ],
  expectedEffect: {
    attackSuccessRateReduction: 75,
    detectionRateIncrease: 85,
    responseTimeReduction: 60,
    coverageIncrease: 90
  },
  simulationResult: {
    withoutDefense: {
      attackSuccessRate: 0.70,
      detectionRate: 0.22,
      averageResponseTime: 150,
      affectedNodesCount: 12
    },
    withDefense: {
      attackSuccessRate: 0.18,
      detectionRate: 0.92,
      averageResponseTime: 60,
      affectedNodesCount: 3
    },
    improvement: {
      successRateReduction: 74.3,
      detectionRateIncrease: 70,
      responseTimeReduction: 60,
      affectedNodesReduction: 75
    }
  },
  totalCost: 250,
  deploymentTime: 120,
  maintenanceBurden: 'high',
  createdAt: '2026-03-15T13:00:00Z'
};

// 导出所有防御场景
export const DEFENSE_SCENARIOS: DefenseScenario[] = [
  SCENARIO_PROTECTION_DEPTH,
  SCENARIO_APPLICATION_DEPTH,
  SCENARIO_NETWORK_DEPTH,
  SCENARIO_KILLCHAIN_DEPTH
];

// 根据场景ID获取防御场景
export const getDefenseScenarioById = (scenarioId: string): DefenseScenario | undefined => {
  return DEFENSE_SCENARIOS.find(scenario => scenario.scenarioId === scenarioId);
};

// 根据场景类型获取防御场景
export const getDefenseScenariosByType = (type: string): DefenseScenario[] => {
  return DEFENSE_SCENARIOS.filter(scenario => scenario.scenarioType === type);
};

// 获取防御场景统计
export const getDefenseScenarioStats = () => {
  return {
    totalScenarios: DEFENSE_SCENARIOS.length,
    averageCost: DEFENSE_SCENARIOS.reduce((sum, s) => sum + s.totalCost, 0) / DEFENSE_SCENARIOS.length,
    averageDeploymentTime: DEFENSE_SCENARIOS.reduce((sum, s) => sum + s.deploymentTime, 0) / DEFENSE_SCENARIOS.length,
    averageSuccessRateReduction: DEFENSE_SCENARIOS.reduce((sum, s) => sum + s.expectedEffect.attackSuccessRateReduction, 0) / DEFENSE_SCENARIOS.length,
    averageDetectionRateIncrease: DEFENSE_SCENARIOS.reduce((sum, s) => sum + s.expectedEffect.detectionRateIncrease, 0) / DEFENSE_SCENARIOS.length
  };
};

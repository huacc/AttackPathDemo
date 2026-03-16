/**
 * P5.1 攻击路径 Mock 数据
 * 参考：设计文档P5.1、需求文档三·模块4·4.2
 */

import { attackTechniques } from '../static/attackTechniques';
import { vulnerabilities } from '../static/vulnerabilities';
import { networkNodes } from '../static/networkNodes';
import { THREAT_ACTORS } from '../static/threatActors';

// 攻击阶段（单步攻击）
export interface AttackPhase {
  phaseId: string;
  phaseIndex: number;
  targetNodeId: string;
  targetNodeName: string;
  techniqueId: string;
  techniqueName: string;
  vulnerabilityId?: string;
  vulnerabilityName?: string;
  killChainPhase: string;
  baseSuccessRate: number;
  actualSuccessRate: number;
  estimatedDuration: number; // 分钟
  detectionProbability: number;
  description: string;
}

// 时间轴事件
export interface TimelineEvent {
  timestamp: number; // 相对时间（分钟）
  eventType: 'reconnaissance' | 'exploitation' | 'lateral_movement' | 'privilege_escalation' | 'data_exfiltration' | 'impact';
  nodeId: string;
  nodeName: string;
  techniqueId: string;
  techniqueName: string;
  success: boolean;
  description: string;
}

// 损伤评估
export interface DamageAssessment {
  affectedNodesCount: number;
  affectedNodeIds: string[];
  dataLeakageRisk: 'low' | 'medium' | 'high' | 'critical';
  businessImpact: 'minimal' | 'moderate' | 'significant' | 'severe';
  estimatedLoss: number; // 万元
  recoveryTime: number; // 小时
  impactByZone: {
    zone: string;
    affectedNodes: number;
    criticalAssets: number;
  }[];
  impactByAssetType: {
    assetType: string;
    count: number;
    percentage: number;
  }[];
}

// 攻击路径
export interface AttackPath {
  pathId: string;
  pathName: string;
  description: string;
  sceneId: string;
  startNodeId: string;
  startNodeName: string;
  targetNodeId: string;
  targetNodeName: string;
  threatActorId: string;
  threatActorName: string;
  attackPhases: AttackPhase[];
  totalSuccessRate: number;
  totalDuration: number; // 分钟
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  stealthScore: number; // 0-100，越高越隐蔽
  timeline: TimelineEvent[];
  damageAssessment: DamageAssessment;
  createdAt: string;
}

// 路径1：SQL注入→数据窃取
export const ATTACK_PATH_SQL_INJECTION: AttackPath = {
  pathId: 'path-001',
  pathName: 'SQL注入→数据窃取',
  description: '外网攻击者通过Web应用SQL注入漏洞入侵，横向移动至应用服务器和数据库，最终窃取敏感数据',
  sceneId: 'scene-001',
  startNodeId: 'node-external-01',
  startNodeName: 'Internet',
  targetNodeId: 'node-intra-05',
  targetNodeName: 'MySQL数据库服务器',
  threatActorId: 'actor-002',
  threatActorName: 'FIN7',
  attackPhases: [
    {
      phaseId: 'phase-001-01',
      phaseIndex: 1,
      targetNodeId: 'node-dmz-03',
      targetNodeName: 'Web应用服务器',
      techniqueId: 'T1190',
      techniqueName: 'Exploit Public-Facing Application',
      vulnerabilityId: 'vuln-009',
      vulnerabilityName: 'SQL注入漏洞',
      killChainPhase: 'exploitation',
      baseSuccessRate: 0.75,
      actualSuccessRate: 0.68,
      estimatedDuration: 15,
      detectionProbability: 0.25,
      description: '利用Web应用SQL注入漏洞获取初始访问权限'
    },
    {
      phaseId: 'phase-001-02',
      phaseIndex: 2,
      targetNodeId: 'node-dmz-03',
      targetNodeName: 'Web应用服务器',
      techniqueId: 'T1059',
      techniqueName: 'Command and Scripting Interpreter',
      killChainPhase: 'execution',
      baseSuccessRate: 0.85,
      actualSuccessRate: 0.78,
      estimatedDuration: 10,
      detectionProbability: 0.30,
      description: '在Web服务器上执行恶意脚本，建立持久化后门'
    },
    {
      phaseId: 'phase-001-03',
      phaseIndex: 3,
      targetNodeId: 'node-intra-06',
      targetNodeName: '应用服务器',
      techniqueId: 'T1021',
      techniqueName: 'Remote Services',
      killChainPhase: 'lateral_movement',
      baseSuccessRate: 0.70,
      actualSuccessRate: 0.63,
      estimatedDuration: 20,
      detectionProbability: 0.40,
      description: '利用窃取的凭证横向移动至内网应用服务器'
    },
    {
      phaseId: 'phase-001-04',
      phaseIndex: 4,
      targetNodeId: 'node-intra-05',
      targetNodeName: 'MySQL数据库服务器',
      techniqueId: 'T1005',
      techniqueName: 'Data from Local System',
      killChainPhase: 'collection',
      baseSuccessRate: 0.90,
      actualSuccessRate: 0.81,
      estimatedDuration: 30,
      detectionProbability: 0.35,
      description: '从数据库服务器收集敏感数据'
    },
    {
      phaseId: 'phase-001-05',
      phaseIndex: 5,
      targetNodeId: 'node-external-01',
      targetNodeName: 'Internet',
      techniqueId: 'T1041',
      techniqueName: 'Exfiltration Over C2 Channel',
      killChainPhase: 'exfiltration',
      baseSuccessRate: 0.80,
      actualSuccessRate: 0.72,
      estimatedDuration: 45,
      detectionProbability: 0.50,
      description: '通过C2通道将窃取的数据外传'
    }
  ],
  totalSuccessRate: 0.218, // 0.68 * 0.78 * 0.63 * 0.81 * 0.72
  totalDuration: 120,
  riskLevel: 'critical',
  stealthScore: 45,
  timeline: [
    {
      timestamp: 0,
      eventType: 'reconnaissance',
      nodeId: 'node-dmz-03',
      nodeName: 'Web应用服务器',
      techniqueId: 'T1190',
      techniqueName: 'Exploit Public-Facing Application',
      success: true,
      description: '扫描发现Web应用SQL注入漏洞'
    },
    {
      timestamp: 15,
      eventType: 'exploitation',
      nodeId: 'node-dmz-03',
      nodeName: 'Web应用服务器',
      techniqueId: 'T1190',
      techniqueName: 'Exploit Public-Facing Application',
      success: true,
      description: '成功利用SQL注入漏洞获取Shell'
    },
    {
      timestamp: 25,
      eventType: 'lateral_movement',
      nodeId: 'node-dmz-03',
      nodeName: 'Web应用服务器',
      techniqueId: 'T1059',
      techniqueName: 'Command and Scripting Interpreter',
      success: true,
      description: '执行恶意脚本，建立持久化'
    },
    {
      timestamp: 45,
      eventType: 'lateral_movement',
      nodeId: 'node-intra-06',
      nodeName: '应用服务器',
      techniqueId: 'T1021',
      techniqueName: 'Remote Services',
      success: true,
      description: '利用窃取的凭证横向移动至应用服务器'
    },
    {
      timestamp: 75,
      eventType: 'data_exfiltration',
      nodeId: 'node-intra-05',
      nodeName: 'MySQL数据库服务器',
      techniqueId: 'T1005',
      techniqueName: 'Data from Local System',
      success: true,
      description: '访问数据库，收集敏感数据'
    },
    {
      timestamp: 120,
      eventType: 'data_exfiltration',
      nodeId: 'node-external-01',
      nodeName: 'Internet',
      techniqueId: 'T1041',
      techniqueName: 'Exfiltration Over C2 Channel',
      success: true,
      description: '数据外传完成'
    }
  ],
  damageAssessment: {
    affectedNodesCount: 4,
    affectedNodeIds: ['node-dmz-03', 'node-intra-06', 'node-intra-05', 'node-external-01'],
    dataLeakageRisk: 'critical',
    businessImpact: 'severe',
    estimatedLoss: 500,
    recoveryTime: 72,
    impactByZone: [
      { zone: 'DMZ', affectedNodes: 1, criticalAssets: 1 },
      { zone: 'Intranet', affectedNodes: 2, criticalAssets: 2 },
      { zone: 'External', affectedNodes: 1, criticalAssets: 0 }
    ],
    impactByAssetType: [
      { assetType: 'Web应用', count: 1, percentage: 25 },
      { assetType: '应用服务器', count: 1, percentage: 25 },
      { assetType: '数据库', count: 1, percentage: 25 },
      { assetType: '外网', count: 1, percentage: 25 }
    ]
  },
  createdAt: '2026-03-15T10:00:00Z'
};

// 路径2：钓鱼→横向移动→域控
export const ATTACK_PATH_PHISHING: AttackPath = {
  pathId: 'path-002',
  pathName: '钓鱼→横向移动→域控',
  description: '通过钓鱼邮件获取终端用户凭证，横向移动至域控制器，获取域管理员权限',
  sceneId: 'scene-002',
  startNodeId: 'node-intra-10',
  startNodeName: '财务部工作站',
  targetNodeId: 'node-intra-03',
  targetNodeName: '域控制器',
  threatActorId: 'actor-001',
  threatActorName: 'APT29',
  attackPhases: [
    {
      phaseId: 'phase-002-01',
      phaseIndex: 1,
      targetNodeId: 'node-intra-10',
      targetNodeName: '财务部工作站',
      techniqueId: 'T1566',
      techniqueName: 'Phishing',
      killChainPhase: 'delivery',
      baseSuccessRate: 0.65,
      actualSuccessRate: 0.59,
      estimatedDuration: 5,
      detectionProbability: 0.20,
      description: '发送钓鱼邮件，诱导用户点击恶意链接'
    },
    {
      phaseId: 'phase-002-02',
      phaseIndex: 2,
      targetNodeId: 'node-intra-10',
      targetNodeName: '财务部工作站',
      techniqueId: 'T1204',
      techniqueName: 'User Execution',
      killChainPhase: 'execution',
      baseSuccessRate: 0.70,
      actualSuccessRate: 0.63,
      estimatedDuration: 10,
      detectionProbability: 0.25,
      description: '用户执行恶意载荷，植入木马'
    },
    {
      phaseId: 'phase-002-03',
      phaseIndex: 3,
      targetNodeId: 'node-intra-10',
      targetNodeName: '财务部工作站',
      techniqueId: 'T1068',
      techniqueName: 'Exploitation for Privilege Escalation',
      vulnerabilityId: 'vuln-005',
      vulnerabilityName: 'CVE-2021-34527 (PrintNightmare)',
      killChainPhase: 'privilege_escalation',
      baseSuccessRate: 0.80,
      actualSuccessRate: 0.72,
      estimatedDuration: 15,
      detectionProbability: 0.35,
      description: '利用PrintNightmare漏洞提升权限'
    },
    {
      phaseId: 'phase-002-04',
      phaseIndex: 4,
      targetNodeId: 'node-intra-04',
      targetNodeName: '文件服务器',
      techniqueId: 'T1021',
      techniqueName: 'Remote Services',
      killChainPhase: 'lateral_movement',
      baseSuccessRate: 0.75,
      actualSuccessRate: 0.68,
      estimatedDuration: 20,
      detectionProbability: 0.40,
      description: '使用窃取的凭证横向移动至文件服务器'
    },
    {
      phaseId: 'phase-002-05',
      phaseIndex: 5,
      targetNodeId: 'node-intra-03',
      targetNodeName: '域控制器',
      techniqueId: 'T1003',
      techniqueName: 'OS Credential Dumping',
      killChainPhase: 'credential_access',
      baseSuccessRate: 0.85,
      actualSuccessRate: 0.77,
      estimatedDuration: 25,
      detectionProbability: 0.55,
      description: '从域控制器导出域管理员凭证'
    }
  ],
  totalSuccessRate: 0.125, // 0.59 * 0.63 * 0.72 * 0.68 * 0.77
  totalDuration: 75,
  riskLevel: 'critical',
  stealthScore: 35,
  timeline: [
    {
      timestamp: 0,
      eventType: 'reconnaissance',
      nodeId: 'node-intra-10',
      nodeName: '财务部工作站',
      techniqueId: 'T1566',
      techniqueName: 'Phishing',
      success: true,
      description: '钓鱼邮件发送成功'
    },
    {
      timestamp: 5,
      eventType: 'exploitation',
      nodeId: 'node-intra-10',
      nodeName: '财务部工作站',
      techniqueId: 'T1204',
      techniqueName: 'User Execution',
      success: true,
      description: '用户点击恶意链接，木马植入成功'
    },
    {
      timestamp: 15,
      eventType: 'privilege_escalation',
      nodeId: 'node-intra-10',
      nodeName: '财务部工作站',
      techniqueId: 'T1068',
      techniqueName: 'Exploitation for Privilege Escalation',
      success: true,
      description: '利用PrintNightmare提升至管理员权限'
    },
    {
      timestamp: 30,
      eventType: 'lateral_movement',
      nodeId: 'node-intra-04',
      nodeName: '文件服务器',
      techniqueId: 'T1021',
      techniqueName: 'Remote Services',
      success: true,
      description: '横向移动至文件服务器'
    },
    {
      timestamp: 50,
      eventType: 'lateral_movement',
      nodeId: 'node-intra-03',
      nodeName: '域控制器',
      techniqueId: 'T1003',
      techniqueName: 'OS Credential Dumping',
      success: true,
      description: '访问域控制器'
    },
    {
      timestamp: 75,
      eventType: 'impact',
      nodeId: 'node-intra-03',
      nodeName: '域控制器',
      techniqueId: 'T1003',
      techniqueName: 'OS Credential Dumping',
      success: true,
      description: '成功导出域管理员凭证，获取域控制权'
    }
  ],
  damageAssessment: {
    affectedNodesCount: 3,
    affectedNodeIds: ['node-intra-10', 'node-intra-04', 'node-intra-03'],
    dataLeakageRisk: 'critical',
    businessImpact: 'severe',
    estimatedLoss: 800,
    recoveryTime: 96,
    impactByZone: [
      { zone: 'Intranet', affectedNodes: 3, criticalAssets: 2 }
    ],
    impactByAssetType: [
      { assetType: '工作站', count: 1, percentage: 33 },
      { assetType: '文件服务器', count: 1, percentage: 33 },
      { assetType: '域控制器', count: 1, percentage: 34 }
    ]
  },
  createdAt: '2026-03-15T11:00:00Z'
};

// 路径3：API漏洞利用→云数据库
export const ATTACK_PATH_API_EXPLOIT: AttackPath = {
  pathId: 'path-003',
  pathName: 'API漏洞利用→云数据库',
  description: '利用API网关认证绕过漏洞，直接访问云数据库，窃取敏感数据',
  sceneId: 'scene-001',
  startNodeId: 'node-external-01',
  startNodeName: 'Internet',
  targetNodeId: 'node-intra-21',
  targetNodeName: 'PostgreSQL数据库',
  threatActorId: 'actor-003',
  threatActorName: 'Lazarus Group',
  attackPhases: [
    {
      phaseId: 'phase-003-01',
      phaseIndex: 1,
      targetNodeId: 'node-dmz-04',
      targetNodeName: 'API网关',
      techniqueId: 'T1190',
      techniqueName: 'Exploit Public-Facing Application',
      vulnerabilityId: 'vuln-002',
      vulnerabilityName: 'CVE-2022-22965 (Spring4Shell)',
      killChainPhase: 'exploitation',
      baseSuccessRate: 0.70,
      actualSuccessRate: 0.63,
      estimatedDuration: 10,
      detectionProbability: 0.30,
      description: '利用API网关Spring4Shell漏洞绕过认证'
    },
    {
      phaseId: 'phase-003-02',
      phaseIndex: 2,
      targetNodeId: 'node-dmz-04',
      targetNodeName: 'API网关',
      techniqueId: 'T1078',
      techniqueName: 'Valid Accounts',
      killChainPhase: 'persistence',
      baseSuccessRate: 0.85,
      actualSuccessRate: 0.77,
      estimatedDuration: 15,
      detectionProbability: 0.25,
      description: '创建后门账户，维持持久化访问'
    },
    {
      phaseId: 'phase-003-03',
      phaseIndex: 3,
      targetNodeId: 'node-intra-21',
      targetNodeName: 'PostgreSQL数据库',
      techniqueId: 'T1005',
      techniqueName: 'Data from Local System',
      killChainPhase: 'collection',
      baseSuccessRate: 0.90,
      actualSuccessRate: 0.81,
      estimatedDuration: 30,
      detectionProbability: 0.40,
      description: '通过API直接访问云数据库，收集敏感数据'
    },
    {
      phaseId: 'phase-003-04',
      phaseIndex: 4,
      targetNodeId: 'node-external-01',
      targetNodeName: 'Internet',
      techniqueId: 'T1041',
      techniqueName: 'Exfiltration Over C2 Channel',
      killChainPhase: 'exfiltration',
      baseSuccessRate: 0.80,
      actualSuccessRate: 0.72,
      estimatedDuration: 40,
      detectionProbability: 0.45,
      description: '通过加密通道外传数据'
    }
  ],
  totalSuccessRate: 0.283, // 0.63 * 0.77 * 0.81 * 0.72
  totalDuration: 95,
  riskLevel: 'high',
  stealthScore: 55,
  timeline: [
    {
      timestamp: 0,
      eventType: 'reconnaissance',
      nodeId: 'node-dmz-04',
      nodeName: 'API网关',
      techniqueId: 'T1190',
      techniqueName: 'Exploit Public-Facing Application',
      success: true,
      description: '扫描发现API网关Spring4Shell漏洞'
    },
    {
      timestamp: 10,
      eventType: 'exploitation',
      nodeId: 'node-dmz-04',
      nodeName: 'API网关',
      techniqueId: 'T1190',
      techniqueName: 'Exploit Public-Facing Application',
      success: true,
      description: '成功利用Spring4Shell绕过认证'
    },
    {
      timestamp: 25,
      eventType: 'lateral_movement',
      nodeId: 'node-dmz-04',
      nodeName: 'API网关',
      techniqueId: 'T1078',
      techniqueName: 'Valid Accounts',
      success: true,
      description: '创建后门账户'
    },
    {
      timestamp: 55,
      eventType: 'data_exfiltration',
      nodeId: 'node-intra-21',
      nodeName: 'PostgreSQL数据库',
      techniqueId: 'T1005',
      techniqueName: 'Data from Local System',
      success: true,
      description: '访问云数据库，收集敏感数据'
    },
    {
      timestamp: 95,
      eventType: 'data_exfiltration',
      nodeId: 'node-external-01',
      nodeName: 'Internet',
      techniqueId: 'T1041',
      techniqueName: 'Exfiltration Over C2 Channel',
      success: true,
      description: '数据外传完成'
    }
  ],
  damageAssessment: {
    affectedNodesCount: 3,
    affectedNodeIds: ['node-dmz-04', 'node-intra-21', 'node-external-01'],
    dataLeakageRisk: 'high',
    businessImpact: 'significant',
    estimatedLoss: 350,
    recoveryTime: 48,
    impactByZone: [
      { zone: 'DMZ', affectedNodes: 1, criticalAssets: 1 },
      { zone: 'Intranet', affectedNodes: 1, criticalAssets: 1 },
      { zone: 'External', affectedNodes: 1, criticalAssets: 0 }
    ],
    impactByAssetType: [
      { assetType: 'API网关', count: 1, percentage: 33 },
      { assetType: '数据库', count: 1, percentage: 33 },
      { assetType: '外网', count: 1, percentage: 34 }
    ]
  },
  createdAt: '2026-03-15T12:00:00Z'
};

// 导出所有攻击路径
export const ATTACK_PATHS: AttackPath[] = [
  ATTACK_PATH_SQL_INJECTION,
  ATTACK_PATH_PHISHING,
  ATTACK_PATH_API_EXPLOIT
];

// 根据场景ID获取攻击路径
export const getAttackPathsByScene = (sceneId: string): AttackPath[] => {
  return ATTACK_PATHS.filter(path => path.sceneId === sceneId);
};

// 根据路径ID获取攻击路径
export const getAttackPathById = (pathId: string): AttackPath | undefined => {
  return ATTACK_PATHS.find(path => path.pathId === pathId);
};

// 根据威胁行为者ID获取攻击路径
export const getAttackPathsByThreatActor = (actorId: string): AttackPath[] => {
  return ATTACK_PATHS.filter(path => path.threatActorId === actorId);
};

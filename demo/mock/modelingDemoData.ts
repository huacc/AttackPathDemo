/**
 * 建模示例数据
 * 用于展示三种建模方式：本体建模、知识建模、流程建模
 *
 * 场景：审讯分析
 */

import { Node, Edge } from 'reactflow';

// ============================================================
// 1. 本体建模数据（Ontology Modeling）
// 展示概念之间的继承和分类关系
// ============================================================

export interface OntologyNode extends Node {
  data: {
    label: string;
    description: string;
    level: number; // 层级：0=根概念，1=一级子概念，2=二级子概念
    attributes?: string[]; // 属性列表
  };
}

export const ontologyNodes: OntologyNode[] = [
  // Level 0: 根概念
  {
    id: 'concept-root',
    type: 'default',
    position: { x: 400, y: 50 },
    data: {
      label: '心理分析概念',
      description: '所有心理分析相关概念的根节点',
      level: 0,
    },
    style: {
      background: '#667eea',
      color: 'white',
      border: '2px solid #5a67d8',
      borderRadius: '8px',
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: 'bold',
    },
  },

  // Level 1: 三大核心概念
  {
    id: 'concept-observable',
    type: 'default',
    position: { x: 150, y: 180 },
    data: {
      label: 'Observable（可观察特征）',
      description: '可以直接观察到的外在表现',
      level: 1,
      attributes: ['特征名称', '可信度', '观察时间'],
    },
    style: {
      background: '#48bb78',
      color: 'white',
      border: '2px solid #38a169',
      borderRadius: '8px',
      padding: '10px 15px',
    },
  },
  {
    id: 'concept-inference',
    type: 'default',
    position: { x: 400, y: 180 },
    data: {
      label: 'Inference（推理规则）',
      description: '基于观察进行的推理',
      level: 1,
      attributes: ['规则名称', '置信度', '推理依据'],
    },
    style: {
      background: '#ed8936',
      color: 'white',
      border: '2px solid #dd6b20',
      borderRadius: '8px',
      padding: '10px 15px',
    },
  },
  {
    id: 'concept-state',
    type: 'default',
    position: { x: 650, y: 180 },
    data: {
      label: 'InternalState（内在状态）',
      description: '无法直接观察的心理状态',
      level: 1,
      attributes: ['状态名称', '严重程度', '持续时间'],
    },
    style: {
      background: '#9f7aea',
      color: 'white',
      border: '2px solid #805ad5',
      borderRadius: '8px',
      padding: '10px 15px',
    },
  },

  // Level 2: 具体子类型
  {
    id: 'concept-body-language',
    type: 'default',
    position: { x: 50, y: 320 },
    data: {
      label: '肢体语言',
      description: 'Observable的子类型',
      level: 2,
    },
    style: {
      background: '#68d391',
      color: 'white',
      borderRadius: '6px',
      padding: '8px 12px',
      fontSize: '12px',
    },
  },
  {
    id: 'concept-verbal',
    type: 'default',
    position: { x: 250, y: 320 },
    data: {
      label: '言语特征',
      description: 'Observable的子类型',
      level: 2,
    },
    style: {
      background: '#68d391',
      color: 'white',
      borderRadius: '6px',
      padding: '8px 12px',
      fontSize: '12px',
    },
  },
  {
    id: 'concept-deception',
    type: 'default',
    position: { x: 550, y: 320 },
    data: {
      label: '欺骗倾向',
      description: 'InternalState的子类型',
      level: 2,
    },
    style: {
      background: '#b794f4',
      color: 'white',
      borderRadius: '6px',
      padding: '8px 12px',
      fontSize: '12px',
    },
  },
  {
    id: 'concept-stress',
    type: 'default',
    position: { x: 750, y: 320 },
    data: {
      label: '压力反应',
      description: 'InternalState的子类型',
      level: 2,
    },
    style: {
      background: '#b794f4',
      color: 'white',
      borderRadius: '6px',
      padding: '8px 12px',
      fontSize: '12px',
    },
  },
];

export const ontologyEdges: Edge[] = [
  // 根概念到三大核心概念
  {
    id: 'e-root-observable',
    source: 'concept-root',
    target: 'concept-observable',
    type: 'smoothstep',
    label: 'extends',
    animated: false,
    style: { stroke: '#667eea', strokeWidth: 2 },
    labelStyle: { fill: '#667eea', fontWeight: 600 },
  },
  {
    id: 'e-root-inference',
    source: 'concept-root',
    target: 'concept-inference',
    type: 'smoothstep',
    label: 'extends',
    animated: false,
    style: { stroke: '#667eea', strokeWidth: 2 },
    labelStyle: { fill: '#667eea', fontWeight: 600 },
  },
  {
    id: 'e-root-state',
    source: 'concept-root',
    target: 'concept-state',
    type: 'smoothstep',
    label: 'extends',
    animated: false,
    style: { stroke: '#667eea', strokeWidth: 2 },
    labelStyle: { fill: '#667eea', fontWeight: 600 },
  },

  // 核心概念到子类型
  {
    id: 'e-observable-body',
    source: 'concept-observable',
    target: 'concept-body-language',
    type: 'smoothstep',
    label: 'is-a',
    animated: false,
    style: { stroke: '#48bb78', strokeWidth: 2 },
    labelStyle: { fill: '#48bb78', fontWeight: 600 },
  },
  {
    id: 'e-observable-verbal',
    source: 'concept-observable',
    target: 'concept-verbal',
    type: 'smoothstep',
    label: 'is-a',
    animated: false,
    style: { stroke: '#48bb78', strokeWidth: 2 },
    labelStyle: { fill: '#48bb78', fontWeight: 600 },
  },
  {
    id: 'e-state-deception',
    source: 'concept-state',
    target: 'concept-deception',
    type: 'smoothstep',
    label: 'is-a',
    animated: false,
    style: { stroke: '#9f7aea', strokeWidth: 2 },
    labelStyle: { fill: '#9f7aea', fontWeight: 600 },
  },
  {
    id: 'e-state-stress',
    source: 'concept-state',
    target: 'concept-stress',
    type: 'smoothstep',
    label: 'is-a',
    animated: false,
    style: { stroke: '#9f7aea', strokeWidth: 2 },
    labelStyle: { fill: '#9f7aea', fontWeight: 600 },
  },
];

// ============================================================
// 2. 知识建模数据（Knowledge Modeling）
// 展示具体的知识实例和推理链
// ============================================================

export interface KnowledgeNode extends Node {
  data: {
    label: string;
    description: string;
    type: 'Observable' | 'Inference' | 'InternalState';
    confidence?: number; // 置信度
  };
}

export const knowledgeNodes: KnowledgeNode[] = [
  // Observable实例
  {
    id: 'obs-1',
    type: 'default',
    position: { x: 100, y: 100 },
    data: {
      label: '眼神飘忽',
      description: '被询问时眼神不敢直视，频繁转移视线',
      type: 'Observable',
      confidence: 0.85,
    },
    style: {
      background: '#48bb78',
      color: 'white',
      border: '2px solid #38a169',
      borderRadius: '8px',
      padding: '10px 15px',
      minWidth: '120px',
    },
  },
  {
    id: 'obs-2',
    type: 'default',
    position: { x: 100, y: 220 },
    data: {
      label: '语速加快',
      description: '回答问题时语速明显加快，显得紧张',
      type: 'Observable',
      confidence: 0.78,
    },
    style: {
      background: '#48bb78',
      color: 'white',
      border: '2px solid #38a169',
      borderRadius: '8px',
      padding: '10px 15px',
      minWidth: '120px',
    },
  },
  {
    id: 'obs-3',
    type: 'default',
    position: { x: 100, y: 340 },
    data: {
      label: '手部颤抖',
      description: '说话时手部出现轻微颤抖',
      type: 'Observable',
      confidence: 0.72,
    },
    style: {
      background: '#48bb78',
      color: 'white',
      border: '2px solid #38a169',
      borderRadius: '8px',
      padding: '10px 15px',
      minWidth: '120px',
    },
  },

  // Inference实例
  {
    id: 'inf-1',
    type: 'default',
    position: { x: 400, y: 100 },
    data: {
      label: '可能在说谎',
      description: '基于眼神和语速的综合判断',
      type: 'Inference',
      confidence: 0.75,
    },
    style: {
      background: '#ed8936',
      color: 'white',
      border: '2px solid #dd6b20',
      borderRadius: '8px',
      padding: '10px 15px',
      minWidth: '140px',
    },
  },
  {
    id: 'inf-2',
    type: 'default',
    position: { x: 400, y: 280 },
    data: {
      label: '处于高压状态',
      description: '基于生理反应的判断',
      type: 'Inference',
      confidence: 0.68,
    },
    style: {
      background: '#ed8936',
      color: 'white',
      border: '2px solid #dd6b20',
      borderRadius: '8px',
      padding: '10px 15px',
      minWidth: '140px',
    },
  },

  // InternalState实例
  {
    id: 'state-1',
    type: 'default',
    position: { x: 700, y: 100 },
    data: {
      label: '欺骗倾向',
      description: '存在隐瞒真相的倾向',
      type: 'InternalState',
      confidence: 0.70,
    },
    style: {
      background: '#9f7aea',
      color: 'white',
      border: '2px solid #805ad5',
      borderRadius: '8px',
      padding: '10px 15px',
      minWidth: '120px',
    },
  },
  {
    id: 'state-2',
    type: 'default',
    position: { x: 700, y: 280 },
    data: {
      label: '压力反应',
      description: '心理压力较大，情绪紧张',
      type: 'InternalState',
      confidence: 0.65,
    },
    style: {
      background: '#9f7aea',
      color: 'white',
      border: '2px solid #805ad5',
      borderRadius: '8px',
      padding: '10px 15px',
      minWidth: '120px',
    },
  },
];

export const knowledgeEdges: Edge[] = [
  // Observable → Inference
  {
    id: 'ke-obs1-inf1',
    source: 'obs-1',
    target: 'inf-1',
    type: 'smoothstep',
    label: 'supports (0.85)',
    animated: true,
    style: { stroke: '#48bb78', strokeWidth: 2 },
    labelStyle: { fill: '#48bb78', fontWeight: 600, fontSize: '11px' },
  },
  {
    id: 'ke-obs2-inf1',
    source: 'obs-2',
    target: 'inf-1',
    type: 'smoothstep',
    label: 'supports (0.78)',
    animated: true,
    style: { stroke: '#48bb78', strokeWidth: 2 },
    labelStyle: { fill: '#48bb78', fontWeight: 600, fontSize: '11px' },
  },
  {
    id: 'ke-obs3-inf2',
    source: 'obs-3',
    target: 'inf-2',
    type: 'smoothstep',
    label: 'supports (0.72)',
    animated: true,
    style: { stroke: '#48bb78', strokeWidth: 2 },
    labelStyle: { fill: '#48bb78', fontWeight: 600, fontSize: '11px' },
  },

  // Inference → InternalState
  {
    id: 'ke-inf1-state1',
    source: 'inf-1',
    target: 'state-1',
    type: 'smoothstep',
    label: 'infers (0.75)',
    animated: true,
    style: { stroke: '#ed8936', strokeWidth: 2 },
    labelStyle: { fill: '#ed8936', fontWeight: 600, fontSize: '11px' },
  },
  {
    id: 'ke-inf2-state2',
    source: 'inf-2',
    target: 'state-2',
    type: 'smoothstep',
    label: 'infers (0.68)',
    animated: true,
    style: { stroke: '#ed8936', strokeWidth: 2 },
    labelStyle: { fill: '#ed8936', fontWeight: 600, fontSize: '11px' },
  },

  // 交叉影响
  {
    id: 'ke-state2-state1',
    source: 'state-2',
    target: 'state-1',
    type: 'smoothstep',
    label: 'strengthens',
    animated: false,
    style: { stroke: '#9f7aea', strokeWidth: 2, strokeDasharray: '5,5' },
    labelStyle: { fill: '#9f7aea', fontWeight: 600, fontSize: '11px' },
  },
];

// ============================================================
// 3. 流程建模数据（Process Modeling）
// 展示心理分析的执行流程
// ============================================================

export interface ProcessNode extends Node {
  data: {
    label: string;
    description: string;
    type: 'start' | 'process' | 'decision' | 'end';
  };
}

export const processNodes: ProcessNode[] = [
  // 开始节点
  {
    id: 'process-start',
    type: 'input',
    position: { x: 50, y: 200 },
    data: {
      label: '开始',
      description: '启动心理分析流程',
      type: 'start',
    },
    style: {
      background: '#48bb78',
      color: 'white',
      border: '2px solid #38a169',
      borderRadius: '50%',
      padding: '20px',
      width: '80px',
      height: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
    },
  },

  // 流程节点
  {
    id: 'process-upload',
    type: 'default',
    position: { x: 200, y: 200 },
    data: {
      label: '文档上传',
      description: '上传审讯记录、对话文本等',
      type: 'process',
    },
    style: {
      background: '#4299e1',
      color: 'white',
      border: '2px solid #3182ce',
      borderRadius: '8px',
      padding: '15px 20px',
      minWidth: '120px',
    },
  },
  {
    id: 'process-extract',
    type: 'default',
    position: { x: 380, y: 200 },
    data: {
      label: '特征提取',
      description: '提取可观察特征（Observable）',
      type: 'process',
    },
    style: {
      background: '#4299e1',
      color: 'white',
      border: '2px solid #3182ce',
      borderRadius: '8px',
      padding: '15px 20px',
      minWidth: '120px',
    },
  },

  // 决策节点
  {
    id: 'process-decision',
    type: 'default',
    position: { x: 560, y: 200 },
    data: {
      label: '特征充足？',
      description: '判断提取的特征是否足够进行分析',
      type: 'decision',
    },
    style: {
      background: '#ed8936',
      color: 'white',
      border: '2px solid #dd6b20',
      borderRadius: '8px',
      padding: '15px 20px',
      minWidth: '120px',
      transform: 'rotate(45deg)',
    },
  },

  // 继续流程
  {
    id: 'process-inference',
    type: 'default',
    position: { x: 740, y: 200 },
    data: {
      label: '推理分析',
      description: '基于特征进行推理（Inference）',
      type: 'process',
    },
    style: {
      background: '#4299e1',
      color: 'white',
      border: '2px solid #3182ce',
      borderRadius: '8px',
      padding: '15px 20px',
      minWidth: '120px',
    },
  },
  {
    id: 'process-state',
    type: 'default',
    position: { x: 920, y: 200 },
    data: {
      label: '状态识别',
      description: '识别内在心理状态（InternalState）',
      type: 'process',
    },
    style: {
      background: '#4299e1',
      color: 'white',
      border: '2px solid #3182ce',
      borderRadius: '8px',
      padding: '15px 20px',
      minWidth: '120px',
    },
  },
  {
    id: 'process-report',
    type: 'default',
    position: { x: 1100, y: 200 },
    data: {
      label: '报告生成',
      description: '生成心理分析报告',
      type: 'process',
    },
    style: {
      background: '#4299e1',
      color: 'white',
      border: '2px solid #3182ce',
      borderRadius: '8px',
      padding: '15px 20px',
      minWidth: '120px',
    },
  },

  // 结束节点
  {
    id: 'process-end',
    type: 'output',
    position: { x: 1280, y: 200 },
    data: {
      label: '结束',
      description: '分析流程完成',
      type: 'end',
    },
    style: {
      background: '#9f7aea',
      color: 'white',
      border: '2px solid #805ad5',
      borderRadius: '50%',
      padding: '20px',
      width: '80px',
      height: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
    },
  },

  // 补充数据节点（决策分支）
  {
    id: 'process-supplement',
    type: 'default',
    position: { x: 560, y: 350 },
    data: {
      label: '补充数据',
      description: '需要更多观察数据',
      type: 'process',
    },
    style: {
      background: '#f6ad55',
      color: 'white',
      border: '2px solid #ed8936',
      borderRadius: '8px',
      padding: '15px 20px',
      minWidth: '120px',
    },
  },
];

export const processEdges: Edge[] = [
  // 主流程
  {
    id: 'pe-start-upload',
    source: 'process-start',
    target: 'process-upload',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#4299e1', strokeWidth: 2 },
  },
  {
    id: 'pe-upload-extract',
    source: 'process-upload',
    target: 'process-extract',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#4299e1', strokeWidth: 2 },
  },
  {
    id: 'pe-extract-decision',
    source: 'process-extract',
    target: 'process-decision',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#4299e1', strokeWidth: 2 },
  },
  {
    id: 'pe-decision-inference',
    source: 'process-decision',
    target: 'process-inference',
    type: 'smoothstep',
    label: '是',
    animated: true,
    style: { stroke: '#48bb78', strokeWidth: 2 },
    labelStyle: { fill: '#48bb78', fontWeight: 600 },
  },
  {
    id: 'pe-inference-state',
    source: 'process-inference',
    target: 'process-state',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#4299e1', strokeWidth: 2 },
  },
  {
    id: 'pe-state-report',
    source: 'process-state',
    target: 'process-report',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#4299e1', strokeWidth: 2 },
  },
  {
    id: 'pe-report-end',
    source: 'process-report',
    target: 'process-end',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#4299e1', strokeWidth: 2 },
  },

  // 决策分支（否）
  {
    id: 'pe-decision-supplement',
    source: 'process-decision',
    target: 'process-supplement',
    type: 'smoothstep',
    label: '否',
    animated: true,
    style: { stroke: '#ed8936', strokeWidth: 2 },
    labelStyle: { fill: '#ed8936', fontWeight: 600 },
  },
  {
    id: 'pe-supplement-upload',
    source: 'process-supplement',
    target: 'process-upload',
    type: 'smoothstep',
    label: '返回',
    animated: false,
    style: { stroke: '#ed8936', strokeWidth: 2, strokeDasharray: '5,5' },
    labelStyle: { fill: '#ed8936', fontWeight: 600 },
  },
];

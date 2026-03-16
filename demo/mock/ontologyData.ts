import {
  OntologyPackage,
  OntologyRelationship,
  OntologyAttribute,
  ExtendedOntologyDefinition,
  OntologyConceptType,
  OntologyPackageType,
  OntologyRelationshipType
} from '../types/index';

/**
 * 心理分析系统 - 本体建模 Mock 数据
 * 基于《建模方法论.txt》的4层架构设计
 *
 * 架构说明：
 * - Level 0: 元模型层（Meta-Model）- 定义建模语法
 * - Level 1: 上层本体（Upper Ontology）- 定义关键类目
 * - Level 2: 子域本体（Sub-domain Ontology）- 细化具体概念
 * - Level 3: 实例/知识图谱层 - 具体数据
 */

// ==================== Package 1: 元模型层（Level 0）====================

/**
 * 元模型层Package
 * 定义最基础的建模元素，为上层本体提供建模语言
 */
export const META_MODEL_PACKAGE: OntologyPackage = {
  packageId: 'PKG_META_001',
  packageName: '元模型层',
  packageType: 'meta',
  level: 0,
  description: '定义最基础的建模元素，包括实体、属性、关系、可观测、推断、动作、语境等核心概念',
  ontologies: ['META_ENTITY', 'META_OBSERVABLE', 'META_INFERENCE'],
  metadata: {
    version: '1.0.0',
    author: 'Psychology Ontology Team',
    createdAt: '2026-01-28T21:20:00Z',
    updatedAt: '2026-01-28T21:20:00Z'
  }
};

/**
 * META_ENTITY - 实体（元模型）
 * 所有可被单独引用的心理学概念的抽象
 */
export const META_ENTITY: ExtendedOntologyDefinition = {
  ontologyId: 'META_ENTITY',
  name: 'Entity（实体）',
  type: 'feature',
  version: '1.0.0',
  description: '所有可被单独引用的心理学概念：人、事件、环境、状态、量表结果、干预等',
  dimensions: [],
  conceptType: 'Entity',
  packageId: 'PKG_META_001',
  level: 0,
  attributes: [
    {
      attributeId: 'ATTR_ENTITY_001',
      attributeName: 'entityId',
      dataType: 'string',
      required: true,
      description: '实体唯一标识符'
    },
    {
      attributeId: 'ATTR_ENTITY_002',
      attributeName: 'entityType',
      dataType: 'enum',
      required: true,
      description: '实体类型',
      enumValues: ['Person', 'Event', 'Object', 'Concept', 'State']
    },
    {
      attributeId: 'ATTR_ENTITY_003',
      attributeName: 'timestamp',
      dataType: 'string',
      required: false,
      description: '实体创建或观测时间'
    }
  ],
  relationships: [
    {
      relationshipId: 'REL_META_001',
      relationshipType: 'HAS_A',
      sourceConceptId: 'META_ENTITY',
      targetConceptId: 'META_OBSERVABLE',
      direction: 'outgoing',
      cardinality: '1:N',
      description: '实体可以有多个可观测属性'
    }
  ],
  constraints: ['entityId必须唯一', 'entityType必须是预定义的枚举值之一'],
  examples: ['张三（Person类型的实体）', '审讯事件（Event类型的实体）', '焦虑状态（State类型的实体）'],
  tags: ['元模型', '基础', '抽象']
};

/**
 * META_OBSERVABLE - 可观测（元模型）
 * 通过感知/传感器/量表可直接得到的数据
 */
export const META_OBSERVABLE: ExtendedOntologyDefinition = {
  ontologyId: 'META_OBSERVABLE',
  name: 'Observable（可观测）',
  type: 'feature',
  version: '1.0.0',
  description: '一类特殊实体，强调"通过感知/传感器/量表可直接得到的数据"，对应Cybox/STIX中的Observable Objects',
  dimensions: [],
  conceptType: 'Observable',
  packageId: 'PKG_META_001',
  level: 0,
  attributes: [
    {
      attributeId: 'ATTR_OBS_001',
      attributeName: 'observationType',
      dataType: 'enum',
      required: true,
      description: '观测类型',
      enumValues: ['语言', '行为', '生理', '环境', '表情']
    },
    {
      attributeId: 'ATTR_OBS_002',
      attributeName: 'observationMethod',
      dataType: 'string',
      required: true,
      description: '观测方法（如：直接观察、传感器、量表测量）'
    },
    {
      attributeId: 'ATTR_OBS_003',
      attributeName: 'reliability',
      dataType: 'number',
      required: true,
      description: '可靠性评分（0-1）',
      validation: { min: 0, max: 1 }
    }
  ],
  relationships: [
    {
      relationshipId: 'REL_META_002',
      relationshipType: 'EVIDENCE_OF',
      sourceConceptId: 'META_OBSERVABLE',
      targetConceptId: 'META_INFERENCE',
      direction: 'outgoing',
      cardinality: 'N:N',
      description: '可观测数据可以作为推断的证据'
    }
  ],
  constraints: ['reliability必须在0-1之间', 'observationType必须是预定义的枚举值'],
  examples: ['语速加快（语言类可观测）', '回避眼神接触（行为类可观测）', '心率升高（生理类可观测）'],
  tags: ['元模型', '可观测', '证据']
};

/**
 * META_INFERENCE - 推断（元模型）
 * 从一组Observable推断出某种心理状态/意图，并带有置信度
 */
export const META_INFERENCE: ExtendedOntologyDefinition = {
  ontologyId: 'META_INFERENCE',
  name: 'Inference（推断）',
  type: 'rule',
  version: '1.0.0',
  description: '一类逻辑实体：从一组Observable推断出某种PsychologicalState/Intention，并带有置信度',
  dimensions: [],
  conceptType: 'Inference',
  packageId: 'PKG_META_001',
  level: 0,
  attributes: [
    {
      attributeId: 'ATTR_INF_001',
      attributeName: 'inferenceMethod',
      dataType: 'enum',
      required: true,
      description: '推断方法',
      enumValues: ['规则推理', '统计推理', '机器学习', '专家判断', '知识图谱推理']
    },
    {
      attributeId: 'ATTR_INF_002',
      attributeName: 'confidence',
      dataType: 'number',
      required: true,
      description: '置信度（0-1）',
      validation: { min: 0, max: 1 }
    },
    {
      attributeId: 'ATTR_INF_003',
      attributeName: 'supportingEvidence',
      dataType: 'array',
      required: true,
      description: '支持证据ID列表'
    }
  ],
  relationships: [
    {
      relationshipId: 'REL_META_003',
      relationshipType: 'TRIGGERED_BY',
      sourceConceptId: 'META_INFERENCE',
      targetConceptId: 'META_OBSERVABLE',
      direction: 'incoming',
      cardinality: 'N:N',
      description: '推断由可观测数据触发'
    }
  ],
  constraints: ['confidence必须在0-1之间', '至少需要1个supportingEvidence'],
  examples: ['基于语速加快和回避眼神推断出焦虑状态', '基于多个矛盾陈述推断出记忆扭曲'],
  tags: ['元模型', '推断', '推理']
};

// ==================== Package 2: 上层本体层（Level 1）====================

/**
 * 上层本体层Package
 * 定义心理分析的核心领域概念
 */
export const UPPER_ONTOLOGY_PACKAGE: OntologyPackage = {
  packageId: 'PKG_UPPER_001',
  packageName: '心理分析上层本体',
  packageType: 'upper',
  level: 1,
  description: '定义心理分析的核心领域概念，包括人物、可观察状态、内在状态、证据、事件、行为等',
  ontologies: ['UPPER_PERSON', 'UPPER_OBSERVABLE_STATE', 'UPPER_INTERNAL_STATE', 'UPPER_EVIDENCE', 'UPPER_EVENT', 'UPPER_ACTION'],
  metadata: {
    version: '1.0.0',
    author: 'Psychology Ontology Team',
    createdAt: '2026-01-28T21:20:00Z',
    updatedAt: '2026-01-28T21:20:00Z'
  }
};

/**
 * UPPER_PERSON - 人物（上层本体）
 * 分析的核心主体，具有心理状态和行为模式
 */
export const UPPER_PERSON: ExtendedOntologyDefinition = {
  ontologyId: 'UPPER_PERSON',
  name: 'Person（人物）',
  type: 'feature',
  version: '1.0.0',
  description: '分析的核心主体，具有心理状态和行为模式，承载长期不变信息以及与其相关的所有状态、事件',
  dimensions: [],
  conceptType: 'Entity',
  parentConceptId: 'META_ENTITY',
  packageId: 'PKG_UPPER_001',
  level: 1,
  attributes: [
    {
      attributeId: 'ATTR_PERSON_001',
      attributeName: 'personId',
      dataType: 'string',
      required: true,
      description: '人物唯一标识'
    },
    {
      attributeId: 'ATTR_PERSON_002',
      attributeName: 'role',
      dataType: 'enum',
      required: true,
      description: '人物角色',
      enumValues: ['嫌疑人', '证人', '受害者', '分析对象', '其他']
    },
    {
      attributeId: 'ATTR_PERSON_003',
      attributeName: 'demographicInfo',
      dataType: 'object',
      required: false,
      description: '人口统计学信息（年龄、性别、教育、职业等）'
    },
    {
      attributeId: 'ATTR_PERSON_004',
      attributeName: 'psychologicalProfile',
      dataType: 'object',
      required: false,
      description: '心理画像（人格特质、认知风格等）'
    }
  ],
  relationships: [
    {
      relationshipId: 'REL_UPPER_001',
      relationshipType: 'HAS_A',
      sourceConceptId: 'UPPER_PERSON',
      targetConceptId: 'UPPER_OBSERVABLE_STATE',
      direction: 'outgoing',
      cardinality: '1:N',
      description: '人物具有可观察状态'
    },
    {
      relationshipId: 'REL_UPPER_002',
      relationshipType: 'HAS_A',
      sourceConceptId: 'UPPER_PERSON',
      targetConceptId: 'UPPER_INTERNAL_STATE',
      direction: 'outgoing',
      cardinality: '1:N',
      description: '人物具有内在心理状态'
    }
  ],
  constraints: ['personId必须唯一', 'role必须是预定义的枚举值之一'],
  examples: ['嫌疑人张三', '证人李四', '受害者王某'],
  tags: ['上层本体', '人物', '主体']
};

/**
 * UPPER_OBSERVABLE_STATE - 可观察状态（上层本体）
 * 可以直接观测到的外在表现，对应报告中的ObservableFeature
 */
export const UPPER_OBSERVABLE_STATE: ExtendedOntologyDefinition = {
  ontologyId: 'UPPER_OBSERVABLE_STATE',
  name: 'ObservableState（可观察状态）',
  type: 'feature',
  version: '1.0.0',
  description: '可以直接观测到的外在表现：语言特征、行为模式、生理反应、表情变化等',
  dimensions: [],
  conceptType: 'Observable',
  parentConceptId: 'META_OBSERVABLE',
  packageId: 'PKG_UPPER_001',
  level: 1,
  attributes: [
    {
      attributeId: 'ATTR_OBS_STATE_001',
      attributeName: 'stateId',
      dataType: 'string',
      required: true,
      description: '可观察状态唯一标识'
    },
    {
      attributeId: 'ATTR_OBS_STATE_002',
      attributeName: 'category',
      dataType: 'enum',
      required: true,
      description: '观察类别',
      enumValues: ['语言特征', '行为模式', '生理反应', '表情变化', '环境因素']
    },
    {
      attributeId: 'ATTR_OBS_STATE_003',
      attributeName: 'value',
      dataType: 'string',
      required: true,
      description: '观察到的具体值或描述'
    },
    {
      attributeId: 'ATTR_OBS_STATE_004',
      attributeName: 'confidence',
      dataType: 'number',
      required: true,
      description: '观察置信度（0-1）',
      validation: { min: 0, max: 1 }
    },
    {
      attributeId: 'ATTR_OBS_STATE_005',
      attributeName: 'timestamp',
      dataType: 'string',
      required: false,
      description: '观察时间点'
    }
  ],
  relationships: [
    {
      relationshipId: 'REL_UPPER_003',
      relationshipType: 'EVIDENCE_OF',
      sourceConceptId: 'UPPER_OBSERVABLE_STATE',
      targetConceptId: 'UPPER_INTERNAL_STATE',
      direction: 'outgoing',
      cardinality: 'N:N',
      description: '可观察状态是内在心理状态的证据'
    },
    {
      relationshipId: 'REL_UPPER_004',
      relationshipType: 'SUPPORTS',
      sourceConceptId: 'UPPER_OBSERVABLE_STATE',
      targetConceptId: 'UPPER_EVIDENCE',
      direction: 'incoming',
      cardinality: 'N:N',
      description: '证据支撑可观察状态'
    }
  ],
  constraints: ['confidence必须在0-1之间', 'category必须是预定义的枚举值之一'],
  examples: ['语速加快（语言特征）', '回避眼神接触（行为模式）', '心率升高（生理反应）'],
  tags: ['上层本体', '可观察', '表征']
};

/**
 * UPPER_INTERNAL_STATE - 内在心理状态（上层本体）
 * 从可观察状态推断出的内在心理状态，对应报告中的InternalState
 */
export const UPPER_INTERNAL_STATE: ExtendedOntologyDefinition = {
  ontologyId: 'UPPER_INTERNAL_STATE',
  name: 'InternalState（内在心理状态）',
  type: 'psychology',
  version: '1.0.0',
  description: '从可观察状态推断出的内在心理状态：情绪、认知、动机、人格特质等',
  dimensions: [],
  conceptType: 'Inference',
  parentConceptId: 'META_INFERENCE',
  packageId: 'PKG_UPPER_001',
  level: 1,
  attributes: [
    {
      attributeId: 'ATTR_INT_STATE_001',
      attributeName: 'stateId',
      dataType: 'string',
      required: true,
      description: '内在状态唯一标识'
    },
    {
      attributeId: 'ATTR_INT_STATE_002',
      attributeName: 'stateName',
      dataType: 'string',
      required: true,
      description: '状态名称（如：焦虑、压力、欺骗倾向）'
    },
    {
      attributeId: 'ATTR_INT_STATE_003',
      attributeName: 'category',
      dataType: 'enum',
      required: true,
      description: '状态类别',
      enumValues: ['情绪状态', '认知状态', '动机状态', '人格特质', '心理防御']
    },
    {
      attributeId: 'ATTR_INT_STATE_004',
      attributeName: 'intensity',
      dataType: 'enum',
      required: true,
      description: '强度等级',
      enumValues: ['低', '中', '高', '极高']
    },
    {
      attributeId: 'ATTR_INT_STATE_005',
      attributeName: 'confidence',
      dataType: 'number',
      required: true,
      description: '推断置信度（0-1）',
      validation: { min: 0, max: 1 }
    },
    {
      attributeId: 'ATTR_INT_STATE_006',
      attributeName: 'description',
      dataType: 'string',
      required: true,
      description: '状态详细描述'
    }
  ],
  relationships: [
    {
      relationshipId: 'REL_UPPER_005',
      relationshipType: 'MANIFESTS_AS',
      sourceConceptId: 'UPPER_INTERNAL_STATE',
      targetConceptId: 'UPPER_OBSERVABLE_STATE',
      direction: 'outgoing',
      cardinality: '1:N',
      description: '内在状态表现为可观察状态'
    },
    {
      relationshipId: 'REL_UPPER_006',
      relationshipType: 'TRIGGERED_BY',
      sourceConceptId: 'UPPER_INTERNAL_STATE',
      targetConceptId: 'UPPER_EVENT',
      direction: 'incoming',
      cardinality: 'N:N',
      description: '内在状态被事件触发'
    },
    {
      relationshipId: 'REL_UPPER_007',
      relationshipType: 'INFLUENCES',
      sourceConceptId: 'UPPER_INTERNAL_STATE',
      targetConceptId: 'UPPER_ACTION',
      direction: 'outgoing',
      cardinality: 'N:N',
      description: '内在状态影响行为动作'
    }
  ],
  constraints: ['confidence必须在0-1之间', 'intensity必须是预定义的枚举值之一'],
  examples: ['焦虑状态（情绪状态，高强度）', '记忆扭曲（认知状态，中强度）', '欺骗动机（动机状态，高强度）'],
  tags: ['上层本体', '内在状态', '推断']
};

/**
 * UPPER_EVIDENCE - 证据（上层本体）
 * 支撑分析的原子证据单元，对应报告中的Evidence
 */
export const UPPER_EVIDENCE: ExtendedOntologyDefinition = {
  ontologyId: 'UPPER_EVIDENCE',
  name: 'Evidence（证据）',
  type: 'feature',
  version: '1.0.0',
  description: '支撑分析的原子证据单元：对话记录、图片、文档片段、行为观察、生理数据等',
  dimensions: [],
  conceptType: 'Observable',
  parentConceptId: 'META_OBSERVABLE',
  packageId: 'PKG_UPPER_001',
  level: 1,
  attributes: [
    {
      attributeId: 'ATTR_EVIDENCE_001',
      attributeName: 'evidenceId',
      dataType: 'string',
      required: true,
      description: '证据唯一标识'
    },
    {
      attributeId: 'ATTR_EVIDENCE_002',
      attributeName: 'evidenceType',
      dataType: 'enum',
      required: true,
      description: '证据类型',
      enumValues: ['dialogue', 'image', 'document', 'behavior', 'physiological']
    },
    {
      attributeId: 'ATTR_EVIDENCE_003',
      attributeName: 'content',
      dataType: 'string',
      required: true,
      description: '证据内容或摘要'
    },
    {
      attributeId: 'ATTR_EVIDENCE_004',
      attributeName: 'source',
      dataType: 'string',
      required: true,
      description: '证据来源（如：审讯笔录.pdf - 第15轮）'
    },
    {
      attributeId: 'ATTR_EVIDENCE_005',
      attributeName: 'reliability',
      dataType: 'number',
      required: true,
      description: '证据可靠性（0-1）',
      validation: { min: 0, max: 1 }
    },
    {
      attributeId: 'ATTR_EVIDENCE_006',
      attributeName: 'timestamp',
      dataType: 'string',
      required: false,
      description: '证据时间戳'
    }
  ],
  relationships: [
    {
      relationshipId: 'REL_UPPER_008',
      relationshipType: 'SUPPORTS',
      sourceConceptId: 'UPPER_EVIDENCE',
      targetConceptId: 'UPPER_OBSERVABLE_STATE',
      direction: 'outgoing',
      cardinality: 'N:N',
      description: '证据支撑可观察状态'
    },
    {
      relationshipId: 'REL_UPPER_009',
      relationshipType: 'ASSOCIATED_WITH',
      sourceConceptId: 'UPPER_EVIDENCE',
      targetConceptId: 'UPPER_EVENT',
      direction: 'bidirectional',
      cardinality: 'N:N',
      description: '证据与事件相关联'
    },
    {
      relationshipId: 'REL_UPPER_010',
      relationshipType: 'PART_OF',
      sourceConceptId: 'UPPER_EVIDENCE',
      targetConceptId: 'UPPER_PERSON',
      direction: 'outgoing',
      cardinality: 'N:1',
      description: '证据属于特定人物的分析'
    }
  ],
  constraints: ['reliability必须在0-1之间', 'evidenceType必须是预定义的枚举值之一'],
  examples: ['审讯对话："我当时不在现场"', '监控图片：回避眼神接触', '心率数据：基线心率升高15%'],
  tags: ['上层本体', '证据', '原子单元']
};

/**
 * UPPER_EVENT - 事件（上层本体）
 * 触发心理状态或行为的事件或情境
 */
export const UPPER_EVENT: ExtendedOntologyDefinition = {
  ontologyId: 'UPPER_EVENT',
  name: 'Event（事件）',
  type: 'feature',
  version: '1.0.0',
  description: '触发心理状态或行为的事件或情境：审讯轮次、关键对话、突发事件等',
  dimensions: [],
  conceptType: 'Entity',
  parentConceptId: 'META_ENTITY',
  packageId: 'PKG_UPPER_001',
  level: 1,
  attributes: [
    {
      attributeId: 'ATTR_EVENT_001',
      attributeName: 'eventId',
      dataType: 'string',
      required: true,
      description: '事件唯一标识'
    },
    {
      attributeId: 'ATTR_EVENT_002',
      attributeName: 'eventName',
      dataType: 'string',
      required: true,
      description: '事件名称'
    },
    {
      attributeId: 'ATTR_EVENT_003',
      attributeName: 'eventType',
      dataType: 'enum',
      required: true,
      description: '事件类型',
      enumValues: ['审讯轮次', '关键对话', '突发事件', '环境变化', '互动行为']
    },
    {
      attributeId: 'ATTR_EVENT_004',
      attributeName: 'description',
      dataType: 'string',
      required: true,
      description: '事件描述'
    },
    {
      attributeId: 'ATTR_EVENT_005',
      attributeName: 'timestamp',
      dataType: 'string',
      required: false,
      description: '事件发生时间'
    },
    {
      attributeId: 'ATTR_EVENT_006',
      attributeName: 'participants',
      dataType: 'array',
      required: false,
      description: '参与者ID列表'
    }
  ],
  relationships: [
    {
      relationshipId: 'REL_UPPER_011',
      relationshipType: 'TRIGGERED_BY',
      sourceConceptId: 'UPPER_INTERNAL_STATE',
      targetConceptId: 'UPPER_EVENT',
      direction: 'incoming',
      cardinality: 'N:N',
      description: '内在状态被事件触发（反向关系）'
    },
    {
      relationshipId: 'REL_UPPER_012',
      relationshipType: 'ASSOCIATED_WITH',
      sourceConceptId: 'UPPER_EVENT',
      targetConceptId: 'UPPER_EVIDENCE',
      direction: 'bidirectional',
      cardinality: 'N:N',
      description: '事件与证据相关联'
    },
    {
      relationshipId: 'REL_UPPER_013',
      relationshipType: 'PART_OF',
      sourceConceptId: 'UPPER_EVENT',
      targetConceptId: 'UPPER_PERSON',
      direction: 'outgoing',
      cardinality: 'N:1',
      description: '事件属于特定人物的生命历程'
    }
  ],
  constraints: ['eventType必须是预定义的枚举值之一'],
  examples: ['第15轮审讯', '关键证据出示时刻', '嫌疑人情绪崩溃事件'],
  tags: ['上层本体', '事件', '触发器']
};

/**
 * UPPER_ACTION - 动作/干预（上层本体）
 * 基于心理分析结果的干预措施或行为建议
 */
export const UPPER_ACTION: ExtendedOntologyDefinition = {
  ontologyId: 'UPPER_ACTION',
  name: 'Action（动作/干预）',
  type: 'rule',
  version: '1.0.0',
  description: '基于心理分析结果的干预措施或行为建议：审讯策略、风险预警、干预方案等',
  dimensions: [],
  conceptType: 'Action',
  parentConceptId: 'META_ENTITY',
  packageId: 'PKG_UPPER_001',
  level: 1,
  attributes: [
    {
      attributeId: 'ATTR_ACTION_001',
      attributeName: 'actionId',
      dataType: 'string',
      required: true,
      description: '动作唯一标识'
    },
    {
      attributeId: 'ATTR_ACTION_002',
      attributeName: 'actionName',
      dataType: 'string',
      required: true,
      description: '动作名称'
    },
    {
      attributeId: 'ATTR_ACTION_003',
      attributeName: 'actionType',
      dataType: 'enum',
      required: true,
      description: '动作类型',
      enumValues: ['审讯策略', '风险预警', '干预方案', '行为建议', '监控措施']
    },
    {
      attributeId: 'ATTR_ACTION_004',
      attributeName: 'description',
      dataType: 'string',
      required: true,
      description: '动作详细描述'
    },
    {
      attributeId: 'ATTR_ACTION_005',
      attributeName: 'targetPersonId',
      dataType: 'string',
      required: false,
      description: '目标人物ID'
    },
    {
      attributeId: 'ATTR_ACTION_006',
      attributeName: 'expectedOutcome',
      dataType: 'string',
      required: false,
      description: '预期效果'
    }
  ],
  relationships: [
    {
      relationshipId: 'REL_UPPER_014',
      relationshipType: 'TRIGGERED_BY',
      sourceConceptId: 'UPPER_ACTION',
      targetConceptId: 'UPPER_INTERNAL_STATE',
      direction: 'incoming',
      cardinality: 'N:N',
      description: '动作由内在状态触发'
    },
    {
      relationshipId: 'REL_UPPER_015',
      relationshipType: 'INFLUENCES',
      sourceConceptId: 'UPPER_ACTION',
      targetConceptId: 'UPPER_PERSON',
      direction: 'outgoing',
      cardinality: 'N:1',
      description: '动作影响目标人物'
    }
  ],
  constraints: ['actionType必须是预定义的枚举值之一'],
  examples: ['采用共情式审讯策略', '启动自杀风险预警', '建议心理干预方案'],
  tags: ['上层本体', '动作', '干预']
};

// ==================== Package 3: 认知心理学子域本体（Level 2）====================

/**
 * 认知心理学子域本体Package
 * 细化认知过程相关的具体概念
 */
export const COGNITIVE_PSYCHOLOGY_PACKAGE: OntologyPackage = {
  packageId: 'PKG_COGNITIVE_001',
  packageName: '认知心理学子域本体',
  packageType: 'psychology',
  level: 2,
  description: '细化认知过程相关的具体概念，包括记忆、注意、决策、信息加工等',
  ontologies: ['COGNITIVE_MEMORY_DISTORTION', 'COGNITIVE_BIAS', 'COGNITIVE_ATTENTION', 'COGNITIVE_DECISION', 'COGNITIVE_INFO_PROCESSING'],
  metadata: {
    version: '1.0.0',
    author: 'Psychology Ontology Team',
    createdAt: '2026-01-28T21:20:00Z',
    updatedAt: '2026-01-28T21:20:00Z'
  }
};

/**
 * COGNITIVE_MEMORY_DISTORTION - 记忆扭曲（认知心理学）
 * 记忆的不准确或改变，常见于审讯分析中
 */
export const COGNITIVE_MEMORY_DISTORTION: ExtendedOntologyDefinition = {
  ontologyId: 'COGNITIVE_MEMORY_DISTORTION',
  name: 'MemoryDistortion（记忆扭曲）',
  type: 'psychology',
  version: '1.0.0',
  description: '记忆的不准确、遗忘或改变，可能由压力、时间流逝、暗示等因素导致',
  dimensions: [],
  conceptType: 'Inference',
  parentConceptId: 'UPPER_INTERNAL_STATE',
  packageId: 'PKG_COGNITIVE_001',
  level: 2,
  attributes: [
    {
      attributeId: 'ATTR_MEM_DIST_001',
      attributeName: 'distortionType',
      dataType: 'enum',
      required: true,
      description: '扭曲类型',
      enumValues: ['遗忘', '虚构', '混淆', '时间错位', '细节改变']
    },
    {
      attributeId: 'ATTR_MEM_DIST_002',
      attributeName: 'severity',
      dataType: 'enum',
      required: true,
      description: '严重程度',
      enumValues: ['轻微', '中度', '严重']
    },
    {
      attributeId: 'ATTR_MEM_DIST_003',
      attributeName: 'possibleCause',
      dataType: 'string',
      required: false,
      description: '可能原因（如：压力、时间流逝、暗示）'
    }
  ],
  relationships: [
    {
      relationshipId: 'REL_COGNITIVE_001',
      relationshipType: 'MANIFESTS_AS',
      sourceConceptId: 'COGNITIVE_MEMORY_DISTORTION',
      targetConceptId: 'UPPER_OBSERVABLE_STATE',
      direction: 'outgoing',
      cardinality: '1:N',
      description: '记忆扭曲表现为叙述不一致、时间线混乱等可观察状态'
    },
    {
      relationshipId: 'REL_COGNITIVE_002',
      relationshipType: 'IS_A',
      sourceConceptId: 'COGNITIVE_MEMORY_DISTORTION',
      targetConceptId: 'UPPER_INTERNAL_STATE',
      direction: 'outgoing',
      cardinality: 'N:1',
      description: '记忆扭曲是一种内在认知状态'
    }
  ],
  constraints: ['distortionType和severity必须是预定义的枚举值'],
  examples: ['对案发时间的记忆前后矛盾', '虚构不存在的细节', '混淆不同事件的顺序'],
  tags: ['认知心理学', '记忆', '扭曲']
};

/**
 * COGNITIVE_BIAS - 认知偏差（认知心理学）
 * 系统性的判断偏差，影响决策和推理
 */
export const COGNITIVE_BIAS: ExtendedOntologyDefinition = {
  ontologyId: 'COGNITIVE_BIAS',
  name: 'CognitiveBias（认知偏差）',
  type: 'psychology',
  version: '1.0.0',
  description: '系统性的判断偏差，如确认偏差、锚定效应、可得性启发等',
  dimensions: [],
  conceptType: 'Inference',
  parentConceptId: 'UPPER_INTERNAL_STATE',
  packageId: 'PKG_COGNITIVE_001',
  level: 2,
  attributes: [
    {
      attributeId: 'ATTR_BIAS_001',
      attributeName: 'biasType',
      dataType: 'enum',
      required: true,
      description: '偏差类型',
      enumValues: ['确认偏差', '锚定效应', '可得性启发', '代表性启发', '自利偏差']
    },
    {
      attributeId: 'ATTR_BIAS_002',
      attributeName: 'impactLevel',
      dataType: 'enum',
      required: true,
      description: '影响程度',
      enumValues: ['低', '中', '高']
    },
    {
      attributeId: 'ATTR_BIAS_003',
      attributeName: 'manifestation',
      dataType: 'string',
      required: true,
      description: '具体表现形式'
    }
  ],
  relationships: [
    {
      relationshipId: 'REL_COGNITIVE_003',
      relationshipType: 'IS_A',
      sourceConceptId: 'COGNITIVE_BIAS',
      targetConceptId: 'UPPER_INTERNAL_STATE',
      direction: 'outgoing',
      cardinality: 'N:1',
      description: '认知偏差是一种内在认知状态'
    },
    {
      relationshipId: 'REL_COGNITIVE_004',
      relationshipType: 'INFLUENCES',
      sourceConceptId: 'COGNITIVE_BIAS',
      targetConceptId: 'COGNITIVE_DECISION',
      direction: 'outgoing',
      cardinality: 'N:N',
      description: '认知偏差影响决策过程'
    },
    {
      relationshipId: 'REL_COGNITIVE_005',
      relationshipType: 'MANIFESTS_AS',
      sourceConceptId: 'COGNITIVE_BIAS',
      targetConceptId: 'UPPER_OBSERVABLE_STATE',
      direction: 'outgoing',
      cardinality: '1:N',
      description: '认知偏差表现为特定的语言或行为模式'
    }
  ],
  constraints: ['biasType和impactLevel必须是预定义的枚举值'],
  examples: ['只关注支持自己观点的证据（确认偏差）', '过度依赖第一印象（锚定效应）'],
  tags: ['认知心理学', '偏差', '判断']
};

/**
 * COGNITIVE_ATTENTION - 注意模式（认知心理学）
 * 注意力的分配、选择和维持模式
 */
export const COGNITIVE_ATTENTION: ExtendedOntologyDefinition = {
  ontologyId: 'COGNITIVE_ATTENTION',
  name: 'AttentionPattern（注意模式）',
  type: 'psychology',
  version: '1.0.0',
  description: '注意力的分配、选择和维持模式，包括选择性注意、分散注意、持续注意等',
  dimensions: [],
  conceptType: 'Inference',
  parentConceptId: 'UPPER_INTERNAL_STATE',
  packageId: 'PKG_COGNITIVE_001',
  level: 2,
  attributes: [
    {
      attributeId: 'ATTR_ATTENTION_001',
      attributeName: 'attentionType',
      dataType: 'enum',
      required: true,
      description: '注意类型',
      enumValues: ['选择性注意', '分散注意', '持续注意', '注意转移', '注意缺陷']
    },
    {
      attributeId: 'ATTR_ATTENTION_002',
      attributeName: 'focusTarget',
      dataType: 'string',
      required: false,
      description: '注意焦点对象'
    },
    {
      attributeId: 'ATTR_ATTENTION_003',
      attributeName: 'intensity',
      dataType: 'enum',
      required: true,
      description: '注意强度',
      enumValues: ['低', '中', '高']
    }
  ],
  relationships: [
    {
      relationshipId: 'REL_COGNITIVE_006',
      relationshipType: 'IS_A',
      sourceConceptId: 'COGNITIVE_ATTENTION',
      targetConceptId: 'UPPER_INTERNAL_STATE',
      direction: 'outgoing',
      cardinality: 'N:1',
      description: '注意模式是一种内在认知状态'
    },
    {
      relationshipId: 'REL_COGNITIVE_007',
      relationshipType: 'INFLUENCES',
      sourceConceptId: 'COGNITIVE_ATTENTION',
      targetConceptId: 'COGNITIVE_INFO_PROCESSING',
      direction: 'outgoing',
      cardinality: 'N:N',
      description: '注意模式影响信息加工过程'
    },
    {
      relationshipId: 'REL_COGNITIVE_008',
      relationshipType: 'MANIFESTS_AS',
      sourceConceptId: 'COGNITIVE_ATTENTION',
      targetConceptId: 'UPPER_OBSERVABLE_STATE',
      direction: 'outgoing',
      cardinality: '1:N',
      description: '注意模式表现为眼神、反应时间等可观察行为'
    }
  ],
  constraints: ['attentionType和intensity必须是预定义的枚举值'],
  examples: ['对特定话题的选择性关注', '注意力分散无法集中', '对敏感问题的注意回避'],
  tags: ['认知心理学', '注意', '认知资源']
};

/**
 * COGNITIVE_DECISION - 决策过程（认知心理学）
 * 决策的模式、质量和影响因素
 */
export const COGNITIVE_DECISION: ExtendedOntologyDefinition = {
  ontologyId: 'COGNITIVE_DECISION',
  name: 'DecisionMaking（决策过程）',
  type: 'psychology',
  version: '1.0.0',
  description: '决策的模式、质量和影响因素，包括理性决策、直觉决策、冲动决策等',
  dimensions: [],
  conceptType: 'Inference',
  parentConceptId: 'UPPER_INTERNAL_STATE',
  packageId: 'PKG_COGNITIVE_001',
  level: 2,
  attributes: [
    {
      attributeId: 'ATTR_DECISION_001',
      attributeName: 'decisionType',
      dataType: 'enum',
      required: true,
      description: '决策类型',
      enumValues: ['理性决策', '直觉决策', '冲动决策', '回避决策', '延迟决策']
    },
    {
      attributeId: 'ATTR_DECISION_002',
      attributeName: 'decisionQuality',
      dataType: 'enum',
      required: true,
      description: '决策质量',
      enumValues: ['优', '良', '中', '差']
    },
    {
      attributeId: 'ATTR_DECISION_003',
      attributeName: 'influencingFactors',
      dataType: 'array',
      required: false,
      description: '影响因素列表（如：情绪、压力、认知偏差）'
    }
  ],
  relationships: [
    {
      relationshipId: 'REL_COGNITIVE_009',
      relationshipType: 'IS_A',
      sourceConceptId: 'COGNITIVE_DECISION',
      targetConceptId: 'UPPER_INTERNAL_STATE',
      direction: 'outgoing',
      cardinality: 'N:1',
      description: '决策过程是一种内在认知状态'
    },
    {
      relationshipId: 'REL_COGNITIVE_010',
      relationshipType: 'TRIGGERED_BY',
      sourceConceptId: 'COGNITIVE_DECISION',
      targetConceptId: 'COGNITIVE_BIAS',
      direction: 'incoming',
      cardinality: 'N:N',
      description: '决策过程受认知偏差影响'
    },
    {
      relationshipId: 'REL_COGNITIVE_011',
      relationshipType: 'INFLUENCES',
      sourceConceptId: 'COGNITIVE_DECISION',
      targetConceptId: 'UPPER_ACTION',
      direction: 'outgoing',
      cardinality: 'N:N',
      description: '决策过程影响行为动作'
    }
  ],
  constraints: ['decisionType和decisionQuality必须是预定义的枚举值'],
  examples: ['在压力下做出冲动决策', '基于直觉判断嫌疑人', '理性权衡证据后的决策'],
  tags: ['认知心理学', '决策', '判断']
};

/**
 * COGNITIVE_INFO_PROCESSING - 信息加工（认知心理学）
 * 信息处理的模式、速度和深度
 */
export const COGNITIVE_INFO_PROCESSING: ExtendedOntologyDefinition = {
  ontologyId: 'COGNITIVE_INFO_PROCESSING',
  name: 'InformationProcessing（信息加工）',
  type: 'psychology',
  version: '1.0.0',
  description: '信息处理的模式、速度和深度，包括串行加工、并行加工、自上而下加工等',
  dimensions: [],
  conceptType: 'Inference',
  parentConceptId: 'UPPER_INTERNAL_STATE',
  packageId: 'PKG_COGNITIVE_001',
  level: 2,
  attributes: [
    {
      attributeId: 'ATTR_INFO_PROC_001',
      attributeName: 'processingType',
      dataType: 'enum',
      required: true,
      description: '加工类型',
      enumValues: ['串行加工', '并行加工', '自上而下', '自下而上', '自动化加工']
    },
    {
      attributeId: 'ATTR_INFO_PROC_002',
      attributeName: 'processingSpeed',
      dataType: 'enum',
      required: true,
      description: '加工速度',
      enumValues: ['快速', '正常', '缓慢']
    },
    {
      attributeId: 'ATTR_INFO_PROC_003',
      attributeName: 'processingDepth',
      dataType: 'enum',
      required: true,
      description: '加工深度',
      enumValues: ['浅层', '中层', '深层']
    }
  ],
  relationships: [
    {
      relationshipId: 'REL_COGNITIVE_012',
      relationshipType: 'IS_A',
      sourceConceptId: 'COGNITIVE_INFO_PROCESSING',
      targetConceptId: 'UPPER_INTERNAL_STATE',
      direction: 'outgoing',
      cardinality: 'N:1',
      description: '信息加工是一种内在认知状态'
    },
    {
      relationshipId: 'REL_COGNITIVE_013',
      relationshipType: 'TRIGGERED_BY',
      sourceConceptId: 'COGNITIVE_INFO_PROCESSING',
      targetConceptId: 'COGNITIVE_ATTENTION',
      direction: 'incoming',
      cardinality: 'N:N',
      description: '信息加工受注意模式影响'
    },
    {
      relationshipId: 'REL_COGNITIVE_014',
      relationshipType: 'INFLUENCES',
      sourceConceptId: 'COGNITIVE_INFO_PROCESSING',
      targetConceptId: 'COGNITIVE_DECISION',
      direction: 'outgoing',
      cardinality: 'N:N',
      description: '信息加工影响决策过程'
    }
  ],
  constraints: ['processingType、processingSpeed和processingDepth必须是预定义的枚举值'],
  examples: ['快速浅层加工导致忽略细节', '深层加工发现逻辑矛盾', '自动化加工导致习惯性反应'],
  tags: ['认知心理学', '信息加工', '认知过程']
};

// ==================== Package 4: 司法审讯领域本体（Level 2）====================

/**
 * 司法审讯领域本体Package
 * 细化审讯分析相关的具体概念
 */
export const FORENSIC_INTERROGATION_PACKAGE: OntologyPackage = {
  packageId: 'PKG_FORENSIC_001',
  packageName: '司法审讯领域本体',
  packageType: 'domain',
  level: 2,
  description: '细化审讯分析相关的具体概念，包括欺骗检测、审讯策略、压力反应、供述行为等',
  ontologies: ['FORENSIC_DECEPTION', 'FORENSIC_INTERROGATION_STRATEGY', 'FORENSIC_STRESS_RESPONSE', 'FORENSIC_CONFESSION'],
  metadata: {
    version: '1.0.0',
    author: 'Psychology Ontology Team',
    createdAt: '2026-01-28T21:20:00Z',
    updatedAt: '2026-01-28T21:20:00Z'
  }
};

/**
 * FORENSIC_DECEPTION - 欺骗检测（司法审讯）
 * 识别和分析欺骗行为的模式和指标
 */
export const FORENSIC_DECEPTION: ExtendedOntologyDefinition = {
  ontologyId: 'FORENSIC_DECEPTION',
  name: 'DeceptionDetection（欺骗检测）',
  type: 'psychology',
  version: '1.0.0',
  description: '识别和分析欺骗行为的模式和指标，包括语言线索、行为线索、生理线索等',
  dimensions: [],
  conceptType: 'Inference',
  parentConceptId: 'UPPER_INTERNAL_STATE',
  packageId: 'PKG_FORENSIC_001',
  level: 2,
  attributes: [
    {
      attributeId: 'ATTR_DECEPTION_001',
      attributeName: 'deceptionType',
      dataType: 'enum',
      required: true,
      description: '欺骗类型',
      enumValues: ['完全虚构', '部分隐瞒', '夸大事实', '转移焦点', '模糊回答']
    },
    {
      attributeId: 'ATTR_DECEPTION_002',
      attributeName: 'deceptionIndicators',
      dataType: 'array',
      required: true,
      description: '欺骗指标列表（如：语言矛盾、微表情、生理反应）'
    },
    {
      attributeId: 'ATTR_DECEPTION_003',
      attributeName: 'confidence',
      dataType: 'number',
      required: true,
      description: '欺骗检测置信度（0-1）',
      validation: { min: 0, max: 1 }
    }
  ],
  relationships: [
    {
      relationshipId: 'REL_FORENSIC_001',
      relationshipType: 'IS_A',
      sourceConceptId: 'FORENSIC_DECEPTION',
      targetConceptId: 'UPPER_INTERNAL_STATE',
      direction: 'outgoing',
      cardinality: 'N:1',
      description: '欺骗检测是一种内在状态推断'
    },
    {
      relationshipId: 'REL_FORENSIC_002',
      relationshipType: 'MANIFESTS_AS',
      sourceConceptId: 'FORENSIC_DECEPTION',
      targetConceptId: 'UPPER_OBSERVABLE_STATE',
      direction: 'outgoing',
      cardinality: '1:N',
      description: '欺骗表现为语言矛盾、行为异常等可观察状态'
    },
    {
      relationshipId: 'REL_FORENSIC_003',
      relationshipType: 'ASSOCIATED_WITH',
      sourceConceptId: 'FORENSIC_DECEPTION',
      targetConceptId: 'COGNITIVE_MEMORY_DISTORTION',
      direction: 'bidirectional',
      cardinality: 'N:N',
      description: '欺骗与记忆扭曲相关联'
    }
  ],
  constraints: ['confidence必须在0-1之间', 'deceptionType必须是预定义的枚举值'],
  examples: ['对案发时间的陈述前后矛盾', '回答关键问题时出现微表情', '生理指标显示压力反应'],
  tags: ['司法审讯', '欺骗检测', '测谎']
};

/**
 * FORENSIC_INTERROGATION_STRATEGY - 审讯策略（司法审讯）
 * 不同的审讯方法和策略及其适用场景
 */
export const FORENSIC_INTERROGATION_STRATEGY: ExtendedOntologyDefinition = {
  ontologyId: 'FORENSIC_INTERROGATION_STRATEGY',
  name: 'InterrogationStrategy（审讯策略）',
  type: 'rule',
  version: '1.0.0',
  description: '不同的审讯方法和策略，包括对抗式、共情式、认知访谈等',
  dimensions: [],
  conceptType: 'Action',
  parentConceptId: 'UPPER_ACTION',
  packageId: 'PKG_FORENSIC_001',
  level: 2,
  attributes: [
    {
      attributeId: 'ATTR_STRATEGY_001',
      attributeName: 'strategyType',
      dataType: 'enum',
      required: true,
      description: '策略类型',
      enumValues: ['对抗式', '共情式', '认知访谈', '诱导式', '沉默施压']
    },
    {
      attributeId: 'ATTR_STRATEGY_002',
      attributeName: 'effectiveness',
      dataType: 'enum',
      required: true,
      description: '预期效果',
      enumValues: ['高', '中', '低', '未知']
    },
    {
      attributeId: 'ATTR_STRATEGY_003',
      attributeName: 'applicableScenarios',
      dataType: 'array',
      required: false,
      description: '适用场景列表'
    }
  ],
  relationships: [
    {
      relationshipId: 'REL_FORENSIC_004',
      relationshipType: 'IS_A',
      sourceConceptId: 'FORENSIC_INTERROGATION_STRATEGY',
      targetConceptId: 'UPPER_ACTION',
      direction: 'outgoing',
      cardinality: 'N:1',
      description: '审讯策略是一种行为动作'
    },
    {
      relationshipId: 'REL_FORENSIC_005',
      relationshipType: 'INFLUENCES',
      sourceConceptId: 'FORENSIC_INTERROGATION_STRATEGY',
      targetConceptId: 'FORENSIC_CONFESSION',
      direction: 'outgoing',
      cardinality: 'N:N',
      description: '审讯策略影响供述行为'
    },
    {
      relationshipId: 'REL_FORENSIC_006',
      relationshipType: 'TRIGGERED_BY',
      sourceConceptId: 'FORENSIC_INTERROGATION_STRATEGY',
      targetConceptId: 'FORENSIC_DECEPTION',
      direction: 'incoming',
      cardinality: 'N:N',
      description: '审讯策略根据欺骗检测结果调整'
    }
  ],
  constraints: ['strategyType和effectiveness必须是预定义的枚举值'],
  examples: ['采用共情式策略建立信任', '使用认知访谈技术获取细节', '对抗式策略突破心理防线'],
  tags: ['司法审讯', '策略', '方法']
};

/**
 * FORENSIC_STRESS_RESPONSE - 压力反应（司法审讯）
 * 审讯过程中的压力反应模式和指标
 */
export const FORENSIC_STRESS_RESPONSE: ExtendedOntologyDefinition = {
  ontologyId: 'FORENSIC_STRESS_RESPONSE',
  name: 'StressResponse（压力反应）',
  type: 'psychology',
  version: '1.0.0',
  description: '审讯过程中的压力反应模式，包括生理、行为和情绪层面的反应',
  dimensions: [],
  conceptType: 'Inference',
  parentConceptId: 'UPPER_INTERNAL_STATE',
  packageId: 'PKG_FORENSIC_001',
  level: 2,
  attributes: [
    {
      attributeId: 'ATTR_STRESS_001',
      attributeName: 'stressLevel',
      dataType: 'enum',
      required: true,
      description: '压力水平',
      enumValues: ['低', '中', '高', '极高']
    },
    {
      attributeId: 'ATTR_STRESS_002',
      attributeName: 'stressIndicators',
      dataType: 'array',
      required: true,
      description: '压力指标列表（如：心率升高、出汗、语速变化）'
    },
    {
      attributeId: 'ATTR_STRESS_003',
      attributeName: 'triggeringFactors',
      dataType: 'array',
      required: false,
      description: '触发因素列表（如：关键问题、证据出示）'
    }
  ],
  relationships: [
    {
      relationshipId: 'REL_FORENSIC_007',
      relationshipType: 'IS_A',
      sourceConceptId: 'FORENSIC_STRESS_RESPONSE',
      targetConceptId: 'UPPER_INTERNAL_STATE',
      direction: 'outgoing',
      cardinality: 'N:1',
      description: '压力反应是一种内在心理状态'
    },
    {
      relationshipId: 'REL_FORENSIC_008',
      relationshipType: 'MANIFESTS_AS',
      sourceConceptId: 'FORENSIC_STRESS_RESPONSE',
      targetConceptId: 'UPPER_OBSERVABLE_STATE',
      direction: 'outgoing',
      cardinality: '1:N',
      description: '压力反应表现为生理和行为变化'
    },
    {
      relationshipId: 'REL_FORENSIC_009',
      relationshipType: 'TRIGGERED_BY',
      sourceConceptId: 'FORENSIC_STRESS_RESPONSE',
      targetConceptId: 'UPPER_EVENT',
      direction: 'incoming',
      cardinality: 'N:N',
      description: '压力反应被审讯事件触发'
    },
    {
      relationshipId: 'REL_FORENSIC_010',
      relationshipType: 'INFLUENCES',
      sourceConceptId: 'FORENSIC_STRESS_RESPONSE',
      targetConceptId: 'FORENSIC_CONFESSION',
      direction: 'outgoing',
      cardinality: 'N:N',
      description: '压力反应影响供述行为'
    }
  ],
  constraints: ['stressLevel必须是预定义的枚举值'],
  examples: ['关键问题导致心率显著升高', '证据出示后出现明显焦虑反应', '长时间审讯导致疲劳和防御降低'],
  tags: ['司法审讯', '压力', '生理反应']
};

/**
 * FORENSIC_CONFESSION - 供述行为（司法审讯）
 * 审讯过程中的供述模式和可信度分析
 */
export const FORENSIC_CONFESSION: ExtendedOntologyDefinition = {
  ontologyId: 'FORENSIC_CONFESSION',
  name: 'ConfessionBehavior（供述行为）',
  type: 'feature',
  version: '1.0.0',
  description: '审讯过程中的供述模式，包括完全供述、部分供述、虚假供述等',
  dimensions: [],
  conceptType: 'Observable',
  parentConceptId: 'UPPER_OBSERVABLE_STATE',
  packageId: 'PKG_FORENSIC_001',
  level: 2,
  attributes: [
    {
      attributeId: 'ATTR_CONFESSION_001',
      attributeName: 'confessionType',
      dataType: 'enum',
      required: true,
      description: '供述类型',
      enumValues: ['完全供述', '部分供述', '虚假供述', '勉强供述', '拒绝供述']
    },
    {
      attributeId: 'ATTR_CONFESSION_002',
      attributeName: 'credibility',
      dataType: 'enum',
      required: true,
      description: '可信度评估',
      enumValues: ['高', '中', '低', '存疑']
    },
    {
      attributeId: 'ATTR_CONFESSION_003',
      attributeName: 'motivatingFactors',
      dataType: 'array',
      required: false,
      description: '动机因素列表（如：压力、策略、证据）'
    }
  ],
  relationships: [
    {
      relationshipId: 'REL_FORENSIC_011',
      relationshipType: 'IS_A',
      sourceConceptId: 'FORENSIC_CONFESSION',
      targetConceptId: 'UPPER_OBSERVABLE_STATE',
      direction: 'outgoing',
      cardinality: 'N:1',
      description: '供述行为是一种可观察状态'
    },
    {
      relationshipId: 'REL_FORENSIC_012',
      relationshipType: 'TRIGGERED_BY',
      sourceConceptId: 'FORENSIC_CONFESSION',
      targetConceptId: 'FORENSIC_STRESS_RESPONSE',
      direction: 'incoming',
      cardinality: 'N:N',
      description: '供述行为受压力反应影响'
    },
    {
      relationshipId: 'REL_FORENSIC_013',
      relationshipType: 'TRIGGERED_BY',
      sourceConceptId: 'FORENSIC_CONFESSION',
      targetConceptId: 'FORENSIC_INTERROGATION_STRATEGY',
      direction: 'incoming',
      cardinality: 'N:N',
      description: '供述行为受审讯策略影响'
    },
    {
      relationshipId: 'REL_FORENSIC_014',
      relationshipType: 'ASSOCIATED_WITH',
      sourceConceptId: 'FORENSIC_CONFESSION',
      targetConceptId: 'UPPER_EVIDENCE',
      direction: 'bidirectional',
      cardinality: 'N:N',
      description: '供述行为与证据相关联'
    }
  ],
  constraints: ['confessionType和credibility必须是预定义的枚举值'],
  examples: ['在证据面前完全供述犯罪事实', '部分承认但隐瞒关键细节', '压力下做出虚假供述'],
  tags: ['司法审讯', '供述', '可信度']
};

// ==================== 导出所有数据 ====================

/**
 * 所有本体包的集合
 */
export const ALL_ONTOLOGY_PACKAGES: OntologyPackage[] = [
  META_MODEL_PACKAGE,
  UPPER_ONTOLOGY_PACKAGE,
  COGNITIVE_PSYCHOLOGY_PACKAGE,
  FORENSIC_INTERROGATION_PACKAGE
];

/**
 * 所有本体概念的集合
 */
export const ALL_ONTOLOGY_CONCEPTS: ExtendedOntologyDefinition[] = [
  // Meta-Model Layer (Level 0)
  META_ENTITY,
  META_OBSERVABLE,
  META_INFERENCE,

  // Upper Ontology Layer (Level 1)
  UPPER_PERSON,
  UPPER_OBSERVABLE_STATE,
  UPPER_INTERNAL_STATE,
  UPPER_EVIDENCE,
  UPPER_EVENT,
  UPPER_ACTION,

  // Cognitive Psychology Sub-domain (Level 2)
  COGNITIVE_MEMORY_DISTORTION,
  COGNITIVE_BIAS,
  COGNITIVE_ATTENTION,
  COGNITIVE_DECISION,
  COGNITIVE_INFO_PROCESSING,

  // Forensic Interrogation Domain (Level 2)
  FORENSIC_DECEPTION,
  FORENSIC_INTERROGATION_STRATEGY,
  FORENSIC_STRESS_RESPONSE,
  FORENSIC_CONFESSION
];

/**
 * 本体数据统计信息
 */
export const ONTOLOGY_STATISTICS = {
  totalPackages: ALL_ONTOLOGY_PACKAGES.length,
  totalConcepts: ALL_ONTOLOGY_CONCEPTS.length,
  totalRelationships: ALL_ONTOLOGY_CONCEPTS.reduce(
    (sum, concept) => sum + (concept.relationships?.length || 0),
    0
  ),
  conceptsByLevel: {
    level0: ALL_ONTOLOGY_CONCEPTS.filter(c => c.level === 0).length,
    level1: ALL_ONTOLOGY_CONCEPTS.filter(c => c.level === 1).length,
    level2: ALL_ONTOLOGY_CONCEPTS.filter(c => c.level === 2).length
  },
  conceptsByType: {
    Entity: ALL_ONTOLOGY_CONCEPTS.filter(c => c.conceptType === 'Entity').length,
    Observable: ALL_ONTOLOGY_CONCEPTS.filter(c => c.conceptType === 'Observable').length,
    Inference: ALL_ONTOLOGY_CONCEPTS.filter(c => c.conceptType === 'Inference').length,
    Action: ALL_ONTOLOGY_CONCEPTS.filter(c => c.conceptType === 'Action').length
  }
};

/**
 * 按包ID获取本体概念
 */
export function getConceptsByPackage(packageId: string): ExtendedOntologyDefinition[] {
  return ALL_ONTOLOGY_CONCEPTS.filter(concept => concept.packageId === packageId);
}

/**
 * 按概念ID获取本体概念
 */
export function getConceptById(conceptId: string): ExtendedOntologyDefinition | undefined {
  return ALL_ONTOLOGY_CONCEPTS.find(concept => concept.ontologyId === conceptId);
}

/**
 * 获取所有关系
 */
export function getAllRelationships(): OntologyRelationship[] {
  const relationships: OntologyRelationship[] = [];
  ALL_ONTOLOGY_CONCEPTS.forEach(concept => {
    if (concept.relationships) {
      relationships.push(...concept.relationships);
    }
  });
  return relationships;
}


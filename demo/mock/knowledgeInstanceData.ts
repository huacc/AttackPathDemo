/**
 * 知识实例 Mock 数据（v2.0 - 完全重构版）
 *
 * 重构原则：
 * 1. Observable实例使用reliability（可靠性），不使用confidence
 * 2. Inference和InternalState实例使用confidence（置信度）
 * 3. 属性使用本体定义的业务字段，而非技术字段（stateId, category等）
 * 4. 构建完整的Observable → Inference → InternalState推理链
 * 5. 使用多个本体（认知心理学+司法审讯），展示系统完整性
 *
 * 知识图谱逻辑：
 * - Chain 1: 陈述矛盾 + 眼神回避 → 欺骗检测规则 → 欺骗意图
 * - Chain 2: 语速加快 + 心率升高 + 手部颤抖 → 压力检测规则 → 高度压力状态
 * - Chain 3: 陈述矛盾 + 对话证据 → 记忆扭曲检测 → 记忆扭曲倾向
 * - Chain 4: 欺骗意图 + 压力状态 → 认知偏差检测 → 确认偏差倾向
 *
 * @version 2.0.0
 * @date 2026-01-29
 */

import {
  KnowledgeInstance,
  KnowledgeInstanceType,
  KnowledgeAttributeValue
} from '../types/index';

// ============================================================
// 知识库基础信息
// ============================================================

/** 知识库ID */
export const KNOWLEDGE_BASE_ID = 'KB_PSY_001';

// ============================================================
// Observable 可观察特征实例（6个）
// 使用reliability（可靠性），不使用confidence
// ============================================================

/**
 * Observable 1: 陈述前后不一致
 * 来源本体: FORENSIC_CONFESSION（供述行为）
 */
export const OBS_001: KnowledgeInstance = {
  instanceId: 'INST_OBS_001',
  instanceName: '陈述前后不一致',
  instanceType: 'Observable',
  sourceOntologyId: 'FORENSIC_CONFESSION',
  sourceOntologyName: '供述行为',
  sourcePackageId: 'PKG_FORENSIC_001',
  knowledgeBaseId: KNOWLEDGE_BASE_ID,
  attributeValues: [
    {
      attributeId: 'ATTR_CONFESSION_001',
      attributeName: 'confessionType',
      value: '部分供述',
      valueType: 'enum'
    },
    {
      attributeId: 'ATTR_CONFESSION_002',
      attributeName: 'credibility',
      value: '低',
      valueType: 'enum'
    },
    {
      attributeId: 'ATTR_CONFESSION_003',
      attributeName: 'motivatingFactors',
      value: ['压力', '记忆混乱'],
      valueType: 'object'
    },
    {
      attributeId: 'ATTR_OBS_005',
      attributeName: 'reliability',
      value: 0.92,
      valueType: 'number'
    }
  ],
  metadata: {
    description: '嫌疑人在不同审讯轮次中关于案发时间的陈述存在明显矛盾：先称23:00在家睡觉，后承认22:30还在外面',
    dataSource: '审讯笔录.pdf - 第12-15轮',
    collectionTime: '2026-01-15 14:30:00',
    tags: ['供述', '矛盾', '语言特征']
  }
};

/**
 * Observable 2: 回避眼神接触
 * 来源本体: UPPER_OBSERVABLE_STATE（可观察状态）
 */
export const OBS_002: KnowledgeInstance = {
  instanceId: 'INST_OBS_002',
  instanceName: '回避眼神接触',
  instanceType: 'Observable',
  sourceOntologyId: 'UPPER_OBSERVABLE_STATE',
  sourceOntologyName: '可观察状态',
  sourcePackageId: 'PKG_UPPER_001',
  knowledgeBaseId: KNOWLEDGE_BASE_ID,
  attributeValues: [
    {
      attributeId: 'ATTR_OBS_STATE_002',
      attributeName: 'category',
      value: '行为模式',
      valueType: 'enum'
    },
    {
      attributeId: 'ATTR_OBS_STATE_003',
      attributeName: 'value',
      value: '在回答关键问题时持续回避与审讯人员的眼神接触，频率每分钟3-5次',
      valueType: 'string'
    },
    {
      attributeId: 'ATTR_OBS_002',
      attributeName: 'observationMethod',
      value: '视频监控分析',
      valueType: 'string'
    },
    {
      attributeId: 'ATTR_OBS_003',
      attributeName: 'reliability',
      value: 0.90,
      valueType: 'number'
    }
  ],
  metadata: {
    description: '在回答关键问题时持续回避与审讯人员的眼神接触',
    dataSource: '审讯视频-第15轮',
    collectionTime: '2026-01-15 14:35:00',
    tags: ['行为', '眼神', '回避']
  }
};

/**
 * Observable 3: 语速异常加快
 * 来源本体: UPPER_OBSERVABLE_STATE（可观察状态）
 */
export const OBS_003: KnowledgeInstance = {
  instanceId: 'INST_OBS_003',
  instanceName: '语速异常加快',
  instanceType: 'Observable',
  sourceOntologyId: 'UPPER_OBSERVABLE_STATE',
  sourceOntologyName: '可观察状态',
  sourcePackageId: 'PKG_UPPER_001',
  knowledgeBaseId: KNOWLEDGE_BASE_ID,
  attributeValues: [
    {
      attributeId: 'ATTR_OBS_STATE_002',
      attributeName: 'category',
      value: '语言特征',
      valueType: 'enum'
    },
    {
      attributeId: 'ATTR_OBS_STATE_003',
      attributeName: 'value',
      value: '语速从120词/分钟上升至180词/分钟，升幅50%',
      valueType: 'string'
    },
    {
      attributeId: 'ATTR_OBS_002',
      attributeName: 'observationMethod',
      value: '语音分析系统',
      valueType: 'string'
    },
    {
      attributeId: 'ATTR_OBS_003',
      attributeName: 'reliability',
      value: 0.95,
      valueType: 'number'
    }
  ],
  metadata: {
    description: '在讨论案发现场时语速显著加快',
    dataSource: '审讯录音-第15轮',
    collectionTime: '2026-01-15 14:40:00',
    tags: ['语言', '语速', '压力']
  }
};

/**
 * Observable 4: 心率异常升高
 * 来源本体: UPPER_OBSERVABLE_STATE（可观察状态）
 */
export const OBS_004: KnowledgeInstance = {
  instanceId: 'INST_OBS_004',
  instanceName: '心率异常升高',
  instanceType: 'Observable',
  sourceOntologyId: 'UPPER_OBSERVABLE_STATE',
  sourceOntologyName: '可观察状态',
  sourcePackageId: 'PKG_UPPER_001',
  knowledgeBaseId: KNOWLEDGE_BASE_ID,
  attributeValues: [
    {
      attributeId: 'ATTR_OBS_STATE_002',
      attributeName: 'category',
      value: '生理反应',
      valueType: 'enum'
    },
    {
      attributeId: 'ATTR_OBS_STATE_003',
      attributeName: 'value',
      value: '心率从基线75次/分钟上升至105次/分钟，升幅40%',
      valueType: 'string'
    },
    {
      attributeId: 'ATTR_OBS_002',
      attributeName: 'observationMethod',
      value: '生理监测设备',
      valueType: 'string'
    },
    {
      attributeId: 'ATTR_OBS_003',
      attributeName: 'reliability',
      value: 0.98,
      valueType: 'number'
    }
  ],
  metadata: {
    description: '在回答关键问题时心率显著升高',
    dataSource: '生理监测系统',
    collectionTime: '2026-01-15 14:42:00',
    tags: ['生理', '心率', '压力']
  }
};

/**
 * Observable 5: 手部颤抖
 * 来源本体: UPPER_OBSERVABLE_STATE（可观察状态）
 */
export const OBS_005: KnowledgeInstance = {
  instanceId: 'INST_OBS_005',
  instanceName: '手部颤抖',
  instanceType: 'Observable',
  sourceOntologyId: 'UPPER_OBSERVABLE_STATE',
  sourceOntologyName: '可观察状态',
  sourcePackageId: 'PKG_UPPER_001',
  knowledgeBaseId: KNOWLEDGE_BASE_ID,
  attributeValues: [
    {
      attributeId: 'ATTR_OBS_STATE_002',
      attributeName: 'category',
      value: '行为模式',
      valueType: 'enum'
    },
    {
      attributeId: 'ATTR_OBS_STATE_003',
      attributeName: 'value',
      value: '在出示关键证据后出现明显的手部颤抖，频率4-6次/秒',
      valueType: 'string'
    },
    {
      attributeId: 'ATTR_OBS_002',
      attributeName: 'observationMethod',
      value: '直接观察',
      valueType: 'string'
    },
    {
      attributeId: 'ATTR_OBS_003',
      attributeName: 'reliability',
      value: 0.88,
      valueType: 'number'
    }
  ],
  metadata: {
    description: '在出示关键证据后出现手部颤抖',
    dataSource: '审讯视频-第15轮',
    collectionTime: '2026-01-15 14:45:00',
    tags: ['行为', '颤抖', '压力']
  }
};

/**
 * Observable 6: 审讯对话记录（证据）
 * 来源本体: UPPER_EVIDENCE（证据）
 */
export const OBS_006: KnowledgeInstance = {
  instanceId: 'INST_OBS_006',
  instanceName: '审讯对话记录-第15轮',
  instanceType: 'Observable',
  sourceOntologyId: 'UPPER_EVIDENCE',
  sourceOntologyName: '证据',
  sourcePackageId: 'PKG_UPPER_001',
  knowledgeBaseId: KNOWLEDGE_BASE_ID,
  attributeValues: [
    {
      attributeId: 'ATTR_EVIDENCE_002',
      attributeName: 'evidenceType',
      value: 'dialogue',
      valueType: 'enum'
    },
    {
      attributeId: 'ATTR_EVIDENCE_003',
      attributeName: 'content',
      value: '问：你在案发当天下午3点在哪里？答：我在家里...不对，我在公司加班...',
      valueType: 'string'
    },
    {
      attributeId: 'ATTR_EVIDENCE_004',
      attributeName: 'source',
      value: '审讯笔录.pdf - 第15轮',
      valueType: 'string'
    },
    {
      attributeId: 'ATTR_EVIDENCE_005',
      attributeName: 'reliability',
      value: 0.96,
      valueType: 'number'
    }
  ],
  metadata: {
    description: '第15轮审讯的完整对话记录，包含关键问答',
    dataSource: '审讯笔录.pdf',
    collectionTime: '2026-01-15 14:30:00',
    tags: ['证据', '对话', '矛盾']
  }
};

// ============================================================
// Inference 推理规则实例（4个）
// 使用confidence（置信度）
// ============================================================

/**
 * Inference 1: 欺骗倾向检测规则
 * 来源本体: FORENSIC_DECEPTION（欺骗检测）
 */
export const INF_001: KnowledgeInstance = {
  instanceId: 'INST_INF_001',
  instanceName: '欺骗倾向检测规则',
  instanceType: 'Inference',
  sourceOntologyId: 'FORENSIC_DECEPTION',
  sourceOntologyName: '欺骗检测',
  sourcePackageId: 'PKG_FORENSIC_001',
  knowledgeBaseId: KNOWLEDGE_BASE_ID,
  attributeValues: [
    {
      attributeId: 'ATTR_DECEPTION_001',
      attributeName: 'deceptionType',
      value: '部分隐瞒',
      valueType: 'enum'
    },
    {
      attributeId: 'ATTR_DECEPTION_002',
      attributeName: 'deceptionIndicators',
      value: ['陈述矛盾', '眼神回避', '语速变化'],
      valueType: 'object'
    },
    {
      attributeId: 'ATTR_INF_001',
      attributeName: 'inferenceMethod',
      value: '规则推理',
      valueType: 'enum'
    },
    {
      attributeId: 'ATTR_DECEPTION_003',
      attributeName: 'confidence',
      value: 0.82,
      valueType: 'number'
    },
    {
      attributeId: 'ATTR_INF_003',
      attributeName: 'supportingEvidence',
      value: ['INST_OBS_001', 'INST_OBS_002', 'INST_OBS_003'],
      valueType: 'object'
    },
    {
      attributeId: 'ATTR_INF_RULE_001',
      attributeName: 'rule',
      value: `rule "欺骗倾向检测规则"
when
    $obs1: Observable(instanceId == "INST_OBS_001", reliability > 0.9)
    $obs2: Observable(instanceId == "INST_OBS_002", reliability > 0.85)
    $obs3: Observable(instanceId == "INST_OBS_003", reliability > 0.8)
then
    Inference inference = new Inference();
    inference.setType("欺骗倾向");
    inference.setConfidence(0.82);
    inference.setDeceptionType("部分隐瞒");
    inference.setDeceptionIndicators(["陈述矛盾", "眼神回避", "语速变化"]);
    inference.setSupportingEvidence([$obs1, $obs2, $obs3]);
    insert(inference);
end`,
      valueType: 'string'
    }
  ],
  metadata: {
    description: '基于语言矛盾、行为异常和生理反应综合判断欺骗倾向',
    ruleVersion: 'v2.1',
    validationStatus: '已验证',
    tags: ['推理', '欺骗检测', '规则']
  }
};

/**
 * Inference 2: 高压力反应检测规则
 * 来源本体: FORENSIC_STRESS_RESPONSE（压力反应）
 */
export const INF_002: KnowledgeInstance = {
  instanceId: 'INST_INF_002',
  instanceName: '高压力反应检测规则',
  instanceType: 'Inference',
  sourceOntologyId: 'FORENSIC_STRESS_RESPONSE',
  sourceOntologyName: '压力反应',
  sourcePackageId: 'PKG_FORENSIC_001',
  knowledgeBaseId: KNOWLEDGE_BASE_ID,
  attributeValues: [
    {
      attributeId: 'ATTR_STRESS_001',
      attributeName: 'stressLevel',
      value: '高',
      valueType: 'enum'
    },
    {
      attributeId: 'ATTR_STRESS_002',
      attributeName: 'stressIndicators',
      value: ['心率升高40%', '手部颤抖', '语速加快50%'],
      valueType: 'object'
    },
    {
      attributeId: 'ATTR_STRESS_003',
      attributeName: 'triggeringFactors',
      value: ['关键问题', '证据出示', '长时间审讯'],
      valueType: 'object'
    },
    {
      attributeId: 'ATTR_INF_001',
      attributeName: 'inferenceMethod',
      value: '规则推理',
      valueType: 'enum'
    },
    {
      attributeId: 'ATTR_INF_002',
      attributeName: 'confidence',
      value: 0.88,
      valueType: 'number'
    },
    {
      attributeId: 'ATTR_INF_003',
      attributeName: 'supportingEvidence',
      value: ['INST_OBS_003', 'INST_OBS_004', 'INST_OBS_005'],
      valueType: 'object'
    },
    {
      attributeId: 'ATTR_INF_RULE_002',
      attributeName: 'rule',
      value: `rule "高压力反应检测规则"
when
    $obs3: Observable(instanceId == "INST_OBS_003", reliability > 0.8)
    $obs4: Observable(instanceId == "INST_OBS_004", reliability > 0.85)
    $obs5: Observable(instanceId == "INST_OBS_005", reliability > 0.75)
    eval($obs4.heartRateIncrease >= 0.4 || $obs3.speechRateIncrease >= 0.5)
then
    Inference inference = new Inference();
    inference.setType("高压力反应");
    inference.setConfidence(0.88);
    inference.setStressLevel("高");
    inference.setStressIndicators(["心率升高40%", "手部颤抖", "语速加快50%"]);
    inference.setTriggeringFactors(["关键问题", "证据出示", "长时间审讯"]);
    inference.setSupportingEvidence([$obs3, $obs4, $obs5]);
    insert(inference);
end`,
      valueType: 'string'
    }
  ],
  metadata: {
    description: '基于生理指标和行为变化检测高压力反应',
    ruleVersion: 'v1.5',
    validationStatus: '已验证',
    tags: ['推理', '压力检测', '规则']
  }
};

/**
 * Inference 3: 记忆扭曲检测规则
 * 来源本体: COGNITIVE_MEMORY_DISTORTION（记忆扭曲）
 */
export const INF_003: KnowledgeInstance = {
  instanceId: 'INST_INF_003',
  instanceName: '记忆扭曲检测规则',
  instanceType: 'Inference',
  sourceOntologyId: 'COGNITIVE_MEMORY_DISTORTION',
  sourceOntologyName: '记忆扭曲',
  sourcePackageId: 'PKG_COGNITIVE_001',
  knowledgeBaseId: KNOWLEDGE_BASE_ID,
  attributeValues: [
    {
      attributeId: 'ATTR_MEM_DIST_001',
      attributeName: 'distortionType',
      value: '时间错位',
      valueType: 'enum'
    },
    {
      attributeId: 'ATTR_MEM_DIST_002',
      attributeName: 'severity',
      value: '中度',
      valueType: 'enum'
    },
    {
      attributeId: 'ATTR_MEM_DIST_003',
      attributeName: 'possibleCause',
      value: '压力导致记忆混淆',
      valueType: 'string'
    },
    {
      attributeId: 'ATTR_INF_001',
      attributeName: 'inferenceMethod',
      value: '规则推理',
      valueType: 'enum'
    },
    {
      attributeId: 'ATTR_INF_002',
      attributeName: 'confidence',
      value: 0.75,
      valueType: 'number'
    },
    {
      attributeId: 'ATTR_INF_003',
      attributeName: 'supportingEvidence',
      value: ['INST_OBS_001', 'INST_OBS_006'],
      valueType: 'object'
    },
    {
      attributeId: 'ATTR_INF_RULE_003',
      attributeName: 'rule',
      value: `rule "记忆扭曲检测规则"
when
    $obs1: Observable(instanceId == "INST_OBS_001", reliability > 0.9)
    $obs6: Observable(instanceId == "INST_OBS_006", reliability > 0.7)
    eval($obs1.hasTimelineInconsistency() || $obs6.hasConflictingDetails())
then
    Inference inference = new Inference();
    inference.setType("记忆扭曲");
    inference.setConfidence(0.75);
    inference.setDistortionType("时间错位");
    inference.setSeverity("中度");
    inference.setPossibleCause("压力导致记忆混淆");
    inference.setSupportingEvidence([$obs1, $obs6]);
    insert(inference);
end`,
      valueType: 'string'
    }
  ],
  metadata: {
    description: '基于陈述不一致和时间线混乱检测记忆扭曲',
    ruleVersion: 'v1.3',
    validationStatus: '已验证',
    tags: ['推理', '记忆', '认知']
  }
};

/**
 * Inference 4: 认知偏差检测规则
 * 来源本体: COGNITIVE_BIAS（认知偏差）
 */
export const INF_004: KnowledgeInstance = {
  instanceId: 'INST_INF_004',
  instanceName: '确认偏差检测规则',
  instanceType: 'Inference',
  sourceOntologyId: 'COGNITIVE_BIAS',
  sourceOntologyName: '认知偏差',
  sourcePackageId: 'PKG_COGNITIVE_001',
  knowledgeBaseId: KNOWLEDGE_BASE_ID,
  attributeValues: [
    {
      attributeId: 'ATTR_BIAS_001',
      attributeName: 'biasType',
      value: '确认偏差',
      valueType: 'enum'
    },
    {
      attributeId: 'ATTR_BIAS_002',
      attributeName: 'impactLevel',
      value: '中',
      valueType: 'enum'
    },
    {
      attributeId: 'ATTR_BIAS_003',
      attributeName: 'manifestation',
      value: '反复强调对自己有利的细节，忽略矛盾证据',
      valueType: 'string'
    },
    {
      attributeId: 'ATTR_INF_001',
      attributeName: 'inferenceMethod',
      value: '规则推理',
      valueType: 'enum'
    },
    {
      attributeId: 'ATTR_INF_002',
      attributeName: 'confidence',
      value: 0.70,
      valueType: 'number'
    },
    {
      attributeId: 'ATTR_INF_003',
      attributeName: 'supportingEvidence',
      value: ['INST_OBS_001', 'INST_OBS_006'],
      valueType: 'object'
    },
    {
      attributeId: 'ATTR_INF_RULE_004',
      attributeName: 'rule',
      value: `rule "确认偏差检测规则"
when
    $obs1: Observable(instanceId == "INST_OBS_001", reliability > 0.9)
    $obs6: Observable(instanceId == "INST_OBS_006", reliability > 0.7)
    eval($obs1.hasSelectiveEmphasis() && $obs6.ignoresContradictoryEvidence())
then
    Inference inference = new Inference();
    inference.setType("确认偏差");
    inference.setConfidence(0.70);
    inference.setBiasType("确认偏差");
    inference.setImpactLevel("中");
    inference.setManifestation("反复强调对自己有利的细节，忽略矛盾证据");
    inference.setSupportingEvidence([$obs1, $obs6]);
    insert(inference);
end`,
      valueType: 'string'
    }
  ],
  metadata: {
    description: '检测嫌疑人倾向于寻找支持自己无罪观点的证据',
    ruleVersion: 'v1.0',
    validationStatus: '待验证',
    tags: ['推理', '认知偏差', '判断']
  }
};

// ============================================================
// InternalState 内在心理状态实例（4个）
// 使用confidence（置信度）
// ============================================================

/**
 * InternalState 1: 欺骗意图
 * 来源本体: FORENSIC_DECEPTION（欺骗检测）
 */
export const STATE_001: KnowledgeInstance = {
  instanceId: 'INST_STATE_001',
  instanceName: '欺骗意图',
  instanceType: 'InternalState',
  sourceOntologyId: 'FORENSIC_DECEPTION',
  sourceOntologyName: '欺骗检测',
  sourcePackageId: 'PKG_FORENSIC_001',
  knowledgeBaseId: KNOWLEDGE_BASE_ID,
  attributeValues: [
    {
      attributeId: 'ATTR_DECEPTION_001',
      attributeName: 'deceptionType',
      value: '部分隐瞒',
      valueType: 'enum'
    },
    {
      attributeId: 'ATTR_DECEPTION_002',
      attributeName: 'deceptionIndicators',
      value: ['语言矛盾', '行为异常', '回避反应'],
      valueType: 'object'
    },
    {
      attributeId: 'ATTR_INT_STATE_002',
      attributeName: 'stateName',
      value: '欺骗意图',
      valueType: 'string'
    },
    {
      attributeId: 'ATTR_INT_STATE_003',
      attributeName: 'category',
      value: '动机状态',
      valueType: 'enum'
    },
    {
      attributeId: 'ATTR_INT_STATE_004',
      attributeName: 'intensity',
      value: '高',
      valueType: 'enum'
    },
    {
      attributeId: 'ATTR_DECEPTION_003',
      attributeName: 'confidence',
      value: 0.82,
      valueType: 'number'
    },
    {
      attributeId: 'ATTR_INT_STATE_006',
      attributeName: 'description',
      value: '嫌疑人存在明显的欺骗意图，试图隐瞒关键事实',
      valueType: 'string'
    }
  ],
  metadata: {
    description: '基于多重证据推断出的欺骗意图',
    inferredBy: 'INST_INF_001',
    inferenceTime: '2026-01-15 15:00:00',
    tags: ['心理状态', '欺骗', '动机']
  }
};

/**
 * InternalState 2: 高度压力状态
 * 来源本体: FORENSIC_STRESS_RESPONSE（压力反应）
 */
export const STATE_002: KnowledgeInstance = {
  instanceId: 'INST_STATE_002',
  instanceName: '高度压力状态',
  instanceType: 'InternalState',
  sourceOntologyId: 'FORENSIC_STRESS_RESPONSE',
  sourceOntologyName: '压力反应',
  sourcePackageId: 'PKG_FORENSIC_001',
  knowledgeBaseId: KNOWLEDGE_BASE_ID,
  attributeValues: [
    {
      attributeId: 'ATTR_STRESS_001',
      attributeName: 'stressLevel',
      value: '高',
      valueType: 'enum'
    },
    {
      attributeId: 'ATTR_STRESS_002',
      attributeName: 'stressIndicators',
      value: ['心率升高40%', '手部颤抖', '语速加快50%'],
      valueType: 'object'
    },
    {
      attributeId: 'ATTR_STRESS_003',
      attributeName: 'triggeringFactors',
      value: ['关键问题', '证据出示', '长时间审讯'],
      valueType: 'object'
    },
    {
      attributeId: 'ATTR_INT_STATE_002',
      attributeName: 'stateName',
      value: '高度压力',
      valueType: 'string'
    },
    {
      attributeId: 'ATTR_INT_STATE_003',
      attributeName: 'category',
      value: '情绪状态',
      valueType: 'enum'
    },
    {
      attributeId: 'ATTR_INT_STATE_004',
      attributeName: 'intensity',
      value: '高',
      valueType: 'enum'
    },
    {
      attributeId: 'ATTR_INF_002',
      attributeName: 'confidence',
      value: 0.88,
      valueType: 'number'
    },
    {
      attributeId: 'ATTR_INT_STATE_006',
      attributeName: 'description',
      value: '审讯压力导致的显著生理和心理反应',
      valueType: 'string'
    }
  ],
  metadata: {
    description: '审讯过程中表现出的高度压力反应',
    inferredBy: 'INST_INF_002',
    inferenceTime: '2026-01-15 15:05:00',
    tags: ['心理状态', '压力', '情绪']
  }
};

/**
 * InternalState 3: 记忆扭曲倾向
 * 来源本体: COGNITIVE_MEMORY_DISTORTION（记忆扭曲）
 */
export const STATE_003: KnowledgeInstance = {
  instanceId: 'INST_STATE_003',
  instanceName: '记忆扭曲倾向',
  instanceType: 'InternalState',
  sourceOntologyId: 'COGNITIVE_MEMORY_DISTORTION',
  sourceOntologyName: '记忆扭曲',
  sourcePackageId: 'PKG_COGNITIVE_001',
  knowledgeBaseId: KNOWLEDGE_BASE_ID,
  attributeValues: [
    {
      attributeId: 'ATTR_MEM_DIST_001',
      attributeName: 'distortionType',
      value: '时间错位',
      valueType: 'enum'
    },
    {
      attributeId: 'ATTR_MEM_DIST_002',
      attributeName: 'severity',
      value: '中度',
      valueType: 'enum'
    },
    {
      attributeId: 'ATTR_MEM_DIST_003',
      attributeName: 'possibleCause',
      value: '高压力状态下的认知负荷过重',
      valueType: 'string'
    },
    {
      attributeId: 'ATTR_INT_STATE_002',
      attributeName: 'stateName',
      value: '记忆扭曲',
      valueType: 'string'
    },
    {
      attributeId: 'ATTR_INT_STATE_003',
      attributeName: 'category',
      value: '认知状态',
      valueType: 'enum'
    },
    {
      attributeId: 'ATTR_INT_STATE_004',
      attributeName: 'intensity',
      value: '中',
      valueType: 'enum'
    },
    {
      attributeId: 'ATTR_INF_002',
      attributeName: 'confidence',
      value: 0.75,
      valueType: 'number'
    },
    {
      attributeId: 'ATTR_INT_STATE_006',
      attributeName: 'description',
      value: '对案发时间线的记忆出现明显混乱和前后矛盾',
      valueType: 'string'
    }
  ],
  metadata: {
    description: '压力和时间流逝导致的记忆不准确',
    inferredBy: 'INST_INF_003',
    inferenceTime: '2026-01-15 15:10:00',
    tags: ['心理状态', '记忆', '认知']
  }
};

/**
 * InternalState 4: 确认偏差倾向
 * 来源本体: COGNITIVE_BIAS（认知偏差）
 */
export const STATE_004: KnowledgeInstance = {
  instanceId: 'INST_STATE_004',
  instanceName: '确认偏差倾向',
  instanceType: 'InternalState',
  sourceOntologyId: 'COGNITIVE_BIAS',
  sourceOntologyName: '认知偏差',
  sourcePackageId: 'PKG_COGNITIVE_001',
  knowledgeBaseId: KNOWLEDGE_BASE_ID,
  attributeValues: [
    {
      attributeId: 'ATTR_BIAS_001',
      attributeName: 'biasType',
      value: '确认偏差',
      valueType: 'enum'
    },
    {
      attributeId: 'ATTR_BIAS_002',
      attributeName: 'impactLevel',
      value: '中',
      valueType: 'enum'
    },
    {
      attributeId: 'ATTR_BIAS_003',
      attributeName: 'manifestation',
      value: '选择性关注对自己有利的细节',
      valueType: 'string'
    },
    {
      attributeId: 'ATTR_INT_STATE_002',
      attributeName: 'stateName',
      value: '确认偏差',
      valueType: 'string'
    },
    {
      attributeId: 'ATTR_INT_STATE_003',
      attributeName: 'category',
      value: '认知状态',
      valueType: 'enum'
    },
    {
      attributeId: 'ATTR_INT_STATE_004',
      attributeName: 'intensity',
      value: '中',
      valueType: 'enum'
    },
    {
      attributeId: 'ATTR_INF_002',
      attributeName: 'confidence',
      value: 0.70,
      valueType: 'number'
    },
    {
      attributeId: 'ATTR_INT_STATE_006',
      attributeName: 'description',
      value: '在供述中表现出明显的选择性记忆和辩护倾向',
      valueType: 'string'
    }
  ],
  metadata: {
    description: '倾向于寻找支持自己观点的证据',
    inferredBy: 'INST_INF_004',
    inferenceTime: '2026-01-15 15:15:00',
    tags: ['心理状态', '认知偏差', '判断']
  }
};

// ============================================================
// 汇总和导出
// ============================================================

/**
 * 所有知识实例的集合
 */
export const ALL_KNOWLEDGE_INSTANCES: KnowledgeInstance[] = [
  // Observable 实例 (6个)
  OBS_001,
  OBS_002,
  OBS_003,
  OBS_004,
  OBS_005,
  OBS_006,

  // Inference 实例 (4个)
  INF_001,
  INF_002,
  INF_003,
  INF_004,

  // InternalState 实例 (4个)
  STATE_001,
  STATE_002,
  STATE_003,
  STATE_004
];

/**
 * 按类型获取实例
 * @param type 实例类型
 * @returns 对应类型的实例列表
 */
export function getInstancesByType(type: KnowledgeInstanceType): KnowledgeInstance[] {
  return ALL_KNOWLEDGE_INSTANCES.filter(inst => inst.instanceType === type);
}

/**
 * 按ID获取实例
 * @param instanceId 实例ID
 * @returns 对应的实例或undefined
 */
export function getInstanceById(instanceId: string): KnowledgeInstance | undefined {
  return ALL_KNOWLEDGE_INSTANCES.find(inst => inst.instanceId === instanceId);
}

/**
 * 知识实例统计信息
 */
export const KNOWLEDGE_INSTANCE_STATISTICS = {
  /** 总实例数 */
  totalInstances: ALL_KNOWLEDGE_INSTANCES.length,
  /** 可观测实例数 */
  observableCount: getInstancesByType('Observable').length,
  /** 推理规则实例数 */
  inferenceCount: getInstancesByType('Inference').length,
  /** 内部状态实例数 */
  internalStateCount: getInstancesByType('InternalState').length,
  /** 实体实例数 */
  entityCount: 0,
  /** 动作实例数 */
  actionCount: 0
};

// ============================================================
// 使用示例
// ============================================================

/**
 * 使用示例：
 *
 * // 1. 获取所有实例
 * import { ALL_KNOWLEDGE_INSTANCES } from './knowledgeInstanceData';
 * console.log('总实例数:', ALL_KNOWLEDGE_INSTANCES.length);
 *
 * // 2. 按类型获取实例
 * import { getInstancesByType } from './knowledgeInstanceData';
 * const observables = getInstancesByType('Observable');
 * console.log('可观测实例:', observables.length);
 *
 * // 3. 按ID获取单个实例
 * import { getInstanceById } from './knowledgeInstanceData';
 * const instance = getInstanceById('INST_OBS_001');
 * console.log('实例详情:', instance?.instanceName);
 *
 * // 4. 获取统计信息
 * import { KNOWLEDGE_INSTANCE_STATISTICS } from './knowledgeInstanceData';
 * console.log('统计:', KNOWLEDGE_INSTANCE_STATISTICS);
 */

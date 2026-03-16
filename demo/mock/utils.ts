
import { ThinkingProcess, ThinkingStep, MessageTokenUsage, TokenUsageDetail } from '../types/index';

/**
 * 心理分析系统 - Mock 工具函数
 * 提供异步模拟和业务逻辑辅助
 */

/**
 * 模拟网络延迟
 * @param ms 延迟毫秒数，默认 300-800ms 随机
 */
export const delay = (ms?: number): Promise<void> => {
  const timeout = ms ?? Math.floor(Math.random() * 500) + 300;
  return new Promise((resolve) => setTimeout(resolve, timeout));
};

/**
 * 专业心理分析步骤定义（10步完整流程）
 * 体现本体匹配和知识图谱推理
 */
const PROFESSIONAL_ANALYSIS_STEPS = [
  {
    stepName: '文档解析与内容提取',
    description: '解析上传的文档，提取文本和图片内容',
    detailsTemplate: '已识别文档类型：PDF，共{pages}页 | 文本提取完成，共{chars}个字符'
  },
  {
    stepName: '多模态数据融合',
    description: '处理文本和图片内容，进行多模态融合',
    detailsTemplate: '已识别{images}张人物图片 | 图像特征提取完成 | 文本-图像关联建立'
  },
  {
    stepName: '语言特征提取',
    description: '分析语言模式，提取词汇、句式、情绪特征',
    detailsTemplate: '已提取{keywords}个关键词 | 情绪词汇占比：{emotion}% | 句式复杂度：{complexity}'
  },
  {
    stepName: '行为特征识别',
    description: '识别行为模式和肢体语言特征',
    detailsTemplate: '检测到防御性行为：{defense}处 | 肢体语言紧张度：{tension}% | 微表情分析完成'
  },
  {
    stepName: '心理学本体匹配',
    description: '加载心理学本体库，进行特征-概念映射',
    detailsTemplate: '本体概念数：{concepts}个 | 特征映射完成 | 匹配度：{match}%（高置信度）'
  },
  {
    stepName: '知识图谱推理',
    description: '查询知识图谱，构建推理路径和证据链',
    detailsTemplate: '发现相关节点：{nodes}个 | 推理路径：{paths}条 | 证据链构建完成'
  },
  {
    stepName: '多维度特征融合',
    description: '整合语言、行为、情绪等多维度特征',
    detailsTemplate: '语言维度权重：{lang} | 行为维度权重：{behavior} | 情绪维度权重：{emotion}'
  },
  {
    stepName: '心理状态评估',
    description: '基于融合特征评估心理状态',
    detailsTemplate: '压力水平：{stress} | 情绪稳定性：{stability} | 认知清晰度：{cognition}'
  },
  {
    stepName: '风险因素识别',
    description: '识别潜在风险点和异常模式',
    detailsTemplate: '发现潜在风险点：{risks}个 | 风险等级：{level} | 预警建议已生成'
  },
  {
    stepName: '结构化报告生成',
    description: '生成完整的分析报告和可视化图表',
    detailsTemplate: '生成{sections}个章节 | {charts}个可视化图表 | 报告完成'
  }
];

/**
 * 生成初始的思维链（只包含第1个步骤，running状态）
 * 用于前端流式展示，逐步添加新步骤
 */
export const createInitialThinkingProcess = (): ThinkingProcess => {
  // 只返回第1个步骤，状态为running
  const firstStep: ThinkingStep = {
    stepId: 'STEP_001',
    stepName: PROFESSIONAL_ANALYSIS_STEPS[0].stepName,
    status: 'running',
    description: PROFESSIONAL_ANALYSIS_STEPS[0].description,
    details: undefined,
    duration: undefined,
    timestamp: new Date().toISOString()
  };

  return {
    steps: [firstStep],
    totalDuration: 0,
    currentStepIndex: 0
  };
};

/**
 * 生成步骤的详细信息（模拟真实数据）
 */
export const generateStepDetails = (stepIndex: number): string => {
  const templates = PROFESSIONAL_ANALYSIS_STEPS[stepIndex]?.detailsTemplate;
  if (!templates) return '';

  // 模拟真实的分析数据
  const mockData: Record<string, string> = {
    pages: String(Math.floor(Math.random() * 10) + 8),
    chars: String(Math.floor(Math.random() * 2000) + 2500),
    images: String(Math.floor(Math.random() * 3) + 1),
    keywords: String(Math.floor(Math.random() * 15) + 18),
    emotion: String(Math.floor(Math.random() * 10) + 12),
    complexity: ['简单', '中等', '复杂'][Math.floor(Math.random() * 3)],
    defense: String(Math.floor(Math.random() * 3) + 2),
    tension: String(Math.floor(Math.random() * 20) + 60),
    concepts: String(Math.floor(Math.random() * 50) + 140),
    match: String(Math.floor(Math.random() * 10) + 85),
    nodes: String(Math.floor(Math.random() * 20) + 35),
    paths: String(Math.floor(Math.random() * 3) + 4),
    lang: '0.35',
    behavior: '0.25',
    stress: ['低', '中等', '中等偏高', '高'][Math.floor(Math.random() * 4)],
    stability: ['较低', '中等', '良好'][Math.floor(Math.random() * 3)],
    cognition: ['一般', '良好', '优秀'][Math.floor(Math.random() * 3)],
    risks: String(Math.floor(Math.random() * 3) + 1),
    level: ['低', '中等', '中等偏高'][Math.floor(Math.random() * 3)],
    sections: '7',
    charts: '3'
  };

  // 替换模板中的占位符
  return templates.replace(/\{(\w+)\}/g, (_, key) => mockData[key] || '');
};

/**
 * 模拟 AI 思考过程（兼容旧版本，保留6步）
 * 符合 REQ-2.4 规范
 */
export const simulateThinking = async (onProgress?: (step: ThinkingStep) => void): Promise<ThinkingProcess> => {
  const stepNames = [
    '文档解析与内容提取',
    '证据原子化索引',
    '多模态理解',
    '特征观察与规则匹配',
    '推理链条构建',
    '报告生成'
  ];

  const steps: ThinkingStep[] = [];
  let totalDuration = 0;

  for (let i = 0; i < stepNames.length; i++) {
    const duration = Math.floor(Math.random() * 2) + 1; // 每步 1-2 秒
    totalDuration += duration;

    const step: ThinkingStep = {
      stepId: `STEP_00${i + 1}`,
      stepName: stepNames[i],
      status: 'running',
      description: `正在进行${stepNames[i]}...`,
      duration
    };

    if (onProgress) onProgress(step);
    await delay(duration * 1000);

    step.status = 'completed';
    step.description = `${stepNames[i]}已完成`;
    steps.push({ ...step });
  }

  return {
    steps,
    totalDuration
  };
};

/**
 * 模拟文件上传进度
 * @param file 文件对象
 * @param onProgress 进度回调 (0-100)
 */
export const simulateFileUpload = async (file: File, onProgress: (percent: number) => void): Promise<void> => {
  let percent = 0;
  while (percent < 100) {
    percent += Math.floor(Math.random() * 20) + 10;
    if (percent > 100) percent = 100;
    onProgress(percent);
    await delay(200);
  }
};

/**
 * 模型Token价格配置（元/千token）
 * 基于实际市场价格
 */
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'qwen-plus': { input: 0.004, output: 0.012 },
  'glm-4.7': { input: 0.001, output: 0.001 },
  'deepseek-v3.2': { input: 0.0014, output: 0.0028 },
  'claude-3-5-sonnet': { input: 0.015, output: 0.075 },
  'gemini-2.0-flash': { input: 0.0, output: 0.0 },
  'gpt-4o': { input: 0.025, output: 0.1 },
};

/**
 * 分析阶段与模型配置
 * 模拟真实的多模型调用场景
 */
const ANALYSIS_STAGES = [
  { stage: '表征提取', model: 'qwen-plus', promptTokensRange: [2500, 3500], completionTokensRange: [800, 1200] },
  { stage: '心理特征分析', model: 'claude-3-5-sonnet', promptTokensRange: [3000, 4000], completionTokensRange: [1200, 1800] },
  { stage: '报告生成', model: 'qwen-plus', promptTokensRange: [4000, 5000], completionTokensRange: [1500, 2500] },
];

/**
 * 生成模拟的Token消耗数据
 * 用于AI消息的tokenUsage字段
 * @param messageId 消息ID
 * @returns MessageTokenUsage对象
 */
export const generateMockTokenUsage = (messageId: string): MessageTokenUsage => {
  const callDetails: TokenUsageDetail[] = [];
  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;
  let totalCost = 0;

  // 为每个分析阶段生成token消耗
  ANALYSIS_STAGES.forEach((stage, index) => {
    const promptTokens = Math.floor(
      Math.random() * (stage.promptTokensRange[1] - stage.promptTokensRange[0]) +
      stage.promptTokensRange[0]
    );
    const completionTokens = Math.floor(
      Math.random() * (stage.completionTokensRange[1] - stage.completionTokensRange[0]) +
      stage.completionTokensRange[0]
    );
    const totalTokens = promptTokens + completionTokens;

    // 计算费用
    const pricing = MODEL_PRICING[stage.model] || { input: 0, output: 0 };
    const cost = (promptTokens / 1000) * pricing.input + (completionTokens / 1000) * pricing.output;

    const detail: TokenUsageDetail = {
      callId: `CALL_${messageId}_${index + 1}`,
      modelName: stage.model,
      promptTokens,
      completionTokens,
      totalTokens,
      cost,
      timestamp: new Date(Date.now() + index * 1000).toISOString(),
      stage: stage.stage,
    };

    callDetails.push(detail);
    totalPromptTokens += promptTokens;
    totalCompletionTokens += completionTokens;
    totalCost += cost;
  });

  return {
    messageId,
    totalPromptTokens,
    totalCompletionTokens,
    totalTokens: totalPromptTokens + totalCompletionTokens,
    totalCost,
    callDetails,
  };
};

/**
 * Mock API 模块
 * 提供前端开发所需的模拟接口
 *
 * 包含功能：
 * - 对话与报告管理
 * - 知识库管理
 * - 知识实例管理（Step 4新增）
 * - 知识图谱管理（Step 4新增）
 * - Step 5增强：分页支持、邻域查询
 *
 * @author Psychology System Team
 * @version 1.2.0
 * @date 2026-01-29
 */

import {
  Conversation,
  Message,
  OntologyDefinition,
  KnowledgeBase,
  SceneTemplate,
  ReportTemplate,
  AnalysisResult,
  KnowledgeInstance,
  KnowledgeInstanceType,
  KnowledgeGraph,
  KnowledgeGraphEdge,
  KnowledgeGraphStatistics
} from '../types/index';
import { MockDataStorage } from './storage';
import { delay, simulateThinking, createInitialThinkingProcess, generateMockTokenUsage } from './utils';
import { MOCK_ANALYSIS_RESULT, MOCK_REPORT_TEMPLATES, MOCK_KB_RULES_MAP } from './data';

// 导入知识实例和图谱数据（Step 4新增，Step 5增强）
import {
  ALL_KNOWLEDGE_INSTANCES,
  KNOWLEDGE_INSTANCE_STATISTICS,
  getInstancesByType,
  getInstanceById,
  KNOWLEDGE_BASE_ID as KNOWLEDGE_INSTANCE_BASE_ID
} from './knowledgeInstanceData';

import {
  KNOWLEDGE_GRAPH,
  KNOWLEDGE_GRAPH_NODES,
  KNOWLEDGE_GRAPH_EDGES,
  KNOWLEDGE_GRAPH_STATISTICS,
  getOutgoingEdges,
  getIncomingEdges,
  getEdgesByType,
  getNodesByType,
  getNeighborNodes  // Step 5 新增：用于邻域查询
} from './knowledgeGraphData';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; };
  timestamp: string;
}

export const mockApi = {
  // --- 对话与报告逻辑 (保持不变) ---
  async getConversations(): Promise<ApiResponse<Conversation[]>> { await delay(); return { success: true, data: MockDataStorage.getConversations(), timestamp: new Date().toISOString() }; },
  async getConversation(id: string): Promise<ApiResponse<Conversation>> { await delay(); const data = MockDataStorage.getConversation(id); return data ? { success: true, data, timestamp: new Date().toISOString() } : { success: false, error: { code: '404', message: '对话未找到' }, timestamp: new Date().toISOString() }; },
  async createConversation(params: { title: string, sceneId: string, knowledgeBaseId: string }): Promise<ApiResponse<Conversation>> { await delay(); const newConv: Conversation = { conversationId: `CONV_${Date.now()}`, title: params.title, sceneId: params.sceneId, knowledgeBaseId: params.knowledgeBaseId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), messages: [] }; MockDataStorage.saveConversation(newConv); return { success: true, data: newConv, timestamp: new Date().toISOString() }; },
  async sendMessage(conversationId: string, messageData: Partial<Message>): Promise<ApiResponse<{ userMessage: Message, aiMessage: Message }>> {
    // 创建用户消息
    const userMessage: Message = {
      messageId: `MSG_U_${Date.now()}`,
      role: 'user',
      content: messageData.content || '',
      files: messageData.files || [],
      timestamp: new Date().toISOString(),
      status: 'success'
    };
    MockDataStorage.appendMessage(conversationId, userMessage);

    // 模拟短暂延迟
    await delay(500);

    // 创建初始的思维链（所有步骤pending状态）
    // 前端将负责逐步更新每个步骤的状态
    const thinkingProcess = createInitialThinkingProcess();

    // 创建AI消息
    const aiMessage: Message = {
      messageId: `MSG_A_${Date.now()}`,
      role: 'assistant',
      content: '分析已完成，详情请查看报告。',
      timestamp: new Date().toISOString(),
      status: 'success',
      thinkingProcess,
      analysisResult: { ...MOCK_ANALYSIS_RESULT, timestamp: new Date().toISOString() },
      tokenUsage: generateMockTokenUsage(`MSG_A_${Date.now()}`) // 添加Token消耗数据
    };
    MockDataStorage.appendMessage(conversationId, aiMessage);

    return { success: true, data: { userMessage, aiMessage }, timestamp: new Date().toISOString() };
  },
  async getReportDetail(reportId: string): Promise<ApiResponse<AnalysisResult>> { await delay(); return { success: true, data: MOCK_ANALYSIS_RESULT, timestamp: new Date().toISOString() }; },
  
  // Fix: Added missing deleteConversation method for conversationStore
  async deleteConversation(id: string): Promise<ApiResponse<void>> { await delay(); MockDataStorage.deleteConversation(id); return { success: true, timestamp: new Date().toISOString() }; },
  
  // Fix: Added missing updateConversationTitle method for conversationStore
  async updateConversationTitle(id: string, title: string): Promise<ApiResponse<void>> {
    await delay();
    const conv = MockDataStorage.getConversation(id);
    if (conv) {
      conv.title = title;
      MockDataStorage.saveConversation(conv);
      return { success: true, timestamp: new Date().toISOString() };
    }
    return { success: false, error: { code: '404', message: '对话未找到' }, timestamp: new Date().toISOString() };
  },

  // --- 知识管理逻辑 (P6.5 强化) ---
  async getOntologies(): Promise<ApiResponse<OntologyDefinition[]>> { await delay(); return { success: true, data: MockDataStorage.getOntologies(), timestamp: new Date().toISOString() }; },
  
  // Fix: Added missing getOntology method for OntologyPage
  async getOntology(id: string): Promise<ApiResponse<OntologyDefinition>> {
    await delay();
    const o = MockDataStorage.getOntologies().find(o => o.ontologyId === id);
    return o ? { success: true, data: o, timestamp: new Date().toISOString() } : { success: false, error: { code: '404', message: '未找到本体' }, timestamp: new Date().toISOString() };
  },

  /** 更新本体定义 */
  async updateOntology(ontologyId: string, ontology: OntologyDefinition): Promise<ApiResponse<OntologyDefinition>> {
    await delay(800); // 模拟网络IO延迟
    MockDataStorage.updateOntology(ontology);
    return { success: true, data: ontology, timestamp: new Date().toISOString() };
  },

  async getKnowledgeBases(): Promise<ApiResponse<KnowledgeBase[]>> { await delay(); return { success: true, data: MockDataStorage.getKnowledgeBases(), timestamp: new Date().toISOString() }; },
  async getKnowledgeBase(id: string): Promise<ApiResponse<KnowledgeBase>> { await delay(); const kb = MockDataStorage.getKnowledgeBases().find(k => k.knowledgeBaseId === id); return kb ? { success: true, data: kb, timestamp: new Date().toISOString() } : { success: false, error: { code: '404', message: '未找到' }, timestamp: new Date().toISOString() }; },
  async getKbRules(kbId: string): Promise<ApiResponse<any[]>> { await delay(); const rules = MOCK_KB_RULES_MAP[kbId] || []; return { success: true, data: rules, timestamp: new Date().toISOString() }; },
  async getSceneTemplates(): Promise<ApiResponse<SceneTemplate[]>> { await delay(); return { success: true, data: MockDataStorage.getScenes(), timestamp: new Date().toISOString() }; },
  async getReportTemplates(): Promise<ApiResponse<ReportTemplate[]>> { await delay(); return { success: true, data: MockDataStorage.getReportTemplates(), timestamp: new Date().toISOString() }; },

  /** 更新场景模板（新增） */
  async updateSceneTemplate(sceneId: string, scene: SceneTemplate): Promise<ApiResponse<SceneTemplate>> {
    await delay(800); // 模拟网络IO延迟
    MockDataStorage.updateScene(scene);
    return { success: true, data: scene, timestamp: new Date().toISOString() };
  },

  /** 15. 获取图谱数据 (支持持久化) */
  async getKnowledgeGraph(knowledgeBaseId: string): Promise<ApiResponse<any>> {
    await delay();
    const data = MockDataStorage.getGraphData(knowledgeBaseId);
    return { success: true, data, timestamp: new Date().toISOString() };
  },

  /** 16. 保存图谱数据 (新增) */
  async saveKnowledgeGraph(knowledgeBaseId: string, graphData: any): Promise<ApiResponse<void>> {
    await delay(800); // 模拟网络IO延迟
    MockDataStorage.saveGraphData(knowledgeBaseId, graphData);
    return { success: true, timestamp: new Date().toISOString() };
  },

  // ============================================================
  // 知识实例管理 API（Step 4 新增）
  // ============================================================

  /**
   * 17. 获取知识库的所有实例
   * Step 5增强：支持分页查询（limit/offset参数）
   *
   * @param knowledgeBaseId 知识库ID
   * @param options 可选参数：
   *   - type: 按实例类型筛选
   *   - limit: 分页限制（默认不限制）
   *   - offset: 分页偏移（默认0）
   * @returns 知识实例列表
   */
  async getKnowledgeInstances(
    knowledgeBaseId: string,
    options?: {
      type?: KnowledgeInstanceType;
      limit?: number;
      offset?: number;
    }
  ): Promise<ApiResponse<KnowledgeInstance[]>> {
    await delay();

    // 目前只支持司法审讯知识库
    if (knowledgeBaseId !== KNOWLEDGE_INSTANCE_BASE_ID) {
      return {
        success: true,
        data: [],
        timestamp: new Date().toISOString()
      };
    }

    let instances = ALL_KNOWLEDGE_INSTANCES;

    // 按类型筛选
    if (options?.type) {
      instances = getInstancesByType(options.type);
    }

    // Step 5 新增：分页处理
    const offset = options?.offset || 0;
    const limit = options?.limit;

    // 应用分页
    if (limit !== undefined && limit > 0) {
      instances = instances.slice(offset, offset + limit);
    } else if (offset > 0) {
      instances = instances.slice(offset);
    }

    return {
      success: true,
      data: instances,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * 18. 获取单个知识实例详情
   * @param instanceId 实例ID
   * @returns 知识实例详情
   */
  async getKnowledgeInstance(instanceId: string): Promise<ApiResponse<KnowledgeInstance>> {
    await delay();

    const instance = getInstanceById(instanceId);

    if (!instance) {
      return {
        success: false,
        error: { code: '404', message: `知识实例 ${instanceId} 未找到` },
        timestamp: new Date().toISOString()
      };
    }

    return {
      success: true,
      data: instance,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * 更新知识实例
   * @param instanceId 实例ID
   * @param instance 更新后的实例数据
   * @returns 更新后的实例
   */
  async updateKnowledgeInstance(
    instanceId: string,
    instance: KnowledgeInstance
  ): Promise<ApiResponse<KnowledgeInstance>> {
    await delay(800); // 模拟网络IO延迟
    MockDataStorage.updateKnowledgeInstance(instance);
    return {
      success: true,
      data: instance,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * 19. 获取知识实例的关联关系
   * @param instanceId 实例ID
   * @param direction 方向：outgoing/incoming/all
   * @returns 关联的边列表
   */
  async getInstanceRelations(
    instanceId: string,
    direction: 'outgoing' | 'incoming' | 'all' = 'all'
  ): Promise<ApiResponse<KnowledgeGraphEdge[]>> {
    await delay();

    let edges: KnowledgeGraphEdge[] = [];

    if (direction === 'outgoing' || direction === 'all') {
      edges = [...edges, ...getOutgoingEdges(instanceId)];
    }

    if (direction === 'incoming' || direction === 'all') {
      edges = [...edges, ...getIncomingEdges(instanceId)];
    }

    // 去重
    const uniqueEdges = Array.from(
      new Map(edges.map(e => [e.id, e])).values()
    );

    return {
      success: true,
      data: uniqueEdges,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * 20. 获取知识实例统计信息
   * @param knowledgeBaseId 知识库ID
   * @returns 统计信息
   */
  async getKnowledgeInstanceStatistics(
    knowledgeBaseId: string
  ): Promise<ApiResponse<typeof KNOWLEDGE_INSTANCE_STATISTICS>> {
    await delay();

    // 目前只支持司法审讯知识库
    if (knowledgeBaseId !== KNOWLEDGE_INSTANCE_BASE_ID) {
      return {
        success: true,
        data: {
          totalInstances: 0,
          observableCount: 0,
          inferenceCount: 0,
          internalStateCount: 0,
          entityCount: 0,
          actionCount: 0
        },
        timestamp: new Date().toISOString()
      };
    }

    return {
      success: true,
      data: KNOWLEDGE_INSTANCE_STATISTICS,
      timestamp: new Date().toISOString()
    };
  },

  // ============================================================
  // 知识图谱管理 API（Step 4 新增）
  // ============================================================

  /**
   * 21. 获取知识图谱完整数据
   * @param knowledgeBaseId 知识库ID
   * @returns 完整的知识图谱数据
   */
  async getKnowledgeGraphData(
    knowledgeBaseId: string
  ): Promise<ApiResponse<KnowledgeGraph>> {
    await delay();

    // 目前只支持司法审讯知识库
    if (knowledgeBaseId !== KNOWLEDGE_INSTANCE_BASE_ID) {
      return {
        success: false,
        error: { code: '404', message: `知识库 ${knowledgeBaseId} 的图谱数据未找到` },
        timestamp: new Date().toISOString()
      };
    }

    return {
      success: true,
      data: KNOWLEDGE_GRAPH,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * 22. 获取知识图谱子图（按过滤条件）
   * Step 5增强：支持中心节点邻域查询（centerNodeId/depth参数）
   *
   * @param knowledgeBaseId 知识库ID
   * @param options 过滤条件：
   *   - nodeTypes: 节点类型过滤
   *   - edgeTypes: 边类型过滤
   *   - minConfidence: 最小置信度
   *   - centerNodeId: 中心节点ID（用于获取邻域子图）
   *   - depth: 邻域深度（默认1，即直接邻居）
   * @returns 过滤后的子图数据
   */
  async getKnowledgeSubGraph(
    knowledgeBaseId: string,
    options: {
      nodeTypes?: KnowledgeInstanceType[];
      edgeTypes?: (typeof KNOWLEDGE_GRAPH_EDGES[0]['relationType'])[];
      minConfidence?: number;
      centerNodeId?: string;  // Step 5 新增
      depth?: number;         // Step 5 新增
    }
  ): Promise<ApiResponse<KnowledgeGraph>> {
    await delay();

    // 目前只支持司法审讯知识库
    if (knowledgeBaseId !== KNOWLEDGE_INSTANCE_BASE_ID) {
      return {
        success: false,
        error: { code: '404', message: `知识库 ${knowledgeBaseId} 的图谱数据未找到` },
        timestamp: new Date().toISOString()
      };
    }

    let filteredNodes = [...KNOWLEDGE_GRAPH_NODES];
    let filteredEdges = [...KNOWLEDGE_GRAPH_EDGES];

    // ============================================================
    // Step 5 新增：中心节点邻域查询
    // 如果指定了centerNodeId，先获取邻域内的节点
    // ============================================================
    if (options.centerNodeId) {
      const centerNodeId = options.centerNodeId;
      const depth = options.depth || 1;

      // 使用BFS算法获取指定深度内的所有节点
      const neighborNodeIds = new Set<string>([centerNodeId]);
      let currentLevel = new Set<string>([centerNodeId]);

      for (let d = 0; d < depth; d++) {
        const nextLevel = new Set<string>();
        currentLevel.forEach(nodeId => {
          // 获取当前节点的所有邻居
          const neighbors = getNeighborNodes(nodeId, 'all');
          neighbors.forEach(neighborId => {
            if (!neighborNodeIds.has(neighborId)) {
              neighborNodeIds.add(neighborId);
              nextLevel.add(neighborId);
            }
          });
        });
        currentLevel = nextLevel;
        if (nextLevel.size === 0) break; // 没有新邻居，提前结束
      }

      // 只保留邻域内的节点
      filteredNodes = filteredNodes.filter(n => neighborNodeIds.has(n.id));

      // 只保留邻域内节点之间的边
      filteredEdges = filteredEdges.filter(e =>
        neighborNodeIds.has(e.source) && neighborNodeIds.has(e.target)
      );
    }

    // 按节点类型筛选
    if (options.nodeTypes && options.nodeTypes.length > 0) {
      filteredNodes = filteredNodes.filter(n =>
        options.nodeTypes!.includes(n.nodeType)
      );
    }

    // 按置信度筛选节点
    if (options.minConfidence !== undefined) {
      filteredNodes = filteredNodes.filter(n =>
        (n.properties.confidence || 0) >= options.minConfidence!
      );
    }

    // 获取有效节点ID集合
    const validNodeIds = new Set(filteredNodes.map(n => n.id));

    // 按边类型筛选，同时确保source和target都是有效节点
    filteredEdges = filteredEdges.filter(e => {
      const typeMatch = !options.edgeTypes || options.edgeTypes.length === 0 ||
        options.edgeTypes.includes(e.relationType);
      const nodeMatch = validNodeIds.has(e.source) && validNodeIds.has(e.target);
      return typeMatch && nodeMatch;
    });

    // 重新计算统计信息
    const nodesByType: Record<KnowledgeInstanceType, number> = {
      Observable: 0,
      InternalState: 0,
      Inference: 0,
      Entity: 0,
      Action: 0
    };
    filteredNodes.forEach(n => nodesByType[n.nodeType]++);

    const edgesByType: Record<string, number> = {};
    filteredEdges.forEach(e => {
      edgesByType[e.relationType] = (edgesByType[e.relationType] || 0) + 1;
    });

    const subGraph: KnowledgeGraph = {
      ...KNOWLEDGE_GRAPH,
      nodes: filteredNodes,
      edges: filteredEdges,
      statistics: {
        totalNodes: filteredNodes.length,
        totalEdges: filteredEdges.length,
        nodesByType,
        edgesByType: edgesByType as any
      }
    };

    return {
      success: true,
      data: subGraph,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * 23. 获取知识图谱统计信息
   * @param knowledgeBaseId 知识库ID
   * @returns 图谱统计信息
   */
  async getKnowledgeGraphStatistics(
    knowledgeBaseId: string
  ): Promise<ApiResponse<KnowledgeGraphStatistics>> {
    await delay();

    // 目前只支持司法审讯知识库
    if (knowledgeBaseId !== KNOWLEDGE_INSTANCE_BASE_ID) {
      return {
        success: true,
        data: {
          totalNodes: 0,
          totalEdges: 0,
          nodesByType: {
            Observable: 0,
            InternalState: 0,
            Inference: 0,
            Entity: 0,
            Action: 0
          },
          edgesByType: {} as any
        },
        timestamp: new Date().toISOString()
      };
    }

    return {
      success: true,
      data: KNOWLEDGE_GRAPH_STATISTICS,
      timestamp: new Date().toISOString()
    };
  },

  // ============================================================
  // 用户权限管理 API
  // ============================================================

  /**
   * 24. 获取所有用户组
   */
  async getUserGroups(): Promise<ApiResponse<any[]>> {
    await delay();
    return {
      success: true,
      data: MockDataStorage.getUserGroups(),
      timestamp: new Date().toISOString()
    };
  },

  /**
   * 25. 创建用户组
   */
  async createUserGroup(groupData: any): Promise<ApiResponse<any>> {
    await delay(600);
    const newGroup = {
      groupId: `GROUP_${Date.now()}`,
      ...groupData,
      memberCount: 0,
      createdAt: new Date().toISOString()
    };
    MockDataStorage.saveUserGroup(newGroup);
    return {
      success: true,
      data: newGroup,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * 26. 更新用户组
   */
  async updateUserGroup(groupId: string, groupData: any): Promise<ApiResponse<any>> {
    await delay(600);
    MockDataStorage.updateUserGroup(groupId, groupData);
    return {
      success: true,
      data: groupData,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * 27. 删除用户组
   */
  async deleteUserGroup(groupId: string): Promise<ApiResponse<void>> {
    await delay(400);
    MockDataStorage.deleteUserGroup(groupId);
    return {
      success: true,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * 28. 获取所有用户
   */
  async getUsers(): Promise<ApiResponse<any[]>> {
    await delay();
    return {
      success: true,
      data: MockDataStorage.getUsers(),
      timestamp: new Date().toISOString()
    };
  },

  /**
   * 29. 获取单个用户
   */
  async getUser(userId: string): Promise<ApiResponse<any>> {
    await delay();
    const user = MockDataStorage.getUsers().find(u => u.userId === userId);
    if (!user) {
      return {
        success: false,
        error: { code: '404', message: '用户未找到' },
        timestamp: new Date().toISOString()
      };
    }
    return {
      success: true,
      data: user,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * 30. 创建用户
   */
  async createUser(userData: any): Promise<ApiResponse<any>> {
    await delay(600);
    const newUser = {
      userId: `USER_${Date.now()}`,
      ...userData,
      createdAt: new Date().toISOString()
    };
    MockDataStorage.saveUser(newUser);
    return {
      success: true,
      data: newUser,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * 31. 更新用户
   */
  async updateUser(userId: string, userData: any): Promise<ApiResponse<any>> {
    await delay(600);
    MockDataStorage.updateUser(userId, userData);
    return {
      success: true,
      data: userData,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * 32. 删除用户
   */
  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    await delay(400);
    MockDataStorage.deleteUser(userId);
    return {
      success: true,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * 33. 获取所有权限规则
   */
  async getPermissions(): Promise<ApiResponse<any[]>> {
    await delay();
    return {
      success: true,
      data: MockDataStorage.getPermissions(),
      timestamp: new Date().toISOString()
    };
  },

  /**
   * 34. 创建权限规则
   */
  async createPermission(permissionData: any): Promise<ApiResponse<any>> {
    await delay(600);
    const newPermission = {
      permissionId: `PERM_${Date.now()}`,
      ...permissionData,
      createdAt: new Date().toISOString()
    };
    MockDataStorage.savePermission(newPermission);
    return {
      success: true,
      data: newPermission,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * 35. 删除权限规则
   */
  async deletePermission(permissionId: string): Promise<ApiResponse<void>> {
    await delay(400);
    MockDataStorage.deletePermission(permissionId);
    return {
      success: true,
      timestamp: new Date().toISOString()
    };
  },

  // ============================================================
  // 模型管理 API
  // ============================================================

  /**
   * 33. 获取所有AI模型
   */
  async getAIModels(): Promise<ApiResponse<any[]>> {
    await delay();
    return {
      success: true,
      data: MockDataStorage.getAIModels(),
      timestamp: new Date().toISOString()
    };
  },

  /**
   * 34. 获取单个AI模型
   */
  async getAIModel(modelId: string): Promise<ApiResponse<any>> {
    await delay();
    const model = MockDataStorage.getAIModels().find(m => m.modelId === modelId);
    if (!model) {
      return {
        success: false,
        error: { code: '404', message: '模型未找到' },
        timestamp: new Date().toISOString()
      };
    }
    return {
      success: true,
      data: model,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * 35. 创建AI模型
   */
  async createAIModel(modelData: any): Promise<ApiResponse<any>> {
    await delay(600);
    const newModel = {
      modelId: `MODEL_${Date.now()}`,
      ...modelData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    MockDataStorage.saveAIModel(newModel);
    return {
      success: true,
      data: newModel,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * 36. 更新AI模型
   */
  async updateAIModel(modelId: string, modelData: any): Promise<ApiResponse<any>> {
    await delay(600);
    const updatedModel = {
      ...modelData,
      updatedAt: new Date().toISOString()
    };
    MockDataStorage.updateAIModel(modelId, updatedModel);
    return {
      success: true,
      data: updatedModel,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * 37. 删除AI模型
   */
  async deleteAIModel(modelId: string): Promise<ApiResponse<void>> {
    await delay(400);
    MockDataStorage.deleteAIModel(modelId);
    return {
      success: true,
      timestamp: new Date().toISOString()
    };
  },

  // ============================================================
  // AI本体构建 API
  // ============================================================

  /**
   * 38. 开始AI本体构建
   */
  async startAIOntologyBuild(config: any): Promise<ApiResponse<{ taskId: string; result: any }>> {
    await delay(500);
    const taskId = `TASK_${Date.now()}`;

    // 直接生成结果
    const result = generateMockOntologyData(config);

    // 保存任务为已完成状态
    const task = {
      taskId,
      config,
      status: 'completed',
      progress: 100,
      currentStep: '构建完成',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString()
    };

    localStorage.setItem(`ai_build_task_${taskId}`, JSON.stringify(task));
    localStorage.setItem(`ai_build_result_${taskId}`, JSON.stringify(result));

    return {
      success: true,
      data: { taskId, result },
      timestamp: new Date().toISOString()
    };
  },

  /**
   * 39. 获取AI本体构建进度
   */
  async getAIOntologyBuildProgress(taskId: string): Promise<ApiResponse<any>> {
    await delay(200);
    const taskStr = localStorage.getItem(`ai_build_task_${taskId}`);

    if (!taskStr) {
      return {
        success: false,
        error: { code: '404', message: '任务未找到' },
        timestamp: new Date().toISOString()
      };
    }

    const task = JSON.parse(taskStr);
    return {
      success: true,
      data: task,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * 40. 获取AI本体构建结果
   */
  async getAIOntologyBuildResult(taskId: string): Promise<ApiResponse<any>> {
    await delay(300);
    const resultStr = localStorage.getItem(`ai_build_result_${taskId}`);

    if (!resultStr) {
      return {
        success: false,
        error: { code: '404', message: '构建结果未找到' },
        timestamp: new Date().toISOString()
      };
    }

    const result = JSON.parse(resultStr);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * 41. 保存生成的本体
   */
  async saveGeneratedOntology(ontology: any): Promise<ApiResponse<{ success: boolean }>> {
    await delay(500);

    // 这里应该将生成的本体保存到 ontologyData 中
    // 简单起见，我们先保存到 localStorage
    const savedOntologies = JSON.parse(localStorage.getItem('saved_ontologies') || '[]');
    savedOntologies.push({
      ...ontology,
      savedAt: new Date().toISOString()
    });
    localStorage.setItem('saved_ontologies', JSON.stringify(savedOntologies));

    return {
      success: true,
      data: { success: true },
      timestamp: new Date().toISOString()
    };
  },

  // ============================================================
  // AI知识构建 API
  // ============================================================

  /**
   * 42. 开始AI知识构建
   */
  async startAIKnowledgeBuild(config: any): Promise<ApiResponse<{ taskId: string; result: any }>> {
    await delay(500);
    const taskId = `TASK_KNOWLEDGE_${Date.now()}`;

    // 直接生成结果
    const result = generateMockKnowledgeData(config);

    return {
      success: true,
      data: { taskId, result },
      timestamp: new Date().toISOString()
    };
  },

  /**
   * 43. 保存生成的知识实例
   */
  async saveGeneratedKnowledge(knowledge: any): Promise<ApiResponse<{ success: boolean }>> {
    await delay(500);

    // 保存到 localStorage
    const savedKnowledge = JSON.parse(localStorage.getItem('saved_knowledge') || '[]');
    savedKnowledge.push({
      ...knowledge,
      savedAt: new Date().toISOString()
    });
    localStorage.setItem('saved_knowledge', JSON.stringify(savedKnowledge));

    return {
      success: true,
      data: { success: true },
      timestamp: new Date().toISOString()
    };
  },

  /**
   * 模拟构建过程（内部方法）
   */
  simulateBuildProcess(taskId: string): void {
    const steps = [
      { status: 'analyzing', progress: 20, step: '正在分析文档内容...', details: '已识别关键词 152 个' },
      { status: 'extracting', progress: 40, step: '正在提取领域概念...', details: '已提取候选概念 28 个' },
      { status: 'defining', progress: 60, step: '正在定义概念属性...', details: '已定义属性 85 个' },
      { status: 'generating', progress: 80, step: '正在构建关系网络...', details: '已建立关系 42 个' },
      { status: 'completed', progress: 100, step: '构建完成', details: '' }
    ];

    let currentStepIndex = 0;

    const interval = setInterval(() => {
      if (currentStepIndex >= steps.length) {
        clearInterval(interval);

        // 生成模拟结果
        const taskStr = localStorage.getItem(`ai_build_task_${taskId}`);
        if (taskStr) {
          const task = JSON.parse(taskStr);
          const result = generateMockOntologyData(task.config);
          localStorage.setItem(`ai_build_result_${taskId}`, JSON.stringify(result));
        }

        return;
      }

      const stepData = steps[currentStepIndex];
      const taskStr = localStorage.getItem(`ai_build_task_${taskId}`);

      if (taskStr) {
        const task = JSON.parse(taskStr);
        task.status = stepData.status;
        task.progress = stepData.progress;
        task.currentStep = stepData.step;
        task.stepDetails = stepData.details;

        if (stepData.status === 'completed') {
          task.endTime = new Date().toISOString();
        }

        localStorage.setItem(`ai_build_task_${taskId}`, JSON.stringify(task));
      }

      currentStepIndex++;
    }, 2000);
  },

  async resetAllData(): Promise<ApiResponse<void>> { await delay(); MockDataStorage.reset(); return { success: true, timestamp: new Date().toISOString() }; }
};

/**
 * 生成模拟的本体数据（独立函数）
 * 根据不同框架和描述生成符合业务逻辑的本体
 */
function generateMockOntologyData(config: any): any {
  const conceptCount = Math.floor(
    (config.parameters.conceptCountRange[0] + config.parameters.conceptCountRange[1]) / 2
  );

  // 根据框架类型选择合适的概念模板
  const conceptTemplates = getConceptTemplatesByFramework(config.baseFramework, config.context.description);

  const concepts = [];
  const timestamp = Date.now();

  for (let i = 0; i < Math.min(conceptCount, conceptTemplates.length); i++) {
    const template = conceptTemplates[i];

    const concept = {
      ontologyId: `GENERATED_${timestamp}_${i}`,
      name: template.name,
      type: 'feature',
      version: '1.0.0',
      description: template.description,
      dimensions: [],
      conceptType: template.conceptType,
      packageId: config.parameters.packageName,
      level: config.parameters.level,
      attributes: config.parameters.includeAttributes ? template.attributes : [],
      relationships: config.parameters.includeRelationships && i > 0 ? [
        {
          relationshipId: `REL_${timestamp}_${i}_001`,
          relationshipType: template.relationshipType || 'IS_A',
          sourceConceptId: `GENERATED_${timestamp}_${i}`,
          targetConceptId: `GENERATED_${timestamp}_${Math.max(0, i - 1)}`,
          direction: 'outgoing',
          cardinality: '1:1',
          description: `${template.name} 与 ${conceptTemplates[Math.max(0, i - 1)].name} 的关系`
        }
      ] : [],
      constraints: config.parameters.includeConstraints ? template.constraints : [],
      examples: config.parameters.includeExamples ? template.examples : [],
      tags: ['AI生成', config.parameters.packageName, template.domain]
    };

    concepts.push(concept);
  }

  return {
    packageId: `PKG_GENERATED_${timestamp}`,
    packageName: config.parameters.packageName,
    packageType: config.parameters.packageType,
    level: config.parameters.level,
    concepts,
    confidence: 0.85,
    reasoning: `基于框架"${config.baseFrameworkName}"和描述"${config.context.description}"，AI分析识别出${concepts.length}个核心概念。这些概念涵盖了心理分析领域的关键知识点，并建立了合理的层次关系和语义关联。`,
    suggestions: [
      '建议补充更多的领域特定属性来增强概念表达力',
      '可以引入跨层级的语义关系以支持复杂推理',
      '建议添加更多实际案例作为概念示例，增强可理解性'
    ]
  };
}

/**
 * 根据框架类型和描述获取概念模板
 */
function getConceptTemplatesByFramework(framework: string, description: string): any[] {
  // 检测描述中的关键词，判断具体领域
  const lowerDesc = description.toLowerCase();
  const isEmotionRelated = /情绪|情感|心情/.test(description);
  const isCognitiveRelated = /认知|思维|记忆|注意/.test(description);
  const isBehaviorRelated = /行为|动作|表现/.test(description);
  const isInterrogationRelated = /审讯|询问|问话|审问/.test(description);

  switch (framework) {
    case 'meta':
      return getMetaLevelTemplates();

    case 'upper':
      return getUpperLevelTemplates();

    case 'psychology':
      if (isEmotionRelated) return getEmotionTemplates();
      if (isCognitiveRelated) return getCognitiveTemplates();
      if (isBehaviorRelated) return getBehaviorTemplates();
      return getPsychologyGeneralTemplates();

    case 'domain':
      if (isInterrogationRelated) return getInterrogationDomainTemplates();
      return getDomainGeneralTemplates();

    case 'scratch':
      // 从零开始，结合描述智能生成
      return getCustomTemplates(description);

    default:
      return getPsychologyGeneralTemplates();
  }
}

/**
 * 元模型层概念模板
 */
function getMetaLevelTemplates(): any[] {
  return [
    {
      name: 'Observable（可观测）',
      conceptType: 'Observable',
      description: '通过感知、传感器或量表可直接获得的数据，包括外显行为、生理指标、语言表达等',
      domain: '元模型',
      attributes: [
        { attributeId: 'ATTR_001', attributeName: 'observableId', dataType: 'string', required: true, description: '可观测项唯一标识' },
        { attributeId: 'ATTR_002', attributeName: 'observableType', dataType: 'enum', required: true, description: '可观测类型', enumValues: ['verbal', 'nonverbal', 'physiological'] },
        { attributeId: 'ATTR_003', attributeName: 'timestamp', dataType: 'string', required: true, description: '观测时间' },
        { attributeId: 'ATTR_004', attributeName: 'confidence', dataType: 'number', required: true, description: '观测置信度 (0-1)' }
      ],
      relationshipType: 'OBSERVED_FROM',
      constraints: ['observableId必须唯一', 'confidence必须在0-1之间', 'timestamp必须符合ISO 8601格式'],
      examples: ['语速加快（verbal类型）', '手部颤抖（nonverbal类型）', '心率增加（physiological类型）']
    },
    {
      name: 'InternalState（内部状态）',
      conceptType: 'InternalState',
      description: '不可直接观测的心理状态，需通过Observable进行推断，如情绪、认知、动机等',
      domain: '元模型',
      attributes: [
        { attributeId: 'ATTR_005', attributeName: 'stateId', dataType: 'string', required: true, description: '状态唯一标识' },
        { attributeId: 'ATTR_006', attributeName: 'stateType', dataType: 'enum', required: true, description: '状态类型', enumValues: ['emotion', 'cognition', 'motivation'] },
        { attributeId: 'ATTR_007', attributeName: 'intensity', dataType: 'number', required: false, description: '状态强度 (0-100)' }
      ],
      relationshipType: 'INFERRED_FROM',
      constraints: ['stateId必须唯一', 'intensity范围为0-100'],
      examples: ['焦虑状态', '认知负荷过载', '回避动机']
    },
    {
      name: 'Inference（推断规则）',
      conceptType: 'Inference',
      description: '从Observable推断InternalState的逻辑规则，支持IF-THEN形式的条件推理',
      domain: '元模型',
      attributes: [
        { attributeId: 'ATTR_008', attributeName: 'ruleId', dataType: 'string', required: true, description: '规则唯一标识' },
        { attributeId: 'ATTR_009', attributeName: 'condition', dataType: 'string', required: true, description: 'IF条件表达式' },
        { attributeId: 'ATTR_010', attributeName: 'conclusion', dataType: 'string', required: true, description: 'THEN结论' },
        { attributeId: 'ATTR_011', attributeName: 'confidence', dataType: 'number', required: true, description: '规则置信度' }
      ],
      relationshipType: 'APPLIES_TO',
      constraints: ['ruleId必须唯一', 'condition不能为空', 'confidence范围0-1'],
      examples: ['IF 语速加快 AND 音调升高 THEN 焦虑状态', 'IF 回避眼神接触 AND 肢体后缩 THEN 防御心理']
    },
    {
      name: 'Entity（实体）',
      conceptType: 'Entity',
      description: '所有可被单独引用的对象，包括人、事件、环境等',
      domain: '元模型',
      attributes: [
        { attributeId: 'ATTR_012', attributeName: 'entityId', dataType: 'string', required: true, description: '实体唯一标识' },
        { attributeId: 'ATTR_013', attributeName: 'entityType', dataType: 'enum', required: true, description: '实体类型', enumValues: ['Person', 'Event', 'Environment'] },
        { attributeId: 'ATTR_014', attributeName: 'properties', dataType: 'array', required: false, description: '实体属性集合' }
      ],
      relationshipType: 'HAS_A',
      constraints: ['entityId必须唯一', 'entityType必须是预定义值'],
      examples: ['被审讯人（Person）', '审讯事件（Event）', '审讯室环境（Environment）']
    },
    {
      name: 'Action（动作）',
      conceptType: 'Action',
      description: '实体执行的动作或行为，可触发状态变化',
      domain: '元模型',
      attributes: [
        { attributeId: 'ATTR_015', attributeName: 'actionId', dataType: 'string', required: true, description: '动作唯一标识' },
        { attributeId: 'ATTR_016', attributeName: 'actionType', dataType: 'string', required: true, description: '动作类型' },
        { attributeId: 'ATTR_017', attributeName: 'duration', dataType: 'number', required: false, description: '持续时间（秒）' }
      ],
      relationshipType: 'TRIGGERS',
      constraints: ['actionId必须唯一', 'duration必须为正数'],
      examples: ['回答问题', '沉默不语', '改变坐姿']
    }
  ];
}

/**
 * 上层本体概念模板
 */
function getUpperLevelTemplates(): any[] {
  return [
    {
      name: 'Emotion（情绪）',
      conceptType: 'Concept',
      description: '个体对外界刺激的主观体验和心理反应，包括积极情绪和消极情绪',
      domain: '上层本体',
      attributes: [
        { attributeId: 'ATTR_020', attributeName: 'emotionId', dataType: 'string', required: true, description: '情绪唯一标识' },
        { attributeId: 'ATTR_021', attributeName: 'valence', dataType: 'enum', required: true, description: '情绪效价', enumValues: ['positive', 'negative', 'neutral'] },
        { attributeId: 'ATTR_022', attributeName: 'arousal', dataType: 'number', required: true, description: '唤醒度 (0-100)' },
        { attributeId: 'ATTR_023', attributeName: 'intensity', dataType: 'number', required: true, description: '强度 (0-100)' }
      ],
      relationshipType: 'IS_A',
      constraints: ['emotionId必须唯一', 'arousal和intensity范围0-100'],
      examples: ['快乐', '焦虑', '愤怒', '恐惧', '悲伤']
    },
    {
      name: 'CognitiveProcess（认知过程）',
      conceptType: 'Concept',
      description: '个体的信息加工过程，包括感知、注意、记忆、思维、决策等',
      domain: '上层本体',
      attributes: [
        { attributeId: 'ATTR_024', attributeName: 'processId', dataType: 'string', required: true, description: '过程唯一标识' },
        { attributeId: 'ATTR_025', attributeName: 'processType', dataType: 'enum', required: true, description: '过程类型', enumValues: ['perception', 'attention', 'memory', 'thinking', 'decision'] },
        { attributeId: 'ATTR_026', attributeName: 'loadLevel', dataType: 'number', required: false, description: '认知负荷水平 (0-100)' }
      ],
      relationshipType: 'INVOLVES',
      constraints: ['processId必须唯一', 'loadLevel范围0-100'],
      examples: ['工作记忆处理', '选择性注意', '逻辑推理']
    },
    {
      name: 'Behavior（行为）',
      conceptType: 'Concept',
      description: '个体的外显动作和反应，可以被直接观察和记录',
      domain: '上层本体',
      attributes: [
        { attributeId: 'ATTR_027', attributeName: 'behaviorId', dataType: 'string', required: true, description: '行为唯一标识' },
        { attributeId: 'ATTR_028', attributeName: 'behaviorType', dataType: 'enum', required: true, description: '行为类型', enumValues: ['verbal', 'nonverbal', 'physiological'] },
        { attributeId: 'ATTR_029', attributeName: 'frequency', dataType: 'number', required: false, description: '频率（次/分钟）' }
      ],
      relationshipType: 'MANIFESTS_AS',
      constraints: ['behaviorId必须唯一', 'frequency必须为非负数'],
      examples: ['语言回答', '手势动作', '面部表情']
    },
    {
      name: 'Personality（人格特质）',
      conceptType: 'Concept',
      description: '个体稳定的心理特征和行为倾向，影响其对环境的反应方式',
      domain: '上层本体',
      attributes: [
        { attributeId: 'ATTR_030', attributeName: 'traitId', dataType: 'string', required: true, description: '特质唯一标识' },
        { attributeId: 'ATTR_031', attributeName: 'dimension', dataType: 'string', required: true, description: '人格维度' },
        { attributeId: 'ATTR_032', attributeName: 'score', dataType: 'number', required: true, description: '得分 (0-100)' }
      ],
      relationshipType: 'INFLUENCES',
      constraints: ['traitId必须唯一', 'score范围0-100'],
      examples: ['外向性', '神经质', '开放性']
    },
    {
      name: 'SocialRelation（社会关系）',
      conceptType: 'Concept',
      description: '个体与他人之间的互动关系和社会联结',
      domain: '上层本体',
      attributes: [
        { attributeId: 'ATTR_033', attributeName: 'relationId', dataType: 'string', required: true, description: '关系唯一标识' },
        { attributeId: 'ATTR_034', attributeName: 'relationType', dataType: 'string', required: true, description: '关系类型' },
        { attributeId: 'ATTR_035', attributeName: 'strength', dataType: 'number', required: false, description: '关系强度 (0-100)' }
      ],
      relationshipType: 'RELATES_TO',
      constraints: ['relationId必须唯一', 'strength范围0-100'],
      examples: ['合作关系', '冲突关系', '依赖关系']
    }
  ];
}

/**
 * 情绪相关心理学本体模板
 */
function getEmotionTemplates(): any[] {
  return [
    {
      name: 'Joy（快乐）',
      conceptType: 'Emotion',
      description: '积极情绪，表现为愉悦、满足、欢欣的主观体验',
      domain: '情绪心理学',
      attributes: [
        { attributeId: 'ATTR_040', attributeName: 'joyLevel', dataType: 'number', required: true, description: '快乐程度 (0-100)' },
        { attributeId: 'ATTR_041', attributeName: 'source', dataType: 'string', required: false, description: '快乐来源' }
      ],
      relationshipType: 'IS_A',
      constraints: ['joyLevel范围0-100'],
      examples: ['微笑表情', '愉快语调', '放松姿态']
    },
    {
      name: 'Anxiety（焦虑）',
      conceptType: 'Emotion',
      description: '消极情绪，表现为紧张、担忧、不安的主观体验和生理唤醒',
      domain: '情绪心理学',
      attributes: [
        { attributeId: 'ATTR_042', attributeName: 'anxietyLevel', dataType: 'number', required: true, description: '焦虑程度 (0-100)' },
        { attributeId: 'ATTR_043', attributeName: 'trigger', dataType: 'string', required: false, description: '焦虑触发因素' }
      ],
      relationshipType: 'TRIGGERS',
      constraints: ['anxietyLevel范围0-100'],
      examples: ['语速加快', '手部颤抖', '回避眼神']
    },
    {
      name: 'Fear（恐惧）',
      conceptType: 'Emotion',
      description: '面对威胁时的消极情绪，伴随强烈的生理和行为反应',
      domain: '情绪心理学',
      attributes: [
        { attributeId: 'ATTR_044', attributeName: 'fearLevel', dataType: 'number', required: true, description: '恐惧程度 (0-100)' },
        { attributeId: 'ATTR_045', attributeName: 'threatType', dataType: 'string', required: false, description: '威胁类型' }
      ],
      relationshipType: 'CAUSED_BY',
      constraints: ['fearLevel范围0-100'],
      examples: ['瞳孔放大', '肌肉紧张', '逃避行为']
    },
    {
      name: 'Anger（愤怒）',
      conceptType: 'Emotion',
      description: '受到阻碍或冒犯时的消极情绪，表现为激动和攻击倾向',
      domain: '情绪心理学',
      attributes: [
        { attributeId: 'ATTR_046', attributeName: 'angerLevel', dataType: 'number', required: true, description: '愤怒程度 (0-100)' },
        { attributeId: 'ATTR_047', attributeName: 'direction', dataType: 'enum', required: false, description: '指向', enumValues: ['internal', 'external'] }
      ],
      relationshipType: 'EXPRESSED_AS',
      constraints: ['angerLevel范围0-100'],
      examples: ['音量提高', '面部涨红', '攻击性语言']
    },
    {
      name: 'Sadness（悲伤）',
      conceptType: 'Emotion',
      description: '失落、沮丧的消极情绪，表现为低落和退缩',
      domain: '情绪心理学',
      attributes: [
        { attributeId: 'ATTR_048', attributeName: 'sadnessLevel', dataType: 'number', required: true, description: '悲伤程度 (0-100)' },
        { attributeId: 'ATTR_049', attributeName: 'duration', dataType: 'number', required: false, description: '持续时间（分钟）' }
      ],
      relationshipType: 'RESULTS_IN',
      constraints: ['sadnessLevel范围0-100', 'duration必须为正数'],
      examples: ['语调低沉', '身体下垂', '减少交流']
    },
    {
      name: 'Disgust（厌恶）',
      conceptType: 'Emotion',
      description: '对令人反感事物的排斥情绪',
      domain: '情绪心理学',
      attributes: [
        { attributeId: 'ATTR_050', attributeName: 'disgustLevel', dataType: 'number', required: true, description: '厌恶程度 (0-100)' },
        { attributeId: 'ATTR_051', attributeName: 'target', dataType: 'string', required: false, description: '厌恶对象' }
      ],
      relationshipType: 'DIRECTED_AT',
      constraints: ['disgustLevel范围0-100'],
      examples: ['鼻子皱缩', '身体后退', '否定性评价']
    }
  ];
}

/**
 * 认知相关心理学本体模板
 */
function getCognitiveTemplates(): any[] {
  return [
    {
      name: 'Attention（注意）',
      conceptType: 'CognitiveProcess',
      description: '选择性地关注特定信息，忽略其他刺激的认知过程',
      domain: '认知心理学',
      attributes: [
        { attributeId: 'ATTR_060', attributeName: 'focusTarget', dataType: 'string', required: true, description: '注意焦点' },
        { attributeId: 'ATTR_061', attributeName: 'sustainability', dataType: 'number', required: true, description: '注意持续性 (0-100)' }
      ],
      relationshipType: 'FOCUSES_ON',
      constraints: ['sustainability范围0-100'],
      examples: ['持续注视', '快速转移注意', '分散注意']
    },
    {
      name: 'Memory（记忆）',
      conceptType: 'CognitiveProcess',
      description: '信息的编码、存储和提取过程',
      domain: '认知心理学',
      attributes: [
        { attributeId: 'ATTR_062', attributeName: 'memoryType', dataType: 'enum', required: true, description: '记忆类型', enumValues: ['working', 'shortterm', 'longterm'] },
        { attributeId: 'ATTR_063', attributeName: 'accuracy', dataType: 'number', required: true, description: '记忆准确性 (0-100)' }
      ],
      relationshipType: 'STORES',
      constraints: ['accuracy范围0-100'],
      examples: ['事件回忆', '细节遗忘', '虚假记忆']
    },
    {
      name: 'Reasoning（推理）',
      conceptType: 'CognitiveProcess',
      description: '从已知信息推导新结论的思维过程',
      domain: '认知心理学',
      attributes: [
        { attributeId: 'ATTR_064', attributeName: 'reasoningType', dataType: 'enum', required: true, description: '推理类型', enumValues: ['deductive', 'inductive', 'abductive'] },
        { attributeId: 'ATTR_065', attributeName: 'logicality', dataType: 'number', required: true, description: '逻辑性 (0-100)' }
      ],
      relationshipType: 'DERIVES',
      constraints: ['logicality范围0-100'],
      examples: ['演绎推理', '归纳推理', '类比推理']
    },
    {
      name: 'DecisionMaking（决策）',
      conceptType: 'CognitiveProcess',
      description: '在多个选项中进行选择的认知过程',
      domain: '认知心理学',
      attributes: [
        { attributeId: 'ATTR_066', attributeName: 'strategy', dataType: 'string', required: true, description: '决策策略' },
        { attributeId: 'ATTR_067', attributeName: 'speed', dataType: 'number', required: true, description: '决策速度（秒）' }
      ],
      relationshipType: 'CHOOSES',
      constraints: ['speed必须为正数'],
      examples: ['快速决策', '深思熟虑', '冲动决策']
    },
    {
      name: 'ProblemSolving（问题解决）',
      conceptType: 'CognitiveProcess',
      description: '克服障碍达成目标的认知过程',
      domain: '认知心理学',
      attributes: [
        { attributeId: 'ATTR_068', attributeName: 'approach', dataType: 'string', required: true, description: '解决途径' },
        { attributeId: 'ATTR_069', attributeName: 'efficiency', dataType: 'number', required: true, description: '效率 (0-100)' }
      ],
      relationshipType: 'SOLVES',
      constraints: ['efficiency范围0-100'],
      examples: ['算法策略', '启发式方法', '试错法']
    }
  ];
}

/**
 * 行为相关心理学本体模板
 */
function getBehaviorTemplates(): any[] {
  return [
    {
      name: 'VerbalBehavior（言语行为）',
      conceptType: 'Behavior',
      description: '通过语言表达的外显行为',
      domain: '行为心理学',
      attributes: [
        { attributeId: 'ATTR_070', attributeName: 'content', dataType: 'string', required: true, description: '言语内容' },
        { attributeId: 'ATTR_071', attributeName: 'tone', dataType: 'string', required: false, description: '语调特征' },
        { attributeId: 'ATTR_072', attributeName: 'speed', dataType: 'number', required: false, description: '语速（字/分）' }
      ],
      relationshipType: 'EXPRESSES',
      constraints: ['speed必须为正数'],
      examples: ['快速辩解', '沉默不语', '重复陈述']
    },
    {
      name: 'FacialExpression（面部表情）',
      conceptType: 'Behavior',
      description: '通过面部肌肉运动表达的非言语行为',
      domain: '行为心理学',
      attributes: [
        { attributeId: 'ATTR_073', attributeName: 'expressionType', dataType: 'enum', required: true, description: '表情类型', enumValues: ['smile', 'frown', 'neutral', 'surprise'] },
        { attributeId: 'ATTR_074', attributeName: 'intensity', dataType: 'number', required: true, description: '表情强度 (0-100)' }
      ],
      relationshipType: 'REFLECTS',
      constraints: ['intensity范围0-100'],
      examples: ['微笑', '皱眉', '瞪眼']
    },
    {
      name: 'BodyLanguage（肢体语言）',
      conceptType: 'Behavior',
      description: '通过身体姿态和动作传递的非言语信息',
      domain: '行为心理学',
      attributes: [
        { attributeId: 'ATTR_075', attributeName: 'postureType', dataType: 'string', required: true, description: '姿态类型' },
        { attributeId: 'ATTR_076', attributeName: 'openness', dataType: 'number', required: true, description: '开放度 (0-100)' }
      ],
      relationshipType: 'INDICATES',
      constraints: ['openness范围0-100'],
      examples: ['双臂交叉', '前倾身体', '坐立不安']
    },
    {
      name: 'EyeContact（眼神接触）',
      conceptType: 'Behavior',
      description: '通过视线方向和接触时长传递的信息',
      domain: '行为心理学',
      attributes: [
        { attributeId: 'ATTR_077', attributeName: 'duration', dataType: 'number', required: true, description: '接触时长（秒）' },
        { attributeId: 'ATTR_078', attributeName: 'frequency', dataType: 'number', required: true, description: '接触频率（次/分）' }
      ],
      relationshipType: 'SIGNALS',
      constraints: ['duration和frequency必须为正数'],
      examples: ['直视', '回避眼神', '游移不定']
    },
    {
      name: 'Gesture（手势）',
      conceptType: 'Behavior',
      description: '通过手部动作传递信息或强调观点',
      domain: '行为心理学',
      attributes: [
        { attributeId: 'ATTR_079', attributeName: 'gestureType', dataType: 'string', required: true, description: '手势类型' },
        { attributeId: 'ATTR_080', attributeName: 'amplitude', dataType: 'number', required: false, description: '动作幅度 (0-100)' }
      ],
      relationshipType: 'ACCOMPANIES',
      constraints: ['amplitude范围0-100'],
      examples: ['指点手势', '防御性手势', '强调性手势']
    }
  ];
}

/**
 * 心理学通用模板
 */
function getPsychologyGeneralTemplates(): any[] {
  return [
    ...getEmotionTemplates().slice(0, 3),
    ...getCognitiveTemplates().slice(0, 2),
    ...getBehaviorTemplates().slice(0, 3)
  ];
}

/**
 * 审讯领域本体模板
 */
function getInterrogationDomainTemplates(): any[] {
  return [
    {
      name: 'InterrogationResponse（审讯回应）',
      conceptType: 'Action',
      description: '被审讯人对问题的言语和非言语回应',
      domain: '司法审讯',
      attributes: [
        { attributeId: 'ATTR_090', attributeName: 'responseType', dataType: 'enum', required: true, description: '回应类型', enumValues: ['direct', 'evasive', 'denial', 'confession'] },
        { attributeId: 'ATTR_091', attributeName: 'latency', dataType: 'number', required: true, description: '回应延迟（秒）' },
        { attributeId: 'ATTR_092', attributeName: 'consistency', dataType: 'number', required: true, description: '一致性 (0-100)' }
      ],
      relationshipType: 'RESPONDS_TO',
      constraints: ['latency必须为正数', 'consistency范围0-100'],
      examples: ['直接回答', '转移话题', '矛盾陈述']
    },
    {
      name: 'DeceptionIndicator（欺骗指标）',
      conceptType: 'Observable',
      description: '可能提示欺骗行为的外显特征',
      domain: '司法审讯',
      attributes: [
        { attributeId: 'ATTR_093', attributeName: 'indicatorType', dataType: 'string', required: true, description: '指标类型' },
        { attributeId: 'ATTR_094', attributeName: 'reliability', dataType: 'number', required: true, description: '可靠性 (0-100)' }
      ],
      relationshipType: 'SUGGESTS',
      constraints: ['reliability范围0-100'],
      examples: ['微表情泄漏', '语言矛盾', '生理应激']
    },
    {
      name: 'DefenseMechanism（防御机制）',
      conceptType: 'InternalState',
      description: '被审讯人保护自我的心理策略',
      domain: '司法审讯',
      attributes: [
        { attributeId: 'ATTR_095', attributeName: 'mechanismType', dataType: 'enum', required: true, description: '机制类型', enumValues: ['denial', 'projection', 'rationalization'] },
        { attributeId: 'ATTR_096', attributeName: 'strength', dataType: 'number', required: true, description: '强度 (0-100)' }
      ],
      relationshipType: 'PROTECTS_AGAINST',
      constraints: ['strength范围0-100'],
      examples: ['否认事实', '归咎他人', '合理化辩解']
    },
    {
      name: 'StressCue（压力线索）',
      conceptType: 'Observable',
      description: '反映心理压力水平的生理和行为指标',
      domain: '司法审讯',
      attributes: [
        { attributeId: 'ATTR_097', attributeName: 'cueType', dataType: 'enum', required: true, description: '线索类型', enumValues: ['physiological', 'behavioral', 'verbal'] },
        { attributeId: 'ATTR_098', attributeName: 'intensity', dataType: 'number', required: true, description: '强度 (0-100)' }
      ],
      relationshipType: 'INDICATES',
      constraints: ['intensity范围0-100'],
      examples: ['出汗增多', '声音颤抖', '坐立不安']
    },
    {
      name: 'CooperationLevel（配合程度）',
      conceptType: 'InternalState',
      description: '被审讯人与审讯人员合作的意愿和程度',
      domain: '司法审讯',
      attributes: [
        { attributeId: 'ATTR_099', attributeName: 'level', dataType: 'number', required: true, description: '配合水平 (0-100)' },
        { attributeId: 'ATTR_100', attributeName: 'trend', dataType: 'enum', required: false, description: '变化趋势', enumValues: ['increasing', 'stable', 'decreasing'] }
      ],
      relationshipType: 'DETERMINES',
      constraints: ['level范围0-100'],
      examples: ['主动配合', '消极抵抗', '完全拒绝']
    },
    {
      name: 'MemoryRecall（记忆回忆）',
      conceptType: 'CognitiveProcess',
      description: '被审讯人对事件的记忆提取过程',
      domain: '司法审讯',
      attributes: [
        { attributeId: 'ATTR_101', attributeName: 'detail', dataType: 'string', required: true, description: '回忆细节' },
        { attributeId: 'ATTR_102', attributeName: 'clarity', dataType: 'number', required: true, description: '清晰度 (0-100)' },
        { attributeId: 'ATTR_103', attributeName: 'consistency', dataType: 'number', required: true, description: '前后一致性 (0-100)' }
      ],
      relationshipType: 'RETRIEVES',
      constraints: ['clarity和consistency范围0-100'],
      examples: ['清晰回忆', '模糊记忆', '选择性遗忘']
    }
  ];
}

/**
 * 领域通用模板
 */
function getDomainGeneralTemplates(): any[] {
  return [
    {
      name: 'DomainEntity（领域实体）',
      conceptType: 'Entity',
      description: '特定领域的核心实体对象',
      domain: '领域本体',
      attributes: [
        { attributeId: 'ATTR_110', attributeName: 'entityName', dataType: 'string', required: true, description: '实体名称' },
        { attributeId: 'ATTR_111', attributeName: 'properties', dataType: 'array', required: false, description: '属性集合' }
      ],
      relationshipType: 'BELONGS_TO',
      constraints: ['entityName不能为空'],
      examples: ['领域对象1', '领域对象2', '领域对象3']
    },
    {
      name: 'DomainAction（领域动作）',
      conceptType: 'Action',
      description: '特定领域的典型动作或操作',
      domain: '领域本体',
      attributes: [
        { attributeId: 'ATTR_112', attributeName: 'actionName', dataType: 'string', required: true, description: '动作名称' },
        { attributeId: 'ATTR_113', attributeName: 'parameters', dataType: 'array', required: false, description: '参数列表' }
      ],
      relationshipType: 'PERFORMS',
      constraints: ['actionName不能为空'],
      examples: ['领域操作1', '领域操作2', '领域操作3']
    }
  ];
}

/**
 * 自定义模板（基于描述智能生成）
 */
function getCustomTemplates(description: string): any[] {
  // 简单的关键词提取
  const keywords = description.match(/[\u4e00-\u9fa5]{2,}/g) || [];

  return keywords.slice(0, 10).map((keyword, index) => ({
    name: keyword,
    conceptType: 'Concept',
    description: `基于描述生成的${keyword}相关概念`,
    domain: '自定义领域',
    attributes: [
      { attributeId: `ATTR_${200 + index}_001`, attributeName: `${keyword}Id`, dataType: 'string', required: true, description: '唯一标识' },
      { attributeId: `ATTR_${200 + index}_002`, attributeName: `${keyword}Name`, dataType: 'string', required: true, description: '名称' },
      { attributeId: `ATTR_${200 + index}_003`, attributeName: 'value', dataType: 'string', required: false, description: '值' }
    ],
    relationshipType: 'RELATES_TO',
    constraints: [`${keyword}Id必须唯一`],
    examples: [`${keyword}示例1`, `${keyword}示例2`]
  }));
}

/**
 * 生成模拟的知识实例数据（独立函数）
 * 根据配置生成符合业务逻辑的知识实例
 */
function generateMockKnowledgeData(config: any): any {
  const instanceCount = Math.floor(
    (config.parameters.instanceCountRange[0] + config.parameters.instanceCountRange[1]) / 2
  );

  const instances = [];
  const timestamp = Date.now();

  // 知识实例类型和模板
  const instanceTemplates = getKnowledgeInstanceTemplates(config);

  for (let i = 0; i < Math.min(instanceCount, instanceTemplates.length); i++) {
    const template = instanceTemplates[i];

    const instance = {
      instanceId: `INST_${template.type}_${timestamp}_${i}`,
      instanceName: template.name,
      instanceType: template.type,
      sourceOntologyId: template.ontologyId,
      sourceOntologyName: template.ontologyName,
      sourcePackageId: 'PKG_PSYCHOLOGY_001',
      knowledgeBaseId: config.knowledgeBaseId,
      attributeValues: template.attributeValues,
      confidence: template.confidence,
      tags: ['AI生成', template.domain],
      createdBy: 'AI_SYSTEM',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    instances.push(instance);
  }

  return {
    knowledgeBaseId: config.knowledgeBaseId,
    instances,
    confidence: 0.85,
    reasoning: `基于描述"${config.context.description}"，AI分析生成了${instances.length}个心理分析相关的知识实例。这些实例涵盖了可观测特征、心理状态、推理规则等关键知识点。`,
    suggestions: [
      '建议进一步丰富实例的属性值以提升分析精度',
      '可以添加更多实例之间的关联关系',
      '建议基于实际案例验证和优化这些知识实例'
    ]
  };
}

/**
 * 获取知识实例模板
 */
function getKnowledgeInstanceTemplates(config: any): any[] {
  const description = config.context.description || '';
  const lowerDesc = description.toLowerCase();

  // 根据描述关键词选择不同的模板
  if (/焦虑|紧张|不安/.test(description)) {
    return getAnxietyKnowledgeTemplates();
  } else if (/愤怒|生气|激动/.test(description)) {
    return getAngerKnowledgeTemplates();
  } else if (/欺骗|说谎|撒谎/.test(description)) {
    return getDeceptionKnowledgeTemplates();
  } else {
    return getGeneralKnowledgeTemplates();
  }
}

/**
 * 焦虑相关知识实例模板
 */
function getAnxietyKnowledgeTemplates(): any[] {
  return [
    {
      name: '语速加快_焦虑表现',
      type: 'Observable',
      ontologyId: 'META_OBSERVABLE',
      ontologyName: 'Observable（可观测）',
      domain: '情绪识别',
      confidence: 0.88,
      attributeValues: {
        observableType: 'verbal',
        intensity: 75,
        frequency: 'high',
        description: '说话速度明显快于正常语速，表现为快速连续的言语输出'
      }
    },
    {
      name: '焦虑状态',
      type: 'InternalState',
      ontologyId: 'META_INTERNAL_STATE',
      ontologyName: 'InternalState（内部状态）',
      domain: '情绪识别',
      confidence: 0.85,
      attributeValues: {
        stateType: 'emotion',
        intensity: 70,
        valence: 'negative',
        arousal: 80,
        description: '紧张、担忧、不安的主观体验'
      }
    },
    {
      name: '语速与焦虑推理规则',
      type: 'Inference',
      ontologyId: 'META_INFERENCE',
      ontologyName: 'Inference（推断规则）',
      domain: '情绪识别',
      confidence: 0.82,
      attributeValues: {
        condition: 'IF 语速加快 AND 音调升高',
        conclusion: 'THEN 焦虑状态',
        confidence: 0.82,
        evidenceType: 'statistical',
        description: '基于心理学研究，语速加快通常与焦虑情绪相关'
      }
    },
    {
      name: '手部颤抖_焦虑表现',
      type: 'Observable',
      ontologyId: 'META_OBSERVABLE',
      ontologyName: 'Observable（可观测）',
      domain: '情绪识别',
      confidence: 0.90,
      attributeValues: {
        observableType: 'nonverbal',
        intensity: 65,
        bodyPart: 'hands',
        description: '手部出现不自主的细微颤动'
      }
    },
    {
      name: '回避眼神_焦虑表现',
      type: 'Observable',
      ontologyId: 'META_OBSERVABLE',
      ontologyName: 'Observable（可观测）',
      domain: '情绪识别',
      confidence: 0.78,
      attributeValues: {
        observableType: 'nonverbal',
        intensity: 60,
        description: '避免与对话者进行眼神接触，视线游移'
      }
    },
    {
      name: '心率加快_焦虑生理',
      type: 'Observable',
      ontologyId: 'META_OBSERVABLE',
      ontologyName: 'Observable（可观测）',
      domain: '情绪识别',
      confidence: 0.92,
      attributeValues: {
        observableType: 'physiological',
        intensity: 80,
        metric: 'heartRate',
        baseline: 72,
        current: 95,
        description: '心率明显高于个体基线水平'
      }
    }
  ];
}

/**
 * 愤怒相关知识实例模板
 */
function getAngerKnowledgeTemplates(): any[] {
  return [
    {
      name: '音量提高_愤怒表现',
      type: 'Observable',
      ontologyId: 'META_OBSERVABLE',
      ontologyName: 'Observable（可观测）',
      domain: '情绪识别',
      confidence: 0.89,
      attributeValues: {
        observableType: 'verbal',
        intensity: 85,
        description: '说话音量明显增大，声调激烈'
      }
    },
    {
      name: '愤怒状态',
      type: 'InternalState',
      ontologyId: 'META_INTERNAL_STATE',
      ontologyName: 'InternalState（内部状态）',
      domain: '情绪识别',
      confidence: 0.87,
      attributeValues: {
        stateType: 'emotion',
        intensity: 80,
        valence: 'negative',
        arousal: 90,
        description: '激动、愤慨的情绪状态'
      }
    },
    {
      name: '音量与愤怒推理规则',
      type: 'Inference',
      ontologyId: 'META_INFERENCE',
      ontologyName: 'Inference（推断规则）',
      domain: '情绪识别',
      confidence: 0.84,
      attributeValues: {
        condition: 'IF 音量提高 AND 语气强硬',
        conclusion: 'THEN 愤怒状态',
        confidence: 0.84,
        description: '音量提高通常表示情绪激动或愤怒'
      }
    },
    {
      name: '面部涨红_愤怒表现',
      type: 'Observable',
      ontologyId: 'META_OBSERVABLE',
      ontologyName: 'Observable（可观测）',
      domain: '情绪识别',
      confidence: 0.86,
      attributeValues: {
        observableType: 'nonverbal',
        intensity: 75,
        bodyPart: 'face',
        description: '面部皮肤颜色加深，血液循环加快'
      }
    },
    {
      name: '拳头紧握_愤怒表现',
      type: 'Observable',
      ontologyId: 'META_OBSERVABLE',
      ontologyName: 'Observable（可观测）',
      domain: '情绪识别',
      confidence: 0.83,
      attributeValues: {
        observableType: 'nonverbal',
        intensity: 70,
        bodyPart: 'hands',
        description: '双手握拳，肌肉紧张'
      }
    }
  ];
}

/**
 * 欺骗相关知识实例模板
 */
function getDeceptionKnowledgeTemplates(): any[] {
  return [
    {
      name: '逻辑矛盾_欺骗指标',
      type: 'Observable',
      ontologyId: 'META_OBSERVABLE',
      ontologyName: 'Observable（可观测）',
      domain: '司法审讯',
      confidence: 0.91,
      attributeValues: {
        observableType: 'verbal',
        intensity: 85,
        description: '陈述内容前后矛盾，逻辑不自洽'
      }
    },
    {
      name: '欺骗意图',
      type: 'InternalState',
      ontologyId: 'META_INTERNAL_STATE',
      ontologyName: 'InternalState（内部状态）',
      domain: '司法审讯',
      confidence: 0.80,
      attributeValues: {
        stateType: 'motivation',
        intensity: 75,
        description: '试图隐瞒真相或误导他人'
      }
    },
    {
      name: '矛盾与欺骗推理规则',
      type: 'Inference',
      ontologyId: 'META_INFERENCE',
      ontologyName: 'Inference（推断规则）',
      domain: '司法审讯',
      confidence: 0.88,
      attributeValues: {
        condition: 'IF 逻辑矛盾 AND 回避问题',
        conclusion: 'THEN 可能存在欺骗',
        confidence: 0.88,
        description: '陈述矛盾通常提示存在欺骗行为'
      }
    },
    {
      name: '微表情泄漏_欺骗指标',
      type: 'Observable',
      ontologyId: 'META_OBSERVABLE',
      ontologyName: 'Observable（可观测）',
      domain: '司法审讯',
      confidence: 0.87,
      attributeValues: {
        observableType: 'nonverbal',
        intensity: 80,
        duration: 0.5,
        description: '瞬间出现的真实情绪表情，随即被掩饰'
      }
    },
    {
      name: '触摸鼻子_欺骗指标',
      type: 'Observable',
      ontologyId: 'META_OBSERVABLE',
      ontologyName: 'Observable（可观测）',
      domain: '司法审讯',
      confidence: 0.72,
      attributeValues: {
        observableType: 'nonverbal',
        intensity: 60,
        bodyPart: 'nose',
        description: '频繁触摸或摩擦鼻子，可能提示不适或紧张'
      }
    }
  ];
}

/**
 * 通用知识实例模板
 */
function getGeneralKnowledgeTemplates(): any[] {
  return [
    ...getAnxietyKnowledgeTemplates().slice(0, 3),
    ...getAngerKnowledgeTemplates().slice(0, 2),
    ...getDeceptionKnowledgeTemplates().slice(0, 3)
  ];
}

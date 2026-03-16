
/**
 * 心理分析系统 - LocalStorage 数据存储管理器 (增强版)
 */

import {
  MOCK_CONVERSATIONS,
  MOCK_SCENES,
  MOCK_REPORT_TEMPLATES,
  MOCK_ONTOLOGIES,
  MOCK_KNOWLEDGE_BASES,
  MOCK_GRAPH_DATA,
  MOCK_USER_GROUPS,
  MOCK_USERS,
  MOCK_PERMISSIONS,
  MOCK_AI_MODELS
} from './data';
import { Conversation, Message, KnowledgeBase, SceneTemplate, ReportTemplate, OntologyDefinition } from '../types/index';

const STORAGE_KEYS = {
  CONVERSATIONS: 'psy_conversations',
  SCENES: 'psy_scenes',
  REPORT_TEMPLATES: 'psy_report_templates',
  ONTOLOGIES: 'psy_ontologies',
  KNOWLEDGE_BASES: 'psy_kb',
  KNOWLEDGE_INSTANCES: 'psy_knowledge_instances',
  INIT_FLAG: 'psy_init_completed',
  // 动态生成每个知识库的图谱存储键名
  GRAPH_PREFIX: 'psy_graph_',
  // 用户权限管理
  USER_GROUPS: 'psy_user_groups',
  USERS: 'psy_users',
  PERMISSIONS: 'psy_permissions',
  // 模型管理
  AI_MODELS: 'psy_ai_models'
};

export class MockDataStorage {
  static init() {
    const isInitialized = localStorage.getItem(STORAGE_KEYS.INIT_FLAG);
    if (!isInitialized) {
      console.log('检测到首次运行，正在初始化 Mock 数据...');
      this.setItem(STORAGE_KEYS.CONVERSATIONS, MOCK_CONVERSATIONS);
      this.setItem(STORAGE_KEYS.SCENES, MOCK_SCENES);
      this.setItem(STORAGE_KEYS.REPORT_TEMPLATES, MOCK_REPORT_TEMPLATES);
      this.setItem(STORAGE_KEYS.ONTOLOGIES, MOCK_ONTOLOGIES);
      this.setItem(STORAGE_KEYS.KNOWLEDGE_BASES, MOCK_KNOWLEDGE_BASES);
      // 初始图谱数据
      this.setItem(`${STORAGE_KEYS.GRAPH_PREFIX}KB_PSY_001`, MOCK_GRAPH_DATA);
      // 用户权限数据
      this.setItem(STORAGE_KEYS.USER_GROUPS, MOCK_USER_GROUPS);
      this.setItem(STORAGE_KEYS.USERS, MOCK_USERS);
      this.setItem(STORAGE_KEYS.PERMISSIONS, MOCK_PERMISSIONS);
      // 模型数据
      this.setItem(STORAGE_KEYS.AI_MODELS, MOCK_AI_MODELS);
      localStorage.setItem(STORAGE_KEYS.INIT_FLAG, 'true');
    }
  }

  static reset() {
    localStorage.clear();
    this.init();
  }

  /** 强制重新初始化（用于开发环境数据更新） */
  static forceReinit() {
    console.log('强制重新初始化数据...');
    localStorage.removeItem(STORAGE_KEYS.INIT_FLAG);
    this.init();
    console.log('数据已重新加载！');
  }

  static getItem<T>(key: string): T | null {
    const data = localStorage.getItem(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch (e) {
      console.error(`解析存储项 ${key} 失败:`, e);
      return null;
    }
  }

  static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`保存存储项 ${key} 失败:`, e);
    }
  }

  // --- 图谱相关逻辑 ---
  
  static getGraphData(kbId: string): any {
    const data = this.getItem(`${STORAGE_KEYS.GRAPH_PREFIX}${kbId}`);
    return data || MOCK_GRAPH_DATA;
  }

  static saveGraphData(kbId: string, data: any): void {
    this.setItem(`${STORAGE_KEYS.GRAPH_PREFIX}${kbId}`, data);
  }

  // --- 存量逻辑保持 ---
  static getConversations(): Conversation[] { return this.getItem<Conversation[]>(STORAGE_KEYS.CONVERSATIONS) || []; }
  static getConversation(id: string): Conversation | undefined { return this.getConversations().find(c => c.conversationId === id); }
  static saveConversation(conversation: Conversation) {
    const list = this.getConversations();
    const index = list.findIndex(c => c.conversationId === conversation.conversationId);
    if (index > -1) list[index] = conversation; else list.unshift(conversation);
    this.setItem(STORAGE_KEYS.CONVERSATIONS, list);
  }
  static appendMessage(conversationId: string, message: Message) {
    const conversation = this.getConversation(conversationId);
    if (conversation) { conversation.messages.push(message); conversation.updatedAt = new Date().toISOString(); this.saveConversation(conversation); }
  }
  static deleteConversation(id: string) { const list = this.getConversations().filter(c => c.conversationId !== id); this.setItem(STORAGE_KEYS.CONVERSATIONS, list); }
  static getOntologies(): OntologyDefinition[] { return this.getItem<OntologyDefinition[]>(STORAGE_KEYS.ONTOLOGIES) || []; }
  static getKnowledgeBases(): KnowledgeBase[] { return this.getItem<KnowledgeBase[]>(STORAGE_KEYS.KNOWLEDGE_BASES) || []; }
  static getScenes(): SceneTemplate[] { return this.getItem<SceneTemplate[]>(STORAGE_KEYS.SCENES) || []; }
  static getReportTemplates(): ReportTemplate[] { return this.getItem<ReportTemplate[]>(STORAGE_KEYS.REPORT_TEMPLATES) || []; }

  // --- 场景模板管理（新增）---
  static updateScene(scene: SceneTemplate) {
    const list = this.getScenes();
    const index = list.findIndex(s => s.sceneId === scene.sceneId);
    if (index > -1) {
      list[index] = scene;
      this.setItem(STORAGE_KEYS.SCENES, list);
    }
  }

  // --- 本体管理（新增）---
  static updateOntology(ontology: OntologyDefinition) {
    const list = this.getOntologies();
    const index = list.findIndex(o => o.ontologyId === ontology.ontologyId);
    if (index > -1) {
      list[index] = ontology;
      this.setItem(STORAGE_KEYS.ONTOLOGIES, list);
    }
  }

  // --- 知识实例管理（新增）---
  static getKnowledgeInstances(): any[] {
    return this.getItem(STORAGE_KEYS.KNOWLEDGE_INSTANCES) || [];
  }

  static updateKnowledgeInstance(instance: any) {
    const list = this.getKnowledgeInstances();
    const index = list.findIndex(i => i.instanceId === instance.instanceId);
    if (index > -1) {
      list[index] = instance;
    } else {
      list.push(instance);
    }
    this.setItem(STORAGE_KEYS.KNOWLEDGE_INSTANCES, list);
  }

  // ============================================================
  // 用户权限管理
  // ============================================================

  static getUserGroups(): any[] {
    return this.getItem(STORAGE_KEYS.USER_GROUPS) || [];
  }

  static saveUserGroup(group: any) {
    const list = this.getUserGroups();
    list.push(group);
    this.setItem(STORAGE_KEYS.USER_GROUPS, list);
  }

  static updateUserGroup(groupId: string, groupData: any) {
    const list = this.getUserGroups();
    const index = list.findIndex(g => g.groupId === groupId);
    if (index > -1) {
      list[index] = { ...list[index], ...groupData };
      this.setItem(STORAGE_KEYS.USER_GROUPS, list);
    }
  }

  static deleteUserGroup(groupId: string) {
    const list = this.getUserGroups().filter(g => g.groupId !== groupId);
    this.setItem(STORAGE_KEYS.USER_GROUPS, list);
  }

  static getUsers(): any[] {
    return this.getItem(STORAGE_KEYS.USERS) || [];
  }

  static saveUser(user: any) {
    const list = this.getUsers();
    list.push(user);
    this.setItem(STORAGE_KEYS.USERS, list);
  }

  static updateUser(userId: string, userData: any) {
    const list = this.getUsers();
    const index = list.findIndex(u => u.userId === userId);
    if (index > -1) {
      list[index] = { ...list[index], ...userData };
      this.setItem(STORAGE_KEYS.USERS, list);
    }
  }

  static deleteUser(userId: string) {
    const list = this.getUsers().filter(u => u.userId !== userId);
    this.setItem(STORAGE_KEYS.USERS, list);
  }

  static getPermissions(): any[] {
    return this.getItem(STORAGE_KEYS.PERMISSIONS) || [];
  }

  static savePermission(permission: any) {
    const list = this.getPermissions();
    list.push(permission);
    this.setItem(STORAGE_KEYS.PERMISSIONS, list);
  }

  static deletePermission(permissionId: string) {
    const list = this.getPermissions().filter(p => p.permissionId !== permissionId);
    this.setItem(STORAGE_KEYS.PERMISSIONS, list);
  }

  // ============================================================
  // 模型管理
  // ============================================================

  static getAIModels(): any[] {
    return this.getItem(STORAGE_KEYS.AI_MODELS) || [];
  }

  static saveAIModel(model: any) {
    const list = this.getAIModels();
    list.push(model);
    this.setItem(STORAGE_KEYS.AI_MODELS, list);
  }

  static updateAIModel(modelId: string, modelData: any) {
    const list = this.getAIModels();
    const index = list.findIndex(m => m.modelId === modelId);
    if (index > -1) {
      list[index] = { ...list[index], ...modelData };
      this.setItem(STORAGE_KEYS.AI_MODELS, list);
    }
  }

  static deleteAIModel(modelId: string) {
    const list = this.getAIModels().filter(m => m.modelId !== modelId);
    this.setItem(STORAGE_KEYS.AI_MODELS, list);
  }
}

import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  List,
  Progress,
  Radio,
  Select,
  Segmented,
  Space,
  Statistic,
  Switch,
  Tag,
  Typography,
  message
} from 'antd';
import {
  DeploymentUnitOutlined,
  EditOutlined,
  RadarChartOutlined,
  RollbackOutlined,
  SettingOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import SandboxCanvas from './components/SandboxCanvas';
import LayerController, { LayerConfig, LayerType } from './components/LayerController';
import NodeDetailPanel from './components/NodeDetailPanel';
import NodeEditModal from './components/NodeEditModal';
import NodeContextMenu from './components/NodeContextMenu';
import { isCrossDomainConnection } from './components/EdgeRenderer';
import { SCENES } from '../../mock/dynamic/scenes';
import { ATTACK_PATHS, AttackPath, AttackPhase } from '../../mock/dynamic/attackPaths';
import { DEFENSE_SCENARIOS } from '../../mock/dynamic/defenseScenarios';
import { NetworkConnection, NetworkNode } from '../../types';
import { useCockpitOrchestratorStore, CockpitMode } from '../../store/useCockpitOrchestratorStore';
import {
  buildDefenseCoveragePreview,
  CockpitModelProfile,
  PhaseOutcomeStatus,
  runMockAttackDefenseSimulation
} from './engine/mockAttackDefenseEngine';

const MODEL_PROFILE_OPTIONS: { label: string; value: CockpitModelProfile }[] = [
  { label: 'MITRE ATT&CK', value: 'mitre_attack' },
  { label: 'Kill Chain', value: 'kill_chain' },
  { label: '防护覆盖视角', value: 'defense_coverage' }
];

const MODE_OPTIONS: { label: string; value: CockpitMode }[] = [
  { label: '沙盘总览', value: 'overview' },
  { label: '攻击推演', value: 'attack' },
  { label: '防御仿真', value: 'defense' },
  { label: '攻防联动', value: 'linked' }
];

const PHASE_STATUS_COLOR: Record<PhaseOutcomeStatus, string> = {
  blocked: 'green',
  detected: 'gold',
  bypassed: 'red',
  compromised: 'volcano',
  not_reached: 'default'
};

const PHASE_STATUS_TEXT: Record<PhaseOutcomeStatus, string> = {
  blocked: '阻断',
  detected: '检测',
  bypassed: '绕过',
  compromised: '失陷',
  not_reached: '未到达'
};

type SimulationSource = 'preset' | 'graph';
type EdgeType = 'business_flow' | 'network_link' | 'attack_path';

interface CockpitNodeMeta {
  businessDomain: string;
  businessSystem: string;
  isNetworkInfra: boolean;
}

interface CreateNodeFormValues {
  name: string;
  zone: NetworkNode['zone'];
  deviceCategory: NetworkNode['deviceCategory'];
  nodeType: NetworkNode['nodeType'];
  ipv4Address: string;
  hostname: string;
  criticalityLevel: NonNullable<NetworkNode['criticalityLevel']>;
  securityScore: number;
  attackSurface: number;
  exploitabilityScore: number;
  businessDomain: string;
  businessSystem: string;
}

interface CreateEdgeFormValues {
  sourceNodeId: string;
  targetNodeId: string;
  protocol: NetworkConnection['protocol'];
  bandwidth: string;
  encrypted: boolean;
  bidirectional: boolean;
}

interface ModelTemplate {
  id: string;
  label: string;
  description: string;
  defaultZone: NetworkNode['zone'];
  defaults: Pick<
    CreateNodeFormValues,
    'deviceCategory' | 'nodeType' | 'criticalityLevel' | 'securityScore' | 'attackSurface' | 'exploitabilityScore' | 'businessDomain' | 'businessSystem'
  >;
  naming: {
    namePrefix: string;
    hostPrefix: string;
    ipPrefix: string;
  };
}

const ATTACK_TECHNIQUES = ['T1190', 'T1059', 'T1021', 'T1005', 'T1041'];
const ATTACK_KILL_CHAIN: AttackPhase['killChainPhase'][] = [
  'exploitation',
  'execution',
  'lateral_movement',
  'collection',
  'exfiltration'
];

const DEVICE_CATEGORY_LABELS: Record<NetworkNode['deviceCategory'], string> = {
  server: '服务器',
  router: '路由器',
  switch: '交换机',
  firewall: '防火墙',
  load_balancer: '负载均衡',
  endpoint: '终端',
  iot_device: '物联网',
  web_application: 'Web应用',
  database: '数据库',
  middleware: '中间件',
  container: '容器',
  api_gateway: 'API网关',
  domain_controller: '域控制器'
};

const BUSINESS_DOMAIN_BY_CATEGORY: Partial<Record<NetworkNode['deviceCategory'], string>> = {
  web_application: '互联网业务',
  api_gateway: '互联网业务',
  load_balancer: '互联网业务',
  database: '数据服务',
  middleware: '中台服务',
  endpoint: '办公终端',
  domain_controller: '身份与权限',
  firewall: '网络基础设施',
  switch: '网络基础设施',
  router: '网络基础设施'
};

const MODEL_TEMPLATES: ModelTemplate[] = [
  {
    id: 'template-web-app',
    label: 'Web应用',
    description: '面向互联网入口的应用节点',
    defaultZone: 'dmz',
    defaults: {
      deviceCategory: 'web_application',
      nodeType: 'software',
      criticalityLevel: 'high',
      securityScore: 68,
      attackSurface: 72,
      exploitabilityScore: 7.2,
      businessDomain: '互联网业务',
      businessSystem: '门户系统'
    },
    naming: {
      namePrefix: 'web-app',
      hostPrefix: 'web-app',
      ipPrefix: '192.168.10'
    }
  },
  {
    id: 'template-api-gateway',
    label: 'API网关',
    description: '南北流量聚合与鉴权节点',
    defaultZone: 'dmz',
    defaults: {
      deviceCategory: 'api_gateway',
      nodeType: 'software',
      criticalityLevel: 'high',
      securityScore: 72,
      attackSurface: 64,
      exploitabilityScore: 6.6,
      businessDomain: '互联网业务',
      businessSystem: 'API系统'
    },
    naming: {
      namePrefix: 'api-gateway',
      hostPrefix: 'api-gateway',
      ipPrefix: '192.168.10'
    }
  },
  {
    id: 'template-database',
    label: '数据库',
    description: '核心数据存储节点',
    defaultZone: 'intranet',
    defaults: {
      deviceCategory: 'database',
      nodeType: 'software',
      criticalityLevel: 'critical',
      securityScore: 80,
      attackSurface: 38,
      exploitabilityScore: 4.9,
      businessDomain: '数据服务',
      businessSystem: '核心数据库'
    },
    naming: {
      namePrefix: 'db',
      hostPrefix: 'db',
      ipPrefix: '192.168.20'
    }
  },
  {
    id: 'template-firewall',
    label: '防火墙',
    description: '边界防护与访问控制节点',
    defaultZone: 'intranet',
    defaults: {
      deviceCategory: 'firewall',
      nodeType: 'hardware',
      criticalityLevel: 'high',
      securityScore: 86,
      attackSurface: 18,
      exploitabilityScore: 2.9,
      businessDomain: '网络基础设施',
      businessSystem: '边界防护'
    },
    naming: {
      namePrefix: 'fw',
      hostPrefix: 'fw',
      ipPrefix: '192.168.30'
    }
  },
  {
    id: 'template-endpoint',
    label: '终端主机',
    description: '办公终端与用户入口节点',
    defaultZone: 'intranet',
    defaults: {
      deviceCategory: 'endpoint',
      nodeType: 'hardware',
      criticalityLevel: 'medium',
      securityScore: 62,
      attackSurface: 58,
      exploitabilityScore: 5.8,
      businessDomain: '办公终端',
      businessSystem: '终端接入'
    },
    naming: {
      namePrefix: 'endpoint',
      hostPrefix: 'endpoint',
      ipPrefix: '192.168.40'
    }
  }
];

const toMode = (rawMode: string | null): CockpitMode => {
  if (rawMode === 'attack') return 'attack';
  if (rawMode === 'defense') return 'defense';
  if (rawMode === 'linked') return 'linked';
  return 'overview';
};

const parseBandwidth = (bandwidth?: string): number => {
  if (!bandwidth) return 100;
  const matched = bandwidth.match(/(\d+(?:\.\d+)?)([GMK]?bps)/i);
  if (!matched) return 100;
  const value = Number(matched[1]);
  const unit = matched[2].toLowerCase();
  if (unit.startsWith('gbps')) return value * 1000;
  if (unit.startsWith('mbps')) return value;
  if (unit.startsWith('kbps')) return value / 1000;
  return value;
};

const resolveNodeMeta = (node: NetworkNode, overridden?: Partial<CockpitNodeMeta>): CockpitNodeMeta => {
  const guessedDomain = BUSINESS_DOMAIN_BY_CATEGORY[node.deviceCategory] || '通用业务';
  const guessedSystem = node.name.includes('db')
    ? '数据系统'
    : node.name.includes('api')
      ? 'API系统'
      : node.name.includes('mail')
        ? '邮件系统'
        : node.name.includes('erp')
          ? 'ERP系统'
          : '业务系统';

  const businessDomain = overridden?.businessDomain || guessedDomain;
  const businessSystem = overridden?.businessSystem || guessedSystem;
  const isNetworkInfra =
    overridden?.isNetworkInfra ??
    (businessDomain === '网络基础设施' || ['router', 'switch', 'firewall'].includes(node.deviceCategory));

  return {
    businessDomain,
    businessSystem,
    isNetworkInfra
  };
};

const getZonePosition = (zone: NetworkNode['zone'], zones: { zoneType: string; position: { x: number; y: number; width: number; height: number } }[]) => {
  const matched = zones.find(item => item.zoneType === zone);
  return matched?.position || zones[0]?.position || { x: 50, y: 50, width: 300, height: 300 };
};

const resolveZoneByPoint = (
  point: { x: number; y: number },
  zones: { zoneType: string; position: { x: number; y: number; width: number; height: number } }[]
): NetworkNode['zone'] => {
  const zone = zones.find(item => (
    point.x >= item.position.x &&
    point.x <= item.position.x + item.position.width &&
    point.y >= item.position.y &&
    point.y <= item.position.y + item.position.height
  ));
  return (zone?.zoneType as NetworkNode['zone']) || 'intranet';
};

const findShortestPath = (
  connections: NetworkConnection[],
  sourceNodeId: string,
  targetNodeId: string
): string[] | null => {
  if (!sourceNodeId || !targetNodeId) return null;
  if (sourceNodeId === targetNodeId) return [sourceNodeId];

  const adjacency = new Map<string, string[]>();

  connections.forEach(conn => {
    const listA = adjacency.get(conn.sourceNodeId) || [];
    listA.push(conn.targetNodeId);
    adjacency.set(conn.sourceNodeId, listA);

    if (conn.bidirectional) {
      const listB = adjacency.get(conn.targetNodeId) || [];
      listB.push(conn.sourceNodeId);
      adjacency.set(conn.targetNodeId, listB);
    }
  });

  const visited = new Set<string>([sourceNodeId]);
  const queue: string[][] = [[sourceNodeId]];

  while (queue.length > 0) {
    const path = queue.shift()!;
    const node = path[path.length - 1];
    const neighbors = adjacency.get(node) || [];

    for (const next of neighbors) {
      if (visited.has(next)) continue;
      const candidate = [...path, next];
      if (next === targetNodeId) {
        return candidate;
      }
      visited.add(next);
      queue.push(candidate);
    }
  }

  return null;
};

const buildGraphAttackPath = (
  pathNodeIds: string[],
  sceneId: string,
  nodeMap: Map<string, NetworkNode>
): AttackPath | null => {
  if (pathNodeIds.length < 2) {
    return null;
  }

  const attackPhases: AttackPhase[] = pathNodeIds.slice(1).map((nodeId, index) => {
    const node = nodeMap.get(nodeId);
    const techniqueId = ATTACK_TECHNIQUES[index % ATTACK_TECHNIQUES.length];
    const killChainPhase = ATTACK_KILL_CHAIN[index % ATTACK_KILL_CHAIN.length];

    return {
      phaseId: `graph-phase-${index + 1}`,
      phaseIndex: index + 1,
      targetNodeId: nodeId,
      targetNodeName: node?.name || nodeId,
      techniqueId,
      techniqueName: `Graph Technique ${techniqueId}`,
      killChainPhase,
      baseSuccessRate: Math.max(0.35, 0.78 - index * 0.06),
      actualSuccessRate: Math.max(0.32, 0.72 - index * 0.06),
      estimatedDuration: 8 + index * 4,
      detectionProbability: Math.min(0.8, 0.25 + index * 0.07),
      description: `沿画布连线从 ${pathNodeIds[index]} 推进到 ${node?.name || nodeId}`
    };
  });

  const totalDuration = attackPhases.reduce((sum, phase) => sum + phase.estimatedDuration, 0);

  return {
    pathId: `graph-path-${Date.now()}`,
    pathName: '画布自定义路径',
    description: '基于当前沙盘节点连线动态生成的攻击路径',
    sceneId,
    startNodeId: pathNodeIds[0],
    startNodeName: nodeMap.get(pathNodeIds[0])?.name || pathNodeIds[0],
    targetNodeId: pathNodeIds[pathNodeIds.length - 1],
    targetNodeName: nodeMap.get(pathNodeIds[pathNodeIds.length - 1])?.name || pathNodeIds[pathNodeIds.length - 1],
    threatActorId: 'graph-actor',
    threatActorName: 'Graph Planner',
    attackPhases,
    totalSuccessRate: 0.42,
    totalDuration,
    riskLevel: 'high',
    stealthScore: 52,
    timeline: attackPhases.map((phase, index) => ({
      timestamp: index * 10,
      eventType: 'lateral_movement',
      nodeId: phase.targetNodeId,
      nodeName: phase.targetNodeName,
      techniqueId: phase.techniqueId,
      techniqueName: phase.techniqueName,
      success: true,
      description: phase.description
    })),
    damageAssessment: {
      affectedNodesCount: attackPhases.length,
      affectedNodeIds: attackPhases.map(phase => phase.targetNodeId),
      dataLeakageRisk: 'high',
      businessImpact: 'significant',
      estimatedLoss: 300,
      recoveryTime: 36,
      impactByZone: [],
      impactByAssetType: []
    },
    createdAt: new Date().toISOString()
  };
};

export const CockpitPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    sceneId,
    activeMode,
    modelProfile,
    selectedAttackPathId,
    selectedDefenseScenarioId,
    simulationResult,
    lastRunAt,
    setSceneId,
    setActiveMode,
    setModelProfile,
    setSelectedAttackPathId,
    setSelectedDefenseScenarioId,
    applySimulationResult,
    resetSimulation,
    syncSelectionAfterSceneSwitch
  } = useCockpitOrchestratorStore();

  const [activeLayer, setActiveLayer] = useState<LayerType>('network');
  const [layerConfig, setLayerConfig] = useState<LayerConfig>({
    business: true,
    network: true,
    attack: false
  });

  const [controlDrawerVisible, setControlDrawerVisible] = useState(false);
  const [modelEditorVisible, setModelEditorVisible] = useState(false);
  const [simulationSource, setSimulationSource] = useState<SimulationSource>('preset');
  const [graphStartNodeId, setGraphStartNodeId] = useState<string | null>(null);
  const [graphTargetNodeId, setGraphTargetNodeId] = useState<string | null>(null);
  const [graphPathNodeIds, setGraphPathNodeIds] = useState<string[]>([]);

  const [sceneNodes, setSceneNodes] = useState<NetworkNode[]>([]);
  const [sceneConnections, setSceneConnections] = useState<NetworkConnection[]>([]);
  const [sceneNodeLayouts, setSceneNodeLayouts] = useState<{ nodeId: string; x: number; y: number }[]>([]);
  const [nodeMetaOverrides, setNodeMetaOverrides] = useState<Record<string, Partial<CockpitNodeMeta>>>({});

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [detailPanelVisible, setDetailPanelVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  const [nodeCreateForm] = Form.useForm<CreateNodeFormValues>();
  const [edgeCreateForm] = Form.useForm<CreateEdgeFormValues>();

  const currentScene = useMemo(() => {
    return SCENES.find(scene => scene.metadata.sceneId === sceneId) || SCENES[0];
  }, [sceneId]);

  useEffect(() => {
    setSceneNodes(currentScene.nodes);
    setSceneConnections(currentScene.connections);
    setSceneNodeLayouts(currentScene.nodeLayouts);
    setNodeMetaOverrides({});
    setGraphPathNodeIds([]);

    const source = currentScene.nodes.find(node => node.zone === 'external') || currentScene.nodes[0];
    const target = currentScene.nodes.find(node => node.criticalityLevel === 'critical') || currentScene.nodes[currentScene.nodes.length - 1];

    setGraphStartNodeId(source?.nodeId || null);
    setGraphTargetNodeId(target?.nodeId || null);
  }, [currentScene]);

  const sceneAttackPaths = useMemo(() => {
    return ATTACK_PATHS.filter(path => path.sceneId === currentScene.metadata.sceneId);
  }, [currentScene.metadata.sceneId]);

  const selectedAttackPath = useMemo(() => {
    return sceneAttackPaths.find(path => path.pathId === selectedAttackPathId) || sceneAttackPaths[0] || null;
  }, [sceneAttackPaths, selectedAttackPathId]);

  const selectedDefenseScenario = useMemo(() => {
    return DEFENSE_SCENARIOS.find(item => item.scenarioId === selectedDefenseScenarioId) || DEFENSE_SCENARIOS[0] || null;
  }, [selectedDefenseScenarioId]);

  const defenseCoveragePreview = useMemo(() => {
    if (activeMode === 'defense' || activeMode === 'linked') {
      return buildDefenseCoveragePreview(selectedDefenseScenario);
    }
    return {};
  }, [activeMode, selectedDefenseScenario]);

  useEffect(() => {
    syncSelectionAfterSceneSwitch(sceneAttackPaths, DEFENSE_SCENARIOS);
  }, [sceneAttackPaths, syncSelectionAfterSceneSwitch]);

  useEffect(() => {
    const queryMode = toMode(searchParams.get('mode'));
    if (queryMode !== activeMode) {
      setActiveMode(queryMode);
    }
  }, [searchParams, activeMode, setActiveMode]);

  const handleModeChange = (mode: CockpitMode) => {
    if (mode !== activeMode) {
      setActiveMode(mode);
    }

    if (mode === 'attack' || mode === 'linked') {
      setActiveLayer('attack');
      setLayerConfig(prev => ({ ...prev, attack: true, network: true }));
    }

    if (mode === 'defense') {
      setActiveLayer('business');
      setLayerConfig(prev => ({ ...prev, business: true, network: true }));
    }

    const current = toMode(searchParams.get('mode'));
    if (current === mode) {
      return;
    }

    const next = new URLSearchParams(searchParams);
    if (mode === 'overview') {
      next.delete('mode');
    } else {
      next.set('mode', mode);
    }
    setSearchParams(next, { replace: true });
  };

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return sceneNodes.find(node => node.nodeId === selectedNodeId) || null;
  }, [selectedNodeId, sceneNodes]);

  const handleLayerChange = (layer: LayerType) => {
    setActiveLayer(layer);
    setLayerConfig(prev => ({
      ...prev,
      [layer]: true
    }));
  };

  const handleLayerToggle = (layer: LayerType, enabled: boolean) => {
    setLayerConfig(prev => ({
      ...prev,
      [layer]: enabled
    }));
  };

  const nodeMap = useMemo(() => {
    const map = new Map<string, NetworkNode>();
    sceneNodes.forEach(node => map.set(node.nodeId, node));
    return map;
  }, [sceneNodes]);

  const nodeOptions = useMemo(() => {
    return sceneNodes.map(node => ({
      value: node.nodeId,
      label: `${node.name} (${node.nodeId})`
    }));
  }, [sceneNodes]);

  const graphPathPreview = useMemo(() => {
    if (!graphStartNodeId || !graphTargetNodeId) return null;
    return findShortestPath(sceneConnections, graphStartNodeId, graphTargetNodeId);
  }, [sceneConnections, graphStartNodeId, graphTargetNodeId]);

  const runButtonText = useMemo(() => {
    if (activeMode === 'attack') return '执行攻击推演';
    if (activeMode === 'defense') return '执行防御仿真';
    if (activeMode === 'linked') return '执行攻防联动';
    return '执行推演';
  }, [activeMode]);

  const runSimulation = (withDefense: boolean) => {
    let attackPath: AttackPath | null = null;
    let generatedPathNodeIds: string[] = [];

    if (simulationSource === 'graph') {
      if (!graphStartNodeId || !graphTargetNodeId) {
        message.warning('请选择图上路径的起点和终点');
        return;
      }

      const shortestPath = findShortestPath(sceneConnections, graphStartNodeId, graphTargetNodeId);
      if (!shortestPath || shortestPath.length < 2) {
        message.warning('当前起点和终点不可达，请新增连线后重试');
        return;
      }

      attackPath = buildGraphAttackPath(shortestPath, currentScene.metadata.sceneId, nodeMap);
      generatedPathNodeIds = shortestPath;
    } else {
      attackPath = selectedAttackPath;
      generatedPathNodeIds = selectedAttackPath
        ? [selectedAttackPath.startNodeId, ...selectedAttackPath.attackPhases.map(item => item.targetNodeId)]
        : [];
    }

    if (!attackPath) {
      message.warning('当前没有可用攻击路径');
      return;
    }

    const result = runMockAttackDefenseSimulation({
      attackPath,
      defenseScenario: withDefense ? selectedDefenseScenario : null,
      sceneNodeIds: sceneNodes.map(node => node.nodeId),
      modelProfile
    });

    applySimulationResult(result);
    setGraphPathNodeIds(generatedPathNodeIds);

    if (activeMode === 'defense') {
      setActiveLayer('business');
      setLayerConfig(prev => ({ ...prev, business: true, network: true, attack: false }));
    } else {
      setActiveLayer('attack');
      setLayerConfig(prev => ({ ...prev, attack: true, network: true }));
    }

    const blocked = result.phaseOutcomes.filter(item => item.status === 'blocked').length;
    const compromised = result.phaseOutcomes.filter(
      item => item.status === 'bypassed' || item.status === 'compromised'
    ).length;

    const runType = withDefense ? (activeMode === 'defense' ? '防御仿真' : '攻防联动') : '攻击推演';
    message.success(`${runType}完成：阻断 ${blocked} 阶段，失陷 ${compromised} 阶段`);
  };

  const handleRunByMode = () => {
    if (activeMode === 'overview') {
      message.warning('请先切换到攻击推演、防御仿真或攻防联动模式');
      return;
    }
    runSimulation(activeMode !== 'attack');
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setDetailPanelVisible(true);
    setContextMenuVisible(false);
  };

  const handleNodeContextMenu = (nodeId: string, x: number, y: number) => {
    setSelectedNodeId(nodeId);
    setContextMenuPosition({ x, y });
    setContextMenuVisible(true);
  };

  const handleSaveNode = (nodeId: string, updates: Partial<NetworkNode>) => {
    setSceneNodes(prev => prev.map(node => (node.nodeId === nodeId ? { ...node, ...updates } : node)));
    message.success('节点信息已更新');
  };

  const upsertNodeFromValues = (
    values: CreateNodeFormValues,
    point?: { x: number; y: number },
    options?: { openEdit?: boolean; successText?: string }
  ) => {
    const newNodeId = `node-custom-${Date.now().toString(36)}-${Math.floor(Math.random() * 999)}`;
    const zonePosition = getZonePosition(values.zone, currentScene.zones);
    const zoneLayouts = sceneNodeLayouts.filter(layout => {
      const node = sceneNodes.find(item => item.nodeId === layout.nodeId);
      return node?.zone === values.zone;
    });

    const fallbackX = zonePosition.x + 90 + (zoneLayouts.length % 3) * 140;
    const fallbackY = zonePosition.y + 110 + Math.floor(zoneLayouts.length / 3) * 120;

    const x = point
      ? Math.max(zonePosition.x + 70, Math.min(zonePosition.x + zonePosition.width - 70, point.x))
      : fallbackX;
    const y = point
      ? Math.max(zonePosition.y + 60, Math.min(zonePosition.y + zonePosition.height - 60, point.y))
      : fallbackY;

    const newNode: NetworkNode = {
      nodeId: newNodeId,
      name: values.name,
      nodeType: values.nodeType,
      deviceCategory: values.deviceCategory,
      cpe: `cpe:2.3:a:custom:${values.deviceCategory}:1.0:*:*:*:*:*:*:*`,
      zone: values.zone,
      ipv4Address: values.ipv4Address,
      hostname: values.hostname,
      openPorts: [],
      osType: 'linux',
      osVersion: 'Custom Linux',
      osCpe: 'cpe:2.3:o:custom:linux:1.0:*:*:*:*:*:*:*',
      patchLevel: 'unknown',
      attackSurface: values.attackSurface,
      exploitabilityScore: values.exploitabilityScore,
      criticalityLevel: values.criticalityLevel,
      securityScore: values.securityScore,
      status: 'online'
    };

    setSceneNodes(prev => [...prev, newNode]);
    setSceneNodeLayouts(prev => [...prev, { nodeId: newNodeId, x, y }]);
    setNodeMetaOverrides(prev => ({
      ...prev,
      [newNodeId]: {
        businessDomain: values.businessDomain,
        businessSystem: values.businessSystem
      }
    }));

    resetSimulation();
    if (options?.openEdit) {
      setSelectedNodeId(newNodeId);
      setEditModalVisible(true);
    }
    message.success(options?.successText || '已添加模型实例');
  };

  const handleCreateNode = async () => {
    const values = await nodeCreateForm.validateFields();
    upsertNodeFromValues(values);
    nodeCreateForm.resetFields();
  };

  const buildTemplateNode = (template: ModelTemplate, zone: NetworkNode['zone']): CreateNodeFormValues => {
    const seq = sceneNodes.length + 1;
    const suffix = `${seq}`.padStart(2, '0');
    const hostOctet = Math.min(250, 20 + seq);

    return {
      ...template.defaults,
      zone,
      name: `${template.naming.namePrefix}-${suffix}`,
      hostname: `${template.naming.hostPrefix}-${suffix}.local`,
      ipv4Address: `${template.naming.ipPrefix}.${hostOctet}/24`
    };
  };

  const handleCanvasTemplateDrop = (templateId: string, point: { x: number; y: number }) => {
    const template = MODEL_TEMPLATES.find(item => item.id === templateId);
    if (!template) return;

    const targetZone = resolveZoneByPoint(point, currentScene.zones) || template.defaultZone;
    const nodeDraft = buildTemplateNode(template, targetZone);
    upsertNodeFromValues(nodeDraft, point, { openEdit: true, successText: `已添加${template.label}，可继续编辑属性` });
  };

  const handleCreateEdge = async () => {
    const values = await edgeCreateForm.validateFields();

    const newConnection: NetworkConnection = {
      connectionId: `conn-custom-${Date.now().toString(36)}`,
      sourceNodeId: values.sourceNodeId,
      targetNodeId: values.targetNodeId,
      protocol: values.protocol,
      bandwidth: values.bandwidth,
      encrypted: values.encrypted,
      bidirectional: values.bidirectional,
      latency: 2
    };

    setSceneConnections(prev => [...prev, newConnection]);
    resetSimulation();
    edgeCreateForm.resetFields();
    message.success('已新增连线，可重新发起推演');
  };

  const graphData = useMemo(() => {
    const layoutMap = new Map<string, { x: number; y: number }>();
    sceneNodeLayouts.forEach(layout => {
      layoutMap.set(layout.nodeId, { x: layout.x, y: layout.y });
    });

    const nodeZoneMap = new Map<string, string>();
    sceneNodes.forEach(node => nodeZoneMap.set(node.nodeId, node.zone));

    const effectiveCoverage = simulationResult?.nodeCoverage || defenseCoveragePreview;

    const nodes = sceneNodes.map(node => {
      const position = layoutMap.get(node.nodeId) || { x: 100, y: 100 };
      const nodeOutcome = simulationResult?.nodeOutcomes[node.nodeId];
      const coverage = effectiveCoverage[node.nodeId];
      const nodeMeta = resolveNodeMeta(node, nodeMetaOverrides[node.nodeId]);

      let status = node.status;
      let securityScore = node.securityScore;

      if (nodeOutcome === 'blocked') {
        status = 'degraded';
        securityScore = Math.min(100, (node.securityScore || 70) + 5);
      } else if (nodeOutcome === 'detected') {
        status = 'degraded';
        securityScore = Math.max(0, (node.securityScore || 70) - 10);
      } else if (nodeOutcome === 'compromised') {
        status = 'compromised';
        securityScore = Math.max(0, (node.securityScore || 70) - 35);
      } else if (nodeOutcome === 'covered' || (coverage && !nodeOutcome)) {
        securityScore = Math.min(100, (node.securityScore || 70) + 3);
      }

      return {
        id: node.nodeId,
        x: position.x,
        y: position.y,
        ...node,
        status,
        securityScore,
        businessDomain: nodeMeta.businessDomain,
        businessSystem: nodeMeta.businessSystem,
        isNetworkInfra: nodeMeta.isNetworkInfra,
        attackState: nodeOutcome || 'safe',
        defenseCoverageLevel: coverage?.coverageLevel || 'none',
        defenseCoverageScore: coverage?.coverageScore || 0
      };
    });

    const nodeById = new Map<string, (typeof nodes)[number]>();
    nodes.forEach(node => nodeById.set(node.id, node));

    const attackEdgeMap = new Map<string, { status: PhaseOutcomeStatus; label: string }>();
    simulationResult?.attackEdges.forEach(edge => {
      attackEdgeMap.set(`${edge.source}->${edge.target}`, {
        status: edge.attackPhaseStatus,
        label: edge.label
      });
      attackEdgeMap.set(`${edge.target}->${edge.source}`, {
        status: edge.attackPhaseStatus,
        label: edge.label
      });
    });

    const edges = sceneConnections.map(conn => {
      const sourceZone = nodeZoneMap.get(conn.sourceNodeId) || '';
      const targetZone = nodeZoneMap.get(conn.targetNodeId) || '';
      const sourceNode = nodeById.get(conn.sourceNodeId);
      const targetNode = nodeById.get(conn.targetNodeId);
      const attackEdge = attackEdgeMap.get(`${conn.sourceNodeId}->${conn.targetNodeId}`);

      let edgeType: EdgeType = 'network_link';
      if (attackEdge) {
        edgeType = 'attack_path';
      } else if (
        sourceNode &&
        targetNode &&
        !sourceNode.isNetworkInfra &&
        !targetNode.isNetworkInfra &&
        sourceNode.businessDomain === targetNode.businessDomain
      ) {
        edgeType = 'business_flow';
      }

      const isAttackPath = Boolean(attackEdge);
      const attackPhaseStatus = attackEdge?.status;

      const label = isAttackPath
        ? modelProfile === 'defense_coverage'
          ? PHASE_STATUS_TEXT[attackPhaseStatus || 'bypassed']
          : attackEdge?.label || conn.protocol.toUpperCase()
        : edgeType === 'business_flow'
          ? `${sourceNode?.businessSystem || '业务'}流`
          : conn.protocol.toUpperCase();

      return {
        id: conn.connectionId,
        source: conn.sourceNodeId,
        target: conn.targetNodeId,
        label,
        protocol: conn.protocol,
        bandwidth: parseBandwidth(conn.bandwidth),
        isCrossDomain: isCrossDomainConnection(sourceZone, targetZone),
        isAttackPath,
        attackPhaseStatus,
        edgeType
      };
    });

    const layerNodeSets: Record<LayerType, Set<string>> = {
      business: new Set(nodes.filter(node => !node.isNetworkInfra).map(node => node.id)),
      network: new Set(nodes.map(node => node.id)),
      attack: new Set(
        simulationResult
          ? [
              ...simulationResult.phaseOutcomes.map(item => item.targetNodeId),
              ...simulationResult.attackEdges.map(item => item.source),
              ...simulationResult.attackEdges.map(item => item.target)
            ]
          : graphPathNodeIds.length > 0
            ? graphPathNodeIds
            : nodes.filter(node => (node.attackSurface || 0) >= 55).map(node => node.id)
      )
    };

    const layerEdgeSets: Record<LayerType, Set<string>> = {
      business: new Set(edges.filter(edge => edge.edgeType === 'business_flow').map(edge => edge.id)),
      network: new Set(edges.filter(edge => edge.edgeType !== 'attack_path').map(edge => edge.id)),
      attack: new Set(edges.filter(edge => edge.edgeType === 'attack_path').map(edge => edge.id))
    };

    const enabledLayers = new Set<LayerType>([activeLayer]);
    (Object.keys(layerConfig) as LayerType[]).forEach(layer => {
      if (layerConfig[layer]) {
        enabledLayers.add(layer);
      }
    });

    const visibleNodeIds = new Set<string>();
    const visibleEdgeIds = new Set<string>();

    enabledLayers.forEach(layer => {
      layerNodeSets[layer].forEach(nodeId => visibleNodeIds.add(nodeId));
      layerEdgeSets[layer].forEach(edgeId => visibleEdgeIds.add(edgeId));
    });

    return {
      nodes: nodes.filter(node => visibleNodeIds.has(node.id)),
      edges: edges.filter(
        edge =>
          visibleEdgeIds.has(edge.id) &&
          visibleNodeIds.has(edge.source) &&
          visibleNodeIds.has(edge.target)
      )
    };
  }, [
    activeLayer,
    defenseCoveragePreview,
    graphPathNodeIds,
    layerConfig,
    modelProfile,
    nodeMetaOverrides,
    sceneConnections,
    sceneNodeLayouts,
    sceneNodes,
    simulationResult
  ]);

  return (
    <div style={{ padding: '8px 12px', height: '100%', minHeight: 'calc(100vh - 64px)' }}>
      <Card title={`攻防驾驶舱 - ${currentScene.metadata.name}`} style={{ height: '100%' }} bodyStyle={{ padding: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
          <Space wrap align="center">
            <Select
              data-testid="cockpit-scene-select"
              style={{ width: 250 }}
              prefix={<DeploymentUnitOutlined />}
              value={currentScene.metadata.sceneId}
              onChange={(value) => {
                setSceneId(value);
                resetSimulation();
              }}
              options={SCENES.map(scene => ({
                value: scene.metadata.sceneId,
                label: `${scene.metadata.name}（${scene.metadata.complexity}）`
              }))}
            />

            <Segmented
              options={MODE_OPTIONS}
              value={activeMode}
              onChange={(value) => handleModeChange(value as CockpitMode)}
            />

            <Select
              data-testid="cockpit-model-select"
              style={{ width: 210 }}
              prefix={<RadarChartOutlined />}
              value={modelProfile}
              onChange={(value) => setModelProfile(value)}
              options={MODEL_PROFILE_OPTIONS}
            />

            <Button
              icon={<EditOutlined />}
              data-testid="cockpit-open-model-editor-btn"
              onClick={() => {
                setControlDrawerVisible(false);
                setModelEditorVisible(true);
              }}
            >
              编辑模型
            </Button>
            <Button
              data-testid="cockpit-run-simulation-btn"
              type="primary"
              icon={<ThunderboltOutlined />}
              disabled={activeMode === 'overview'}
              onClick={handleRunByMode}
            >
              {runButtonText}
            </Button>
            <Button
              icon={<SettingOutlined />}
              data-testid="cockpit-open-control-panel-btn"
              onClick={() => {
                setModelEditorVisible(false);
                setControlDrawerVisible(true);
              }}
            >
              控制面板
            </Button>

            <Tag color="processing">主视角：{MODE_OPTIONS.find(item => item.value === activeMode)?.label}</Tag>
          </Space>

          {simulationResult && (
            <Space data-testid="cockpit-simulation-summary" size="large" wrap>
              <Statistic title="被阻断阶段" value={simulationResult.blockedNodeIds.length} suffix="个节点" />
              <Statistic title="检测到攻击" value={simulationResult.detectedNodeIds.length} suffix="个节点" />
              <Statistic title="失陷节点" value={simulationResult.compromisedNodeIds.length} suffix="个节点" />
              <Statistic title="节点防护覆盖" value={Math.round(simulationResult.metrics.nodeCoverageRate * 100)} suffix="%" />
            </Space>
          )}

          <div style={{ flex: 1, minHeight: 0 }}>
            <SandboxCanvas
              zones={currentScene.zones}
              nodes={graphData.nodes}
              edges={graphData.edges}
              activeLayer={activeLayer}
              layerConfig={layerConfig}
              onNodeClick={handleNodeClick}
              onNodeContextMenu={handleNodeContextMenu}
              onCanvasDrop={handleCanvasTemplateDrop}
            />
          </div>
        </div>
      </Card>

      <Drawer
        title="控制面板"
        data-testid="cockpit-control-drawer"
        open={controlDrawerVisible}
        onClose={() => setControlDrawerVisible(false)}
        mask={false}
        width={360}
        destroyOnClose={false}
      >
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <LayerController
            activeLayer={activeLayer}
            layerConfig={layerConfig}
            onLayerChange={handleLayerChange}
            onLayerToggle={handleLayerToggle}
          />

          <Card size="small" title="推演控制（同页联动）">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Radio.Group
                value={simulationSource}
                onChange={(evt) => setSimulationSource(evt.target.value)}
                optionType="button"
                buttonStyle="solid"
              >
                <Radio.Button value="preset">预置攻击路径</Radio.Button>
                <Radio.Button value="graph">图上路径推演</Radio.Button>
              </Radio.Group>

              {simulationSource === 'preset' ? (
                <Select
                  data-testid="cockpit-linked-attack-select"
                  value={selectedAttackPath?.pathId}
                  onChange={value => {
                    setSelectedAttackPathId(value);
                    resetSimulation();
                  }}
                  options={sceneAttackPaths.map(path => ({
                    value: path.pathId,
                    label: `${path.pathName}（${path.attackPhases.length} 阶段）`
                  }))}
                />
              ) : (
                <>
                  <Select
                    value={graphStartNodeId}
                    onChange={value => {
                      setGraphStartNodeId(value);
                      resetSimulation();
                    }}
                    options={nodeOptions}
                    placeholder="选择起点节点"
                  />
                  <Select
                    value={graphTargetNodeId}
                    onChange={value => {
                      setGraphTargetNodeId(value);
                      resetSimulation();
                    }}
                    options={nodeOptions}
                    placeholder="选择终点节点"
                  />
                  <Alert
                    type={graphPathPreview ? 'success' : 'warning'}
                    showIcon
                    message={graphPathPreview
                      ? `可达路径长度：${Math.max(0, graphPathPreview.length - 1)} 跳`
                      : '当前起终点不可达'}
                    description={graphPathPreview
                      ? graphPathPreview.map(nodeId => nodeMap.get(nodeId)?.name || nodeId).join(' -> ')
                      : '请调整起终点或先补充连线'}
                  />
                </>
              )}

              <Select
                data-testid="cockpit-linked-defense-select"
                value={selectedDefenseScenario?.scenarioId}
                onChange={value => {
                  setSelectedDefenseScenarioId(value);
                  resetSimulation();
                }}
                options={DEFENSE_SCENARIOS.map(item => ({
                  value: item.scenarioId,
                  label: `${item.scenarioName}（覆盖提升 ${item.expectedEffect.coverageIncrease}%）`
                }))}
              />

              <Alert
                type="info"
                showIcon
                message="推演触发入口"
                description={`请在顶部点击“${runButtonText}”触发当前模式推演`}
              />
            </Space>
          </Card>
          <Card size="small" title="态势摘要">
            {simulationResult ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Alert
                  type="info"
                  showIcon
                  message="最近一次推演结果"
                  description={lastRunAt ? `执行时间：${new Date(lastRunAt).toLocaleString('zh-CN')}` : undefined}
                />

                <Descriptions column={1} size="small" bordered>
                  <Descriptions.Item label="节点防护覆盖率">
                    {Math.round(simulationResult.metrics.nodeCoverageRate * 100)}%
                  </Descriptions.Item>
                  <Descriptions.Item label="阶段阻断率">
                    {Math.round(simulationResult.metrics.blockedRate * 100)}%
                  </Descriptions.Item>
                  <Descriptions.Item label="阶段检测率">
                    {Math.round(simulationResult.metrics.detectedRate * 100)}%
                  </Descriptions.Item>
                  <Descriptions.Item label="风险降低率">
                    {Math.round(simulationResult.metrics.riskReductionRate * 100)}%
                  </Descriptions.Item>
                </Descriptions>

                <Progress
                  percent={Math.round(simulationResult.metrics.riskReductionRate * 100)}
                  status="active"
                  strokeColor={{ '0%': '#faad14', '100%': '#52c41a' }}
                />

                <List
                  size="small"
                  bordered
                  dataSource={simulationResult.phaseOutcomes}
                  renderItem={(item) => (
                    <List.Item>
                      <Space direction="vertical" size={2} style={{ width: '100%' }}>
                        <Space>
                          <Tag color="blue">P{item.phaseIndex}</Tag>
                          <span>{item.targetNodeName}</span>
                          <Tag color={PHASE_STATUS_COLOR[item.status]}>{PHASE_STATUS_TEXT[item.status]}</Tag>
                        </Space>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                          {item.reason}
                        </Typography.Text>
                      </Space>
                    </List.Item>
                  )}
                />

                <Button block icon={<RollbackOutlined />} onClick={resetSimulation}>
                  清空推演结果
                </Button>
              </Space>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="尚未执行推演" />
            )}
          </Card>
        </Space>
      </Drawer>

      <Drawer
        title="模型编辑"
        data-testid="cockpit-model-editor-drawer"
        open={modelEditorVisible}
        onClose={() => setModelEditorVisible(false)}
        width={440}
        destroyOnClose={false}
      >
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Card size="small" title="模型库（拖拽到画布）">
            <List
              size="small"
              dataSource={MODEL_TEMPLATES}
              renderItem={(template) => (
                <List.Item
                  style={{
                    border: '1px dashed #d9d9d9',
                    borderRadius: 8,
                    marginBottom: 8,
                    cursor: 'grab',
                    padding: 10
                  }}
                  draggable
                  onDragStart={(evt) => {
                    evt.dataTransfer.setData('application/x-cockpit-model-template', template.id);
                    evt.dataTransfer.setData('text/plain', template.id);
                    evt.dataTransfer.effectAllowed = 'copy';
                  }}
                >
                  <Space direction="vertical" size={2}>
                    <Space>
                      <Tag color="blue">{template.label}</Tag>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        默认区域：{template.defaultZone.toUpperCase()}
                      </Typography.Text>
                    </Space>
                    <Typography.Text style={{ fontSize: 12 }}>
                      {template.description}
                    </Typography.Text>
                  </Space>
                </List.Item>
              )}
            />
            <Alert type="info" showIcon message="拖拽模型到沙盘后会自动创建节点并弹出编辑框" />
          </Card>

          <Card size="small" title="手动新增模型实例">
            <Form<CreateNodeFormValues>
              form={nodeCreateForm}
              layout="vertical"
              initialValues={{
                zone: 'intranet',
                nodeType: 'software',
                deviceCategory: 'server',
                criticalityLevel: 'medium',
                securityScore: 70,
                attackSurface: 40,
                exploitabilityScore: 4.5,
                businessDomain: '通用业务',
                businessSystem: '业务系统'
              }}
            >
              <Form.Item name="name" label="实例名称" rules={[{ required: true, message: '请输入实例名称' }]}>
                <Input placeholder="例如：finance-api-02" />
              </Form.Item>
              <Form.Item name="zone" label="所在安全域" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'external', label: 'External' },
                    { value: 'dmz', label: 'DMZ' },
                    { value: 'intranet', label: 'Intranet' },
                    { value: 'cloud', label: 'Cloud' }
                  ]}
                />
              </Form.Item>
              <Form.Item name="nodeType" label="节点类型" rules={[{ required: true }]}>
                <Select options={[{ value: 'hardware', label: '硬件' }, { value: 'software', label: '软件' }]} />
              </Form.Item>
              <Form.Item name="deviceCategory" label="设备类别" rules={[{ required: true }]}>
                <Select
                  showSearch
                  optionFilterProp="label"
                  options={Object.entries(DEVICE_CATEGORY_LABELS).map(([value, label]) => ({ value, label }))}
                />
              </Form.Item>
              <Form.Item name="ipv4Address" label="IPv4/CIDR" rules={[{ required: true, message: '请输入IPv4地址' }]}>
                <Input placeholder="192.168.30.10/24" />
              </Form.Item>
              <Form.Item name="hostname" label="主机名" rules={[{ required: true, message: '请输入主机名' }]}>
                <Input placeholder="finance-api-02.local" />
              </Form.Item>
              <Form.Item name="criticalityLevel" label="重要性" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'critical', label: '关键' },
                    { value: 'high', label: '高' },
                    { value: 'medium', label: '中' },
                    { value: 'low', label: '低' }
                  ]}
                />
              </Form.Item>
              <Form.Item name="securityScore" label="安全评分">
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="businessDomain" label="业务域" rules={[{ required: true }]}>
                <Input placeholder="如：支付业务" />
              </Form.Item>
              <Form.Item name="businessSystem" label="业务系统" rules={[{ required: true }]}>
                <Input placeholder="如：结算系统" />
              </Form.Item>
              <Form.Item name="attackSurface" label="攻击面">
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="exploitabilityScore" label="可利用性">
                <InputNumber min={0} max={10} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
              <Button block type="primary" onClick={handleCreateNode}>
                添加节点
              </Button>
            </Form>
          </Card>

          <Card size="small" title="新增连线">
            <Form<CreateEdgeFormValues>
              form={edgeCreateForm}
              layout="vertical"
              initialValues={{
                protocol: 'tcp',
                bandwidth: '1Gbps',
                encrypted: false,
                bidirectional: true
              }}
            >
              <Form.Item name="sourceNodeId" label="起点节点" rules={[{ required: true, message: '请选择起点节点' }]}>
                <Select options={nodeOptions} showSearch optionFilterProp="label" />
              </Form.Item>
              <Form.Item name="targetNodeId" label="终点节点" rules={[{ required: true, message: '请选择终点节点' }]}>
                <Select options={nodeOptions} showSearch optionFilterProp="label" />
              </Form.Item>
              <Form.Item name="protocol" label="协议" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'tcp', label: 'TCP' },
                    { value: 'udp', label: 'UDP' },
                    { value: 'http', label: 'HTTP' },
                    { value: 'https', label: 'HTTPS' },
                    { value: 'ssh', label: 'SSH' },
                    { value: 'rdp', label: 'RDP' },
                    { value: 'smb', label: 'SMB' },
                    { value: 'ftp', label: 'FTP' }
                  ]}
                />
              </Form.Item>
              <Form.Item name="bandwidth" label="带宽" rules={[{ required: true }]}>
                <Input placeholder="1Gbps" />
              </Form.Item>
              <Form.Item name="encrypted" label="加密" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="bidirectional" label="双向" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Button block type="primary" onClick={handleCreateEdge}>
                添加连线
              </Button>
            </Form>
          </Card>
        </Space>
      </Drawer>

      <NodeDetailPanel
        visible={detailPanelVisible}
        node={selectedNode}
        onClose={() => setDetailPanelVisible(false)}
        onEdit={(nodeId) => {
          setSelectedNodeId(nodeId);
          setEditModalVisible(true);
          setDetailPanelVisible(false);
        }}
        onViewVulnerabilities={(nodeId) => message.info(`查看漏洞：${nodeId}`)}
        onViewRelations={(nodeId) => message.info(`查看关系：${nodeId}`)}
      />

      <NodeEditModal
        visible={editModalVisible}
        node={selectedNode}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSaveNode}
      />

      <NodeContextMenu
        visible={contextMenuVisible}
        x={contextMenuPosition.x}
        y={contextMenuPosition.y}
        onViewDetails={() => {
          setDetailPanelVisible(true);
          setContextMenuVisible(false);
        }}
        onEdit={() => {
          setEditModalVisible(true);
          setContextMenuVisible(false);
        }}
        onViewVulnerabilities={() => {
          if (selectedNodeId) message.info(`查看漏洞：${selectedNodeId}`);
          setContextMenuVisible(false);
        }}
        onViewRelations={() => {
          if (selectedNodeId) message.info(`查看关系：${selectedNodeId}`);
          setContextMenuVisible(false);
        }}
        onClose={() => setContextMenuVisible(false)}
      />
    </div>
  );
};

export default CockpitPage;

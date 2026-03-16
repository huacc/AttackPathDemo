/**
 * 场景相关类型定义
 */

import { NetworkNode } from './ontology';

// ==================== 网络区域 ====================

export interface NetworkZone {
  zoneId: string;
  zoneName: string;
  zoneType: 'external' | 'dmz' | 'intranet' | 'cloud';
  description?: string;
  backgroundColor: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// ==================== 网络连接 ====================

export type ConnectionProtocol = 'tcp' | 'udp' | 'http' | 'https' | 'ssh' | 'rdp' | 'smb' | 'ftp';

export interface NetworkConnection {
  connectionId: string;
  sourceNodeId: string;
  targetNodeId: string;
  protocol: ConnectionProtocol;
  port?: number;
  bandwidth?: string;
  latency?: number;
  encrypted: boolean;
  bidirectional: boolean;
}

// ==================== 场景 ====================

export type SceneCategory = 'web_attack' | 'lateral_movement' | 'cloud_attack' | 'apt_campaign' | 'custom';

export type SceneComplexity = 'simple' | 'medium' | 'complex';

export interface SceneMetadata {
  sceneId: string;
  name: string;
  description: string;
  category: SceneCategory;
  complexity: SceneComplexity;
  createdAt: string;
  updatedAt?: string;
  author?: string;
  tags?: string[];
}

export interface NodeLayout {
  nodeId: string;
  x: number;
  y: number;
}

export interface Scene {
  metadata: SceneMetadata;
  zones: NetworkZone[];
  nodes: NetworkNode[];
  connections: NetworkConnection[];
  nodeLayouts: NodeLayout[];
}

// ==================== 场景配置 ====================

export interface SceneConfig {
  sceneId: string;
  simulationParams: {
    maxPathLength?: number;
    timeoutSeconds?: number;
    successRateThreshold?: number;
  };
  visualParams: {
    defaultLayout?: 'force' | 'dagre' | 'grid' | 'circular';
    showLabels?: boolean;
    showZones?: boolean;
  };
}

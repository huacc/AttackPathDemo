// 场景拓扑Mock数据（已更新为标准类型）
// 参考：设计文档P2.1、沙盘规范二·2.2

import { Scene, NetworkZone, NetworkConnection, NodeLayout } from '../../types';
import { NETWORK_NODES } from '../static/networkNodes';

// 场景1：Web应用攻击场景
export const SCENE_WEB_ATTACK: Scene = {
  metadata: {
    sceneId: 'scene-001',
    name: 'Web应用攻击场景',
    description: '模拟外网攻击者通过DMZ区Web应用漏洞入侵，横向移动至内网核心资产的攻击路径',
    category: 'web_attack',
    complexity: 'medium',
    createdAt: '2024-01-10',
    author: 'admin',
    tags: ['web_attack', 'lateral_movement', 'privilege_escalation']
  },
  zones: [
    {
      zoneId: 'zone-external',
      zoneName: 'External Zone',
      zoneType: 'external',
      description: '外网区域',
      backgroundColor: '#ffebee',
      position: { x: 50, y: 50, width: 200, height: 600 }
    },
    {
      zoneId: 'zone-dmz',
      zoneName: 'DMZ Zone',
      zoneType: 'dmz',
      description: 'DMZ区域',
      backgroundColor: '#fff3e0',
      position: { x: 300, y: 50, width: 350, height: 600 }
    },
    {
      zoneId: 'zone-intranet',
      zoneName: 'Intranet Zone',
      zoneType: 'intranet',
      description: '内网区域',
      backgroundColor: '#e3f2fd',
      position: { x: 700, y: 50, width: 500, height: 600 }
    }
  ],
  nodes: NETWORK_NODES.filter(node =>
    ['node-ext-01', 'node-dmz-01', 'node-dmz-03', 'node-dmz-04', 'node-dmz-06',
     'node-intra-01', 'node-intra-02', 'node-intra-03', 'node-intra-04', 'node-intra-05',
     'node-intra-06', 'node-intra-08', 'node-intra-10', 'node-intra-11', 'node-intra-12',
     'node-intra-15', 'node-intra-20', 'node-intra-24'].includes(node.nodeId)
  ),
  nodeLayouts: [
    // External区域
    { nodeId: 'node-ext-01', x: 150, y: 350 },
    
    // DMZ区域
    { nodeId: 'node-dmz-01', x: 350, y: 150 },
    { nodeId: 'node-dmz-03', x: 475, y: 250 },
    { nodeId: 'node-dmz-04', x: 475, y: 400 },
    { nodeId: 'node-dmz-06', x: 550, y: 550 },
    
    // Intranet区域
    { nodeId: 'node-intra-01', x: 750, y: 100 },
    { nodeId: 'node-intra-02', x: 850, y: 100 },
    { nodeId: 'node-intra-03', x: 950, y: 150 },
    { nodeId: 'node-intra-04', x: 1050, y: 150 },
    { nodeId: 'node-intra-05', x: 750, y: 250 },
    { nodeId: 'node-intra-06', x: 850, y: 250 },
    { nodeId: 'node-intra-08', x: 950, y: 300 },
    { nodeId: 'node-intra-10', x: 750, y: 400 },
    { nodeId: 'node-intra-11', x: 850, y: 400 },
    { nodeId: 'node-intra-12', x: 950, y: 450 },
    { nodeId: 'node-intra-15', x: 1050, y: 450 },
    { nodeId: 'node-intra-20', x: 750, y: 550 },
    { nodeId: 'node-intra-24', x: 850, y: 550 }
  ],
  connections: [
    // External -> DMZ（通过防火墙）
    { connectionId: 'conn-001', sourceNodeId: 'node-ext-01', targetNodeId: 'node-dmz-01', protocol: 'https', bandwidth: '1Gbps', latency: 10, encrypted: true, bidirectional: true },
    { connectionId: 'conn-002', sourceNodeId: 'node-dmz-01', targetNodeId: 'node-dmz-03', protocol: 'https', bandwidth: '10Gbps', latency: 1, encrypted: true, bidirectional: true },
    
    // DMZ -> Intranet（通过防火墙）
    { connectionId: 'conn-003', sourceNodeId: 'node-dmz-01', targetNodeId: 'node-intra-01', protocol: 'tcp', bandwidth: '10Gbps', latency: 1, encrypted: false, bidirectional: true },
    { connectionId: 'conn-004', sourceNodeId: 'node-dmz-01', targetNodeId: 'node-intra-02', protocol: 'tcp', bandwidth: '10Gbps', latency: 1, encrypted: false, bidirectional: true },
    { connectionId: 'conn-005', sourceNodeId: 'node-intra-02', targetNodeId: 'node-dmz-03', protocol: 'tcp', bandwidth: '1Gbps', latency: 2, encrypted: false, bidirectional: true },
    { connectionId: 'conn-006', sourceNodeId: 'node-intra-02', targetNodeId: 'node-dmz-04', protocol: 'tcp', bandwidth: '1Gbps', latency: 2, encrypted: false, bidirectional: true },
    { connectionId: 'conn-007', sourceNodeId: 'node-intra-02', targetNodeId: 'node-dmz-06', protocol: 'smtp', bandwidth: '100Mbps', latency: 5, encrypted: true, bidirectional: true },
    
    // Intranet内部连接
    { connectionId: 'conn-008', sourceNodeId: 'node-intra-01', targetNodeId: 'node-intra-02', protocol: 'tcp', bandwidth: '10Gbps', latency: 1, encrypted: false, bidirectional: true },
    { connectionId: 'conn-009', sourceNodeId: 'node-intra-02', targetNodeId: 'node-intra-03', protocol: 'tcp', bandwidth: '10Gbps', latency: 1, encrypted: false, bidirectional: true },
    { connectionId: 'conn-010', sourceNodeId: 'node-intra-03', targetNodeId: 'node-intra-04', protocol: 'tcp', bandwidth: '10Gbps', latency: 1, encrypted: false, bidirectional: true },
    { connectionId: 'conn-011', sourceNodeId: 'node-intra-05', targetNodeId: 'node-intra-06', protocol: 'tcp', bandwidth: '1Gbps', latency: 1, encrypted: false, bidirectional: true },
    { connectionId: 'conn-012', sourceNodeId: 'node-intra-06', targetNodeId: 'node-intra-08', protocol: 'tcp', bandwidth: '1Gbps', latency: 1, encrypted: false, bidirectional: true },
    { connectionId: 'conn-013', sourceNodeId: 'node-intra-10', targetNodeId: 'node-intra-11', protocol: 'smb', bandwidth: '1Gbps', latency: 1, encrypted: false, bidirectional: true },
    { connectionId: 'conn-014', sourceNodeId: 'node-intra-11', targetNodeId: 'node-intra-12', protocol: 'smb', bandwidth: '1Gbps', latency: 1, encrypted: false, bidirectional: true },
    { connectionId: 'conn-015', sourceNodeId: 'node-intra-12', targetNodeId: 'node-intra-03', protocol: 'tcp', bandwidth: '100Mbps', latency: 2, encrypted: false, bidirectional: true },
    { connectionId: 'conn-016', sourceNodeId: 'node-intra-20', targetNodeId: 'node-intra-10', protocol: 'tcp', bandwidth: '1Gbps', latency: 2, encrypted: false, bidirectional: true },
    { connectionId: 'conn-017', sourceNodeId: 'node-intra-24', targetNodeId: 'node-intra-15', protocol: 'rdp', bandwidth: '100Mbps', latency: 5, encrypted: true, bidirectional: true }
  ]
};

// 场景2：内网横向移动场景
export const SCENE_LATERAL_MOVEMENT: Scene = {
  metadata: {
    sceneId: 'scene-002',
    name: '内网横向移动场景',
    description: '模拟攻击者已获得内网初始立足点后，通过漏洞利用和凭证窃取进行横向移动，最终到达域控制器',
    category: 'lateral_movement',
    complexity: 'complex',
    createdAt: '2024-01-15',
    author: 'admin',
    tags: ['lateral_movement', 'credential_dumping', 'privilege_escalation']
  },
  zones: [
    {
      zoneId: 'zone-intranet-full',
      zoneName: 'Intranet Full View',
      zoneType: 'intranet',
      description: '内网全景',
      backgroundColor: '#e3f2fd',
      position: { x: 50, y: 50, width: 1100, height: 600 }
    }
  ],
  nodes: NETWORK_NODES.filter(node => 
    ['node-intra-03', 'node-intra-04', 'node-intra-05', 'node-intra-06',
     'node-intra-08', 'node-intra-09', 'node-intra-10', 'node-intra-11',
     'node-intra-12', 'node-intra-13', 'node-intra-14', 'node-intra-15',
     'node-intra-20', 'node-intra-24', 'node-intra-26'].includes(node.nodeId)
  ),
  nodeLayouts: [
    // 工作站区域
    { nodeId: 'node-intra-10', x: 200, y: 200 },
    { nodeId: 'node-intra-11', x: 350, y: 200 },
    { nodeId: 'node-intra-15', x: 500, y: 200 },
    { nodeId: 'node-intra-24', x: 650, y: 200 },
    
    // 服务器区域
    { nodeId: 'node-intra-05', x: 200, y: 400 },
    { nodeId: 'node-intra-06', x: 350, y: 400 },
    { nodeId: 'node-intra-13', x: 500, y: 400 },
    { nodeId: 'node-intra-14', x: 650, y: 400 },
    { nodeId: 'node-intra-26', x: 800, y: 400 },
    
    // 核心区域
    { nodeId: 'node-intra-03', x: 950, y: 150 },
    { nodeId: 'node-intra-04', x: 950, y: 300 },
    { nodeId: 'node-intra-12', x: 950, y: 450 },
    
    // 基础设施
    { nodeId: 'node-intra-08', x: 500, y: 550 },
    { nodeId: 'node-intra-09', x: 650, y: 550 },
    { nodeId: 'node-intra-20', x: 200, y: 550 }
  ],
  connections: [
    // 工作站互联
    { connectionId: 'conn-101', sourceNodeId: 'node-intra-10', targetNodeId: 'node-intra-11', protocol: 'smb', bandwidth: '1Gbps', latency: 1, encrypted: false, bidirectional: true },
    { connectionId: 'conn-102', sourceNodeId: 'node-intra-11', targetNodeId: 'node-intra-15', protocol: 'smb', bandwidth: '1Gbps', latency: 1, encrypted: false, bidirectional: true },
    { connectionId: 'conn-103', sourceNodeId: 'node-intra-15', targetNodeId: 'node-intra-24', protocol: 'rdp', bandwidth: '100Mbps', latency: 2, encrypted: true, bidirectional: true },
    
    // 工作站到服务器
    { connectionId: 'conn-104', sourceNodeId: 'node-intra-10', targetNodeId: 'node-intra-05', protocol: 'tcp', bandwidth: '1Gbps', latency: 2, encrypted: false, bidirectional: true },
    { connectionId: 'conn-105', sourceNodeId: 'node-intra-11', targetNodeId: 'node-intra-06', protocol: 'tcp', bandwidth: '1Gbps', latency: 2, encrypted: false, bidirectional: true },
    { connectionId: 'conn-106', sourceNodeId: 'node-intra-15', targetNodeId: 'node-intra-13', protocol: 'tcp', bandwidth: '1Gbps', latency: 2, encrypted: false, bidirectional: true },
    { connectionId: 'conn-107', sourceNodeId: 'node-intra-24', targetNodeId: 'node-intra-14', protocol: 'tcp', bandwidth: '1Gbps', latency: 2, encrypted: false, bidirectional: true },
    
    // 服务器到核心
    { connectionId: 'conn-108', sourceNodeId: 'node-intra-05', targetNodeId: 'node-intra-03', protocol: 'tcp', bandwidth: '100Mbps', latency: 2, encrypted: false, bidirectional: true },
    { connectionId: 'conn-109', sourceNodeId: 'node-intra-06', targetNodeId: 'node-intra-03', protocol: 'tcp', bandwidth: '100Mbps', latency: 2, encrypted: false, bidirectional: true },
    { connectionId: 'conn-110', sourceNodeId: 'node-intra-13', targetNodeId: 'node-intra-04', protocol: 'tcp', bandwidth: '1Gbps', latency: 1, encrypted: false, bidirectional: true },
    { connectionId: 'conn-111', sourceNodeId: 'node-intra-14', targetNodeId: 'node-intra-12', protocol: 'tcp', bandwidth: '1Gbps', latency: 1, encrypted: false, bidirectional: true },
    { connectionId: 'conn-112', sourceNodeId: 'node-intra-26', targetNodeId: 'node-intra-12', protocol: 'tcp', bandwidth: '10Gbps', latency: 1, encrypted: false, bidirectional: true },
    
    // 核心互联
    { connectionId: 'conn-113', sourceNodeId: 'node-intra-03', targetNodeId: 'node-intra-04', protocol: 'tcp', bandwidth: '10Gbps', latency: 1, encrypted: false, bidirectional: true },
    { connectionId: 'conn-114', sourceNodeId: 'node-intra-04', targetNodeId: 'node-intra-12', protocol: 'tcp', bandwidth: '10Gbps', latency: 1, encrypted: false, bidirectional: true },
    { connectionId: 'conn-115', sourceNodeId: 'node-intra-12', targetNodeId: 'node-intra-03', protocol: 'tcp', bandwidth: '100Mbps', latency: 1, encrypted: false, bidirectional: true },
    
    // 基础设施连接
    { connectionId: 'conn-116', sourceNodeId: 'node-intra-20', targetNodeId: 'node-intra-10', protocol: 'tcp', bandwidth: '1Gbps', latency: 2, encrypted: false, bidirectional: true },
    { connectionId: 'conn-117', sourceNodeId: 'node-intra-08', targetNodeId: 'node-intra-13', protocol: 'tcp', bandwidth: '1Gbps', latency: 1, encrypted: false, bidirectional: true },
    { connectionId: 'conn-118', sourceNodeId: 'node-intra-09', targetNodeId: 'node-intra-14', protocol: 'tcp', bandwidth: '10Gbps', latency: 1, encrypted: false, bidirectional: true }
  ]
};

export const SCENES: Scene[] = [SCENE_WEB_ATTACK, SCENE_LATERAL_MOVEMENT];

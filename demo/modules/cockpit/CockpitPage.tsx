import React, { useState, useMemo } from 'react';
import { Card, message } from 'antd';
import SandboxCanvas from './components/SandboxCanvas';
import LayerController, { LayerType, LayerConfig } from './components/LayerController';
import NodeDetailPanel from './components/NodeDetailPanel';
import NodeEditModal from './components/NodeEditModal';
import NodeContextMenu from './components/NodeContextMenu';
import { SCENES } from '../../mock/dynamic/scenes';
import { NETWORK_NODES } from '../../mock/static/networkNodes';
import { isCrossDomainConnection } from './components/EdgeRenderer';
import { NetworkNode } from '../../types/ontology';

/**
 * 攻防驾驶舱页面
 * 展示2D网络沙盘和图层控制
 */
export const CockpitPage: React.FC = () => {
  const [currentSceneIndex] = useState(0);
  const [activeLayer, setActiveLayer] = useState<LayerType>('network');
  const [layerConfig, setLayerConfig] = useState<LayerConfig>({
    business: false,
    network: true,
    attack: false
  });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [detailPanelVisible, setDetailPanelVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  // 使用状态管理场景数据，确保数据持久化和UI更新
  const [currentScene, setCurrentScene] = useState(SCENES[currentSceneIndex]);

  // 获取选中的节点数据
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return currentScene.nodes.find(node => node.nodeId === selectedNodeId) || null;
  }, [selectedNodeId, currentScene]);

  // 转换节点数据为G6格式
  const graphData = useMemo(() => {
    // 创建节点ID到zone的映射
    const nodeZoneMap = new Map<string, string>();
    currentScene.nodes.forEach(node => {
      nodeZoneMap.set(node.nodeId, node.zone);
    });

    // 创建节点ID到布局位置的映射
    const layoutMap = new Map<string, { x: number; y: number }>();
    currentScene.nodeLayouts.forEach(layout => {
      layoutMap.set(layout.nodeId, { x: layout.x, y: layout.y });
    });

    // 转换节点为G6格式
    const nodes = currentScene.nodes.map(node => {
      const position = layoutMap.get(node.nodeId) || { x: 0, y: 0 };
      return {
        id: node.nodeId,
        x: position.x,
        y: position.y,
        // 传递节点数据给自定义渲染器
        ...node
      };
    });

    // 转换连接为G6边格式，添加跨域判断
    const edges = currentScene.connections.map(conn => {
      const sourceZone = nodeZoneMap.get(conn.sourceNodeId) || '';
      const targetZone = nodeZoneMap.get(conn.targetNodeId) || '';
      const isCrossDomain = isCrossDomainConnection(sourceZone, targetZone);

      return {
        id: conn.connectionId,
        source: conn.sourceNodeId,
        target: conn.targetNodeId,
        label: conn.protocol,
        protocol: conn.protocol,
        bandwidth: conn.bandwidth,
        isCrossDomain
      };
    });

    return { nodes, edges };
  }, [currentScene]);

  const handleNodeClick = (nodeId: string) => {
    console.log('Node clicked:', nodeId);
    setSelectedNodeId(nodeId);
    setDetailPanelVisible(true);
    setContextMenuVisible(false);
  };

  const handleNodeContextMenu = (nodeId: string, x: number, y: number) => {
    console.log('Node context menu:', nodeId);
    setSelectedNodeId(nodeId);
    setContextMenuPosition({ x, y });
    setContextMenuVisible(true);
  };

  const handleDetailPanelClose = () => {
    setDetailPanelVisible(false);
  };

  const handleEditNode = (nodeId: string) => {
    setEditModalVisible(true);
    setDetailPanelVisible(false);
    setContextMenuVisible(false);
  };

  const handleSaveNode = (nodeId: string, updates: Partial<NetworkNode>) => {
    console.log('Save node:', nodeId, updates);

    // 使用不可变数据更新，确保React能检测到变化并重新渲染
    setCurrentScene(prevScene => ({
      ...prevScene,
      nodes: prevScene.nodes.map(node =>
        node.nodeId === nodeId
          ? { ...node, ...updates }
          : node
      )
    }));

    message.success('节点信息已更新');
  };

  const handleViewVulnerabilities = (nodeId: string) => {
    message.info(`查看漏洞功能开发中: ${nodeId}`);
    setContextMenuVisible(false);
    // TODO: 跳转到漏洞管理页面
  };

  const handleViewRelations = (nodeId: string) => {
    message.info(`查看关联功能开发中: ${nodeId}`);
    setContextMenuVisible(false);
    // TODO: 跳转到知识图谱页面
  };

  const handleLayerChange = (layer: LayerType) => {
    setActiveLayer(layer);
    // 自动启用对应的叠加图层
    setLayerConfig({
      ...layerConfig,
      [layer]: true
    });
  };

  const handleLayerToggle = (layer: LayerType, enabled: boolean) => {
    setLayerConfig({
      ...layerConfig,
      [layer]: enabled
    });
  };

  return (
    <div style={{ padding: '24px', height: '100vh' }}>
      <Card
        title={`攻防驾驶舱 - ${currentScene.metadata.name}`}
        style={{ height: '100%' }}
      >
        <div style={{ display: 'flex', height: 'calc(100% - 60px)', gap: '16px' }}>
          {/* 左侧图层控制器 */}
          <div style={{ flexShrink: 0 }}>
            <LayerController
              activeLayer={activeLayer}
              layerConfig={layerConfig}
              onLayerChange={handleLayerChange}
              onLayerToggle={handleLayerToggle}
            />
          </div>

          {/* 右侧画布 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <SandboxCanvas
              zones={currentScene.zones}
              nodes={graphData.nodes}
              edges={graphData.edges}
              activeLayer={activeLayer}
              layerConfig={layerConfig}
              onNodeClick={handleNodeClick}
              onNodeContextMenu={handleNodeContextMenu}
            />
          </div>
        </div>
      </Card>

      {/* 节点详情面板 */}
      <NodeDetailPanel
        visible={detailPanelVisible}
        node={selectedNode}
        onClose={handleDetailPanelClose}
        onEdit={handleEditNode}
        onViewVulnerabilities={handleViewVulnerabilities}
        onViewRelations={handleViewRelations}
      />

      {/* 节点编辑对话框 */}
      <NodeEditModal
        visible={editModalVisible}
        node={selectedNode}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSaveNode}
      />

      {/* 节点右键菜单 */}
      <NodeContextMenu
        visible={contextMenuVisible}
        x={contextMenuPosition.x}
        y={contextMenuPosition.y}
        onViewDetails={() => {
          setDetailPanelVisible(true);
          setContextMenuVisible(false);
        }}
        onEdit={() => handleEditNode(selectedNodeId || '')}
        onViewVulnerabilities={() => handleViewVulnerabilities(selectedNodeId || '')}
        onViewRelations={() => handleViewRelations(selectedNodeId || '')}
        onClose={() => setContextMenuVisible(false)}
      />
    </div>
  );
};

export default CockpitPage;

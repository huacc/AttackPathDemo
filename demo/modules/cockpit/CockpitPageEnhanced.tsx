import React, { useState, useMemo, useRef } from 'react';
import { Card } from 'antd';
import SandboxCanvasEnhanced, { SandboxCanvasRef } from './components/SandboxCanvasEnhanced';
import LayerController, { LayerType, LayerConfig } from './components/LayerController';
import SandboxToolbar, { LayoutType } from './components/SandboxToolbar';
import SandboxStatusBar from './components/SandboxStatusBar';
import { SCENES } from '../../mock/dynamic/scenes';
import { NETWORK_NODES } from '../../mock/static/networkNodes';

/**
 * 攻防驾驶舱页面（增强版）
 * 展示2D网络沙盘、图层控制、工具栏、状态栏
 */
export const CockpitPageEnhanced: React.FC = () => {
  const canvasRef = useRef<SandboxCanvasRef>(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [activeLayer, setActiveLayer] = useState<LayerType>('network');
  const [layerConfig, setLayerConfig] = useState<LayerConfig>({
    business: false,
    network: true,
    attack: false
  });
  const [currentLayout, setCurrentLayout] = useState<LayoutType>('preset');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentScene = SCENES[currentSceneIndex];

  // 转换节点数据为G6格式
  const graphData = useMemo(() => {
    const sceneNodeIds = currentScene.scene.networkTopology.nodes;

    // 过滤出场景中的节点
    const nodes = NETWORK_NODES
      .filter(node => sceneNodeIds.includes(node.nodeId))
      .map(node => {
        const position = currentScene.nodePositions[node.nodeId] || { x: 0, y: 0 };
        return {
          id: node.nodeId,
          x: position.x,
          y: position.y,
          ...node
        };
      });

    // 转换连接为G6边格式
    const edges = currentScene.connections.map(conn => ({
      id: conn.connectionId,
      source: conn.sourceId,
      target: conn.targetId,
      label: conn.protocol,
      style: {
        stroke: getProtocolColor(conn.protocol),
        lineWidth: getLineWidth(conn.bandwidth)
      }
    }));

    return { nodes, edges };
  }, [currentScene]);

  // 计算节点统计
  const nodeStats = useMemo(() => {
    const sceneNodeIds = currentScene.scene.networkTopology.nodes;
    const sceneNodes = NETWORK_NODES.filter(node => sceneNodeIds.includes(node.nodeId));

    return {
      total: sceneNodes.length,
      online: sceneNodes.filter(n => n.status === 'online').length,
      offline: sceneNodes.filter(n => n.status === 'offline').length,
      compromised: sceneNodes.filter(n => n.status === 'compromised').length,
      warning: sceneNodes.filter(n => n.status === 'degraded').length
    };
  }, [currentScene]);

  const handleNodeClick = (nodeId: string) => {
    console.log('Node clicked:', nodeId);
  };

  const handleLayerChange = (layer: LayerType) => {
    setActiveLayer(layer);
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

  const handleSceneChange = (sceneId: string) => {
    const index = SCENES.findIndex(s => s.scene.sceneId === sceneId);
    if (index !== -1) {
      setCurrentSceneIndex(index);
    }
  };

  const handleLayoutChange = (layout: LayoutType) => {
    setCurrentLayout(layout);
    canvasRef.current?.changeLayout(layout);
  };

  const handleZoomIn = () => {
    canvasRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    canvasRef.current?.zoomOut();
  };

  const handleZoomReset = () => {
    canvasRef.current?.zoomReset();
  };

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
    // TODO: 实现真正的全屏API
  };

  const handleExportImage = () => {
    canvasRef.current?.exportImage();
  };

  return (
    <div style={{ padding: '24px', height: '100vh' }}>
      <Card
        title={`攻防驾驶舱 - ${currentScene.scene.name}`}
        style={{ height: '100%' }}
        bodyStyle={{ padding: 0, height: 'calc(100% - 57px)', display: 'flex', flexDirection: 'column' }}
      >
        {/* 工具栏 */}
        <SandboxToolbar
          scenes={SCENES.map(s => ({ sceneId: s.scene.sceneId, name: s.scene.name }))}
          currentSceneId={currentScene.scene.sceneId}
          onSceneChange={handleSceneChange}
          currentLayout={currentLayout}
          onLayoutChange={handleLayoutChange}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomReset={handleZoomReset}
          isFullscreen={isFullscreen}
          onFullscreenToggle={handleFullscreenToggle}
          onExportImage={handleExportImage}
        />

        {/* 主内容区 */}
        <div style={{ display: 'flex', flex: 1, gap: '16px', padding: '16px', minHeight: 0 }}>
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
            <SandboxCanvasEnhanced
              ref={canvasRef}
              zones={currentScene.zones}
              nodes={graphData.nodes}
              edges={graphData.edges}
              activeLayer={activeLayer}
              layerConfig={layerConfig}
              showMinimap={true}
              onNodeClick={handleNodeClick}
            />
          </div>
        </div>

        {/* 状态栏 */}
        <SandboxStatusBar stats={nodeStats} />
      </Card>
    </div>
  );
};

/**
 * 根据协议获取连接线颜色
 */
const getProtocolColor = (protocol: string): string => {
  const colorMap: Record<string, string> = {
    https: '#52c41a',
    http: '#faad14',
    tcp: '#1890ff',
    udp: '#722ed1',
    smb: '#eb2f96',
    rdp: '#fa8c16',
    ldap: '#13c2c2',
    smtp: '#a0d911'
  };
  return colorMap[protocol] || '#d9d9d9';
};

/**
 * 根据带宽获取连接线宽度
 */
const getLineWidth = (bandwidth: number): number => {
  if (bandwidth >= 10000) return 3;
  if (bandwidth >= 1000) return 2;
  return 1;
};

export default CockpitPageEnhanced;

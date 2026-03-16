import React, { useEffect, useRef, useState } from 'react';
import G6, { Graph, GraphData } from '@antv/g6';
import { NetworkZone } from '../../../types';
import { registerCustomNode } from './NodeRenderer';
import { registerCustomEdge } from './EdgeRenderer';
import { LayerType, LayerConfig } from './LayerController';

interface AttackPathPhase {
  targetNodeId: string;
  [key: string]: any;
}

interface AttackPathData {
  pathId: string;
  phases: AttackPathPhase[];
}

interface SandboxCanvasProps {
  zones: NetworkZone[];
  nodes?: GraphData['nodes'];
  edges?: GraphData['edges'];
  width?: number;
  height?: number;
  activeLayer?: LayerType;
  layerConfig?: LayerConfig;
  attackPaths?: AttackPathData[];
  onNodeClick?: (nodeId: string) => void;
  onNodeContextMenu?: (nodeId: string, x: number, y: number) => void;
}

/**
 * 2D网络沙盘画布组件
 * 基于AntV G6实现，支持缩放、平移、自适应
 * 渲染安全域背景色块和网络节点
 * 支持图层切换：业务层、网络层、攻防层
 */
export const SandboxCanvas: React.FC<SandboxCanvasProps> = ({
  zones,
  nodes = [],
  edges = [],
  width = 1200,
  height = 700,
  activeLayer = 'network',
  layerConfig = { business: false, network: true, attack: false },
  attackPaths = [],
  onNodeClick,
  onNodeContextMenu
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const [isReady, setIsReady] = useState(false);

  // 初始化G6画布
  useEffect(() => {
    if (!containerRef.current) return;

    // 注册自定义节点和边类型
    registerCustomNode(G6);
    registerCustomEdge(G6);

    // 清理旧实例
    if (graphRef.current) {
      graphRef.current.destroy();
    }

    // 创建G6实例
    const graph = new G6.Graph({
      container: containerRef.current,
      width,
      height,
      modes: {
        default: [
          'drag-canvas', // 拖拽画布
          'zoom-canvas', // 缩放画布
          {
            type: 'drag-node',
            enableDelegate: true
          }
        ]
      },
      layout: {
        type: 'preset' // 使用预设坐标
      },
      defaultNode: {
        type: 'network-node', // 使用自定义节点类型
        size: [160, 100]
      },
      defaultEdge: {
        type: 'network-edge-with-label' // 使用自定义边类型（带标签）
      },
      fitView: true,
      fitViewPadding: [20, 20, 20, 20]
    });

    graphRef.current = graph;
    setIsReady(true);

    // 监听节点点击事件
    graph.on('node:click', (evt) => {
      const nodeId = evt.item?.getModel().id as string;
      if (nodeId && onNodeClick) {
        onNodeClick(nodeId);
      }
    });

    // 监听节点右键菜单事件
    graph.on('node:contextmenu', (evt) => {
      evt.preventDefault();
      const nodeId = evt.item?.getModel().id as string;
      if (nodeId && onNodeContextMenu) {
        onNodeContextMenu(nodeId, evt.clientX, evt.clientY);
      }
    });

    // 监听节点hover事件
    graph.on('node:mouseenter', (evt) => {
      const node = evt.item;
      if (node) {
        graph.setItemState(node, 'hover', true);

        // 显示tooltip
        const model = node.getModel();
        const canvas = graph.get('canvas');
        const point = canvas.getPointByClient(evt.clientX, evt.clientY);

        // 创建tooltip
        const tooltip = document.createElement('div');
        tooltip.id = 'g6-tooltip';
        tooltip.style.cssText = `
          position: absolute;
          left: ${evt.clientX + 10}px;
          top: ${evt.clientY + 10}px;
          background: rgba(0, 0, 0, 0.85);
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          z-index: 1000;
          pointer-events: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        `;
        tooltip.innerHTML = `
          <div><strong>${model.name}</strong></div>
          <div>IP: ${model.ipv4Address?.split('/')[0] || 'N/A'}</div>
          <div>状态: ${model.status === 'online' ? '在线' :
                      model.status === 'offline' ? '离线' :
                      model.status === 'degraded' ? '降级' :
                      model.status === 'compromised' ? '失陷' : '未知'}</div>
        `;
        document.body.appendChild(tooltip);
      }
    });

    graph.on('node:mouseleave', (evt) => {
      const node = evt.item;
      if (node) {
        graph.setItemState(node, 'hover', false);

        // 移除tooltip
        const tooltip = document.getElementById('g6-tooltip');
        if (tooltip) {
          tooltip.remove();
        }
      }
    });

    // 监听边hover事件
    graph.on('edge:mouseenter', (evt) => {
      const edge = evt.item;
      if (edge) {
        graph.setItemState(edge, 'hover', true);
      }
    });

    graph.on('edge:mouseleave', (evt) => {
      const edge = evt.item;
      if (edge) {
        graph.setItemState(edge, 'hover', false);
      }
    });

    // 清理函数
    return () => {
      if (graphRef.current) {
        graphRef.current.destroy();
        graphRef.current = null;
      }
    };
  }, [width, height, onNodeClick, onNodeContextMenu]);

  // 渲染安全域背景
  useEffect(() => {
    if (!graphRef.current || !isReady) return;

    const graph = graphRef.current;
    const group = graph.get('group');

    // 清除旧的背景
    const oldZones = group.findAll((item: any) => item.get('name') === 'zone-background');
    oldZones.forEach((item: any) => item.remove());

    // 渲染每个安全域
    zones.forEach((zone) => {
      const { position, backgroundColor, zoneName } = zone;
      // 根据zoneType确定边框颜色
      const borderColor = zone.zoneType === 'external' ? '#ef5350' :
                         zone.zoneType === 'dmz' ? '#ff9800' :
                         zone.zoneType === 'intranet' ? '#2196f3' : '#9c27b0';

      // 绘制背景矩形
      group.addShape('rect', {
        attrs: {
          x: position.x,
          y: position.y,
          width: position.width,
          height: position.height,
          fill: backgroundColor,
          stroke: borderColor,
          lineWidth: 2,
          radius: 8,
          opacity: 0.3
        },
        name: 'zone-background',
        draggable: false,
        zIndex: -1
      });

      // 绘制域标签
      group.addShape('text', {
        attrs: {
          x: position.x + 10,
          y: position.y + 25,
          text: zoneName,
          fontSize: 16,
          fontWeight: 'bold',
          fill: borderColor,
          textBaseline: 'middle'
        },
        name: 'zone-label',
        draggable: false,
        zIndex: 0
      });
    });

    graph.paint();
  }, [zones, isReady]);

  // 更新节点和边数据
  useEffect(() => {
    if (!graphRef.current || !isReady) return;

    const graph = graphRef.current;
    graph.data({ nodes, edges });
    graph.render();
  }, [nodes, edges, isReady]);

  // 图层切换效果
  useEffect(() => {
    if (!graphRef.current || !isReady) return;

    const graph = graphRef.current;
    const allNodes = graph.getNodes();
    const allEdges = graph.getEdges();

    // 根据图层配置更新节点和边的显示状态
    allNodes.forEach((node) => {
      const model = node.getModel();
      let visible = false;
      let opacity = 1;

      // 根据主图层决定基础可见性
      switch (activeLayer) {
        case 'business':
          // 业务层：显示业务分组，节点按业务系统着色
          visible = true;
          opacity = layerConfig.business ? 1 : 0.3;
          break;
        case 'network':
          // 网络层：显示网络拓扑
          visible = true;
          opacity = layerConfig.network ? 1 : 0.3;
          break;
        case 'attack':
          // 攻防层：突出显示失陷节点和攻击路径
          const isCompromised = model.status === 'compromised';
          visible = true;
          opacity = layerConfig.attack ? (isCompromised ? 1 : 0.2) : 0.3;
          break;
      }

      // 叠加图层影响
      if (layerConfig.business && activeLayer !== 'business') {
        opacity = Math.max(opacity, 0.5);
      }
      if (layerConfig.network && activeLayer !== 'network') {
        opacity = Math.max(opacity, 0.5);
      }
      if (layerConfig.attack && activeLayer !== 'attack') {
        opacity = Math.max(opacity, 0.5);
      }

      // 更新节点样式
      graph.updateItem(node, {
        style: {
          ...model.style,
          opacity: visible ? opacity : 0
        }
      });

      if (visible) {
        graph.showItem(node);
      } else {
        graph.hideItem(node);
      }
    });

    // 更新边的显示状态
    allEdges.forEach((edge) => {
      const model = edge.getModel();
      let visible = false;
      let opacity = 1;
      let strokeColor = '#e2e2e2';

      switch (activeLayer) {
        case 'business':
          // 业务层：隐藏大部分连接线
          visible = false;
          break;
        case 'network':
          // 网络层：显示所有网络连接
          visible = true;
          opacity = layerConfig.network ? 1 : 0.3;
          break;
        case 'attack':
          // 攻防层：突出显示攻击路径
          const isAttackPath = model.isAttackPath === true;
          visible = true;
          opacity = layerConfig.attack ? (isAttackPath ? 1 : 0.1) : 0.3;
          strokeColor = isAttackPath ? '#ff4d4f' : '#e2e2e2';
          break;
      }

      // 叠加图层影响
      if (layerConfig.network && activeLayer !== 'network') {
        visible = true;
        opacity = Math.max(opacity, 0.3);
      }

      // 更新边样式
      graph.updateItem(edge, {
        style: {
          ...model.style,
          opacity: visible ? opacity : 0,
          stroke: strokeColor
        }
      });

      if (visible) {
        graph.showItem(edge);
      } else {
        graph.hideItem(edge);
      }
    });

    graph.paint();
  }, [activeLayer, layerConfig, isReady]);

  // 渲染攻击路径动画
  useEffect(() => {
    if (!graphRef.current || !isReady || !attackPaths || attackPaths.length === 0) return;

    const graph = graphRef.current;
    const allEdges = graph.getEdges();

    // 标记攻击路径上的边
    const attackPathEdgeIds = new Set<string>();
    attackPaths.forEach(path => {
      for (let i = 0; i < path.phases.length - 1; i++) {
        const sourceNodeId = path.phases[i].targetNodeId;
        const targetNodeId = path.phases[i + 1].targetNodeId;

        // 查找连接这两个节点的边
        allEdges.forEach(edge => {
          const model = edge.getModel();
          if (
            (model.source === sourceNodeId && model.target === targetNodeId) ||
            (model.source === targetNodeId && model.target === sourceNodeId)
          ) {
            attackPathEdgeIds.add(model.id as string);
          }
        });
      }
    });

    // 更新边的攻击路径标记
    allEdges.forEach(edge => {
      const model = edge.getModel();
      const isAttackPath = attackPathEdgeIds.has(model.id as string);

      graph.updateItem(edge, {
        ...model,
        isAttackPath,
        style: {
          ...model.style,
          stroke: isAttackPath ? '#ff4d4f' : (model.style?.stroke || '#e2e2e2'),
          lineWidth: isAttackPath ? 3 : 1,
          opacity: isAttackPath ? 1 : (model.style?.opacity || 0.5)
        }
      });
    });

    graph.paint();
  }, [attackPaths, isReady]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        border: '1px solid #e8e8e8',
        borderRadius: '4px',
        backgroundColor: '#fafafa'
      }}
    />
  );
};

export default SandboxCanvas;

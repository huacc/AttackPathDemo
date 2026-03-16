import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import G6, { Graph, GraphData } from '@antv/g6';
import { registerCustomNode } from './NodeRenderer';
import { registerCustomEdge } from './EdgeRenderer';
import { LayerType, LayerConfig } from './LayerController';

// 临时类型定义，匹配scenes.ts中的实际结构
interface NetworkZone {
  zoneId: string;
  name: string;
  zone: 'external' | 'dmz' | 'intranet' | 'cloud';
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  backgroundColor: string;
  borderColor: string;
  label: string;
}

interface SandboxCanvasProps {
  zones: NetworkZone[];
  nodes?: GraphData['nodes'];
  edges?: GraphData['edges'];
  width?: number;
  height?: number;
  activeLayer?: LayerType;
  layerConfig?: LayerConfig;
  showMinimap?: boolean;
  onNodeClick?: (nodeId: string) => void;
}

export interface SandboxCanvasRef {
  zoomIn: () => void;
  zoomOut: () => void;
  zoomReset: () => void;
  exportImage: () => void;
  changeLayout: (layoutType: string) => void;
}

/**
 * 2D网络沙盘画布组件（增强版）
 * 基于AntV G6实现，支持缩放、平移、自适应
 * 渲染安全域背景色块和网络节点
 * 支持图层切换：业务层、网络层、攻防层
 * 支持缩略图、工具栏控制
 */
export const SandboxCanvasEnhanced = forwardRef<SandboxCanvasRef, SandboxCanvasProps>(
  (
    {
      zones,
      nodes = [],
      edges = [],
      width = 1200,
      height = 700,
      activeLayer = 'network',
      layerConfig = { business: false, network: true, attack: false },
      showMinimap = true,
      onNodeClick
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<Graph | null>(null);
    const [isReady, setIsReady] = useState(false);

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      zoomIn: () => {
        if (graphRef.current) {
          const currentZoom = graphRef.current.getZoom();
          graphRef.current.zoomTo(currentZoom * 1.2);
        }
      },
      zoomOut: () => {
        if (graphRef.current) {
          const currentZoom = graphRef.current.getZoom();
          graphRef.current.zoomTo(currentZoom * 0.8);
        }
      },
      zoomReset: () => {
        if (graphRef.current) {
          graphRef.current.fitView(20);
        }
      },
      exportImage: () => {
        if (graphRef.current) {
          graphRef.current.downloadFullImage('network-sandbox', 'image/png', {
            backgroundColor: '#fff',
            padding: 20
          });
        }
      },
      changeLayout: (layoutType: string) => {
        if (graphRef.current) {
          graphRef.current.updateLayout({
            type: layoutType,
            preventOverlap: true,
            nodeSize: 100
          });
        }
      }
    }));

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

      // 配置插件
      const plugins: any[] = [];
      if (showMinimap) {
        const minimap = new G6.Minimap({
          size: [200, 150],
          className: 'g6-minimap',
          type: 'delegate'
        });
        plugins.push(minimap);
      }

      // 创建G6实例
      const graph = new G6.Graph({
        container: containerRef.current,
        width,
        height,
        plugins,
        modes: {
          default: [
            'drag-canvas',
            'zoom-canvas',
            {
              type: 'drag-node',
              enableDelegate: true
            }
          ]
        },
        layout: {
          type: 'preset'
        },
        defaultNode: {
          type: 'network-node',
          size: [160, 100]
        },
        defaultEdge: {
          style: {
            stroke: '#e2e2e2',
            lineWidth: 1,
            endArrow: {
              path: G6.Arrow.triangle(8, 10, 0),
              fill: '#e2e2e2'
            }
          }
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

      // 监听节点hover事件
      graph.on('node:mouseenter', (evt) => {
        const node = evt.item;
        if (node) {
          graph.setItemState(node, 'hover', true);
        }
      });

      graph.on('node:mouseleave', (evt) => {
        const node = evt.item;
        if (node) {
          graph.setItemState(node, 'hover', false);
        }
      });

      // 清理函数
      return () => {
        if (graphRef.current) {
          graphRef.current.destroy();
          graphRef.current = null;
        }
      };
    }, [width, height, showMinimap, onNodeClick]);

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
        const { bounds, backgroundColor, borderColor, label } = zone;

        // 绘制背景矩形
        group.addShape('rect', {
          attrs: {
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
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
            x: bounds.x + 10,
            y: bounds.y + 25,
            text: label,
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
            visible = true;
            opacity = layerConfig.business ? 1 : 0.3;
            break;
          case 'network':
            visible = true;
            opacity = layerConfig.network ? 1 : 0.3;
            break;
          case 'attack':
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
            visible = false;
            break;
          case 'network':
            visible = true;
            opacity = layerConfig.network ? 1 : 0.3;
            break;
          case 'attack':
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

    return (
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          border: '1px solid #e8e8e8',
          borderRadius: '4px',
          backgroundColor: '#fafafa',
          position: 'relative'
        }}
      />
    );
  }
);

SandboxCanvasEnhanced.displayName = 'SandboxCanvasEnhanced';

export default SandboxCanvasEnhanced;

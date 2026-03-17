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
  onCanvasDrop?: (payload: string, position: { x: number; y: number }) => void;
}

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
  onNodeContextMenu,
  onCanvasDrop
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const [isReady, setIsReady] = useState(false);

  const onNodeClickRef = useRef(onNodeClick);
  const onNodeContextMenuRef = useRef(onNodeContextMenu);
  const onCanvasDropRef = useRef(onCanvasDrop);

  const attackStatusColorMap: Record<string, string> = {
    blocked: '#52c41a',
    detected: '#faad14',
    bypassed: '#ff4d4f',
    compromised: '#ff4d4f',
    not_reached: '#bfbfbf'
  };

  useEffect(() => {
    onNodeClickRef.current = onNodeClick;
    onNodeContextMenuRef.current = onNodeContextMenu;
    onCanvasDropRef.current = onCanvasDrop;
  }, [onNodeClick, onNodeContextMenu, onCanvasDrop]);

  useEffect(() => {
    if (!containerRef.current) return;

    registerCustomNode(G6);
    registerCustomEdge(G6);

    if (graphRef.current) {
      graphRef.current.destroy();
    }

    const graph = new G6.Graph({
      container: containerRef.current,
      width,
      height,
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
      defaultNode: {
        type: 'network-node',
        size: [160, 100]
      },
      defaultEdge: {
        type: 'network-edge-with-label'
      },
      fitView: true,
      fitViewPadding: [20, 20, 20, 20]
    });

    graphRef.current = graph;
    setIsReady(true);

    graph.on('node:click', (evt) => {
      const nodeId = evt.item?.getModel().id as string;
      if (nodeId && onNodeClickRef.current) {
        onNodeClickRef.current(nodeId);
      }
    });

    graph.on('node:contextmenu', (evt) => {
      evt.preventDefault();
      const nodeId = evt.item?.getModel().id as string;
      if (nodeId && onNodeContextMenuRef.current) {
        onNodeContextMenuRef.current(nodeId, evt.clientX, evt.clientY);
      }
    });

    graph.on('node:mouseenter', (evt) => {
      const node = evt.item;
      if (!node) return;

      graph.setItemState(node, 'hover', true);
      const model = node.getModel();

      const oldTooltip = document.getElementById('g6-tooltip');
      if (oldTooltip) oldTooltip.remove();

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
        <div>状态: ${model.status === 'online' ? '在线' : model.status === 'offline' ? '离线' : model.status === 'degraded' ? '降级' : model.status === 'compromised' ? '失陷' : '未知'}</div>
      `;
      document.body.appendChild(tooltip);
    });

    graph.on('node:mouseleave', (evt) => {
      const node = evt.item;
      if (node) {
        graph.setItemState(node, 'hover', false);
      }
      const tooltip = document.getElementById('g6-tooltip');
      if (tooltip) tooltip.remove();
    });

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

    return () => {
      const tooltip = document.getElementById('g6-tooltip');
      if (tooltip) tooltip.remove();
      if (graphRef.current) {
        graphRef.current.destroy();
        graphRef.current = null;
      }
    };
  }, [width, height]);

  useEffect(() => {
    if (!graphRef.current || !isReady) return;

    const graph = graphRef.current;
    const group = graph.get('group');

    const oldZones = group.findAll((item: any) => {
      const name = item.get('name');
      return name === 'zone-background' || name === 'zone-label';
    });
    oldZones.forEach((item: any) => item.remove());

    zones.forEach((zone) => {
      const { position, backgroundColor, zoneName } = zone;
      const borderColor = zone.zoneType === 'external'
        ? '#ef5350'
        : zone.zoneType === 'dmz'
          ? '#ff9800'
          : zone.zoneType === 'intranet'
            ? '#2196f3'
            : '#9c27b0';

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

  useEffect(() => {
    if (!graphRef.current || !isReady) return;

    const graph = graphRef.current;
    const nextData = { nodes, edges };

    if (typeof (graph as any).changeData === 'function') {
      (graph as any).changeData(nextData);
    } else {
      graph.data(nextData);
      graph.render();
    }

    graph.paint();
  }, [nodes, edges, isReady]);

  useEffect(() => {
    if (!graphRef.current || !isReady) return;

    const graph = graphRef.current;
    const allNodes = graph.getNodes();
    const allEdges = graph.getEdges();

    allNodes.forEach((node) => {
      const model = node.getModel() as any;
      let visible = false;
      let opacity = 1;

      switch (activeLayer) {
        case 'business':
          visible = true;
          opacity = layerConfig.business ? 1 : 0.3;
          break;
        case 'network':
          visible = true;
          opacity = layerConfig.network ? 1 : 0.3;
          break;
        case 'attack': {
          const isCompromised = model.status === 'compromised';
          visible = true;
          opacity = layerConfig.attack ? (isCompromised ? 1 : 0.2) : 0.3;
          break;
        }
      }

      if (layerConfig.business && activeLayer !== 'business') opacity = Math.max(opacity, 0.5);
      if (layerConfig.network && activeLayer !== 'network') opacity = Math.max(opacity, 0.5);
      if (layerConfig.attack && activeLayer !== 'attack') opacity = Math.max(opacity, 0.5);

      graph.updateItem(node, {
        style: {
          ...model.style,
          opacity: visible ? opacity : 0
        }
      });

      if (visible) graph.showItem(node);
      else graph.hideItem(node);
    });

    allEdges.forEach((edge) => {
      const model = edge.getModel() as any;
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
        case 'attack': {
          const isAttackPath = model.isAttackPath === true;
          const phaseStatus = (model.attackPhaseStatus as string | undefined) ?? 'bypassed';
          visible = true;
          opacity = layerConfig.attack ? (isAttackPath ? 1 : 0.1) : 0.3;
          strokeColor = isAttackPath ? (attackStatusColorMap[phaseStatus] || '#ff4d4f') : '#e2e2e2';
          break;
        }
      }

      if (layerConfig.network && activeLayer !== 'network') {
        visible = true;
        opacity = Math.max(opacity, 0.3);
      }

      graph.updateItem(edge, {
        style: {
          ...model.style,
          opacity: visible ? opacity : 0,
          stroke: strokeColor
        }
      });

      if (visible) graph.showItem(edge);
      else graph.hideItem(edge);
    });

    graph.paint();
  }, [activeLayer, layerConfig, isReady]);

  useEffect(() => {
    if (!graphRef.current || !isReady || !attackPaths || attackPaths.length === 0) return;

    const graph = graphRef.current;
    const allEdges = graph.getEdges();
    const attackPathEdgeIds = new Set<string>();

    attackPaths.forEach(path => {
      for (let i = 0; i < path.phases.length - 1; i += 1) {
        const sourceNodeId = path.phases[i].targetNodeId;
        const targetNodeId = path.phases[i + 1].targetNodeId;

        allEdges.forEach(edge => {
          const model = edge.getModel() as any;
          if (
            (model.source === sourceNodeId && model.target === targetNodeId) ||
            (model.source === targetNodeId && model.target === sourceNodeId)
          ) {
            attackPathEdgeIds.add(model.id as string);
          }
        });
      }
    });

    allEdges.forEach(edge => {
      const model = edge.getModel() as any;
      const isAttackPath = attackPathEdgeIds.has(model.id as string);

      if (model.attackPhaseStatus) {
        return;
      }

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
      onDragOver={(evt) => {
        evt.preventDefault();
      }}
      onDrop={(evt) => {
        evt.preventDefault();
        const payload =
          evt.dataTransfer.getData('application/x-cockpit-model-template') ||
          evt.dataTransfer.getData('text/plain');

        if (!payload || !onCanvasDropRef.current) {
          return;
        }

        let position = { x: evt.clientX, y: evt.clientY };
        const graph = graphRef.current as any;

        if (graph && typeof graph.getPointByClient === 'function') {
          const point = graph.getPointByClient(evt.clientX, evt.clientY);
          if (point && typeof point.x === 'number' && typeof point.y === 'number') {
            position = { x: point.x, y: point.y };
          }
        } else {
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            position = { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
          }
        }

        onCanvasDropRef.current(payload, position);
      }}
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

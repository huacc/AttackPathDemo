import React, { useEffect, useMemo, useRef, useState } from 'react';
import G6 from '@antv/g6';
import type { EdgeConfig, IG6GraphEvent, IGraph, NodeConfig } from '@antv/g6';
import { Card, Col, List, Row, Space, Tag, Typography } from 'antd';

const { Title, Text } = Typography;

interface OntologyAttribute {
  name: string;
  type: string;
  description: string;
}

interface OntologyNode {
  id: string;
  name: string;
  code: string;
  instanceCount: number;
  color: string;
  x: number;
  y: number;
  attributes: OntologyAttribute[];
}

interface OntologyEdge {
  source: string;
  target: string;
  relation: string;
  color: string;
}

const ontologyNodes: OntologyNode[] = [
  {
    id: 'network-node',
    name: '网络节点本体',
    code: 'NetworkNode',
    instanceCount: 28,
    color: '#1677ff',
    x: 80,
    y: 120,
    attributes: [
      { name: 'nodeId', type: 'string', description: '节点唯一标识' },
      { name: 'name', type: 'string', description: '节点名称' },
      { name: 'nodeType', type: 'enum', description: 'hardware/software' },
      { name: 'zone', type: 'enum', description: '安全域' },
      { name: 'ipv4Address', type: 'string', description: 'IPv4 地址' }
    ]
  },
  {
    id: 'vulnerability',
    name: '漏洞本体',
    code: 'Vulnerability',
    instanceCount: 15,
    color: '#fa8c16',
    x: 330,
    y: 280,
    attributes: [
      { name: 'cveId', type: 'string', description: 'CVE 标识' },
      { name: 'severity', type: 'enum', description: '严重程度' },
      { name: 'cvssScore', type: 'number', description: 'CVSS 评分' },
      { name: 'cweId', type: 'string', description: 'CWE 分类' }
    ]
  },
  {
    id: 'attack-technique',
    name: '攻击技术本体',
    code: 'AttackTechnique',
    instanceCount: 45,
    color: '#ff4d4f',
    x: 330,
    y: 80,
    attributes: [
      { name: 'techniqueId', type: 'string', description: 'ATT&CK ID' },
      { name: 'name', type: 'string', description: '技术名称' },
      { name: 'tactic', type: 'enum', description: '战术阶段' },
      { name: 'platform', type: 'array', description: '适用平台' }
    ]
  },
  {
    id: 'attack-defense-relation',
    name: '攻防关系本体',
    code: 'AttackDefenseRelation',
    instanceCount: 54,
    color: '#722ed1',
    x: 600,
    y: 180,
    attributes: [
      { name: 'relationId', type: 'string', description: '关系唯一标识' },
      { name: 'relationType', type: 'enum', description: '关系类型(7种)' },
      { name: 'sourceId', type: 'string', description: '源对象ID' },
      { name: 'targetId', type: 'string', description: '目标对象ID' },
      { name: 'effectivenessScore', type: 'number', description: '效能评分' }
    ]
  },
  {
    id: 'threat-actor',
    name: '威胁行为者本体',
    code: 'ThreatActor',
    instanceCount: 5,
    color: '#13c2c2',
    x: 850,
    y: 40,
    attributes: [
      { name: 'actorId', type: 'string', description: '行为者标识' },
      { name: 'name', type: 'string', description: '组织/代号' },
      { name: 'sophistication', type: 'enum', description: '成熟度' },
      { name: 'motivation', type: 'enum', description: '动机' }
    ]
  },
  {
    id: 'defense-measure',
    name: '防御措施本体',
    code: 'DefenseMeasure',
    instanceCount: 18,
    color: '#52c41a',
    x: 600,
    y: 280,
    attributes: [
      { name: 'defenseId', type: 'string', description: '措施标识' },
      { name: 'name', type: 'string', description: '措施名称' },
      { name: 'category', type: 'enum', description: '类别/技术' },
      { name: 'coverage', type: 'number', description: '覆盖度评分' }
    ]
  }
];

const ontologyEdges: OntologyEdge[] = [
  { source: 'vulnerability', target: 'network-node', relation: 'exists_in', color: '#fa8c16' },
  { source: 'attack-technique', target: 'vulnerability', relation: 'exploits', color: '#ff4d4f' },
  { source: 'attack-technique', target: 'network-node', relation: 'targets', color: '#ff4d4f' },
  { source: 'attack-technique', target: 'threat-actor', relation: 'attributed_to', color: '#13c2c2' },
  { source: 'defense-measure', target: 'attack-technique', relation: 'mitigates', color: '#52c41a' },
  { source: 'defense-measure', target: 'network-node', relation: 'deployed_on', color: '#52c41a' },
  { source: 'network-node', target: 'network-node', relation: 'propagates_to', color: '#722ed1' }
];

const OntologyDesigner: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<IGraph | null>(null);
  const [selectedNode, setSelectedNode] = useState<OntologyNode | null>(null);

  const graphData = useMemo(() => {
    const nodes = ontologyNodes.map(node => ({
      id: node.id,
      label: `${node.name}\n${node.code}\n实例: ${node.instanceCount}`,
      color: node.color,
      x: node.x,
      y: node.y,
      attributes: node.attributes,
      ontologyName: node.name,
      ontologyCode: node.code,
      instanceCount: node.instanceCount
    }));

    const edges = ontologyEdges.map(edge => ({
      source: edge.source,
      target: edge.target,
      label: edge.relation,
      relation: edge.relation,
      color: edge.color
    }));

    return { nodes, edges };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 520;

    const graph = new G6.Graph({
      container: containerRef.current,
      width,
      height,
      layout: { type: 'preset' },
      modes: {
        default: ['drag-canvas', 'zoom-canvas']
      },
      defaultNode: {
        type: 'rect',
        size: [200, 72],
        style: {
          radius: 8,
          stroke: '#e5e7eb',
          lineWidth: 1
        },
        labelCfg: {
          style: {
            fill: '#111827',
            fontSize: 12,
            lineHeight: 16,
            textAlign: 'center'
          }
        }
      },
      defaultEdge: {
        style: {
          stroke: '#94a3b8',
          lineWidth: 1.6,
          endArrow: {
            path: G6.Arrow.triangle(8, 10, 2),
            fill: '#94a3b8'
          }
        },
        labelCfg: {
          autoRotate: true,
          style: {
            fill: '#64748b',
            fontSize: 11,
            background: {
              fill: '#ffffff',
              padding: [2, 4, 2, 4],
              radius: 2
            }
          }
        }
      }
    });

    graph.data(graphData);
    graph.render();

    graph.getNodes().forEach(node => {
      const model = node.getModel() as NodeConfig;
      graph.updateItem(node, {
        style: {
          fill: model.color as string,
          stroke: model.color as string,
          shadowBlur: 10,
          shadowColor: 'rgba(0,0,0,0.08)'
        },
        labelCfg: {
          style: {
            fill: '#ffffff',
            fontWeight: 600
          }
        }
      });
    });

    graph.getEdges().forEach(edge => {
      const model = edge.getModel() as NodeConfig;
      graph.updateItem(edge, {
        style: {
          stroke: (model.color as string) || '#94a3b8',
          endArrow: {
            path: G6.Arrow.triangle(8, 10, 2),
            fill: (model.color as string) || '#94a3b8'
          }
        }
      });
    });

    graph.on('node:click', (evt: IG6GraphEvent) => {
      const model = evt.item?.getModel();
      if (!model) return;
      const match = ontologyNodes.find(node => node.id === model.id) || null;
      setSelectedNode(match);
    });

    graph.on('canvas:click', () => {
      setSelectedNode(null);
    });

    graphRef.current = graph;

    const handleResize = () => {
      if (!containerRef.current) return;
      graph.changeSize(containerRef.current.clientWidth, containerRef.current.clientHeight || 520);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      graph.destroy();
      graphRef.current = null;
    };
  }, [graphData]);

  return (
    <Row gutter={16}>
      <Col span={16}>
        <Card
          title={<Title level={5} style={{ margin: 0 }}>本体设计器</Title>}
          style={{ height: '100%' }}
        >
          <div ref={containerRef} style={{ width: '100%', height: 520 }} />
        </Card>
      </Col>
      <Col span={8}>
        <Card
          title={<Title level={5} style={{ margin: 0 }}>本体属性列表</Title>}
          style={{ height: '100%' }}
        >
          {selectedNode ? (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={5} style={{ marginBottom: 4 }}>{selectedNode.name}</Title>
                <Space wrap>
                  <Tag color="blue">{selectedNode.code}</Tag>
                  <Tag color="default">实例数 {selectedNode.instanceCount}</Tag>
                </Space>
              </div>
              <List
                dataSource={selectedNode.attributes}
                renderItem={attr => (
                  <List.Item style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <Space direction="vertical" size={2}>
                      <Space wrap>
                        <Text strong>{attr.name}</Text>
                        <Tag color="geekblue">{attr.type}</Tag>
                      </Space>
                      <Text type="secondary" style={{ fontSize: 12 }}>{attr.description}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Space>
          ) : (
            <Text type="secondary">点击图谱中的本体节点以查看属性列表。</Text>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default OntologyDesigner;

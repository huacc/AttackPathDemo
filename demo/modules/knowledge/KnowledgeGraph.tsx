/**
 * P4.1 攻防知识图谱
 * 使用G6渲染100+节点的攻防知识图谱
 * 支持节点颜色编码、多层筛选、路径搜索
 */

import React, { useEffect, useRef, useState } from 'react';
import G6, { Graph, GraphData, NodeConfig, EdgeConfig } from '@antv/g6';
import {
  Card,
  Space,
  Select,
  Input,
  Button,
  Drawer,
  Descriptions,
  Tag,
  Row,
  Col,
  Statistic,
  Divider,
  message
} from 'antd';
import {
  ApartmentOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  FullscreenOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { Search } = Input;

// ==================== 类型定义 ====================

type NodeType = 'attack' | 'defense' | 'asset' | 'vulnerability';
type RelationType = 'exploits' | 'mitigates' | 'protects' | 'depends_on';

interface KnowledgeNode extends NodeConfig {
  id: string;
  label: string;
  nodeType: NodeType;
  zone?: string;
  description?: string;
  properties?: Record<string, any>;
}

interface KnowledgeEdge extends EdgeConfig {
  source: string;
  target: string;
  relationType: RelationType;
  label?: string;
}

interface KnowledgeGraphData extends GraphData {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

// ==================== 节点颜色映射 ====================

const NODE_COLORS: Record<NodeType, string> = {
  attack: '#ff4d4f',      // 红色 - 攻击
  defense: '#1890ff',     // 蓝色 - 防御
  asset: '#52c41a',       // 绿色 - 资产
  vulnerability: '#fa8c16' // 橙色 - 漏洞
};

// ==================== Mock数据生成 ====================

const generateMockGraphData = (): KnowledgeGraphData => {
  const nodes: KnowledgeNode[] = [];
  const edges: KnowledgeEdge[] = [];

  // 生成攻击技术节点 (40个)
  for (let i = 1; i <= 40; i++) {
    nodes.push({
      id: `attack-${i}`,
      label: `T${1000 + i}`,
      nodeType: 'attack',
      description: `攻击技术 ${i}`,
      properties: {
        tacticId: `TA000${Math.floor(i / 5) + 1}`,
        successRate: (Math.random() * 0.5 + 0.5).toFixed(2)
      }
    });
  }

  // 生成防御措施节点 (30个)
  for (let i = 1; i <= 30; i++) {
    nodes.push({
      id: `defense-${i}`,
      label: `M${1000 + i}`,
      nodeType: 'defense',
      description: `防御措施 ${i}`,
      properties: {
        category: ['harden', 'detect', 'isolate'][i % 3],
        effectiveness: (Math.random() * 0.3 + 0.7).toFixed(2)
      }
    });
  }

  // 生成资产节点 (20个)
  for (let i = 1; i <= 20; i++) {
    nodes.push({
      id: `asset-${i}`,
      label: `Asset-${i}`,
      nodeType: 'asset',
      zone: ['external', 'dmz', 'intranet', 'cloud'][i % 4],
      description: `网络资产 ${i}`,
      properties: {
        deviceType: ['server', 'router', 'firewall', 'endpoint'][i % 4],
        criticalityLevel: ['low', 'medium', 'high', 'critical'][i % 4]
      }
    });
  }

  // 生成漏洞节点 (15个)
  for (let i = 1; i <= 15; i++) {
    nodes.push({
      id: `vuln-${i}`,
      label: `CVE-2024-${1000 + i}`,
      nodeType: 'vulnerability',
      description: `漏洞 ${i}`,
      properties: {
        cvssScore: (Math.random() * 5 + 5).toFixed(1),
        severity: ['medium', 'high', 'critical'][i % 3]
      }
    });
  }

  // 生成边关系 (150+条)
  // 攻击技术 -> 漏洞
  for (let i = 1; i <= 40; i++) {
    const vulnId = Math.floor(Math.random() * 15) + 1;
    edges.push({
      source: `attack-${i}`,
      target: `vuln-${vulnId}`,
      relationType: 'exploits',
      label: 'exploits'
    });
  }

  // 漏洞 -> 资产
  for (let i = 1; i <= 15; i++) {
    const assetId = Math.floor(Math.random() * 20) + 1;
    edges.push({
      source: `vuln-${i}`,
      target: `asset-${assetId}`,
      relationType: 'depends_on',
      label: 'affects'
    });
  }

  // 防御措施 -> 攻击技术
  for (let i = 1; i <= 30; i++) {
    const attackId = Math.floor(Math.random() * 40) + 1;
    edges.push({
      source: `defense-${i}`,
      target: `attack-${i}`,
      relationType: 'mitigates',
      label: 'mitigates'
    });
  }

  // 防御措施 -> 资产
  for (let i = 1; i <= 30; i++) {
    const assetId = Math.floor(Math.random() * 20) + 1;
    edges.push({
      source: `defense-${i}`,
      target: `asset-${assetId}`,
      relationType: 'protects',
      label: 'protects'
    });
  }

  return { nodes, edges };
};

// ==================== 主组件 ====================

export interface KnowledgeGraphProps {
  data?: KnowledgeGraphData;
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ data: propData }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const [graphData, setGraphData] = useState<KnowledgeGraphData>(
    propData || generateMockGraphData()
  );
  const [filteredData, setFilteredData] = useState<KnowledgeGraphData>(graphData);
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [filterNodeType, setFilterNodeType] = useState<NodeType | 'all'>('all');
  const [filterZone, setFilterZone] = useState<string | 'all'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  // 初始化G6图谱
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.scrollWidth;
    const height = containerRef.current.scrollHeight || 600;

    const graph = new G6.Graph({
      container: containerRef.current,
      width,
      height,
      modes: {
        default: ['drag-canvas', 'zoom-canvas', 'drag-node', 'click-select']
      },
      layout: {
        type: 'force',
        preventOverlap: true,
        nodeSpacing: 50,
        linkDistance: 150,
        nodeStrength: -300,
        edgeStrength: 0.2,
        collideStrength: 0.8
      },
      defaultNode: {
        size: 40,
        style: {
          lineWidth: 2,
          stroke: '#fff'
        },
        labelCfg: {
          position: 'bottom',
          offset: 5,
          style: {
            fontSize: 12,
            fill: '#000'
          }
        }
      },
      defaultEdge: {
        type: 'line',
        style: {
          stroke: '#e2e2e2',
          lineWidth: 1,
          endArrow: {
            path: G6.Arrow.triangle(8, 10, 0),
            fill: '#e2e2e2'
          }
        },
        labelCfg: {
          autoRotate: true,
          style: {
            fontSize: 10,
            fill: '#666'
          }
        }
      }
    });

    // 节点点击事件
    graph.on('node:click', (evt) => {
      const node = evt.item?.getModel() as KnowledgeNode;
      if (node) {
        setSelectedNode(node);
        setDrawerVisible(true);
      }
    });

    graphRef.current = graph;

    // 窗口大小变化
    const handleResize = () => {
      if (containerRef.current && graphRef.current) {
        const width = containerRef.current.scrollWidth;
        const height = containerRef.current.scrollHeight || 600;
        graphRef.current.changeSize(width, height);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      graph.destroy();
    };
  }, []);

  // 更新图谱数据
  useEffect(() => {
    if (!graphRef.current) return;

    const processedData = {
      nodes: filteredData.nodes.map(node => ({
        ...node,
        style: {
          fill: NODE_COLORS[node.nodeType],
          stroke: '#fff',
          lineWidth: 2
        }
      })),
      edges: filteredData.edges
    };

    graphRef.current.data(processedData);
    graphRef.current.render();
  }, [filteredData]);

  // 筛选逻辑
  useEffect(() => {
    let filtered = { ...graphData };

    // 按节点类型筛选
    if (filterNodeType !== 'all') {
      filtered.nodes = filtered.nodes.filter(n => n.nodeType === filterNodeType);
      const nodeIds = new Set(filtered.nodes.map(n => n.id));
      filtered.edges = filtered.edges.filter(
        e => nodeIds.has(e.source as string) && nodeIds.has(e.target as string)
      );
    }

    // 按安全域筛选
    if (filterZone !== 'all') {
      filtered.nodes = filtered.nodes.filter(n => n.zone === filterZone || !n.zone);
      const nodeIds = new Set(filtered.nodes.map(n => n.id));
      filtered.edges = filtered.edges.filter(
        e => nodeIds.has(e.source as string) && nodeIds.has(e.target as string)
      );
    }

    // 按关键词搜索
    if (searchKeyword) {
      filtered.nodes = filtered.nodes.filter(n =>
        n.label?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        n.description?.toLowerCase().includes(searchKeyword.toLowerCase())
      );
      const nodeIds = new Set(filtered.nodes.map(n => n.id));
      filtered.edges = filtered.edges.filter(
        e => nodeIds.has(e.source as string) && nodeIds.has(e.target as string)
      );
    }

    setFilteredData(filtered);
  }, [filterNodeType, filterZone, searchKeyword, graphData]);

  // 路径搜索
  const handlePathSearch = (startId: string, endId: string) => {
    if (!graphRef.current) return;

    // 简单的BFS路径搜索
    const graph = graphRef.current;
    const visited = new Set<string>();
    const queue: Array<{ id: string; path: string[] }> = [{ id: startId, path: [startId] }];

    while (queue.length > 0) {
      const { id, path } = queue.shift()!;
      if (id === endId) {
        // 高亮路径
        path.forEach(nodeId => {
          const node = graph.findById(nodeId);
          if (node) {
            graph.setItemState(node, 'highlight', true);
          }
        });
        message.success(`找到路径: ${path.join(' -> ')}`);
        return;
      }

      if (visited.has(id)) continue;
      visited.add(id);

      const edges = graphData.edges.filter(e => e.source === id);
      edges.forEach(edge => {
        if (!visited.has(edge.target as string)) {
          queue.push({
            id: edge.target as string,
            path: [...path, edge.target as string]
          });
        }
      });
    }

    message.warning('未找到路径');
  };

  // 重置视图
  const handleReset = () => {
    setFilterNodeType('all');
    setFilterZone('all');
    setSearchKeyword('');
    if (graphRef.current) {
      graphRef.current.fitView();
    }
  };

  // 缩放控制
  const handleZoomIn = () => {
    graphRef.current?.zoom(1.2);
  };

  const handleZoomOut = () => {
    graphRef.current?.zoom(0.8);
  };

  const handleFitView = () => {
    graphRef.current?.fitView();
  };

  // 统计信息
  const stats = {
    totalNodes: filteredData.nodes.length,
    totalEdges: filteredData.edges.length,
    attackNodes: filteredData.nodes.filter(n => n.nodeType === 'attack').length,
    defenseNodes: filteredData.nodes.filter(n => n.nodeType === 'defense').length,
    assetNodes: filteredData.nodes.filter(n => n.nodeType === 'asset').length,
    vulnNodes: filteredData.nodes.filter(n => n.nodeType === 'vulnerability').length
  };

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <Space>
            <ApartmentOutlined />
            <span>攻防知识图谱</span>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} />
            <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
            <Button icon={<FullscreenOutlined />} onClick={handleFitView} />
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Space>
        }
      >
        {/* 筛选面板 */}
        <Space style={{ marginBottom: 16, width: '100%' }} wrap>
          <Select
            style={{ width: 150 }}
            value={filterNodeType}
            onChange={setFilterNodeType}
            placeholder="节点类型"
          >
            <Option value="all">全部类型</Option>
            <Option value="attack">
              <Tag color="red">攻击</Tag>
            </Option>
            <Option value="defense">
              <Tag color="blue">防御</Tag>
            </Option>
            <Option value="asset">
              <Tag color="green">资产</Tag>
            </Option>
            <Option value="vulnerability">
              <Tag color="orange">漏洞</Tag>
            </Option>
          </Select>

          <Select
            style={{ width: 150 }}
            value={filterZone}
            onChange={setFilterZone}
            placeholder="安全域"
          >
            <Option value="all">全部安全域</Option>
            <Option value="external">外网</Option>
            <Option value="dmz">DMZ</Option>
            <Option value="intranet">内网</Option>
            <Option value="cloud">云</Option>
          </Select>

          <Search
            placeholder="搜索节点"
            style={{ width: 250 }}
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            onSearch={setSearchKeyword}
          />
        </Space>

        {/* 统计信息 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={4}>
            <Statistic title="总节点数" value={stats.totalNodes} />
          </Col>
          <Col span={4}>
            <Statistic title="总边数" value={stats.totalEdges} />
          </Col>
          <Col span={4}>
            <Statistic
              title="攻击节点"
              value={stats.attackNodes}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title="防御节点"
              value={stats.defenseNodes}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title="资产节点"
              value={stats.assetNodes}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title="漏洞节点"
              value={stats.vulnNodes}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Col>
        </Row>

        {/* 图谱容器 */}
        <div
          ref={containerRef}
          style={{
            width: '100%',
            height: 600,
            border: '1px solid #e8e8e8',
            borderRadius: 4,
            background: '#fafafa'
          }}
        />
      </Card>

      {/* 节点详情抽屉 */}
      <Drawer
        title="节点详情"
        placement="right"
        width={400}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedNode && (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="节点ID">{selectedNode.id}</Descriptions.Item>
              <Descriptions.Item label="标签">{selectedNode.label}</Descriptions.Item>
              <Descriptions.Item label="类型">
                <Tag color={NODE_COLORS[selectedNode.nodeType]}>
                  {selectedNode.nodeType}
                </Tag>
              </Descriptions.Item>
              {selectedNode.zone && (
                <Descriptions.Item label="安全域">{selectedNode.zone}</Descriptions.Item>
              )}
              {selectedNode.description && (
                <Descriptions.Item label="描述">{selectedNode.description}</Descriptions.Item>
              )}
            </Descriptions>

            {selectedNode.properties && (
              <>
                <Divider>属性信息</Divider>
                <Descriptions column={1} bordered size="small">
                  {Object.entries(selectedNode.properties).map(([key, value]) => (
                    <Descriptions.Item key={key} label={key}>
                      {String(value)}
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              </>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
};

export default KnowledgeGraph;

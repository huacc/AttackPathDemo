/**
 * P8.2 资产关系图谱
 * 展示资产之间的连接关系、依赖关系、漏洞关联
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Card, Select, Space, Tag, Drawer, Descriptions, Button, Row, Col, Statistic } from 'antd';
import { NodeIndexOutlined, FilterOutlined, ApartmentOutlined, LinkOutlined } from '@ant-design/icons';
import G6, { Graph, GraphData } from '@antv/g6';
import { NETWORK_NODES } from '../../mock/static/networkNodes';
import { SCENES } from '../../mock/dynamic/scenes';
import { VULNERABILITIES } from '../../mock/static/vulnerabilities';
import type { NetworkNode } from '../../types/ontology';

const { Option } = Select;

interface AssetNode {
  id: string;
  label: string;
  zone: string;
  nodeType: string;
  criticalityLevel: string;
  data: NetworkNode;
}

/**
 * 资产关系图谱组件
 */
const AssetRelation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const [selectedNode, setSelectedNode] = useState<AssetNode | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [criticalityFilter, setCriticalityFilter] = useState<string>('all');

  // 获取当前场景的连接数据
  const currentScene = SCENES[0];

  // 构建资产关系图数据
  const buildGraphData = (): GraphData => {
    const nodes: any[] = [];
    const edges: any[] = [];
    const nodeMap = new Map<string, NetworkNode>();

    // 过滤节点
    const filteredNodes = NETWORK_NODES.filter(node => {
      const matchZone = zoneFilter === 'all' || node.zone === zoneFilter;
      const matchCriticality = criticalityFilter === 'all' || node.criticalityLevel === criticalityFilter;
      return matchZone && matchCriticality;
    });

    // 添加节点
    filteredNodes.forEach(node => {
      nodeMap.set(node.nodeId, node);

      // 获取节点颜色（按安全域）
      const zoneColors: Record<string, string> = {
        external: '#f5222d',
        dmz: '#fa8c16',
        intranet: '#52c41a',
        cloud: '#1890ff'
      };

      // 获取节点大小（按重要性）
      const sizeMap: Record<string, number> = {
        critical: 60,
        high: 50,
        medium: 40,
        low: 30
      };

      nodes.push({
        id: node.nodeId,
        label: node.name,
        zone: node.zone,
        nodeType: node.nodeType,
        criticalityLevel: node.criticalityLevel,
        data: node,
        size: sizeMap[node.criticalityLevel] || 40,
        style: {
          fill: zoneColors[node.zone] || '#8c8c8c',
          stroke: '#fff',
          lineWidth: 2
        },
        labelCfg: {
          style: {
            fontSize: 12,
            fill: '#000'
          }
        }
      });
    });

    // 添加连接边
    currentScene.connections.forEach(conn => {
      if (nodeMap.has(conn.sourceNodeId) && nodeMap.has(conn.targetNodeId)) {
        edges.push({
          source: conn.sourceNodeId,
          target: conn.targetNodeId,
          label: conn.protocol,
          style: {
            stroke: '#8c8c8c',
            lineWidth: 2,
            endArrow: {
              path: G6.Arrow.triangle(8, 10, 0),
              fill: '#8c8c8c'
            }
          },
          labelCfg: {
            autoRotate: true,
            style: {
              fontSize: 10,
              fill: '#666',
              background: {
                fill: '#fff',
                padding: [2, 4, 2, 4],
                radius: 2
              }
            }
          }
        });
      }
    });

    return { nodes, edges };
  };

  // 统计数据
  const statistics = useMemo(() => {
    const graphData = buildGraphData();
    const nodesByZone: Record<string, number> = {
      external: 0,
      dmz: 0,
      intranet: 0,
      cloud: 0
    };
    const nodesByCriticality: Record<string, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    graphData.nodes.forEach((node: any) => {
      if (node.zone) nodesByZone[node.zone]++;
      if (node.criticalityLevel) nodesByCriticality[node.criticalityLevel]++;
    });

    return {
      totalNodes: graphData.nodes.length,
      totalEdges: graphData.edges.length,
      nodesByZone,
      nodesByCriticality
    };
  }, [zoneFilter, criticalityFilter]);

  // 初始化图谱
  useEffect(() => {
    if (!containerRef.current) return;

    // 清理旧图谱
    if (graphRef.current) {
      graphRef.current.destroy();
    }

    const width = containerRef.current.offsetWidth;
    const height = containerRef.current.offsetHeight;

    const graph = new G6.Graph({
      container: containerRef.current,
      width,
      height,
      modes: {
        default: ['drag-canvas', 'zoom-canvas', 'drag-node']
      },
      layout: {
        type: 'force',
        preventOverlap: true,
        nodeSpacing: 100,
        linkDistance: 150,
        nodeStrength: -300,
        edgeStrength: 0.5,
        collideStrength: 0.8
      },
      defaultNode: {
        type: 'circle',
        size: 40,
        style: {
          lineWidth: 2,
          stroke: '#fff'
        },
        labelCfg: {
          position: 'bottom',
          offset: 10,
          style: {
            fontSize: 12
          }
        }
      },
      defaultEdge: {
        type: 'line',
        style: {
          stroke: '#8c8c8c',
          lineWidth: 2
        }
      }
    });

    // 加载数据
    const data = buildGraphData();
    graph.data(data);
    graph.render();

    // 节点点击事件
    graph.on('node:click', (evt) => {
      const node = evt.item?.getModel() as any;
      if (node) {
        setSelectedNode({
          id: node.id,
          label: node.label,
          zone: node.zone,
          nodeType: node.nodeType,
          criticalityLevel: node.criticalityLevel,
          data: node.data
        });
        setDrawerVisible(true);
      }
    });

    // 节点悬停效果
    graph.on('node:mouseenter', (evt) => {
      const node = evt.item;
      graph.setItemState(node!, 'hover', true);
    });

    graph.on('node:mouseleave', (evt) => {
      const node = evt.item;
      graph.setItemState(node!, 'hover', false);
    });

    graphRef.current = graph;

    // 窗口大小变化时重新渲染
    const handleResize = () => {
      if (containerRef.current && graphRef.current) {
        const newWidth = containerRef.current.offsetWidth;
        const newHeight = containerRef.current.offsetHeight;
        graphRef.current.changeSize(newWidth, newHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (graphRef.current) {
        graphRef.current.destroy();
      }
    };
  }, [zoneFilter, criticalityFilter]);

  // 获取节点的漏洞数量
  const getNodeVulnerabilities = (nodeId: string) => {
    return VULNERABILITIES.filter(v => v.affectedNodeId === nodeId);
  };

  // 获取节点的连接数量
  const getNodeConnections = (nodeId: string) => {
    return currentScene.connections.filter(
      c => c.sourceNodeId === nodeId || c.targetNodeId === nodeId
    );
  };

  // 渲染安全域标签
  const renderZoneTag = (zone: string) => {
    const config: Record<string, { color: string; text: string }> = {
      external: { color: 'red', text: '外网' },
      dmz: { color: 'orange', text: 'DMZ' },
      intranet: { color: 'green', text: '内网' },
      cloud: { color: 'blue', text: '云端' }
    };
    const { color, text } = config[zone] || { color: 'default', text: zone };
    return <Tag color={color}>{text}</Tag>;
  };

  // 渲染重要性标签
  const renderCriticalityTag = (level: string) => {
    const config: Record<string, { color: string; text: string }> = {
      critical: { color: 'red', text: '关键' },
      high: { color: 'orange', text: '高' },
      medium: { color: 'gold', text: '中' },
      low: { color: 'blue', text: '低' }
    };
    const { color, text } = config[level] || { color: 'default', text: level };
    return <Tag color={color}>{text}</Tag>;
  };

  return (
    <div style={{ padding: '24px', height: '100vh' }}>
      <Card
        title={
          <Space>
            <ApartmentOutlined />
            <span>资产关系图谱</span>
          </Space>
        }
        extra={
          <Space>
            <Select
              style={{ width: 150 }}
              value={zoneFilter}
              onChange={setZoneFilter}
              placeholder="安全域"
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">全部安全域</Option>
              <Option value="external">外网</Option>
              <Option value="dmz">DMZ</Option>
              <Option value="intranet">内网</Option>
              <Option value="cloud">云端</Option>
            </Select>
            <Select
              style={{ width: 150 }}
              value={criticalityFilter}
              onChange={setCriticalityFilter}
              placeholder="重要性"
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">全部重要性</Option>
              <Option value="critical">关键</Option>
              <Option value="high">高</Option>
              <Option value="medium">中</Option>
              <Option value="low">低</Option>
            </Select>
          </Space>
        }
        style={{ height: '100%' }}
      >
        {/* 统计信息 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="资产节点"
                value={statistics.totalNodes}
                prefix={<NodeIndexOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="连接关系"
                value={statistics.totalEdges}
                prefix={<LinkOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="关键资产"
                value={statistics.nodesByCriticality.critical}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="内网资产"
                value={statistics.nodesByZone.intranet}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 图例 */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Space size="large">
            <Space>
              <span style={{ fontWeight: 500 }}>安全域:</span>
              <Tag color="red">外网</Tag>
              <Tag color="orange">DMZ</Tag>
              <Tag color="green">内网</Tag>
              <Tag color="blue">云端</Tag>
            </Space>
            <Space>
              <span style={{ fontWeight: 500 }}>重要性:</span>
              <Tag color="red">关键</Tag>
              <Tag color="orange">高</Tag>
              <Tag color="gold">中</Tag>
              <Tag color="blue">低</Tag>
            </Space>
          </Space>
        </Card>

        {/* 图谱容器 */}
        <div
          ref={containerRef}
          style={{
            width: '100%',
            height: 'calc(100% - 240px)',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            background: '#fafafa'
          }}
        />
      </Card>

      {/* 节点详情抽屉 */}
      <Drawer
        title={
          <Space>
            <NodeIndexOutlined />
            <span>资产详情</span>
          </Space>
        }
        width={720}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedNode && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card title="基本信息" size="small">
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="资产名称" span={2}>
                  {selectedNode.data.name}
                </Descriptions.Item>
                <Descriptions.Item label="资产ID">
                  {selectedNode.data.nodeId}
                </Descriptions.Item>
                <Descriptions.Item label="设备类型">
                  {selectedNode.data.nodeType}
                </Descriptions.Item>
                <Descriptions.Item label="安全域">
                  {renderZoneTag(selectedNode.data.zone)}
                </Descriptions.Item>
                <Descriptions.Item label="重要性">
                  {renderCriticalityTag(selectedNode.data.criticalityLevel)}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="网络信息" size="small">
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="IPv4地址">
                  {selectedNode.data.ipv4Address || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="主机名">
                  {selectedNode.data.hostname || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="VLAN ID">
                  {selectedNode.data.vlanId || '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="安全态势" size="small">
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="数据敏感级别">
                  {selectedNode.data.dataClassification ? (
                    <Tag color="purple">{selectedNode.data.dataClassification}</Tag>
                  ) : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="漏洞数量">
                  <Space>
                    <span>{getNodeVulnerabilities(selectedNode.data.nodeId).length} 个</span>
                    {getNodeVulnerabilities(selectedNode.data.nodeId).length > 0 && (
                      <Tag color="red">存在风险</Tag>
                    )}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="连接数量">
                  {getNodeConnections(selectedNode.data.nodeId).length} 个
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {getNodeVulnerabilities(selectedNode.data.nodeId).length > 0 && (
              <Card title="关联漏洞" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  {getNodeVulnerabilities(selectedNode.data.nodeId).map(vuln => (
                    <Card key={vuln.vulnId} size="small" style={{ background: '#fff1f0' }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                          <Tag color="red">{vuln.severity}</Tag>
                          <span style={{ fontWeight: 500 }}>{vuln.cveId}</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#666' }}>{vuln.title}</div>
                        <div>
                          <span style={{ fontSize: 12 }}>CVSS分数: </span>
                          <Tag color="orange">{vuln.cvssScore}</Tag>
                        </div>
                      </Space>
                    </Card>
                  ))}
                </Space>
              </Card>
            )}

            <Card title="连接关系" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                {getNodeConnections(selectedNode.data.nodeId).map(conn => {
                  const isSource = conn.sourceNodeId === selectedNode.data.nodeId;
                  const otherNodeId = isSource ? conn.targetNodeId : conn.sourceNodeId;
                  const otherNode = NETWORK_NODES.find(n => n.nodeId === otherNodeId);

                  return (
                    <Card key={conn.connectionId} size="small" style={{ background: '#f0f5ff' }}>
                      <Space>
                        <Tag color="blue">{conn.protocol}</Tag>
                        <span>{isSource ? '→' : '←'}</span>
                        <span>{otherNode?.name || otherNodeId}</span>
                      </Space>
                    </Card>
                  );
                })}
              </Space>
            </Card>
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default AssetRelation;

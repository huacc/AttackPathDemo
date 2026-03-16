/**
 * P6.3 防御策略仿真模块（增强版）
 * 防御场景选择、沙盘可视化部署、拖拽交互、仿真执行、攻防对抗动画
 */

import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Select, Button, Space, Tag, Descriptions, message, Table, Modal, Form, InputNumber, Tabs, Timeline, Progress, Alert } from 'antd';
import {
  SafetyOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  FireOutlined
} from '@ant-design/icons';
import G6, { Graph, GraphData } from '@antv/g6';
import { DEFENSE_SCENARIOS, DefenseScenario, DefenseDeployment } from '../../mock/dynamic/defenseScenarios';
import { ATTACK_PATHS, AttackPath } from '../../mock/dynamic/attackPaths';
import { networkNodes } from '../../mock/static/networkNodes';
import { defenseMeasures } from '../../mock/static/defenseMeasures';
import DefenseEffectiveness from './components/DefenseEffectiveness';
import DefenseComparison from './components/DefenseComparison';

const { Option } = Select;
const { TabPane } = Tabs;

interface CustomDeployment extends DefenseDeployment {
  x?: number;
  y?: number;
}

// 仿真事件
interface SimulationEvent {
  timestamp: number;
  phaseIndex: number;
  phaseName: string;
  targetNode: string;
  defenseAction: 'blocked' | 'detected' | 'bypassed' | 'none';
  defenseDevice?: string;
  description: string;
}

const DefenseStrategy: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<DefenseScenario | null>(null);
  const [selectedAttackPath, setSelectedAttackPath] = useState<AttackPath | null>(null);
  const [customDeployments, setCustomDeployments] = useState<CustomDeployment[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [simulationEvents, setSimulationEvents] = useState<SimulationEvent[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingDeployment, setEditingDeployment] = useState<CustomDeployment | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleScenarioChange = (scenarioId: string) => {
    const scenario = DEFENSE_SCENARIOS.find(s => s.scenarioId === scenarioId);
    setSelectedScenario(scenario || null);
    setCustomDeployments(scenario?.deployments || []);
    setSimulationResult(null);

    // 重新渲染图谱
    if (scenario) {
      setTimeout(() => renderGraph(scenario.deployments), 100);
    }
  };

  const handleStartSimulation = async () => {
    if (!selectedScenario) {
      message.warning('请先选择防御场景');
      return;
    }
    if (!selectedAttackPath) {
      message.warning('请先选择攻击路径');
      return;
    }

    setIsSimulating(true);
    setSimulationEvents([]);
    setCurrentEventIndex(0);
    message.loading('正在执行防御仿真...', 0);

    // 生成仿真事件
    const events: SimulationEvent[] = [];
    let timestamp = 0;

    selectedAttackPath.attackPhases.forEach((phase, index) => {
      // 检查该节点是否有防御设备
      const defenseOnNode = customDeployments.find(d =>
        d.deployedNodeIds.includes(phase.targetNodeId)
      );

      let defenseAction: 'blocked' | 'detected' | 'bypassed' | 'none' = 'none';
      let description = '';

      if (defenseOnNode) {
        // 根据有效性评分决定防御效果
        const random = Math.random();
        if (random < defenseOnNode.effectivenessScore * 0.6) {
          defenseAction = 'blocked';
          description = `${defenseOnNode.measureName}成功阻断攻击`;
        } else if (random < defenseOnNode.effectivenessScore) {
          defenseAction = 'detected';
          description = `${defenseOnNode.measureName}检测到攻击但未阻断`;
        } else {
          defenseAction = 'bypassed';
          description = `攻击绕过了${defenseOnNode.measureName}`;
        }
      } else {
        defenseAction = 'none';
        description = '该节点无防御措施，攻击成功';
      }

      events.push({
        timestamp,
        phaseIndex: index,
        phaseName: phase.techniqueName,
        targetNode: phase.targetNodeName,
        defenseAction,
        defenseDevice: defenseOnNode?.measureName,
        description
      });

      timestamp += phase.estimatedDuration;
    });

    setSimulationEvents(events);

    // 模拟1-3秒延迟
    const delay = Math.random() * 2000 + 1000;

    setTimeout(() => {
      message.destroy();
      setSimulationResult(selectedScenario.simulationResult);
      message.success('防御仿真完成！');

      // 开始播放动画
      playSimulationAnimation(events);
    }, delay);
  };

  // 播放仿真动画
  const playSimulationAnimation = (events: SimulationEvent[]) => {
    let index = 0;
    const interval = setInterval(() => {
      if (index >= events.length) {
        clearInterval(interval);
        setIsSimulating(false);
        return;
      }
      setCurrentEventIndex(index);
      index++;
    }, 800); // 每个事件间隔800ms
  };

  // 渲染防御沙盘图谱
  const renderGraph = (deployments: DefenseDeployment[]) => {
    if (!containerRef.current) return;

    // 销毁旧图谱
    if (graphRef.current) {
      graphRef.current.destroy();
    }

    const width = containerRef.current.scrollWidth;
    const height = 600;

    // 构建图谱数据
    const nodes: any[] = [];
    const edges: any[] = [];
    const nodeMap = new Map<string, boolean>();

    // 添加网络节点
    networkNodes.forEach((node, index) => {
      nodes.push({
        id: node.nodeId,
        label: node.name,
        type: 'network-node',
        data: node,
        style: {
          fill: '#e6f7ff',
          stroke: '#1890ff',
          lineWidth: 2
        }
      });
      nodeMap.set(node.nodeId, true);
    });

    // 添加防御设备节点
    deployments.forEach((deployment, index) => {
      deployment.deployedNodeIds.forEach((nodeId, idx) => {
        const defenseNodeId = `defense-${deployment.measureId}-${nodeId}`;
        nodes.push({
          id: defenseNodeId,
          label: `🛡️ ${deployment.measureName}`,
          type: 'defense-node',
          data: deployment,
          style: {
            fill: '#52c41a',
            stroke: '#389e0d',
            lineWidth: 3
          },
          icon: {
            show: true,
            text: '🛡️',
            fontSize: 20
          }
        });

        // 连接防御设备到网络节点
        if (nodeMap.has(nodeId)) {
          edges.push({
            source: defenseNodeId,
            target: nodeId,
            label: '部署于',
            style: {
              stroke: '#52c41a',
              lineWidth: 2,
              lineDash: [5, 5]
            }
          });
        }
      });
    });

    const graphData: GraphData = { nodes, edges };

    // 创建G6图谱
    const graph = new Graph({
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
        linkDistance: 150
      },
      defaultNode: {
        size: 60,
        labelCfg: {
          style: {
            fontSize: 12,
            fill: '#000'
          }
        }
      },
      defaultEdge: {
        style: {
          stroke: '#b0b0b0',
          lineWidth: 1
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

    graph.data(graphData);
    graph.render();

    // 节点点击事件
    graph.on('node:click', (evt) => {
      const node = evt.item;
      const model = node?.getModel();
      if (model?.type === 'defense-node') {
        message.info(`防御设备: ${model.label}`);
      }
    });

    // 节点拖拽结束事件
    graph.on('node:dragend', (evt) => {
      const node = evt.item;
      const model = node?.getModel();
      if (model?.type === 'defense-node') {
        message.success('防御设备位置已更新');
      }
    });

    graphRef.current = graph;
  };

  // 初始化图谱
  useEffect(() => {
    if (selectedScenario && containerRef.current) {
      renderGraph(customDeployments);
    }

    return () => {
      if (graphRef.current) {
        graphRef.current.destroy();
      }
    };
  }, [selectedScenario, customDeployments]);

  // 添加防御措施
  const handleAddDefense = () => {
    setAddModalVisible(true);
    form.resetFields();
  };

  const handleAddConfirm = () => {
    form.validateFields().then(values => {
      const newDeployment: CustomDeployment = {
        measureId: values.measureId,
        measureName: defenseMeasures.find(m => m.measureId === values.measureId)?.measureName || '',
        deployedNodeIds: values.deployedNodeIds,
        deployedNodeNames: values.deployedNodeIds.map((id: string) =>
          networkNodes.find(n => n.nodeId === id)?.name || ''
        ),
        effectivenessScore: values.effectivenessScore / 100
      };

      setCustomDeployments([...customDeployments, newDeployment]);
      setAddModalVisible(false);
      message.success('防御措施添加成功');
      renderGraph([...customDeployments, newDeployment]);
    });
  };

  // 编辑防御措施
  const handleEdit = (deployment: CustomDeployment) => {
    setEditingDeployment(deployment);
    setEditModalVisible(true);
    form.setFieldsValue({
      effectivenessScore: deployment.effectivenessScore * 100
    });
  };

  const handleEditConfirm = () => {
    form.validateFields().then(values => {
      const updatedDeployments = customDeployments.map(d =>
        d.measureId === editingDeployment?.measureId
          ? { ...d, effectivenessScore: values.effectivenessScore / 100 }
          : d
      );
      setCustomDeployments(updatedDeployments);
      setEditModalVisible(false);
      message.success('防御措施已更新');
      renderGraph(updatedDeployments);
    });
  };

  // 移除防御措施
  const handleRemove = (measureId: string) => {
    Modal.confirm({
      title: '确认移除',
      content: '确定要移除这个防御措施吗？',
      onOk: () => {
        const updatedDeployments = customDeployments.filter(d => d.measureId !== measureId);
        setCustomDeployments(updatedDeployments);
        message.success('防御措施已移除');
        renderGraph(updatedDeployments);
      }
    });
  };

  const getScenarioTypeLabel = (type: string): string => {
    const labelMap: Record<string, string> = {
      'protection_depth': '防护手段纵深',
      'application_depth': '应用层级纵深',
      'network_depth': '网络纵深',
      'killchain_depth': '攻击阶段纵深'
    };
    return labelMap[type] || type;
  };

  const deploymentColumns = [
    {
      title: '防御措施',
      dataIndex: 'measureName',
      key: 'measureName',
      render: (text: string) => (
        <Space>
          <SafetyOutlined style={{ color: '#52c41a' }} />
          <Tag color="blue">{text}</Tag>
        </Space>
      )
    },
    {
      title: '部署节点',
      dataIndex: 'deployedNodeNames',
      key: 'deployedNodeNames',
      render: (names: string[]) => (
        <Space wrap>
          {names.map((name, index) => (
            <Tag key={index} color="green" style={{ fontSize: 11 }}>
              {name}
            </Tag>
          ))}
        </Space>
      )
    },
    {
      title: '有效性评分',
      dataIndex: 'effectivenessScore',
      key: 'effectivenessScore',
      render: (score: number) => `${(score * 100).toFixed(0)}%`
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: CustomDeployment) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleRemove(record.measureId)}
          >
            移除
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Row gutter={[16, 16]}>
        {/* 场景选择面板 */}
        <Col span={24}>
          <Card
            title={
              <Space>
                <SafetyOutlined />
                <span>防御策略配置</span>
              </Space>
            }
            extra={
              <Space>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={handleStartSimulation}
                  loading={isSimulating}
                  disabled={!selectedScenario}
                >
                  开始仿真
                </Button>
                <Button icon={<PlusOutlined />} onClick={handleAddDefense} disabled={!selectedScenario}>
                  添加防御措施
                </Button>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Space size="large" style={{ width: '100%' }}>
                <div>
                  <span style={{ marginRight: 8 }}>选择防御场景：</span>
                  <Select
                    style={{ width: 350 }}
                    placeholder="请选择预置防御场景（4种）或自定义"
                    onChange={handleScenarioChange}
                    value={selectedScenario?.scenarioId}
                  >
                    {DEFENSE_SCENARIOS.map(scenario => (
                      <Option key={scenario.scenarioId} value={scenario.scenarioId}>
                        {scenario.scenarioName} - {getScenarioTypeLabel(scenario.scenarioType)}
                      </Option>
                    ))}
                    <Option value="custom">自定义场景</Option>
                  </Select>
                </div>

                <div>
                  <span style={{ marginRight: 8 }}>选择攻击路径：</span>
                  <Select
                    style={{ width: 350 }}
                    placeholder="请选择攻击路径进行仿真"
                    onChange={(pathId) => {
                      const path = ATTACK_PATHS.find(p => p.pathId === pathId);
                      setSelectedAttackPath(path || null);
                    }}
                    value={selectedAttackPath?.pathId}
                  >
                    {ATTACK_PATHS.map(path => (
                      <Option key={path.pathId} value={path.pathId}>
                        {path.pathName} (成功率: {(path.totalSuccessRate * 100).toFixed(1)}%)
                      </Option>
                    ))}
                  </Select>
                </div>
              </Space>

              {selectedScenario && (
                <Descriptions column={3} bordered size="small">
                  <Descriptions.Item label="场景类型" span={3}>
                    <Tag color="blue">{getScenarioTypeLabel(selectedScenario.scenarioType)}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="场景描述" span={3}>
                    {selectedScenario.description}
                  </Descriptions.Item>
                  <Descriptions.Item label="防御措施数量">
                    {customDeployments.length} 个
                  </Descriptions.Item>
                  <Descriptions.Item label="预估成本">
                    {selectedScenario.totalCost} 万元
                  </Descriptions.Item>
                  <Descriptions.Item label="部署时间">
                    {selectedScenario.deploymentTime} 小时
                  </Descriptions.Item>
                  <Descriptions.Item label="维护负担">
                    <Tag color={
                      selectedScenario.maintenanceBurden === 'high' ? 'red' :
                        selectedScenario.maintenanceBurden === 'medium' ? 'orange' : 'green'
                    }>
                      {selectedScenario.maintenanceBurden === 'high' ? '高' :
                        selectedScenario.maintenanceBurden === 'medium' ? '中' : '低'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="预期成功率降低">
                    <span style={{ color: '#52c41a', fontWeight: 500 }}>
                      {selectedScenario.expectedEffect.attackSuccessRateReduction}%
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="预期检测率提升">
                    <span style={{ color: '#1890ff', fontWeight: 500 }}>
                      {selectedScenario.expectedEffect.detectionRateIncrease}%
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="预期响应时间缩短">
                    <span style={{ color: '#fa8c16', fontWeight: 500 }}>
                      {selectedScenario.expectedEffect.responseTimeReduction}%
                    </span>
                  </Descriptions.Item>
                </Descriptions>
              )}
            </Space>
          </Card>
        </Col>

        {/* 防御沙盘可视化 */}
        {selectedScenario && (
          <Col span={24}>
            <Card
              title={
                <Space>
                  <SafetyOutlined style={{ color: '#52c41a' }} />
                  <span>防御沙盘（可拖拽调整）</span>
                </Space>
              }
            >
              <div
                ref={containerRef}
                style={{
                  width: '100%',
                  height: 600,
                  border: '1px solid #d9d9d9',
                  borderRadius: 4,
                  background: '#fafafa'
                }}
              />
              <div style={{ marginTop: 16, color: '#666', fontSize: 12 }}>
                <Space split="|">
                  <span>🛡️ 绿色盾牌：防御设备</span>
                  <span>🔵 蓝色节点：网络节点</span>
                  <span>提示：可拖拽节点调整位置</span>
                </Space>
              </div>
            </Card>
          </Col>
        )}

        {/* 防御部署列表 */}
        {selectedScenario && (
          <Col span={24}>
            <Card title="防御措施部署列表">
              <Table
                dataSource={customDeployments}
                columns={deploymentColumns}
                rowKey="measureId"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        )}

        {/* 仿真动画 */}
        {simulationEvents.length > 0 && (
          <Col span={24}>
            <Card
              title={
                <Space>
                  <FireOutlined style={{ color: '#ff4d4f' }} />
                  <span>攻防对抗仿真动画</span>
                </Space>
              }
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Alert
                  message={`正在仿真攻击路径: ${selectedAttackPath?.pathName}`}
                  description={`共 ${simulationEvents.length} 个攻击步骤，当前进度: ${currentEventIndex + 1}/${simulationEvents.length}`}
                  type="info"
                  showIcon
                />

                <Progress
                  percent={Math.round(((currentEventIndex + 1) / simulationEvents.length) * 100)}
                  status={isSimulating ? 'active' : 'success'}
                  strokeColor={{
                    '0%': '#ff4d4f',
                    '100%': '#52c41a'
                  }}
                />

                <Timeline
                  mode="left"
                  items={simulationEvents.map((event, index) => {
                    const isActive = index === currentEventIndex;
                    const isPast = index < currentEventIndex;

                    let color = 'gray';
                    let icon = null;

                    if (isPast || isActive) {
                      if (event.defenseAction === 'blocked') {
                        color = 'green';
                        icon = <CheckCircleOutlined style={{ fontSize: 16 }} />;
                      } else if (event.defenseAction === 'detected') {
                        color = 'orange';
                        icon = <WarningOutlined style={{ fontSize: 16 }} />;
                      } else if (event.defenseAction === 'bypassed') {
                        color = 'red';
                        icon = <CloseCircleOutlined style={{ fontSize: 16 }} />;
                      } else {
                        color = 'red';
                        icon = <FireOutlined style={{ fontSize: 16 }} />;
                      }
                    }

                    return {
                      color,
                      dot: icon,
                      children: (
                        <div style={{
                          opacity: isPast || isActive ? 1 : 0.3,
                          transition: 'opacity 0.3s'
                        }}>
                          <Space direction="vertical" size="small">
                            <Space>
                              <Tag color="blue">步骤 {event.phaseIndex + 1}</Tag>
                              <span style={{ fontWeight: 500 }}>{event.phaseName}</span>
                            </Space>
                            <div style={{ fontSize: 12, color: '#666' }}>
                              目标节点: {event.targetNode}
                            </div>
                            {(isPast || isActive) && (
                              <>
                                <div style={{ fontSize: 12 }}>
                                  {event.defenseAction === 'blocked' && (
                                    <Tag color="green">✓ 阻断成功</Tag>
                                  )}
                                  {event.defenseAction === 'detected' && (
                                    <Tag color="orange">⚠ 检测到攻击</Tag>
                                  )}
                                  {event.defenseAction === 'bypassed' && (
                                    <Tag color="red">✗ 防御被绕过</Tag>
                                  )}
                                  {event.defenseAction === 'none' && (
                                    <Tag color="red">✗ 无防御措施</Tag>
                                  )}
                                </div>
                                <div style={{ fontSize: 12, color: '#666' }}>
                                  {event.description}
                                </div>
                              </>
                            )}
                          </Space>
                        </div>
                      )
                    };
                  })}
                />
              </Space>
            </Card>
          </Col>
        )}

        {/* 仿真结果 */}
        {simulationResult && (
          <Col span={24}>
            <Card title="防御仿真结果">
              <Tabs defaultActiveKey="summary">
                <TabPane tab="结果概览" key="summary">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Card title="无防御情况" size="small" style={{ background: '#fff1f0' }}>
                        <Descriptions column={1} size="small">
                          <Descriptions.Item label="攻击成功率">
                            <span style={{ color: '#ff4d4f', fontWeight: 500 }}>
                              {(simulationResult.withoutDefense.attackSuccessRate * 100).toFixed(1)}%
                            </span>
                          </Descriptions.Item>
                          <Descriptions.Item label="检测率">
                            {(simulationResult.withoutDefense.detectionRate * 100).toFixed(1)}%
                          </Descriptions.Item>
                          <Descriptions.Item label="平均响应时间">
                            {simulationResult.withoutDefense.averageResponseTime} 分钟
                          </Descriptions.Item>
                          <Descriptions.Item label="受影响节点">
                            {simulationResult.withoutDefense.affectedNodesCount} 个
                          </Descriptions.Item>
                        </Descriptions>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card title="部署防御后" size="small" style={{ background: '#f6ffed' }}>
                        <Descriptions column={1} size="small">
                          <Descriptions.Item label="攻击成功率">
                            <span style={{ color: '#52c41a', fontWeight: 500 }}>
                              {(simulationResult.withDefense.attackSuccessRate * 100).toFixed(1)}%
                            </span>
                          </Descriptions.Item>
                          <Descriptions.Item label="检测率">
                            {(simulationResult.withDefense.detectionRate * 100).toFixed(1)}%
                          </Descriptions.Item>
                          <Descriptions.Item label="平均响应时间">
                            {simulationResult.withDefense.averageResponseTime} 分钟
                          </Descriptions.Item>
                          <Descriptions.Item label="受影响节点">
                            {simulationResult.withDefense.affectedNodesCount} 个
                          </Descriptions.Item>
                        </Descriptions>
                      </Card>
                    </Col>
                    <Col span={24}>
                      <Card title="防御效果提升" size="small" style={{ background: '#e6f7ff' }}>
                        <Descriptions column={4} size="small">
                          <Descriptions.Item label="成功率降低">
                            <span style={{ color: '#52c41a', fontWeight: 600, fontSize: 16 }}>
                              {simulationResult.improvement.successRateReduction.toFixed(1)}%
                            </span>
                          </Descriptions.Item>
                          <Descriptions.Item label="检测率提升">
                            <span style={{ color: '#1890ff', fontWeight: 600, fontSize: 16 }}>
                              {simulationResult.improvement.detectionRateIncrease.toFixed(1)}%
                            </span>
                          </Descriptions.Item>
                          <Descriptions.Item label="响应时间缩短">
                            <span style={{ color: '#fa8c16', fontWeight: 600, fontSize: 16 }}>
                              {simulationResult.improvement.responseTimeReduction.toFixed(1)}%
                            </span>
                          </Descriptions.Item>
                          <Descriptions.Item label="受影响节点减少">
                            <span style={{ color: '#722ed1', fontWeight: 600, fontSize: 16 }}>
                              {simulationResult.improvement.affectedNodesReduction.toFixed(1)}%
                            </span>
                          </Descriptions.Item>
                        </Descriptions>
                      </Card>
                    </Col>
                  </Row>
                </TabPane>
                <TabPane tab="效果评估" key="effectiveness">
                  {selectedScenario && (
                    <DefenseEffectiveness scenario={selectedScenario} />
                  )}
                </TabPane>
                <TabPane tab="场景对比" key="comparison">
                  <DefenseComparison />
                </TabPane>
              </Tabs>
            </Card>
          </Col>
        )}
      </Row>

      {/* 添加防御措施模态框 */}
      <Modal
        title="添加防御措施"
        open={addModalVisible}
        onOk={handleAddConfirm}
        onCancel={() => setAddModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="防御措施"
            name="measureId"
            rules={[{ required: true, message: '请选择防御措施' }]}
          >
            <Select placeholder="选择防御措施">
              {defenseMeasures.map(measure => (
                <Option key={measure.measureId} value={measure.measureId}>
                  {measure.measureName} - {measure.measureType}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="部署节点"
            name="deployedNodeIds"
            rules={[{ required: true, message: '请选择部署节点' }]}
          >
            <Select mode="multiple" placeholder="选择部署节点">
              {networkNodes.map(node => (
                <Option key={node.nodeId} value={node.nodeId}>
                  {node.name} ({node.zone})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="有效性评分 (%)"
            name="effectivenessScore"
            rules={[{ required: true, message: '请输入有效性评分' }]}
            initialValue={80}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑防御措施模态框 */}
      <Modal
        title="编辑防御措施"
        open={editModalVisible}
        onOk={handleEditConfirm}
        onCancel={() => setEditModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="有效性评分 (%)"
            name="effectivenessScore"
            rules={[{ required: true, message: '请输入有效性评分' }]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DefenseStrategy;

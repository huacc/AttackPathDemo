/**
 * P5.2 推演配置面板
 * 配置攻击路径推演参数
 */

import React, { useState } from 'react';
import { Form, Select, InputNumber, Card, Space, Tag, Button } from 'antd';
import { FireOutlined, AimOutlined, UserOutlined, SettingOutlined, PlayCircleOutlined, ReloadOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { NETWORK_NODES } from '../../../mock/static/networkNodes';
import { THREAT_ACTORS } from '../../../mock/static/threatActors';

const { Option } = Select;

export interface PathConfig {
  startNodeId: string;
  targetNodeId: string;
  threatActorId: string;
  algorithm: 'dijkstra' | 'a_star' | 'genetic' | 'monte_carlo';
  maxPaths: number;
  timeout: number;
  successRateThreshold: number;
}

export interface PathConfigPanelProps {
  onStartSimulation: (config: PathConfig) => void;
  onReset: () => void;
  loading?: boolean;
}

const PathConfigPanel: React.FC<PathConfigPanelProps> = ({ onStartSimulation, onReset, loading }) => {
  const [form] = Form.useForm();

  // 过滤可选的起点节点（外网或DMZ）
  const startNodes = NETWORK_NODES.filter(node =>
    node.zone === 'external' || node.zone === 'dmz'
  );

  // 过滤可选的目标节点（内网或云）
  const targetNodes = NETWORK_NODES.filter(node =>
    node.zone === 'intranet' || node.zone === 'cloud'
  );

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onStartSimulation(values);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  return (
    <Card
      title={
        <Space>
          <ThunderboltOutlined />
          <span>攻击路径推演配置</span>
        </Space>
      }
      extra={
        <Space>
          <Button onClick={handleReset} disabled={loading}>
            <ReloadOutlined /> 重置
          </Button>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handleSubmit}
            loading={loading}
          >
            开始推演
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          algorithm: 'dijkstra',
          maxPaths: 5,
          timeout: 30,
          successRateThreshold: 0.3
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* 攻击起点和目标 */}
          <Card
            title={
              <Space>
                <AimOutlined />
                <span>攻击起点与目标</span>
              </Space>
            }
            size="small"
          >
            <Form.Item
              label="攻击起点"
              name="startNodeId"
              rules={[{ required: true, message: '请选择攻击起点' }]}
            >
              <Select
                placeholder="选择攻击起点节点"
                showSearch
                optionFilterProp="children"
              >
                {startNodes.map(node => (
                  <Option key={node.nodeId} value={node.nodeId}>
                    <Space>
                      <Tag color={node.zone === 'external' ? 'red' : 'orange'}>
                        {node.zone.toUpperCase()}
                      </Tag>
                      <span>{node.name}</span>
                      <span style={{ color: '#999', fontSize: 12 }}>
                        {node.ipv4Address}
                      </span>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="攻击目标"
              name="targetNodeId"
              rules={[{ required: true, message: '请选择攻击目标' }]}
            >
              <Select
                placeholder="选择攻击目标节点"
                showSearch
                optionFilterProp="children"
              >
                {targetNodes.map(node => (
                  <Option key={node.nodeId} value={node.nodeId}>
                    <Space>
                      <Tag color={node.zone === 'intranet' ? 'blue' : 'purple'}>
                        {node.zone.toUpperCase()}
                      </Tag>
                      <span>{node.name}</span>
                      {node.criticalityLevel && (
                        <Tag color={
                          node.criticalityLevel === 'critical' ? 'red' :
                          node.criticalityLevel === 'high' ? 'orange' : 'default'
                        }>
                          {node.criticalityLevel}
                        </Tag>
                      )}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Card>

          {/* 攻击者画像 */}
          <Card
            title={
              <Space>
                <UserOutlined />
                <span>攻击者画像</span>
              </Space>
            }
            size="small"
          >
            <Form.Item
              label="威胁行为者"
              name="threatActorId"
              rules={[{ required: true, message: '请选择威胁行为者' }]}
            >
              <Select placeholder="选择威胁行为者">
                {THREAT_ACTORS.map(actor => (
                  <Option key={actor.actorId} value={actor.actorId}>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Space>
                        <strong>{actor.name}</strong>
                        <Tag color="red">{actor.actorType}</Tag>
                        <Tag color="orange">{actor.sophisticationLevel}</Tag>
                      </Space>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        {actor.aliases?.join(', ')}
                      </div>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Card>

          {/* 算法选择 */}
          <Card
            title={
              <Space>
                <FireOutlined />
                <span>推演算法</span>
              </Space>
            }
            size="small"
          >
            <Form.Item
              label="路径搜索算法"
              name="algorithm"
              rules={[{ required: true, message: '请选择算法' }]}
            >
              <Select>
                <Option value="dijkstra">
                  <Space direction="vertical" size="small">
                    <strong>Dijkstra最短路径算法</strong>
                    <span style={{ fontSize: 12, color: '#666' }}>
                      基于成本的最优路径搜索，适合寻找最低风险路径
                    </span>
                  </Space>
                </Option>
                <Option value="a_star">
                  <Space direction="vertical" size="small">
                    <strong>A*启发式搜索算法</strong>
                    <span style={{ fontSize: 12, color: '#666' }}>
                      结合启发式函数的智能搜索，平衡效率与准确性
                    </span>
                  </Space>
                </Option>
                <Option value="genetic">
                  <Space direction="vertical" size="small">
                    <strong>遗传算法</strong>
                    <span style={{ fontSize: 12, color: '#666' }}>
                      模拟自然进化过程，适合复杂多目标优化
                    </span>
                  </Space>
                </Option>
                <Option value="monte_carlo">
                  <Space direction="vertical" size="small">
                    <strong>蒙特卡洛模拟</strong>
                    <span style={{ fontSize: 12, color: '#666' }}>
                      基于随机采样的概率分析，适合不确定性评估
                    </span>
                  </Space>
                </Option>
              </Select>
            </Form.Item>
          </Card>

          {/* 参数配置 */}
          <Card
            title={
              <Space>
                <SettingOutlined />
                <span>参数配置</span>
              </Space>
            }
            size="small"
          >
            <Form.Item
              label="最大路径数"
              name="maxPaths"
              tooltip="推演生成的最大攻击路径数量"
            >
              <InputNumber
                min={1}
                max={20}
                style={{ width: '100%' }}
                addonAfter="条"
              />
            </Form.Item>

            <Form.Item
              label="超时时间"
              name="timeout"
              tooltip="推演计算的最大时长"
            >
              <InputNumber
                min={10}
                max={300}
                step={10}
                style={{ width: '100%' }}
                addonAfter="秒"
              />
            </Form.Item>

            <Form.Item
              label="成功率阈值"
              name="successRateThreshold"
              tooltip="过滤低于此成功率的路径"
            >
              <InputNumber
                min={0}
                max={1}
                step={0.1}
                style={{ width: '100%' }}
                formatter={value => `${(Number(value) * 100).toFixed(0)}%`}
                parser={value => {
                  const numStr = value?.replace(/%/g, '') || '0';
                  return Number(numStr) / 100;
                }}
              />
            </Form.Item>
          </Card>
        </Space>
      </Form>
    </Card>
  );
};

export default PathConfigPanel;

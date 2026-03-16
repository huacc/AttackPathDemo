import React, { useState, useMemo } from 'react';
import { Card, Descriptions, Tag, Space, Button, Tabs, Form, Input, Select, message } from 'antd';
import { ArrowLeftOutlined, EditOutlined, SaveOutlined, DownloadOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import SandboxCanvas from '../cockpit/components/SandboxCanvas';
import { SCENES } from '../../mock/dynamic/scenes';
import { Scene, SceneCategory, SceneComplexity } from '../../types';
import { isCrossDomainConnection } from '../cockpit/components/EdgeRenderer';

const { TextArea } = Input;
const { TabPane } = Tabs;

/**
 * 场景详情页面
 * 展示场景拓扑和配置信息
 */
export const SceneDetail: React.FC = () => {
  const navigate = useNavigate();
  const { sceneId } = useParams<{ sceneId: string }>();
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();

  // 查找当前场景
  const scene = useMemo(() => {
    return SCENES.find(s => s.metadata.sceneId === sceneId);
  }, [sceneId]);

  if (!scene) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <h2>场景不存在</h2>
            <Button type="primary" onClick={() => navigate('/scene')}>
              返回场景列表
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // 转换节点数据为G6格式
  const graphData = useMemo(() => {
    const nodeZoneMap = new Map<string, string>();
    scene.nodes.forEach(node => {
      nodeZoneMap.set(node.nodeId, node.zone);
    });

    const layoutMap = new Map<string, { x: number; y: number }>();
    scene.nodeLayouts.forEach(layout => {
      layoutMap.set(layout.nodeId, { x: layout.x, y: layout.y });
    });

    const nodes = scene.nodes.map(node => {
      const position = layoutMap.get(node.nodeId) || { x: 0, y: 0 };
      return {
        id: node.nodeId,
        x: position.x,
        y: position.y,
        ...node
      };
    });

    const edges = scene.connections.map(conn => {
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
  }, [scene]);

  // 获取分类标签
  const getCategoryLabel = (category: SceneCategory): string => {
    const labels: Record<SceneCategory, string> = {
      web_attack: 'Web攻击',
      lateral_movement: '横向移动',
      cloud_attack: '云环境攻击',
      apt_campaign: 'APT活动',
      custom: '自定义'
    };
    return labels[category];
  };

  // 获取复杂度标签
  const getComplexityLabel = (complexity: SceneComplexity): string => {
    const labels: Record<SceneComplexity, string> = {
      simple: '简单',
      medium: '中等',
      complex: '复杂'
    };
    return labels[complexity];
  };

  // 获取复杂度颜色
  const getComplexityColor = (complexity: SceneComplexity): string => {
    const colors: Record<SceneComplexity, string> = {
      simple: 'green',
      medium: 'orange',
      complex: 'red'
    };
    return colors[complexity];
  };

  // 保存场景配置
  const handleSaveConfig = async () => {
    try {
      const values = await form.validateFields();
      console.log('Save config:', values);
      message.success('场景配置已保存');
      setEditMode(false);
      // TODO: 更新场景数据
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  // 导出场景
  const handleExportScene = () => {
    const dataStr = JSON.stringify(scene, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${scene.metadata.sceneId}_${scene.metadata.name}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    message.success('场景已导出');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <Space>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/scene')}
            >
              返回
            </Button>
            <span>{scene.metadata.name}</span>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<DownloadOutlined />} onClick={handleExportScene}>
              导出场景
            </Button>
            {editMode ? (
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveConfig}>
                保存配置
              </Button>
            ) : (
              <Button icon={<EditOutlined />} onClick={() => setEditMode(true)}>
                编辑配置
              </Button>
            )}
          </Space>
        }
      >
        <Tabs defaultActiveKey="topology">
          {/* 拓扑视图 */}
          <TabPane tab="拓扑视图" key="topology">
            <div style={{ height: '700px', border: '1px solid #e8e8e8', borderRadius: '4px' }}>
              <SandboxCanvas
                zones={scene.zones}
                nodes={graphData.nodes}
                edges={graphData.edges}
                width={1400}
                height={700}
              />
            </div>
          </TabPane>

          {/* 基础信息 */}
          <TabPane tab="基础信息" key="info">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="场景ID">{scene.metadata.sceneId}</Descriptions.Item>
              <Descriptions.Item label="场景名称">{scene.metadata.name}</Descriptions.Item>
              <Descriptions.Item label="分类">
                <Tag color="blue">{getCategoryLabel(scene.metadata.category)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="复杂度">
                <Tag color={getComplexityColor(scene.metadata.complexity)}>
                  {getComplexityLabel(scene.metadata.complexity)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">{scene.metadata.createdAt}</Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {scene.metadata.updatedAt || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="作者">{scene.metadata.author || '-'}</Descriptions.Item>
              <Descriptions.Item label="标签">
                {scene.metadata.tags?.map(tag => (
                  <Tag key={tag}>{tag}</Tag>
                )) || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="描述" span={2}>
                {scene.metadata.description}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: '24px' }}>
              <h3>统计信息</h3>
              <Descriptions bordered column={3}>
                <Descriptions.Item label="安全域数量">{scene.zones.length}</Descriptions.Item>
                <Descriptions.Item label="节点数量">{scene.nodes.length}</Descriptions.Item>
                <Descriptions.Item label="连接数量">{scene.connections.length}</Descriptions.Item>
              </Descriptions>
            </div>

            <div style={{ marginTop: '24px' }}>
              <h3>安全域列表</h3>
              <Descriptions bordered column={1}>
                {scene.zones.map(zone => (
                  <Descriptions.Item key={zone.zoneId} label={zone.zoneName}>
                    <Space>
                      <Tag color={
                        zone.zoneType === 'external' ? 'red' :
                        zone.zoneType === 'dmz' ? 'orange' :
                        zone.zoneType === 'intranet' ? 'blue' : 'purple'
                      }>
                        {zone.zoneType.toUpperCase()}
                      </Tag>
                      <span>{zone.description}</span>
                      <span style={{ color: '#8c8c8c' }}>
                        节点数: {scene.nodes.filter(n => n.zone === zone.zoneType).length}
                      </span>
                    </Space>
                  </Descriptions.Item>
                ))}
              </Descriptions>
            </div>
          </TabPane>

          {/* 推演参数配置 */}
          <TabPane tab="推演参数" key="config">
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                maxPathLength: 10,
                timeoutSeconds: 30,
                successRateThreshold: 0.3,
                defaultLayout: 'preset',
                showLabels: true,
                showZones: true
              }}
              disabled={!editMode}
            >
              <h3>仿真参数</h3>
              <Form.Item
                label="最大路径长度"
                name="maxPathLength"
                tooltip="攻击路径推演的最大步数"
              >
                <Input type="number" min={1} max={20} addonAfter="步" />
              </Form.Item>
              <Form.Item
                label="超时时间"
                name="timeoutSeconds"
                tooltip="推演计算的最大时长"
              >
                <Input type="number" min={10} max={300} addonAfter="秒" />
              </Form.Item>
              <Form.Item
                label="成功率阈值"
                name="successRateThreshold"
                tooltip="过滤低于此成功率的路径"
              >
                <Input type="number" min={0} max={1} step={0.1} />
              </Form.Item>

              <h3 style={{ marginTop: '24px' }}>可视化参数</h3>
              <Form.Item
                label="默认布局"
                name="defaultLayout"
                tooltip="沙盘的默认布局算法"
              >
                <Select>
                  <Select.Option value="preset">预设布局</Select.Option>
                  <Select.Option value="force">力导向布局</Select.Option>
                  <Select.Option value="dagre">层次布局</Select.Option>
                  <Select.Option value="grid">网格布局</Select.Option>
                  <Select.Option value="circular">环形布局</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="显示标签"
                name="showLabels"
                valuePropName="checked"
              >
                <Select>
                  <Select.Option value={true}>显示</Select.Option>
                  <Select.Option value={false}>隐藏</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="显示区域"
                name="showZones"
                valuePropName="checked"
              >
                <Select>
                  <Select.Option value={true}>显示</Select.Option>
                  <Select.Option value={false}>隐藏</Select.Option>
                </Select>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default SceneDetail;

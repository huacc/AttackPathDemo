import React, { useState } from 'react';
import { Card, Row, Col, Button, Space, Tag, Modal, message, Select, Input, Upload } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  DownloadOutlined,
  UploadOutlined,
  EyeOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Scene, SceneCategory, SceneComplexity } from '../../types';
import { SCENES } from '../../mock/dynamic/scenes';

const { Search } = Input;

/**
 * 场景列表页面
 * 支持创建/编辑/删除/复制/导入/导出
 */
export const SceneList: React.FC = () => {
  const navigate = useNavigate();
  const [scenes, setScenes] = useState<Scene[]>([...SCENES]);
  const [filteredScenes, setFilteredScenes] = useState<Scene[]>([...SCENES]);
  const [selectedCategory, setSelectedCategory] = useState<SceneCategory | 'all'>('all');
  const [selectedComplexity, setSelectedComplexity] = useState<SceneComplexity | 'all'>('all');
  const [searchText, setSearchText] = useState('');

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

  // 筛选场景
  const filterScenes = (
    category: SceneCategory | 'all',
    complexity: SceneComplexity | 'all',
    search: string
  ) => {
    let filtered = [...scenes];

    if (category !== 'all') {
      filtered = filtered.filter(s => s.metadata.category === category);
    }

    if (complexity !== 'all') {
      filtered = filtered.filter(s => s.metadata.complexity === complexity);
    }

    if (search) {
      filtered = filtered.filter(s =>
        s.metadata.name.toLowerCase().includes(search.toLowerCase()) ||
        s.metadata.description.toLowerCase().includes(search.toLowerCase()) ||
        s.metadata.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }

    setFilteredScenes(filtered);
  };

  // 处理分类筛选
  const handleCategoryChange = (value: SceneCategory | 'all') => {
    setSelectedCategory(value);
    filterScenes(value, selectedComplexity, searchText);
  };

  // 处理复杂度筛选
  const handleComplexityChange = (value: SceneComplexity | 'all') => {
    setSelectedComplexity(value);
    filterScenes(selectedCategory, value, searchText);
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchText(value);
    filterScenes(selectedCategory, selectedComplexity, value);
  };

  // 查看场景详情
  const handleViewScene = (sceneId: string) => {
    navigate(`/scene/${sceneId}`);
  };

  // 创建新场景
  const handleCreateScene = () => {
    message.info('创建场景功能开发中');
    // TODO: 打开创建场景对话框
  };

  // 编辑场景
  const handleEditScene = (sceneId: string) => {
    message.info(`编辑场景功能开发中: ${sceneId}`);
    // TODO: 打开编辑场景对话框
  };

  // 复制场景
  const handleCopyScene = (scene: Scene) => {
    const newScene: Scene = {
      ...scene,
      metadata: {
        ...scene.metadata,
        sceneId: `scene-${Date.now()}`,
        name: `${scene.metadata.name} (副本)`,
        createdAt: new Date().toISOString().split('T')[0]
      }
    };
    setScenes([...scenes, newScene]);
    setFilteredScenes([...filteredScenes, newScene]);
    message.success('场景已复制');
  };

  // 删除场景
  const handleDeleteScene = (sceneId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个场景吗？此操作不可恢复。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        const newScenes = scenes.filter(s => s.metadata.sceneId !== sceneId);
        setScenes(newScenes);
        setFilteredScenes(newScenes.filter(s => filteredScenes.some(f => f.metadata.sceneId === s.metadata.sceneId)));
        message.success('场景已删除');
      }
    });
  };

  // 导出场景
  const handleExportScene = (scene: Scene) => {
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

  // 导入场景
  const handleImportScene = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const scene = JSON.parse(e.target?.result as string) as Scene;
        // 验证场景数据结构
        if (!scene.metadata || !scene.zones || !scene.nodes || !scene.connections) {
          throw new Error('场景数据格式不正确');
        }
        // 生成新的场景ID
        scene.metadata.sceneId = `scene-${Date.now()}`;
        scene.metadata.createdAt = new Date().toISOString().split('T')[0];
        setScenes([...scenes, scene]);
        setFilteredScenes([...filteredScenes, scene]);
        message.success('场景已导入');
      } catch (error) {
        message.error('导入失败：场景文件格式不正确');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    return false; // 阻止默认上传行为
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="场景管理"
        extra={
          <Space>
            <Upload
              accept=".json"
              showUploadList={false}
              beforeUpload={handleImportScene}
            >
              <Button icon={<UploadOutlined />}>导入场景</Button>
            </Upload>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateScene}>
              创建场景
            </Button>
          </Space>
        }
      >
        {/* 筛选栏 */}
        <Space style={{ marginBottom: '24px', width: '100%' }} size="middle">
          <FilterOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
          <Select
            style={{ width: 150 }}
            placeholder="选择分类"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <Select.Option value="all">全部分类</Select.Option>
            <Select.Option value="web_attack">Web攻击</Select.Option>
            <Select.Option value="lateral_movement">横向移动</Select.Option>
            <Select.Option value="cloud_attack">云环境攻击</Select.Option>
            <Select.Option value="apt_campaign">APT活动</Select.Option>
            <Select.Option value="custom">自定义</Select.Option>
          </Select>
          <Select
            style={{ width: 120 }}
            placeholder="选择复杂度"
            value={selectedComplexity}
            onChange={handleComplexityChange}
          >
            <Select.Option value="all">全部复杂度</Select.Option>
            <Select.Option value="simple">简单</Select.Option>
            <Select.Option value="medium">中等</Select.Option>
            <Select.Option value="complex">复杂</Select.Option>
          </Select>
          <Search
            placeholder="搜索场景名称、描述或标签"
            allowClear
            style={{ width: 300 }}
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </Space>

        {/* 场景卡片列表 */}
        <Row gutter={[16, 16]}>
          {filteredScenes.map((scene) => (
            <Col key={scene.metadata.sceneId} xs={24} sm={12} lg={8} xl={6}>
              <Card
                hoverable
                cover={
                  <div
                    style={{
                      height: '150px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '48px'
                    }}
                  >
                    <EyeOutlined />
                  </div>
                }
                actions={[
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewScene(scene.metadata.sceneId)}
                  >
                    查看
                  </Button>,
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEditScene(scene.metadata.sceneId)}
                  >
                    编辑
                  </Button>,
                  <Button
                    type="text"
                    icon={<CopyOutlined />}
                    onClick={() => handleCopyScene(scene)}
                  >
                    复制
                  </Button>,
                  <Button
                    type="text"
                    icon={<DownloadOutlined />}
                    onClick={() => handleExportScene(scene)}
                  >
                    导出
                  </Button>,
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteScene(scene.metadata.sceneId)}
                  >
                    删除
                  </Button>
                ]}
              >
                <Card.Meta
                  title={scene.metadata.name}
                  description={
                    <div>
                      <div style={{ marginBottom: '8px', minHeight: '40px' }}>
                        {scene.metadata.description}
                      </div>
                      <Space wrap>
                        <Tag color="blue">{getCategoryLabel(scene.metadata.category)}</Tag>
                        <Tag color={getComplexityColor(scene.metadata.complexity)}>
                          {getComplexityLabel(scene.metadata.complexity)}
                        </Tag>
                      </Space>
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#8c8c8c' }}>
                        <div>节点数: {scene.nodes.length}</div>
                        <div>连接数: {scene.connections.length}</div>
                        <div>创建时间: {scene.metadata.createdAt}</div>
                      </div>
                      {scene.metadata.tags && scene.metadata.tags.length > 0 && (
                        <div style={{ marginTop: '8px' }}>
                          {scene.metadata.tags.map(tag => (
                            <Tag key={tag} style={{ marginBottom: '4px' }}>
                              {tag}
                            </Tag>
                          ))}
                        </div>
                      )}
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>

        {filteredScenes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', color: '#8c8c8c' }}>
            <EyeOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
            <div>没有找到匹配的场景</div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SceneList;

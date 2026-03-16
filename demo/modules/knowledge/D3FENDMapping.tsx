/**
 * P4.3 D3FEND映射管理
 * D3FEND分类视图：按6类防御战术展示
 * 支持防御技术详情和攻防对抗映射可视化
 */

import React, { useState } from 'react';
import {
  Card,
  Space,
  Tag,
  Collapse,
  List,
  Badge,
  Drawer,
  Descriptions,
  Progress,
  Row,
  Col,
  Statistic,
  Tooltip,
  Button
} from 'antd';
import {
  SafetyCertificateOutlined,
  EyeOutlined,
  DisconnectOutlined,
  BugOutlined,
  DeleteOutlined,
  ReloadOutlined,
  LinkOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { D3FEND_TACTICS } from '../../mock/static/defenseFramework';

const { Panel } = Collapse;

// ==================== 类型定义 ====================

interface DefenseTechniqueDetail {
  techniqueId: string;
  name: string;
  description: string;
  d3fendId: string;
  category: string;
  coveredAttacks: string[];
  effectivenessScore: number;
  relatedMitigations: string[];
}

// ==================== 战术图标映射 ====================

const TACTIC_ICONS: Record<string, React.ReactNode> = {
  harden: <SafetyCertificateOutlined />,
  detect: <EyeOutlined />,
  isolate: <DisconnectOutlined />,
  deceive: <BugOutlined />,
  evict: <DeleteOutlined />,
  restore: <ReloadOutlined />
};

const TACTIC_COLORS: Record<string, string> = {
  harden: '#1890ff',
  detect: '#52c41a',
  isolate: '#faad14',
  deceive: '#722ed1',
  evict: '#f5222d',
  restore: '#13c2c2'
};

// ==================== 主组件 ====================

const D3FENDMapping: React.FC = () => {
  const [selectedTechnique, setSelectedTechnique] = useState<DefenseTechniqueDetail | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // 转换数据为详细格式
  const enrichedTactics = D3FEND_TACTICS.map(tactic => ({
    ...tactic,
    techniques: tactic.techniques.map(tech => ({
      ...tech,
      category: tactic.category,
      coveredAttacks: [
        `T${1000 + Math.floor(Math.random() * 100)}`,
        `T${1000 + Math.floor(Math.random() * 100)}`,
        `T${1000 + Math.floor(Math.random() * 100)}`
      ],
      effectivenessScore: Math.random() * 30 + 70
    }))
  }));

  // 处理技术点击
  const handleTechniqueClick = (technique: DefenseTechniqueDetail) => {
    setSelectedTechnique(technique);
    setDrawerVisible(true);
  };

  // 统计信息
  const stats = {
    totalTactics: D3FEND_TACTICS.length,
    totalTechniques: D3FEND_TACTICS.reduce((sum, t) => sum + t.techniques.length, 0),
    avgEffectiveness: 82,
    totalMappings: D3FEND_TACTICS.reduce(
      (sum, t) => sum + t.techniques.reduce((s, tech) => s + tech.relatedMitigations.length, 0),
      0
    )
  };

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <Space>
            <SafetyCertificateOutlined />
            <span>D3FEND映射管理</span>
          </Space>
        }
      >
        {/* 统计信息 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Statistic
              title="防御战术"
              value={stats.totalTactics}
              suffix="类"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="防御技术"
              value={stats.totalTechniques}
              suffix="个"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="平均效能"
              value={stats.avgEffectiveness}
              suffix="%"
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="攻防映射"
              value={stats.totalMappings}
              suffix="条"
            />
          </Col>
        </Row>

        {/* D3FEND分类视图 */}
        <Collapse
          defaultActiveKey={enrichedTactics.map(t => t.tacticId)}
          expandIconPosition="end"
        >
          {enrichedTactics.map(tactic => (
            <Panel
              key={tactic.tacticId}
              header={
                <Space>
                  <span style={{ fontSize: 20, color: TACTIC_COLORS[tactic.category] }}>
                    {TACTIC_ICONS[tactic.category]}
                  </span>
                  <strong>{tactic.name}</strong>
                  <Tag color={TACTIC_COLORS[tactic.category]}>
                    {tactic.category.toUpperCase()}
                  </Tag>
                  <Badge count={tactic.techniques.length} showZero />
                </Space>
              }
            >
              <div style={{ color: '#666', marginBottom: 16, fontSize: 13 }}>
                {tactic.description}
              </div>

              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
                dataSource={tactic.techniques}
                renderItem={tech => (
                  <List.Item>
                    <Card
                      size="small"
                      hoverable
                      onClick={() => handleTechniqueClick(tech as DefenseTechniqueDetail)}
                      style={{ cursor: 'pointer' }}
                    >
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Tag color={TACTIC_COLORS[tactic.category]} style={{ margin: 0 }}>
                            {tech.d3fendId}
                          </Tag>
                          <Tooltip title="效能评分">
                            <Tag color="blue" style={{ margin: 0 }}>
                              {tech.effectivenessScore.toFixed(0)}%
                            </Tag>
                          </Tooltip>
                        </div>

                        <div style={{ fontWeight: 'bold', fontSize: 13 }}>
                          {tech.name}
                        </div>

                        <div
                          style={{
                            fontSize: 11,
                            color: '#666',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}
                        >
                          {tech.description}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, color: '#999' }}>
                            覆盖攻击: {tech.coveredAttacks.length}个
                          </span>
                          <InfoCircleOutlined style={{ color: '#1890ff' }} />
                        </div>
                      </Space>
                    </Card>
                  </List.Item>
                )}
              />
            </Panel>
          ))}
        </Collapse>
      </Card>

      {/* 技术详情抽屉 */}
      <Drawer
        title="防御技术详情"
        placement="right"
        width={500}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedTechnique && (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="技术ID">
                <Space>
                  {selectedTechnique.d3fendId}
                  <a
                    href={`https://d3fend.mitre.org/technique/${selectedTechnique.d3fendId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <LinkOutlined />
                  </a>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="技术名称">
                {selectedTechnique.name}
              </Descriptions.Item>
              <Descriptions.Item label="防御类别">
                <Tag color={TACTIC_COLORS[selectedTechnique.category]}>
                  {selectedTechnique.category.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="描述">
                {selectedTechnique.description}
              </Descriptions.Item>
            </Descriptions>

            <Card
              title="效能评分"
              size="small"
              style={{ marginTop: 16 }}
            >
              <Progress
                percent={selectedTechnique.effectivenessScore}
                status={
                  selectedTechnique.effectivenessScore >= 80
                    ? 'success'
                    : selectedTechnique.effectivenessScore >= 60
                    ? 'normal'
                    : 'exception'
                }
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068'
                }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                该防御技术的综合效能评分为{' '}
                <strong>{selectedTechnique.effectivenessScore.toFixed(1)}%</strong>
              </div>
            </Card>

            <Card
              title={
                <Space>
                  <span>覆盖的攻击技术</span>
                  <Badge count={selectedTechnique.coveredAttacks.length} showZero />
                </Space>
              }
              size="small"
              style={{ marginTop: 16 }}
            >
              <Space wrap>
                {selectedTechnique.coveredAttacks.map(attackId => (
                  <Tag key={attackId} color="red">
                    {attackId}
                  </Tag>
                ))}
              </Space>
            </Card>

            <Card
              title={
                <Space>
                  <span>关联的ATT&CK缓解措施</span>
                  <Badge count={selectedTechnique.relatedMitigations.length} showZero />
                </Space>
              }
              size="small"
              style={{ marginTop: 16 }}
            >
              <List
                size="small"
                dataSource={selectedTechnique.relatedMitigations}
                renderItem={item => (
                  <List.Item>
                    <Space>
                      <Tag color="blue">{item}</Tag>
                      <LinkOutlined style={{ color: '#1890ff' }} />
                    </Space>
                  </List.Item>
                )}
              />
            </Card>

            <Card
              title="攻防对抗映射"
              size="small"
              style={{ marginTop: 16 }}
            >
              <div style={{ fontSize: 12, color: '#666', lineHeight: 1.8 }}>
                <div>
                  <strong>防御策略:</strong> {selectedTechnique.name}
                </div>
                <div style={{ margin: '8px 0', textAlign: 'center' }}>
                  ↓ 对抗 ↓
                </div>
                <div>
                  <strong>攻击技术:</strong>{' '}
                  {selectedTechnique.coveredAttacks.join(', ')}
                </div>
                <div style={{ marginTop: 12, padding: 8, background: '#f0f2f5', borderRadius: 4 }}>
                  该防御技术可有效对抗 {selectedTechnique.coveredAttacks.length} 种攻击技术，
                  综合防御效能达到 {selectedTechnique.effectivenessScore.toFixed(1)}%
                </div>
              </div>
            </Card>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default D3FENDMapping;

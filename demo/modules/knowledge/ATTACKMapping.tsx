/**
 * P4.2 ATT&CK映射管理
 * ATT&CK矩阵视图：战术为列，技术为行
 * 支持技术详情展示和映射关系管理
 */

import React, { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Drawer,
  Descriptions,
  List,
  Badge,
  Tooltip,
  Button,
  Input,
  Select,
  Row,
  Col,
  Statistic
} from 'antd';
import {
  SecurityScanOutlined,
  InfoCircleOutlined,
  LinkOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { attackTactics } from '../../mock/static/attackFramework';
import { attackTechniques } from '../../mock/static/attackTechniques';

const { Search } = Input;
const { Option } = Select;

// ==================== 类型定义 ====================

interface TechniqueMapping {
  techniqueId: string;
  techniqueName: string;
  tacticId: string;
  tacticName: string;
  successRate: number;
  selected: boolean;
  relatedVulnerabilities: string[];
  relatedDefenses: string[];
  relatedGroups: string[];
}

// ==================== 主组件 ====================

const ATTACKMapping: React.FC = () => {
  const [selectedTechnique, setSelectedTechnique] = useState<TechniqueMapping | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterTactic, setFilterTactic] = useState<string>('all');

  // 转换数据为映射格式
  const techniqueMappings: TechniqueMapping[] = attackTechniques.map(tech => ({
    techniqueId: tech.techniqueId,
    techniqueName: tech.techniqueName,
    tacticId: tech.tacticId,
    tacticName: tech.tacticName,
    successRate: tech.baseSuccessRate || 0.5,
    selected: Math.random() > 0.5,
    relatedVulnerabilities: [`CVE-2024-${Math.floor(Math.random() * 9000) + 1000}`],
    relatedDefenses: tech.mitigations || [],
    relatedGroups: tech.associatedGroups || []
  }));

  // 按战术分组
  const techniquesByTactic = attackTactics.map(tactic => ({
    ...tactic,
    techniques: techniqueMappings.filter(t => t.tacticId === tactic.tacticId)
  }));

  // 筛选逻辑
  const filteredTactics = techniquesByTactic
    .filter(tactic => filterTactic === 'all' || tactic.tacticId === filterTactic)
    .map(tactic => ({
      ...tactic,
      techniques: tactic.techniques.filter(tech =>
        !searchKeyword ||
        tech.techniqueName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        tech.techniqueId.toLowerCase().includes(searchKeyword.toLowerCase())
      )
    }))
    .filter(tactic => tactic.techniques.length > 0);

  // 处理技术点击
  const handleTechniqueClick = (technique: TechniqueMapping) => {
    setSelectedTechnique(technique);
    setDrawerVisible(true);
  };

  // 统计信息
  const stats = {
    totalTactics: attackTactics.length,
    totalTechniques: techniqueMappings.length,
    selectedTechniques: techniqueMappings.filter(t => t.selected).length,
    mappingCount: techniqueMappings.reduce(
      (sum, t) => sum + t.relatedDefenses.length,
      0
    )
  };

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <Space>
            <SecurityScanOutlined />
            <span>ATT&CK映射管理</span>
          </Space>
        }
      >
        {/* 统计信息 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Statistic title="战术数量" value={stats.totalTactics} />
          </Col>
          <Col span={6}>
            <Statistic title="技术数量" value={stats.totalTechniques} />
          </Col>
          <Col span={6}>
            <Statistic
              title="已选中技术"
              value={stats.selectedTechniques}
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="映射关系"
              value={stats.mappingCount}
              suffix="条"
            />
          </Col>
        </Row>

        {/* 筛选面板 */}
        <Space style={{ marginBottom: 16, width: '100%' }} wrap>
          <Select
            style={{ width: 200 }}
            value={filterTactic}
            onChange={setFilterTactic}
            placeholder="选择战术"
          >
            <Option value="all">全部战术</Option>
            {attackTactics.map(tactic => (
              <Option key={tactic.tacticId} value={tactic.tacticId}>
                {tactic.tacticName}
              </Option>
            ))}
          </Select>

          <Search
            placeholder="搜索技术"
            style={{ width: 300 }}
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            onSearch={setSearchKeyword}
          />
        </Space>

        {/* ATT&CK矩阵视图 */}
        <div style={{ overflowX: 'auto' }}>
          {filteredTactics.map(tactic => (
            <Card
              key={tactic.tacticId}
              size="small"
              title={
                <Space>
                  <Tag color="red">{tactic.tacticId}</Tag>
                  <span>{tactic.tacticName}</span>
                  <Badge count={tactic.techniques.length} showZero />
                </Space>
              }
              style={{ marginBottom: 16 }}
            >
              <div style={{ color: '#666', marginBottom: 12, fontSize: 12 }}>
                {tactic.description}
              </div>
              <Space wrap>
                {tactic.techniques.map(tech => (
                  <Tooltip
                    key={tech.techniqueId}
                    title={
                      <div>
                        <div><strong>{tech.techniqueName}</strong></div>
                        <div>成功率: {(tech.successRate * 100).toFixed(0)}%</div>
                        <div>防御措施: {tech.relatedDefenses.length}个</div>
                      </div>
                    }
                  >
                    <Card
                      size="small"
                      hoverable
                      onClick={() => handleTechniqueClick(tech)}
                      style={{
                        width: 180,
                        cursor: 'pointer',
                        borderColor: tech.selected ? '#52c41a' : '#d9d9d9',
                        background: tech.selected ? '#f6ffed' : '#fff'
                      }}
                      bodyStyle={{ padding: 12 }}
                    >
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <div style={{ fontWeight: 'bold', fontSize: 12 }}>
                          {tech.techniqueId}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: '#666',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {tech.techniqueName}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>
                            {(tech.successRate * 100).toFixed(0)}%
                          </Tag>
                          {tech.selected && (
                            <Tag color="green" style={{ fontSize: 10, margin: 0 }}>
                              已选中
                            </Tag>
                          )}
                        </div>
                      </Space>
                    </Card>
                  </Tooltip>
                ))}
              </Space>
            </Card>
          ))}
        </div>
      </Card>

      {/* 技术详情抽屉 */}
      <Drawer
        title="技术详情"
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
                  {selectedTechnique.techniqueId}
                  <a
                    href={`https://attack.mitre.org/techniques/${selectedTechnique.techniqueId.replace('.', '/')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <LinkOutlined />
                  </a>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="技术名称">
                {selectedTechnique.techniqueName}
              </Descriptions.Item>
              <Descriptions.Item label="所属战术">
                <Tag color="red">{selectedTechnique.tacticName}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="成功率">
                <Tag color="blue">
                  {(selectedTechnique.successRate * 100).toFixed(0)}%
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                {selectedTechnique.selected ? (
                  <Tag color="green">已选中</Tag>
                ) : (
                  <Tag>未选中</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>

            <Card
              title="关联漏洞"
              size="small"
              style={{ marginTop: 16 }}
            >
              <List
                size="small"
                dataSource={selectedTechnique.relatedVulnerabilities}
                renderItem={item => (
                  <List.Item>
                    <Tag color="orange">{item}</Tag>
                  </List.Item>
                )}
              />
            </Card>

            <Card
              title="防御措施"
              size="small"
              style={{ marginTop: 16 }}
            >
              <List
                size="small"
                dataSource={selectedTechnique.relatedDefenses}
                renderItem={item => (
                  <List.Item>
                    <Tag color="blue">{item}</Tag>
                  </List.Item>
                )}
              />
            </Card>

            <Card
              title="关联APT组织"
              size="small"
              style={{ marginTop: 16 }}
            >
              <List
                size="small"
                dataSource={selectedTechnique.relatedGroups}
                renderItem={item => (
                  <List.Item>
                    <Tag color="red">{item}</Tag>
                  </List.Item>
                )}
              />
            </Card>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default ATTACKMapping;

import React, { useMemo, useState } from 'react';
import { Button, Card, Col, Descriptions, Drawer, Input, Row, Select, Space, Statistic, Table, Tag, Typography } from 'antd';
import { AppstoreOutlined, DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined, UnorderedListOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { NETWORK_NODES } from '../../mock/static/networkNodes';
import { VULNERABILITIES } from '../../mock/static/vulnerabilities';
import { ATTACK_TECHNIQUES } from '../../mock/static/attackTechniques';
import { THREAT_ACTORS } from '../../mock/static/threatActors';
import { DEFENSE_MEASURES } from '../../mock/static/defenseMeasures';

const { Title, Text } = Typography;
const { Search } = Input;

type OntologyType = 'NetworkNode' | 'Vulnerability' | 'AttackTechnique' | 'ThreatActor' | 'DefenseMeasure';

type EntityItem = {
  id: string;
  name: string;
  type: OntologyType;
  category?: string;
  score?: number;
  status?: string;
  data: any;
};

const EntityLibrary: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [selectedType, setSelectedType] = useState<OntologyType | 'all'>('all');
  const [searchText, setSearchText] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<EntityItem | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // 聚合所有实体数据
  const allEntities = useMemo<EntityItem[]>(() => {
    const entities: EntityItem[] = [];

    // NetworkNode
    NETWORK_NODES.forEach(node => {
      entities.push({
        id: node.nodeId,
        name: node.name,
        type: 'NetworkNode',
        category: node.deviceCategory,
        score: node.securityScore,
        status: node.status,
        data: node
      });
    });

    // Vulnerability
    VULNERABILITIES.forEach(vuln => {
      entities.push({
        id: vuln.vulnId,
        name: vuln.cveId,
        type: 'Vulnerability',
        category: vuln.attackVector,
        score: vuln.cvssScore,
        status: vuln.remediationStatus,
        data: vuln
      });
    });

    // AttackTechnique
    ATTACK_TECHNIQUES.forEach(tech => {
      entities.push({
        id: tech.techniqueId,
        name: tech.techniqueName,
        type: 'AttackTechnique',
        category: tech.tacticName,
        score: tech.baseSuccessRate * 100,
        data: tech
      });
    });

    // ThreatActor
    THREAT_ACTORS.forEach(actor => {
      entities.push({
        id: actor.actorId,
        name: actor.name,
        type: 'ThreatActor',
        category: actor.actorType,
        score: actor.attackSuccessModifier * 50,
        data: actor
      });
    });

    // DefenseMeasure
    DEFENSE_MEASURES.forEach(defense => {
      entities.push({
        id: defense.measureId,
        name: defense.name,
        type: 'DefenseMeasure',
        category: defense.defenseCategory,
        score: defense.coverageScore,
        status: defense.deploymentStatus,
        data: defense
      });
    });

    return entities;
  }, []);

  // 筛选和搜索
  const filteredEntities = useMemo(() => {
    return allEntities.filter(entity => {
      const matchType = selectedType === 'all' || entity.type === selectedType;
      const matchSearch = !searchText || 
        entity.name.toLowerCase().includes(searchText.toLowerCase()) ||
        entity.id.toLowerCase().includes(searchText.toLowerCase());
      return matchType && matchSearch;
    });
  }, [allEntities, selectedType, searchText]);

  // 统计数据
  const statistics = useMemo(() => {
    const stats = {
      total: allEntities.length,
      NetworkNode: 0,
      Vulnerability: 0,
      AttackTechnique: 0,
      ThreatActor: 0,
      DefenseMeasure: 0
    };
    allEntities.forEach(entity => {
      stats[entity.type]++;
    });
    return stats;
  }, [allEntities]);

  // 表格列定义
  const columns: ColumnsType<EntityItem> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: '本体类型',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type: OntologyType) => {
        const colorMap = {
          NetworkNode: 'blue',
          Vulnerability: 'orange',
          AttackTechnique: 'red',
          ThreatActor: 'cyan',
          DefenseMeasure: 'green'
        };
        return <Tag color={colorMap[type]}>{type}</Tag>;
      }
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (text) => text ? <Tag>{text}</Tag> : '-'
    },
    {
      title: '评分',
      dataIndex: 'score',
      key: 'score',
      width: 100,
      render: (score) => score !== undefined ? <Text>{score.toFixed(1)}</Text> : '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        if (!status) return '-';
        const colorMap: Record<string, string> = {
          online: 'success',
          active: 'success',
          patched: 'success',
          offline: 'default',
          unpatched: 'error',
          degraded: 'warning'
        };
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<SearchOutlined />}
            onClick={() => {
              setSelectedEntity(record);
              setDrawerVisible(true);
            }}
          >
            详情
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />}>编辑</Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
        </Space>
      )
    }
  ];

  // 渲染详情面板
  const renderEntityDetail = () => {
    if (!selectedEntity) return null;

    const { type, data } = selectedEntity;

    switch (type) {
      case 'NetworkNode':
        return (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="节点ID">{data.nodeId}</Descriptions.Item>
            <Descriptions.Item label="名称">{data.name}</Descriptions.Item>
            <Descriptions.Item label="节点类型">{data.nodeType}</Descriptions.Item>
            <Descriptions.Item label="设备分类">{data.deviceCategory}</Descriptions.Item>
            <Descriptions.Item label="安全域">{data.zone}</Descriptions.Item>
            <Descriptions.Item label="IPv4地址">{data.ipv4Address}</Descriptions.Item>
            <Descriptions.Item label="主机名">{data.hostname}</Descriptions.Item>
            <Descriptions.Item label="操作系统">{data.osType} - {data.osVersion}</Descriptions.Item>
            <Descriptions.Item label="补丁状态">{data.patchLevel}</Descriptions.Item>
            <Descriptions.Item label="攻击面评分">{data.attackSurface}</Descriptions.Item>
            <Descriptions.Item label="可利用性评分">{data.exploitabilityScore}</Descriptions.Item>
            <Descriptions.Item label="安全评分">{data.securityScore}</Descriptions.Item>
            <Descriptions.Item label="重要性级别">{data.criticalityLevel}</Descriptions.Item>
            <Descriptions.Item label="运行状态">{data.status}</Descriptions.Item>
            <Descriptions.Item label="开放端口">
              {data.openPorts?.map((port: any, idx: number) => (
                <div key={idx}>
                  {port.port}/{port.protocol} - {port.service} ({port.version})
                </div>
              ))}
            </Descriptions.Item>
          </Descriptions>
        );

      case 'Vulnerability':
        return (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="漏洞ID">{data.vulnId}</Descriptions.Item>
            <Descriptions.Item label="CVE编号">{data.cveId}</Descriptions.Item>
            <Descriptions.Item label="标题">{data.title}</Descriptions.Item>
            <Descriptions.Item label="描述">{data.description}</Descriptions.Item>
            <Descriptions.Item label="CVSS评分">{data.cvssScore} CRITICAL</Descriptions.Item>
            <Descriptions.Item label="CVSS向量">{data.cvssVector}</Descriptions.Item>
            <Descriptions.Item label="攻击向量">{data.attackVector}</Descriptions.Item>
            <Descriptions.Item label="攻击复杂度">{data.attackComplexity}</Descriptions.Item>
            <Descriptions.Item label="所需权限">{data.privilegesRequired}</Descriptions.Item>
            <Descriptions.Item label="用户交互">{data.userInteraction}</Descriptions.Item>
            <Descriptions.Item label="EPSS评分">{data.epssScore}</Descriptions.Item>
            <Descriptions.Item label="利用成熟度">{data.exploitMaturity}</Descriptions.Item>
            <Descriptions.Item label="KEV收录">{data.kevListed ? '是' : '否'}</Descriptions.Item>
            <Descriptions.Item label="在野利用">{data.inTheWild ? '是' : '否'}</Descriptions.Item>
            <Descriptions.Item label="修复状态">{data.remediationStatus}</Descriptions.Item>
            <Descriptions.Item label="补丁可用">{data.patchAvailable ? '是' : '否'}</Descriptions.Item>
          </Descriptions>
        );

      case 'AttackTechnique':
        return (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="技术ID">{data.techniqueId}</Descriptions.Item>
            <Descriptions.Item label="技术名称">{data.techniqueName}</Descriptions.Item>
            <Descriptions.Item label="战术ID">{data.tacticId}</Descriptions.Item>
            <Descriptions.Item label="战术名称">{data.tacticName}</Descriptions.Item>
            <Descriptions.Item label="Kill Chain阶段">{data.killChainPhase}</Descriptions.Item>
            <Descriptions.Item label="所需权限">{data.requiredPrivilege}</Descriptions.Item>
            <Descriptions.Item label="所需访问">{data.requiredAccess}</Descriptions.Item>
            <Descriptions.Item label="目标平台">{data.targetPlatforms?.join(', ')}</Descriptions.Item>
            <Descriptions.Item label="基础成功率">{(data.baseSuccessRate * 100).toFixed(0)}%</Descriptions.Item>
            <Descriptions.Item label="检测难度">{data.detectionDifficulty}</Descriptions.Item>
            <Descriptions.Item label="平均驻留时间">{data.avgDwellTime}秒</Descriptions.Item>
            <Descriptions.Item label="噪声级别">{data.noiseLevel}</Descriptions.Item>
            <Descriptions.Item label="横向移动能力">{data.lateralMovementCapable ? '是' : '否'}</Descriptions.Item>
            <Descriptions.Item label="持久化能力">{data.persistenceCapable ? '是' : '否'}</Descriptions.Item>
            <Descriptions.Item label="关联工具">{data.associatedTools?.join(', ')}</Descriptions.Item>
            <Descriptions.Item label="关联组织">{data.associatedGroups?.join(', ')}</Descriptions.Item>
          </Descriptions>
        );

      case 'ThreatActor':
        return (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="行为者ID">{data.actorId}</Descriptions.Item>
            <Descriptions.Item label="名称">{data.name}</Descriptions.Item>
            <Descriptions.Item label="别名">{data.aliases?.join(', ')}</Descriptions.Item>
            <Descriptions.Item label="ATT&CK组织ID">{data.attackGroupId}</Descriptions.Item>
            <Descriptions.Item label="行为者类型">{data.actorType}</Descriptions.Item>
            <Descriptions.Item label="复杂度级别">{data.sophisticationLevel}</Descriptions.Item>
            <Descriptions.Item label="资源水平">{data.resourceLevel}</Descriptions.Item>
            <Descriptions.Item label="主要动机">{data.primaryMotivation}</Descriptions.Item>
            <Descriptions.Item label="惯用技术">{data.ttpsUsed?.join(', ')}</Descriptions.Item>
            <Descriptions.Item label="目标行业">{data.targetSectors?.join(', ')}</Descriptions.Item>
            <Descriptions.Item label="目标国家">{data.targetCountries?.join(', ')}</Descriptions.Item>
            <Descriptions.Item label="惯用工具">{data.toolsUsed?.join(', ')}</Descriptions.Item>
            <Descriptions.Item label="攻击成功修正">{data.attackSuccessModifier}</Descriptions.Item>
            <Descriptions.Item label="隐蔽性修正">{data.stealthModifier}</Descriptions.Item>
            <Descriptions.Item label="首次发现年份">{data.firstSeenYear}</Descriptions.Item>
            <Descriptions.Item label="归因置信度">{data.attributionConfidence}</Descriptions.Item>
          </Descriptions>
        );

      case 'DefenseMeasure':
        return (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="措施ID">{data.measureId}</Descriptions.Item>
            <Descriptions.Item label="名称">{data.name}</Descriptions.Item>
            <Descriptions.Item label="ATT&CK缓解ID">{data.attackMitigationId}</Descriptions.Item>
            <Descriptions.Item label="D3FEND ID">{data.d3fendId}</Descriptions.Item>
            <Descriptions.Item label="防御类别">{data.defenseCategory}</Descriptions.Item>
            <Descriptions.Item label="控制类型">{data.controlType}</Descriptions.Item>
            <Descriptions.Item label="部署范围">{data.deploymentScope}</Descriptions.Item>
            <Descriptions.Item label="自动化级别">{data.automationLevel}</Descriptions.Item>
            <Descriptions.Item label="缓解技术">{data.mitigatedTechniques?.join(', ')}</Descriptions.Item>
            <Descriptions.Item label="成功率降低">{(data.successRateReduction * 100).toFixed(0)}%</Descriptions.Item>
            <Descriptions.Item label="检测率">{(data.detectionRate * 100).toFixed(0)}%</Descriptions.Item>
            <Descriptions.Item label="误报率">{data.falsePositiveRate ? (data.falsePositiveRate * 100).toFixed(0) + '%' : '-'}</Descriptions.Item>
            <Descriptions.Item label="响应时间">{data.responseTime}秒</Descriptions.Item>
            <Descriptions.Item label="覆盖评分">{data.coverageScore}</Descriptions.Item>
            <Descriptions.Item label="部署状态">{data.deploymentStatus}</Descriptions.Item>
            <Descriptions.Item label="部署节点">{data.deployedNodes?.join(', ')}</Descriptions.Item>
            <Descriptions.Item label="部署成本">{data.deploymentCost}</Descriptions.Item>
            <Descriptions.Item label="维护负担">{data.maintenanceBurden}</Descriptions.Item>
          </Descriptions>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ padding: 24 }}>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card>
            <Statistic title="总实体数" value={statistics.total} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="网络节点" value={statistics.NetworkNode} valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="漏洞" value={statistics.Vulnerability} valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="攻击技术" value={statistics.AttackTechnique} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="威胁行为者" value={statistics.ThreatActor} valueStyle={{ color: '#13c2c2' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="防御措施" value={statistics.DefenseMeasure} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
      </Row>

      {/* 工具栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Select
              style={{ width: 200 }}
              value={selectedType}
              onChange={setSelectedType}
              options={[
                { label: '全部类型', value: 'all' },
                { label: 'NetworkNode', value: 'NetworkNode' },
                { label: 'Vulnerability', value: 'Vulnerability' },
                { label: 'AttackTechnique', value: 'AttackTechnique' },
                { label: 'ThreatActor', value: 'ThreatActor' },
                { label: 'DefenseMeasure', value: 'DefenseMeasure' }
              ]}
            />
            <Search
              placeholder="搜索实体名称或ID"
              allowClear
              style={{ width: 300 }}
              onSearch={setSearchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Space>
          <Space>
            <Button
              type={viewMode === 'list' ? 'primary' : 'default'}
              icon={<UnorderedListOutlined />}
              onClick={() => setViewMode('list')}
            >
              列表视图
            </Button>
            <Button
              type={viewMode === 'card' ? 'primary' : 'default'}
              icon={<AppstoreOutlined />}
              onClick={() => setViewMode('card')}
            >
              卡片视图
            </Button>
            <Button type="primary" icon={<PlusOutlined />}>新增实体</Button>
          </Space>
        </Space>
      </Card>

      {/* 实体列表 */}
      <Card title={<Title level={5} style={{ margin: 0 }}>实体模型库 ({filteredEntities.length})</Title>}>
        {viewMode === 'list' ? (
          <Table
            columns={columns}
            dataSource={filteredEntities}
            rowKey="id"
            pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
          />
        ) : (
          <Row gutter={[16, 16]}>
            {filteredEntities.map(entity => (
              <Col key={entity.id} span={6}>
                <Card
                  hoverable
                  size="small"
                  title={<Text strong ellipsis>{entity.name}</Text>}
                  extra={<Tag color={entity.type === 'NetworkNode' ? 'blue' : entity.type === 'Vulnerability' ? 'orange' : entity.type === 'AttackTechnique' ? 'red' : entity.type === 'ThreatActor' ? 'cyan' : 'green'}>{entity.type}</Tag>}
                  onClick={() => {
                    setSelectedEntity(entity);
                    setDrawerVisible(true);
                  }}
                >
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>{entity.id}</Text>
                    {entity.category && <Tag>{entity.category}</Tag>}
                    {entity.score !== undefined && <Text>评分: {entity.score.toFixed(1)}</Text>}
                    {entity.status && <Tag color={entity.status === 'online' || entity.status === 'active' ? 'success' : 'default'}>{entity.status}</Tag>}
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {/* 详情抽屉 */}
      <Drawer
        title={selectedEntity ? `${selectedEntity.name} - 详情` : '实体详情'}
        placement="right"
        width={600}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {renderEntityDetail()}
      </Drawer>
    </div>
  );
};

export default EntityLibrary;

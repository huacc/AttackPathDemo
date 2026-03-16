import React, { useMemo, useState } from 'react';
import { Card, Col, Descriptions, Drawer, Row, Select, Space, Statistic, Table, Tag, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { ATTACK_DEFENSE_RELATIONS } from '../../mock/static/relations';
import type { RelationType } from '../../types/ontology';

const { Title, Text } = Typography;

type RelationTypeInfo = {
  type: RelationType;
  name: string;
  description: string;
  sourceOntology: string;
  targetOntology: string;
  color: string;
  stixType: string;
};

const RELATION_TYPES: RelationTypeInfo[] = [
  {
    type: 'exists_in',
    name: '存在于',
    description: '漏洞存在于节点上',
    sourceOntology: 'Vulnerability',
    targetOntology: 'NetworkNode',
    color: 'orange',
    stixType: 'related-to'
  },
  {
    type: 'exploits',
    name: '利用',
    description: '攻击技术利用漏洞',
    sourceOntology: 'AttackTechnique',
    targetOntology: 'Vulnerability',
    color: 'red',
    stixType: 'targets'
  },
  {
    type: 'targets',
    name: '针对',
    description: '攻击技术直接针对节点',
    sourceOntology: 'AttackTechnique',
    targetOntology: 'NetworkNode',
    color: 'volcano',
    stixType: 'targets'
  },
  {
    type: 'attributed_to',
    name: '归因于',
    description: '攻击路径归因于行为者',
    sourceOntology: 'AttackPath',
    targetOntology: 'ThreatActor',
    color: 'cyan',
    stixType: 'attributed-to'
  },
  {
    type: 'mitigates',
    name: '缓解',
    description: '防御措施缓解攻击技术',
    sourceOntology: 'DefenseMeasure',
    targetOntology: 'AttackTechnique',
    color: 'green',
    stixType: 'mitigates'
  },
  {
    type: 'deployed_on',
    name: '部署于',
    description: '防御措施部署在节点上',
    sourceOntology: 'DefenseMeasure',
    targetOntology: 'NetworkNode',
    color: 'lime',
    stixType: 'related-to'
  },
  {
    type: 'propagates_to',
    name: '传播至',
    description: '攻击从源节点传播到目标节点',
    sourceOntology: 'NetworkNode',
    targetOntology: 'NetworkNode',
    color: 'purple',
    stixType: 'related-to'
  }
];

// HJZB专有关系类型（扩展）
const HJZB_RELATIONS = [
  {
    type: 'communicates_with',
    name: '通信关系',
    description: '节点间的网络通信关系',
    sourceOntology: 'NetworkNode',
    targetOntology: 'NetworkNode',
    color: 'blue'
  },
  {
    type: 'depends_on',
    name: '业务依赖关系',
    description: '业务系统间的依赖关系',
    sourceOntology: 'NetworkNode',
    targetOntology: 'NetworkNode',
    color: 'geekblue'
  },
  {
    type: 'composed_of',
    name: '构成关系',
    description: '系统由多个组件构成',
    sourceOntology: 'NetworkNode',
    targetOntology: 'NetworkNode',
    color: 'purple'
  },
  {
    type: 'accesses',
    name: '访问关系',
    description: '用户或系统访问资源',
    sourceOntology: 'NetworkNode',
    targetOntology: 'NetworkNode',
    color: 'magenta'
  },
  {
    type: 'protects',
    name: '保护关系',
    description: '防御措施保护特定资产',
    sourceOntology: 'DefenseMeasure',
    targetOntology: 'NetworkNode',
    color: 'green'
  },
  {
    type: 'monitors',
    name: '监控关系',
    description: '监控系统监控目标节点',
    sourceOntology: 'NetworkNode',
    targetOntology: 'NetworkNode',
    color: 'cyan'
  }
];

const RelationshipLibrary: React.FC = () => {
  const [selectedRelationType, setSelectedRelationType] = useState<string>('all');
  const [selectedRelation, setSelectedRelation] = useState<any>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // 统计各类关系数量
  const statistics = useMemo(() => {
    const stats: Record<string, number> = {
      total: ATTACK_DEFENSE_RELATIONS.length
    };
    RELATION_TYPES.forEach(rt => {
      stats[rt.type] = ATTACK_DEFENSE_RELATIONS.filter(r => r.relationType === rt.type).length;
    });
    return stats;
  }, []);

  // 筛选关系
  const filteredRelations = useMemo(() => {
    if (selectedRelationType === 'all') {
      return ATTACK_DEFENSE_RELATIONS;
    }
    return ATTACK_DEFENSE_RELATIONS.filter(r => r.relationType === selectedRelationType);
  }, [selectedRelationType]);

  // 关系类型表格列
  const relationTypeColumns: ColumnsType<RelationTypeInfo> = [
    {
      title: '关系类型',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (text, record) => <Tag color={record.color}>{text}</Tag>
    },
    {
      title: '中文名称',
      dataIndex: 'name',
      key: 'name',
      width: 120
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 200
    },
    {
      title: '源本体',
      dataIndex: 'sourceOntology',
      key: 'sourceOntology',
      width: 150,
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: '目标本体',
      dataIndex: 'targetOntology',
      key: 'targetOntology',
      width: 150,
      render: (text) => <Tag color="cyan">{text}</Tag>
    },
    {
      title: 'STIX关系类型',
      dataIndex: 'stixType',
      key: 'stixType',
      width: 150,
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: '实例数量',
      key: 'count',
      width: 100,
      render: (_, record) => <Text strong>{statistics[record.type] || 0}</Text>
    }
  ];

  // 关系实例表格列
  const relationInstanceColumns: ColumnsType<any> = [
    {
      title: '关系ID',
      dataIndex: 'relationId',
      key: 'relationId',
      width: 120,
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: '关系类型',
      dataIndex: 'relationType',
      key: 'relationType',
      width: 150,
      render: (type: RelationType) => {
        const info = RELATION_TYPES.find(rt => rt.type === type);
        return <Tag color={info?.color}>{type}</Tag>;
      }
    },
    {
      title: '源对象ID',
      dataIndex: 'sourceId',
      key: 'sourceId',
      width: 150,
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: '目标对象ID',
      dataIndex: 'targetId',
      key: 'targetId',
      width: 150,
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: '置信度',
      dataIndex: 'confidence',
      key: 'confidence',
      width: 100,
      render: (confidence) => confidence ? `${(confidence * 100).toFixed(0)}%` : '-'
    },
    {
      title: '发现时间',
      dataIndex: 'discoveredAt',
      key: 'discoveredAt',
      width: 120
    },
    {
      title: '验证来源',
      dataIndex: 'validatedBy',
      key: 'validatedBy',
      width: 150,
      render: (text) => <Tag>{text}</Tag>
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <a
          onClick={() => {
            setSelectedRelation(record);
            setDrawerVisible(true);
          }}
        >
          <SearchOutlined /> 详情
        </a>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={3}>
          <Card>
            <Statistic title="总关系数" value={statistics.total} />
          </Card>
        </Col>
        {RELATION_TYPES.map(rt => (
          <Col key={rt.type} span={3}>
            <Card>
              <Statistic
                title={rt.name}
                value={statistics[rt.type] || 0}
                valueStyle={{ color: `var(--ant-${rt.color}-6)` }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 核心关系类型 */}
      <Card title={<Title level={5} style={{ margin: 0 }}>7种核心关系类型</Title>} style={{ marginBottom: 16 }}>
        <Table
          columns={relationTypeColumns}
          dataSource={RELATION_TYPES}
          rowKey="type"
          pagination={false}
          size="small"
        />
      </Card>

      {/* HJZB专有关系类型 */}
      <Card title={<Title level={5} style={{ margin: 0 }}>HJZB专有关系类型 (≥6种)</Title>} style={{ marginBottom: 16 }}>
        <Table
          columns={[
            {
              title: '关系类型',
              dataIndex: 'type',
              key: 'type',
              width: 200,
              render: (text, record) => <Tag color={record.color}>{text}</Tag>
            },
            {
              title: '中文名称',
              dataIndex: 'name',
              key: 'name',
              width: 150
            },
            {
              title: '描述',
              dataIndex: 'description',
              key: 'description'
            },
            {
              title: '源本体',
              dataIndex: 'sourceOntology',
              key: 'sourceOntology',
              width: 150,
              render: (text) => <Tag color="blue">{text}</Tag>
            },
            {
              title: '目标本体',
              dataIndex: 'targetOntology',
              key: 'targetOntology',
              width: 150,
              render: (text) => <Tag color="cyan">{text}</Tag>
            }
          ]}
          dataSource={HJZB_RELATIONS}
          rowKey="type"
          pagination={false}
          size="small"
        />
      </Card>

      {/* 关系实例列表 */}
      <Card
        title={<Title level={5} style={{ margin: 0 }}>关系实例列表 ({filteredRelations.length})</Title>}
        extra={
          <Select
            style={{ width: 200 }}
            value={selectedRelationType}
            onChange={setSelectedRelationType}
            options={[
              { label: '全部关系', value: 'all' },
              ...RELATION_TYPES.map(rt => ({ label: rt.name, value: rt.type }))
            ]}
          />
        }
      >
        <Table
          columns={relationInstanceColumns}
          dataSource={filteredRelations}
          rowKey="relationId"
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
          size="small"
        />
      </Card>

      {/* 详情抽屉 */}
      <Drawer
        title="关系详情"
        placement="right"
        width={500}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {selectedRelation && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="关系ID">{selectedRelation.relationId}</Descriptions.Item>
            <Descriptions.Item label="关系类型">
              <Tag color={RELATION_TYPES.find(rt => rt.type === selectedRelation.relationType)?.color}>
                {selectedRelation.relationType}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="源对象ID">{selectedRelation.sourceId}</Descriptions.Item>
            <Descriptions.Item label="目标对象ID">{selectedRelation.targetId}</Descriptions.Item>
            <Descriptions.Item label="置信度">
              {selectedRelation.confidence ? `${(selectedRelation.confidence * 100).toFixed(0)}%` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="发现时间">{selectedRelation.discoveredAt}</Descriptions.Item>
            <Descriptions.Item label="验证来源">{selectedRelation.validatedBy}</Descriptions.Item>
            {selectedRelation.metadata && (
              <Descriptions.Item label="元数据">
                <pre style={{ fontSize: 12 }}>{JSON.stringify(selectedRelation.metadata, null, 2)}</pre>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default RelationshipLibrary;

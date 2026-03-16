import React, { useState } from 'react';
import { Card, Collapse, Descriptions, Select, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Panel } = Collapse;

type UIState = 'display' | 'detail' | 'editable';

type PropertyDef = {
  name: string;
  type: string;
  uiState: UIState[];
  description: string;
  standard: string;
};

type OntologyDef = {
  name: string;
  code: string;
  color: string;
  properties: PropertyDef[];
};

const ONTOLOGY_DEFINITIONS: OntologyDef[] = [
  {
    name: '网络节点本体',
    code: 'NetworkNode',
    color: 'blue',
    properties: [
      { name: 'nodeId', type: 'string', uiState: ['display'], description: '节点唯一标识', standard: '内部' },
      { name: 'name', type: 'string', uiState: ['display', 'editable'], description: '节点名称', standard: '内部' },
      { name: 'nodeType', type: 'enum', uiState: ['display', 'editable'], description: 'hardware/software', standard: '内部' },
      { name: 'deviceCategory', type: 'enum', uiState: ['display', 'editable'], description: '设备分类', standard: 'CybOX System Object' },
      { name: 'cpe', type: 'string', uiState: ['detail'], description: 'CPE 2.3标准命名', standard: 'NVD/CPE' },
      { name: 'zone', type: 'enum', uiState: ['display', 'editable'], description: '安全域', standard: '内部' },
      { name: 'ipv4Address', type: 'string', uiState: ['display', 'editable'], description: 'IPv4地址', standard: 'RFC 4632' },
      { name: 'hostname', type: 'string', uiState: ['display', 'editable'], description: 'FQDN主机名', standard: 'RFC 1123' },
      { name: 'macAddress', type: 'string', uiState: ['detail'], description: 'MAC地址', standard: 'IEEE 802' },
      { name: 'vlanId', type: 'number', uiState: ['detail', 'editable'], description: 'VLAN ID', standard: 'IEEE 802.1Q' },
      { name: 'openPorts', type: 'array', uiState: ['detail', 'editable'], description: '开放端口列表', standard: 'IANA Port Numbers' },
      { name: 'osType', type: 'enum', uiState: ['display', 'editable'], description: '操作系统类型', standard: 'CybOX OS' },
      { name: 'osVersion', type: 'string', uiState: ['detail', 'editable'], description: 'OS版本', standard: 'CPE' },
      { name: 'patchLevel', type: 'enum', uiState: ['display'], description: '补丁状态', standard: '内部' },
      { name: 'attackSurface', type: 'number', uiState: ['display'], description: '攻击面评分0-100', standard: '内部计算' },
      { name: 'exploitabilityScore', type: 'number', uiState: ['display'], description: '可利用性评分0-10', standard: 'CVSS v3.1' },
      { name: 'securityScore', type: 'number', uiState: ['display'], description: '综合安全评分0-100', standard: '内部计算' },
      { name: 'criticalityLevel', type: 'enum', uiState: ['display', 'editable'], description: '资产重要性', standard: '内部' },
      { name: 'status', type: 'enum', uiState: ['display'], description: '运行状态', standard: '内部' }
    ]
  },
  {
    name: '漏洞本体',
    code: 'Vulnerability',
    color: 'orange',
    properties: [
      { name: 'vulnId', type: 'string', uiState: ['display'], description: '内部唯一标识', standard: '内部' },
      { name: 'cveId', type: 'string', uiState: ['display'], description: 'CVE编号', standard: 'NVD/CVE' },
      { name: 'cweId', type: 'string', uiState: ['detail'], description: 'CWE弱点类型', standard: 'MITRE CWE' },
      { name: 'title', type: 'string', uiState: ['display'], description: '漏洞标题', standard: 'NVD' },
      { name: 'cvssScore', type: 'number', uiState: ['display'], description: 'CVSS v3.1基础评分', standard: 'CVSS v3.1' },
      { name: 'cvssVector', type: 'string', uiState: ['detail'], description: 'CVSS向量字符串', standard: 'CVSS v3.1' },
      { name: 'attackVector', type: 'enum', uiState: ['display'], description: '攻击向量', standard: 'CVSS v3.1 AV' },
      { name: 'attackComplexity', type: 'enum', uiState: ['display'], description: '攻击复杂度', standard: 'CVSS v3.1 AC' },
      { name: 'exploitabilityScore', type: 'number', uiState: ['display'], description: 'CVSS可利用性子评分', standard: 'CVSS v3.1' },
      { name: 'impactScore', type: 'number', uiState: ['display'], description: 'CVSS影响子评分', standard: 'CVSS v3.1' },
      { name: 'epssScore', type: 'number', uiState: ['display'], description: 'EPSS利用预测评分', standard: 'EPSS' },
      { name: 'exploitMaturity', type: 'enum', uiState: ['display', 'editable'], description: '利用成熟度', standard: 'CVSS v3.1 E' },
      { name: 'kevListed', type: 'boolean', uiState: ['display'], description: 'CISA KEV收录', standard: 'CISA KEV' },
      { name: 'inTheWild', type: 'boolean', uiState: ['display'], description: '在野利用记录', standard: '内部' },
      { name: 'remediationStatus', type: 'enum', uiState: ['display', 'editable'], description: '修复状态', standard: '内部' },
      { name: 'patchAvailable', type: 'boolean', uiState: ['display'], description: '是否有官方补丁', standard: 'NVD' }
    ]
  },
  {
    name: '攻击技术本体',
    code: 'AttackTechnique',
    color: 'red',
    properties: [
      { name: 'techniqueId', type: 'string', uiState: ['display'], description: 'ATT&CK技术ID', standard: 'ATT&CK' },
      { name: 'techniqueName', type: 'string', uiState: ['display'], description: '技术名称', standard: 'ATT&CK' },
      { name: 'tacticId', type: 'string', uiState: ['display'], description: '所属战术ID', standard: 'ATT&CK' },
      { name: 'tacticName', type: 'string', uiState: ['display'], description: '战术名称', standard: 'ATT&CK' },
      { name: 'killChainPhase', type: 'enum', uiState: ['display'], description: 'Kill Chain阶段', standard: 'Cyber Kill Chain' },
      { name: 'requiredPrivilege', type: 'enum', uiState: ['display'], description: '执行所需权限', standard: 'ATT&CK' },
      { name: 'requiredAccess', type: 'enum', uiState: ['display'], description: '所需访问类型', standard: 'ATT&CK' },
      { name: 'targetPlatforms', type: 'array', uiState: ['display'], description: '目标平台', standard: 'ATT&CK' },
      { name: 'baseSuccessRate', type: 'number', uiState: ['display', 'editable'], description: '基础成功率0-1', standard: '内部' },
      { name: 'detectionDifficulty', type: 'enum', uiState: ['display', 'editable'], description: '检测难度', standard: '内部' },
      { name: 'avgDwellTime', type: 'number', uiState: ['detail', 'editable'], description: '平均驻留时间(秒)', standard: '内部' },
      { name: 'noiseLevel', type: 'enum', uiState: ['detail', 'editable'], description: '噪声级别', standard: '内部' },
      { name: 'lateralMovementCapable', type: 'boolean', uiState: ['detail'], description: '是否支持横向移动', standard: '内部' },
      { name: 'persistenceCapable', type: 'boolean', uiState: ['detail'], description: '是否能建立持久化', standard: '内部' },
      { name: 'associatedTools', type: 'array', uiState: ['detail'], description: '关联工具列表', standard: 'ATT&CK Software' },
      { name: 'mitigations', type: 'array', uiState: ['detail'], description: 'ATT&CK缓解措施ID', standard: 'ATT&CK Mitigations' }
    ]
  },
  {
    name: '威胁行为者本体',
    code: 'ThreatActor',
    color: 'cyan',
    properties: [
      { name: 'actorId', type: 'string', uiState: ['display'], description: '内部唯一标识', standard: '内部' },
      { name: 'name', type: 'string', uiState: ['display'], description: '威胁行为者名称', standard: 'STIX 2.1' },
      { name: 'aliases', type: 'array', uiState: ['detail'], description: '别名列表', standard: 'ATT&CK Groups' },
      { name: 'attackGroupId', type: 'string', uiState: ['detail'], description: 'ATT&CK Groups ID', standard: 'ATT&CK' },
      { name: 'actorType', type: 'enum', uiState: ['display'], description: '行为者类型', standard: 'STIX 2.1' },
      { name: 'sophisticationLevel', type: 'enum', uiState: ['display'], description: '技术复杂度', standard: 'STIX 2.1' },
      { name: 'resourceLevel', type: 'enum', uiState: ['display'], description: '资源水平', standard: 'STIX 2.1' },
      { name: 'primaryMotivation', type: 'enum', uiState: ['display'], description: '主要动机', standard: 'STIX 2.1' },
      { name: 'ttpsUsed', type: 'array', uiState: ['detail'], description: '惯用ATT&CK技术ID', standard: 'ATT&CK Groups' },
      { name: 'targetSectors', type: 'array', uiState: ['detail'], description: '攻击目标行业', standard: 'ATT&CK Groups' },
      { name: 'toolsUsed', type: 'array', uiState: ['detail'], description: '惯用工具', standard: 'ATT&CK Software' },
      { name: 'attackSuccessModifier', type: 'number', uiState: ['editable'], description: '攻击成功率修正系数', standard: '内部' },
      { name: 'stealthModifier', type: 'number', uiState: ['editable'], description: '隐蔽性修正系数', standard: '内部' },
      { name: 'attributionConfidence', type: 'enum', uiState: ['detail'], description: '归因置信度', standard: '内部' }
    ]
  },
  {
    name: '防御措施本体',
    code: 'DefenseMeasure',
    color: 'green',
    properties: [
      { name: 'measureId', type: 'string', uiState: ['display'], description: '内部唯一标识', standard: '内部' },
      { name: 'name', type: 'string', uiState: ['display', 'editable'], description: '防御措施名称', standard: '内部' },
      { name: 'attackMitigationId', type: 'string', uiState: ['display'], description: 'ATT&CK Mitigation ID', standard: 'ATT&CK' },
      { name: 'd3fendId', type: 'string', uiState: ['detail'], description: 'D3FEND技术ID', standard: 'D3FEND v1.0' },
      { name: 'defenseCategory', type: 'enum', uiState: ['display'], description: 'D3FEND防御类别', standard: 'D3FEND v1.0' },
      { name: 'controlType', type: 'enum', uiState: ['display'], description: '控制类型', standard: '安全控制框架' },
      { name: 'deploymentScope', type: 'enum', uiState: ['display', 'editable'], description: '部署范围', standard: '内部' },
      { name: 'mitigatedTechniques', type: 'array', uiState: ['display'], description: '可缓解的ATT&CK技术ID', standard: 'ATT&CK Mitigations' },
      { name: 'successRateReduction', type: 'number', uiState: ['display', 'editable'], description: '攻击成功率降低幅度', standard: '内部' },
      { name: 'detectionRate', type: 'number', uiState: ['display', 'editable'], description: '检测率0-1', standard: '内部' },
      { name: 'falsePositiveRate', type: 'number', uiState: ['detail', 'editable'], description: '误报率0-1', standard: '内部' },
      { name: 'responseTime', type: 'number', uiState: ['detail', 'editable'], description: '响应时间(秒)', standard: '内部' },
      { name: 'coverageScore', type: 'number', uiState: ['display'], description: '防御覆盖评分0-100', standard: '内部计算' },
      { name: 'deploymentStatus', type: 'enum', uiState: ['display', 'editable'], description: '部署状态', standard: '内部' },
      { name: 'deployedNodes', type: 'array', uiState: ['detail'], description: '已部署的节点ID列表', standard: '内部' }
    ]
  },
  {
    name: '攻防关系本体',
    code: 'AttackDefenseRelation',
    color: 'purple',
    properties: [
      { name: 'relationId', type: 'string', uiState: ['detail'], description: '关系唯一标识', standard: '内部' },
      { name: 'relationType', type: 'enum', uiState: ['display'], description: '关系类型(7种)', standard: '内部' },
      { name: 'sourceId', type: 'string', uiState: ['detail'], description: '源对象ID', standard: '内部' },
      { name: 'targetId', type: 'string', uiState: ['detail'], description: '目标对象ID', standard: '内部' },
      { name: 'effectivenessScore', type: 'number', uiState: ['display'], description: '关系效能评分0-100', standard: '内部' },
      { name: 'conditionExpression', type: 'string', uiState: ['detail'], description: '关系生效条件', standard: '内部' },
      { name: 'validatedBy', type: 'string', uiState: ['detail'], description: '验证来源', standard: '内部' }
    ]
  }
];

const PropertyConfig: React.FC = () => {
  const [selectedOntology, setSelectedOntology] = useState<string>('NetworkNode');

  const currentOntology = ONTOLOGY_DEFINITIONS.find(o => o.code === selectedOntology);

  const columns: ColumnsType<PropertyDef> = [
    {
      title: '属性名',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (text) => <Tag color="geekblue">{text}</Tag>
    },
    {
      title: '界面状态',
      dataIndex: 'uiState',
      key: 'uiState',
      width: 200,
      render: (states: UIState[]) => (
        <Space size="small">
          {states.includes('display') && <Tag color="blue">[显示]</Tag>}
          {states.includes('detail') && <Tag color="cyan">[详情]</Tag>}
          {states.includes('editable') && <Tag color="green">[编辑]</Tag>}
        </Space>
      )
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
      width: 250
    },
    {
      title: '标准来源',
      dataIndex: 'standard',
      key: 'standard',
      width: 150,
      render: (text) => <Tag>{text}</Tag>
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={<Title level={5} style={{ margin: 0 }}>本体属性配置管理</Title>}
        extra={
          <Select
            style={{ width: 250 }}
            value={selectedOntology}
            onChange={setSelectedOntology}
            options={ONTOLOGY_DEFINITIONS.map(o => ({
              label: `${o.name} (${o.code})`,
              value: o.code
            }))}
          />
        }
      >
        {currentOntology && (
          <>
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Tag color={currentOntology.color} style={{ fontSize: 14, padding: '4px 12px' }}>
                  {currentOntology.code}
                </Tag>
                <Text type="secondary">共 {currentOntology.properties.length} 个属性</Text>
              </Space>
            </div>
            <Table
              columns={columns}
              dataSource={currentOntology.properties}
              rowKey="name"
              pagination={false}
              size="small"
            />
          </>
        )}
      </Card>

      {/* 界面状态说明 */}
      <Card title={<Title level={5} style={{ margin: 0 }}>界面状态说明</Title>} style={{ marginTop: 16 }}>
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="[显示]">
            在沙盘/列表中直接可见的属性,用于快速识别和评估
          </Descriptions.Item>
          <Descriptions.Item label="[详情]">
            点击节点后在详情面板可见的属性,提供更详细的信息
          </Descriptions.Item>
          <Descriptions.Item label="[编辑]">
            用户可在界面上修改的属性,支持交互式配置
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 本体设计原则 */}
      <Card title={<Title level={5} style={{ margin: 0 }}>本体设计原则</Title>} style={{ marginTop: 16 }}>
        <Collapse>
          <Panel header="1. 抽象归一原则" key="1">
            <Text>同一类事物抽象为一个本体,用枚举属性区分具体类型,而非每种类型建一个本体。</Text>
          </Panel>
          <Panel header="2. 领域语义原则" key="2">
            <Text>每个本体的属性必须具备网络安全领域的语义,属性值来自网络安全标准(CVE/CVSS/CPE/ATT&CK ID/D3FEND ID等)。</Text>
          </Panel>
          <Panel header="3. 界面可见性原则" key="3">
            <Text>每个属性标注三种界面状态:[显示]、[详情]、[编辑],确保用户体验和数据管理的平衡。</Text>
          </Panel>
        </Collapse>
      </Card>
    </div>
  );
};

export default PropertyConfig;

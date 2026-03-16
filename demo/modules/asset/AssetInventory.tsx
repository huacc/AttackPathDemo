import React, { useState, useMemo } from 'react';
import { Card, Table, Button, Space, Tag, Input, Select, Modal, message, Drawer, Descriptions, Statistic, Row, Col } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  UploadOutlined,
  SearchOutlined,
  EyeOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { NetworkNode, Zone, DeviceCategory } from '../../types/ontology';
import { NETWORK_NODES } from '../../mock/static/networkNodes';

const { Search } = Input;

/**
 * 资产清单页面
 * 表格视图展示所有资产，支持搜索/筛选/分页/导入/导出
 */
export const AssetInventory: React.FC = () => {
  const [assets, setAssets] = useState<NetworkNode[]>([...NETWORK_NODES]);
  const [selectedZone, setSelectedZone] = useState<Zone | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<DeviceCategory | 'all'>('all');
  const [searchText, setSearchText] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<NetworkNode | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);

  // 筛选资产
  const filteredAssets = useMemo(() => {
    let filtered = [...assets];

    if (selectedZone !== 'all') {
      filtered = filtered.filter(a => a.zone === selectedZone);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.deviceCategory === selectedCategory);
    }

    if (searchText) {
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(searchText.toLowerCase()) ||
        a.ipv4Address?.toLowerCase().includes(searchText.toLowerCase()) ||
        a.hostname?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return filtered;
  }, [assets, selectedZone, selectedCategory, searchText]);

  // 统计数据
  const statistics = useMemo(() => {
    const total = assets.length;
    const byZone = {
      external: assets.filter(a => a.zone === 'external').length,
      dmz: assets.filter(a => a.zone === 'dmz').length,
      intranet: assets.filter(a => a.zone === 'intranet').length,
      cloud: assets.filter(a => a.zone === 'cloud').length
    };
    const byStatus = {
      online: assets.filter(a => a.status === 'online').length,
      offline: assets.filter(a => a.status === 'offline').length,
      degraded: assets.filter(a => a.status === 'degraded').length,
      compromised: assets.filter(a => a.status === 'compromised').length
    };
    const avgSecurityScore = assets.reduce((sum, a) => sum + (a.securityScore || 0), 0) / total;
    const criticalAssets = assets.filter(a => a.criticalityLevel === 'critical').length;

    return { total, byZone, byStatus, avgSecurityScore, criticalAssets };
  }, [assets]);

  // 获取安全域标签
  const getZoneTag = (zone: Zone) => {
    const config: Record<Zone, { color: string; label: string }> = {
      external: { color: 'red', label: '外网' },
      dmz: { color: 'orange', label: 'DMZ' },
      intranet: { color: 'blue', label: '内网' },
      cloud: { color: 'purple', label: '云端' }
    };
    const { color, label } = config[zone];
    return <Tag color={color}>{label}</Tag>;
  };

  // 获取状态标签
  const getStatusTag = (status?: string) => {
    const config: Record<string, { color: string; label: string }> = {
      online: { color: 'green', label: '在线' },
      offline: { color: 'default', label: '离线' },
      degraded: { color: 'orange', label: '降级' },
      compromised: { color: 'red', label: '失陷' }
    };
    const { color, label } = config[status || 'offline'];
    return <Tag color={color}>{label}</Tag>;
  };

  // 获取重要性标签
  const getCriticalityTag = (level?: string) => {
    const config: Record<string, { color: string; label: string }> = {
      critical: { color: 'red', label: '关键' },
      high: { color: 'orange', label: '高' },
      medium: { color: 'blue', label: '中' },
      low: { color: 'green', label: '低' }
    };
    const { color, label } = config[level || 'low'];
    return <Tag color={color}>{label}</Tag>;
  };

  // 表格列定义
  const columns: ColumnsType<NetworkNode> = [
    {
      title: '资产名称',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 180,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <Button type="link" onClick={() => handleViewDetail(record)}>
          {text}
        </Button>
      )
    },
    {
      title: 'IP地址',
      dataIndex: 'ipv4Address',
      key: 'ipv4Address',
      width: 150,
      render: (text) => text?.split('/')[0] || '-'
    },
    {
      title: '主机名',
      dataIndex: 'hostname',
      key: 'hostname',
      width: 180
    },
    {
      title: '设备类型',
      dataIndex: 'deviceCategory',
      key: 'deviceCategory',
      width: 120,
      filters: [
        { text: '服务器', value: 'server' },
        { text: '路由器', value: 'router' },
        { text: '交换机', value: 'switch' },
        { text: '防火墙', value: 'firewall' },
        { text: '负载均衡', value: 'load_balancer' },
        { text: '终端', value: 'endpoint' },
        { text: '数据库', value: 'database' },
        { text: 'Web应用', value: 'web_application' }
      ],
      onFilter: (value, record) => record.deviceCategory === value
    },
    {
      title: '安全域',
      dataIndex: 'zone',
      key: 'zone',
      width: 100,
      render: (zone) => getZoneTag(zone)
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status)
    },
    {
      title: '重要性',
      dataIndex: 'criticalityLevel',
      key: 'criticalityLevel',
      width: 100,
      render: (level) => getCriticalityTag(level)
    },
    {
      title: '安全评分',
      dataIndex: 'securityScore',
      key: 'securityScore',
      width: 120,
      sorter: (a, b) => (a.securityScore || 0) - (b.securityScore || 0),
      render: (score) => (
        <Tag color={score >= 80 ? 'green' : score >= 60 ? 'orange' : 'red'}>
          {score || 0}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  // 查看详情
  const handleViewDetail = (asset: NetworkNode) => {
    setSelectedAsset(asset);
    setDetailVisible(true);
  };

  // 编辑资产
  const handleEdit = (asset: NetworkNode) => {
    message.info(`编辑资产功能开发中: ${asset.name}`);
  };

  // 删除资产
  const handleDelete = (asset: NetworkNode) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除资产 "${asset.name}" 吗？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        setAssets(assets.filter(a => a.nodeId !== asset.nodeId));
        message.success('资产已删除');
      }
    });
  };

  // 导出资产
  const handleExport = (format: 'json' | 'csv') => {
    if (format === 'json') {
      const dataStr = JSON.stringify(filteredAssets, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `assets_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      message.success('资产已导出为JSON');
    } else {
      // CSV导出
      const headers = ['资产名称', 'IP地址', '主机名', '设备类型', '安全域', '状态', '安全评分'];
      const rows = filteredAssets.map(a => [
        a.name,
        a.ipv4Address?.split('/')[0] || '',
        a.hostname || '',
        a.deviceCategory,
        a.zone,
        a.status || '',
        a.securityScore?.toString() || ''
      ]);
      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `assets_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      message.success('资产已导出为CSV');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <Space>
            <span>资产清单</span>
            <Tag color="blue">{filteredAssets.length} 个资产</Tag>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<BarChartOutlined />} onClick={() => setStatsVisible(true)}>
              统计分析
            </Button>
            <Button icon={<UploadOutlined />}>导入</Button>
            <Button.Group>
              <Button icon={<DownloadOutlined />} onClick={() => handleExport('json')}>
                导出JSON
              </Button>
              <Button icon={<DownloadOutlined />} onClick={() => handleExport('csv')}>
                导出CSV
              </Button>
            </Button.Group>
            <Button type="primary" icon={<PlusOutlined />}>
              新增资产
            </Button>
          </Space>
        }
      >
        {/* 筛选栏 */}
        <Space style={{ marginBottom: '16px', width: '100%' }} size="middle" wrap>
          <Search
            placeholder="搜索资产名称、IP或主机名"
            allowClear
            style={{ width: 300 }}
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
          />
          <Select
            style={{ width: 150 }}
            placeholder="选择安全域"
            value={selectedZone}
            onChange={setSelectedZone}
          >
            <Select.Option value="all">全部安全域</Select.Option>
            <Select.Option value="external">外网</Select.Option>
            <Select.Option value="dmz">DMZ</Select.Option>
            <Select.Option value="intranet">内网</Select.Option>
            <Select.Option value="cloud">云端</Select.Option>
          </Select>
          <Select
            style={{ width: 150 }}
            placeholder="选择设备类型"
            value={selectedCategory}
            onChange={setSelectedCategory}
          >
            <Select.Option value="all">全部类型</Select.Option>
            <Select.Option value="server">服务器</Select.Option>
            <Select.Option value="router">路由器</Select.Option>
            <Select.Option value="switch">交换机</Select.Option>
            <Select.Option value="firewall">防火墙</Select.Option>
            <Select.Option value="database">数据库</Select.Option>
            <Select.Option value="web_application">Web应用</Select.Option>
          </Select>
        </Space>

        {/* 资产表格 */}
        <Table
          columns={columns}
          dataSource={filteredAssets}
          rowKey="nodeId"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个资产`
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* 资产详情抽屉 */}
      <Drawer
        title={`资产详情 - ${selectedAsset?.name}`}
        placement="right"
        width={600}
        onClose={() => setDetailVisible(false)}
        open={detailVisible}
      >
        {selectedAsset && (
          <div>
            <Descriptions title="基本信息" bordered column={1} size="small">
              <Descriptions.Item label="资产ID">{selectedAsset.nodeId}</Descriptions.Item>
              <Descriptions.Item label="资产名称">{selectedAsset.name}</Descriptions.Item>
              <Descriptions.Item label="设备类型">{selectedAsset.deviceCategory}</Descriptions.Item>
              <Descriptions.Item label="安全域">{getZoneTag(selectedAsset.zone)}</Descriptions.Item>
              <Descriptions.Item label="状态">{getStatusTag(selectedAsset.status)}</Descriptions.Item>
              <Descriptions.Item label="重要性">{getCriticalityTag(selectedAsset.criticalityLevel)}</Descriptions.Item>
            </Descriptions>

            <Descriptions title="网络信息" bordered column={1} size="small" style={{ marginTop: '16px' }}>
              <Descriptions.Item label="IPv4地址">{selectedAsset.ipv4Address}</Descriptions.Item>
              <Descriptions.Item label="主机名">{selectedAsset.hostname}</Descriptions.Item>
              <Descriptions.Item label="MAC地址">{selectedAsset.macAddress || '-'}</Descriptions.Item>
              <Descriptions.Item label="VLAN ID">{selectedAsset.vlanId || '-'}</Descriptions.Item>
            </Descriptions>

            <Descriptions title="安全态势" bordered column={1} size="small" style={{ marginTop: '16px' }}>
              <Descriptions.Item label="安全评分">
                <Tag color={selectedAsset.securityScore >= 80 ? 'green' : selectedAsset.securityScore >= 60 ? 'orange' : 'red'}>
                  {selectedAsset.securityScore}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="攻击面">{selectedAsset.attackSurface}</Descriptions.Item>
              <Descriptions.Item label="可利用性评分">{selectedAsset.exploitabilityScore}</Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: '16px' }}>
              <h4>开放服务</h4>
              {selectedAsset.openPorts.map((service, index) => (
                <Tag key={index} style={{ marginBottom: '8px' }}>
                  {service.port}/{service.protocol} - {service.service} {service.version}
                </Tag>
              ))}
            </div>
          </div>
        )}
      </Drawer>

      {/* 统计分析抽屉 */}
      <Drawer
        title="资产统计分析"
        placement="right"
        width={500}
        onClose={() => setStatsVisible(false)}
        open={statsVisible}
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card>
              <Statistic title="资产总数" value={statistics.total} />
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Statistic title="关键资产" value={statistics.criticalAssets} valueStyle={{ color: '#cf1322' }} />
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Statistic title="平均安全评分" value={statistics.avgSecurityScore.toFixed(1)} precision={1} />
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Statistic title="在线资产" value={statistics.byStatus.online} valueStyle={{ color: '#3f8600' }} />
            </Card>
          </Col>
        </Row>

        <Card title="按安全域分布" style={{ marginTop: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>外网:</span>
              <Tag color="red">{statistics.byZone.external}</Tag>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>DMZ:</span>
              <Tag color="orange">{statistics.byZone.dmz}</Tag>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>内网:</span>
              <Tag color="blue">{statistics.byZone.intranet}</Tag>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>云端:</span>
              <Tag color="purple">{statistics.byZone.cloud}</Tag>
            </div>
          </Space>
        </Card>

        <Card title="按状态分布" style={{ marginTop: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>在线:</span>
              <Tag color="green">{statistics.byStatus.online}</Tag>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>离线:</span>
              <Tag>{statistics.byStatus.offline}</Tag>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>降级:</span>
              <Tag color="orange">{statistics.byStatus.degraded}</Tag>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>失陷:</span>
              <Tag color="red">{statistics.byStatus.compromised}</Tag>
            </div>
          </Space>
        </Card>
      </Drawer>
    </div>
  );
};

export default AssetInventory;

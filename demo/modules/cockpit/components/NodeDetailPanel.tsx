import React from 'react';
import { Drawer, Descriptions, Tag, Space, Button, Tooltip, Divider } from 'antd';
import {
  InfoCircleOutlined,
  EditOutlined,
  BugOutlined,
  LinkOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { NetworkNode } from '../../../types/ontology';
import { getStatusLabel, getStatusColor } from './NodeRenderer';

interface NodeDetailPanelProps {
  visible: boolean;
  node: NetworkNode | null;
  onClose: () => void;
  onEdit?: (nodeId: string) => void;
  onViewVulnerabilities?: (nodeId: string) => void;
  onViewRelations?: (nodeId: string) => void;
}

/**
 * 节点详情面板组件
 * 展示《本体规范》三·3.3中定义的全部详情信息（5个维度）
 */
export const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({
  visible,
  node,
  onClose,
  onEdit,
  onViewVulnerabilities,
  onViewRelations
}) => {
  if (!node) return null;

  // 获取设备类型中文名
  const getDeviceCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      server: '服务器',
      router: '路由器',
      switch: '交换机',
      firewall: '防火墙',
      load_balancer: '负载均衡器',
      endpoint: '终端设备',
      iot_device: '物联网设备',
      web_application: 'Web应用',
      database: '数据库',
      middleware: '中间件',
      container: '容器',
      api_gateway: 'API网关',
      domain_controller: '域控制器'
    };
    return labels[category] || category;
  };

  // 获取重要性等级标签
  const getCriticalityTag = (level: string) => {
    const config: Record<string, { color: string; label: string }> = {
      critical: { color: 'red', label: '关键' },
      high: { color: 'orange', label: '高' },
      medium: { color: 'blue', label: '中' },
      low: { color: 'green', label: '低' }
    };
    const { color, label } = config[level] || { color: 'default', label: level };
    return <Tag color={color}>{label}</Tag>;
  };

  // 获取补丁状态标签
  const getPatchLevelTag = (level: string) => {
    const config: Record<string, { color: string; label: string }> = {
      up_to_date: { color: 'green', label: '最新' },
      outdated: { color: 'orange', label: '过时' },
      eol: { color: 'red', label: '停止支持' },
      unknown: { color: 'default', label: '未知' }
    };
    const { color, label } = config[level] || { color: 'default', label: level };
    return <Tag color={color}>{label}</Tag>;
  };

  // 获取合规状态标签
  const getComplianceTag = (status?: string) => {
    if (!status) return <Tag>未知</Tag>;
    const config: Record<string, { color: string; label: string }> = {
      compliant: { color: 'green', label: '合规' },
      non_compliant: { color: 'red', label: '不合规' },
      partial: { color: 'orange', label: '部分合规' },
      unknown: { color: 'default', label: '未知' }
    };
    const { color, label } = config[status] || { color: 'default', label: status };
    return <Tag color={color}>{label}</Tag>;
  };

  return (
    <Drawer
      title={
        <Space>
          <InfoCircleOutlined />
          <span>{node.name}</span>
          <Tag color={getStatusColor(node.status)}>{getStatusLabel(node.status)}</Tag>
        </Space>
      }
      placement="right"
      width={600}
      onClose={onClose}
      open={visible}
      extra={
        <Space>
          {onEdit && (
            <Tooltip title="编辑节点">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEdit(node.nodeId)}
              />
            </Tooltip>
          )}
          {onViewVulnerabilities && (
            <Tooltip title="查看漏洞">
              <Button
                type="text"
                icon={<BugOutlined />}
                onClick={() => onViewVulnerabilities(node.nodeId)}
              />
            </Tooltip>
          )}
          {onViewRelations && (
            <Tooltip title="查看关联">
              <Button
                type="text"
                icon={<LinkOutlined />}
                onClick={() => onViewRelations(node.nodeId)}
              />
            </Tooltip>
          )}
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={onClose}
          />
        </Space>
      }
    >
      {/* 维度1：标识信息 */}
      <Divider orientation="left">标识信息</Divider>
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label="节点ID">{node.nodeId}</Descriptions.Item>
        <Descriptions.Item label="名称">{node.name}</Descriptions.Item>
        <Descriptions.Item label="设备类型">
          {getDeviceCategoryLabel(node.deviceCategory)}
        </Descriptions.Item>
        <Descriptions.Item label="CPE">{node.cpe}</Descriptions.Item>
        <Descriptions.Item label="安全域">
          <Tag color={
            node.zone === 'external' ? 'red' :
            node.zone === 'dmz' ? 'orange' :
            node.zone === 'intranet' ? 'blue' : 'purple'
          }>
            {node.zone === 'external' ? '外网' :
             node.zone === 'dmz' ? 'DMZ' :
             node.zone === 'intranet' ? '内网' : '云端'}
          </Tag>
        </Descriptions.Item>
      </Descriptions>

      {/* 维度2：网络标识 */}
      <Divider orientation="left">网络标识</Divider>
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label="IPv4地址">{node.ipv4Address}</Descriptions.Item>
        {node.ipv6Address && (
          <Descriptions.Item label="IPv6地址">{node.ipv6Address}</Descriptions.Item>
        )}
        {node.macAddress && (
          <Descriptions.Item label="MAC地址">{node.macAddress}</Descriptions.Item>
        )}
        <Descriptions.Item label="主机名">{node.hostname}</Descriptions.Item>
        {node.vlanId && (
          <Descriptions.Item label="VLAN ID">{node.vlanId}</Descriptions.Item>
        )}
        {node.asn && (
          <Descriptions.Item label="ASN">{node.asn}</Descriptions.Item>
        )}
      </Descriptions>

      {/* 维度3：开放服务 */}
      <Divider orientation="left">开放服务</Divider>
      <Space direction="vertical" style={{ width: '100%' }}>
        {node.openPorts.length > 0 ? (
          node.openPorts.map((service, index) => (
            <div
              key={index}
              style={{
                padding: '8px 12px',
                border: '1px solid #e8e8e8',
                borderRadius: '4px',
                backgroundColor: '#fafafa'
              }}
            >
              <Space>
                <Tag color="blue">{service.port}/{service.protocol}</Tag>
                <span style={{ fontWeight: 'bold' }}>{service.service}</span>
                <span style={{ color: '#8c8c8c' }}>{service.version}</span>
                <Tag color={service.state === 'open' ? 'green' : 'default'}>
                  {service.state}
                </Tag>
              </Space>
              {service.banner && (
                <div style={{ marginTop: '4px', fontSize: '12px', color: '#8c8c8c' }}>
                  {service.banner}
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={{ color: '#8c8c8c', textAlign: 'center', padding: '16px' }}>
            无开放服务
          </div>
        )}
      </Space>

      {/* 维度4：系统指纹 */}
      <Divider orientation="left">系统指纹</Divider>
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label="操作系统">
          {node.osVersion} ({node.osType.toUpperCase()})
        </Descriptions.Item>
        <Descriptions.Item label="OS CPE">{node.osCpe}</Descriptions.Item>
        {node.kernelVersion && (
          <Descriptions.Item label="内核版本">{node.kernelVersion}</Descriptions.Item>
        )}
        {node.architecture && (
          <Descriptions.Item label="架构">{node.architecture}</Descriptions.Item>
        )}
        <Descriptions.Item label="补丁状态">
          {getPatchLevelTag(node.patchLevel)}
          {node.lastPatchDate && (
            <span style={{ marginLeft: '8px', color: '#8c8c8c' }}>
              最后更新: {node.lastPatchDate}
            </span>
          )}
        </Descriptions.Item>
      </Descriptions>

      {/* 维度5：安全态势 */}
      <Divider orientation="left">安全态势</Divider>
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label="安全评分">
          <Space>
            <Tag color={
              node.securityScore >= 80 ? 'green' :
              node.securityScore >= 60 ? 'orange' :
              node.securityScore >= 40 ? 'volcano' : 'red'
            }>
              {node.securityScore}
            </Tag>
            <span style={{ color: '#8c8c8c' }}>
              {node.securityScore >= 80 ? '安全' :
               node.securityScore >= 60 ? '中等' :
               node.securityScore >= 40 ? '较低' : '危险'}
            </span>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="攻击面">
          {node.attackSurface}
        </Descriptions.Item>
        <Descriptions.Item label="可利用性评分">
          <Space>
            <span>{node.exploitabilityScore}</span>
            {node.exploitabilityScore > 7 && (
              <Tag color="red">高风险</Tag>
            )}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="重要性等级">
          {getCriticalityTag(node.criticalityLevel)}
          <Tooltip title="可编辑">
            <EditOutlined style={{ marginLeft: '8px', color: '#1890ff', cursor: 'pointer' }} />
          </Tooltip>
        </Descriptions.Item>
        {node.dataClassification && (
          <Descriptions.Item label="数据级别">
            <Tag color={
              node.dataClassification === 'top_secret' ? 'red' :
              node.dataClassification === 'secret' ? 'orange' :
              node.dataClassification === 'confidential' ? 'blue' : 'green'
            }>
              {node.dataClassification === 'top_secret' ? '绝密' :
               node.dataClassification === 'secret' ? '机密' :
               node.dataClassification === 'confidential' ? '秘密' : '公开'}
            </Tag>
            <Tooltip title="可编辑">
              <EditOutlined style={{ marginLeft: '8px', color: '#1890ff', cursor: 'pointer' }} />
            </Tooltip>
          </Descriptions.Item>
        )}
        {node.complianceStatus && (
          <Descriptions.Item label="合规状态">
            {getComplianceTag(node.complianceStatus)}
          </Descriptions.Item>
        )}
      </Descriptions>

      {/* 运行状态 */}
      {node.compromiseIndicators && node.compromiseIndicators.length > 0 && (
        <>
          <Divider orientation="left">失陷指标</Divider>
          <Space direction="vertical" style={{ width: '100%' }}>
            {node.compromiseIndicators.map((indicator, index) => (
              <Tag key={index} color="red" style={{ marginBottom: '4px' }}>
                {indicator}
              </Tag>
            ))}
          </Space>
        </>
      )}

      {node.lastSeenAt && (
        <div style={{ marginTop: '16px', color: '#8c8c8c', fontSize: '12px' }}>
          最后发现时间: {node.lastSeenAt}
        </div>
      )}
    </Drawer>
  );
};

export default NodeDetailPanel;

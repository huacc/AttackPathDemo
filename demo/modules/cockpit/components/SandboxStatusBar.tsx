import React from 'react';
import { Space, Tag, Statistic } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  NodeIndexOutlined
} from '@ant-design/icons';

interface NodeStats {
  total: number;
  online: number;
  offline: number;
  compromised: number;
  warning: number;
}

interface SandboxStatusBarProps {
  stats: NodeStats;
}

/**
 * 沙盘状态栏组件
 * 显示节点总数、在线/离线/告警统计
 */
export const SandboxStatusBar: React.FC<SandboxStatusBarProps> = ({ stats }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        backgroundColor: '#fafafa',
        borderTop: '1px solid #e8e8e8'
      }}
    >
      <Space size="large">
        {/* 节点总数 */}
        <Space size="small">
          <NodeIndexOutlined style={{ color: '#1890ff' }} />
          <span style={{ fontSize: 12, color: '#666' }}>节点总数:</span>
          <span style={{ fontSize: 14, fontWeight: 'bold' }}>{stats.total}</span>
        </Space>

        {/* 在线节点 */}
        <Space size="small">
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
          <span style={{ fontSize: 12, color: '#666' }}>在线:</span>
          <span style={{ fontSize: 14, fontWeight: 'bold', color: '#52c41a' }}>
            {stats.online}
          </span>
        </Space>

        {/* 离线节点 */}
        <Space size="small">
          <CloseCircleOutlined style={{ color: '#d9d9d9' }} />
          <span style={{ fontSize: 12, color: '#666' }}>离线:</span>
          <span style={{ fontSize: 14, fontWeight: 'bold', color: '#999' }}>
            {stats.offline}
          </span>
        </Space>

        {/* 失陷节点 */}
        {stats.compromised > 0 && (
          <Space size="small">
            <WarningOutlined style={{ color: '#ff4d4f' }} />
            <span style={{ fontSize: 12, color: '#666' }}>失陷:</span>
            <span style={{ fontSize: 14, fontWeight: 'bold', color: '#ff4d4f' }}>
              {stats.compromised}
            </span>
          </Space>
        )}

        {/* 告警节点 */}
        {stats.warning > 0 && (
          <Space size="small">
            <WarningOutlined style={{ color: '#faad14' }} />
            <span style={{ fontSize: 12, color: '#666' }}>告警:</span>
            <span style={{ fontSize: 14, fontWeight: 'bold', color: '#faad14' }}>
              {stats.warning}
            </span>
          </Space>
        )}
      </Space>

      {/* 右侧：状态标签 */}
      <Space size="small">
        {stats.compromised > 0 && (
          <Tag color="error">攻击进行中</Tag>
        )}
        {stats.warning > 0 && stats.compromised === 0 && (
          <Tag color="warning">存在风险</Tag>
        )}
        {stats.compromised === 0 && stats.warning === 0 && (
          <Tag color="success">安全</Tag>
        )}
      </Space>
    </div>
  );
};

export default SandboxStatusBar;

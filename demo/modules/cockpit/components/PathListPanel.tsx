/**
 * P5.3 路径列表组件
 * 展示推演发现的所有攻击路径，按成功率排序
 */

import React from 'react';
import { Card, List, Tag, Space, Progress, Tooltip } from 'antd';
import { 
  FireOutlined, 
  ClockCircleOutlined, 
  NodeIndexOutlined,
  CheckCircleOutlined 
} from '@ant-design/icons';
import { AttackPath } from '../../../mock/dynamic/attackPaths';

interface PathListPanelProps {
  paths: AttackPath[];
  selectedPath: AttackPath | null;
  onSelectPath: (path: AttackPath) => void;
}

const PathListPanel: React.FC<PathListPanelProps> = ({
  paths,
  selectedPath,
  onSelectPath
}) => {
  const getRiskColor = (riskLevel: string) => {
    const colorMap: Record<string, string> = {
      'low': 'green',
      'medium': 'orange',
      'high': 'red',
      'critical': 'purple'
    };
    return colorMap[riskLevel] || 'default';
  };

  const getRiskText = (riskLevel: string) => {
    const textMap: Record<string, string> = {
      'low': '低风险',
      'medium': '中风险',
      'high': '高风险',
      'critical': '严重风险'
    };
    return textMap[riskLevel] || riskLevel;
  };

  const getNodeSequence = (path: AttackPath): string => {
    const nodes = path.attackPhases.map(phase => phase.targetNodeName);
    if (nodes.length <= 3) {
      return nodes.join(' → ');
    }
    return `${nodes[0]} → ... → ${nodes[nodes.length - 1]} (${nodes.length}步)`;
  };

  return (
    <Card 
      title={
        <Space>
          <NodeIndexOutlined />
          <span>发现的攻击路径</span>
          <Tag color="blue">{paths.length} 条</Tag>
        </Space>
      }
      size="small"
    >
      <List
        dataSource={paths}
        renderItem={(path, index) => (
          <List.Item
            key={path.pathId}
            onClick={() => onSelectPath(path)}
            style={{
              cursor: 'pointer',
              background: selectedPath?.pathId === path.pathId ? '#e6f7ff' : 'transparent',
              padding: '12px 16px',
              borderRadius: '4px',
              marginBottom: '8px',
              border: selectedPath?.pathId === path.pathId ? '1px solid #1890ff' : '1px solid #f0f0f0'
            }}
          >
            <List.Item.Meta
              avatar={
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: selectedPath?.pathId === path.pathId ? '#1890ff' : '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: selectedPath?.pathId === path.pathId ? '#fff' : '#666'
                }}>
                  #{index + 1}
                </div>
              }
              title={
                <Space>
                  <span style={{ fontWeight: 600 }}>{path.pathName}</span>
                  <Tag color={getRiskColor(path.riskLevel)}>
                    {getRiskText(path.riskLevel)}
                  </Tag>
                  {selectedPath?.pathId === path.pathId && (
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  )}
                </Space>
              }
              description={
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    {getNodeSequence(path)}
                  </div>
                  <Space size="large">
                    <Tooltip title="攻击成功率">
                      <Space size="small">
                        <FireOutlined style={{ color: '#ff4d4f' }} />
                        <Progress 
                          percent={Math.round(path.totalSuccessRate * 100)} 
                          size="small" 
                          style={{ width: 80 }}
                          strokeColor={{
                            '0%': '#ff4d4f',
                            '100%': '#ff7875',
                          }}
                        />
                      </Space>
                    </Tooltip>
                    <Tooltip title="预计耗时">
                      <Space size="small">
                        <ClockCircleOutlined style={{ color: '#1890ff' }} />
                        <span style={{ fontSize: 12 }}>{path.totalDuration}分钟</span>
                      </Space>
                    </Tooltip>
                    <Tooltip title="攻击步数">
                      <Space size="small">
                        <NodeIndexOutlined style={{ color: '#52c41a' }} />
                        <span style={{ fontSize: 12 }}>{path.attackPhases.length}步</span>
                      </Space>
                    </Tooltip>
                  </Space>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default PathListPanel;

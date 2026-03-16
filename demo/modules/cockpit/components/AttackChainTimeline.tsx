/**
 * P5.5 攻击链时间轴
 * 横向时间轴展示攻击链每一步，支持与沙盘联动
 */

import React, { useState } from 'react';
import { Card, Timeline, Tag, Space, Tooltip, Badge } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FireOutlined,
  AimOutlined
} from '@ant-design/icons';
import { AttackPath } from '../../../mock/dynamic/attackPaths';

interface AttackChainTimelineProps {
  path: AttackPath;
  currentStep?: number;
  onStepClick?: (stepIndex: number) => void;
}

const AttackChainTimeline: React.FC<AttackChainTimelineProps> = ({
  path,
  currentStep = -1,
  onStepClick
}) => {
  const [hoveredStep, setHoveredStep] = useState<number>(-1);

  const getKillChainColor = (phase: string): string => {
    const colorMap: Record<string, string> = {
      'reconnaissance': 'blue',
      'weaponization': 'cyan',
      'delivery': 'geekblue',
      'exploitation': 'orange',
      'installation': 'gold',
      'command_and_control': 'purple',
      'actions_on_objectives': 'red',
      'execution': 'volcano',
      'persistence': 'magenta',
      'privilege_escalation': 'red',
      'defense_evasion': 'orange',
      'credential_access': 'gold',
      'discovery': 'lime',
      'lateral_movement': 'green',
      'collection': 'cyan',
      'exfiltration': 'geekblue'
    };
    return colorMap[phase] || 'default';
  };

  const getKillChainLabel = (phase: string): string => {
    const labelMap: Record<string, string> = {
      'reconnaissance': '侦察',
      'weaponization': '武器化',
      'delivery': '投递',
      'exploitation': '利用',
      'installation': '安装',
      'command_and_control': 'C2',
      'actions_on_objectives': '目标行动',
      'execution': '执行',
      'persistence': '持久化',
      'privilege_escalation': '权限提升',
      'defense_evasion': '防御规避',
      'credential_access': '凭证访问',
      'discovery': '发现',
      'lateral_movement': '横向移动',
      'collection': '收集',
      'exfiltration': '外传'
    };
    return labelMap[phase] || phase;
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}分钟`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`;
  };

  // 计算累计时间
  const getCumulativeTime = (index: number): number => {
    return path.attackPhases
      .slice(0, index + 1)
      .reduce((sum, phase) => sum + phase.estimatedDuration, 0);
  };

  return (
    <Card 
      title={
        <Space>
          <ClockCircleOutlined />
          <span>攻击链时间轴</span>
          <Tag color="blue">总耗时: {formatTime(path.totalDuration)}</Tag>
        </Space>
      }
      size="small"
    >
      <Timeline
        mode="left"
        items={path.attackPhases.map((phase, index) => {
          const isActive = index === currentStep;
          const isHovered = index === hoveredStep;
          const cumulativeTime = getCumulativeTime(index);
          
          return {
            color: isActive ? 'red' : 'blue',
            dot: isActive ? (
              <FireOutlined style={{ fontSize: 16, color: '#ff4d4f' }} />
            ) : (
              <AimOutlined style={{ fontSize: 16 }} />
            ),
            label: (
              <div style={{ width: 120, textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: '#666' }}>
                  T+{formatTime(cumulativeTime)}
                </div>
                <Tag 
                  color={getKillChainColor(phase.killChainPhase)}
                  style={{ fontSize: 11, marginTop: 4 }}
                >
                  {getKillChainLabel(phase.killChainPhase)}
                </Tag>
              </div>
            ),
            children: (
              <div
                style={{
                  cursor: onStepClick ? 'pointer' : 'default',
                  padding: '8px 12px',
                  background: isActive ? '#fff1f0' : isHovered ? '#f5f5f5' : 'transparent',
                  borderRadius: 4,
                  border: isActive ? '1px solid #ff4d4f' : '1px solid transparent',
                  transition: 'all 0.3s'
                }}
                onClick={() => onStepClick?.(index)}
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(-1)}
              >
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space>
                      <Badge 
                        count={index + 1} 
                        style={{ 
                          backgroundColor: isActive ? '#ff4d4f' : '#1890ff',
                          fontSize: 12
                        }} 
                      />
                      <span style={{ 
                        fontWeight: isActive ? 600 : 400,
                        fontSize: 14
                      }}>
                        {phase.targetNodeName}
                      </span>
                    </Space>
                    <Tooltip title="攻击成功">
                      <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                    </Tooltip>
                  </div>
                  
                  <div style={{ fontSize: 13, color: '#666' }}>
                    <Space size="small">
                      <Tag color="orange" style={{ fontSize: 11 }}>
                        {phase.techniqueId}
                      </Tag>
                      <span>{phase.techniqueName}</span>
                    </Space>
                  </div>
                  
                  {phase.vulnerabilityName && (
                    <div style={{ fontSize: 12, color: '#999' }}>
                      利用漏洞: {phase.vulnerabilityName}
                    </div>
                  )}
                  
                  <Space size="large" style={{ fontSize: 12, color: '#999' }}>
                    <span>
                      成功率: <span style={{ color: '#52c41a', fontWeight: 500 }}>
                        {Math.round(phase.actualSuccessRate * 100)}%
                      </span>
                    </span>
                    <span>
                      耗时: {phase.estimatedDuration}分钟
                    </span>
                    <span>
                      检测概率: {Math.round(phase.detectionProbability * 100)}%
                    </span>
                  </Space>
                  
                  <div style={{ 
                    fontSize: 12, 
                    color: '#666',
                    fontStyle: 'italic',
                    marginTop: 4
                  }}>
                    {phase.description}
                  </div>
                </Space>
              </div>
            )
          };
        })}
      />
      
      <div style={{ 
        marginTop: 16, 
        padding: '12px', 
        background: '#f5f5f5', 
        borderRadius: 4 
      }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>
            攻击路径摘要
          </div>
          <Space size="large" style={{ fontSize: 12 }}>
            <span>起点: {path.startNodeName}</span>
            <span>→</span>
            <span>终点: {path.targetNodeName}</span>
          </Space>
          <Space size="large" style={{ fontSize: 12 }}>
            <span>总步数: {path.attackPhases.length}步</span>
            <span>总成功率: {(path.totalSuccessRate * 100).toFixed(2)}%</span>
            <span>总耗时: {formatTime(path.totalDuration)}</span>
          </Space>
          <Space size="small" style={{ fontSize: 12 }}>
            <span>威胁行为者:</span>
            <Tag color="red">{path.threatActorName}</Tag>
            <span>风险等级:</span>
            <Tag color={
              path.riskLevel === 'critical' ? 'purple' :
              path.riskLevel === 'high' ? 'red' :
              path.riskLevel === 'medium' ? 'orange' : 'green'
            }>
              {path.riskLevel.toUpperCase()}
            </Tag>
          </Space>
        </Space>
      </div>
    </Card>
  );
};

export default AttackChainTimeline;

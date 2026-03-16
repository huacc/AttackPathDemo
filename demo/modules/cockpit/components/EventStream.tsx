/**
 * P7.3 事件流展示
 * 实时滚动展示事件列表，支持筛选和高亮联动
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, List, Tag, Select, Space, Badge, Empty } from 'antd';
import {
  FireOutlined,
  SafetyOutlined,
  WarningOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { SecurityEvent, EventType, SeverityLevel } from '../../../mock/dynamic/events';

const { Option } = Select;

export interface EventStreamProps {
  events: SecurityEvent[];
  currentTime: number;
  onEventClick?: (event: SecurityEvent) => void;
  maxDisplayCount?: number;
}

const EventStream: React.FC<EventStreamProps> = ({
  events,
  currentTime,
  onEventClick,
  maxDisplayCount = 50
}) => {
  const [selectedEventTypes, setSelectedEventTypes] = useState<EventType[]>([]);
  const [selectedSeverities, setSelectedSeverities] = useState<SeverityLevel[]>([]);
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);

  // 获取事件颜色
  const getEventColor = (eventType: EventType): string => {
    // 攻击事件：红色系
    if (['attack_start', 'exploit_attempt', 'exploit_success', 'lateral_move', 'data_exfil', 'node_compromised', 'privilege_escalation', 'command_execution'].includes(eventType)) {
      return 'red';
    }
    // 防御事件：蓝色系
    if (['defense_detect', 'defense_block'].includes(eventType)) {
      return 'blue';
    }
    // 失败事件：灰色
    if (eventType === 'exploit_fail') {
      return 'default';
    }
    // 其他：橙色（告警）
    return 'orange';
  };

  // 获取严重等级颜色
  const getSeverityColor = (severity: SeverityLevel): string => {
    const colorMap: Record<SeverityLevel, string> = {
      low: 'green',
      medium: 'orange',
      high: 'red',
      critical: 'purple'
    };
    return colorMap[severity];
  };

  // 获取事件类型图标
  const getEventIcon = (eventType: EventType) => {
    if (['attack_start', 'exploit_attempt', 'exploit_success', 'lateral_move', 'data_exfil', 'node_compromised', 'privilege_escalation', 'command_execution'].includes(eventType)) {
      return <FireOutlined style={{ color: '#ff4d4f' }} />;
    }
    if (['defense_detect', 'defense_block'].includes(eventType)) {
      return <SafetyOutlined style={{ color: '#1890ff' }} />;
    }
    return <WarningOutlined style={{ color: '#fa8c16' }} />;
  };

  // 获取事件类型中文名
  const getEventTypeName = (eventType: EventType): string => {
    const nameMap: Record<EventType, string> = {
      attack_start: '攻击开始',
      exploit_attempt: '漏洞利用尝试',
      exploit_success: '漏洞利用成功',
      exploit_fail: '漏洞利用失败',
      defense_detect: '防御检测',
      defense_block: '防御阻断',
      lateral_move: '横向移动',
      data_exfil: '数据外传',
      node_compromised: '节点被攻陷',
      privilege_escalation: '权限提升',
      persistence_established: '持久化建立',
      command_execution: '命令执行'
    };
    return nameMap[eventType] || eventType;
  };

  // 筛选和排序事件
  const filteredEvents = useMemo(() => {
    let filtered = events.filter(event => event.timestamp <= currentTime);

    // 按事件类型筛选
    if (selectedEventTypes.length > 0) {
      filtered = filtered.filter(event => selectedEventTypes.includes(event.eventType));
    }

    // 按严重等级筛选
    if (selectedSeverities.length > 0) {
      filtered = filtered.filter(event => selectedSeverities.includes(event.severity));
    }

    // 按时间倒序排序（最新的在前）
    return filtered.sort((a, b) => b.timestamp - a.timestamp).slice(0, maxDisplayCount);
  }, [events, currentTime, selectedEventTypes, selectedSeverities, maxDisplayCount]);

  // 事件点击处理
  const handleEventClick = (event: SecurityEvent) => {
    setHighlightedEventId(event.eventId);
    onEventClick?.(event);
  };

  // 格式化时间
  const formatTime = (minutes: number): string => {
    const mins = Math.floor(minutes);
    const secs = Math.floor((minutes - mins) * 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // 所有事件类型选项
  const eventTypeOptions: EventType[] = [
    'attack_start',
    'exploit_attempt',
    'exploit_success',
    'exploit_fail',
    'defense_detect',
    'defense_block',
    'lateral_move',
    'data_exfil',
    'node_compromised',
    'privilege_escalation',
    'persistence_established',
    'command_execution'
  ];

  // 所有严重等级选项
  const severityOptions: SeverityLevel[] = ['low', 'medium', 'high', 'critical'];

  return (
    <Card
      title={
        <Space>
          <ClockCircleOutlined />
          <span>事件流</span>
          <Badge count={filteredEvents.length} style={{ backgroundColor: '#52c41a' }} />
        </Space>
      }
      size="small"
      extra={
        <Space>
          <Select
            mode="multiple"
            placeholder="筛选事件类型"
            style={{ width: 200 }}
            value={selectedEventTypes}
            onChange={setSelectedEventTypes}
            maxTagCount={1}
          >
            {eventTypeOptions.map(type => (
              <Option key={type} value={type}>
                {getEventTypeName(type)}
              </Option>
            ))}
          </Select>
          <Select
            mode="multiple"
            placeholder="筛选严重等级"
            style={{ width: 150 }}
            value={selectedSeverities}
            onChange={setSelectedSeverities}
            maxTagCount={1}
          >
            {severityOptions.map(severity => (
              <Option key={severity} value={severity}>
                <Tag color={getSeverityColor(severity)} style={{ margin: 0 }}>
                  {severity.toUpperCase()}
                </Tag>
              </Option>
            ))}
          </Select>
        </Space>
      }
    >
      <List
        dataSource={filteredEvents}
        locale={{ emptyText: <Empty description="暂无事件" /> }}
        style={{ maxHeight: 600, overflow: 'auto' }}
        renderItem={(event) => (
          <List.Item
            key={event.eventId}
            onClick={() => handleEventClick(event)}
            style={{
              cursor: 'pointer',
              background: highlightedEventId === event.eventId ? '#e6f7ff' : 'transparent',
              borderLeft: highlightedEventId === event.eventId ? '3px solid #1890ff' : 'none',
              paddingLeft: highlightedEventId === event.eventId ? 13 : 16,
              transition: 'all 0.3s'
            }}
          >
            <List.Item.Meta
              avatar={getEventIcon(event.eventType)}
              title={
                <Space>
                  <Tag color={getEventColor(event.eventType)}>
                    {getEventTypeName(event.eventType)}
                  </Tag>
                  <Tag color={getSeverityColor(event.severity)}>
                    {event.severity.toUpperCase()}
                  </Tag>
                  <span style={{ fontSize: 12, color: '#999' }}>
                    {formatTime(event.timestamp)}
                  </span>
                  {event.success ? (
                    <Tag color="green" style={{ fontSize: 11 }}>成功</Tag>
                  ) : (
                    <Tag color="default" style={{ fontSize: 11 }}>失败</Tag>
                  )}
                </Space>
              }
              description={
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div style={{ fontSize: 13 }}>{event.description}</div>
                  <Space size="small" wrap>
                    {event.sourceNodeName && (
                      <span style={{ fontSize: 11, color: '#666' }}>
                        源: <Tag color="blue" style={{ fontSize: 11 }}>{event.sourceNodeName}</Tag>
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: '#666' }}>
                      目标: <Tag color="orange" style={{ fontSize: 11 }}>{event.targetNodeName}</Tag>
                    </span>
                    {event.techniqueName && (
                      <span style={{ fontSize: 11, color: '#666' }}>
                        技术: <Tag color="purple" style={{ fontSize: 11 }}>{event.techniqueId}</Tag>
                      </span>
                    )}
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

export default EventStream;

/**
 * P7.5 历史回放页面
 * 整合时间轴控制器、事件流、态势统计面板，实现完整的历史回放功能
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Card, Row, Col, Select, Space, Tag } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import SandboxCanvas from './components/SandboxCanvas';
import TimelineController from './components/TimelineController';
import EventStream from './components/EventStream';
import StatisticsPanel from './components/StatisticsPanel';
import { SCENES } from '../../mock/dynamic/scenes';
import { ATTACK_PATHS } from '../../mock/dynamic/attackPaths';
import { SECURITY_EVENTS } from '../../mock/dynamic/events';
import { NETWORK_NODES } from '../../mock/static/networkNodes';
import { isCrossDomainConnection } from './components/EdgeRenderer';

const { Option } = Select;

/**
 * 历史回放页面
 * 支持选择攻击路径进行回放，沙盘、事件流、统计面板三者联动
 */
export const HistoryReplayPage: React.FC = () => {
  const [selectedPathId, setSelectedPathId] = useState<string>(ATTACK_PATHS[0]?.pathId || '');
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // 获取当前选中的攻击路径
  const selectedPath = useMemo(() => {
    return ATTACK_PATHS.find(p => p.pathId === selectedPathId);
  }, [selectedPathId]);

  // 获取当前路径的事件
  const pathEvents = useMemo(() => {
    return SECURITY_EVENTS.filter(e => e.attackPathId === selectedPathId);
  }, [selectedPathId]);

  // 计算最大时间
  const maxTime = useMemo(() => {
    if (pathEvents.length === 0) return 10;
    return Math.max(...pathEvents.map(e => e.timestamp)) + 1;
  }, [pathEvents]);

  // 获取当前时间之前的事件（用于更新节点状态）
  const currentEvents = useMemo(() => {
    return pathEvents.filter(e => e.timestamp <= currentTime);
  }, [pathEvents, currentTime]);

  // 获取失陷节点ID集合
  const compromisedNodeIds = useMemo(() => {
    return new Set(
      currentEvents
        .filter(e => e.eventType === 'node_compromised' || e.eventType === 'exploit_success')
        .map(e => e.targetNodeId)
    );
  }, [currentEvents]);

  // 获取当前场景
  const currentScene = SCENES[0];

  // 转换节点数据为G6格式，并更新节点状态
  const graphData = useMemo(() => {
    const nodeZoneMap = new Map<string, string>();
    currentScene.nodes.forEach(node => {
      nodeZoneMap.set(node.nodeId, node.zone);
    });

    const layoutMap = new Map<string, { x: number; y: number }>();
    currentScene.nodeLayouts.forEach(layout => {
      layoutMap.set(layout.nodeId, { x: layout.x, y: layout.y });
    });

    // 转换节点，标记失陷状态
    const nodes = currentScene.nodes.map(node => {
      const position = layoutMap.get(node.nodeId) || { x: 0, y: 0 };
      const isCompromised = compromisedNodeIds.has(node.nodeId);

      return {
        id: node.nodeId,
        x: position.x,
        y: position.y,
        ...node,
        status: isCompromised ? 'compromised' : node.status
      };
    });

    // 转换连接
    const edges = currentScene.connections.map(conn => {
      const sourceZone = nodeZoneMap.get(conn.sourceNodeId) || '';
      const targetZone = nodeZoneMap.get(conn.targetNodeId) || '';
      const isCrossDomain = isCrossDomainConnection(sourceZone, targetZone);

      return {
        id: conn.connectionId,
        source: conn.sourceNodeId,
        target: conn.targetNodeId,
        label: conn.protocol,
        protocol: conn.protocol,
        bandwidth: conn.bandwidth,
        isCrossDomain
      };
    });

    return { nodes, edges };
  }, [currentScene, compromisedNodeIds]);

  // 获取当前正在执行的攻击路径（用于沙盘动画）
  const activeAttackPath = useMemo(() => {
    if (!selectedPath) return null;

    // 找到当前时间点正在执行的攻击阶段
    let cumulativeTime = 0;
    for (const phase of selectedPath.attackPhases) {
      if (currentTime >= cumulativeTime && currentTime < cumulativeTime + phase.estimatedDuration) {
        // 当前阶段正在执行
        return {
          pathId: selectedPath.pathId,
          phases: selectedPath.attackPhases.slice(0, selectedPath.attackPhases.indexOf(phase) + 1)
        };
      }
      cumulativeTime += phase.estimatedDuration;
    }

    // 如果超过所有阶段，返回完整路径
    if (currentTime >= cumulativeTime) {
      return {
        pathId: selectedPath.pathId,
        phases: selectedPath.attackPhases
      };
    }

    return null;
  }, [selectedPath, currentTime]);

  // 处理攻击路径选择
  const handlePathChange = useCallback((pathId: string) => {
    setSelectedPathId(pathId);
    setCurrentTime(0);
    setIsPlaying(false);
  }, []);

  // 处理时间变化
  const handleTimeChange = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  // 处理播放状态变化
  const handlePlayStateChange = useCallback((playing: boolean) => {
    setIsPlaying(playing);
  }, []);

  // 处理速度变化
  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
  }, []);

  return (
    <div style={{ padding: '24px', height: '100vh', overflow: 'auto' }}>
      <Card
        title={
          <Space>
            <HistoryOutlined />
            <span>历史回放</span>
          </Space>
        }
        extra={
          <Space>
            <span>选择攻击路径：</span>
            <Select
              value={selectedPathId}
              onChange={handlePathChange}
              style={{ width: 300 }}
            >
              {ATTACK_PATHS.map(path => (
                <Option key={path.pathId} value={path.pathId}>
                  <Space>
                    <span>{path.pathName}</span>
                    <Tag color="red">{path.riskLevel}</Tag>
                  </Space>
                </Option>
              ))}
            </Select>
          </Space>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* 时间轴控制器 */}
          <TimelineController
            maxTime={maxTime}
            onTimeChange={handleTimeChange}
            onPlayStateChange={handlePlayStateChange}
            onSpeedChange={handleSpeedChange}
          />

          {/* 主内容区域 */}
          <Row gutter={[16, 16]}>
            {/* 左侧：沙盘 */}
            <Col span={16}>
              <Card
                title="网络沙盘"
                size="small"
                style={{ height: '600px' }}
              >
                <SandboxCanvas
                  zones={currentScene.zones}
                  nodes={graphData.nodes}
                  edges={graphData.edges}
                  activeLayer="attack"
                  layerConfig={{
                    business: false,
                    network: true,
                    attack: true
                  }}
                  attackPaths={activeAttackPath ? [activeAttackPath] : []}
                  onNodeClick={(nodeId) => console.log('Node clicked:', nodeId)}
                />
              </Card>
            </Col>

            {/* 右侧：事件流 */}
            <Col span={8}>
              <EventStream
                events={pathEvents}
                currentTime={currentTime}
                maxDisplayCount={15}
              />
            </Col>
          </Row>

          {/* 态势统计面板 */}
          <StatisticsPanel
            events={pathEvents}
            nodes={NETWORK_NODES}
            currentTime={currentTime}
          />
        </Space>
      </Card>
    </div>
  );
};

export default HistoryReplayPage;

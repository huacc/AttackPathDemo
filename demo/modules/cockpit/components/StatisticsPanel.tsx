/**
 * P7.4 态势统计面板
 * 实时统计数据、趋势图、安全域态势
 */

import React, { useMemo } from 'react';
import { Card, Row, Col, Statistic, Space } from 'antd';
import {
  FireOutlined,
  SafetyOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClusterOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { SecurityEvent } from '../../../mock/dynamic/events';
import { NetworkNode } from '../../../mock/static/networkNodes';

export interface StatisticsPanelProps {
  events: SecurityEvent[];
  nodes: NetworkNode[];
  currentTime: number;
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({
  events,
  nodes,
  currentTime
}) => {
  // 筛选当前时间之前的事件
  const currentEvents = useMemo(() => {
    return events.filter(event => event.timestamp <= currentTime);
  }, [events, currentTime]);

  // 实时统计数据
  const statistics = useMemo(() => {
    const attackEvents = currentEvents.filter(e =>
      ['attack_start', 'exploit_attempt', 'exploit_success', 'lateral_move', 'data_exfil', 'node_compromised', 'privilege_escalation', 'command_execution'].includes(e.eventType)
    );
    const blockEvents = currentEvents.filter(e => e.eventType === 'defense_block');
    const compromisedNodeIds = new Set(
      currentEvents
        .filter(e => e.eventType === 'node_compromised' || e.eventType === 'exploit_success')
        .map(e => e.targetNodeId)
    );
    const onlineNodes = nodes.filter(n => n.status === 'online' || !n.status).length;

    return {
      attackCount: attackEvents.length,
      blockCount: blockEvents.length,
      compromisedCount: compromisedNodeIds.size,
      onlineCount: onlineNodes
    };
  }, [currentEvents, nodes]);

  // 趋势数据（按分钟统计）
  const trendData = useMemo(() => {
    const maxTime = Math.ceil(currentTime);
    const attackSeries: number[] = [];
    const defenseSeries: number[] = [];
    const timeLabels: string[] = [];

    for (let t = 0; t <= maxTime; t++) {
      const eventsAtTime = currentEvents.filter(e => Math.floor(e.timestamp) === t);
      const attacks = eventsAtTime.filter(e =>
        ['attack_start', 'exploit_attempt', 'exploit_success', 'lateral_move', 'data_exfil', 'node_compromised', 'privilege_escalation', 'command_execution'].includes(e.eventType)
      ).length;
      const defenses = eventsAtTime.filter(e =>
        ['defense_detect', 'defense_block'].includes(e.eventType)
      ).length;

      attackSeries.push(attacks);
      defenseSeries.push(defenses);
      timeLabels.push(`${t}min`);
    }

    return { attackSeries, defenseSeries, timeLabels };
  }, [currentEvents, currentTime]);

  // 安全域态势数据
  const zoneStatistics = useMemo(() => {
    const zones = ['external', 'dmz', 'intranet', 'cloud'];
    const zoneData = zones.map(zone => {
      const zoneNodes = nodes.filter(n => n.zone === zone);
      const compromisedInZone = currentEvents
        .filter(e => (e.eventType === 'node_compromised' || e.eventType === 'exploit_success'))
        .filter(e => zoneNodes.some(n => n.nodeId === e.targetNodeId))
        .length;

      const totalNodes = zoneNodes.length;
      const securityScore = totalNodes > 0
        ? Math.max(0, 100 - (compromisedInZone / totalNodes) * 100)
        : 100;

      return {
        zone,
        securityScore: Math.round(securityScore),
        compromised: compromisedInZone,
        total: totalNodes
      };
    });

    return zoneData;
  }, [nodes, currentEvents]);

  // 趋势图配置
  const getTrendChartOption = () => {
    return {
      title: {
        text: '攻防事件趋势',
        left: 'center',
        textStyle: {
          fontSize: 14
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        data: ['攻击事件', '防御事件'],
        bottom: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: trendData.timeLabels,
        boundaryGap: false
      },
      yAxis: {
        type: 'value',
        name: '事件数'
      },
      series: [
        {
          name: '攻击事件',
          type: 'line',
          data: trendData.attackSeries,
          smooth: true,
          itemStyle: {
            color: '#ff4d4f'
          },
          areaStyle: {
            color: 'rgba(255, 77, 79, 0.2)'
          }
        },
        {
          name: '防御事件',
          type: 'line',
          data: trendData.defenseSeries,
          smooth: true,
          itemStyle: {
            color: '#1890ff'
          },
          areaStyle: {
            color: 'rgba(24, 144, 255, 0.2)'
          }
        }
      ]
    };
  };

  // 安全域态势图配置
  const getZoneChartOption = () => {
    return {
      title: {
        text: '安全域态势评分',
        left: 'center',
        textStyle: {
          fontSize: 14
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const data = params[0];
          const zone = zoneStatistics[data.dataIndex];
          return `${data.name}<br/>安全评分: ${data.value}<br/>失陷节点: ${zone.compromised}/${zone.total}`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: zoneStatistics.map(z => z.zone.toUpperCase())
      },
      yAxis: {
        type: 'value',
        name: '安全评分',
        max: 100
      },
      series: [
        {
          type: 'bar',
          data: zoneStatistics.map(z => ({
            value: z.securityScore,
            itemStyle: {
              color: z.securityScore >= 80 ? '#52c41a' : z.securityScore >= 60 ? '#faad14' : '#ff4d4f'
            }
          })),
          label: {
            show: true,
            position: 'top',
            formatter: '{c}'
          }
        }
      ]
    };
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      {/* 实时统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center', background: '#fff1f0' }}>
            <Statistic
              title="攻击次数"
              value={statistics.attackCount}
              prefix={<FireOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
              suffix="次"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center', background: '#e6f7ff' }}>
            <Statistic
              title="阻断次数"
              value={statistics.blockCount}
              prefix={<SafetyOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix="次"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center', background: '#fff7e6' }}>
            <Statistic
              title="失陷节点"
              value={statistics.compromisedCount}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#fa8c16' }}
              suffix="个"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center', background: '#f6ffed' }}>
            <Statistic
              title="在线节点"
              value={statistics.onlineCount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix="个"
            />
          </Card>
        </Col>
      </Row>

      {/* 趋势图和安全域态势 */}
      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card size="small">
            <ReactECharts option={getTrendChartOption()} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <ReactECharts option={getZoneChartOption()} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>
    </Space>
  );
};

export default StatisticsPanel;

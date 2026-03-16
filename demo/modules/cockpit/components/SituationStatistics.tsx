/**
 * P7.4 态势统计面板
 * 实时统计数据、ECharts趋势图、关键指标卡片
 */

import React, { useMemo } from 'react';
import { Card, Row, Col, Statistic, Space } from 'antd';
import {
  FireOutlined,
  SafetyOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { SecurityEvent } from '../../../mock/dynamic/events';

export interface SituationStatisticsProps {
  events: SecurityEvent[];
  currentTime: number;
}

const SituationStatistics: React.FC<SituationStatisticsProps> = ({
  events,
  currentTime
}) => {
  // 筛选当前时间之前的事件
  const currentEvents = useMemo(() => {
    return events.filter(event => event.timestamp <= currentTime);
  }, [events, currentTime]);

  // 统计数据
  const statistics = useMemo(() => {
    const attackEvents = currentEvents.filter(e =>
      ['attack_start', 'exploit_attempt', 'exploit_success', 'lateral_move', 'data_exfil', 'node_compromised', 'privilege_escalation', 'command_execution'].includes(e.eventType)
    );
    const defenseEvents = currentEvents.filter(e =>
      ['defense_detect', 'defense_block'].includes(e.eventType)
    );
    const successEvents = currentEvents.filter(e => e.success);
    const failEvents = currentEvents.filter(e => !e.success);
    const criticalEvents = currentEvents.filter(e => e.severity === 'critical');
    const highEvents = currentEvents.filter(e => e.severity === 'high');

    return {
      totalEvents: currentEvents.length,
      attackCount: attackEvents.length,
      defenseCount: defenseEvents.length,
      successCount: successEvents.length,
      failCount: failEvents.length,
      criticalCount: criticalEvents.length,
      highCount: highEvents.length,
      successRate: currentEvents.length > 0 ? (successEvents.length / currentEvents.length) * 100 : 0,
      defenseRate: attackEvents.length > 0 ? (defenseEvents.length / attackEvents.length) * 100 : 0
    };
  }, [currentEvents]);

  // 时间序列数据（按分钟统计）
  const timeSeriesData = useMemo(() => {
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

  // 事件类型分布数据
  const eventTypeDistribution = useMemo(() => {
    const distribution: { [key: string]: number } = {};
    currentEvents.forEach(event => {
      distribution[event.eventType] = (distribution[event.eventType] || 0) + 1;
    });

    return Object.entries(distribution).map(([name, value]) => ({
      name: name.replace(/_/g, ' ').toUpperCase(),
      value
    }));
  }, [currentEvents]);

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
        data: timeSeriesData.timeLabels,
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
          data: timeSeriesData.attackSeries,
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
          data: timeSeriesData.defenseSeries,
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

  // 事件类型分布饼图配置
  const getDistributionChartOption = () => {
    return {
      title: {
        text: '事件类型分布',
        left: 'center',
        textStyle: {
          fontSize: 14
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        textStyle: {
          fontSize: 10
        }
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['40%', '50%'],
          data: eventTypeDistribution,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            fontSize: 10
          }
        }
      ]
    };
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      {/* 关键指标卡片 */}
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center', background: '#fff1f0' }}>
            <Statistic
              title="攻击事件"
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
              title="防御事件"
              value={statistics.defenseCount}
              prefix={<SafetyOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix="次"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center', background: '#fff7e6' }}>
            <Statistic
              title="严重告警"
              value={statistics.criticalCount}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#fa8c16' }}
              suffix="条"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center', background: '#f6ffed' }}>
            <Statistic
              title="总事件数"
              value={statistics.totalEvents}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix="条"
            />
          </Card>
        </Col>
      </Row>

      {/* 成功率和防御率 */}
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic
              title="攻击成功率"
              value={statistics.successRate}
              precision={1}
              suffix="%"
              prefix={statistics.successRate > 50 ? <RiseOutlined /> : <FallOutlined />}
              valueStyle={{ color: statistics.successRate > 50 ? '#ff4d4f' : '#52c41a' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              成功: {statistics.successCount} / 失败: {statistics.failCount}
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic
              title="防御响应率"
              value={statistics.defenseRate}
              precision={1}
              suffix="%"
              prefix={<SafetyOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              防御: {statistics.defenseCount} / 攻击: {statistics.attackCount}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 趋势图 */}
      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card size="small">
            <ReactECharts option={getTrendChartOption()} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <ReactECharts option={getDistributionChartOption()} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      {/* 详细统计 */}
      <Card title="详细统计" size="small">
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>
                  <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                  成功事件
                </span>
                <strong>{statistics.successCount}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>
                  <CloseCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                  失败事件
                </span>
                <strong>{statistics.failCount}</strong>
              </div>
            </Space>
          </Col>
          <Col span={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>
                  <WarningOutlined style={{ color: '#722ed1', marginRight: 8 }} />
                  严重告警
                </span>
                <strong>{statistics.criticalCount}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>
                  <WarningOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                  高危告警
                </span>
                <strong>{statistics.highCount}</strong>
              </div>
            </Space>
          </Col>
          <Col span={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>
                  <FireOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                  攻击事件
                </span>
                <strong>{statistics.attackCount}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>
                  <SafetyOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                  防御事件
                </span>
                <strong>{statistics.defenseCount}</strong>
              </div>
            </Space>
          </Col>
        </Row>
      </Card>
    </Space>
  );
};

export default SituationStatistics;

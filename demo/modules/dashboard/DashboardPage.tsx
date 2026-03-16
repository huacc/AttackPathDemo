/**
 * P8.5 Dashboard 总览
 * 系统首页，展示关键指标、统计图表、快捷入口、告警列表
 */

import React, { useMemo } from 'react';
import { Card, Row, Col, Statistic, Space, Button, List, Tag, Badge, Typography } from 'antd';
import {
  DatabaseOutlined,
  BugOutlined,
  ExperimentOutlined,
  SafetyOutlined,
  RightOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ApartmentOutlined,
  NodeIndexOutlined,
  SafetyCertificateOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { useNavigate } from 'react-router-dom';
import { NETWORK_NODES } from '../../mock/static/networkNodes';
import { VULNERABILITIES } from '../../mock/static/vulnerabilities';
import { SCENES } from '../../mock/dynamic/scenes';
import { ATTACK_TECHNIQUES } from '../../mock/static/attackTechniques';
import { DEFENSE_SCENARIOS } from '../../mock/dynamic/defenseScenarios';

const { Title, Text } = Typography;

/**
 * Dashboard 主页面
 */
const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // 计算关键指标
  const metrics = useMemo(() => {
    const totalAssets = NETWORK_NODES.length;
    const totalVulnerabilities = VULNERABILITIES.length;
    const criticalVulns = VULNERABILITIES.filter(v => v.severity === 'critical').length;
    const highVulns = VULNERABILITIES.filter(v => v.severity === 'high').length;
    const totalScenes = SCENES.length;
    const totalSimulations = 156; // Mock数据

    // 计算防御覆盖率
    const totalDefenseMeasures = DEFENSE_SCENARIOS.reduce(
      (sum, scenario) => sum + scenario.deployments.length,
      0
    );
    const defenseCoverage = ((totalDefenseMeasures / totalAssets) * 100).toFixed(1);

    return {
      totalAssets,
      totalVulnerabilities,
      criticalVulns,
      highVulns,
      totalScenes,
      totalSimulations,
      defenseCoverage
    };
  }, []);

  // 资产安全评分分布数据
  const getAssetScoreDistribution = () => {
    const scoreRanges = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0
    };

    NETWORK_NODES.forEach(node => {
      const score = node.securityScore || 50;
      if (score <= 20) scoreRanges['0-20']++;
      else if (score <= 40) scoreRanges['21-40']++;
      else if (score <= 60) scoreRanges['41-60']++;
      else if (score <= 80) scoreRanges['61-80']++;
      else scoreRanges['81-100']++;
    });

    return {
      title: {
        text: '资产安全评分分布',
        left: 'center',
        textStyle: { fontSize: 14 }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      xAxis: {
        type: 'category',
        data: Object.keys(scoreRanges)
      },
      yAxis: {
        type: 'value',
        name: '资产数量'
      },
      series: [
        {
          name: '资产数量',
          type: 'bar',
          data: Object.values(scoreRanges),
          itemStyle: {
            color: (params: any) => {
              const colors = ['#f5222d', '#fa8c16', '#faad14', '#52c41a', '#1890ff'];
              return colors[params.dataIndex];
            }
          },
          label: {
            show: true,
            position: 'top'
          }
        }
      ]
    };
  };

  // ATT&CK覆盖度雷达图
  const getAttackCoverageRadar = () => {
    const tactics = [
      'Reconnaissance',
      'Resource Development',
      'Initial Access',
      'Execution',
      'Persistence',
      'Privilege Escalation',
      'Defense Evasion',
      'Credential Access',
      'Discovery',
      'Lateral Movement',
      'Collection',
      'Command and Control',
      'Exfiltration',
      'Impact'
    ];

    // 计算每个战术的覆盖度
    const coverageData = tactics.map(tactic => {
      const techniques = ATTACK_TECHNIQUES.filter(t => t.tacticName === tactic);
      return techniques.length > 0 ? Math.min(100, techniques.length * 15) : 0;
    });

    return {
      title: {
        text: 'ATT&CK 战术覆盖度',
        left: 'center',
        textStyle: { fontSize: 14 }
      },
      tooltip: {
        trigger: 'item'
      },
      radar: {
        indicator: tactics.map(tactic => ({
          name: tactic.replace(' ', '\n'),
          max: 100
        })),
        radius: '60%'
      },
      series: [
        {
          name: '覆盖度',
          type: 'radar',
          data: [
            {
              value: coverageData,
              name: '当前覆盖度',
              areaStyle: {
                color: 'rgba(24, 144, 255, 0.3)'
              },
              itemStyle: {
                color: '#1890ff'
              }
            }
          ]
        }
      ]
    };
  };

  // 漏洞严重等级分布饼图
  const getVulnerabilitySeverityPie = () => {
    const severityCounts = {
      critical: VULNERABILITIES.filter(v => v.severity === 'critical').length,
      high: VULNERABILITIES.filter(v => v.severity === 'high').length,
      medium: VULNERABILITIES.filter(v => v.severity === 'medium').length,
      low: VULNERABILITIES.filter(v => v.severity === 'low').length
    };

    return {
      title: {
        text: '漏洞严重等级分布',
        left: 'center',
        textStyle: { fontSize: 14 }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        bottom: 10,
        left: 'center'
      },
      series: [
        {
          name: '漏洞数量',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            formatter: '{b}: {c}'
          },
          data: [
            { value: severityCounts.critical, name: '严重', itemStyle: { color: '#f5222d' } },
            { value: severityCounts.high, name: '高危', itemStyle: { color: '#fa8c16' } },
            { value: severityCounts.medium, name: '中危', itemStyle: { color: '#faad14' } },
            { value: severityCounts.low, name: '低危', itemStyle: { color: '#1890ff' } }
          ]
        }
      ]
    };
  };

  // 最近推演趋势折线图
  const getSimulationTrendLine = () => {
    // Mock数据：最近7天的推演次数
    const dates = [];
    const simulationCounts = [];
    const successRates = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(`${date.getMonth() + 1}/${date.getDate()}`);
      simulationCounts.push(Math.floor(Math.random() * 15) + 10);
      successRates.push(Math.floor(Math.random() * 30) + 60);
    }

    return {
      title: {
        text: '最近推演趋势',
        left: 'center',
        textStyle: { fontSize: 14 }
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['推演次数', '攻击成功率(%)'],
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
        boundaryGap: false,
        data: dates
      },
      yAxis: [
        {
          type: 'value',
          name: '推演次数',
          position: 'left'
        },
        {
          type: 'value',
          name: '成功率(%)',
          position: 'right',
          max: 100
        }
      ],
      series: [
        {
          name: '推演次数',
          type: 'line',
          data: simulationCounts,
          smooth: true,
          itemStyle: { color: '#1890ff' },
          areaStyle: {
            color: 'rgba(24, 144, 255, 0.2)'
          }
        },
        {
          name: '攻击成功率(%)',
          type: 'line',
          yAxisIndex: 1,
          data: successRates,
          smooth: true,
          itemStyle: { color: '#f5222d' }
        }
      ]
    };
  };

  // Mock告警数据
  const alerts = [
    {
      id: 1,
      level: 'critical',
      title: '检测到SQL注入攻击尝试',
      target: 'MySQL数据库服务器',
      time: '2分钟前',
      status: 'unhandled'
    },
    {
      id: 2,
      level: 'high',
      title: '异常登录行为',
      target: '域控制器',
      time: '15分钟前',
      status: 'handling'
    },
    {
      id: 3,
      level: 'medium',
      title: '端口扫描活动',
      target: 'API网关',
      time: '1小时前',
      status: 'handled'
    },
    {
      id: 4,
      level: 'high',
      title: '发现未授权访问',
      target: '文件服务器',
      time: '2小时前',
      status: 'handled'
    },
    {
      id: 5,
      level: 'low',
      title: '配置变更检测',
      target: '核心交换机',
      time: '3小时前',
      status: 'handled'
    }
  ];

  // 快捷入口配置
  const quickLinks = [
    {
      title: '攻防驾驶舱',
      icon: <ApartmentOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
      description: '2D网络沙盘',
      path: '/cockpit'
    },
    {
      title: '攻击路径推演',
      icon: <NodeIndexOutlined style={{ fontSize: 24, color: '#f5222d' }} />,
      description: '路径计算与可视化',
      path: '/cockpit/attack-path'
    },
    {
      title: '防御策略',
      icon: <SafetyCertificateOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
      description: '纵深防御配置',
      path: '/cockpit/defense'
    },
    {
      title: '知识图谱',
      icon: <NodeIndexOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
      description: '攻防知识关联',
      path: '/knowledge'
    },
    {
      title: '资产管理',
      icon: <DatabaseOutlined style={{ fontSize: 24, color: '#fa8c16' }} />,
      description: '资产清单与漏洞',
      path: '/asset'
    },
    {
      title: '场景管理',
      icon: <ExperimentOutlined style={{ fontSize: 24, color: '#13c2c2' }} />,
      description: '推演场景配置',
      path: '/scene'
    }
  ];

  // 渲染告警等级标签
  const renderAlertLevel = (level: string) => {
    const config: Record<string, { color: string; text: string }> = {
      critical: { color: 'red', text: '严重' },
      high: { color: 'orange', text: '高危' },
      medium: { color: 'gold', text: '中危' },
      low: { color: 'blue', text: '低危' }
    };
    const { color, text } = config[level] || { color: 'default', text: level };
    return <Tag color={color}>{text}</Tag>;
  };

  // 渲染告警状态
  const renderAlertStatus = (status: string) => {
    const config: Record<string, { icon: React.ReactNode; color: string; text: string }> = {
      unhandled: { icon: <WarningOutlined />, color: '#f5222d', text: '待处理' },
      handling: { icon: <ClockCircleOutlined />, color: '#fa8c16', text: '处理中' },
      handled: { icon: <CheckCircleOutlined />, color: '#52c41a', text: '已处理' }
    };
    const { icon, color, text } = config[status] || { icon: null, color: '#8c8c8c', text: status };
    return (
      <Space style={{ color }}>
        {icon}
        <span>{text}</span>
      </Space>
    );
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        系统总览
      </Title>

      {/* 关键指标卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="资产总数"
              value={metrics.totalAssets}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="漏洞总数"
              value={metrics.totalVulnerabilities}
              prefix={<BugOutlined />}
              valueStyle={{ color: '#f5222d' }}
              suffix={
                <Space size={4}>
                  <Tag color="red">{metrics.criticalVulns}</Tag>
                  <Tag color="orange">{metrics.highVulns}</Tag>
                </Space>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="推演场景"
              value={metrics.totalScenes}
              prefix={<ExperimentOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix={<Text type="secondary">/ {metrics.totalSimulations}次</Text>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="防御覆盖率"
              value={metrics.defenseCoverage}
              prefix={<SafetyOutlined />}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 统计图表 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts option={getAssetScoreDistribution()} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts option={getAttackCoverageRadar()} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts option={getVulnerabilitySeverityPie()} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts option={getSimulationTrendLine()} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      {/* 快捷入口和告警列表 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="快捷入口" extra={<LineChartOutlined />}>
            <Row gutter={[16, 16]}>
              {quickLinks.map((link, index) => (
                <Col xs={24} sm={12} md={8} key={index}>
                  <Card
                    hoverable
                    onClick={() => navigate(link.path)}
                    style={{ textAlign: 'center', cursor: 'pointer' }}
                  >
                    <Space direction="vertical" size="small">
                      {link.icon}
                      <Text strong>{link.title}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {link.description}
                      </Text>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <span>安全告警</span>
                <Badge count={alerts.filter(a => a.status === 'unhandled').length} />
              </Space>
            }
            extra={
              <Button type="link" onClick={() => navigate('/cockpit/monitor')}>
                查看全部 <RightOutlined />
              </Button>
            }
          >
            <List
              dataSource={alerts}
              renderItem={(alert) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        {renderAlertLevel(alert.level)}
                        <span>{alert.title}</span>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          目标: {alert.target}
                        </Text>
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {alert.time}
                          </Text>
                          {renderAlertStatus(alert.status)}
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;

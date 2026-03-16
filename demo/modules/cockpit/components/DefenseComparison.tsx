/**
 * P6.5 防御场景对比分析
 * 支持选择2-3个防御场景进行横向对比，给出推荐方案
 */

import React, { useState } from 'react';
import { Card, Select, Space, Table, Tag, Alert, Button, Row, Col, Statistic } from 'antd';
import {
  TrophyOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { DEFENSE_SCENARIOS, DefenseScenario } from '../../../mock/dynamic/defenseScenarios';

const { Option } = Select;

const DefenseComparison: React.FC = () => {
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<string[]>([]);

  const selectedScenarios = selectedScenarioIds
    .map(id => DEFENSE_SCENARIOS.find(s => s.scenarioId === id))
    .filter(Boolean) as DefenseScenario[];

  // 计算综合评分
  const calculateScore = (scenario: DefenseScenario): number => {
    const { expectedEffect, totalCost, deploymentTime, maintenanceBurden } = scenario;

    // 效果得分 (40%)
    const effectScore =
      (expectedEffect.attackSuccessRateReduction / 100) * 10 +
      (expectedEffect.detectionRateIncrease / 200) * 10 +
      (expectedEffect.responseTimeReduction / 100) * 10 +
      (expectedEffect.coverageIncrease / 100) * 10;

    // 成本得分 (30%) - 成本越低得分越高
    const costScore = Math.max(0, 30 - (totalCost / 300) * 30);

    // 部署时间得分 (20%) - 时间越短得分越高
    const timeScore = Math.max(0, 20 - (deploymentTime / 120) * 20);

    // 维护负担得分 (10%)
    const maintenanceScore =
      maintenanceBurden === 'low' ? 10 : maintenanceBurden === 'medium' ? 6 : 3;

    return effectScore + costScore + timeScore + maintenanceScore;
  };

  // 获取推荐场景
  const getRecommendedScenario = (): DefenseScenario | null => {
    if (selectedScenarios.length === 0) return null;

    return selectedScenarios.reduce((best, current) => {
      return calculateScore(current) > calculateScore(best) ? current : best;
    });
  };

  // 雷达图配置
  const getRadarChartOption = () => {
    if (selectedScenarios.length === 0) return {};

    const colors = ['#ff4d4f', '#1890ff', '#52c41a', '#fa8c16'];

    return {
      title: {
        text: '防御场景综合对比',
        left: 'center',
        textStyle: {
          fontSize: 14
        }
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        data: selectedScenarios.map(s => s.scenarioName),
        bottom: 10
      },
      radar: {
        indicator: [
          { name: '攻击成功率降低', max: 100 },
          { name: '检测率提升', max: 200 },
          { name: '响应时间缩短', max: 100 },
          { name: '覆盖度提升', max: 100 },
          { name: '成本效益', max: 100 },
          { name: '部署速度', max: 100 },
          { name: '维护便利性', max: 100 }
        ],
        radius: '60%'
      },
      series: [
        {
          name: '防御场景对比',
          type: 'radar',
          data: selectedScenarios.map((scenario, index) => ({
            value: [
              scenario.expectedEffect.attackSuccessRateReduction,
              scenario.expectedEffect.detectionRateIncrease,
              scenario.expectedEffect.responseTimeReduction,
              scenario.expectedEffect.coverageIncrease,
              Math.max(0, 100 - (scenario.totalCost / 300) * 100),
              Math.max(0, 100 - (scenario.deploymentTime / 120) * 100),
              scenario.maintenanceBurden === 'low' ? 100 : scenario.maintenanceBurden === 'medium' ? 60 : 30
            ],
            name: scenario.scenarioName,
            itemStyle: {
              color: colors[index % colors.length]
            },
            areaStyle: {
              color: colors[index % colors.length],
              opacity: 0.2
            }
          }))
        }
      ]
    };
  };

  // 柱状图配置 - 关键指标对比
  const getBarChartOption = () => {
    if (selectedScenarios.length === 0) return {};

    return {
      title: {
        text: '关键指标对比',
        left: 'center',
        textStyle: {
          fontSize: 14
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: selectedScenarios.map(s => s.scenarioName),
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
        data: ['成功率降低(%)', '检测率提升(%)', '响应时间缩短(%)', '覆盖度提升(%)']
      },
      yAxis: {
        type: 'value'
      },
      series: selectedScenarios.map((scenario, index) => ({
        name: scenario.scenarioName,
        type: 'bar',
        data: [
          scenario.expectedEffect.attackSuccessRateReduction,
          scenario.expectedEffect.detectionRateIncrease,
          scenario.expectedEffect.responseTimeReduction,
          scenario.expectedEffect.coverageIncrease
        ],
        itemStyle: {
          color: ['#ff4d4f', '#1890ff', '#52c41a', '#fa8c16'][index % 4]
        }
      }))
    };
  };

  // 对比表格列配置
  const comparisonColumns = [
    {
      title: '对比维度',
      dataIndex: 'dimension',
      key: 'dimension',
      fixed: 'left' as const,
      width: 150
    },
    ...selectedScenarios.map(scenario => ({
      title: scenario.scenarioName,
      dataIndex: scenario.scenarioId,
      key: scenario.scenarioId,
      render: (value: any) => value
    }))
  ];

  // 对比表格数据
  const comparisonData = [
    {
      key: '1',
      dimension: '场景类型',
      ...Object.fromEntries(
        selectedScenarios.map(s => [
          s.scenarioId,
          <Tag color="blue">
            {s.scenarioType === 'protection_depth'
              ? '防护手段纵深'
              : s.scenarioType === 'application_depth'
              ? '应用层级纵深'
              : s.scenarioType === 'network_depth'
              ? '网络纵深'
              : '攻击阶段纵深'}
          </Tag>
        ])
      )
    },
    {
      key: '2',
      dimension: '攻击成功率降低',
      ...Object.fromEntries(
        selectedScenarios.map(s => [
          s.scenarioId,
          <Tag color="green">{s.expectedEffect.attackSuccessRateReduction}%</Tag>
        ])
      )
    },
    {
      key: '3',
      dimension: '检测率提升',
      ...Object.fromEntries(
        selectedScenarios.map(s => [
          s.scenarioId,
          <Tag color="blue">{s.expectedEffect.detectionRateIncrease}%</Tag>
        ])
      )
    },
    {
      key: '4',
      dimension: '响应时间缩短',
      ...Object.fromEntries(
        selectedScenarios.map(s => [
          s.scenarioId,
          <Tag color="orange">{s.expectedEffect.responseTimeReduction}%</Tag>
        ])
      )
    },
    {
      key: '5',
      dimension: '覆盖度提升',
      ...Object.fromEntries(
        selectedScenarios.map(s => [
          s.scenarioId,
          <Tag color="purple">{s.expectedEffect.coverageIncrease}%</Tag>
        ])
      )
    },
    {
      key: '6',
      dimension: '总成本',
      ...Object.fromEntries(
        selectedScenarios.map(s => [s.scenarioId, `${s.totalCost} 万元`])
      )
    },
    {
      key: '7',
      dimension: '部署时间',
      ...Object.fromEntries(
        selectedScenarios.map(s => [s.scenarioId, `${s.deploymentTime} 小时`])
      )
    },
    {
      key: '8',
      dimension: '维护负担',
      ...Object.fromEntries(
        selectedScenarios.map(s => [
          s.scenarioId,
          <Tag
            color={
              s.maintenanceBurden === 'high'
                ? 'red'
                : s.maintenanceBurden === 'medium'
                ? 'orange'
                : 'green'
            }
          >
            {s.maintenanceBurden === 'high' ? '高' : s.maintenanceBurden === 'medium' ? '中' : '低'}
          </Tag>
        ])
      )
    },
    {
      key: '9',
      dimension: '防御措施数量',
      ...Object.fromEntries(
        selectedScenarios.map(s => [s.scenarioId, `${s.deployments.length} 个`])
      )
    },
    {
      key: '10',
      dimension: '综合评分',
      ...Object.fromEntries(
        selectedScenarios.map(s => [
          s.scenarioId,
          <Tag color="gold">{calculateScore(s).toFixed(1)} 分</Tag>
        ])
      )
    }
  ];

  const recommendedScenario = getRecommendedScenario();

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      {/* 场景选择 */}
      <Card title="选择对比场景" size="small">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <span style={{ marginRight: 8 }}>选择2-3个防御场景进行对比：</span>
            <Select
              mode="multiple"
              style={{ width: 600 }}
              placeholder="请选择防御场景（最多3个）"
              value={selectedScenarioIds}
              onChange={setSelectedScenarioIds}
              maxCount={3}
            >
              {DEFENSE_SCENARIOS.map(scenario => (
                <Option key={scenario.scenarioId} value={scenario.scenarioId}>
                  {scenario.scenarioName}
                </Option>
              ))}
            </Select>
          </div>
          {selectedScenarios.length < 2 && (
            <Alert
              message="请至少选择2个场景进行对比"
              type="info"
              showIcon
            />
          )}
        </Space>
      </Card>

      {/* 推荐方案 */}
      {recommendedScenario && selectedScenarios.length >= 2 && (
        <Card
          title={
            <Space>
              <TrophyOutlined style={{ color: '#faad14' }} />
              <span>推荐方案</span>
            </Space>
          }
          size="small"
          style={{ background: '#fffbe6', borderColor: '#faad14' }}
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Alert
                message={
                  <Space>
                    <CheckCircleOutlined />
                    <span style={{ fontSize: 16, fontWeight: 500 }}>
                      推荐使用：{recommendedScenario.scenarioName}
                    </span>
                  </Space>
                }
                description={
                  <Space direction="vertical" style={{ marginTop: 8 }}>
                    <div>{recommendedScenario.description}</div>
                    <div style={{ color: '#666' }}>
                      综合评分：
                      <Tag color="gold" style={{ fontSize: 14, marginLeft: 8 }}>
                        {calculateScore(recommendedScenario).toFixed(1)} 分
                      </Tag>
                    </div>
                  </Space>
                }
                type="success"
                showIcon
              />
            </Col>
            <Col span={6}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic
                  title="成功率降低"
                  value={recommendedScenario.expectedEffect.attackSuccessRateReduction}
                  suffix="%"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic
                  title="检测率提升"
                  value={recommendedScenario.expectedEffect.detectionRateIncrease}
                  suffix="%"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic
                  title="总成本"
                  value={recommendedScenario.totalCost}
                  suffix="万元"
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic
                  title="部署时间"
                  value={recommendedScenario.deploymentTime}
                  suffix="小时"
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* 对比表格 */}
      {selectedScenarios.length >= 2 && (
        <Card title="详细对比（10个维度）" size="small">
          <Table
            columns={comparisonColumns}
            dataSource={comparisonData}
            pagination={false}
            size="small"
            bordered
            scroll={{ x: 'max-content' }}
          />
        </Card>
      )}

      {/* 图表对比 */}
      {selectedScenarios.length >= 2 && (
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card size="small">
              <ReactECharts option={getRadarChartOption()} style={{ height: 400 }} />
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small">
              <ReactECharts option={getBarChartOption()} style={{ height: 400 }} />
            </Card>
          </Col>
        </Row>
      )}

      {/* 评分说明 */}
      {selectedScenarios.length >= 2 && (
        <Card title="综合评分说明" size="small">
          <Space direction="vertical">
            <div>
              <SafetyOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              <span>效果得分（40%）：基于攻击成功率降低、检测率提升、响应时间缩短、覆盖度提升</span>
            </div>
            <div>
              <DollarOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
              <span>成本得分（30%）：总成本越低得分越高</span>
            </div>
            <div>
              <ClockCircleOutlined style={{ marginRight: 8, color: '#722ed1' }} />
              <span>部署时间得分（20%）：部署时间越短得分越高</span>
            </div>
            <div>
              <CheckCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
              <span>维护负担得分（10%）：维护负担越低得分越高</span>
            </div>
          </Space>
        </Card>
      )}
    </Space>
  );
};

export default DefenseComparison;

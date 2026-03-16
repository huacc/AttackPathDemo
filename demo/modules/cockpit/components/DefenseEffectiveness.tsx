/**
 * P6.4 防御效果评估面板（独立组件）
 * 展示防御效果指标、攻击成功率变化、脆弱性改善情况
 */

import React from 'react';
import { Card, Row, Col, Statistic, Progress, Space, Descriptions, Tag } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { DefenseScenario } from '../../../mock/dynamic/defenseScenarios';

interface DefenseEffectivenessProps {
  scenario: DefenseScenario;
}

const DefenseEffectiveness: React.FC<DefenseEffectivenessProps> = ({ scenario }) => {
  const { simulationResult, scenarioName } = scenario;
  const { withoutDefense, withDefense, improvement } = simulationResult;

  // 柱状图配置 - 防御前后对比
  const getComparisonChartOption = () => {
    return {
      title: {
        text: '防御前后关键指标对比',
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
        data: ['防御前', '防御后'],
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
        data: ['攻击成功率', '检测率', '响应时间(分钟)', '受影响节点数']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '防御前',
          type: 'bar',
          data: [
            (withoutDefense.attackSuccessRate * 100).toFixed(1),
            (withoutDefense.detectionRate * 100).toFixed(1),
            withoutDefense.averageResponseTime,
            withoutDefense.affectedNodesCount
          ],
          itemStyle: {
            color: '#ff4d4f'
          }
        },
        {
          name: '防御后',
          type: 'bar',
          data: [
            (withDefense.attackSuccessRate * 100).toFixed(1),
            (withDefense.detectionRate * 100).toFixed(1),
            withDefense.averageResponseTime,
            withDefense.affectedNodesCount
          ],
          itemStyle: {
            color: '#52c41a'
          }
        }
      ]
    };
  };

  // 雷达图配置 - 防御效果综合评估
  const getRadarChartOption = () => {
    return {
      title: {
        text: '防御效果综合评估',
        left: 'center',
        textStyle: {
          fontSize: 14
        }
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        data: ['防御前', '防御后'],
        bottom: 10
      },
      radar: {
        indicator: [
          { name: '安全性', max: 100 },
          { name: '检测能力', max: 100 },
          { name: '响应速度', max: 100 },
          { name: '覆盖度', max: 100 },
          { name: '防护强度', max: 100 }
        ],
        radius: '60%'
      },
      series: [
        {
          name: '防御效果',
          type: 'radar',
          data: [
            {
              value: [
                ((1 - withoutDefense.attackSuccessRate) * 100).toFixed(1),
                (withoutDefense.detectionRate * 100).toFixed(1),
                Math.max(0, 100 - (withoutDefense.averageResponseTime / 150) * 100).toFixed(1),
                Math.max(0, 100 - (withoutDefense.affectedNodesCount / 30) * 100).toFixed(1),
                30
              ],
              name: '防御前',
              itemStyle: {
                color: '#ff4d4f'
              },
              areaStyle: {
                color: 'rgba(255, 77, 79, 0.2)'
              }
            },
            {
              value: [
                ((1 - withDefense.attackSuccessRate) * 100).toFixed(1),
                (withDefense.detectionRate * 100).toFixed(1),
                Math.max(0, 100 - (withDefense.averageResponseTime / 150) * 100).toFixed(1),
                Math.max(0, 100 - (withDefense.affectedNodesCount / 30) * 100).toFixed(1),
                85
              ],
              name: '防御后',
              itemStyle: {
                color: '#52c41a'
              },
              areaStyle: {
                color: 'rgba(82, 196, 26, 0.2)'
              }
            }
          ]
        }
      ]
    };
  };

  // 改善趋势图
  const getImprovementChartOption = () => {
    return {
      title: {
        text: '防御效果改善幅度',
        left: 'center',
        textStyle: {
          fontSize: 14
        }
      },
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c}%'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['成功率降低', '检测率提升', '响应时间缩短', '受影响节点减少']
      },
      yAxis: {
        type: 'value',
        name: '改善幅度 (%)'
      },
      series: [
        {
          type: 'bar',
          data: [
            {
              value: improvement.successRateReduction.toFixed(1),
              itemStyle: { color: '#52c41a' }
            },
            {
              value: improvement.detectionRateIncrease.toFixed(1),
              itemStyle: { color: '#1890ff' }
            },
            {
              value: improvement.responseTimeReduction.toFixed(1),
              itemStyle: { color: '#fa8c16' }
            },
            {
              value: improvement.affectedNodesReduction.toFixed(1),
              itemStyle: { color: '#722ed1' }
            }
          ],
          label: {
            show: true,
            position: 'top',
            formatter: '{c}%'
          }
        }
      ]
    };
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      {scenarioName && (
        <Card size="small">
          <Space>
            <Tag color="blue">当前场景</Tag>
            <span style={{ fontWeight: 500 }}>{scenarioName}</span>
          </Space>
        </Card>
      )}

      {/* 关键效果指标 */}
      <Card title="关键效果指标" size="small">
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card size="small" style={{ textAlign: 'center', background: '#f6ffed' }}>
              <Statistic
                title="攻击成功率降低"
                value={improvement.successRateReduction.toFixed(1)}
                precision={1}
                suffix="%"
                prefix={<FallOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                {(withoutDefense.attackSuccessRate * 100).toFixed(1)}% → {(withDefense.attackSuccessRate * 100).toFixed(1)}%
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ textAlign: 'center', background: '#e6f7ff' }}>
              <Statistic
                title="检测率提升"
                value={improvement.detectionRateIncrease.toFixed(1)}
                precision={1}
                suffix="%"
                prefix={<RiseOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                {(withoutDefense.detectionRate * 100).toFixed(1)}% → {(withDefense.detectionRate * 100).toFixed(1)}%
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ textAlign: 'center', background: '#fff7e6' }}>
              <Statistic
                title="响应时间缩短"
                value={improvement.responseTimeReduction.toFixed(1)}
                precision={1}
                suffix="%"
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                {withoutDefense.averageResponseTime}分钟 → {withDefense.averageResponseTime}分钟
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ textAlign: 'center', background: '#f9f0ff' }}>
              <Statistic
                title="受影响节点减少"
                value={improvement.affectedNodesReduction.toFixed(1)}
                precision={1}
                suffix="%"
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                {withoutDefense.affectedNodesCount}个 → {withDefense.affectedNodesCount}个
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 防御前后详细对比 */}
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="防御前状态" size="small" style={{ background: '#fff1f0' }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="攻击成功率">
                <Space>
                  <Progress
                    type="circle"
                    percent={Number((withoutDefense.attackSuccessRate * 100).toFixed(1))}
                    width={60}
                    strokeColor="#ff4d4f"
                  />
                  <Tag color="red">{(withoutDefense.attackSuccessRate * 100).toFixed(1)}%</Tag>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="检测率">
                <Space>
                  <Progress
                    percent={Number((withoutDefense.detectionRate * 100).toFixed(1))}
                    strokeColor="#ff4d4f"
                    style={{ width: 200 }}
                  />
                  <span>{(withoutDefense.detectionRate * 100).toFixed(1)}%</span>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="平均响应时间">
                <Tag color="red">{withoutDefense.averageResponseTime} 分钟</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="受影响节点">
                <Tag color="red">{withoutDefense.affectedNodesCount} 个</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="防御后状态" size="small" style={{ background: '#f6ffed' }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="攻击成功率">
                <Space>
                  <Progress
                    type="circle"
                    percent={Number((withDefense.attackSuccessRate * 100).toFixed(1))}
                    width={60}
                    strokeColor="#52c41a"
                  />
                  <Tag color="green">{(withDefense.attackSuccessRate * 100).toFixed(1)}%</Tag>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="检测率">
                <Space>
                  <Progress
                    percent={Number((withDefense.detectionRate * 100).toFixed(1))}
                    strokeColor="#52c41a"
                    style={{ width: 200 }}
                  />
                  <span>{(withDefense.detectionRate * 100).toFixed(1)}%</span>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="平均响应时间">
                <Tag color="green">{withDefense.averageResponseTime} 分钟</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="受影响节点">
                <Tag color="green">{withDefense.affectedNodesCount} 个</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* 图表展示 */}
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card size="small">
            <ReactECharts option={getComparisonChartOption()} style={{ height: 350 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small">
            <ReactECharts option={getRadarChartOption()} style={{ height: 350 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card size="small">
            <ReactECharts option={getImprovementChartOption()} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      {/* 综合评估 */}
      <Card title="综合评估" size="small">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Space>
              {improvement.successRateReduction >= 60 ? (
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
              ) : (
                <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />
              )}
              <span>
                攻击成功率降低 <strong>{improvement.successRateReduction.toFixed(1)}%</strong>
                {improvement.successRateReduction >= 60 ? '，防御效果显著' : '，建议加强防御措施'}
              </span>
            </Space>
          </div>
          <div>
            <Space>
              {improvement.detectionRateIncrease >= 100 ? (
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
              ) : (
                <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />
              )}
              <span>
                检测率提升 <strong>{improvement.detectionRateIncrease.toFixed(1)}%</strong>
                {improvement.detectionRateIncrease >= 100 ? '，检测能力大幅提升' : '，检测能力有待提高'}
              </span>
            </Space>
          </div>
          <div>
            <Space>
              {improvement.responseTimeReduction >= 40 ? (
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
              ) : (
                <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />
              )}
              <span>
                响应时间缩短 <strong>{improvement.responseTimeReduction.toFixed(1)}%</strong>
                {improvement.responseTimeReduction >= 40 ? '，响应速度明显加快' : '，响应速度改善有限'}
              </span>
            </Space>
          </div>
          <div>
            <Space>
              {improvement.affectedNodesReduction >= 50 ? (
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
              ) : (
                <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />
              )}
              <span>
                受影响节点减少 <strong>{improvement.affectedNodesReduction.toFixed(1)}%</strong>
                {improvement.affectedNodesReduction >= 50 ? '，攻击影响范围大幅缩小' : '，攻击影响范围仍需控制'}
              </span>
            </Space>
          </div>
        </Space>
      </Card>
    </Space>
  );
};

export default DefenseEffectiveness;

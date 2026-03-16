/**
 * P4.4 覆盖度分析
 * ATT&CK覆盖度分析：百分比+热力图+雷达图
 * 防御缺口识别
 */

import React, { useEffect, useRef } from 'react';
import {
  Card,
  Space,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Tag,
  Alert,
  List,
  Badge
} from 'antd';
import {
  PieChartOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  RadarChartOutlined
} from '@ant-design/icons';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { attackTactics } from '../../mock/static/attackFramework';
import { attackTechniques } from '../../mock/static/attackTechniques';

// ==================== 类型定义 ====================

interface TacticCoverage {
  tacticId: string;
  tacticName: string;
  totalTechniques: number;
  coveredTechniques: number;
  coverageRate: number;
  uncoveredTechniques: string[];
}

interface CoverageGap {
  techniqueId: string;
  techniqueName: string;
  tacticName: string;
  severity: 'high' | 'medium' | 'low';
  riskScore: number;
}

// ==================== 主组件 ====================

const CoverageAnalysis: React.FC = () => {
  const radarChartRef = useRef<HTMLDivElement>(null);
  const heatmapChartRef = useRef<HTMLDivElement>(null);

  // 计算覆盖度数据
  const calculateCoverage = (): TacticCoverage[] => {
    return attackTactics.map(tactic => {
      const techniques = attackTechniques.filter(t => t.tacticId === tactic.tacticId);
      const totalTechniques = techniques.length;
      // 模拟覆盖情况：随机70-90%的技术被覆盖
      const coveredCount = Math.floor(totalTechniques * (0.7 + Math.random() * 0.2));
      const uncovered = techniques
        .slice(coveredCount)
        .map(t => t.techniqueId);

      return {
        tacticId: tactic.tacticId,
        tacticName: tactic.tacticName,
        totalTechniques,
        coveredTechniques: coveredCount,
        coverageRate: (coveredCount / totalTechniques) * 100,
        uncoveredTechniques: uncovered
      };
    });
  };

  const coverageData = calculateCoverage();

  // 计算总体覆盖度
  const totalTechniques = coverageData.reduce((sum, t) => sum + t.totalTechniques, 0);
  const totalCovered = coverageData.reduce((sum, t) => sum + t.coveredTechniques, 0);
  const overallCoverage = (totalCovered / totalTechniques) * 100;

  // 识别防御缺口
  const identifyGaps = (): CoverageGap[] => {
    const gaps: CoverageGap[] = [];
    coverageData.forEach(tactic => {
      tactic.uncoveredTechniques.forEach(techId => {
        const tech = attackTechniques.find(t => t.techniqueId === techId);
        if (tech) {
          gaps.push({
            techniqueId: tech.techniqueId,
            techniqueName: tech.techniqueName,
            tacticName: tactic.tacticName,
            severity: tech.baseSuccessRate > 0.8 ? 'high' : tech.baseSuccessRate > 0.6 ? 'medium' : 'low',
            riskScore: tech.baseSuccessRate * 100
          });
        }
      });
    });
    return gaps.sort((a, b) => b.riskScore - a.riskScore);
  };

  const coverageGaps = identifyGaps();

  // 雷达图配置
  useEffect(() => {
    if (!radarChartRef.current) return;

    const chart = echarts.init(radarChartRef.current);
    const option: EChartsOption = {
      title: {
        text: 'ATT&CK战术覆盖度雷达图',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        }
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        bottom: 10,
        data: ['当前覆盖度', '目标覆盖度']
      },
      radar: {
        indicator: coverageData.map(t => ({
          name: t.tacticName.length > 15 ? t.tacticName.substring(0, 15) + '...' : t.tacticName,
          max: 100
        })),
        radius: '60%'
      },
      series: [
        {
          name: '覆盖度分析',
          type: 'radar',
          data: [
            {
              value: coverageData.map(t => t.coverageRate),
              name: '当前覆盖度',
              areaStyle: {
                color: 'rgba(24, 144, 255, 0.3)'
              },
              lineStyle: {
                color: '#1890ff'
              },
              itemStyle: {
                color: '#1890ff'
              }
            },
            {
              value: coverageData.map(() => 95),
              name: '目标覆盖度',
              areaStyle: {
                color: 'rgba(82, 196, 26, 0.1)'
              },
              lineStyle: {
                color: '#52c41a',
                type: 'dashed'
              },
              itemStyle: {
                color: '#52c41a'
              }
            }
          ]
        }
      ]
    };

    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [coverageData]);

  // 热力图配置
  useEffect(() => {
    if (!heatmapChartRef.current) return;

    const chart = echarts.init(heatmapChartRef.current);

    // 准备热力图数据
    const heatmapData = coverageData.map((tactic, index) => [
      index,
      0,
      tactic.coverageRate
    ]);

    const option: EChartsOption = {
      title: {
        text: 'ATT&CK战术覆盖度热力图',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        }
      },
      tooltip: {
        position: 'top',
        formatter: (params: any) => {
          const tactic = coverageData[params.data[0]];
          return `${tactic.tacticName}<br/>覆盖度: ${tactic.coverageRate.toFixed(1)}%<br/>已覆盖: ${tactic.coveredTechniques}/${tactic.totalTechniques}`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: coverageData.map(t => t.tacticName),
        axisLabel: {
          rotate: 45,
          interval: 0,
          fontSize: 10
        }
      },
      yAxis: {
        type: 'category',
        data: ['覆盖度'],
        axisLabel: {
          fontSize: 12
        }
      },
      visualMap: {
        min: 0,
        max: 100,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        inRange: {
          color: ['#ff4d4f', '#faad14', '#52c41a']
        },
        text: ['高', '低'],
        textStyle: {
          fontSize: 12
        }
      },
      series: [
        {
          name: '覆盖度',
          type: 'heatmap',
          data: heatmapData,
          label: {
            show: true,
            formatter: (params: any) => `${params.data[2].toFixed(0)}%`,
            fontSize: 11
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };

    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [coverageData]);

  // 表格列定义
  const columns = [
    {
      title: '战术',
      dataIndex: 'tacticName',
      key: 'tacticName',
      width: 200
    },
    {
      title: '总技术数',
      dataIndex: 'totalTechniques',
      key: 'totalTechniques',
      width: 100,
      align: 'center' as const
    },
    {
      title: '已覆盖',
      dataIndex: 'coveredTechniques',
      key: 'coveredTechniques',
      width: 100,
      align: 'center' as const,
      render: (val: number) => <Tag color="green">{val}</Tag>
    },
    {
      title: '未覆盖',
      key: 'uncovered',
      width: 100,
      align: 'center' as const,
      render: (_: any, record: TacticCoverage) => (
        <Tag color="red">{record.uncoveredTechniques.length}</Tag>
      )
    },
    {
      title: '覆盖率',
      dataIndex: 'coverageRate',
      key: 'coverageRate',
      width: 200,
      render: (rate: number) => (
        <Progress
          percent={rate}
          size="small"
          status={rate >= 90 ? 'success' : rate >= 70 ? 'normal' : 'exception'}
        />
      )
    }
  ];

  const gapColumns = [
    {
      title: '技术ID',
      dataIndex: 'techniqueId',
      key: 'techniqueId',
      width: 120
    },
    {
      title: '技术名称',
      dataIndex: 'techniqueName',
      key: 'techniqueName'
    },
    {
      title: '所属战术',
      dataIndex: 'tacticName',
      key: 'tacticName',
      width: 150
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity: string) => (
        <Tag color={severity === 'high' ? 'red' : severity === 'medium' ? 'orange' : 'default'}>
          {severity.toUpperCase()}
        </Tag>
      )
    },
    {
      title: '风险评分',
      dataIndex: 'riskScore',
      key: 'riskScore',
      width: 120,
      render: (score: number) => (
        <Tag color={score >= 80 ? 'red' : score >= 60 ? 'orange' : 'blue'}>
          {score.toFixed(0)}
        </Tag>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <Space>
            <PieChartOutlined />
            <span>ATT&CK覆盖度分析</span>
          </Space>
        }
      >
        {/* 总体统计 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Statistic
              title="总体覆盖度"
              value={overallCoverage}
              precision={1}
              suffix="%"
              valueStyle={{
                color: overallCoverage >= 90 ? '#3f8600' : overallCoverage >= 70 ? '#faad14' : '#cf1322'
              }}
              prefix={<CheckCircleOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="已覆盖技术"
              value={totalCovered}
              suffix={`/ ${totalTechniques}`}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="防御缺口"
              value={coverageGaps.length}
              suffix="个"
              valueStyle={{ color: '#cf1322' }}
              prefix={<WarningOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="高风险缺口"
              value={coverageGaps.filter(g => g.severity === 'high').length}
              suffix="个"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Col>
        </Row>

        {/* 覆盖度提示 */}
        <Alert
          message="覆盖度分析说明"
          description={`当前防御措施覆盖了 ${totalCovered} 个ATT&CK技术（共${totalTechniques}个），总体覆盖度为 ${overallCoverage.toFixed(1)}%。建议优先关注高风险防御缺口。`}
          type={overallCoverage >= 90 ? 'success' : overallCoverage >= 70 ? 'warning' : 'error'}
          showIcon
          style={{ marginBottom: 24 }}
        />

        {/* 雷达图 */}
        <Card
          title={
            <Space>
              <RadarChartOutlined />
              <span>战术维度覆盖度雷达图</span>
            </Space>
          }
          size="small"
          style={{ marginBottom: 24 }}
        >
          <div ref={radarChartRef} style={{ width: '100%', height: 500 }} />
        </Card>

        {/* 热力图 */}
        <Card
          title="战术覆盖度热力图"
          size="small"
          style={{ marginBottom: 24 }}
        >
          <div ref={heatmapChartRef} style={{ width: '100%', height: 300 }} />
        </Card>

        {/* 详细覆盖度表格 */}
        <Card
          title="战术覆盖度详情"
          size="small"
          style={{ marginBottom: 24 }}
        >
          <Table
            columns={columns}
            dataSource={coverageData}
            rowKey="tacticId"
            pagination={false}
            size="small"
          />
        </Card>

        {/* 防御缺口列表 */}
        <Card
          title={
            <Space>
              <WarningOutlined />
              <span>防御缺口识别</span>
              <Badge count={coverageGaps.length} showZero />
            </Space>
          }
          size="small"
        >
          <Table
            columns={gapColumns}
            dataSource={coverageGaps}
            rowKey="techniqueId"
            pagination={{ pageSize: 10 }}
            size="small"
          />
        </Card>
      </Card>
    </div>
  );
};

export default CoverageAnalysis;

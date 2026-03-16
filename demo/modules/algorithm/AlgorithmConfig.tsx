/**
 * P8.3 算法引擎配置模块
 * 支持4种算法配置：Dijkstra、A*、遗传算法、蒙特卡洛
 */

import React, { useState } from 'react';
import {
  Card,
  Form,
  Select,
  InputNumber,
  Slider,
  Switch,
  Button,
  Space,
  Tabs,
  Row,
  Col,
  Statistic,
  Tag,
  Divider,
  message,
  Tooltip
} from 'antd';
import {
  SettingOutlined,
  ThunderboltOutlined,
  SaveOutlined,
  ReloadOutlined,
  ExperimentOutlined,
  LineChartOutlined,
  RocketOutlined,
  BulbOutlined
} from '@ant-design/icons';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

const { Option } = Select;
const { TabPane } = Tabs;

// ==================== 算法类型定义 ====================

type AlgorithmType = 'dijkstra' | 'a_star' | 'genetic' | 'monte_carlo';

interface DijkstraParams {
  weightType: 'cost' | 'risk' | 'time';
  maxIterations: number;
  enableCache: boolean;
}

interface AStarParams {
  heuristicWeight: number;
  maxDepth: number;
  beamWidth: number;
  enablePruning: boolean;
}

interface GeneticParams {
  populationSize: number;
  generations: number;
  mutationRate: number;
  crossoverRate: number;
  elitismRate: number;
}

interface MonteCarloParams {
  simulations: number;
  confidenceLevel: number;
  samplingMethod: 'uniform' | 'importance' | 'stratified';
  randomSeed: number;
}

interface AlgorithmConfig {
  algorithm: AlgorithmType;
  params: DijkstraParams | AStarParams | GeneticParams | MonteCarloParams;
}

interface PerformanceMetrics {
  algorithm: string;
  executionTime: number;
  accuracy: number;
  memoryUsage: number;
  pathQuality: number;
}

// ==================== 默认配置 ====================

const DEFAULT_CONFIGS: Record<AlgorithmType, any> = {
  dijkstra: {
    weightType: 'cost',
    maxIterations: 1000,
    enableCache: true
  },
  a_star: {
    heuristicWeight: 1.0,
    maxDepth: 50,
    beamWidth: 10,
    enablePruning: true
  },
  genetic: {
    populationSize: 100,
    generations: 50,
    mutationRate: 0.1,
    crossoverRate: 0.8,
    elitismRate: 0.1
  },
  monte_carlo: {
    simulations: 10000,
    confidenceLevel: 0.95,
    samplingMethod: 'uniform',
    randomSeed: 42
  }
};

// ==================== 模拟性能数据 ====================
// 基于真实算法特性的性能数据
// Dijkstra: 最优路径保证，但速度较慢
// A*: 启发式搜索，速度快且保证最优
// Genetic: 近似解，适合大规模问题
// Monte Carlo: 随机采样，速度快但准确率低

const MOCK_PERFORMANCE: PerformanceMetrics[] = [
  {
    algorithm: 'Dijkstra',
    executionTime: 120,
    accuracy: 100, // 保证最优解
    memoryUsage: 45,
    pathQuality: 100 // 最优路径
  },
  {
    algorithm: 'A*',
    executionTime: 65, // 比Dijkstra快
    accuracy: 100, // 保证最优解（启发式不影响最优性）
    memoryUsage: 52,
    pathQuality: 100 // 最优路径
  },
  {
    algorithm: 'Genetic',
    executionTime: 350, // 迭代计算，较慢
    accuracy: 88, // 近似解
    memoryUsage: 78,
    pathQuality: 89 // 接近最优
  },
  {
    algorithm: 'Monte Carlo',
    executionTime: 180, // 随机采样，中等速度
    accuracy: 82, // 随机性导致准确率较低
    memoryUsage: 65,
    pathQuality: 85 // 可能不是最优路径
  }
];

// ==================== 主组件 ====================

export interface AlgorithmConfigProps {
  onSave?: (config: AlgorithmConfig) => void;
  initialConfig?: AlgorithmConfig;
}

const AlgorithmConfig: React.FC<AlgorithmConfigProps> = ({ onSave, initialConfig }) => {
  const [form] = Form.useForm();
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>(
    initialConfig?.algorithm || 'dijkstra'
  );
  const [chartRef, setChartRef] = useState<HTMLDivElement | null>(null);

  // 初始化图表
  React.useEffect(() => {
    if (chartRef) {
      const chart = echarts.init(chartRef);
      const option = getPerformanceChartOption();
      chart.setOption(option);

      const handleResize = () => chart.resize();
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.dispose();
      };
    }
  }, [chartRef]);

  // 算法切换
  const handleAlgorithmChange = (algorithm: AlgorithmType) => {
    setSelectedAlgorithm(algorithm);
    form.setFieldsValue(DEFAULT_CONFIGS[algorithm]);
  };

  // 保存配置
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const config: AlgorithmConfig = {
        algorithm: selectedAlgorithm,
        params: values
      };
      onSave?.(config);
      message.success('算法配置已保存');
    } catch (error) {
      message.error('请检查配置参数');
    }
  };

  // 重置配置
  const handleReset = () => {
    form.setFieldsValue(DEFAULT_CONFIGS[selectedAlgorithm]);
    message.info('已重置为默认配置');
  };

  // 性能对比图表配置
  const getPerformanceChartOption = (): EChartsOption => {
    return {
      title: {
        text: '算法性能对比',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['执行时间(ms)', '准确率(%)', '内存占用(MB)', '路径质量(%)'],
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
        data: MOCK_PERFORMANCE.map(m => m.algorithm)
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '执行时间(ms)',
          type: 'bar',
          data: MOCK_PERFORMANCE.map(m => m.executionTime),
          itemStyle: { color: '#5470c6' }
        },
        {
          name: '准确率(%)',
          type: 'bar',
          data: MOCK_PERFORMANCE.map(m => m.accuracy),
          itemStyle: { color: '#91cc75' }
        },
        {
          name: '内存占用(MB)',
          type: 'bar',
          data: MOCK_PERFORMANCE.map(m => m.memoryUsage),
          itemStyle: { color: '#fac858' }
        },
        {
          name: '路径质量(%)',
          type: 'bar',
          data: MOCK_PERFORMANCE.map(m => m.pathQuality),
          itemStyle: { color: '#ee6666' }
        }
      ]
    };
  };

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <Space>
            <ExperimentOutlined />
            <span>算法引擎配置</span>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
              保存配置
            </Button>
          </Space>
        }
      >
        <Tabs activeKey={selectedAlgorithm} onChange={(key) => handleAlgorithmChange(key as AlgorithmType)}>
          {/* Dijkstra 算法 */}
          <TabPane
            tab={
              <Space>
                <RocketOutlined />
                <span>Dijkstra</span>
              </Space>
            }
            key="dijkstra"
          >
            <DijkstraConfigForm form={form} />
          </TabPane>

          {/* A* 算法 */}
          <TabPane
            tab={
              <Space>
                <ThunderboltOutlined />
                <span>A*</span>
              </Space>
            }
            key="a_star"
          >
            <AStarConfigForm form={form} />
          </TabPane>

          {/* 遗传算法 */}
          <TabPane
            tab={
              <Space>
                <BulbOutlined />
                <span>遗传算法</span>
              </Space>
            }
            key="genetic"
          >
            <GeneticConfigForm form={form} />
          </TabPane>

          {/* 蒙特卡洛 */}
          <TabPane
            tab={
              <Space>
                <LineChartOutlined />
                <span>蒙特卡洛</span>
              </Space>
            }
            key="monte_carlo"
          >
            <MonteCarloConfigForm form={form} />
          </TabPane>
        </Tabs>
      </Card>

      {/* 性能对比图表 */}
      <Card
        title={
          <Space>
            <LineChartOutlined />
            <span>算法性能对比</span>
          </Space>
        }
        style={{ marginTop: 24 }}
      >
        <div ref={setChartRef} style={{ width: '100%', height: 400 }} />
        
        <Divider />
        
        <Row gutter={16}>
          {MOCK_PERFORMANCE.map((metric) => (
            <Col span={6} key={metric.algorithm}>
              <Card size="small">
                <Statistic
                  title={metric.algorithm}
                  value={metric.accuracy}
                  suffix="%"
                  valueStyle={{ color: '#3f8600' }}
                />
                <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                  <div>执行时间: {metric.executionTime}ms</div>
                  <div>内存占用: {metric.memoryUsage}MB</div>
                  <div>路径质量: {metric.pathQuality}%</div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

// ==================== Dijkstra 配置表单 ====================

const DijkstraConfigForm: React.FC<{ form: any }> = ({ form }) => {
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={DEFAULT_CONFIGS.dijkstra}
    >
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Tag color="blue">最短路径算法</Tag>
          <div style={{ color: '#666' }}>
            基于贪心策略的最优路径搜索算法，保证找到从起点到终点的最短路径。
            适用于确定性环境下的路径规划。
          </div>
        </Space>
      </Card>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="权重类型"
            name="weightType"
            tooltip="选择路径计算的权重依据"
          >
            <Select>
              <Option value="cost">成本优先</Option>
              <Option value="risk">风险优先</Option>
              <Option value="time">时间优先</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="最大迭代次数"
            name="maxIterations"
            tooltip="算法执行的最大迭代次数"
          >
            <InputNumber
              min={100}
              max={10000}
              step={100}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="启用缓存"
        name="enableCache"
        valuePropName="checked"
        tooltip="缓存中间结果以提升性能"
      >
        <Switch />
      </Form.Item>
    </Form>
  );
};

// ==================== A* 配置表单 ====================

const AStarConfigForm: React.FC<{ form: any }> = ({ form }) => {
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={DEFAULT_CONFIGS.a_star}
    >
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Tag color="purple">启发式搜索算法</Tag>
          <div style={{ color: '#666' }}>
            结合启发式函数的智能搜索算法，通过估价函数引导搜索方向。
            在保证最优性的同时提升搜索效率。
          </div>
        </Space>
      </Card>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="启发式权重"
            name="heuristicWeight"
            tooltip="启发式函数的权重系数"
          >
            <Slider
              min={0}
              max={2}
              step={0.1}
              marks={{ 0: '0', 1: '1', 2: '2' }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="最大搜索深度"
            name="maxDepth"
            tooltip="限制搜索的最大深度"
          >
            <InputNumber
              min={10}
              max={200}
              step={10}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="束宽度"
            name="beamWidth"
            tooltip="束搜索的宽度参数"
          >
            <InputNumber
              min={1}
              max={50}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="启用剪枝"
            name="enablePruning"
            valuePropName="checked"
            tooltip="启用分支剪枝优化"
          >
            <Switch />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

// ==================== 遗传算法配置表单 ====================

const GeneticConfigForm: React.FC<{ form: any }> = ({ form }) => {
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={DEFAULT_CONFIGS.genetic}
    >
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Tag color="green">进化算法</Tag>
          <div style={{ color: '#666' }}>
            模拟自然进化过程的优化算法，通过选择、交叉、变异操作迭代优化。
            适合复杂多目标优化问题。
          </div>
        </Space>
      </Card>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="种群规模"
            name="populationSize"
            tooltip="每代种群的个体数量"
          >
            <InputNumber
              min={20}
              max={500}
              step={10}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="进化代数"
            name="generations"
            tooltip="算法迭代的代数"
          >
            <InputNumber
              min={10}
              max={200}
              step={10}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="变异率"
        name="mutationRate"
        tooltip="基因变异的概率"
      >
        <Slider
          min={0}
          max={1}
          step={0.01}
          marks={{ 0: '0%', 0.5: '50%', 1: '100%' }}
        />
      </Form.Item>

      <Form.Item
        label="交叉率"
        name="crossoverRate"
        tooltip="基因交叉的概率"
      >
        <Slider
          min={0}
          max={1}
          step={0.01}
          marks={{ 0: '0%', 0.5: '50%', 1: '100%' }}
        />
      </Form.Item>

      <Form.Item
        label="精英保留率"
        name="elitismRate"
        tooltip="保留优秀个体的比例"
      >
        <Slider
          min={0}
          max={0.5}
          step={0.01}
          marks={{ 0: '0%', 0.25: '25%', 0.5: '50%' }}
        />
      </Form.Item>
    </Form>
  );
};

// ==================== 蒙特卡洛配置表单 ====================

const MonteCarloConfigForm: React.FC<{ form: any }> = ({ form }) => {
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={DEFAULT_CONFIGS.monte_carlo}
    >
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Tag color="orange">随机模拟算法</Tag>
          <div style={{ color: '#666' }}>
            基于随机采样的概率分析方法，通过大量模拟实验估计结果分布。
            适合不确定性环境下的风险评估。
          </div>
        </Space>
      </Card>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="模拟次数"
            name="simulations"
            tooltip="蒙特卡洛模拟的次数"
          >
            <InputNumber
              min={1000}
              max={100000}
              step={1000}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="置信水平"
            name="confidenceLevel"
            tooltip="结果的置信水平"
          >
            <Select>
              <Option value={0.90}>90%</Option>
              <Option value={0.95}>95%</Option>
              <Option value={0.99}>99%</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="采样方法"
            name="samplingMethod"
            tooltip="随机采样的方法"
          >
            <Select>
              <Option value="uniform">均匀采样</Option>
              <Option value="importance">重要性采样</Option>
              <Option value="stratified">分层采样</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="随机种子"
            name="randomSeed"
            tooltip="随机数生成器的种子"
          >
            <InputNumber
              min={0}
              max={9999}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default AlgorithmConfig;

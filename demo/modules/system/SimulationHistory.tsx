/**
 * P8.4 推演历史记录
 * 展示历史推演记录列表和详情
 */

import React, { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Drawer,
  Descriptions,
  Timeline,
  Statistic,
  Row,
  Col,
  Input,
  Select,
  DatePicker
} from 'antd';
import {
  HistoryOutlined,
  EyeOutlined,
  DownloadOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { SIMULATION_HISTORY, SimulationHistoryRecord } from '../../mock/dynamic/history';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

// ==================== 主组件 ====================

const SimulationHistory: React.FC = () => {
  const [selectedRecord, setSelectedRecord] = useState<SimulationHistoryRecord | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAlgorithm, setFilterAlgorithm] = useState<string>('all');

  // 筛选数据
  const filteredData = SIMULATION_HISTORY.filter(record => {
    const matchKeyword = !searchKeyword ||
      record.sceneName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      record.recordId.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchStatus = filterStatus === 'all' || record.status === filterStatus;
    const matchAlgorithm = filterAlgorithm === 'all' || record.algorithm === filterAlgorithm;
    return matchKeyword && matchStatus && matchAlgorithm;
  });

  // 查看详情
  const handleViewDetail = (record: SimulationHistoryRecord) => {
    setSelectedRecord(record);
    setDrawerVisible(true);
  };

  // 导出记录
  const handleExport = (record: SimulationHistoryRecord) => {
    console.log('导出记录:', record.recordId);
    // 实际实现中会生成报告
  };

  // 表格列定义
  const columns: ColumnsType<SimulationHistoryRecord> = [
    {
      title: '记录ID',
      dataIndex: 'recordId',
      key: 'recordId',
      width: 130,
      fixed: 'left'
    },
    {
      title: '场景名称',
      dataIndex: 'sceneName',
      key: 'sceneName',
      width: 200
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 160
    },
    {
      title: '持续时间',
      dataIndex: 'duration',
      key: 'duration',
      width: 120,
      render: (duration: number) => `${Math.floor(duration / 60)}分${duration % 60}秒`
    },
    {
      title: '算法',
      dataIndex: 'algorithm',
      key: 'algorithm',
      width: 120,
      render: (algorithm: string) => {
        const algorithmMap: Record<string, string> = {
          dijkstra: 'Dijkstra',
          a_star: 'A*',
          genetic: '遗传算法',
          monte_carlo: '蒙特卡洛'
        };
        return <Tag color="blue">{algorithmMap[algorithm]}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusConfig = {
          success: { color: 'success', icon: <CheckCircleOutlined />, text: '成功' },
          failed: { color: 'error', icon: <CloseCircleOutlined />, text: '失败' },
          timeout: { color: 'warning', icon: <ClockCircleOutlined />, text: '超时' }
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      }
    },
    {
      title: '路径数',
      dataIndex: 'pathsFound',
      key: 'pathsFound',
      width: 100,
      align: 'center'
    },
    {
      title: '攻击结果',
      dataIndex: 'attackSuccess',
      key: 'attackSuccess',
      width: 100,
      render: (success: boolean) => (
        <Tag color={success ? 'red' : 'green'}>
          {success ? '成功' : '失败'}
        </Tag>
      )
    },
    {
      title: '操作员',
      dataIndex: 'operator',
      key: 'operator',
      width: 100
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => handleExport(record)}
          >
            导出
          </Button>
        </Space>
      )
    }
  ];

  // 统计信息
  const stats = {
    total: SIMULATION_HISTORY.length,
    success: SIMULATION_HISTORY.filter(r => r.status === 'success').length,
    failed: SIMULATION_HISTORY.filter(r => r.status === 'failed').length,
    timeout: SIMULATION_HISTORY.filter(r => r.status === 'timeout').length
  };

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <Space>
            <HistoryOutlined />
            <span>推演历史记录</span>
          </Space>
        }
      >
        {/* 统计信息 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Statistic title="总记录数" value={stats.total} />
          </Col>
          <Col span={6}>
            <Statistic
              title="成功"
              value={stats.success}
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="失败"
              value={stats.failed}
              valueStyle={{ color: '#cf1322' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="超时"
              value={stats.timeout}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
        </Row>

        {/* 筛选面板 */}
        <Space style={{ marginBottom: 16, width: '100%' }} wrap>
          <Search
            placeholder="搜索场景名称或记录ID"
            style={{ width: 250 }}
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            onSearch={setSearchKeyword}
          />

          <Select
            style={{ width: 150 }}
            value={filterStatus}
            onChange={setFilterStatus}
            placeholder="状态"
          >
            <Option value="all">全部状态</Option>
            <Option value="success">成功</Option>
            <Option value="failed">失败</Option>
            <Option value="timeout">超时</Option>
          </Select>

          <Select
            style={{ width: 150 }}
            value={filterAlgorithm}
            onChange={setFilterAlgorithm}
            placeholder="算法"
          >
            <Option value="all">全部算法</Option>
            <Option value="dijkstra">Dijkstra</Option>
            <Option value="a_star">A*</Option>
            <Option value="genetic">遗传算法</Option>
            <Option value="monte_carlo">蒙特卡洛</Option>
          </Select>
        </Space>

        {/* 历史记录表格 */}
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="recordId"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* 详情抽屉 */}
      <Drawer
        title="推演详情"
        placement="right"
        width={600}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedRecord && (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="记录ID">
                {selectedRecord.recordId}
              </Descriptions.Item>
              <Descriptions.Item label="场景名称">
                {selectedRecord.sceneName}
              </Descriptions.Item>
              <Descriptions.Item label="开始时间">
                {selectedRecord.startTime}
              </Descriptions.Item>
              <Descriptions.Item label="结束时间">
                {selectedRecord.endTime}
              </Descriptions.Item>
              <Descriptions.Item label="持续时间">
                {Math.floor(selectedRecord.duration / 60)}分{selectedRecord.duration % 60}秒
              </Descriptions.Item>
              <Descriptions.Item label="算法">
                <Tag color="blue">
                  {selectedRecord.algorithm === 'dijkstra' ? 'Dijkstra' :
                   selectedRecord.algorithm === 'a_star' ? 'A*' :
                   selectedRecord.algorithm === 'genetic' ? '遗传算法' : '蒙特卡洛'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={
                  selectedRecord.status === 'success' ? 'success' :
                  selectedRecord.status === 'failed' ? 'error' : 'warning'
                }>
                  {selectedRecord.status === 'success' ? '成功' :
                   selectedRecord.status === 'failed' ? '失败' : '超时'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="发现路径数">
                {selectedRecord.pathsFound}
              </Descriptions.Item>
              <Descriptions.Item label="攻击结果">
                <Tag color={selectedRecord.attackSuccess ? 'red' : 'green'}>
                  {selectedRecord.attackSuccess ? '攻击成功' : '攻击失败'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="目标节点">
                {selectedRecord.targetNode}
              </Descriptions.Item>
              <Descriptions.Item label="操作员">
                {selectedRecord.operator}
              </Descriptions.Item>
            </Descriptions>

            <Card title="推演时间线" size="small" style={{ marginTop: 16 }}>
              <Timeline
                items={[
                  {
                    color: 'blue',
                    children: `${selectedRecord.startTime} - 推演开始`
                  },
                  {
                    color: 'green',
                    children: `算法: ${selectedRecord.algorithm}`
                  },
                  {
                    color: 'orange',
                    children: `发现 ${selectedRecord.pathsFound} 条攻击路径`
                  },
                  {
                    color: selectedRecord.attackSuccess ? 'red' : 'green',
                    children: selectedRecord.attackSuccess ? '攻击成功' : '防御成功'
                  },
                  {
                    color: selectedRecord.status === 'success' ? 'green' : 'red',
                    children: `${selectedRecord.endTime} - 推演${
                      selectedRecord.status === 'success' ? '完成' : '异常结束'
                    }`
                  }
                ]}
              />
            </Card>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default SimulationHistory;

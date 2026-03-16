/**
 * P8.4 报告生成
 * 选择推演记录生成报告预览和导出
 */

import React, { useState, useRef } from 'react';
import {
  Card,
  Space,
  Select,
  Button,
  Divider,
  Typography,
  Table,
  Tag,
  Alert,
  message
} from 'antd';
import {
  FileTextOutlined,
  DownloadOutlined,
  PrinterOutlined,
  FilePdfOutlined,
  FileMarkdownOutlined
} from '@ant-design/icons';
import { SIMULATION_HISTORY } from '../../mock/dynamic/history';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

// ==================== 主组件 ====================

const ReportGeneration: React.FC = () => {
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const selectedRecord = SIMULATION_HISTORY.find(r => r.recordId === selectedRecordId);

  // 导出HTML
  const handleExportHTML = () => {
    if (!reportRef.current) return;
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>攻防推演报告 - ${selectedRecord?.recordId}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
    h1 { color: #1890ff; border-bottom: 2px solid #1890ff; padding-bottom: 10px; }
    h2 { color: #333; margin-top: 30px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #f0f0f0; font-weight: bold; }
    .tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
    .tag-success { background-color: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
    .tag-error { background-color: #fff2f0; color: #ff4d4f; border: 1px solid #ffccc7; }
    .alert { padding: 15px; margin: 20px 0; border-radius: 4px; }
    .alert-warning { background-color: #fffbe6; border: 1px solid #ffe58f; }
  </style>
</head>
<body>
  ${reportRef.current.innerHTML}
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${selectedRecord?.recordId}.html`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('报告已导出为HTML');
  };

  // 打印报告
  const handlePrint = () => {
    window.print();
    message.success('正在打印报告');
  };

  // 模拟导出PDF
  const handleExportPDF = () => {
    message.info('PDF导出功能需要后端支持，当前为模拟导出');
    // 实际实现中会调用后端API生成PDF
  };

  if (!selectedRecord) {
    return (
      <div style={{ padding: 24 }}>
        <Card
          title={
            <Space>
              <FileTextOutlined />
              <span>报告生成</span>
            </Space>
          }
        >
          <Alert
            message="请选择推演记录"
            description="从下拉列表中选择一条推演记录以生成报告"
            type="info"
            showIcon
          />
          <Select
            style={{ width: '100%', marginTop: 16 }}
            placeholder="选择推演记录"
            onChange={setSelectedRecordId}
          >
            {SIMULATION_HISTORY.map(record => (
              <Option key={record.recordId} value={record.recordId}>
                {record.recordId} - {record.sceneName} ({record.startTime})
              </Option>
            ))}
          </Select>
        </Card>
      </div>
    );
  }

  // 模拟攻击路径数据
  const attackPaths = [
    {
      pathId: 'path-1',
      steps: 5,
      successRate: 0.85,
      techniques: ['T1190', 'T1059', 'T1003'],
      risk: 'high'
    },
    {
      pathId: 'path-2',
      steps: 7,
      successRate: 0.72,
      techniques: ['T1566', 'T1204', 'T1055', 'T1003'],
      risk: 'medium'
    },
    {
      pathId: 'path-3',
      steps: 6,
      successRate: 0.68,
      techniques: ['T1078', 'T1021', 'T1003'],
      risk: 'medium'
    }
  ];

  // 模拟防御效果数据
  const defenseEffectiveness = [
    { measure: '防火墙规则', coverage: 85, effectiveness: 78 },
    { measure: '入侵检测系统', coverage: 72, effectiveness: 65 },
    { measure: '端点防护', coverage: 90, effectiveness: 82 },
    { measure: '访问控制', coverage: 68, effectiveness: 70 }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <Space>
            <FileTextOutlined />
            <span>报告生成</span>
          </Space>
        }
        extra={
          <Space>
            <Select
              style={{ width: 300 }}
              value={selectedRecordId}
              onChange={setSelectedRecordId}
            >
              {SIMULATION_HISTORY.map(record => (
                <Option key={record.recordId} value={record.recordId}>
                  {record.recordId} - {record.sceneName}
                </Option>
              ))}
            </Select>
            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
              打印
            </Button>
            <Button icon={<FileMarkdownOutlined />} onClick={handleExportHTML}>
              导出HTML
            </Button>
            <Button
              type="primary"
              icon={<FilePdfOutlined />}
              onClick={handleExportPDF}
            >
              导出PDF
            </Button>
          </Space>
        }
      >
        {/* 报告内容 */}
        <div ref={reportRef} style={{ padding: '20px 0' }}>
          <Title level={2} style={{ textAlign: 'center', color: '#1890ff' }}>
            网络攻防推演报告
          </Title>

          <Divider />

          {/* 1. 场景概述 */}
          <Title level={3}>1. 场景概述</Title>
          <Paragraph>
            <Text strong>推演记录ID：</Text>{selectedRecord.recordId}
          </Paragraph>
          <Paragraph>
            <Text strong>场景名称：</Text>{selectedRecord.sceneName}
          </Paragraph>
          <Paragraph>
            <Text strong>推演时间：</Text>{selectedRecord.startTime} 至 {selectedRecord.endTime}
          </Paragraph>
          <Paragraph>
            <Text strong>持续时间：</Text>
            {Math.floor(selectedRecord.duration / 60)}分{selectedRecord.duration % 60}秒
          </Paragraph>
          <Paragraph>
            <Text strong>使用算法：</Text>
            {selectedRecord.algorithm === 'dijkstra' ? 'Dijkstra最短路径算法' :
             selectedRecord.algorithm === 'a_star' ? 'A*启发式搜索算法' :
             selectedRecord.algorithm === 'genetic' ? '遗传算法' : '蒙特卡洛模拟'}
          </Paragraph>
          <Paragraph>
            <Text strong>推演状态：</Text>
            <Tag color={selectedRecord.status === 'success' ? 'success' : 'error'}>
              {selectedRecord.status === 'success' ? '成功' : '失败'}
            </Tag>
          </Paragraph>
          <Paragraph>
            <Text strong>攻击结果：</Text>
            <Tag color={selectedRecord.attackSuccess ? 'error' : 'success'}>
              {selectedRecord.attackSuccess ? '攻击成功' : '防御成功'}
            </Tag>
          </Paragraph>

          <Divider />

          {/* 2. 攻击路径分析 */}
          <Title level={3}>2. 攻击路径分析</Title>
          <Paragraph>
            本次推演共发现 <Text strong>{selectedRecord.pathsFound}</Text> 条可行的攻击路径，
            目标节点为 <Text code>{selectedRecord.targetNode}</Text>。
            以下是主要攻击路径的详细分析：
          </Paragraph>

          <Table
            dataSource={attackPaths}
            rowKey="pathId"
            pagination={false}
            size="small"
            columns={[
              {
                title: '路径ID',
                dataIndex: 'pathId',
                key: 'pathId'
              },
              {
                title: '步骤数',
                dataIndex: 'steps',
                key: 'steps'
              },
              {
                title: '成功率',
                dataIndex: 'successRate',
                key: 'successRate',
                render: (rate: number) => `${(rate * 100).toFixed(0)}%`
              },
              {
                title: '使用技术',
                dataIndex: 'techniques',
                key: 'techniques',
                render: (techniques: string[]) => (
                  <Space wrap>
                    {techniques.map(t => <Tag key={t} color="red">{t}</Tag>)}
                  </Space>
                )
              },
              {
                title: '风险等级',
                dataIndex: 'risk',
                key: 'risk',
                render: (risk: string) => (
                  <Tag color={risk === 'high' ? 'red' : 'orange'}>
                    {risk === 'high' ? '高' : '中'}
                  </Tag>
                )
              }
            ]}
          />

          <Divider />

          {/* 3. 防御效果评估 */}
          <Title level={3}>3. 防御效果评估</Title>
          <Paragraph>
            当前防御体系的覆盖度和有效性评估如下：
          </Paragraph>

          <Table
            dataSource={defenseEffectiveness}
            rowKey="measure"
            pagination={false}
            size="small"
            columns={[
              {
                title: '防御措施',
                dataIndex: 'measure',
                key: 'measure'
              },
              {
                title: '覆盖度',
                dataIndex: 'coverage',
                key: 'coverage',
                render: (coverage: number) => `${coverage}%`
              },
              {
                title: '有效性',
                dataIndex: 'effectiveness',
                key: 'effectiveness',
                render: (effectiveness: number) => (
                  <Tag color={effectiveness >= 80 ? 'green' : effectiveness >= 60 ? 'orange' : 'red'}>
                    {effectiveness}%
                  </Tag>
                )
              }
            ]}
          />

          <Divider />

          {/* 4. 损伤评估 */}
          <Title level={3}>4. 损伤评估</Title>
          <Paragraph>
            {selectedRecord.attackSuccess ? (
              <>
                <Alert
                  message="攻击成功"
                  description={`攻击者成功突破防御体系，到达目标节点 ${selectedRecord.targetNode}。
                  预计造成的损失包括：数据泄露风险、系统可用性下降、业务中断等。`}
                  type="error"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <ul>
                  <li><Text strong>数据泄露风险：</Text>高 - 目标节点可能包含敏感数据</li>
                  <li><Text strong>系统可用性：</Text>中 - 攻击可能导致系统部分功能不可用</li>
                  <li><Text strong>业务影响：</Text>高 - 可能造成业务中断和声誉损失</li>
                  <li><Text strong>恢复时间：</Text>预计需要4-8小时进行系统恢复</li>
                </ul>
              </>
            ) : (
              <>
                <Alert
                  message="防御成功"
                  description={`防御体系成功阻止了攻击，目标节点 ${selectedRecord.targetNode} 未被攻陷。
                  但仍需关注发现的潜在攻击路径。`}
                  type="success"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <ul>
                  <li><Text strong>数据安全：</Text>良好 - 未发生数据泄露</li>
                  <li><Text strong>系统可用性：</Text>正常 - 系统运行未受影响</li>
                  <li><Text strong>业务影响：</Text>无 - 业务正常运行</li>
                  <li><Text strong>防御有效性：</Text>已验证防御措施的有效性</li>
                </ul>
              </>
            )}
          </Paragraph>

          <Divider />

          {/* 5. 改进建议 */}
          <Title level={3}>5. 改进建议</Title>
          <Paragraph>
            基于本次推演结果，提出以下安全改进建议：
          </Paragraph>
          <ol>
            <li>
              <Text strong>加强边界防护：</Text>
              建议在外网边界部署更严格的访问控制策略，限制不必要的服务暴露。
            </li>
            <li>
              <Text strong>提升检测能力：</Text>
              增强入侵检测系统的规则库，提高对新型攻击技术的检测能力。
            </li>
            <li>
              <Text strong>完善应急响应：</Text>
              建立快速响应机制，缩短从检测到处置的时间窗口。
            </li>
            <li>
              <Text strong>加强人员培训：</Text>
              定期开展安全意识培训，提高员工对社会工程学攻击的识别能力。
            </li>
            <li>
              <Text strong>优化防御配置：</Text>
              根据推演发现的薄弱环节，调整防火墙规则和访问控制策略。
            </li>
          </ol>

          <Divider />

          <Paragraph style={{ textAlign: 'right', color: '#999', marginTop: 40 }}>
            报告生成时间：{new Date().toLocaleString('zh-CN')}
            <br />
            操作员：{selectedRecord.operator}
          </Paragraph>
        </div>
      </Card>
    </div>
  );
};

export default ReportGeneration;

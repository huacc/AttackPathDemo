import React from 'react';
import { Modal, Table, Statistic, Row, Col, Card, Tag, Typography } from 'antd';
import { ThunderboltOutlined, DollarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { MessageTokenUsage } from '../types/index';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

interface TokenUsageModalProps {
  visible: boolean;
  onClose: () => void;
  tokenUsage: MessageTokenUsage | null;
}

/**
 * Token消耗详情弹窗组件
 * 展示当前问答对的每次模型调用所消耗的token数量
 */
export const TokenUsageModal: React.FC<TokenUsageModalProps> = ({
  visible,
  onClose,
  tokenUsage
}) => {
  if (!tokenUsage) return null;

  const columns = [
    {
      title: '调用时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (time: string) => dayjs(time).format('HH:mm:ss'),
      width: 100,
    },
    {
      title: '执行阶段',
      dataIndex: 'stage',
      key: 'stage',
      render: (stage?: string) => (
        <Tag color="blue">{stage || '未知阶段'}</Tag>
      ),
      width: 140,
    },
    {
      title: '使用模型',
      dataIndex: 'modelName',
      key: 'modelName',
      width: 180,
    },
    {
      title: '提示词Token',
      dataIndex: 'promptTokens',
      key: 'promptTokens',
      align: 'right' as const,
      render: (tokens: number) => tokens.toLocaleString(),
      width: 120,
    },
    {
      title: '完成Token',
      dataIndex: 'completionTokens',
      key: 'completionTokens',
      align: 'right' as const,
      render: (tokens: number) => tokens.toLocaleString(),
      width: 120,
    },
    {
      title: '总Token',
      dataIndex: 'totalTokens',
      key: 'totalTokens',
      align: 'right' as const,
      render: (tokens: number) => (
        <Text strong>{tokens.toLocaleString()}</Text>
      ),
      width: 120,
    },
    {
      title: '费用',
      dataIndex: 'cost',
      key: 'cost',
      align: 'right' as const,
      render: (cost?: number) => (
        cost !== undefined ? (
          <Text type="success">¥{cost.toFixed(4)}</Text>
        ) : (
          <Text type="secondary">-</Text>
        )
      ),
      width: 100,
    },
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ThunderboltOutlined style={{ color: '#1890ff' }} />
          <span>Token消耗详情</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
      bodyStyle={{ padding: '24px' }}
    >
      {/* 总览统计卡片 */}
      <Card
        size="small"
        style={{ marginBottom: '24px', background: '#f9f9f9' }}
      >
        <Row gutter={24}>
          <Col span={6}>
            <Statistic
              title="提示词Token"
              value={tokenUsage.totalPromptTokens}
              prefix={<ThunderboltOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff', fontSize: '20px' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="完成Token"
              value={tokenUsage.totalCompletionTokens}
              prefix={<ThunderboltOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontSize: '20px' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="总Token数"
              value={tokenUsage.totalTokens}
              prefix={<ThunderboltOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1', fontSize: '20px' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="总费用"
              value={tokenUsage.totalCost}
              precision={4}
              prefix="¥"
              valueStyle={{ color: '#fa8c16', fontSize: '20px' }}
            />
          </Col>
        </Row>
      </Card>

      {/* 调用详情表格 */}
      <div style={{ marginBottom: '12px' }}>
        <Title level={5} style={{ margin: 0 }}>
          <ClockCircleOutlined style={{ marginRight: '8px', color: '#8c8c8c' }} />
          各阶段Token消耗明细
        </Title>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          共 {tokenUsage.callDetails.length} 次模型调用
        </Text>
      </div>

      <Table
        columns={columns}
        dataSource={tokenUsage.callDetails}
        rowKey="callId"
        pagination={false}
        size="small"
        bordered
        scroll={{ y: 400 }}
        summary={(pageData) => {
          const totalPrompt = pageData.reduce((sum, record) => sum + record.promptTokens, 0);
          const totalCompletion = pageData.reduce((sum, record) => sum + record.completionTokens, 0);
          const totalAll = pageData.reduce((sum, record) => sum + record.totalTokens, 0);
          const totalCost = pageData.reduce((sum, record) => sum + (record.cost || 0), 0);

          return (
            <Table.Summary fixed>
              <Table.Summary.Row style={{ background: '#fafafa' }}>
                <Table.Summary.Cell index={0} colSpan={3} align="right">
                  <Text strong>合计</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="right">
                  <Text strong>{totalPrompt.toLocaleString()}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="right">
                  <Text strong>{totalCompletion.toLocaleString()}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5} align="right">
                  <Text strong style={{ color: '#722ed1' }}>
                    {totalAll.toLocaleString()}
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6} align="right">
                  <Text strong style={{ color: '#fa8c16' }}>
                    ¥{totalCost.toFixed(4)}
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          );
        }}
      />

      {/* 说明文字 */}
      <div style={{ marginTop: '16px', padding: '12px', background: '#f0f5ff', borderRadius: '4px' }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          💡 提示：Token消耗包含提示词（输入）和完成（输出）两部分。不同模型的计费标准不同，费用仅供参考。
        </Text>
      </div>
    </Modal>
  );
};

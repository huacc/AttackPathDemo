
import React, { useState } from 'react';
import { Button, Card, List, Tag, Typography, Space, Divider, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, RocketOutlined } from '@ant-design/icons';
import { mockApi } from '../mock/api';
import { mockValidator } from '../mock/validator';
import { MOCK_EVIDENCES, MOCK_CONVERSATIONS, MOCK_ONTOLOGIES, MOCK_ANALYSIS_RESULT } from '../mock/data';

const { Title, Text } = Typography;

/**
 * 心理分析系统 - P1.4 集成测试运行器
 * 用于可视化验证 Mock API 的连通性、数据的完备性及逻辑正确性。
 */
export const TestRunner: React.FC = () => {
  const [testResults, setTestResults] = useState<{ name: string; status: 'pass' | 'fail'; message: string }[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    const results: any[] = [];

    // 1. 静态数据逻辑验证
    const validation = mockValidator.validateAll({
      evidences: MOCK_EVIDENCES,
      conversations: MOCK_CONVERSATIONS,
      ontologies: MOCK_ONTOLOGIES,
      analysisResult: MOCK_ANALYSIS_RESULT
    });
    
    validation.results.forEach((r, i) => {
      results.push({
        name: `数据校验项_${i + 1}`,
        status: r.success ? 'pass' : 'fail',
        message: r.message
      });
    });

    // 2. API 异步调用验证
    try {
      const convRes = await mockApi.getConversations();
      results.push({
        name: 'API: 获取对话列表',
        status: convRes.success ? 'pass' : 'fail',
        message: convRes.success ? `成功获取 ${convRes.data?.length} 个对话` : '调用失败'
      });

      const kbRes = await mockApi.getKnowledgeBases();
      results.push({
        name: 'API: 获取知识库列表',
        status: kbRes.success ? 'pass' : 'fail',
        message: kbRes.success ? `成功获取 ${kbRes.data?.length} 个知识库` : '调用失败'
      });

      const sceneRes = await mockApi.getSceneTemplates();
      results.push({
        name: 'API: 获取场景模板',
        status: sceneRes.success ? 'pass' : 'fail',
        message: sceneRes.success ? `成功获取 ${sceneRes.data?.length} 个场景` : '调用失败'
      });

    } catch (e) {
      results.push({ name: 'API 网络模拟测试', status: 'fail', message: '发生意外错误' });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  return (
    <Card 
      title={<Space><RocketOutlined /> <span>Mock 集成测试运行器 (P1.4)</span></Space>}
      extra={<Button type="primary" loading={isRunning} onClick={runTests}>开始执行全量测试</Button>}
      style={{ margin: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
    >
      {testResults.length === 0 ? (
        <Alert message="暂无测试数据" description="点击右上角按钮开始执行 P1.4 阶段集成测试。" type="info" showIcon />
      ) : (
        <>
          <Title level={5}>测试报告摘要</Title>
          <Space>
            <Tag color="success">通过: {testResults.filter(r => r.status === 'pass').length}</Tag>
            <Tag color="error">失败: {testResults.filter(r => r.status === 'fail').length}</Tag>
          </Space>
          <Divider />
          <List
            dataSource={testResults}
            renderItem={(item) => (
              <List.Item>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Space>
                    {item.status === 'pass' ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                    <Text strong>{item.name}</Text>
                  </Space>
                  <Text type="secondary">{item.message}</Text>
                </Space>
              </List.Item>
            )}
          />
        </>
      )}
      
      <div style={{ marginTop: '24px', background: '#f5f5f5', padding: '12px', borderRadius: '8px' }}>
        <Text type="secondary">
          <strong>示例用法说明：</strong><br />
          此组件用于 Phase 1 开发环境。在 App.tsx 中临时引入此组件，即可通过界面快速验证 Mock 数据与 API 的完备性。
          核心逻辑使用 <code>mockValidator</code> 进行数据闭环检查。
        </Text>
      </div>
    </Card>
  );
};

export default TestRunner;

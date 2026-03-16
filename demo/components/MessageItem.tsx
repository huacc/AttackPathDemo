
import React, { useState, useEffect, useRef } from 'react';
import { Avatar, Space, Typography, Card, Tag, Button, Divider } from 'antd';
import { UserOutlined, RobotOutlined, FilePdfOutlined, FileImageOutlined, FileTextOutlined, ExportOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import dayjs from 'dayjs';
import { Message, FileAttachment, ThinkingProcess as ThinkingProcessType, ThinkingStep } from '../types/index';
import { ThinkingProcess } from './ThinkingProcess';
import { useReportStore } from '../stores/reportStore';
import { generateStepDetails } from '../mock/utils';

const { Text, Title } = Typography;

interface MessageItemProps {
  message: Message;
}

/**
 * 单条消息渲染组件 [REQ-2.3]
 * 支持展示用户信息、AI回复、思考过程、附件卡片及核心特征摘要
 */
export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const { openReport } = useReportStore();

  // 本地管理思维链状态，用于流式展示
  const [localThinkingProcess, setLocalThinkingProcess] = useState<ThinkingProcessType | undefined>(
    message.thinkingProcess
  );
  const isStreamingRef = useRef(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // 流式更新思维链步骤
  useEffect(() => {
    // 只处理AI消息且有思维链的情况
    if (message.role !== 'assistant' || !message.thinkingProcess) {
      return;
    }

    // 检查是否有running步骤，如果有则启动流式更新
    const hasRunningStep = message.thinkingProcess.steps.some(s => s.status === 'running');

    if (hasRunningStep && !isStreamingRef.current) {
      isStreamingRef.current = true;

      // 清除之前的定时器
      timeoutsRef.current.forEach(t => clearTimeout(t));
      timeoutsRef.current = [];

      // 定义所有步骤的模板（从mock/utils.ts导入的步骤定义）
      const allStepsTemplate = [
        { stepName: '文档解析与内容提取', description: '解析上传的文档，提取文本和图片内容' },
        { stepName: '多模态数据融合', description: '处理文本和图片内容，进行多模态融合' },
        { stepName: '语言特征提取', description: '分析语言模式，提取词汇、句式、情绪特征' },
        { stepName: '行为特征识别', description: '识别行为模式和肢体语言特征' },
        { stepName: '心理学本体匹配', description: '加载心理学本体库，进行特征-概念映射' },
        { stepName: '知识图谱推理', description: '查询知识图谱，构建推理路径和证据链' },
        { stepName: '多维度特征融合', description: '整合语言、行为、情绪等多维度特征' },
        { stepName: '心理状态评估', description: '基于融合特征评估心理状态' },
        { stepName: '风险因素识别', description: '识别潜在风险点和异常模式' },
        { stepName: '结构化报告生成', description: '生成完整的分析报告和可视化图表' }
      ];

      let cumulativeDelay = 0;

      // 逐步添加和完成每个步骤
      for (let i = 0; i < allStepsTemplate.length; i++) {
        const stepDuration = Math.floor(Math.random() * 2) + 1; // 1-3秒

        // 如果是第1个步骤，它已经存在且是running状态，直接完成它
        if (i === 0) {
          const completedTimeout = setTimeout(() => {
            setLocalThinkingProcess(prev => {
              if (!prev) return prev;
              const newSteps = [...prev.steps];
              newSteps[0] = {
                ...newSteps[0],
                status: 'completed',
                details: generateStepDetails(0),
                duration: stepDuration,
                timestamp: new Date().toISOString()
              };

              return {
                ...prev,
                steps: newSteps,
                totalDuration: stepDuration
              };
            });
          }, cumulativeDelay + stepDuration * 1000);
          timeoutsRef.current.push(completedTimeout);
          cumulativeDelay += stepDuration * 1000;
          continue;
        }

        // 对于后续步骤：先添加running状态的步骤
        const addStepTimeout = setTimeout(() => {
          setLocalThinkingProcess(prev => {
            if (!prev) return prev;
            const newStep: ThinkingStep = {
              stepId: `STEP_${String(i + 1).padStart(3, '0')}`,
              stepName: allStepsTemplate[i].stepName,
              status: 'running',
              description: allStepsTemplate[i].description,
              details: undefined,
              duration: undefined,
              timestamp: new Date().toISOString()
            };

            return {
              ...prev,
              steps: [...prev.steps, newStep],
              currentStepIndex: i
            };
          });
        }, cumulativeDelay);
        timeoutsRef.current.push(addStepTimeout);

        // 然后将该步骤标记为completed
        const completeStepTimeout = setTimeout(() => {
          setLocalThinkingProcess(prev => {
            if (!prev) return prev;
            const newSteps = [...prev.steps];
            const stepIndex = newSteps.length - 1;
            newSteps[stepIndex] = {
              ...newSteps[stepIndex],
              status: 'completed',
              details: generateStepDetails(i),
              duration: stepDuration,
              timestamp: new Date().toISOString()
            };

            // 更新总耗时
            const totalDuration = newSteps
              .filter(s => s.duration)
              .reduce((sum, s) => sum + (s.duration || 0), 0);

            return {
              ...prev,
              steps: newSteps,
              totalDuration,
              currentStepIndex: i < allStepsTemplate.length - 1 ? i + 1 : undefined
            };
          });
        }, cumulativeDelay + stepDuration * 1000);
        timeoutsRef.current.push(completeStepTimeout);

        cumulativeDelay += stepDuration * 1000;
      }
    }

    // 清理函数
    return () => {
      timeoutsRef.current.forEach(t => clearTimeout(t));
      timeoutsRef.current = [];
    };
  }, [message.messageId, message.thinkingProcess]);

  /**
   * 渲染附件卡片 [REQ-2.3.1]
   */
  const renderAttachment = (file: FileAttachment) => {
    const iconStyle = { fontSize: '24px', marginRight: '12px' };
    let icon = <FileTextOutlined style={{ ...iconStyle, color: '#1890ff' }} />;
    if (file.fileType === 'pdf') icon = <FilePdfOutlined style={{ ...iconStyle, color: '#ff4d4f' }} />;
    if (file.fileType === 'jpg' || file.fileType === 'png') icon = <FileImageOutlined style={{ ...iconStyle, color: '#52c41a' }} />;

    return (
      <Card 
        key={file.fileId}
        size="small" 
        hoverable
        style={{ 
          width: '220px', 
          borderRadius: '8px', 
          background: isUser ? 'rgba(255,255,255,0.1)' : '#f5f5f5', 
          border: 'none',
          marginBottom: '4px'
        }} 
        bodyStyle={{ padding: '10px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {icon}
          <div style={{ overflow: 'hidden' }}>
            <Text ellipsis style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: isUser ? '#fff' : '#262626' }}>
              {file.fileName}
            </Text>
            <Text style={{ fontSize: '11px', color: isUser ? 'rgba(255,255,255,0.7)' : '#8c8c8c' }}>
              {(file.fileSize / 1024).toFixed(1)} KB
            </Text>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '32px',
      width: '100%'
    }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: isUser ? 'row-reverse' : 'row', 
        gap: '16px',
        alignItems: 'flex-start',
        maxWidth: '90%'
      }}>
        {/* 头像区域 */}
        <Avatar 
          icon={isUser ? <UserOutlined /> : <RobotOutlined />} 
          size="large"
          style={{ 
            backgroundColor: isUser ? '#1890ff' : '#001529', 
            flexShrink: 0,
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            marginTop: '4px'
          }} 
        />

        {/* 消息气泡主体 */}
        <div style={{ 
          background: isUser ? '#1890ff' : '#fff',
          color: isUser ? '#fff' : '#262626',
          padding: '14px 20px',
          borderRadius: '16px',
          borderTopRightRadius: isUser ? '4px' : '16px',
          borderTopLeftRadius: isUser ? '16px' : '4px',
          boxShadow: isUser ? '0 4px 12px rgba(24,144,255,0.2)' : '0 4px 12px rgba(0,0,0,0.03)',
          border: isUser ? 'none' : '1px solid #f0f0f0',
          position: 'relative',
          minWidth: '100px'
        }}>
          {/* 元信息: 角色与时间 */}
          <div style={{ 
            marginBottom: '8px', 
            fontSize: '11px', 
            opacity: 0.8, 
            textAlign: isUser ? 'right' : 'left',
            fontWeight: 500
          }}>
            {isUser ? '分析人员' : 'AI 助手'} · {dayjs(message.timestamp).format('HH:mm:ss')}
          </div>
          
          {/* 文本内容: 支持Markdown解析 */}
          <div className="markdown-body" style={{ 
            fontSize: '14.5px', 
            lineHeight: '1.8',
            color: isUser ? '#fff' : '#2d3436'
          }}>
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>

          {/* 附件展示区 [REQ-2.3.1] */}
          {message.files && message.files.length > 0 && (
            <div style={{ marginTop: '14px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {message.files.map(renderAttachment)}
            </div>
          )}

          {/* 思考过程展示 [REQ-2.4] - 使用本地状态支持流式展示 */}
          {localThinkingProcess && (
            <ThinkingProcess data={localThinkingProcess} isGenerating={false} />
          )}

          {/* 分析结果核心发现摘要 [REQ-2.3.2] */}
          {message.analysisResult && (
            <div style={{ 
              marginTop: '18px', 
              padding: '18px', 
              background: isUser ? 'rgba(255,255,255,0.12)' : '#f9fff0', 
              border: '1px solid ' + (isUser ? 'rgba(255,255,255,0.25)' : '#dcf4bc'), 
              borderRadius: '14px' 
            }}>
              <Title level={5} style={{ margin: '0 0 14px', fontSize: '15px', color: isUser ? '#fff' : '#389e0d' }}>
                核心发现摘要
              </Title>
              <Space direction="vertical" size={10} style={{ width: '100%' }}>
                {message.analysisResult.reasoningChains.slice(0, 3).map(chain => (
                  <div key={chain.chainId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: '13px', color: isUser ? '#fff' : '#434343' }}>
                      • {chain.conclusion}
                    </Text>
                    <Tag color={isUser ? "blue" : "success"} bordered={false} style={{ margin: 0 }}>
                      {(chain.calculatedConfidence * 100).toFixed(0)}% 置信
                    </Tag>
                  </div>
                ))}
              </Space>
              <Divider style={{ margin: '14px 0', borderColor: isUser ? 'rgba(255,255,255,0.2)' : '#e8e8e8' }} />
              <Button 
                type={isUser ? 'default' : 'primary'} 
                icon={<ExportOutlined />} 
                block 
                ghost={!isUser}
                onClick={() => openReport(message.analysisResult!)}
                style={{ height: '38px', borderRadius: '10px', fontWeight: 600 }}
              >
                查看完整分析报告
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * 示例用法:
 * <MessageItem message={mockMessage} />
 */

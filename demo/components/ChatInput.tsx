
import React, { useState, useEffect, useMemo } from 'react';
import { Input, Button, Select, Space, Upload, message, Tooltip, Badge, Tag, Typography, Progress } from 'antd';
import {
  PaperClipOutlined,
  SendOutlined,
  InfoCircleOutlined,
  FileOutlined,
  LoadingOutlined,
  DeleteOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { useConversationStore } from '../stores/conversationStore';
import { useMessageStore } from '../stores/messageStore';
import { mockApi } from '../mock/api';
import { simulateFileUpload } from '../mock/utils';
import { SceneTemplate, KnowledgeBase, MessageTokenUsage } from '../types/index';
import { APP_CONFIG } from '../config/index';
import { TokenUsageModal } from './TokenUsageModal';

const { TextArea } = Input;
const { Text } = Typography;

/**
 * 对话输入区域组件 [REQ-2.5]
 * 集成了场景选择、知识库切换、文件上传模拟及智能文本输入
 */
export const ChatInput: React.FC = () => {
  const { currentConversationId, conversations, updateConfig } = useConversationStore();
  const { sendMessage, isGenerating, messages } = useMessageStore();
  
  const [content, setContent] = useState('');
  const [scenes, setScenes] = useState<SceneTemplate[]>([]);
  const [kbs, setKbs] = useState<KnowledgeBase[]>([]);
  const [selectedScene, setSelectedScene] = useState<string>('');
  const [selectedKb, setSelectedKb] = useState<string>('');
  
  // 附件状态管理
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, number>>({});

  // Token消耗弹窗状态管理
  const [tokenModalVisible, setTokenModalVisible] = useState(false);
  const [selectedTokenUsage, setSelectedTokenUsage] = useState<MessageTokenUsage | null>(null);

  /**
   * 判定逻辑更新:
   * 只有当当前对话存在且消息数量 > 0 时，才认为对话已"正式开始"，从而锁定配置。
   */
  const isChatStarted = messages.length > 0;

  /**
   * 计算当前对话的总token消耗
   */
  const totalTokenStats = useMemo(() => {
    const aiMessages = messages.filter(m => m.role === 'assistant' && m.tokenUsage);
    if (aiMessages.length === 0) {
      return { totalTokens: 0, totalCost: 0, messageCount: 0 };
    }

    const totalTokens = aiMessages.reduce((sum, m) => sum + (m.tokenUsage?.totalTokens || 0), 0);
    const totalCost = aiMessages.reduce((sum, m) => sum + (m.tokenUsage?.totalCost || 0), 0);

    return {
      totalTokens,
      totalCost,
      messageCount: aiMessages.length
    };
  }, [messages]);

  /**
   * 打开Token详情弹窗
   * 默认展示最近一次AI回复的token消耗
   */
  const handleOpenTokenModal = () => {
    const lastAIMessage = [...messages].reverse().find(m => m.role === 'assistant' && m.tokenUsage);
    if (lastAIMessage?.tokenUsage) {
      setSelectedTokenUsage(lastAIMessage.tokenUsage);
      setTokenModalVisible(true);
    } else {
      message.info('当前对话暂无token消耗记录');
    }
  };

  /**
   * 1. 初始化加载基础配置数据 (场景/知识库模板)
   */
  useEffect(() => {
    const initStaticData = async () => {
      const sRes = await mockApi.getSceneTemplates();
      const kRes = await mockApi.getKnowledgeBases();
      if (sRes.success && sRes.data) setScenes(sRes.data);
      if (kRes.success && kRes.data) setKbs(kRes.data);
    };
    initStaticData();
  }, []);

  /**
   * 2. 当切换对话或新建对话时，同步 UI 选择器的状态
   */
  useEffect(() => {
    if (currentConversationId) {
      const currentConv = conversations.find(c => c.conversationId === currentConversationId);
      if (currentConv) {
        setSelectedScene(currentConv.sceneId);
        setSelectedKb(currentConv.knowledgeBaseId);
      }
    } else if (scenes.length > 0 && kbs.length > 0) {
      // 如果没有 ID (纯新状态)，默认选择第一项
      setSelectedScene(scenes[0].sceneId);
      setSelectedKb(kbs[0].knowledgeBaseId);
    }
  }, [currentConversationId, conversations, scenes, kbs]);

  /**
   * 处理配置变更
   */
  const handleSceneChange = (val: string) => {
    setSelectedScene(val);
    if (currentConversationId && !isChatStarted) {
      updateConfig(currentConversationId, { sceneId: val });
    }
  };

  const handleKbChange = (val: string) => {
    setSelectedKb(val);
    if (currentConversationId && !isChatStarted) {
      updateConfig(currentConversationId, { knowledgeBaseId: val });
    }
  };

  /**
   * 处理消息发送逻辑
   */
  const handleSend = () => {
    if (isGenerating) return;
    if (!content.trim() && fileList.length === 0) return;
    
    if (!currentConversationId) {
      message.warning('请先从左侧选择一个对话或开启新对话');
      return;
    }

    const isStillUploading = Object.values(uploadingFiles).some(p => p < 100);
    if (isStillUploading) {
      message.warning('请等待附件上传完成');
      return;
    }

    sendMessage(currentConversationId, content, fileList);
    setContent('');
    setFileList([]);
    setUploadingFiles({});
  };

  /**
   * 模拟文件上传逻辑
   */
  const handleCustomUpload = async ({ file, onSuccess, onError }: any) => {
    if (file.size > APP_CONFIG.UPLOAD_LIMIT_MB * 1024 * 1024) {
      message.error(`文件不能超过 ${APP_CONFIG.UPLOAD_LIMIT_MB}MB`);
      onError();
      return;
    }

    if (fileList.length >= APP_CONFIG.MAX_FILE_COUNT) {
      message.error(`单次对话最多上传 ${APP_CONFIG.MAX_FILE_COUNT} 个文件`);
      onError();
      return;
    }

    const fileUid = file.uid;
    setUploadingFiles(prev => ({ ...prev, [fileUid]: 0 }));

    try {
      await simulateFileUpload(file, (percent) => {
        setUploadingFiles(prev => ({ ...prev, [fileUid]: percent }));
      });
      setFileList(prev => [...prev, file]);
      onSuccess();
    } catch (err) {
      message.error(`${file.name} 上传失败`);
      onError();
    }
  };

  const removeFile = (uid: string) => {
    setFileList(prev => prev.filter(f => f.uid !== uid));
    setUploadingFiles(prev => {
      const next = { ...prev };
      delete next[uid];
      return next;
    });
  };

  return (
    <div style={{ 
      padding: '16px 24px', 
      borderTop: '1px solid #f0f0f0', 
      background: '#fff',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.02)'
    }}>
      {/* 1. 配置选择区: 场景与知识库 */}
      <div style={{ marginBottom: '12px', display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
        <Space>
          <Text type="secondary" style={{ fontSize: '13px' }}>分析场景:</Text>
          <Select
            size="small"
            value={selectedScene}
            onChange={handleSceneChange}
            style={{ width: 150 }}
            options={scenes.map(s => ({ value: s.sceneId, label: s.name }))}
            disabled={isChatStarted || isGenerating}
          />
          <Tooltip title={isChatStarted ? "分析进行中，不可更改场景" : "场景决定了 AI 的分析逻辑维度"}>
            <InfoCircleOutlined style={{ color: '#bfbfbf', fontSize: '12px' }} />
          </Tooltip>
        </Space>

        <Space>
          <Text type="secondary" style={{ fontSize: '13px' }}>关联知识库:</Text>
          <Select
            size="small"
            value={selectedKb}
            onChange={handleKbChange}
            style={{ width: 180 }}
            options={kbs.map(k => ({ value: k.knowledgeBaseId, label: k.name }))}
            disabled={isChatStarted || isGenerating}
          />
        </Space>

        {/* Token消耗展示 */}
        {totalTokenStats.messageCount > 0 && (
          <Tooltip title="查看详细Token消耗">
            <Badge
              count={totalTokenStats.messageCount}
              offset={[-5, 5]}
              style={{ backgroundColor: '#52c41a' }}
            >
              <Button
                size="small"
                icon={<ThunderboltOutlined />}
                onClick={handleOpenTokenModal}
                style={{
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Space size={4}>
                  <Text style={{ fontSize: '12px', fontWeight: 500 }}>
                    {totalTokenStats.totalTokens.toLocaleString()}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '11px' }}>
                    tokens
                  </Text>
                  {totalTokenStats.totalCost > 0 && (
                    <>
                      <span style={{ color: '#d9d9d9' }}>|</span>
                      <Text type="warning" style={{ fontSize: '11px' }}>
                        ¥{totalTokenStats.totalCost.toFixed(4)}
                      </Text>
                    </>
                  )}
                </Space>
              </Button>
            </Badge>
          </Tooltip>
        )}
      </div>

      {/* 2. 主输入区域 */}
      <div style={{ 
        position: 'relative', 
        border: '1px solid #d9d9d9', 
        borderRadius: '12px', 
        padding: '10px', 
        background: '#fcfcfc',
        transition: 'border-color 0.3s',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
      }}>
        <TextArea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="在此输入您的观察结果或分析指令... (Enter 发送)"
          autoSize={{ minRows: 2, maxRows: 5 }}
          bordered={false}
          style={{ background: 'transparent', fontSize: '14px' }}
          disabled={isGenerating}
          onPressEnter={e => {
            if (!e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginTop: '10px', 
          padding: '0 4px' 
        }}>
          <Upload 
            customRequest={handleCustomUpload}
            showUploadList={false}
            multiple
            disabled={isGenerating || fileList.length >= APP_CONFIG.MAX_FILE_COUNT}
          >
            <Button 
              icon={<PaperClipOutlined />} 
              type="text" 
              style={{ color: '#8c8c8c', fontSize: '13px' }}
            >
              上传附件资料 ({fileList.length}/{APP_CONFIG.MAX_FILE_COUNT})
            </Button>
          </Upload>
          
          <Button 
            type="primary" 
            icon={isGenerating ? <LoadingOutlined /> : <SendOutlined />} 
            onClick={handleSend}
            disabled={(!content.trim() && fileList.length === 0) || isGenerating}
            style={{ borderRadius: '8px', paddingLeft: '24px', paddingRight: '24px', height: '36px' }}
          >
            {isGenerating ? '生成中' : '发送分析指令'}
          </Button>
        </div>
      </div>

      {/* 3. 附件列表展示 */}
      {(fileList.length > 0 || Object.keys(uploadingFiles).length > 0) && (
        <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {Object.entries(uploadingFiles).map(([uid, percent]) => (
            percent < 100 && (
              <Tag key={uid} icon={<LoadingOutlined />} color="processing" style={{ padding: '4px 12px', borderRadius: '4px' }}>
                <Space direction="vertical" size={0}>
                  <Text style={{ fontSize: '12px' }}>上传中...</Text>
                  <Progress percent={percent} size="small" showInfo={false} style={{ width: 60, margin: 0 }} />
                </Space>
              </Tag>
            )
          ))}
          {fileList.map((file) => (
            <Badge 
              key={file.uid} 
              count={<DeleteOutlined style={{ color: '#ff4d4f', fontSize: '10px', background: '#fff', borderRadius: '50%', padding: '2px', boxShadow: '0 0 2px rgba(0,0,0,0.2)' }} />} 
              onClick={() => removeFile(file.uid)}
              style={{ cursor: 'pointer' }}
            >
              <Tag color="blue" icon={<FileOutlined />} style={{ padding: '6px 12px', borderRadius: '4px', margin: 0 }}>
                {file.name}
              </Tag>
            </Badge>
          ))}
        </div>
      )}

      {/* Token消耗详情弹窗 */}
      <TokenUsageModal
        visible={tokenModalVisible}
        onClose={() => setTokenModalVisible(false)}
        tokenUsage={selectedTokenUsage}
      />
    </div>
  );
};

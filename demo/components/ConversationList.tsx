
import React, { useState, useMemo } from 'react';
import { List, Button, Input, Typography, Space, Popconfirm, Empty, Tooltip, Badge } from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  MessageOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CheckOutlined, 
  CloseOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { useConversationStore } from '../stores/conversationStore';
import { Conversation } from '../types/index';
import dayjs from 'dayjs';

const { Text } = Typography;

/**
 * 对话历史列表组件 [REQ-2.2]
 */
export const ConversationList: React.FC = () => {
  const { 
    conversations, 
    currentConversationId, 
    setCurrentConversation, 
    createConversation, 
    deleteConversation, 
    updateTitle 
  } = useConversationStore();

  const [searchText, setSearchText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // 1. 过滤逻辑
  const filteredConversations = useMemo(() => {
    return conversations.filter(c => c.title.toLowerCase().includes(searchText.toLowerCase()));
  }, [conversations, searchText]);

  // 2. 时间分组逻辑
  const groupedConversations = useMemo(() => {
    const today = dayjs().startOf('day');
    const yesterday = dayjs().subtract(1, 'day').startOf('day');

    return {
      '今天': filteredConversations.filter(c => dayjs(c.createdAt).isAfter(today)),
      '昨天': filteredConversations.filter(c => dayjs(c.createdAt).isAfter(yesterday) && dayjs(c.createdAt).isBefore(today)),
      '更早': filteredConversations.filter(c => dayjs(c.createdAt).isBefore(yesterday))
    };
  }, [filteredConversations]);

  const handleCreate = () => {
    createConversation('SCENE_INTERROGATION', 'KB_PSY_001');
  };

  const startEdit = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    setEditingId(id);
    setEditValue(title);
  };

  const saveEdit = (e: React.MouseEvent | React.KeyboardEvent, id: string) => {
    if (e) e.stopPropagation();
    if (editValue.trim()) {
      updateTitle(id, editValue);
    }
    setEditingId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          block 
          onClick={handleCreate}
          style={{ marginBottom: '12px', height: '40px', borderRadius: '8px', fontWeight: 500 }}
        >
          新建分析对话
        </Button>
        <Input 
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} 
          placeholder="搜索历史记录..." 
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          allowClear
          style={{ borderRadius: '6px' }}
        />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {Object.entries(groupedConversations).map(([group, items]) => {
          const typedItems = items as Conversation[];
          return typedItems.length > 0 && (
            <div key={group}>
              <div style={{ padding: '12px 16px 4px', fontSize: '12px', color: '#8c8c8c', fontWeight: 600 }}>
                <Space><HistoryOutlined style={{fontSize: '10px'}} />{group}</Space>
              </div>
              <List
                dataSource={typedItems}
                split={false}
                renderItem={item => (
                  <div 
                    onClick={() => setCurrentConversation(item.conversationId)}
                    style={{
                      padding: '10px 16px',
                      margin: '2px 8px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: currentConversationId === item.conversationId ? '#e6f7ff' : 'transparent',
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: currentConversationId === item.conversationId ? '1px solid #91d5ff' : '1px solid transparent'
                    }}
                    className="conv-item-hover"
                  >
                    <Space style={{ flex: 1, overflow: 'hidden' }}>
                      <MessageOutlined style={{ color: currentConversationId === item.conversationId ? '#1890ff' : '#8c8c8c' }} />
                      {editingId === item.conversationId ? (
                        <Input 
                          size="small" 
                          value={editValue} 
                          onChange={e => setEditValue(e.target.value)} 
                          autoFocus
                          onPressEnter={(e: any) => saveEdit(e, item.conversationId)}
                          onBlur={(e: any) => saveEdit(e, item.conversationId)}
                          onClick={e => e.stopPropagation()}
                        />
                      ) : (
                        <Text ellipsis style={{ width: '130px', color: currentConversationId === item.conversationId ? '#1890ff' : '#262626' }}>
                          {item.title}
                        </Text>
                      )}
                    </Space>

                    <div className="action-btns" style={{ display: currentConversationId === item.conversationId ? 'flex' : 'none' }}>
                      <Space size={8}>
                        <Tooltip title="重命名">
                          <EditOutlined onClick={(e) => startEdit(e, item.conversationId, item.title)} style={{ fontSize: '12px', color: '#8c8c8c' }} />
                        </Tooltip>
                        <Popconfirm title="确定删除此对话吗？" onConfirm={() => deleteConversation(item.conversationId)} okText="确定" cancelText="取消">
                          <DeleteOutlined onClick={e => e.stopPropagation()} style={{ fontSize: '12px', color: '#ff4d4f' }} />
                        </Popconfirm>
                      </Space>
                    </div>
                  </div>
                )}
              />
            </div>
          );
        })}
        {filteredConversations.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="无匹配对话" style={{ marginTop: '40px' }} />}
      </div>
      <style>{`
        .conv-item-hover:hover .action-btns { display: flex !important; }
      `}</style>
    </div>
  );
};

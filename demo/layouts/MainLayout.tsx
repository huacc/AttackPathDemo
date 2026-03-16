
import React, { useEffect } from 'react';
import { Layout, Avatar, Dropdown, Space, ConfigProvider, MenuProps } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined, AppstoreOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { APP_CONFIG } from '../config/index';
import { ConversationList } from '../components/ConversationList';
import { useConversationStore } from '../stores/conversationStore';
import { ReportPanel } from '../components/ReportPanel';
import { useReportStore } from '../stores/reportStore';

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * MainLayout - 心理分析系统主布局组件
 * [REQ-1.2] & [REQ-3.2]
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loadConversations } = useConversationStore();
  const { visible } = useReportStore(); // 监听报告可见状态

  useEffect(() => {
    loadConversations();
  }, []);

  const userMenuItems: MenuProps['items'] = [
    { key: 'settings', icon: <SettingOutlined />, label: '个人设置' },
    { key: 'admin', icon: <AppstoreOutlined />, label: '管理后台', onClick: () => navigate('/admin') },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: APP_CONFIG.PRIMARY_COLOR,
          borderRadius: 8,
          fontFamily: "'Inter', 'Noto Sans SC', sans-serif",
        },
      }}
    >
      <Layout 
        style={{ 
          minHeight: '100vh', 
          background: '#f0f2f5',
          overflow: 'hidden', // 防止侧滑时出现双滚动条
          position: 'relative'
        }}
      >
        {/* 主视口容器，支持侧滑位移 [REQ-3.2] */}
        <div style={{
          width: '100%',
          height: '100%',
          transition: 'transform 300ms ease-out',
          transform: visible ? 'translateX(-100%)' : 'translateX(0)',
        }}>
          <Header style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            background: '#fff', 
            padding: '0 24px',
            borderBottom: '1px solid #e8e8e8',
            position: 'sticky',
            top: 0,
            zIndex: 1001,
            height: '64px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
              onClick={() => navigate('/chat')}
            >
              <div style={{ 
                width: '32px', 
                height: '32px', 
                background: APP_CONFIG.PRIMARY_COLOR, 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <ThunderboltOutlined style={{ fontSize: '18px', color: '#fff' }} />
              </div>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#141414', letterSpacing: '-0.5px' }}>{APP_CONFIG.TITLE}</span>
              <span style={{ 
                fontSize: '10px', 
                background: '#f0f0f0', 
                color: '#8c8c8c', 
                padding: '1px 6px', 
                borderRadius: '4px',
                fontWeight: 600
              }}>PROTOTYPE {APP_CONFIG.VERSION}</span>
            </div>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <Space style={{ cursor: 'pointer', padding: '4px 12px', borderRadius: '20px', background: '#f5f5f5' }}>
                <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: APP_CONFIG.PRIMARY_COLOR }} />
                <span style={{ fontWeight: 500, fontSize: '14px' }}>分析专家</span>
              </Space>
            </Dropdown>
          </Header>

          <Layout>
            <Sider 
              width="20%" 
              theme="light" 
              style={{ 
                borderRight: '1px solid #e8e8e8',
                overflow: 'hidden',
                height: 'calc(100vh - 64px)',
              }}
            >
              <ConversationList />
            </Sider>

            <Content style={{ 
              minHeight: 'calc(100vh - 64px)',
              background: '#fff',
              position: 'relative',
            }}>
              {children}
            </Content>
          </Layout>
        </div>

        {/* 报告侧滑面板 [REQ-3.1] */}
        <ReportPanel />
      </Layout>
    </ConfigProvider>
  );
};

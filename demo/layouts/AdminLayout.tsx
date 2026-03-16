
import React from 'react';
import { Layout, Menu, Button, Breadcrumb } from 'antd';
import {
  ArrowLeftOutlined,
  DeploymentUnitOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  SettingOutlined,
  DashboardOutlined,
  TeamOutlined,
  LockOutlined,
  ApiOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { APP_CONFIG } from '../config/index';

const { Sider, Content, Header } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * AdminLayout - 管理后台布局组件
 * 实现需求 REQ-4.1: 侧边栏导航 + 内容管理区
 */
export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 导航菜单配置
  const menuItems = [
    { key: '/admin/ontology', icon: <DeploymentUnitOutlined />, label: '本体管理' },
    { key: '/admin/knowledge', icon: <DatabaseOutlined />, label: '知识库管理' },
    { key: '/admin/scenes', icon: <SettingOutlined />, label: '场景模板管理' },
    { key: '/admin/reports', icon: <FileTextOutlined />, label: '报告模板管理' },
    {
      key: 'user-permission',
      icon: <TeamOutlined />,
      label: '用户权限管理',
      children: [
        { key: '/admin/users', label: '用户管理' },
        { key: '/admin/permissions', label: '权限管理' }
      ]
    },
    { key: '/admin/models', icon: <ApiOutlined />, label: '模型管理' },
    // { key: '/admin/modeling-demo', icon: <ExperimentOutlined />, label: '未来建模示例' },
  ];

  // 面包屑标题映射
  const breadcrumbNameMap: Record<string, string> = {
    '/admin/ontology': '本体管理',
    '/admin/knowledge': '知识库管理',
    '/admin/scenes': '场景模板管理',
    '/admin/reports': '报告模板管理',
    '/admin/users': '用户管理',
    '/admin/permissions': '权限管理',
    '/admin/models': '模型管理',
    '/admin/modeling-demo': '未来建模示例',
  };

  // 获取当前选中的菜单项（支持子菜单）
  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/admin/users') || path.startsWith('/admin/permissions')) {
      return [path];
    }
    return [path];
  };

  const selectedKeys = getSelectedKeys();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Sider theme="dark" width={240} style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0 }}>
        <div style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          padding: '0 24px',
          color: '#fff',
          fontSize: '18px',
          fontWeight: 700,
          background: '#001529'
        }}>
          <DashboardOutlined style={{ marginRight: '8px' }} />
          管理中台
        </div>
        <Menu 
          theme="dark" 
          mode="inline" 
          selectedKeys={selectedKeys} 
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
        <div style={{ position: 'absolute', bottom: '24px', left: '16px', right: '16px' }}>
          <Button 
            block 
            type="primary"
            ghost
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/chat')}
          >
            返回分析界面
          </Button>
        </div>
      </Sider>

      <Layout style={{ marginLeft: 240 }}>
        {/* 顶部 Header */}
        <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center' }}>
          <Breadcrumb items={[
            { title: '管理后台' },
            { title: breadcrumbNameMap[location.pathname] || '概览' }
          ]} />
        </Header>

        {/* 内容区 */}
        <Content style={{ margin: '24px', minHeight: 280 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', minHeight: 'calc(100vh - 136px)' }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

/**
 * 示例用法:
 * <AdminLayout>
 *   <OntologyManager />
 * </AdminLayout>
 */

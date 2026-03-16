import React from 'react';
import { Layout, Menu, Breadcrumb } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  ClusterOutlined,
  ApartmentOutlined,
  RadarChartOutlined,
  DeploymentUnitOutlined,
  DatabaseOutlined,
  NodeIndexOutlined,
  LinkOutlined,
  ExperimentOutlined,
  FundOutlined,
  SafetyCertificateOutlined,
  AlertOutlined,
  BarChartOutlined,
  ApiOutlined,
  BoxPlotOutlined,
  BugOutlined,
  HistoryOutlined,
  FileTextOutlined,
  SettingOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { APP_CONFIG } from '../config';

const { Header, Sider, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

// 导航菜单配置（使用分组结构）
const getMenuItems = (): MenuProps['items'] => [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard 总览'
  },
  {
    key: 'scene-group',
    icon: <AppstoreOutlined />,
    label: '场景管理',
    children: [
      { key: '/scene', icon: <ClusterOutlined />, label: '场景列表' }
    ]
  },
  {
    key: 'ontology-group',
    icon: <DeploymentUnitOutlined />,
    label: '本体建模',
    children: [
      { key: '/ontology', icon: <ApartmentOutlined />, label: '本体设计器' },
      { key: '/ontology/entities', icon: <DatabaseOutlined />, label: '实体模型库' },
      { key: '/ontology/relations', icon: <LinkOutlined />, label: '关系模型库' }
    ]
  },
  {
    key: 'knowledge-group',
    icon: <NodeIndexOutlined />,
    label: '知识图谱',
    children: [
      { key: '/knowledge', icon: <ApartmentOutlined />, label: '攻防知识图谱' },
      { key: '/knowledge/attack', icon: <RadarChartOutlined />, label: 'ATT&CK 映射' },
      { key: '/knowledge/defense', icon: <SafetyCertificateOutlined />, label: 'D3FEND 映射' }
    ]
  },
  {
    key: 'cockpit-group',
    icon: <BarChartOutlined />,
    label: '攻防驾驶舱',
    children: [
      { key: '/cockpit', icon: <DeploymentUnitOutlined />, label: '网络沙盘' },
      { key: '/cockpit/attack-path', icon: <NodeIndexOutlined />, label: '攻击路径推演' },
      { key: '/cockpit/defense', icon: <SafetyCertificateOutlined />, label: '防御策略仿真' },
      { key: '/cockpit/monitor', icon: <FundOutlined />, label: '态势监控' }
    ]
  },
  {
    key: '/algorithm',
    icon: <ExperimentOutlined />,
    label: '算法引擎'
  },
  {
    key: 'asset-group',
    icon: <DatabaseOutlined />,
    label: '资产管理',
    children: [
      { key: '/asset', icon: <BoxPlotOutlined />, label: '资产清单' },
      { key: '/asset/vulnerability', icon: <BugOutlined />, label: '漏洞管理' },
      { key: '/asset/relation', icon: <ApartmentOutlined />, label: '资产关系' }
    ]
  },
  {
    key: 'system-group',
    icon: <SettingOutlined />,
    label: '系统管理',
    children: [
      { key: '/system/history', icon: <HistoryOutlined />, label: '推演历史' },
      { key: '/system/report', icon: <FileTextOutlined />, label: '报告生成' }
    ]
  }
];

// 面包屑配置
const getBreadcrumbItems = (pathname: string) => {
  const breadcrumbMap: Record<string, { title: string; path?: string }[]> = {
    '/dashboard': [
      { title: '首页', path: '/dashboard' }
    ],
    '/scene': [
      { title: '首页', path: '/dashboard' },
      { title: '场景管理' }
    ],
    '/ontology': [
      { title: '首页', path: '/dashboard' },
      { title: '本体建模' },
      { title: '本体设计器' }
    ],
    '/ontology/entities': [
      { title: '首页', path: '/dashboard' },
      { title: '本体建模' },
      { title: '实体模型库' }
    ],
    '/ontology/relations': [
      { title: '首页', path: '/dashboard' },
      { title: '本体建模' },
      { title: '关系模型库' }
    ],
    '/knowledge': [
      { title: '首页', path: '/dashboard' },
      { title: '知识图谱' },
      { title: '攻防知识图谱' }
    ],
    '/knowledge/attack': [
      { title: '首页', path: '/dashboard' },
      { title: '知识图谱' },
      { title: 'ATT&CK 映射' }
    ],
    '/knowledge/defense': [
      { title: '首页', path: '/dashboard' },
      { title: '知识图谱' },
      { title: 'D3FEND 映射' }
    ],
    '/cockpit': [
      { title: '首页', path: '/dashboard' },
      { title: '攻防驾驶舱' },
      { title: '网络沙盘' }
    ],
    '/cockpit/attack-path': [
      { title: '首页', path: '/dashboard' },
      { title: '攻防驾驶舱' },
      { title: '攻击路径推演' }
    ],
    '/cockpit/defense': [
      { title: '首页', path: '/dashboard' },
      { title: '攻防驾驶舱' },
      { title: '防御策略仿真' }
    ],
    '/cockpit/monitor': [
      { title: '首页', path: '/dashboard' },
      { title: '攻防驾驶舱' },
      { title: '态势监控' }
    ],
    '/algorithm': [
      { title: '首页', path: '/dashboard' },
      { title: '算法引擎' }
    ],
    '/asset': [
      { title: '首页', path: '/dashboard' },
      { title: '资产管理' },
      { title: '资产清单' }
    ],
    '/asset/vulnerability': [
      { title: '首页', path: '/dashboard' },
      { title: '资产管理' },
      { title: '漏洞管理' }
    ],
    '/asset/relation': [
      { title: '首页', path: '/dashboard' },
      { title: '资产管理' },
      { title: '资产关系' }
    ],
    '/system/history': [
      { title: '首页', path: '/dashboard' },
      { title: '系统管理' },
      { title: '推演历史' }
    ],
    '/system/report': [
      { title: '首页', path: '/dashboard' },
      { title: '系统管理' },
      { title: '报告生成' }
    ]
  };

  // 处理场景详情页
  if (pathname.startsWith('/scene/') && pathname !== '/scene') {
    return [
      { title: '首页', path: '/dashboard' },
      { title: '场景管理', path: '/scene' },
      { title: '场景详情' }
    ];
  }

  return breadcrumbMap[pathname] || [{ title: '首页', path: '/dashboard' }];
};

// 获取当前选中的菜单项
const getSelectedKeys = (pathname: string): string[] => {
  if (pathname.startsWith('/scene/') && pathname !== '/scene') {
    return ['/scene'];
  }
  if (pathname.startsWith('/asset/vulnerability')) {
    return ['/asset/vulnerability'];
  }
  if (pathname.startsWith('/asset/relation')) {
    return ['/asset/relation'];
  }
  return [pathname];
};

// 获取展开的子菜单
const getOpenKeys = (pathname: string): string[] => {
  if (pathname.startsWith('/scene')) return ['scene-group'];
  if (pathname.startsWith('/ontology')) return ['ontology-group'];
  if (pathname.startsWith('/knowledge')) return ['knowledge-group'];
  if (pathname.startsWith('/cockpit')) return ['cockpit-group'];
  if (pathname.startsWith('/asset')) return ['asset-group'];
  if (pathname.startsWith('/system')) return ['system-group'];
  return [];
};

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openKeys, setOpenKeys] = React.useState<string[]>(getOpenKeys(location.pathname));

  // 当路由变化时更新展开的菜单
  React.useEffect(() => {
    setOpenKeys(getOpenKeys(location.pathname));
  }, [location.pathname]);

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  const breadcrumbItems = getBreadcrumbItems(location.pathname);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={240}
        theme="light"
        style={{ borderRight: '1px solid #f0f0f0' }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            fontWeight: 700,
            fontSize: 16,
            color: APP_CONFIG.PRIMARY_COLOR,
            cursor: 'pointer'
          }}
          onClick={() => navigate('/dashboard')}
        >
          <ApiOutlined style={{ marginRight: 8 }} />
          {APP_CONFIG.TITLE}
        </div>
        <Menu
          mode="inline"
          selectedKeys={getSelectedKeys(location.pathname)}
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          items={getMenuItems()}
          onClick={handleMenuClick}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            padding: '0 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <Breadcrumb
            items={breadcrumbItems.map(item => ({
              title: item.path ? (
                <a onClick={() => item.path && navigate(item.path)}>
                  {item.title === '首页' && <HomeOutlined style={{ marginRight: 4 }} />}
                  {item.title}
                </a>
              ) : (
                <span>{item.title}</span>
              )
            }))}
          />
        </Header>
        <Content style={{ background: '#f0f2f5' }}>{children}</Content>
      </Layout>
    </Layout>
  );
};

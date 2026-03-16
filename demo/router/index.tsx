import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Spin } from 'antd';
import { AppLayout } from '../layouts/AppLayout';

// 懒加载组件
const DashboardPage = lazy(() => import('../modules/dashboard/DashboardPage'));
const CockpitPage = lazy(() => import('../modules/cockpit/CockpitPage').then(m => ({ default: m.CockpitPage })));
const OntologyDesigner = lazy(() => import('../modules/ontology/OntologyDesigner'));
const EntityLibrary = lazy(() => import('../modules/ontology/EntityLibrary'));
const RelationshipLibrary = lazy(() => import('../modules/ontology/RelationshipLibrary'));
const KnowledgePage = lazy(() => import('../modules/knowledge/KnowledgePage'));
const AttackPathSimulation = lazy(() => import('../modules/cockpit/AttackPathSimulation'));
const DefenseStrategy = lazy(() => import('../modules/cockpit/DefenseStrategy'));
const SceneList = lazy(() => import('../modules/scene/SceneList'));
const SceneDetail = lazy(() => import('../modules/scene/SceneDetail'));
const AssetInventory = lazy(() => import('../modules/asset/AssetInventory'));
const VulnerabilityManagement = lazy(() => import('../modules/asset/VulnerabilityManagement'));
const AssetRelation = lazy(() => import('../modules/asset/AssetRelation'));

// 加载中组件
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#f0f2f5'
  }}>
    <Spin size="large" tip="加载中..." />
  </div>
);

interface PlaceholderProps {
  title: string;
  description?: string;
}

const Placeholder: React.FC<PlaceholderProps> = ({ title, description }) => {
  return (
    <div style={{
      background: '#fff',
      border: '1px dashed #e5e7eb',
      borderRadius: 12,
      padding: 32,
      textAlign: 'center',
      color: '#64748b'
    }}>
      <h2 style={{ fontSize: 24, marginBottom: 16 }}>{title}</h2>
      {description && <p style={{ color: '#94a3b8' }}>{description}</p>}
    </div>
  );
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Dashboard 总览 */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={(
              <AppLayout>
                <DashboardPage />
              </AppLayout>
            )}
          />

          {/* 模块1：攻防场景管理 */}
          <Route
            path="/scene"
            element={(
              <AppLayout>
                <SceneList />
              </AppLayout>
            )}
          />
          <Route
            path="/scene/:sceneId"
            element={(
              <AppLayout>
                <SceneDetail />
              </AppLayout>
            )}
          />

          {/* 模块2：本体建模 */}
          <Route
            path="/ontology"
            element={(
              <AppLayout>
                <OntologyDesigner />
              </AppLayout>
            )}
          />
          <Route
            path="/ontology/entities"
            element={(
              <AppLayout>
                <EntityLibrary />
              </AppLayout>
            )}
          />
          <Route
            path="/ontology/relations"
            element={(
              <AppLayout>
                <RelationshipLibrary />
              </AppLayout>
            )}
          />

          {/* 模块3：知识图谱 */}
          <Route
            path="/knowledge"
            element={(
              <AppLayout>
                <KnowledgePage />
              </AppLayout>
            )}
          />
          <Route
            path="/knowledge/attack"
            element={(
              <AppLayout>
                <Placeholder title="ATT&CK 映射" description="ATT&CK矩阵、技术详情、映射关系" />
              </AppLayout>
            )}
          />
          <Route
            path="/knowledge/defense"
            element={(
              <AppLayout>
                <Placeholder title="D3FEND 映射" description="D3FEND分类、防御技术、覆盖度分析" />
              </AppLayout>
            )}
          />

          {/* 模块4：攻防驾驶舱 */}
          <Route
            path="/cockpit"
            element={(
              <AppLayout>
                <CockpitPage />
              </AppLayout>
            )}
          />
          <Route
            path="/cockpit/attack-path"
            element={(
              <AppLayout>
                <AttackPathSimulation />
              </AppLayout>
            )}
          />
          <Route
            path="/cockpit/defense"
            element={(
              <AppLayout>
                <DefenseStrategy />
              </AppLayout>
            )}
          />
          <Route
            path="/cockpit/monitor"
            element={(
              <AppLayout>
                <Placeholder title="态势监控" description="时间轴控制、事件流、统计面板" />
              </AppLayout>
            )}
          />

          {/* 模块5：算法引擎 */}
          <Route
            path="/algorithm"
            element={(
              <AppLayout>
                <Placeholder title="算法引擎" description="攻击/防御/评估算法库" />
              </AppLayout>
            )}
          />

          {/* 模块6：资产管理 */}
          <Route
            path="/asset"
            element={(
              <AppLayout>
                <AssetInventory />
              </AppLayout>
            )}
          />
          <Route
            path="/asset/vulnerability"
            element={(
              <AppLayout>
                <VulnerabilityManagement />
              </AppLayout>
            )}
          />
          <Route
            path="/asset/relation"
            element={(
              <AppLayout>
                <AssetRelation />
              </AppLayout>
            )}
          />

          {/* 模块7：系统管理 */}
          <Route
            path="/system/history"
            element={(
              <AppLayout>
                <Placeholder title="推演历史" description="历史推演记录、详情查看" />
              </AppLayout>
            )}
          />
          <Route
            path="/system/report"
            element={(
              <AppLayout>
                <Placeholder title="报告生成" description="推演报告生成、预览、导出" />
              </AppLayout>
            )}
          />

          {/* 404 */}
          <Route
            path="*"
            element={(
              <AppLayout>
                <Placeholder title="页面未找到" description="请检查URL或返回首页" />
              </AppLayout>
            )}
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

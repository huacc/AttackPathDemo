/**
 * P4 知识图谱模块主页面
 * 整合攻防知识图谱、ATT&CK映射、D3FEND映射、覆盖度分析
 */

import React from 'react';
import { Tabs } from 'antd';
import { 
  NodeIndexOutlined, 
  SecurityScanOutlined, 
  SafetyOutlined, 
  PieChartOutlined 
} from '@ant-design/icons';
import KnowledgeGraph from './KnowledgeGraph';
import ATTACKMapping from './ATTACKMapping';
import D3FENDMapping from './D3FENDMapping';
import CoverageAnalysis from './CoverageAnalysis';

const { TabPane } = Tabs;

const KnowledgePage: React.FC = () => {
  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Tabs defaultActiveKey="graph" size="large">
        <TabPane
          tab={
            <span>
              <NodeIndexOutlined />
              攻防知识图谱
            </span>
          }
          key="graph"
        >
          <KnowledgeGraph />
        </TabPane>
        <TabPane
          tab={
            <span>
              <SecurityScanOutlined />
              ATT&CK映射
            </span>
          }
          key="attack"
        >
          <ATTACKMapping />
        </TabPane>
        <TabPane
          tab={
            <span>
              <SafetyOutlined />
              D3FEND映射
            </span>
          }
          key="d3fend"
        >
          <D3FENDMapping />
        </TabPane>
        <TabPane
          tab={
            <span>
              <PieChartOutlined />
              覆盖度分析
            </span>
          }
          key="coverage"
        >
          <CoverageAnalysis />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default KnowledgePage;

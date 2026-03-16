/**
 * P5 攻击路径推演模块主页面
 * 整合推演配置、路径列表、可视化、时间轴、损伤评估
 */

import React, { useState } from 'react';
import { Row, Col, message, Tabs } from 'antd';
import PathConfigPanel, { PathConfig } from './components/PathConfigPanel';
import PathListPanel from './components/PathListPanel';
import PathVisualization from './components/PathVisualization';
import AttackChainTimeline from './components/AttackChainTimeline';
import DamageAssessment from './components/DamageAssessment';
import { ATTACK_PATHS, AttackPath } from '../../mock/dynamic/attackPaths';

const AttackPathSimulation: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [simulationResults, setSimulationResults] = useState<AttackPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<AttackPath | null>(null);

  const handleStartSimulation = async (config: PathConfig) => {
    setLoading(true);
    message.loading('正在推演攻击路径...', 0);

    // 模拟1-3秒延迟
    const delay = Math.random() * 2000 + 1000;
    
    setTimeout(() => {
      message.destroy();
      
      // 根据配置筛选路径（简化版：返回所有预置路径）
      let paths = [...ATTACK_PATHS];
      
      // 按成功率阈值筛选
      paths = paths.filter(path => path.totalSuccessRate >= config.successRateThreshold);
      
      // 限制最大路径数
      paths = paths.slice(0, config.maxPaths);
      
      // 按成功率排序
      paths.sort((a, b) => b.totalSuccessRate - a.totalSuccessRate);
      
      setSimulationResults(paths);
      setLoading(false);
      
      if (paths.length > 0) {
        message.success(`推演完成！发现 ${paths.length} 条攻击路径`);
        setSelectedPath(paths[0]);
      } else {
        message.warning('未发现符合条件的攻击路径');
      }
    }, delay);
  };

  const handleReset = () => {
    setSimulationResults([]);
    setSelectedPath(null);
  };

  const handleSelectPath = (path: AttackPath) => {
    setSelectedPath(path);
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <PathConfigPanel
            onStartSimulation={handleStartSimulation}
            onReset={handleReset}
            loading={loading}
          />
        </Col>
        
        {simulationResults.length > 0 && (
          <>
            <Col span={8}>
              <PathListPanel
                paths={simulationResults}
                selectedPath={selectedPath}
                onSelectPath={handleSelectPath}
              />
            </Col>
            <Col span={16}>
              {selectedPath && (
                <Tabs
                  defaultActiveKey="visualization"
                  items={[
                    {
                      key: 'visualization',
                      label: '路径可视化',
                      children: <PathVisualization path={selectedPath} />
                    },
                    {
                      key: 'timeline',
                      label: '攻击链时间轴',
                      children: <AttackChainTimeline path={selectedPath} />
                    },
                    {
                      key: 'damage',
                      label: '损伤评估',
                      children: <DamageAssessment path={selectedPath} />
                    }
                  ]}
                />
              )}
            </Col>
          </>
        )}
      </Row>
    </div>
  );
};

export default AttackPathSimulation;

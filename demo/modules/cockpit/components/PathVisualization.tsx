/**
 * P5.4 路径可视化与动画
 * 展示攻击路径详情和动画控制
 */

import React, { useState, useEffect } from 'react';
import { Card, Space, Button, Slider, Tag, Steps, Descriptions, Progress } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  FastForwardOutlined,
  FastBackwardOutlined,
  FireOutlined
} from '@ant-design/icons';
import { AttackPath } from '../../../mock/dynamic/attackPaths';

interface PathVisualizationProps {
  path: AttackPath;
}

const PathVisualization: React.FC<PathVisualizationProps> = ({ path }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [speed, setSpeed] = useState(1); // 1x, 2x, 0.5x
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && currentStep < path.attackPhases.length) {
      const duration = path.attackPhases[currentStep].estimatedDuration * 1000 / speed;
      const steps = 100;
      const stepDuration = duration / steps;
      
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setCurrentStep(step => {
              if (step + 1 >= path.attackPhases.length) {
                setIsPlaying(false);
                return step;
              }
              return step + 1;
            });
            return 0;
          }
          return prev + 1;
        });
      }, stepDuration);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentStep, speed, path.attackPhases]);

  const handlePlay = () => {
    if (currentStep >= path.attackPhases.length) {
      setCurrentStep(0);
      setProgress(0);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setProgress(0);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
  };

  const getKillChainColor = (phase: string): string => {
    const colorMap: Record<string, string> = {
      'reconnaissance': 'blue',
      'weaponization': 'cyan',
      'delivery': 'geekblue',
      'exploitation': 'orange',
      'installation': 'gold',
      'command_and_control': 'purple',
      'actions_on_objectives': 'red',
      'execution': 'volcano',
      'persistence': 'magenta',
      'privilege_escalation': 'red',
      'defense_evasion': 'orange',
      'credential_access': 'gold',
      'discovery': 'lime',
      'lateral_movement': 'green',
      'collection': 'cyan',
      'exfiltration': 'geekblue'
    };
    return colorMap[phase] || 'default';
  };

  const currentPhase = path.attackPhases[currentStep];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      {/* 动画控制面板 */}
      <Card title="动画控制" size="small">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space size="middle">
            {!isPlaying ? (
              <Button 
                type="primary" 
                icon={<PlayCircleOutlined />}
                onClick={handlePlay}
                disabled={currentStep >= path.attackPhases.length && progress === 0}
              >
                播放
              </Button>
            ) : (
              <Button 
                icon={<PauseCircleOutlined />}
                onClick={handlePause}
              >
                暂停
              </Button>
            )}
            <Button 
              icon={<ReloadOutlined />}
              onClick={handleReset}
            >
              重置
            </Button>
            <Button
              icon={<FastBackwardOutlined />}
              onClick={() => handleSpeedChange(0.5)}
              type={speed === 0.5 ? 'primary' : 'default'}
            >
              0.5x
            </Button>
            <Button
              onClick={() => handleSpeedChange(1)}
              type={speed === 1 ? 'primary' : 'default'}
            >
              1x
            </Button>
            <Button
              icon={<FastForwardOutlined />}
              onClick={() => handleSpeedChange(2)}
              type={speed === 2 ? 'primary' : 'default'}
            >
              2x
            </Button>
          </Space>
          
          <div>
            <div style={{ marginBottom: 8 }}>
              <span>攻击进度：步骤 {currentStep + 1} / {path.attackPhases.length}</span>
            </div>
            <Progress 
              percent={Math.round((currentStep / path.attackPhases.length) * 100 + (progress / path.attackPhases.length))} 
              status={isPlaying ? 'active' : 'normal'}
              strokeColor={{
                '0%': '#ff4d4f',
                '100%': '#ff7875',
              }}
            />
          </div>
        </Space>
      </Card>

      {/* 当前攻击步骤详情 */}
      {currentPhase && (
        <Card 
          title={
            <Space>
              <FireOutlined style={{ color: '#ff4d4f' }} />
              <span>当前攻击步骤 #{currentStep + 1}</span>
              <Tag color={getKillChainColor(currentPhase.killChainPhase)}>
                {currentPhase.killChainPhase}
              </Tag>
            </Space>
          }
          size="small"
        >
          <Descriptions column={2} size="small">
            <Descriptions.Item label="目标节点">
              {currentPhase.targetNodeName}
            </Descriptions.Item>
            <Descriptions.Item label="攻击技术">
              {currentPhase.techniqueName} ({currentPhase.techniqueId})
            </Descriptions.Item>
            {currentPhase.vulnerabilityName && (
              <Descriptions.Item label="利用漏洞" span={2}>
                {currentPhase.vulnerabilityName}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="成功率">
              <Progress 
                percent={Math.round(currentPhase.actualSuccessRate * 100)} 
                size="small"
                style={{ width: 120 }}
              />
            </Descriptions.Item>
            <Descriptions.Item label="预计耗时">
              {currentPhase.estimatedDuration}分钟
            </Descriptions.Item>
            <Descriptions.Item label="检测概率">
              {Math.round(currentPhase.detectionProbability * 100)}%
            </Descriptions.Item>
            <Descriptions.Item label="步骤进度">
              <Progress percent={progress} size="small" style={{ width: 120 }} />
            </Descriptions.Item>
            <Descriptions.Item label="描述" span={2}>
              {currentPhase.description}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* 攻击链全景 */}
      <Card title="攻击链全景" size="small">
        <Steps
          current={currentStep}
          direction="vertical"
          size="small"
          items={path.attackPhases.map((phase, index) => ({
            title: `步骤 ${index + 1}: ${phase.targetNodeName}`,
            description: (
              <Space direction="vertical" size="small">
                <span>{phase.techniqueName}</span>
                <Space size="small">
                  <Tag color={getKillChainColor(phase.killChainPhase)} style={{ fontSize: 11 }}>
                    {phase.killChainPhase}
                  </Tag>
                  <span style={{ fontSize: 11, color: '#666' }}>
                    成功率: {Math.round(phase.actualSuccessRate * 100)}%
                  </span>
                  <span style={{ fontSize: 11, color: '#666' }}>
                    {phase.estimatedDuration}分钟
                  </span>
                </Space>
              </Space>
            ),
            status: index < currentStep ? 'finish' : index === currentStep ? 'process' : 'wait'
          }))}
        />
      </Card>
    </Space>
  );
};

export default PathVisualization;

/**
 * P7.2 时间轴控制器
 * 提供播放/暂停/停止、速度控制、时间进度条功能
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Slider, Space, Tag, Select } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  FastForwardOutlined,
  FastBackwardOutlined
} from '@ant-design/icons';

const { Option } = Select;

export interface TimelineControllerProps {
  maxTime: number; // 最大时间（分钟）
  onTimeChange?: (time: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  onSpeedChange?: (speed: number) => void;
}

const TimelineController: React.FC<TimelineControllerProps> = ({
  maxTime,
  onTimeChange,
  onPlayStateChange,
  onSpeedChange
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // 格式化时间显示
  const formatTime = (minutes: number): string => {
    const mins = Math.floor(minutes);
    const secs = Math.floor((minutes - mins) * 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // 播放控制
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const next = prev + (speed * 0.1); // 每100ms增加 speed * 0.1 分钟
        if (next >= maxTime) {
          setIsPlaying(false);
          onPlayStateChange?.(false);
          return maxTime;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, speed, maxTime, onPlayStateChange]);

  // 时间变化回调
  useEffect(() => {
    onTimeChange?.(currentTime);
  }, [currentTime, onTimeChange]);

  // 播放/暂停
  const handlePlayPause = useCallback(() => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    onPlayStateChange?.(newState);
  }, [isPlaying, onPlayStateChange]);

  // 停止
  const handleStop = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    onPlayStateChange?.(false);
  }, [onPlayStateChange]);

  // 速度变化
  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
    onSpeedChange?.(newSpeed);
  }, [onSpeedChange]);

  // 进度条拖拽
  const handleSliderChange = useCallback((value: number) => {
    setCurrentTime(value);
  }, []);

  // 快进
  const handleFastForward = useCallback(() => {
    setCurrentTime(prev => Math.min(prev + 10, maxTime));
  }, [maxTime]);

  // 快退
  const handleFastBackward = useCallback(() => {
    setCurrentTime(prev => Math.max(prev - 10, 0));
  }, []);

  return (
    <Card size="small" style={{ background: '#fafafa' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* 控制按钮 */}
        <Space size="middle" style={{ width: '100%', justifyContent: 'center' }}>
          <Button
            icon={<FastBackwardOutlined />}
            onClick={handleFastBackward}
            disabled={currentTime === 0}
          >
            -10s
          </Button>

          {!isPlaying ? (
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={handlePlayPause}
              disabled={currentTime >= maxTime}
              size="large"
            >
              播放
            </Button>
          ) : (
            <Button
              icon={<PauseCircleOutlined />}
              onClick={handlePlayPause}
              size="large"
            >
              暂停
            </Button>
          )}

          <Button
            icon={<StopOutlined />}
            onClick={handleStop}
            disabled={currentTime === 0 && !isPlaying}
          >
            停止
          </Button>

          <Button
            icon={<FastForwardOutlined />}
            onClick={handleFastForward}
            disabled={currentTime >= maxTime}
          >
            +10s
          </Button>
        </Space>

        {/* 速度控制 */}
        <Space style={{ width: '100%', justifyContent: 'center' }}>
          <span style={{ color: '#666' }}>播放速度：</span>
          <Select
            value={speed}
            onChange={handleSpeedChange}
            style={{ width: 100 }}
          >
            <Option value={0.5}>0.5x</Option>
            <Option value={1}>1x</Option>
            <Option value={2}>2x</Option>
            <Option value={4}>4x</Option>
          </Select>
          <Tag color={isPlaying ? 'green' : 'default'}>
            {isPlaying ? '播放中' : '已暂停'}
          </Tag>
        </Space>

        {/* 时间进度条 */}
        <div style={{ width: '100%' }}>
          <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#666', fontSize: 12 }}>
              当前时间: <strong>{formatTime(currentTime)}</strong>
            </span>
            <span style={{ color: '#666', fontSize: 12 }}>
              总时长: <strong>{formatTime(maxTime)}</strong>
            </span>
          </div>
          <Slider
            min={0}
            max={maxTime}
            step={0.1}
            value={currentTime}
            onChange={handleSliderChange}
            tooltip={{
              formatter: (value) => formatTime(value || 0)
            }}
            marks={{
              0: '0:00',
              [maxTime / 4]: formatTime(maxTime / 4),
              [maxTime / 2]: formatTime(maxTime / 2),
              [maxTime * 3 / 4]: formatTime(maxTime * 3 / 4),
              [maxTime]: formatTime(maxTime)
            }}
          />
        </div>

        {/* 进度百分比 */}
        <div style={{ textAlign: 'center', color: '#999', fontSize: 12 }}>
          进度: {((currentTime / maxTime) * 100).toFixed(1)}%
        </div>
      </Space>
    </Card>
  );
};

export default TimelineController;

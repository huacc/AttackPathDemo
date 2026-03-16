import React from 'react';
import { Space, Select, Button, Tooltip, Divider } from 'antd';
import {
  FullscreenOutlined,
  FullscreenExitOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  CameraOutlined,
  LayoutOutlined,
  ReloadOutlined
} from '@ant-design/icons';

export type LayoutType = 'force' | 'dagre' | 'grid' | 'circular' | 'preset';

interface SandboxToolbarProps {
  // 场景控制
  scenes: Array<{ sceneId: string; name: string }>;
  currentSceneId: string;
  onSceneChange: (sceneId: string) => void;

  // 布局控制
  currentLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;

  // 缩放控制
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;

  // 全屏控制
  isFullscreen: boolean;
  onFullscreenToggle: () => void;

  // 导出功能
  onExportImage: () => void;
}

/**
 * 沙盘工具栏组件
 * 提供场景切换、布局切换、缩放控制、全屏、导出等功能
 */
export const SandboxToolbar: React.FC<SandboxToolbarProps> = ({
  scenes,
  currentSceneId,
  onSceneChange,
  currentLayout,
  onLayoutChange,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  isFullscreen,
  onFullscreenToggle,
  onExportImage
}) => {
  const layoutOptions = [
    { value: 'preset', label: '预设布局' },
    { value: 'force', label: '力导向布局' },
    { value: 'dagre', label: '层次布局' },
    { value: 'grid', label: '网格布局' },
    { value: 'circular', label: '环形布局' }
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #e8e8e8'
      }}
    >
      {/* 左侧：场景和布局控制 */}
      <Space size="middle">
        <Space>
          <span style={{ fontSize: 12, color: '#666' }}>场景:</span>
          <Select
            value={currentSceneId}
            onChange={onSceneChange}
            style={{ width: 200 }}
            options={scenes.map(s => ({ value: s.sceneId, label: s.name }))}
          />
        </Space>

        <Divider type="vertical" />

        <Space>
          <span style={{ fontSize: 12, color: '#666' }}>布局:</span>
          <Select
            value={currentLayout}
            onChange={onLayoutChange}
            style={{ width: 140 }}
            options={layoutOptions}
          />
        </Space>
      </Space>

      {/* 右侧：操作按钮 */}
      <Space size="small">
        <Tooltip title="放大">
          <Button
            type="text"
            icon={<ZoomInOutlined />}
            onClick={onZoomIn}
          />
        </Tooltip>

        <Tooltip title="缩小">
          <Button
            type="text"
            icon={<ZoomOutOutlined />}
            onClick={onZoomOut}
          />
        </Tooltip>

        <Tooltip title="重置视图">
          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={onZoomReset}
          />
        </Tooltip>

        <Divider type="vertical" />

        <Tooltip title="导出图片">
          <Button
            type="text"
            icon={<CameraOutlined />}
            onClick={onExportImage}
          />
        </Tooltip>

        <Tooltip title={isFullscreen ? '退出全屏' : '全屏'}>
          <Button
            type="text"
            icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            onClick={onFullscreenToggle}
          />
        </Tooltip>
      </Space>
    </div>
  );
};

export default SandboxToolbar;

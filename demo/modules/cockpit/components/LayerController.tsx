import React from 'react';
import { Radio, Checkbox, Space, Card } from 'antd';
import { AppstoreOutlined, ShareAltOutlined, SafetyOutlined } from '@ant-design/icons';

export type LayerType = 'business' | 'network' | 'attack';

export interface LayerConfig {
  business: boolean;
  network: boolean;
  attack: boolean;
}

interface LayerControllerProps {
  activeLayer: LayerType;
  layerConfig: LayerConfig;
  onLayerChange: (layer: LayerType) => void;
  onLayerToggle: (layer: LayerType, enabled: boolean) => void;
}

/**
 * 图层控制器组件
 * 支持3个图层：业务层、网络层、攻防层
 * 支持单选切换和叠加显示
 */
export const LayerController: React.FC<LayerControllerProps> = ({
  activeLayer,
  layerConfig,
  onLayerChange,
  onLayerToggle
}) => {
  return (
    <Card
      title="图层控制"
      size="small"
      style={{ width: 280 }}
      bodyStyle={{ padding: '12px' }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* 主图层切换 */}
        <div>
          <div style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>
            主图层
          </div>
          <Radio.Group
            value={activeLayer}
            onChange={(e) => onLayerChange(e.target.value)}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Radio value="business">
                <Space>
                  <AppstoreOutlined />
                  <span>业务层</span>
                </Space>
              </Radio>
              <Radio value="network">
                <Space>
                  <ShareAltOutlined />
                  <span>网络层</span>
                </Space>
              </Radio>
              <Radio value="attack">
                <Space>
                  <SafetyOutlined />
                  <span>攻防层</span>
                </Space>
              </Radio>
            </Space>
          </Radio.Group>
        </div>

        {/* 图层叠加 */}
        <div>
          <div style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>
            叠加显示
          </div>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Checkbox
              checked={layerConfig.business}
              onChange={(e) => onLayerToggle('business', e.target.checked)}
            >
              <Space>
                <AppstoreOutlined />
                <span>业务分组</span>
              </Space>
            </Checkbox>
            <Checkbox
              checked={layerConfig.network}
              onChange={(e) => onLayerToggle('network', e.target.checked)}
            >
              <Space>
                <ShareAltOutlined />
                <span>网络拓扑</span>
              </Space>
            </Checkbox>
            <Checkbox
              checked={layerConfig.attack}
              onChange={(e) => onLayerToggle('attack', e.target.checked)}
            >
              <Space>
                <SafetyOutlined />
                <span>攻防态势</span>
              </Space>
            </Checkbox>
          </Space>
        </div>

        {/* 图层说明 */}
        <div style={{ fontSize: 11, color: '#999', lineHeight: 1.5 }}>
          <div><strong>业务层：</strong>按业务系统分组显示</div>
          <div><strong>网络层：</strong>显示网络拓扑和连接</div>
          <div><strong>攻防层：</strong>显示攻击路径和防御态势</div>
        </div>
      </Space>
    </Card>
  );
};

export default LayerController;

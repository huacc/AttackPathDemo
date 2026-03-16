import React from 'react';
import {
  CloudOutlined,
  ApiOutlined,
  DatabaseOutlined,
  FireOutlined,
  LaptopOutlined,
  MobileOutlined,
  GlobalOutlined,
  ClusterOutlined,
  SafetyOutlined,
  AppstoreOutlined,
  HddOutlined
} from '@ant-design/icons';

/**
 * 设备类型图标映射
 * 支持≥8种设备类型
 */
export const DEVICE_ICONS: Record<string, React.ReactNode> = {
  server: <HddOutlined />,
  router: <ApiOutlined />,
  switch: <ClusterOutlined />,
  firewall: <FireOutlined />,
  load_balancer: <CloudOutlined />,
  endpoint: <LaptopOutlined />,
  iot_device: <MobileOutlined />,
  web_application: <GlobalOutlined />,
  database: <DatabaseOutlined />,
  middleware: <AppstoreOutlined />,
  container: <HddOutlined />,
  api_gateway: <ApiOutlined />,
  domain_controller: <SafetyOutlined />
};

/**
 * 根据安全评分获取颜色
 */
export const getSecurityScoreColor = (score?: number): string => {
  if (!score) return '#999999';
  if (score >= 80) return '#52c41a'; // 绿色 - 安全
  if (score >= 60) return '#faad14'; // 橙色 - 中等
  if (score >= 40) return '#ff7a45'; // 橙红 - 较低
  return '#f5222d'; // 红色 - 危险
};

/**
 * 根据状态获取颜色
 */
export const getStatusColor = (status?: string): string => {
  switch (status) {
    case 'online':
      return '#52c41a'; // 绿色
    case 'offline':
      return '#d9d9d9'; // 灰色
    case 'degraded':
      return '#faad14'; // 橙色
    case 'compromised':
      return '#f5222d'; // 红色
    default:
      return '#999999';
  }
};

/**
 * 根据状态获取中文标签
 */
export const getStatusLabel = (status?: string): string => {
  switch (status) {
    case 'online':
      return '在线';
    case 'offline':
      return '离线';
    case 'degraded':
      return '降级';
    case 'compromised':
      return '失陷';
    default:
      return '未知';
  }
};

/**
 * 注册自定义G6节点类型
 */
export const registerCustomNode = (G6: any) => {
  G6.registerNode('network-node', {
    draw(cfg: any, group: any) {
      const { deviceCategory, name, ipv4Address, securityScore, status } = cfg;
      
      const isCompromised = status === 'compromised';
      const nodeColor = getSecurityScoreColor(securityScore);
      const statusColor = getStatusColor(status);
      
      // 主容器
      const container = group.addShape('rect', {
        attrs: {
          x: -80,
          y: -50,
          width: 160,
          height: 100,
          radius: 8,
          fill: '#ffffff',
          stroke: isCompromised ? '#f5222d' : nodeColor,
          lineWidth: isCompromised ? 3 : 2,
          shadowColor: isCompromised ? '#f5222d' : 'rgba(0,0,0,0.1)',
          shadowBlur: isCompromised ? 15 : 10,
          shadowOffsetX: 0,
          shadowOffsetY: 2,
          cursor: 'pointer'
        },
        name: 'node-container',
        draggable: true
      });

      // 失陷节点闪烁效果
      if (isCompromised) {
        container.animate(
          {
            shadowBlur: 25,
            opacity: 0.8
          },
          {
            duration: 1000,
            repeat: true,
            easing: 'easeCubic'
          }
        );
      }

      // 设备图标背景
      group.addShape('circle', {
        attrs: {
          x: -50,
          y: -20,
          r: 18,
          fill: nodeColor,
          opacity: 0.2
        },
        name: 'icon-bg'
      });

      // 设备类型文字（模拟图标）
      const iconText = getDeviceIconText(deviceCategory);
      group.addShape('text', {
        attrs: {
          x: -50,
          y: -20,
          text: iconText,
          fontSize: 20,
          fill: nodeColor,
          textAlign: 'center',
          textBaseline: 'middle',
          fontWeight: 'bold'
        },
        name: 'device-icon'
      });

      // 节点名称
      group.addShape('text', {
        attrs: {
          x: 0,
          y: -20,
          text: truncateText(name, 12),
          fontSize: 14,
          fill: '#262626',
          textAlign: 'left',
          textBaseline: 'middle',
          fontWeight: 'bold'
        },
        name: 'node-name'
      });

      // IP地址
      if (ipv4Address) {
        group.addShape('text', {
          attrs: {
            x: 0,
            y: 0,
            text: ipv4Address.split('/')[0],
            fontSize: 11,
            fill: '#8c8c8c',
            textAlign: 'left',
            textBaseline: 'middle'
          },
          name: 'node-ip'
        });
      }

      // 安全评分
      if (securityScore !== undefined) {
        group.addShape('text', {
          attrs: {
            x: 0,
            y: 18,
            text: `评分: ${securityScore}`,
            fontSize: 11,
            fill: nodeColor,
            textAlign: 'left',
            textBaseline: 'middle',
            fontWeight: 'bold'
          },
          name: 'security-score'
        });
      }

      // 状态指示灯
      group.addShape('circle', {
        attrs: {
          x: 65,
          y: -35,
          r: 6,
          fill: statusColor,
          stroke: '#ffffff',
          lineWidth: 2
        },
        name: 'status-indicator'
      });

      // 状态指示灯闪烁（在线状态）
      if (status === 'online') {
        const indicator = group.findById('status-indicator');
        if (indicator) {
          indicator.animate(
            {
              opacity: 0.3
            },
            {
              duration: 2000,
              repeat: true,
              easing: 'easeCubic'
            }
          );
        }
      }

      return container;
    },
    
    // 更新节点
    update(cfg: any, node: any) {
      const group = node.getContainer();
      const { securityScore, status } = cfg;
      
      // 更新边框颜色
      const container = group.find((element: any) => element.get('name') === 'node-container');
      if (container) {
        const isCompromised = status === 'compromised';
        const nodeColor = getSecurityScoreColor(securityScore);
        container.attr({
          stroke: isCompromised ? '#f5222d' : nodeColor,
          lineWidth: isCompromised ? 3 : 2
        });
      }

      // 更新状态指示灯
      const indicator = group.find((element: any) => element.get('name') === 'status-indicator');
      if (indicator) {
        indicator.attr({
          fill: getStatusColor(status)
        });
      }
    },

    // 设置节点状态样式
    setState(name: string, value: boolean, node: any) {
      const group = node.getContainer();
      const container = group.find((element: any) => element.get('name') === 'node-container');
      
      if (name === 'hover') {
        if (value) {
          container.attr({
            shadowBlur: 20,
            shadowColor: 'rgba(24, 144, 255, 0.5)'
          });
        } else {
          const cfg = node.getModel();
          const isCompromised = cfg.status === 'compromised';
          container.attr({
            shadowBlur: isCompromised ? 15 : 10,
            shadowColor: isCompromised ? '#f5222d' : 'rgba(0,0,0,0.1)'
          });
        }
      }

      if (name === 'selected') {
        if (value) {
          container.attr({
            stroke: '#1890ff',
            lineWidth: 3
          });
        } else {
          const cfg = node.getModel();
          const isCompromised = cfg.status === 'compromised';
          const nodeColor = getSecurityScoreColor(cfg.securityScore);
          container.attr({
            stroke: isCompromised ? '#f5222d' : nodeColor,
            lineWidth: isCompromised ? 3 : 2
          });
        }
      }
    }
  });
};

/**
 * 获取设备图标文字（简化版，用文字代替图标）
 */
const getDeviceIconText = (deviceCategory: string): string => {
  const iconMap: Record<string, string> = {
    server: '服',
    router: '路',
    switch: '交',
    firewall: '防',
    load_balancer: '负',
    endpoint: '端',
    iot_device: '物',
    web_application: 'W',
    database: '库',
    middleware: '中',
    container: '容',
    api_gateway: 'A',
    domain_controller: '域'
  };
  return iconMap[deviceCategory] || '?';
};

/**
 * 截断文本
 */
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export default {
  registerCustomNode,
  DEVICE_ICONS,
  getSecurityScoreColor,
  getStatusColor,
  getStatusLabel
};

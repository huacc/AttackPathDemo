import React from 'react';

/**
 * 协议类型到颜色的映射
 */
export const PROTOCOL_COLORS: Record<string, string> = {
  https: '#52c41a',    // 绿色 - 安全协议
  http: '#faad14',     // 橙色 - 非加密HTTP
  tcp: '#1890ff',      // 蓝色 - 通用TCP
  udp: '#722ed1',      // 紫色 - UDP
  smb: '#eb2f96',      // 粉色 - 文件共享
  rdp: '#fa8c16',      // 橙红 - 远程桌面
  ldap: '#13c2c2',     // 青色 - 目录服务
  smtp: '#a0d911',     // 黄绿 - 邮件
  ssh: '#2f54eb',      // 深蓝 - SSH
  dns: '#52c41a',      // 绿色 - DNS
  ftp: '#fa541c',      // 橙红 - FTP
  mysql: '#722ed1',    // 紫色 - MySQL
  postgres: '#1890ff', // 蓝色 - PostgreSQL
  redis: '#f5222d',    // 红色 - Redis
  kafka: '#faad14'     // 橙色 - Kafka
};

/**
 * 根据协议获取连接线颜色
 */
export const getProtocolColor = (protocol: string): string => {
  return PROTOCOL_COLORS[protocol.toLowerCase()] || '#d9d9d9';
};

/**
 * 根据带宽获取连接线宽度
 */
export const getLineWidth = (bandwidth: number): number => {
  if (bandwidth >= 10000) return 3;  // 10Gbps+
  if (bandwidth >= 1000) return 2;   // 1Gbps+
  return 1;                          // <1Gbps
};

/**
 * 根据协议类型获取线条样式
 * 加密协议使用实线，非加密协议使用虚线
 */
export const getLineStyle = (protocol: string): number[] | undefined => {
  const encryptedProtocols = ['https', 'ssh', 'ldaps', 'smtps', 'ftps'];
  const proto = protocol.toLowerCase();
  
  if (encryptedProtocols.includes(proto)) {
    return undefined; // 实线
  }
  return [5, 5]; // 虚线
};

/**
 * 判断是否为跨域连接
 */
export const isCrossDomainConnection = (
  sourceZone: string,
  targetZone: string
): boolean => {
  return sourceZone !== targetZone;
};

/**
 * 获取跨域连接的样式
 */
export const getCrossDomainStyle = () => ({
  lineDash: [10, 5],
  lineWidth: 2,
  opacity: 0.8,
  shadowColor: '#ff7a45',
  shadowBlur: 5
});

/**
 * 注册自定义G6边类型
 */
export const registerCustomEdge = (G6: any) => {
  // 注册普通连接线
  G6.registerEdge('network-edge', {
    draw(cfg: any, group: any) {
      const { startPoint, endPoint } = cfg;
      const { protocol = 'tcp', bandwidth = 1000, isCrossDomain = false } = cfg;

      const color = getProtocolColor(protocol);
      const lineWidth = getLineWidth(bandwidth);
      const lineDash = getLineStyle(protocol);

      // 绘制连接线
      const shape = group.addShape('path', {
        attrs: {
          path: [
            ['M', startPoint.x, startPoint.y],
            ['L', endPoint.x, endPoint.y]
          ],
          stroke: color,
          lineWidth: isCrossDomain ? lineWidth + 1 : lineWidth,
          lineDash: isCrossDomain ? [10, 5] : lineDash,
          opacity: isCrossDomain ? 0.7 : 0.6,
          endArrow: {
            path: G6.Arrow.triangle(8, 10, 0),
            fill: color,
            opacity: 0.8
          }
        },
        name: 'edge-path'
      });

      // 跨域连接添加阴影效果
      if (isCrossDomain) {
        shape.attr({
          shadowColor: '#ff7a45',
          shadowBlur: 5
        });
      }

      return shape;
    },

    // 更新边
    update(cfg: any, edge: any) {
      const group = edge.getContainer();
      const shape = group.find((element: any) => element.get('name') === 'edge-path');
      
      if (shape) {
        const { protocol = 'tcp', bandwidth = 1000, isCrossDomain = false } = cfg;
        const color = getProtocolColor(protocol);
        const lineWidth = getLineWidth(bandwidth);
        const lineDash = getLineStyle(protocol);

        shape.attr({
          stroke: color,
          lineWidth: isCrossDomain ? lineWidth + 1 : lineWidth,
          lineDash: isCrossDomain ? [10, 5] : lineDash,
          opacity: isCrossDomain ? 0.7 : 0.6
        });
      }
    },

    // 设置边状态样式
    setState(name: string, value: boolean, edge: any) {
      const group = edge.getContainer();
      const shape = group.find((element: any) => element.get('name') === 'edge-path');

      if (!shape) return;

      if (name === 'hover') {
        if (value) {
          shape.attr({
            lineWidth: shape.attr('lineWidth') + 1,
            opacity: 1,
            shadowBlur: 10,
            shadowColor: shape.attr('stroke')
          });
        } else {
          const cfg = edge.getModel();
          const { bandwidth = 1000, isCrossDomain = false } = cfg;
          const lineWidth = getLineWidth(bandwidth);
          
          shape.attr({
            lineWidth: isCrossDomain ? lineWidth + 1 : lineWidth,
            opacity: isCrossDomain ? 0.7 : 0.6,
            shadowBlur: isCrossDomain ? 5 : 0,
            shadowColor: isCrossDomain ? '#ff7a45' : undefined
          });
        }
      }

      if (name === 'selected') {
        if (value) {
          shape.attr({
            lineWidth: shape.attr('lineWidth') + 2,
            opacity: 1,
            stroke: '#1890ff'
          });
        } else {
          const cfg = edge.getModel();
          const { protocol = 'tcp', bandwidth = 1000, isCrossDomain = false } = cfg;
          const color = getProtocolColor(protocol);
          const lineWidth = getLineWidth(bandwidth);
          
          shape.attr({
            stroke: color,
            lineWidth: isCrossDomain ? lineWidth + 1 : lineWidth,
            opacity: isCrossDomain ? 0.7 : 0.6
          });
        }
      }
    },

    // 获取边的路径
    getPath(points: any[]) {
      const startPoint = points[0];
      const endPoint = points[1];
      return [
        ['M', startPoint.x, startPoint.y],
        ['L', endPoint.x, endPoint.y]
      ];
    }
  });

  // 注册带标签的连接线
  G6.registerEdge('network-edge-with-label', {
    draw(cfg: any, group: any) {
      const { startPoint, endPoint } = cfg;
      const { protocol = 'tcp', bandwidth = 1000, isCrossDomain = false, label } = cfg;

      const color = getProtocolColor(protocol);
      const lineWidth = getLineWidth(bandwidth);
      const lineDash = getLineStyle(protocol);

      // 绘制连接线
      const shape = group.addShape('path', {
        attrs: {
          path: [
            ['M', startPoint.x, startPoint.y],
            ['L', endPoint.x, endPoint.y]
          ],
          stroke: color,
          lineWidth: isCrossDomain ? lineWidth + 1 : lineWidth,
          lineDash: isCrossDomain ? [10, 5] : lineDash,
          opacity: isCrossDomain ? 0.7 : 0.6,
          endArrow: {
            path: G6.Arrow.triangle(8, 10, 0),
            fill: color,
            opacity: 0.8
          }
        },
        name: 'edge-path'
      });

      // 跨域连接添加阴影效果
      if (isCrossDomain) {
        shape.attr({
          shadowColor: '#ff7a45',
          shadowBlur: 5
        });
      }

      // 添加标签（协议名称）
      if (label) {
        const midX = (startPoint.x + endPoint.x) / 2;
        const midY = (startPoint.y + endPoint.y) / 2;

        group.addShape('rect', {
          attrs: {
            x: midX - 20,
            y: midY - 10,
            width: 40,
            height: 20,
            fill: '#ffffff',
            stroke: color,
            lineWidth: 1,
            radius: 4,
            opacity: 0.9
          },
          name: 'label-bg'
        });

        group.addShape('text', {
          attrs: {
            x: midX,
            y: midY,
            text: label.toUpperCase(),
            fontSize: 10,
            fill: color,
            textAlign: 'center',
            textBaseline: 'middle',
            fontWeight: 'bold'
          },
          name: 'label-text'
        });
      }

      return shape;
    },

    setState(name: string, value: boolean, edge: any) {
      const group = edge.getContainer();
      const shape = group.find((element: any) => element.get('name') === 'edge-path');
      const labelBg = group.find((element: any) => element.get('name') === 'label-bg');
      const labelText = group.find((element: any) => element.get('name') === 'label-text');

      if (!shape) return;

      if (name === 'hover') {
        if (value) {
          shape.attr({
            lineWidth: shape.attr('lineWidth') + 1,
            opacity: 1,
            shadowBlur: 10,
            shadowColor: shape.attr('stroke')
          });
          
          if (labelBg) {
            labelBg.attr({ opacity: 1 });
          }
          if (labelText) {
            labelText.attr({ fontSize: 12 });
          }
        } else {
          const cfg = edge.getModel();
          const { bandwidth = 1000, isCrossDomain = false } = cfg;
          const lineWidth = getLineWidth(bandwidth);
          
          shape.attr({
            lineWidth: isCrossDomain ? lineWidth + 1 : lineWidth,
            opacity: isCrossDomain ? 0.7 : 0.6,
            shadowBlur: isCrossDomain ? 5 : 0,
            shadowColor: isCrossDomain ? '#ff7a45' : undefined
          });

          if (labelBg) {
            labelBg.attr({ opacity: 0.9 });
          }
          if (labelText) {
            labelText.attr({ fontSize: 10 });
          }
        }
      }
    }
  });
};

export default {
  registerCustomEdge,
  getProtocolColor,
  getLineWidth,
  getLineStyle,
  isCrossDomainConnection,
  getCrossDomainStyle,
  PROTOCOL_COLORS
};

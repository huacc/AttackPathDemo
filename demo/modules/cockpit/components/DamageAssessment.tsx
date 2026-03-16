/**
 * P5.6 损伤评估
 * 展示攻击路径的损伤评估数据
 */

import React from 'react';
import { Card, Row, Col, Descriptions, Tag, Statistic, Progress, Space, Alert } from 'antd';
import {
  WarningOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  NodeIndexOutlined,
  DatabaseOutlined,
  ShopOutlined
} from '@ant-design/icons';
import { AttackPath } from '../../../mock/dynamic/attackPaths';

interface DamageAssessmentProps {
  path: AttackPath;
}

const DamageAssessment: React.FC<DamageAssessmentProps> = ({ path }) => {
  const { damageAssessment } = path;

  const getRiskColor = (risk: string): string => {
    const colorMap: Record<string, string> = {
      'low': 'green',
      'medium': 'orange',
      'high': 'red',
      'critical': 'purple'
    };
    return colorMap[risk] || 'default';
  };

  const getRiskText = (risk: string): string => {
    const textMap: Record<string, string> = {
      'low': '低风险',
      'medium': '中等风险',
      'high': '高风险',
      'critical': '严重风险'
    };
    return textMap[risk] || risk;
  };

  const getImpactColor = (impact: string): string => {
    const colorMap: Record<string, string> = {
      'minimal': 'green',
      'moderate': 'orange',
      'significant': 'red',
      'severe': 'purple'
    };
    return colorMap[impact] || 'default';
  };

  const getImpactText = (impact: string): string => {
    const textMap: Record<string, string> = {
      'minimal': '轻微影响',
      'moderate': '中等影响',
      'significant': '重大影响',
      'severe': '严重影响'
    };
    return textMap[impact] || impact;
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      {/* 损伤概览 */}
      <Alert
        message="攻击路径损伤评估"
        description={`该攻击路径将影响 ${damageAssessment.affectedNodesCount} 个网络节点，造成${getRiskText(damageAssessment.dataLeakageRisk)}的数据泄露风险，对业务产生${getImpactText(damageAssessment.businessImpact)}。`}
        type="warning"
        showIcon
        icon={<WarningOutlined />}
      />

      {/* 关键指标 */}
      <Card title="关键损伤指标" size="small">
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Statistic
              title="受影响节点"
              value={damageAssessment.affectedNodesCount}
              prefix={<NodeIndexOutlined />}
              suffix="个"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="预估经济损失"
              value={damageAssessment.estimatedLoss}
              prefix={<DollarOutlined />}
              suffix="万元"
              valueStyle={{ color: '#cf1322' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="预计恢复时间"
              value={damageAssessment.recoveryTime}
              prefix={<ClockCircleOutlined />}
              suffix="小时"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Col>
          <Col span={6}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 8, color: '#666' }}>数据泄露风险</div>
              <Tag 
                color={getRiskColor(damageAssessment.dataLeakageRisk)}
                style={{ fontSize: 14, padding: '4px 12px' }}
              >
                {getRiskText(damageAssessment.dataLeakageRisk)}
              </Tag>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 详细评估 */}
      <Card title="详细损伤评估" size="small">
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="受影响节点数" span={2}>
            <Space>
              <span>{damageAssessment.affectedNodesCount} 个</span>
              <Progress 
                percent={Math.round((damageAssessment.affectedNodesCount / 30) * 100)} 
                size="small"
                style={{ width: 200 }}
                strokeColor="#ff4d4f"
              />
            </Space>
          </Descriptions.Item>
          
          <Descriptions.Item label="数据泄露风险">
            <Tag color={getRiskColor(damageAssessment.dataLeakageRisk)}>
              {getRiskText(damageAssessment.dataLeakageRisk)}
            </Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label="业务影响">
            <Tag color={getImpactColor(damageAssessment.businessImpact)}>
              {getImpactText(damageAssessment.businessImpact)}
            </Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label="预估经济损失">
            <span style={{ color: '#cf1322', fontWeight: 500 }}>
              {damageAssessment.estimatedLoss} 万元
            </span>
          </Descriptions.Item>
          
          <Descriptions.Item label="预计恢复时间">
            <span style={{ color: '#fa8c16', fontWeight: 500 }}>
              {damageAssessment.recoveryTime} 小时
            </span>
          </Descriptions.Item>
          
          <Descriptions.Item label="受影响节点列表" span={2}>
            <Space wrap>
              {damageAssessment.affectedNodeIds.map(nodeId => (
                <Tag key={nodeId} color="red" style={{ fontSize: 11 }}>
                  {nodeId}
                </Tag>
              ))}
            </Space>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 按安全域分布 */}
      <Card 
        title={
          <Space>
            <DatabaseOutlined />
            <span>按安全域损伤分布</span>
          </Space>
        }
        size="small"
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {damageAssessment.impactByZone.map(zone => (
            <div key={zone.zone}>
              <div style={{ marginBottom: 8 }}>
                <Space>
                  <Tag color="blue">{zone.zone}</Tag>
                  <span style={{ fontSize: 12, color: '#666' }}>
                    受影响节点: {zone.affectedNodes} 个
                  </span>
                  <span style={{ fontSize: 12, color: '#666' }}>
                    关键资产: {zone.criticalAssets} 个
                  </span>
                </Space>
              </div>
              <Progress 
                percent={Math.round((zone.affectedNodes / damageAssessment.affectedNodesCount) * 100)}
                strokeColor={{
                  '0%': '#ff4d4f',
                  '100%': '#ff7875',
                }}
              />
            </div>
          ))}
        </Space>
      </Card>

      {/* 按资产类型分布 */}
      <Card 
        title={
          <Space>
            <ShopOutlined />
            <span>按资产类型损伤分布</span>
          </Space>
        }
        size="small"
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {damageAssessment.impactByAssetType.map(asset => (
            <div key={asset.assetType}>
              <div style={{ marginBottom: 8 }}>
                <Space>
                  <Tag color="orange">{asset.assetType}</Tag>
                  <span style={{ fontSize: 12, color: '#666' }}>
                    数量: {asset.count} 个
                  </span>
                  <span style={{ fontSize: 12, color: '#666' }}>
                    占比: {asset.percentage}%
                  </span>
                </Space>
              </div>
              <Progress 
                percent={asset.percentage}
                strokeColor={{
                  '0%': '#fa8c16',
                  '100%': '#ffa940',
                }}
              />
            </div>
          ))}
        </Space>
      </Card>

      {/* 风险建议 */}
      <Card title="风险缓解建议" size="small">
        <Space direction="vertical" style={{ width: '100%' }}>
          {damageAssessment.dataLeakageRisk === 'critical' && (
            <Alert
              message="严重数据泄露风险"
              description="建议立即部署数据加密、访问控制和数据防泄漏（DLP）措施。"
              type="error"
              showIcon
            />
          )}
          {damageAssessment.businessImpact === 'severe' && (
            <Alert
              message="严重业务影响"
              description="建议制定业务连续性计划（BCP）和灾难恢复计划（DRP），确保关键业务快速恢复。"
              type="error"
              showIcon
            />
          )}
          {damageAssessment.estimatedLoss > 300 && (
            <Alert
              message="高额经济损失"
              description="建议购买网络安全保险，并加强安全防护投入，降低潜在损失。"
              type="warning"
              showIcon
            />
          )}
          {damageAssessment.recoveryTime > 48 && (
            <Alert
              message="恢复时间过长"
              description="建议建立快速响应团队，准备应急预案，缩短系统恢复时间。"
              type="warning"
              showIcon
            />
          )}
        </Space>
      </Card>
    </Space>
  );
};

export default DamageAssessment;

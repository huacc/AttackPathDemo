/**
 * P7.1 事件流 Mock 数据
 * 为每条攻击路径生成时间序列事件
 */

import { ATTACK_PATHS } from './attackPaths';

// 事件类型
export type EventType =
  | 'attack_start'
  | 'exploit_attempt'
  | 'exploit_success'
  | 'exploit_fail'
  | 'defense_detect'
  | 'defense_block'
  | 'lateral_move'
  | 'data_exfil'
  | 'node_compromised'
  | 'privilege_escalation'
  | 'persistence_established'
  | 'command_execution';

// 严重等级
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

// 事件接口
export interface SecurityEvent {
  eventId: string;
  timestamp: number; // 相对时间（分钟）
  absoluteTime: string; // 绝对时间
  eventType: EventType;
  sourceNodeId?: string;
  sourceNodeName?: string;
  targetNodeId: string;
  targetNodeName: string;
  techniqueId?: string;
  techniqueName?: string;
  severity: SeverityLevel;
  description: string;
  attackPathId: string;
  success: boolean;
  metadata?: {
    vulnerabilityId?: string;
    defenseId?: string;
    dataSize?: number;
    [key: string]: any;
  };
}

// 为攻击路径生成事件流
const generateEventsForPath = (pathId: string): SecurityEvent[] => {
  const path = ATTACK_PATHS.find(p => p.pathId === pathId);
  if (!path) return [];

  const events: SecurityEvent[] = [];
  const baseTime = new Date('2026-03-15T14:00:00Z');
  let eventCounter = 1;

  // 攻击开始事件
  events.push({
    eventId: `${pathId}-event-${String(eventCounter++).padStart(3, '0')}`,
    timestamp: 0,
    absoluteTime: baseTime.toISOString(),
    eventType: 'attack_start',
    targetNodeId: path.startNodeId,
    targetNodeName: path.startNodeName,
    severity: 'medium',
    description: `攻击开始：${path.threatActorName} 发起攻击`,
    attackPathId: pathId,
    success: true,
    metadata: {
      threatActorId: path.threatActorId,
      threatActorName: path.threatActorName
    }
  });

  // 为每个攻击阶段生成详细事件
  path.attackPhases.forEach((phase, index) => {
    const phaseStartTime = path.attackPhases
      .slice(0, index)
      .reduce((sum, p) => sum + p.estimatedDuration, 0);

    // 漏洞利用尝试
    if (phase.vulnerabilityId) {
      events.push({
        eventId: `${pathId}-event-${String(eventCounter++).padStart(3, '0')}`,
        timestamp: phaseStartTime,
        absoluteTime: new Date(baseTime.getTime() + phaseStartTime * 60000).toISOString(),
        eventType: 'exploit_attempt',
        sourceNodeId: index > 0 ? path.attackPhases[index - 1].targetNodeId : path.startNodeId,
        sourceNodeName: index > 0 ? path.attackPhases[index - 1].targetNodeName : path.startNodeName,
        targetNodeId: phase.targetNodeId,
        targetNodeName: phase.targetNodeName,
        techniqueId: phase.techniqueId,
        techniqueName: phase.techniqueName,
        severity: 'high',
        description: `尝试利用漏洞：${phase.vulnerabilityName}`,
        attackPathId: pathId,
        success: false,
        metadata: {
          vulnerabilityId: phase.vulnerabilityId,
          vulnerabilityName: phase.vulnerabilityName
        }
      });
    }

    // 防御检测事件（随机）
    if (Math.random() < phase.detectionProbability) {
      events.push({
        eventId: `${pathId}-event-${String(eventCounter++).padStart(3, '0')}`,
        timestamp: phaseStartTime + phase.estimatedDuration * 0.3,
        absoluteTime: new Date(
          baseTime.getTime() + (phaseStartTime + phase.estimatedDuration * 0.3) * 60000
        ).toISOString(),
        eventType: 'defense_detect',
        targetNodeId: phase.targetNodeId,
        targetNodeName: phase.targetNodeName,
        techniqueId: phase.techniqueId,
        techniqueName: phase.techniqueName,
        severity: 'medium',
        description: `检测到攻击行为：${phase.techniqueName}`,
        attackPathId: pathId,
        success: true,
        metadata: {
          detectionMethod: 'IDS/IPS'
        }
      });

      // 防御阻断事件（部分成功）
      if (Math.random() < 0.3) {
        events.push({
          eventId: `${pathId}-event-${String(eventCounter++).padStart(3, '0')}`,
          timestamp: phaseStartTime + phase.estimatedDuration * 0.5,
          absoluteTime: new Date(
            baseTime.getTime() + (phaseStartTime + phase.estimatedDuration * 0.5) * 60000
          ).toISOString(),
          eventType: 'defense_block',
          targetNodeId: phase.targetNodeId,
          targetNodeName: phase.targetNodeName,
          techniqueId: phase.techniqueId,
          techniqueName: phase.techniqueName,
          severity: 'low',
          description: `成功阻断攻击：${phase.techniqueName}`,
          attackPathId: pathId,
          success: true,
          metadata: {
            defenseMethod: 'WAF/Firewall'
          }
        });
      }
    }

    // 漏洞利用成功
    if (Math.random() < phase.actualSuccessRate) {
      events.push({
        eventId: `${pathId}-event-${String(eventCounter++).padStart(3, '0')}`,
        timestamp: phaseStartTime + phase.estimatedDuration * 0.6,
        absoluteTime: new Date(
          baseTime.getTime() + (phaseStartTime + phase.estimatedDuration * 0.6) * 60000
        ).toISOString(),
        eventType: 'exploit_success',
        sourceNodeId: index > 0 ? path.attackPhases[index - 1].targetNodeId : path.startNodeId,
        sourceNodeName: index > 0 ? path.attackPhases[index - 1].targetNodeName : path.startNodeName,
        targetNodeId: phase.targetNodeId,
        targetNodeName: phase.targetNodeName,
        techniqueId: phase.techniqueId,
        techniqueName: phase.techniqueName,
        severity: 'critical',
        description: `漏洞利用成功：${phase.techniqueName}`,
        attackPathId: pathId,
        success: true,
        metadata: {
          vulnerabilityId: phase.vulnerabilityId
        }
      });

      // 节点被攻陷
      events.push({
        eventId: `${pathId}-event-${String(eventCounter++).padStart(3, '0')}`,
        timestamp: phaseStartTime + phase.estimatedDuration * 0.7,
        absoluteTime: new Date(
          baseTime.getTime() + (phaseStartTime + phase.estimatedDuration * 0.7) * 60000
        ).toISOString(),
        eventType: 'node_compromised',
        targetNodeId: phase.targetNodeId,
        targetNodeName: phase.targetNodeName,
        severity: 'critical',
        description: `节点被攻陷：${phase.targetNodeName}`,
        attackPathId: pathId,
        success: true
      });
    } else {
      // 漏洞利用失败
      events.push({
        eventId: `${pathId}-event-${String(eventCounter++).padStart(3, '0')}`,
        timestamp: phaseStartTime + phase.estimatedDuration * 0.8,
        absoluteTime: new Date(
          baseTime.getTime() + (phaseStartTime + phase.estimatedDuration * 0.8) * 60000
        ).toISOString(),
        eventType: 'exploit_fail',
        sourceNodeId: index > 0 ? path.attackPhases[index - 1].targetNodeId : path.startNodeId,
        sourceNodeName: index > 0 ? path.attackPhases[index - 1].targetNodeName : path.startNodeName,
        targetNodeId: phase.targetNodeId,
        targetNodeName: phase.targetNodeName,
        techniqueId: phase.techniqueId,
        techniqueName: phase.techniqueName,
        severity: 'low',
        description: `漏洞利用失败：${phase.techniqueName}`,
        attackPathId: pathId,
        success: false
      });
    }

    // 横向移动事件
    if (phase.killChainPhase === 'lateral_movement' && index > 0) {
      events.push({
        eventId: `${pathId}-event-${String(eventCounter++).padStart(3, '0')}`,
        timestamp: phaseStartTime + phase.estimatedDuration * 0.8,
        absoluteTime: new Date(
          baseTime.getTime() + (phaseStartTime + phase.estimatedDuration * 0.8) * 60000
        ).toISOString(),
        eventType: 'lateral_move',
        sourceNodeId: path.attackPhases[index - 1].targetNodeId,
        sourceNodeName: path.attackPhases[index - 1].targetNodeName,
        targetNodeId: phase.targetNodeId,
        targetNodeName: phase.targetNodeName,
        techniqueId: phase.techniqueId,
        techniqueName: phase.techniqueName,
        severity: 'high',
        description: `横向移动：从 ${path.attackPhases[index - 1].targetNodeName} 到 ${phase.targetNodeName}`,
        attackPathId: pathId,
        success: true
      });
    }

    // 权限提升事件
    if (phase.killChainPhase === 'privilege_escalation') {
      events.push({
        eventId: `${pathId}-event-${String(eventCounter++).padStart(3, '0')}`,
        timestamp: phaseStartTime + phase.estimatedDuration * 0.9,
        absoluteTime: new Date(
          baseTime.getTime() + (phaseStartTime + phase.estimatedDuration * 0.9) * 60000
        ).toISOString(),
        eventType: 'privilege_escalation',
        targetNodeId: phase.targetNodeId,
        targetNodeName: phase.targetNodeName,
        techniqueId: phase.techniqueId,
        techniqueName: phase.techniqueName,
        severity: 'critical',
        description: `权限提升成功：${phase.targetNodeName}`,
        attackPathId: pathId,
        success: true
      });
    }

    // 持久化事件
    if (phase.killChainPhase === 'persistence') {
      events.push({
        eventId: `${pathId}-event-${String(eventCounter++).padStart(3, '0')}`,
        timestamp: phaseStartTime + phase.estimatedDuration * 0.9,
        absoluteTime: new Date(
          baseTime.getTime() + (phaseStartTime + phase.estimatedDuration * 0.9) * 60000
        ).toISOString(),
        eventType: 'persistence_established',
        targetNodeId: phase.targetNodeId,
        targetNodeName: phase.targetNodeName,
        techniqueId: phase.techniqueId,
        techniqueName: phase.techniqueName,
        severity: 'high',
        description: `建立持久化：${phase.targetNodeName}`,
        attackPathId: pathId,
        success: true
      });
    }

    // 命令执行事件
    if (phase.killChainPhase === 'execution') {
      events.push({
        eventId: `${pathId}-event-${String(eventCounter++).padStart(3, '0')}`,
        timestamp: phaseStartTime + phase.estimatedDuration * 0.95,
        absoluteTime: new Date(
          baseTime.getTime() + (phaseStartTime + phase.estimatedDuration * 0.95) * 60000
        ).toISOString(),
        eventType: 'command_execution',
        targetNodeId: phase.targetNodeId,
        targetNodeName: phase.targetNodeName,
        techniqueId: phase.techniqueId,
        techniqueName: phase.techniqueName,
        severity: 'high',
        description: `执行恶意命令：${phase.targetNodeName}`,
        attackPathId: pathId,
        success: true
      });
    }

    // 数据外传事件
    if (phase.killChainPhase === 'exfiltration' || phase.killChainPhase === 'collection') {
      events.push({
        eventId: `${pathId}-event-${String(eventCounter++).padStart(3, '0')}`,
        timestamp: phaseStartTime + phase.estimatedDuration,
        absoluteTime: new Date(
          baseTime.getTime() + (phaseStartTime + phase.estimatedDuration) * 60000
        ).toISOString(),
        eventType: 'data_exfil',
        sourceNodeId: phase.targetNodeId,
        sourceNodeName: phase.targetNodeName,
        targetNodeId: 'node-external-01',
        targetNodeName: 'Internet',
        techniqueId: phase.techniqueId,
        techniqueName: phase.techniqueName,
        severity: 'critical',
        description: `数据外传：从 ${phase.targetNodeName} 外传数据`,
        attackPathId: pathId,
        success: true,
        metadata: {
          dataSize: Math.floor(Math.random() * 1000) + 100 // MB
        }
      });
    }
  });

  // 按时间戳排序
  return events.sort((a, b) => a.timestamp - b.timestamp);
};

// 生成所有攻击路径的事件
export const SECURITY_EVENTS: SecurityEvent[] = ATTACK_PATHS.flatMap(path =>
  generateEventsForPath(path.pathId)
);

// 根据攻击路径ID获取事件
export const getEventsByPathId = (pathId: string): SecurityEvent[] => {
  return SECURITY_EVENTS.filter(event => event.attackPathId === pathId);
};

// 根据时间范围获取事件
export const getEventsByTimeRange = (
  startTime: number,
  endTime: number,
  pathId?: string
): SecurityEvent[] => {
  let events = pathId ? getEventsByPathId(pathId) : SECURITY_EVENTS;
  return events.filter(event => event.timestamp >= startTime && event.timestamp <= endTime);
};

// 根据事件类型获取事件
export const getEventsByType = (eventType: EventType, pathId?: string): SecurityEvent[] => {
  let events = pathId ? getEventsByPathId(pathId) : SECURITY_EVENTS;
  return events.filter(event => event.eventType === eventType);
};

// 根据严重等级获取事件
export const getEventsBySeverity = (severity: SeverityLevel, pathId?: string): SecurityEvent[] => {
  let events = pathId ? getEventsByPathId(pathId) : SECURITY_EVENTS;
  return events.filter(event => event.severity === severity);
};

// 获取事件统计
export const getEventStats = (pathId?: string) => {
  const events = pathId ? getEventsByPathId(pathId) : SECURITY_EVENTS;

  return {
    totalEvents: events.length,
    byType: {
      attack_start: events.filter(e => e.eventType === 'attack_start').length,
      exploit_attempt: events.filter(e => e.eventType === 'exploit_attempt').length,
      exploit_success: events.filter(e => e.eventType === 'exploit_success').length,
      exploit_fail: events.filter(e => e.eventType === 'exploit_fail').length,
      defense_detect: events.filter(e => e.eventType === 'defense_detect').length,
      defense_block: events.filter(e => e.eventType === 'defense_block').length,
      lateral_move: events.filter(e => e.eventType === 'lateral_move').length,
      data_exfil: events.filter(e => e.eventType === 'data_exfil').length,
      node_compromised: events.filter(e => e.eventType === 'node_compromised').length,
      privilege_escalation: events.filter(e => e.eventType === 'privilege_escalation').length,
      persistence_established: events.filter(e => e.eventType === 'persistence_established').length,
      command_execution: events.filter(e => e.eventType === 'command_execution').length
    },
    bySeverity: {
      low: events.filter(e => e.severity === 'low').length,
      medium: events.filter(e => e.severity === 'medium').length,
      high: events.filter(e => e.severity === 'high').length,
      critical: events.filter(e => e.severity === 'critical').length
    },
    successRate: events.filter(e => e.success).length / events.length
  };
};

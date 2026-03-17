import { AttackPath, AttackPhase } from '../../../mock/dynamic/attackPaths';
import { DefenseScenario, DefenseDeployment } from '../../../mock/dynamic/defenseScenarios';
import { DEFENSE_MEASURES } from '../../../mock/static/defenseMeasures';

export type CockpitModelProfile = 'mitre_attack' | 'kill_chain' | 'defense_coverage';

export type PhaseOutcomeStatus =
  | 'blocked'
  | 'detected'
  | 'bypassed'
  | 'compromised'
  | 'not_reached';

export interface NodeCoverage {
  nodeId: string;
  measures: string[];
  deploymentCount: number;
  effectivenessAvg: number;
  preventiveAvg: number;
  detectionAvg: number;
  coverageScore: number;
  mitigatedTechniques: string[];
  coverageLevel: 'none' | 'weak' | 'medium' | 'strong';
}

export interface PhaseOutcome {
  phaseId: string;
  phaseIndex: number;
  targetNodeId: string;
  targetNodeName: string;
  techniqueId: string;
  techniqueName: string;
  killChainPhase: string;
  baseSuccessRate: number;
  residualSuccessRate: number;
  preventivePower: number;
  detectionPower: number;
  coveredBy: string[];
  status: PhaseOutcomeStatus;
  reason: string;
}

export interface AttackEdgeOutcome {
  edgeId: string;
  source: string;
  target: string;
  label: string;
  attackPhaseStatus: PhaseOutcomeStatus;
}

export interface AttackDefenseMetrics {
  nodeCoverageRate: number;
  defenseStrength: number;
  blockedRate: number;
  detectedRate: number;
  compromisedRate: number;
  pathCompletionRate: number;
  riskReductionRate: number;
}

export interface AttackDefenseSimulationResult {
  phaseOutcomes: PhaseOutcome[];
  attackEdges: AttackEdgeOutcome[];
  nodeCoverage: Record<string, NodeCoverage>;
  nodeOutcomes: Record<string, 'safe' | 'covered' | 'blocked' | 'detected' | 'compromised'>;
  blockedNodeIds: string[];
  detectedNodeIds: string[];
  compromisedNodeIds: string[];
  metrics: AttackDefenseMetrics;
}

interface SimulationInput {
  attackPath: AttackPath;
  defenseScenario?: DefenseScenario | null;
  sceneNodeIds: string[];
  modelProfile: CockpitModelProfile;
}

interface MeasureProfile {
  measureName: string;
  preventive: number;
  detection: number;
  mitigatedTechniques: string[];
}

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const normalizeNodeId = (nodeId: string): string => {
  if (nodeId.startsWith('node-external-')) {
    return nodeId.replace('node-external-', 'node-ext-');
  }
  return nodeId;
};

const normalizeMeasureId = (measureId: string): string => {
  if (measureId.startsWith('def-')) {
    return `defense-${measureId.slice(4)}`;
  }
  return measureId;
};

const deterministicNoise = (seed: string): number => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const normalized = Math.abs(hash % 1000) / 1000;
  return normalized * 0.16 - 0.08;
};

const inferMeasureProfileByName = (deployment: DefenseDeployment): MeasureProfile => {
  const name = deployment.measureName.toLowerCase();
  const baseEffectiveness = clamp(deployment.effectivenessScore);

  const isDetectFocused =
    name.includes('ids') ||
    name.includes('edr') ||
    name.includes('siem') ||
    name.includes('检测') ||
    name.includes('监控');

  const isPreventFocused =
    name.includes('waf') ||
    name.includes('防火墙') ||
    name.includes('隔离') ||
    name.includes('mfa') ||
    name.includes('白名单') ||
    name.includes('加密');

  const preventive = isPreventFocused
    ? clamp(baseEffectiveness * 0.9)
    : clamp(baseEffectiveness * 0.55);

  const detection = isDetectFocused
    ? clamp(baseEffectiveness * 0.95)
    : clamp(baseEffectiveness * 0.5);

  return {
    measureName: deployment.measureName,
    preventive,
    detection,
    mitigatedTechniques: []
  };
};

const resolveMeasureProfile = (deployment: DefenseDeployment): MeasureProfile => {
  const normalizedId = normalizeMeasureId(deployment.measureId);
  const matchedById = DEFENSE_MEASURES.find(m => m.measureId === normalizedId);
  const matchedByName = DEFENSE_MEASURES.find(m =>
    deployment.measureName.includes(m.name) || m.name.includes(deployment.measureName)
  );
  const matched = matchedById || matchedByName;

  if (!matched) {
    return inferMeasureProfileByName(deployment);
  }

  return {
    measureName: deployment.measureName,
    preventive: clamp((matched.successRateReduction + deployment.effectivenessScore) / 2),
    detection: clamp((matched.detectionRate + deployment.effectivenessScore) / 2),
    mitigatedTechniques: matched.mitigatedTechniques
  };
};

const buildNodeCoverageMap = (
  deployments: DefenseDeployment[]
): Record<string, NodeCoverage> => {
  const coverageMap: Record<string, NodeCoverage> = {};

  deployments.forEach(deployment => {
    const profile = resolveMeasureProfile(deployment);

    deployment.deployedNodeIds.forEach(rawNodeId => {
      const nodeId = normalizeNodeId(rawNodeId);
      const current = coverageMap[nodeId];
      const next = current ?? {
        nodeId,
        measures: [],
        deploymentCount: 0,
        effectivenessAvg: 0,
        preventiveAvg: 0,
        detectionAvg: 0,
        coverageScore: 0,
        mitigatedTechniques: [],
        coverageLevel: 'none' as const
      };

      next.deploymentCount += 1;
      next.measures.push(deployment.measureName);
      next.effectivenessAvg =
        (next.effectivenessAvg * (next.deploymentCount - 1) + deployment.effectivenessScore) /
        next.deploymentCount;
      next.preventiveAvg =
        (next.preventiveAvg * (next.deploymentCount - 1) + profile.preventive) / next.deploymentCount;
      next.detectionAvg =
        (next.detectionAvg * (next.deploymentCount - 1) + profile.detection) / next.deploymentCount;
      next.coverageScore = Math.round(next.effectivenessAvg * 60 + next.preventiveAvg * 20 + next.detectionAvg * 20);
      next.mitigatedTechniques = Array.from(
        new Set([...next.mitigatedTechniques, ...profile.mitigatedTechniques])
      );
      next.coverageLevel =
        next.coverageScore >= 75
          ? 'strong'
          : next.coverageScore >= 50
            ? 'medium'
            : next.coverageScore > 0
              ? 'weak'
              : 'none';

      coverageMap[nodeId] = next;
    });
  });

  return coverageMap;
};

export const buildDefenseCoveragePreview = (
  defenseScenario?: DefenseScenario | null
): Record<string, NodeCoverage> => {
  if (!defenseScenario) {
    return {};
  }
  return buildNodeCoverageMap(defenseScenario.deployments);
};

const toReason = (status: PhaseOutcomeStatus, coveredBy: string[], techniqueCovered: boolean): string => {
  if (status === 'not_reached') {
    return '前序阶段已被阻断，未到达该节点';
  }
  if (status === 'blocked') {
    return coveredBy.length > 0
      ? `节点存在防护覆盖（${coveredBy.join('、')}），本阶段被阻断`
      : '虽无明确覆盖，但阶段成功率低，攻击未能继续推进';
  }
  if (status === 'detected') {
    return coveredBy.length > 0
      ? `节点已部署检测类防护（${coveredBy.join('、')}），本阶段被检测`
      : '存在攻击行为特征，已触发检测但未完全阻断';
  }
  if (status === 'bypassed') {
    return techniqueCovered
      ? '防护与技术存在对抗，但攻击绕过防护'
      : '节点防护覆盖有限，攻击绕过后继续推进';
  }
  return '节点防护覆盖不足，本阶段导致资产失陷';
};

const phaseLabel = (phase: AttackPhase, modelProfile: CockpitModelProfile): string => {
  if (modelProfile === 'kill_chain') {
    return phase.killChainPhase;
  }
  if (modelProfile === 'defense_coverage') {
    return `防护态势: ${phase.techniqueId}`;
  }
  return phase.techniqueId;
};

export const runMockAttackDefenseSimulation = ({
  attackPath,
  defenseScenario,
  sceneNodeIds,
  modelProfile
}: SimulationInput): AttackDefenseSimulationResult => {
  const deployments = defenseScenario?.deployments ?? [];
  const nodeCoverage = buildNodeCoverageMap(deployments);

  const normalizedSceneNodeIds = sceneNodeIds.map(normalizeNodeId);
  const sceneNodeSet = new Set(normalizedSceneNodeIds);

  const phaseOutcomes: PhaseOutcome[] = [];
  const blockedNodeIds = new Set<string>();
  const detectedNodeIds = new Set<string>();
  const compromisedNodeIds = new Set<string>();
  const nodeOutcomes: Record<string, 'safe' | 'covered' | 'blocked' | 'detected' | 'compromised'> = {};

  normalizedSceneNodeIds.forEach(nodeId => {
    nodeOutcomes[nodeId] = nodeCoverage[nodeId] ? 'covered' : 'safe';
  });

  let pathActive = true;

  attackPath.attackPhases.forEach(phase => {
    const normalizedNodeId = normalizeNodeId(phase.targetNodeId);
    const baseSuccessRate = clamp(phase.actualSuccessRate || phase.baseSuccessRate || 0.6);
    const coverage = nodeCoverage[normalizedNodeId];
    const techniqueCovered = coverage?.mitigatedTechniques.includes(phase.techniqueId) ?? false;
    const techniqueBonus = techniqueCovered ? 0.16 : 0;

    const preventivePower = coverage
      ? clamp(coverage.effectivenessAvg * 0.45 + coverage.preventiveAvg * 0.45 + techniqueBonus)
      : 0;
    const detectionPower = coverage
      ? clamp(coverage.effectivenessAvg * 0.25 + coverage.detectionAvg * 0.75 + techniqueBonus * 0.4)
      : 0;

    const noise = deterministicNoise(`${attackPath.pathId}-${defenseScenario?.scenarioId ?? 'none'}-${phase.phaseId}`);
    const residualSuccessRate = clamp(baseSuccessRate * (1 - preventivePower * 0.82) + noise);

    let status: PhaseOutcomeStatus = 'compromised';
    if (!pathActive) {
      status = 'not_reached';
    } else if (residualSuccessRate <= 0.24 || preventivePower >= 0.78) {
      status = 'blocked';
      pathActive = false;
    } else if (residualSuccessRate <= 0.52 && detectionPower >= 0.60) {
      status = 'detected';
    } else if (preventivePower >= 0.35 || detectionPower >= 0.35) {
      status = 'bypassed';
    }

    if (status === 'blocked') {
      blockedNodeIds.add(normalizedNodeId);
      nodeOutcomes[normalizedNodeId] = 'blocked';
    } else if (status === 'detected') {
      detectedNodeIds.add(normalizedNodeId);
      nodeOutcomes[normalizedNodeId] = 'detected';
      compromisedNodeIds.add(normalizedNodeId);
    } else if (status === 'bypassed' || status === 'compromised') {
      compromisedNodeIds.add(normalizedNodeId);
      nodeOutcomes[normalizedNodeId] = 'compromised';
    }

    phaseOutcomes.push({
      phaseId: phase.phaseId,
      phaseIndex: phase.phaseIndex,
      targetNodeId: normalizedNodeId,
      targetNodeName: phase.targetNodeName,
      techniqueId: phase.techniqueId,
      techniqueName: phase.techniqueName,
      killChainPhase: phase.killChainPhase,
      baseSuccessRate,
      residualSuccessRate,
      preventivePower,
      detectionPower,
      coveredBy: coverage?.measures ?? [],
      status,
      reason: toReason(status, coverage?.measures ?? [], techniqueCovered)
    });
  });

  const attackEdges: AttackEdgeOutcome[] = [];
  for (let i = 0; i < phaseOutcomes.length - 1; i += 1) {
    const source = phaseOutcomes[i];
    const target = phaseOutcomes[i + 1];
    attackEdges.push({
      edgeId: `sim-edge-${source.targetNodeId}-${target.targetNodeId}-${i}`,
      source: source.targetNodeId,
      target: target.targetNodeId,
      label: phaseLabel(target as unknown as AttackPhase, modelProfile),
      attackPhaseStatus: target.status
    });
  }

  const coveredNodesInScene = Object.keys(nodeCoverage).filter(nodeId => sceneNodeSet.has(nodeId));
  const coverageRate = sceneNodeSet.size > 0 ? coveredNodesInScene.length / sceneNodeSet.size : 0;

  const blockedRate = phaseOutcomes.length > 0
    ? phaseOutcomes.filter(p => p.status === 'blocked').length / phaseOutcomes.length
    : 0;
  const detectedRate = phaseOutcomes.length > 0
    ? phaseOutcomes.filter(p => p.status === 'detected').length / phaseOutcomes.length
    : 0;
  const compromisedRate = phaseOutcomes.length > 0
    ? phaseOutcomes.filter(p => p.status === 'bypassed' || p.status === 'compromised').length / phaseOutcomes.length
    : 0;
  const reachedPhases = phaseOutcomes.filter(p => p.status !== 'not_reached').length;
  const pathCompletionRate = phaseOutcomes.length > 0 ? reachedPhases / phaseOutcomes.length : 0;

  const averagePreventive = phaseOutcomes.length > 0
    ? phaseOutcomes.reduce((acc, phase) => acc + phase.preventivePower, 0) / phaseOutcomes.length
    : 0;

  const metrics: AttackDefenseMetrics = {
    nodeCoverageRate: coverageRate,
    defenseStrength: averagePreventive,
    blockedRate,
    detectedRate,
    compromisedRate,
    pathCompletionRate,
    riskReductionRate: clamp(blockedRate * 0.7 + detectedRate * 0.3)
  };

  return {
    phaseOutcomes,
    attackEdges,
    nodeCoverage,
    nodeOutcomes,
    blockedNodeIds: Array.from(blockedNodeIds),
    detectedNodeIds: Array.from(detectedNodeIds),
    compromisedNodeIds: Array.from(compromisedNodeIds),
    metrics
  };
};

// 攻防关系Mock数据
// 覆盖7种关系类型：exists_in、exploits、targets、attributed_to、mitigates、deployed_on、propagates_to
// 参考：《本体模型体系设计规范.md》八·AttackDefenseRelation关系本体

import { AttackDefenseRelation } from '../../types/ontology';

export const ATTACK_DEFENSE_RELATIONS: AttackDefenseRelation[] = [
  // ========== exists_in 关系（漏洞存在于节点）==========
  {
    relationId: 'rel-001',
    relationType: 'exists_in',
    sourceId: 'vuln-001',
    targetId: 'node-dmz-03',
    effectivenessScore: 95,
    validatedBy: 'vulnerability_scanner'
  },
  {
    relationId: 'rel-002',
    relationType: 'exists_in',
    sourceId: 'vuln-002',
    targetId: 'node-intra-10',
    effectivenessScore: 98,
    validatedBy: 'vulnerability_scanner'
  },
  {
    relationId: 'rel-003',
    relationType: 'exists_in',
    sourceId: 'vuln-003',
    targetId: 'node-intra-11',
    effectivenessScore: 92,
    validatedBy: 'vulnerability_scanner'
  },
  {
    relationId: 'rel-004',
    relationType: 'exists_in',
    sourceId: 'vuln-004',
    targetId: 'node-dmz-06',
    effectivenessScore: 90,
    validatedBy: 'vulnerability_scanner'
  },
  {
    relationId: 'rel-005',
    relationType: 'exists_in',
    sourceId: 'vuln-005',
    targetId: 'node-intra-15',
    effectivenessScore: 88,
    validatedBy: 'vulnerability_scanner'
  },
  {
    relationId: 'rel-006',
    relationType: 'exists_in',
    sourceId: 'vuln-006',
    targetId: 'node-intra-03',
    effectivenessScore: 96,
    validatedBy: 'vulnerability_scanner'
  },
  {
    relationId: 'rel-007',
    relationType: 'exists_in',
    sourceId: 'vuln-001',
    targetId: 'node-intra-20',
    effectivenessScore: 93,
    validatedBy: 'vulnerability_scanner'
  },
  {
    relationId: 'rel-008',
    relationType: 'exists_in',
    sourceId: 'vuln-009',
    targetId: 'node-dmz-03',
    effectivenessScore: 85,
    validatedBy: 'vulnerability_scanner'
  },

  // ========== exploits 关系（攻击技术利用漏洞）==========
  {
    relationId: 'rel-009',
    relationType: 'exploits',
    sourceId: 'T1190',
    targetId: 'vuln-001',
    effectivenessScore: 98,
    validatedBy: 'threat_intelligence'
  },
  {
    relationId: 'rel-010',
    relationType: 'exploits',
    sourceId: 'T1210',
    targetId: 'vuln-003',
    effectivenessScore: 99,
    validatedBy: 'threat_intelligence'
  },
  {
    relationId: 'rel-011',
    relationType: 'exploits',
    sourceId: 'T1068',
    targetId: 'vuln-005',
    effectivenessScore: 95,
    validatedBy: 'threat_intelligence'
  },
  {
    relationId: 'rel-012',
    relationType: 'exploits',
    sourceId: 'T1190',
    targetId: 'vuln-009',
    effectivenessScore: 97,
    validatedBy: 'threat_intelligence'
  },
  {
    relationId: 'rel-013',
    relationType: 'exploits',
    sourceId: 'T1068',
    targetId: 'vuln-004',
    effectivenessScore: 96,
    validatedBy: 'threat_intelligence'
  },
  {
    relationId: 'rel-014',
    relationType: 'exploits',
    sourceId: 'T1190',
    targetId: 'vuln-002',
    effectivenessScore: 94,
    validatedBy: 'threat_intelligence'
  },

  // ========== targets 关系（攻击技术针对节点）==========
  {
    relationId: 'rel-015',
    relationType: 'targets',
    sourceId: 'T1566',
    targetId: 'node-intra-10',
    effectivenessScore: 85,
    validatedBy: 'threat_intelligence'
  },
  {
    relationId: 'rel-016',
    relationType: 'targets',
    sourceId: 'T1078',
    targetId: 'node-intra-03',
    effectivenessScore: 88,
    validatedBy: 'threat_intelligence'
  },
  {
    relationId: 'rel-017',
    relationType: 'targets',
    sourceId: 'T1003',
    targetId: 'node-intra-12',
    effectivenessScore: 90,
    validatedBy: 'threat_intelligence'
  },

  // ========== attributed_to 关系（攻击技术归属于威胁行为者）==========
  {
    relationId: 'rel-022',
    relationType: 'attributed_to',
    sourceId: 'T1190',
    targetId: 'actor-001',
    effectivenessScore: 92,
    validatedBy: 'threat_intelligence'
  },
  {
    relationId: 'rel-023',
    relationType: 'attributed_to',
    sourceId: 'T1210',
    targetId: 'actor-003',
    effectivenessScore: 95,
    validatedBy: 'threat_intelligence'
  },
  {
    relationId: 'rel-024',
    relationType: 'attributed_to',
    sourceId: 'T1566',
    targetId: 'actor-001',
    effectivenessScore: 90,
    validatedBy: 'threat_intelligence'
  },

  // ========== mitigates 关系（防御措施缓解攻击技术）==========
  {
    relationId: 'rel-028',
    relationType: 'mitigates',
    sourceId: 'defense-001',
    targetId: 'T1190',
    effectivenessScore: 85,
    validatedBy: 'security_control'
  },
  {
    relationId: 'rel-029',
    relationType: 'mitigates',
    sourceId: 'defense-002',
    targetId: 'T1210',
    effectivenessScore: 78,
    validatedBy: 'security_control'
  },
  {
    relationId: 'rel-030',
    relationType: 'mitigates',
    sourceId: 'defense-003',
    targetId: 'T1068',
    effectivenessScore: 82,
    validatedBy: 'security_control'
  },
  {
    relationId: 'rel-031',
    relationType: 'mitigates',
    sourceId: 'defense-004',
    targetId: 'T1078',
    effectivenessScore: 88,
    validatedBy: 'security_control'
  },
  {
    relationId: 'rel-032',
    relationType: 'mitigates',
    sourceId: 'defense-005',
    targetId: 'T1190',
    effectivenessScore: 90,
    validatedBy: 'security_control'
  },
  {
    relationId: 'rel-033',
    relationType: 'mitigates',
    sourceId: 'defense-006',
    targetId: 'T1021',
    effectivenessScore: 75,
    validatedBy: 'security_control'
  },
  {
    relationId: 'rel-034',
    relationType: 'mitigates',
    sourceId: 'defense-007',
    targetId: 'T1059.001',
    effectivenessScore: 87,
    validatedBy: 'security_control'
  },
  {
    relationId: 'rel-035',
    relationType: 'mitigates',
    sourceId: 'defense-008',
    targetId: 'T1566',
    effectivenessScore: 83,
    validatedBy: 'security_control'
  },
  {
    relationId: 'rel-036',
    relationType: 'mitigates',
    sourceId: 'defense-009',
    targetId: 'T1078',
    effectivenessScore: 92,
    validatedBy: 'security_control'
  },
  {
    relationId: 'rel-037',
    relationType: 'mitigates',
    sourceId: 'defense-010',
    targetId: 'T1071',
    effectivenessScore: 70,
    validatedBy: 'security_control'
  },

  // ========== deployed_on 关系（防御措施部署在节点）==========
  {
    relationId: 'rel-039',
    relationType: 'deployed_on',
    sourceId: 'defense-001',
    targetId: 'node-dmz-03',
    effectivenessScore: 100,
    validatedBy: 'asset_inventory'
  },
  {
    relationId: 'rel-040',
    relationType: 'deployed_on',
    sourceId: 'defense-002',
    targetId: 'node-dmz-01',
    effectivenessScore: 100,
    validatedBy: 'asset_inventory'
  },
  {
    relationId: 'rel-041',
    relationType: 'deployed_on',
    sourceId: 'defense-003',
    targetId: 'node-intra-10',
    effectivenessScore: 100,
    validatedBy: 'asset_inventory'
  },
  {
    relationId: 'rel-042',
    relationType: 'deployed_on',
    sourceId: 'defense-003',
    targetId: 'node-intra-11',
    effectivenessScore: 100,
    validatedBy: 'asset_inventory'
  },
  {
    relationId: 'rel-043',
    relationType: 'deployed_on',
    sourceId: 'defense-004',
    targetId: 'node-intra-03',
    effectivenessScore: 100,
    validatedBy: 'asset_inventory'
  },
  {
    relationId: 'rel-044',
    relationType: 'deployed_on',
    sourceId: 'defense-005',
    targetId: 'node-dmz-03',
    effectivenessScore: 100,
    validatedBy: 'asset_inventory'
  },
  {
    relationId: 'rel-045',
    relationType: 'deployed_on',
    sourceId: 'defense-006',
    targetId: 'node-intra-06',
    effectivenessScore: 100,
    validatedBy: 'asset_inventory'
  },
  {
    relationId: 'rel-046',
    relationType: 'deployed_on',
    sourceId: 'defense-007',
    targetId: 'node-dmz-03',
    effectivenessScore: 100,
    validatedBy: 'asset_inventory'
  },
  {
    relationId: 'rel-047',
    relationType: 'deployed_on',
    sourceId: 'defense-008',
    targetId: 'node-dmz-01',
    effectivenessScore: 100,
    validatedBy: 'asset_inventory'
  },
  {
    relationId: 'rel-048',
    relationType: 'deployed_on',
    sourceId: 'defense-009',
    targetId: 'node-intra-03',
    effectivenessScore: 100,
    validatedBy: 'asset_inventory'
  },

  // ========== propagates_to 关系（攻击从一个节点传播到另一个节点）==========
  {
    relationId: 'rel-049',
    relationType: 'propagates_to',
    sourceId: 'node-dmz-03',
    targetId: 'node-intra-20',
    effectivenessScore: 85,
    validatedBy: 'attack_simulation'
  },
  {
    relationId: 'rel-050',
    relationType: 'propagates_to',
    sourceId: 'node-intra-20',
    targetId: 'node-intra-10',
    effectivenessScore: 82,
    validatedBy: 'attack_simulation'
  },
  {
    relationId: 'rel-051',
    relationType: 'propagates_to',
    sourceId: 'node-intra-10',
    targetId: 'node-intra-11',
    effectivenessScore: 88,
    validatedBy: 'attack_simulation'
  },
  {
    relationId: 'rel-052',
    relationType: 'propagates_to',
    sourceId: 'node-intra-11',
    targetId: 'node-intra-03',
    effectivenessScore: 90,
    validatedBy: 'attack_simulation'
  }
];

export default ATTACK_DEFENSE_RELATIONS;

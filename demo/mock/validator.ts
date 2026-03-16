// Mock数据校验脚本
// 检查引用完整性、格式正确性、数量达标

import { NETWORK_NODES } from './static/networkNodes';
import { vulnerabilities } from './static/vulnerabilities';
import { ATTACK_TECHNIQUES } from './static/attackTechniques';
import { THREAT_ACTORS } from './static/threatActors';
import { DEFENSE_MEASURES } from './static/defenseMeasures';
import { ATTACK_DEFENSE_RELATIONS } from './static/relations';
import { ATTACK_FRAMEWORK } from './static/attackFramework';
import { D3FEND_TACTICS } from './static/defenseFramework';

interface ValidationResult {
  category: string;
  passed: boolean;
  message: string;
  details?: string[];
}

// 验证函数 - 不自动执行
function runValidation() {
  const results: ValidationResult[] = [];

  // ========== 数量验证 ==========
  const checkCount = (name: string, count: number, min: number, max?: number) => {
    const passed = max ? count >= min && count <= max : count >= min;
    results.push({
      category: '数量验证',
      passed,
      message: `${name}: ${count}个 (要求: ${max ? `${min}-${max}` : `≥${min}`})`
    });
  };

  checkCount('NetworkNode', NETWORK_NODES.length, 20, 30);
  checkCount('Vulnerability', vulnerabilities.length, 10, 20);
  checkCount('AttackTechnique', ATTACK_TECHNIQUES.length, 30, 50);
  checkCount('ThreatActor', THREAT_ACTORS.length, 3, 5);
  checkCount('DefenseMeasure', DEFENSE_MEASURES.length, 15, 25);
  checkCount('AttackDefenseRelation', ATTACK_DEFENSE_RELATIONS.length, 50);
  checkCount('ATT&CK战术', ATTACK_FRAMEWORK.length, 10);
  checkCount('D3FEND战术', D3FEND_TACTICS.length, 6);

  // ========== 格式验证 ==========
  // CVE格式验证
  const cvePattern = /^CVE-\d{4}-\d{4,}$/;
  const invalidCVEs = vulnerabilities.filter(v => !cvePattern.test(v.cveId));
  results.push({
    category: '格式验证',
    passed: invalidCVEs.length === 0,
    message: `CVE格式: ${invalidCVEs.length === 0 ? '全部正确' : `${invalidCVEs.length}个错误`}`,
    details: invalidCVEs.map(v => v.cveId)
  });

  // CVSS向量验证
  const cvssPattern = /^CVSS:3\.[01]\/AV:[NALP]\/AC:[LH]\/PR:[NLH]\/UI:[NR]\/S:[UC]\/C:[NLH]\/I:[NLH]\/A:[NLH]$/;
  const invalidCVSS = vulnerabilities.filter(v => !cvssPattern.test(v.cvssVector));
  results.push({
    category: '格式验证',
    passed: invalidCVSS.length === 0,
    message: `CVSS向量: ${invalidCVSS.length === 0 ? '全部正确' : `${invalidCVSS.length}个错误`}`,
    details: invalidCVSS.map(v => `${v.cveId}: ${v.cvssVector}`)
  });

  // ATT&CK ID格式验证
  const attackIdPattern = /^T\d{4}(\.\d{3})?$/;
  const invalidAttackIds = ATTACK_TECHNIQUES.filter(t => !attackIdPattern.test(t.attackId));
  results.push({
    category: '格式验证',
    passed: invalidAttackIds.length === 0,
    message: `ATT&CK ID: ${invalidAttackIds.length === 0 ? '全部正确' : `${invalidAttackIds.length}个错误`}`,
    details: invalidAttackIds.map(t => t.attackId)
  });

  // ========== 引用完整性验证 ==========
  // 构建ID集合
  const nodeIds = new Set(NETWORK_NODES.map(n => n.nodeId));
  const vulnIds = new Set(vulnerabilities.map(v => v.vulnId));
  const attackTechIds = new Set(ATTACK_TECHNIQUES.map(t => t.techniqueId));
  const threatActorIds = new Set(THREAT_ACTORS.map(t => t.actorId));
  const defenseIds = new Set(DEFENSE_MEASURES.map(d => d.measureId));
  const allEntityIds = new Set([...nodeIds, ...vulnIds, ...attackTechIds, ...threatActorIds, ...defenseIds]);

  // 检查关系引用
  const danglingReferences: string[] = [];
  ATTACK_DEFENSE_RELATIONS.forEach(rel => {
    if (!allEntityIds.has(rel.sourceId)) {
      danglingReferences.push(`${rel.relationId}: sourceId=${rel.sourceId} 不存在`);
    }
    if (!allEntityIds.has(rel.targetId)) {
      danglingReferences.push(`${rel.relationId}: targetId=${rel.targetId} 不存在`);
    }
  });

  results.push({
    category: '引用完整性',
    passed: danglingReferences.length === 0,
    message: `关系引用: ${danglingReferences.length === 0 ? '零悬空引用' : `${danglingReferences.length}个悬空引用`}`,
    details: danglingReferences
  });

  // ========== 关系类型覆盖验证 ==========
  const requiredRelationTypes = ['exists_in', 'exploits', 'targets', 'attributed_to', 'mitigates', 'deployed_on', 'propagates_to'];
  const relationTypeCounts = new Map<string, number>();
  ATTACK_DEFENSE_RELATIONS.forEach(rel => {
    relationTypeCounts.set(rel.relationType, (relationTypeCounts.get(rel.relationType) || 0) + 1);
  });

  const missingTypes = requiredRelationTypes.filter(type => !relationTypeCounts.has(type));
  results.push({
    category: '关系类型覆盖',
    passed: missingTypes.length === 0,
    message: `关系类型: ${missingTypes.length === 0 ? '7种全覆盖' : `缺少${missingTypes.length}种`}`,
    details: missingTypes.length > 0 ? missingTypes : undefined
  });

  // ========== 枚举合法性验证 ==========
  const validZones = ['external', 'dmz', 'intranet', 'cloud'];
  const invalidZones = NETWORK_NODES.filter(n => !validZones.includes(n.zone));
  results.push({
    category: '枚举合法性',
    passed: invalidZones.length === 0,
    message: `Zone枚举: ${invalidZones.length === 0 ? '全部合法' : `${invalidZones.length}个非法`}`,
    details: invalidZones.map(n => `${n.nodeId}: ${n.zone}`)
  });

  const validRelationTypes = ['exists_in', 'exploits', 'targets', 'attributed_to', 'mitigates', 'deployed_on', 'propagates_to'];
  const invalidRelationTypes = ATTACK_DEFENSE_RELATIONS.filter(r => !validRelationTypes.includes(r.relationType));
  results.push({
    category: '枚举合法性',
    passed: invalidRelationTypes.length === 0,
    message: `关系类型枚举: ${invalidRelationTypes.length === 0 ? '全部合法' : `${invalidRelationTypes.length}个非法`}`,
    details: invalidRelationTypes.map(r => `${r.relationId}: ${r.relationType}`)
  });

  const totalChecks = results.length;
  const passedChecks = results.filter(r => r.passed).length;
  const failedChecks = totalChecks - passedChecks;

  return {
    totalChecks,
    passedChecks,
    failedChecks,
    results
  };
}

// 导出验证函数供组件使用
export const mockValidator = {
  validate: runValidation,
  validateAll: (data: any) => {
    // 兼容旧的TestRunner接口
    const validationResult = runValidation();
    return {
      results: validationResult.results.map(r => ({
        success: r.passed,
        message: r.message
      }))
    };
  }
};

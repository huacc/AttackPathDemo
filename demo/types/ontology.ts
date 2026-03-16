/**
 * 本体模型类型定义
 * 参考：《本体模型体系设计规范.md》三~八章
 */

// ==================== NetworkNode 网络节点本体 ====================

export interface NetworkService {
  port: number;
  protocol: 'tcp' | 'udp';
  service: string;
  version: string;
  banner?: string;
  state: 'open' | 'filtered' | 'closed';
}

export type NodeType = 'hardware' | 'software';

export type DeviceCategory =
  | 'server'
  | 'router'
  | 'switch'
  | 'firewall'
  | 'load_balancer'
  | 'endpoint'
  | 'iot_device'
  | 'web_application'
  | 'database'
  | 'middleware'
  | 'container'
  | 'api_gateway'
  | 'domain_controller';

export type Zone = 'external' | 'dmz' | 'intranet' | 'cloud';

export type OSType = 'windows' | 'linux' | 'macos' | 'ios' | 'android' | 'embedded';

export type PatchLevel = 'up_to_date' | 'outdated' | 'eol' | 'unknown';

export type Architecture = 'x86_64' | 'arm64' | 'mips' | 'ppc';

export type CriticalityLevel = 'critical' | 'high' | 'medium' | 'low';

export type DataClassification = 'top_secret' | 'secret' | 'confidential' | 'public';

export type ComplianceStatus = 'compliant' | 'non_compliant' | 'partial' | 'unknown';

export type NodeStatus = 'online' | 'offline' | 'degraded' | 'compromised';

export interface NetworkNode {
  // 标识维度
  nodeId: string;
  name: string;
  nodeType: NodeType;
  deviceCategory: DeviceCategory;
  cpe: string;
  zone: Zone;

  // 网络标识维度
  ipv4Address: string;
  ipv6Address?: string;
  macAddress?: string;
  hostname: string;
  vlanId?: number;
  asn?: number;
  openPorts: NetworkService[];

  // 系统指纹维度
  osType: OSType;
  osVersion: string;
  osCpe: string;
  kernelVersion?: string;
  architecture?: Architecture;
  patchLevel: PatchLevel;
  lastPatchDate?: string;

  // 安全态势维度
  attackSurface: number;
  exploitabilityScore: number;
  criticalityLevel: CriticalityLevel;
  dataClassification?: DataClassification;
  complianceStatus?: ComplianceStatus;
  securityScore: number;

  // 运行状态维度
  status: NodeStatus;
  compromiseIndicators?: string[];
  lastSeenAt?: string;
}

// ==================== Vulnerability 漏洞本体 ====================

export type AttackVector = 'Network' | 'Adjacent' | 'Local' | 'Physical';

export type AttackComplexity = 'Low' | 'High';

export type PrivilegesRequired = 'None' | 'Low' | 'High';

export type UserInteraction = 'None' | 'Required';

export type Scope = 'Unchanged' | 'Changed';

export type Impact = 'None' | 'Low' | 'High';

export type ExploitMaturity = 'not_defined' | 'unproven' | 'poc' | 'functional' | 'high';

export type RemediationStatus = 'unpatched' | 'patched' | 'mitigated' | 'accepted_risk';

export interface Vulnerability {
  // 漏洞标识维度
  vulnId: string;
  cveId: string;
  cweId?: string;
  title: string;
  description: string;
  affectedCpe: string;
  publishedDate: string;
  patchAvailable: boolean;

  // CVSS v3.1 评分维度
  cvssScore: number;
  cvssVector: string;
  attackVector: AttackVector;
  attackComplexity: AttackComplexity;
  privilegesRequired: PrivilegesRequired;
  userInteraction: UserInteraction;
  scope: Scope;
  confidentialityImpact: Impact;
  integrityImpact: Impact;
  availabilityImpact: Impact;
  exploitabilityScore: number;
  impactScore: number;

  // 利用情报维度
  epssScore: number;
  epssPercentile?: number;
  exploitMaturity: ExploitMaturity;
  exploitAvailable: boolean;
  exploitSource?: string;
  kevListed: boolean;
  inTheWild: boolean;

  // 修复状态维度
  remediationStatus: RemediationStatus;
  patchId?: string;
  workaround?: string;
}

// ==================== AttackTechnique 攻击技术本体 ====================

export type KillChainPhase =
  | 'reconnaissance'
  | 'weaponization'
  | 'delivery'
  | 'exploitation'
  | 'installation'
  | 'command_and_control'
  | 'actions_on_objectives';

export type RequiredPrivilege = 'none' | 'user' | 'admin' | 'system' | 'root';

export type RequiredAccess = 'remote_network' | 'local_network' | 'local' | 'physical';

export type TargetPlatform = 'windows' | 'linux' | 'macos' | 'cloud' | 'network' | 'containers';

export type DetectionDifficulty = 'easy' | 'medium' | 'hard' | 'very_hard';

export type NoiseLevel = 'low' | 'medium' | 'high';

export interface AttackTechnique {
  // ATT&CK 标识维度
  techniqueId: string;
  techniqueName: string;
  tacticId: string;
  tacticName: string;
  isSubTechnique: boolean;
  parentTechniqueId?: string;
  stixId?: string;
  killChainPhase: KillChainPhase;

  // 技术特征维度
  requiredPrivilege: RequiredPrivilege;
  requiredAccess: RequiredAccess;
  targetPlatforms: TargetPlatform[];
  dataSourcesDetectable?: string[];
  defensesBypassed?: string[];
  permissionsRequired?: string[];

  // 仿真量化维度
  baseSuccessRate: number;
  detectionDifficulty: DetectionDifficulty;
  avgDwellTime: number;
  noiseLevel: NoiseLevel;
  lateralMovementCapable: boolean;
  persistenceCapable: boolean;

  // 工具关联维度
  associatedTools?: string[];
  associatedGroups?: string[];
  mitigations?: string[];
}

// ==================== ThreatActor 威胁行为者本体 ====================

export type ActorType =
  | 'nation-state'
  | 'criminal'
  | 'hacktivist'
  | 'insider'
  | 'script-kiddie'
  | 'unknown';

export type SophisticationLevel = 'minimal' | 'intermediate' | 'advanced' | 'expert' | 'innovator';

export type ResourceLevel =
  | 'individual'
  | 'club'
  | 'contest'
  | 'team'
  | 'organization'
  | 'government';

export type PrimaryMotivation =
  | 'espionage'
  | 'financial'
  | 'ideology'
  | 'notoriety'
  | 'disruption'
  | 'unknown';

export type AttributionConfidence = 'confirmed' | 'likely' | 'possible' | 'unknown';

export interface ThreatActor {
  // 身份标识维度
  actorId: string;
  name: string;
  aliases?: string[];
  stixId?: string;
  attackGroupId?: string;

  // 威胁分类维度
  actorType: ActorType;
  sophisticationLevel: SophisticationLevel;
  resourceLevel: ResourceLevel;
  primaryMotivation: PrimaryMotivation;

  // 能力画像维度
  ttpsUsed: string[];
  targetSectors?: string[];
  targetCountries?: string[];
  toolsUsed?: string[];
  attackSuccessModifier: number;
  stealthModifier: number;

  // 活动记录维度
  firstSeenYear?: number;
  lastActivityDate?: string;
  knownCampaigns?: string[];
  attributionConfidence: AttributionConfidence;
}

// ==================== DefenseMeasure 防御措施本体 ====================

export type DefenseCategory = 'harden' | 'detect' | 'isolate' | 'deceive' | 'evict' | 'restore';

export type ControlType = 'preventive' | 'detective' | 'corrective' | 'deterrent';

export type DeploymentScope = 'network' | 'host' | 'application' | 'data' | 'identity';

export type AutomationLevel = 'manual' | 'semi_auto' | 'automated';

export type DeploymentStatus = 'not_deployed' | 'deploying' | 'active' | 'degraded' | 'disabled';

export type DeploymentCost = 'low' | 'medium' | 'high' | 'very_high';

export type MaintenanceBurden = 'low' | 'medium' | 'high';

export interface DefenseMeasure {
  // 防御标识维度
  measureId: string;
  name: string;
  attackMitigationId?: string;
  d3fendId?: string;
  stixId?: string;

  // 防御分类维度
  defenseCategory: DefenseCategory;
  controlType: ControlType;
  deploymentScope: DeploymentScope;
  automationLevel?: AutomationLevel;

  // 防御效能维度
  mitigatedTechniques: string[];
  successRateReduction: number;
  detectionRate: number;
  falsePositiveRate?: number;
  responseTime?: number;
  coverageScore: number;

  // 部署状态维度
  deploymentStatus: DeploymentStatus;
  deployedNodes?: string[];
  deploymentCost?: DeploymentCost;
  maintenanceBurden?: MaintenanceBurden;
}

// ==================== AttackDefenseRelation 攻防关系本体 ====================

export type RelationType =
  | 'exists_in'
  | 'exploits'
  | 'targets'
  | 'attributed_to'
  | 'mitigates'
  | 'deployed_on'
  | 'propagates_to';

export interface AttackDefenseRelation {
  relationId: string;
  relationType: RelationType;
  sourceId: string;
  targetId: string;
  effectivenessScore: number;
  conditionExpression?: string;
  validatedBy?: string;
}

/**
 * ATT&CK 和 D3FEND 框架类型定义
 */

// ==================== ATT&CK Framework ====================

export interface ATTACKTactic {
  tacticId: string;
  tacticName: string;
  description: string;
  url?: string;
}

export interface ATTACKTechnique {
  techniqueId: string;
  techniqueName: string;
  tacticId: string;
  description: string;
  platforms: string[];
  dataSources?: string[];
  mitigations?: string[];
  url?: string;
}

export interface ATTACKMitigation {
  mitigationId: string;
  mitigationName: string;
  description: string;
  techniques: string[];
  url?: string;
}

export interface ATTACKGroup {
  groupId: string;
  groupName: string;
  aliases?: string[];
  description: string;
  techniques: string[];
  software?: string[];
  url?: string;
}

export interface ATTACKSoftware {
  softwareId: string;
  softwareName: string;
  type: 'tool' | 'malware';
  description: string;
  techniques: string[];
  groups?: string[];
  url?: string;
}

export interface ATTACKMatrix {
  tactics: ATTACKTactic[];
  techniques: ATTACKTechnique[];
  mitigations: ATTACKMitigation[];
  groups: ATTACKGroup[];
  software: ATTACKSoftware[];
}

// ==================== D3FEND Framework ====================

export interface D3FENDTactic {
  tacticId: string;
  tacticName: string;
  category: 'harden' | 'detect' | 'isolate' | 'deceive' | 'evict' | 'restore';
  description: string;
  url?: string;
}

export interface D3FENDTechnique {
  techniqueId: string;
  techniqueName: string;
  tacticId: string;
  description: string;
  offensiveTechniques?: string[];
  url?: string;
}

export interface D3FENDMatrix {
  tactics: D3FENDTactic[];
  techniques: D3FENDTechnique[];
}

// ==================== 攻防映射关系 ====================

export interface AttackDefenseMapping {
  attackTechniqueId: string;
  defenseTechniqueId: string;
  effectivenessScore: number;
  source: 'ATT&CK' | 'D3FEND' | 'Custom';
  description?: string;
}

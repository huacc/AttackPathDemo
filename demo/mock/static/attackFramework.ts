/**
 * ATT&CK框架Mock数据
 * 参考：《本体模型体系设计规范.md》五·AttackTechnique攻击技术本体
 * ATT&CK v14 Enterprise Matrix
 */

import { ATTACKTactic, ATTACKMatrix } from '../../types';

export const attackTactics: ATTACKTactic[] = [
  {
    tacticId: 'TA0001',
    tacticName: 'Initial Access',
    description: 'The adversary is trying to get into your network.',
    url: 'https://attack.mitre.org/tactics/TA0001'
  },
  {
    tacticId: 'TA0002',
    tacticName: 'Execution',
    description: 'The adversary is trying to run malicious code.',
    url: 'https://attack.mitre.org/tactics/TA0002'
  },
  {
    tacticId: 'TA0003',
    tacticName: 'Persistence',
    description: 'The adversary is trying to maintain their foothold.',
    url: 'https://attack.mitre.org/tactics/TA0003'
  },
  {
    tacticId: 'TA0004',
    tacticName: 'Privilege Escalation',
    description: 'The adversary is trying to gain higher-level permissions.',
    url: 'https://attack.mitre.org/tactics/TA0004'
  },
  {
    tacticId: 'TA0005',
    tacticName: 'Defense Evasion',
    description: 'The adversary is trying to avoid being detected.',
    url: 'https://attack.mitre.org/tactics/TA0005'
  },
  {
    tacticId: 'TA0006',
    tacticName: 'Credential Access',
    description: 'The adversary is trying to steal account names and passwords.',
    url: 'https://attack.mitre.org/tactics/TA0006'
  },
  {
    tacticId: 'TA0007',
    tacticName: 'Discovery',
    description: 'The adversary is trying to figure out your environment.',
    url: 'https://attack.mitre.org/tactics/TA0007'
  },
  {
    tacticId: 'TA0008',
    tacticName: 'Lateral Movement',
    description: 'The adversary is trying to move through your environment.',
    url: 'https://attack.mitre.org/tactics/TA0008'
  },
  {
    tacticId: 'TA0009',
    tacticName: 'Collection',
    description: 'The adversary is trying to gather data of interest.',
    url: 'https://attack.mitre.org/tactics/TA0009'
  },
  {
    tacticId: 'TA0010',
    tacticName: 'Command and Control',
    description: 'The adversary is trying to communicate with compromised systems.',
    url: 'https://attack.mitre.org/tactics/TA0010'
  },
  {
    tacticId: 'TA0011',
    tacticName: 'Exfiltration',
    description: 'The adversary is trying to steal data.',
    url: 'https://attack.mitre.org/tactics/TA0011'
  },
  {
    tacticId: 'TA0040',
    tacticName: 'Impact',
    description: 'The adversary is trying to manipulate, interrupt, or destroy your systems and data.',
    url: 'https://attack.mitre.org/tactics/TA0040'
  }
];

export const attackMatrix: ATTACKMatrix = {
  tactics: attackTactics,
  techniques: [], // 将在attackTechniques.ts中定义
  mitigations: [],
  groups: [],
  software: []
};

export const ATTACK_FRAMEWORK = attackTactics;
export default attackTactics;

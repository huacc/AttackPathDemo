// D3FEND防御框架数据
// 参考：https://d3fend.mitre.org/

export interface D3FENDTactic {
  tacticId: string;
  name: string;
  category: 'harden' | 'detect' | 'isolate' | 'deceive' | 'evict' | 'restore';
  description: string;
  techniques: D3FENDTechnique[];
}

export interface D3FENDTechnique {
  techniqueId: string;
  name: string;
  description: string;
  d3fendId: string;
  relatedMitigations: string[]; // ATT&CK Mitigation IDs
}

export const D3FEND_TACTICS: D3FENDTactic[] = [
  {
    tacticId: 'd3-tactic-harden',
    name: 'Harden',
    category: 'harden',
    description: '强化系统以减少攻击面和提高攻击难度',
    techniques: [
      {
        techniqueId: 'd3-tech-harden-01',
        name: 'Application Hardening',
        description: '应用程序加固，减少可利用的漏洞',
        d3fendId: 'D3-AH',
        relatedMitigations: ['M1050', 'M1038']
      },
      {
        techniqueId: 'd3-tech-harden-02',
        name: 'Credential Hardening',
        description: '凭证加固，防止凭证窃取和滥用',
        d3fendId: 'D3-CH',
        relatedMitigations: ['M1026', 'M1032']
      },
      {
        techniqueId: 'd3-tech-harden-03',
        name: 'Network Traffic Filtering',
        description: '网络流量过滤，阻止恶意通信',
        d3fendId: 'D3-NTF',
        relatedMitigations: ['M1037', 'M1031']
      },
      {
        techniqueId: 'd3-tech-harden-04',
        name: 'Platform Hardening',
        description: '平台加固，减少操作系统攻击面',
        d3fendId: 'D3-PH',
        relatedMitigations: ['M1042', 'M1051']
      }
    ]
  },
  {
    tacticId: 'd3-tactic-detect',
    name: 'Detect',
    category: 'detect',
    description: '检测和识别恶意活动',
    techniques: [
      {
        techniqueId: 'd3-tech-detect-01',
        name: 'Network Traffic Analysis',
        description: '网络流量分析，检测异常通信模式',
        d3fendId: 'D3-NTA',
        relatedMitigations: ['M1031', 'M1047']
      },
      {
        techniqueId: 'd3-tech-detect-02',
        name: 'File Analysis',
        description: '文件分析，检测恶意文件和代码',
        d3fendId: 'D3-FA',
        relatedMitigations: ['M1040', 'M1049']
      },
      {
        techniqueId: 'd3-tech-detect-03',
        name: 'Process Analysis',
        description: '进程分析，检测异常进程行为',
        d3fendId: 'D3-PA',
        relatedMitigations: ['M1040']
      },
      {
        techniqueId: 'd3-tech-detect-04',
        name: 'User Behavior Analysis',
        description: '用户行为分析，检测异常账户活动',
        d3fendId: 'D3-UBA',
        relatedMitigations: ['M1026', 'M1027']
      }
    ]
  },
  {
    tacticId: 'd3-tactic-isolate',
    name: 'Isolate',
    category: 'isolate',
    description: '隔离受感染系统以防止横向移动',
    techniques: [
      {
        techniqueId: 'd3-tech-isolate-01',
        name: 'Network Isolation',
        description: '网络隔离，限制受感染系统的网络访问',
        d3fendId: 'D3-NI',
        relatedMitigations: ['M1030', 'M1037']
      },
      {
        techniqueId: 'd3-tech-isolate-02',
        name: 'Execution Isolation',
        description: '执行隔离，限制恶意代码执行范围',
        d3fendId: 'D3-EI',
        relatedMitigations: ['M1048', 'M1038']
      },
      {
        techniqueId: 'd3-tech-isolate-03',
        name: 'Network Segmentation',
        description: '网络分段，限制攻击扩散范围',
        d3fendId: 'D3-NSS',
        relatedMitigations: ['M1030']
      }
    ]
  },
  {
    tacticId: 'd3-tactic-deceive',
    name: 'Deceive',
    category: 'deceive',
    description: '欺骗攻击者以延缓攻击或收集情报',
    techniques: [
      {
        techniqueId: 'd3-tech-deceive-01',
        name: 'Decoy Environment',
        description: '诱饵环境，引诱攻击者进入蜜罐',
        d3fendId: 'D3-DE',
        relatedMitigations: []
      },
      {
        techniqueId: 'd3-tech-deceive-02',
        name: 'Decoy Object',
        description: '诱饵对象，部署假凭证和假文件',
        d3fendId: 'D3-DO',
        relatedMitigations: []
      },
      {
        techniqueId: 'd3-tech-deceive-03',
        name: 'Network Decoy',
        description: '网络诱饵，部署假网络节点',
        d3fendId: 'D3-ND',
        relatedMitigations: []
      }
    ]
  },
  {
    tacticId: 'd3-tactic-evict',
    name: 'Evict',
    category: 'evict',
    description: '驱逐攻击者并清除恶意存在',
    techniques: [
      {
        techniqueId: 'd3-tech-evict-01',
        name: 'Credential Eviction',
        description: '凭证驱逐，撤销被盗凭证',
        d3fendId: 'D3-CE',
        relatedMitigations: ['M1026', 'M1027']
      },
      {
        techniqueId: 'd3-tech-evict-02',
        name: 'Process Termination',
        description: '进程终止，结束恶意进程',
        d3fendId: 'D3-PT',
        relatedMitigations: ['M1040']
      },
      {
        techniqueId: 'd3-tech-evict-03',
        name: 'File Removal',
        description: '文件移除，删除恶意文件',
        d3fendId: 'D3-FR',
        relatedMitigations: ['M1040']
      }
    ]
  },
  {
    tacticId: 'd3-tactic-restore',
    name: 'Restore',
    category: 'restore',
    description: '恢复系统到安全状态',
    techniques: [
      {
        techniqueId: 'd3-tech-restore-01',
        name: 'Restore from Backup',
        description: '从备份恢复，还原受损数据',
        d3fendId: 'D3-BRS',
        relatedMitigations: ['M1053']
      },
      {
        techniqueId: 'd3-tech-restore-02',
        name: 'System Recovery',
        description: '系统恢复，重建受损系统',
        d3fendId: 'D3-SR',
        relatedMitigations: ['M1053']
      },
      {
        techniqueId: 'd3-tech-restore-03',
        name: 'Configuration Restoration',
        description: '配置恢复，还原安全配置',
        d3fendId: 'D3-CR',
        relatedMitigations: ['M1053']
      }
    ]
  }
];

export default D3FEND_TACTICS;

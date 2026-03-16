/**
 * 威胁行为者Mock数据
 * 数量：5个真实APT组织
 * 参考：《本体模型体系设计规范.md》六·ThreatActor威胁行为者本体
 */

import { ThreatActor } from '../../types';

export const threatActors: ThreatActor[] = [
  {
    actorId: 'actor-001',
    name: 'APT29',
    aliases: ['Cozy Bear', 'The Dukes', 'Midnight Blizzard'],
    attackGroupId: 'G0016',
    actorType: 'nation-state',
    sophisticationLevel: 'expert',
    resourceLevel: 'government',
    primaryMotivation: 'espionage',
    ttpsUsed: ['T1190', 'T1059.001', 'T1071.001', 'T1078', 'T1003'],
    targetSectors: ['government', 'defense', 'technology'],
    targetCountries: ['US', 'EU', 'UK'],
    toolsUsed: ['Cobalt Strike', 'Mimikatz', 'WellMess'],
    attackSuccessModifier: 1.6,
    stealthModifier: 1.9,
    firstSeenYear: 2008,
    attributionConfidence: 'confirmed'
  },
  {
    actorId: 'actor-002',
    name: 'APT28',
    aliases: ['Fancy Bear', 'Sofacy', 'Sednit'],
    attackGroupId: 'G0007',
    actorType: 'nation-state',
    sophisticationLevel: 'expert',
    resourceLevel: 'government',
    primaryMotivation: 'espionage',
    ttpsUsed: ['T1566', 'T1059', 'T1021', 'T1070', 'T1027'],
    targetSectors: ['government', 'military', 'media'],
    targetCountries: ['US', 'EU', 'UA'],
    toolsUsed: ['X-Agent', 'Sofacy', 'Zebrocy'],
    attackSuccessModifier: 1.5,
    stealthModifier: 1.7,
    firstSeenYear: 2007,
    attributionConfidence: 'confirmed'
  },
  {
    actorId: 'actor-003',
    name: 'Lazarus Group',
    aliases: ['HIDDEN COBRA', 'Guardians of Peace'],
    attackGroupId: 'G0032',
    actorType: 'nation-state',
    sophisticationLevel: 'advanced',
    resourceLevel: 'government',
    primaryMotivation: 'financial',
    ttpsUsed: ['T1190', 'T1486', 'T1490', 'T1041', 'T1005'],
    targetSectors: ['finance', 'cryptocurrency', 'entertainment'],
    targetCountries: ['US', 'KR', 'JP'],
    toolsUsed: ['WannaCry', 'BLINDINGCAN', 'HOPLIGHT'],
    attackSuccessModifier: 1.4,
    stealthModifier: 1.5,
    firstSeenYear: 2009,
    attributionConfidence: 'confirmed'
  },
  {
    actorId: 'actor-004',
    name: 'FIN7',
    aliases: ['Carbanak Group'],
    actorType: 'criminal',
    sophisticationLevel: 'advanced',
    resourceLevel: 'organization',
    primaryMotivation: 'financial',
    ttpsUsed: ['T1566', 'T1204', 'T1059.001', 'T1003', 'T1005'],
    targetSectors: ['retail', 'hospitality', 'finance'],
    targetCountries: ['US', 'EU'],
    toolsUsed: ['Carbanak', 'GRIFFON', 'POWERSOURCE'],
    attackSuccessModifier: 1.3,
    stealthModifier: 1.4,
    firstSeenYear: 2013,
    attributionConfidence: 'likely'
  },
  {
    actorId: 'actor-005',
    name: 'Script Kiddie',
    actorType: 'script-kiddie',
    sophisticationLevel: 'minimal',
    resourceLevel: 'individual',
    primaryMotivation: 'notoriety',
    ttpsUsed: ['T1110', 'T1190', 'T1498'],
    targetSectors: ['various'],
    toolsUsed: ['Metasploit', 'LOIC', 'sqlmap'],
    attackSuccessModifier: 0.6,
    stealthModifier: 0.5,
    attributionConfidence: 'unknown'
  }
];

export const THREAT_ACTORS = threatActors;
export default threatActors;

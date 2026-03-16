/**
 * 本体数据 Store
 */
import { create } from 'zustand';
import {
  NetworkNode,
  Vulnerability,
  AttackTechnique,
  ThreatActor,
  DefenseMeasure,
  AttackDefenseRelation
} from '../types';

interface OntologyState {
  // 本体实例数据
  networkNodes: NetworkNode[];
  vulnerabilities: Vulnerability[];
  attackTechniques: AttackTechnique[];
  threatActors: ThreatActor[];
  defenseMeasures: DefenseMeasure[];
  relations: AttackDefenseRelation[];
  
  // Actions
  setNetworkNodes: (nodes: NetworkNode[]) => void;
  setVulnerabilities: (vulns: Vulnerability[]) => void;
  setAttackTechniques: (techniques: AttackTechnique[]) => void;
  setThreatActors: (actors: ThreatActor[]) => void;
  setDefenseMeasures: (measures: DefenseMeasure[]) => void;
  setRelations: (relations: AttackDefenseRelation[]) => void;
  
  addNetworkNode: (node: NetworkNode) => void;
  updateNetworkNode: (nodeId: string, updates: Partial<NetworkNode>) => void;
  removeNetworkNode: (nodeId: string) => void;
  
  addVulnerability: (vuln: Vulnerability) => void;
  updateVulnerability: (vulnId: string, updates: Partial<Vulnerability>) => void;
  removeVulnerability: (vulnId: string) => void;
}

export const useOntologyStore = create<OntologyState>((set) => ({
  networkNodes: [],
  vulnerabilities: [],
  attackTechniques: [],
  threatActors: [],
  defenseMeasures: [],
  relations: [],
  
  setNetworkNodes: (nodes) => set({ networkNodes: nodes }),
  setVulnerabilities: (vulns) => set({ vulnerabilities: vulns }),
  setAttackTechniques: (techniques) => set({ attackTechniques: techniques }),
  setThreatActors: (actors) => set({ threatActors: actors }),
  setDefenseMeasures: (measures) => set({ defenseMeasures: measures }),
  setRelations: (relations) => set({ relations }),
  
  addNetworkNode: (node) => set((state) => ({
    networkNodes: [...state.networkNodes, node]
  })),
  
  updateNetworkNode: (nodeId, updates) => set((state) => ({
    networkNodes: state.networkNodes.map(node =>
      node.nodeId === nodeId ? { ...node, ...updates } : node
    )
  })),
  
  removeNetworkNode: (nodeId) => set((state) => ({
    networkNodes: state.networkNodes.filter(node => node.nodeId !== nodeId)
  })),
  
  addVulnerability: (vuln) => set((state) => ({
    vulnerabilities: [...state.vulnerabilities, vuln]
  })),
  
  updateVulnerability: (vulnId, updates) => set((state) => ({
    vulnerabilities: state.vulnerabilities.map(vuln =>
      vuln.vulnId === vulnId ? { ...vuln, ...updates } : vuln
    )
  })),
  
  removeVulnerability: (vulnId) => set((state) => ({
    vulnerabilities: state.vulnerabilities.filter(vuln => vuln.vulnId !== vulnId)
  })),
}));

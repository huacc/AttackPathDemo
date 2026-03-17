import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AttackPath } from '../mock/dynamic/attackPaths';
import { DefenseScenario } from '../mock/dynamic/defenseScenarios';
import {
  AttackDefenseSimulationResult,
  CockpitModelProfile
} from '../modules/cockpit/engine/mockAttackDefenseEngine';

export type CockpitMode = 'overview' | 'attack' | 'defense' | 'linked';

interface CockpitOrchestratorState {
  sceneId: string;
  activeMode: CockpitMode;
  modelProfile: CockpitModelProfile;
  selectedAttackPathId: string | null;
  selectedDefenseScenarioId: string | null;
  simulationResult: AttackDefenseSimulationResult | null;
  lastRunAt: string | null;

  setSceneId: (sceneId: string) => void;
  setActiveMode: (mode: CockpitMode) => void;
  setModelProfile: (model: CockpitModelProfile) => void;
  setSelectedAttackPathId: (pathId: string | null) => void;
  setSelectedDefenseScenarioId: (scenarioId: string | null) => void;
  applySimulationResult: (result: AttackDefenseSimulationResult) => void;
  resetSimulation: () => void;
  syncSelectionAfterSceneSwitch: (attackPaths: AttackPath[], defenseScenarios: DefenseScenario[]) => void;
}

const initialState = {
  sceneId: 'scene-001',
  activeMode: 'overview' as CockpitMode,
  modelProfile: 'mitre_attack' as CockpitModelProfile,
  selectedAttackPathId: null,
  selectedDefenseScenarioId: null,
  simulationResult: null,
  lastRunAt: null
};

export const useCockpitOrchestratorStore = create<CockpitOrchestratorState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setSceneId: (sceneId) => set({ sceneId }),
      setActiveMode: (activeMode) => set({ activeMode }),
      setModelProfile: (modelProfile) => set({ modelProfile }),
      setSelectedAttackPathId: (selectedAttackPathId) => set({ selectedAttackPathId }),
      setSelectedDefenseScenarioId: (selectedDefenseScenarioId) => set({ selectedDefenseScenarioId }),
      applySimulationResult: (simulationResult) => set({
        simulationResult,
        lastRunAt: new Date().toISOString()
      }),
      resetSimulation: () => set({ simulationResult: null, lastRunAt: null }),
      syncSelectionAfterSceneSwitch: (attackPaths, defenseScenarios) => {
        const state = get();
        const validAttackPath = attackPaths.find(path => path.pathId === state.selectedAttackPathId);
        const validDefenseScenario = defenseScenarios.find(scenario => scenario.scenarioId === state.selectedDefenseScenarioId);

        set({
          selectedAttackPathId: validAttackPath?.pathId ?? attackPaths[0]?.pathId ?? null,
          selectedDefenseScenarioId: validDefenseScenario?.scenarioId ?? defenseScenarios[0]?.scenarioId ?? null
        });
      }
    }),
    {
      name: 'cockpit-orchestrator-storage',
      partialize: (state) => ({
        sceneId: state.sceneId,
        activeMode: state.activeMode,
        modelProfile: state.modelProfile,
        selectedAttackPathId: state.selectedAttackPathId,
        selectedDefenseScenarioId: state.selectedDefenseScenarioId
      })
    }
  )
);


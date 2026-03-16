/**
 * 推演 Store
 */
import { create } from 'zustand';
import {
  AttackPath,
  DamageAssessment,
  DefenseSimulationResult,
  SimulationResult,
  TimelineEvent
} from '../types';

type SimulationStatus = 'idle' | 'configuring' | 'running' | 'completed' | 'failed';

interface SimulationState {
  // 推演状态
  status: SimulationStatus;
  // 当前攻击路径列表
  attackPaths: AttackPath[];
  // 选中的路径
  selectedPathId: string | null;
  // 损伤评估
  damageAssessments: Record<string, DamageAssessment>;
  // 防御仿真结果
  defenseResults: DefenseSimulationResult[];
  // 推演结果
  simulationResult: SimulationResult | null;
  // 时间轴事件
  timelineEvents: TimelineEvent[];
  // 当前时间（用于回放）
  currentTime: number;
  // 是否正在播放
  isPlaying: boolean;
  // 播放速度
  playbackSpeed: number;
  
  // Actions
  setStatus: (status: SimulationStatus) => void;
  setAttackPaths: (paths: AttackPath[]) => void;
  selectPath: (pathId: string | null) => void;
  setDamageAssessments: (assessments: Record<string, DamageAssessment>) => void;
  setDefenseResults: (results: DefenseSimulationResult[]) => void;
  setSimulationResult: (result: SimulationResult | null) => void;
  setTimelineEvents: (events: TimelineEvent[]) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  reset: () => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  status: 'idle',
  attackPaths: [],
  selectedPathId: null,
  damageAssessments: {},
  defenseResults: [],
  simulationResult: null,
  timelineEvents: [],
  currentTime: 0,
  isPlaying: false,
  playbackSpeed: 1,
  
  setStatus: (status) => set({ status }),
  setAttackPaths: (paths) => set({ attackPaths: paths }),
  selectPath: (pathId) => set({ selectedPathId: pathId }),
  setDamageAssessments: (assessments) => set({ damageAssessments: assessments }),
  setDefenseResults: (results) => set({ defenseResults: results }),
  setSimulationResult: (result) => set({ simulationResult: result }),
  setTimelineEvents: (events) => set({ timelineEvents: events }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  
  reset: () => set({
    status: 'idle',
    attackPaths: [],
    selectedPathId: null,
    damageAssessments: {},
    defenseResults: [],
    simulationResult: null,
    timelineEvents: [],
    currentTime: 0,
    isPlaying: false,
    playbackSpeed: 1,
  }),
}));

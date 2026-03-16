/**
 * 推演历史记录Mock数据
 */

export interface SimulationHistoryRecord {
  recordId: string;
  sceneName: string;
  startTime: string;
  endTime: string;
  duration: number;
  algorithm: string;
  status: 'success' | 'failed' | 'timeout';
  pathsFound: number;
  attackSuccess: boolean;
  targetNode: string;
  operator: string;
}

export const SIMULATION_HISTORY: SimulationHistoryRecord[] = [
  {
    recordId: 'sim-2024-001',
    sceneName: '企业网络渗透测试场景',
    startTime: '2024-03-15 10:30:00',
    endTime: '2024-03-15 10:35:23',
    duration: 323,
    algorithm: 'dijkstra',
    status: 'success',
    pathsFound: 5,
    attackSuccess: true,
    targetNode: 'DB-Server-01',
    operator: '张三'
  },
  {
    recordId: 'sim-2024-002',
    sceneName: '云环境安全评估',
    startTime: '2024-03-15 14:20:00',
    endTime: '2024-03-15 14:28:45',
    duration: 525,
    algorithm: 'a_star',
    status: 'success',
    pathsFound: 8,
    attackSuccess: true,
    targetNode: 'Cloud-API-Gateway',
    operator: '李四'
  },
  {
    recordId: 'sim-2024-003',
    sceneName: 'APT攻击模拟',
    startTime: '2024-03-14 16:00:00',
    endTime: '2024-03-14 16:12:30',
    duration: 750,
    algorithm: 'genetic',
    status: 'success',
    pathsFound: 12,
    attackSuccess: true,
    targetNode: 'Domain-Controller',
    operator: '王五'
  },
  {
    recordId: 'sim-2024-004',
    sceneName: '勒索软件传播路径分析',
    startTime: '2024-03-14 09:15:00',
    endTime: '2024-03-14 09:20:18',
    duration: 318,
    algorithm: 'monte_carlo',
    status: 'success',
    pathsFound: 6,
    attackSuccess: false,
    targetNode: 'File-Server-02',
    operator: '张三'
  },
  {
    recordId: 'sim-2024-005',
    sceneName: '内网横向移动测试',
    startTime: '2024-03-13 11:00:00',
    endTime: '2024-03-13 11:30:00',
    duration: 1800,
    algorithm: 'dijkstra',
    status: 'timeout',
    pathsFound: 3,
    attackSuccess: false,
    targetNode: 'HR-Database',
    operator: '李四'
  },
  {
    recordId: 'sim-2024-006',
    sceneName: 'Web应用攻击链分析',
    startTime: '2024-03-13 15:45:00',
    endTime: '2024-03-13 15:52:10',
    duration: 430,
    algorithm: 'a_star',
    status: 'success',
    pathsFound: 7,
    attackSuccess: true,
    targetNode: 'Web-App-Server',
    operator: '王五'
  },
  {
    recordId: 'sim-2024-007',
    sceneName: '供应链攻击模拟',
    startTime: '2024-03-12 10:00:00',
    endTime: '2024-03-12 10:08:55',
    duration: 535,
    algorithm: 'genetic',
    status: 'success',
    pathsFound: 9,
    attackSuccess: true,
    targetNode: 'Build-Server',
    operator: '张三'
  },
  {
    recordId: 'sim-2024-008',
    sceneName: '物联网设备入侵测试',
    startTime: '2024-03-12 14:30:00',
    endTime: '2024-03-12 14:35:42',
    duration: 342,
    algorithm: 'dijkstra',
    status: 'success',
    pathsFound: 4,
    attackSuccess: false,
    targetNode: 'IoT-Gateway',
    operator: '李四'
  }
];

export default SIMULATION_HISTORY;

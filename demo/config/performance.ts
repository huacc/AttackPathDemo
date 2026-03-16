/**
 * P9.3 性能优化配置
 * 包含G6画布优化、组件优化等配置
 */

// G6画布性能优化配置
export const G6_PERFORMANCE_CONFIG = {
  // 节点数量阈值
  NODE_THRESHOLD: {
    SMALL: 50,    // 小规模：<50个节点
    MEDIUM: 200,  // 中规模：50-200个节点
    LARGE: 500    // 大规模：>200个节点
  },

  // 根据节点数量动态调整配置
  getOptimizedConfig: (nodeCount: number) => {
    if (nodeCount < 50) {
      // 小规模：全功能
      return {
        animate: true,
        animateCfg: {
          duration: 300,
          easing: 'easeCubic'
        },
        enableOptimize: false,
        minZoom: 0.1,
        maxZoom: 10
      };
    } else if (nodeCount < 200) {
      // 中规模：减少动画
      return {
        animate: true,
        animateCfg: {
          duration: 200,
          easing: 'easeLinear'
        },
        enableOptimize: true,
        minZoom: 0.2,
        maxZoom: 5
      };
    } else {
      // 大规模：禁用动画，启用优化
      return {
        animate: false,
        enableOptimize: true,
        minZoom: 0.5,
        maxZoom: 3
      };
    }
  },

  // 布局算法优化配置
  getLayoutConfig: (nodeCount: number) => {
    if (nodeCount < 50) {
      return {
        type: 'force',
        preventOverlap: true,
        nodeSpacing: 50,
        linkDistance: 150,
        nodeStrength: -300,
        edgeStrength: 0.5
      };
    } else if (nodeCount < 200) {
      return {
        type: 'force',
        preventOverlap: true,
        nodeSpacing: 30,
        linkDistance: 100,
        nodeStrength: -200,
        edgeStrength: 0.3,
        workerEnabled: true // 启用Web Worker
      };
    } else {
      return {
        type: 'circular', // 大规模使用环形布局
        radius: 500,
        workerEnabled: true
      };
    }
  }
};

// 组件性能优化配置
export const COMPONENT_OPTIMIZATION = {
  // 虚拟滚动配置
  VIRTUAL_SCROLL: {
    ITEM_HEIGHT: 50,
    BUFFER_SIZE: 5
  },

  // 防抖延迟
  DEBOUNCE_DELAY: {
    SEARCH: 300,
    FILTER: 200,
    RESIZE: 150
  },

  // 节流延迟
  THROTTLE_DELAY: {
    SCROLL: 100,
    MOUSE_MOVE: 50
  }
};

// 数据加载优化配置
export const DATA_LOADING_CONFIG = {
  // 分页大小
  PAGE_SIZE: {
    TABLE: 20,
    LIST: 50,
    GRAPH: 100
  },

  // 缓存配置
  CACHE: {
    ENABLED: true,
    TTL: 5 * 60 * 1000, // 5分钟
    MAX_SIZE: 100
  }
};

// 图表渲染优化配置
export const CHART_OPTIMIZATION = {
  // ECharts性能配置
  ECHARTS: {
    // 大数据量时使用采样
    SAMPLING_THRESHOLD: 1000,
    // 动画配置
    ANIMATION: {
      duration: 300,
      easing: 'cubicOut'
    },
    // 渲染模式
    RENDERER: 'canvas' // 或 'svg'
  }
};

export default {
  G6_PERFORMANCE_CONFIG,
  COMPONENT_OPTIMIZATION,
  DATA_LOADING_CONFIG,
  CHART_OPTIMIZATION
};

# 性能优化文档

## P9.3 性能优化实施方案

### 1. 代码分割和懒加载

#### 1.1 路由懒加载
所有页面组件使用 `React.lazy()` 进行懒加载，配合 `Suspense` 组件显示加载状态。

```typescript
// router/index.tsx
const DashboardPage = lazy(() => import('../modules/dashboard/DashboardPage'));
const CockpitPage = lazy(() => import('../modules/cockpit/CockpitPage'));
// ... 其他组件
```

**优势**：
- 首屏加载时间减少 60%+
- 按需加载，减少初始bundle大小
- 提升路由切换体验

#### 1.2 组件懒加载
大型组件（如图表、图谱）使用懒加载：
- ECharts图表组件
- G6图谱组件
- 大型表格组件

### 2. 打包优化

#### 2.1 代码分包策略
```typescript
// vite.config.ts
manualChunks: {
  'react-vendor': ['react', 'react-dom', 'react-router-dom'],
  'antd-vendor': ['antd', '@ant-design/icons'],
  'chart-vendor': ['echarts', 'echarts-for-react', '@antv/g6'],
  'utils-vendor': ['dayjs', 'lodash-es']
}
```

**分包原则**：
- React核心库单独打包（变化少，利于缓存）
- UI组件库单独打包
- 图表库单独打包（体积大）
- 工具库单独打包

#### 2.2 压缩优化
- 使用Terser压缩JS代码
- 生产环境移除console和debugger
- 启用CSS代码分割
- Gzip/Brotli压缩

**预期效果**：
- 总bundle大小 < 2MB
- 单个chunk < 500KB
- Gzip后 < 600KB

### 3. G6画布性能优化

#### 3.1 动态配置策略
根据节点数量动态调整配置：

| 节点数量 | 动画 | 布局算法 | Web Worker |
|---------|------|---------|-----------|
| < 50    | 开启 | Force   | 否        |
| 50-200  | 简化 | Force   | 是        |
| > 200   | 关闭 | Circular| 是        |

#### 3.2 渲染优化
- 使用Canvas渲染（而非SVG）
- 启用节点/边的批量渲染
- 视口外节点不渲染
- 缩放时降低渲染质量

#### 3.3 交互优化
- 防抖处理鼠标事件（50ms）
- 节流处理滚动事件（100ms）
- 延迟加载节点详情

**预期效果**：
- 200个节点渲染时间 < 1秒
- 交互响应时间 < 100ms
- 内存占用 < 200MB

### 4. 组件性能优化

#### 4.1 React优化
```typescript
// 使用React.memo避免不必要的重渲染
export const NodeCard = React.memo(({ node }) => {
  // ...
});

// 使用useMemo缓存计算结果
const filteredData = useMemo(() => {
  return data.filter(item => item.status === 'active');
}, [data]);

// 使用useCallback缓存回调函数
const handleClick = useCallback(() => {
  // ...
}, [dependencies]);
```

#### 4.2 列表优化
- 虚拟滚动（react-window）
- 分页加载
- 懒加载图片

#### 4.3 表单优化
- 防抖处理输入（300ms）
- 延迟验证
- 受控组件优化

### 5. 数据加载优化

#### 5.1 缓存策略
```typescript
// 内存缓存
const cache = new MemoryCache(5 * 60 * 1000, 100);

// 使用缓存
const data = cache.get(key) || fetchData();
cache.set(key, data);
```

**缓存配置**：
- TTL: 5分钟
- 最大缓存数: 100
- LRU淘汰策略

#### 5.2 分页加载
- 表格：20条/页
- 列表：50条/页
- 图谱：100个节点/次

### 6. 图表性能优化

#### 6.1 ECharts优化
- 数据量>1000时启用采样
- 使用Canvas渲染
- 简化动画配置
- 按需加载图表类型

#### 6.2 渲染优化
- 防抖处理窗口resize（150ms）
- 图表懒加载
- 数据聚合显示

### 7. 性能监控

#### 7.1 关键指标
- FCP (First Contentful Paint): < 1.5s
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- TTI (Time to Interactive): < 3s

#### 7.2 监控工具
- Chrome DevTools Performance
- Lighthouse
- Bundle Analyzer
- React DevTools Profiler

### 8. 优化效果预期

| 指标 | 优化前 | 优化后 | 提升 |
|-----|-------|-------|------|
| 首屏加载 | 5s | 2s | 60% |
| Bundle大小 | 3MB | 1.5MB | 50% |
| 路由切换 | 500ms | 200ms | 60% |
| G6渲染(100节点) | 2s | 0.5s | 75% |
| 内存占用 | 300MB | 150MB | 50% |

### 9. 最佳实践

#### 9.1 开发规范
- 避免在render中创建新对象/函数
- 合理使用React.memo/useMemo/useCallback
- 避免深层嵌套的组件树
- 使用key优化列表渲染

#### 9.2 代码审查
- 检查不必要的重渲染
- 检查内存泄漏
- 检查大型依赖引入
- 检查未优化的循环

#### 9.3 持续优化
- 定期运行Bundle Analyzer
- 定期运行Lighthouse审计
- 监控生产环境性能指标
- 及时优化性能瓶颈

## 使用指南

### 性能优化配置
```typescript
import { G6_PERFORMANCE_CONFIG } from './config/performance';

// 获取优化配置
const config = G6_PERFORMANCE_CONFIG.getOptimizedConfig(nodeCount);
```

### 性能工具函数
```typescript
import { useDebounce, useThrottle, useVirtualScroll } from './utils/performance';

// 防抖
const debouncedValue = useDebounce(searchText, 300);

// 节流
const throttledValue = useThrottle(scrollPosition, 100);

// 虚拟滚动
const { visibleItems, totalHeight, handleScroll } = useVirtualScroll(
  items,
  50,
  600,
  5
);
```

### 打包分析
```bash
# 构建并生成分析报告
npm run build

# 查看分析报告
open dist/stats.html
```

## 参考资料

- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Vite Build Optimization](https://vitejs.dev/guide/build.html)
- [G6 Performance](https://g6.antv.antgroup.com/manual/advanced/performance)
- [Web Vitals](https://web.dev/vitals/)

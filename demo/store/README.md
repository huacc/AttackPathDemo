# 全局状态管理优化说明

## 优化内容

### 1. 消除数据冗余
- **问题**：`useOntologyStore` 和 `useAssetStore` 都存储了 `networkNodes` 和 `vulnerabilities`
- **解决**：`useAssetStore` 只保留筛选和搜索状态，实际数据从 `useOntologyStore` 获取
- **优势**：减少内存占用，避免数据不一致

### 2. 添加持久化支持
所有store都添加了LocalStorage持久化，使用 `zustand/middleware` 的 `persist`：

- **useGlobalStore**：持久化用户偏好和当前模块
- **useSceneStore**：持久化场景数据
- **useCockpitStore**：持久化视图设置
- **useAssetStore**：持久化筛选和排序状态

### 3. 性能优化
- 使用 `partialize` 选择性持久化，避免持久化临时状态
- 不持久化的状态：
  - 通知列表（notifications）
  - 加载状态（loading）
  - 错误信息（error）
  - 选中状态（selectedNodeIds）
  - 缩放级别（zoomLevel）

## Store 结构

```
store/
├── middleware/
│   └── persist.ts          # 持久化中间件
├── useGlobalStore.ts       # 全局状态（优化）
├── useSceneStore.ts        # 场景管理（优化）
├── useOntologyStore.ts     # 本体数据
├── useKnowledgeStore.ts    # 知识图谱
├── useCockpitStore.ts      # 驾驶舱（优化）
├── useSimulationStore.ts   # 推演状态
├── useAssetStore.ts        # 资产筛选（优化）
└── index.ts                # 统一导出
```

## 使用示例

### 基本使用
```typescript
import { useGlobalStore } from '@/store';

function MyComponent() {
  const { currentModule, setCurrentModule } = useGlobalStore();
  
  return (
    <div>Current: {currentModule}</div>
  );
}
```

### 选择器优化
```typescript
// ❌ 不推荐：会导致不必要的重渲染
const store = useGlobalStore();

// ✅ 推荐：只订阅需要的状态
const currentModule = useGlobalStore(state => state.currentModule);
const setCurrentModule = useGlobalStore(state => state.setCurrentModule);
```

### 持久化配置
```typescript
// 自动持久化到 localStorage
// 键名：global-storage, scene-storage, cockpit-storage, asset-storage
```

## 性能建议

1. **使用选择器**：只订阅需要的状态片段
2. **避免在render中创建新对象**：使用 `useMemo` 或 `useCallback`
3. **批量更新**：使用 `set` 的函数形式进行批量更新
4. **清理持久化数据**：定期清理不需要的localStorage数据

## 数据流

```
用户操作 → Action → Store更新 → LocalStorage持久化 → 组件重渲染
```

## 注意事项

1. 持久化的数据会在页面刷新后恢复
2. 临时状态（如loading、error）不会持久化
3. 大数据量（如完整的图谱数据）不建议持久化
4. 持久化数据有大小限制（localStorage约5-10MB）

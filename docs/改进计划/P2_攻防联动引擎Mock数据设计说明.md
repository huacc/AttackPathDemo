# P2 攻防联动引擎 Mock 数据设计说明

## 目标
确保在统一沙盘中，能够直观看到：
1. 攻击路径推进效果（阶段推进、阻断、绕过、失陷）。
2. 防护覆盖范围效果（节点覆盖强弱、策略密度、覆盖率）。

## 数据输入
- 攻击路径：`demo/mock/dynamic/attackPaths.ts`
  - 使用 `attackPhases`（目标节点、技术ID、阶段成功率、Kill Chain阶段）
- 防御方案：`demo/mock/dynamic/defenseScenarios.ts`
  - 使用 `deployments`（防御措施、部署节点、有效性评分）
- 防御能力画像：`demo/mock/static/defenseMeasures.ts`
  - 提供 `successRateReduction`、`detectionRate`、`mitigatedTechniques`

## 核心计算口径

### 1) 防护覆盖建模（节点维度）
每个节点聚合部署措施后得到：
- `effectivenessAvg`：部署有效性均值
- `preventiveAvg`：阻断能力均值
- `detectionAvg`：检测能力均值
- `coverageScore`：覆盖评分（0~100）
- `coverageLevel`：none/weak/medium/strong

### 2) 攻击阶段判定（phase维度）
对每个攻击阶段计算：
- `preventivePower`
- `detectionPower`
- `residualSuccessRate`

并输出阶段状态：
- `blocked`：被阻断
- `detected`：被检测
- `bypassed`：绕过防护
- `compromised`：导致失陷
- `not_reached`：前序阶段被阻断后未到达

### 3) 路径与节点联动结果
- `attackEdges`：攻击链路上的边，并带 `attackPhaseStatus`
- `nodeOutcomes`：节点最终态势 safe/covered/blocked/detected/compromised
- `metrics`：覆盖率、阻断率、检测率、失陷率、风险降低率

## 可视化映射（沙盘）
- 节点：
  - covered -> 轻度增分
  - detected/blocked -> 降级状态
  - compromised -> 失陷状态（红色）
- 边（攻防层）：
  - blocked -> 绿色
  - detected -> 黄色
  - bypassed/compromised -> 红色
  - not_reached -> 灰色

## 说明
该方案已在 `demo/modules/cockpit/engine/mockAttackDefenseEngine.ts` 落地，可在 cockpit 单页通过“攻击推演/防御仿真/攻防联动”模式直接观察效果。

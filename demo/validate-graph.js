// 验证知识图谱数据完整性

// 导入数据
import { KNOWLEDGE_GRAPH_NODES, KNOWLEDGE_GRAPH_EDGES } from './mock/knowledgeGraphData.ts';

// 收集所有节点ID
const nodeIds = new Set(KNOWLEDGE_GRAPH_NODES.map(n => n.id));

console.log('=== 知识图谱数据验证 ===');
console.log(`节点总数: ${KNOWLEDGE_GRAPH_NODES.length}`);
console.log(`边总数: ${KNOWLEDGE_GRAPH_EDGES.length}`);
console.log('\n节点列表:');
KNOWLEDGE_GRAPH_NODES.forEach(n => {
  console.log(`  - ${n.id}: ${n.label} (${n.nodeType})`);
});

console.log('\n边验证:');
let invalidEdges = 0;
KNOWLEDGE_GRAPH_EDGES.forEach(e => {
  const sourceExists = nodeIds.has(e.source);
  const targetExists = nodeIds.has(e.target);

  if (!sourceExists || !targetExists) {
    console.log(`❌ ${e.id}: ${e.source} -> ${e.target}`);
    if (!sourceExists) console.log(`   缺少source节点: ${e.source}`);
    if (!targetExists) console.log(`   缺少target节点: ${e.target}`);
    invalidEdges++;
  }
});

if (invalidEdges === 0) {
  console.log('✅ 所有边都有效，source和target都指向存在的节点');
} else {
  console.log(`\n❌ 发现 ${invalidEdges} 条无效边`);
}

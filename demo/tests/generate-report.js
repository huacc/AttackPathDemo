const fs = require('fs');
const path = require('path');

function generateReport(results) {
  const now = new Date();
  const timestamp = now.toLocaleString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  let report = `测试报告
========

测试时间：${timestamp}
测试环境：http://localhost:3008

测试结果：
- 总测试数：${results.total}
- 通过：${results.passed}
- 失败：${results.failed}
- 跳过：${results.skipped}

`;

  if (results.failures && results.failures.length > 0) {
    report += `失败详情：\n`;
    results.failures.forEach((failure, index) => {
      report += `${index + 1}. [${failure.suite}] ${failure.test}\n`;
      report += `   - 严重程度：${failure.severity}\n`;
      report += `   - 错误信息：${failure.error}\n\n`;
    });
  } else {
    report += `✅ 所有测试通过！\n`;
  }

  return report;
}

module.exports = { generateReport };

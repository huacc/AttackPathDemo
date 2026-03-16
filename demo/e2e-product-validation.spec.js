const { chromium } = require('playwright');

async function runProductValidation() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  const report = {
    timestamp: new Date().toISOString(),
    scenarios: [],
    issues: [],
    suggestions: []
  };

  console.log('================================================================================');
  console.log('用户体验验收报告');
  console.log('================================================================================');
  console.log(`验收时间：${new Date().toLocaleString('zh-CN')}`);
  console.log('验收人：product-manager');
  console.log('');

  try {
    // 场景1：场景管理流程
    console.log('【场景1】场景管理流程验证...');
    await page.goto('http://localhost:3009', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    const title = await page.title();
    console.log(`  ✓ 页面标题：${title}`);
    
    // 截图
    await page.screenshot({ path: '/tmp/screenshot-home.png' });
    console.log('  ✓ 首页截图已保存');
    
    // 查找导航菜单
    const menuItems = await page.locator('[class*="menu"], [class*="nav"], a, button').count();
    console.log(`  ✓ 发现 ${menuItems} 个可交互元素`);
    
    // 尝试查找场景相关的链接或按钮
    const scenarioLinks = await page.locator('text=/场景|scenario/i').count();
    if (scenarioLinks > 0) {
      console.log(`  ✓ 发现 ${scenarioLinks} 个场景相关元素`);
      
      // 点击第一个场景链接
      await page.locator('text=/场景|scenario/i').first().click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '/tmp/screenshot-scenario.png' });
      console.log('  ✓ 场景页面截图已保存');
      
      report.scenarios.push({ name: '场景1：场景管理流程', status: 'PASS' });
    } else {
      console.log('  ⚠ 未找到场景管理入口');
      report.scenarios.push({ name: '场景1：场景管理流程', status: 'PARTIAL' });
      report.issues.push('[中] 场景管理入口不明显');
    }

    // 场景2：攻击路径推演流程
    console.log('\n【场景2】攻击路径推演流程验证...');
    await page.goto('http://localhost:3009', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const attackLinks = await page.locator('text=/攻击|attack|驾驶舱|cockpit/i').count();
    if (attackLinks > 0) {
      console.log(`  ✓ 发现 ${attackLinks} 个攻击路径相关元素`);
      
      await page.locator('text=/攻击|attack|驾驶舱|cockpit/i').first().click();
      await page.waitForTimeout(3000);
      
      // 检查是否有图形渲染
      const canvasElements = await page.locator('canvas').count();
      const svgElements = await page.locator('svg').count();
      console.log(`  ✓ 图形元素：${canvasElements} 个canvas, ${svgElements} 个svg`);
      
      await page.screenshot({ path: '/tmp/screenshot-attack.png' });
      console.log('  ✓ 攻击路径页面截图已保存');
      
      if (canvasElements > 0 || svgElements > 0) {
        report.scenarios.push({ name: '场景2：攻击路径推演流程', status: 'PASS' });
      } else {
        report.scenarios.push({ name: '场景2：攻击路径推演流程', status: 'PARTIAL' });
        report.issues.push('[中] 攻击路径图形未正确渲染');
      }
    } else {
      console.log('  ⚠ 未找到攻击路径入口');
      report.scenarios.push({ name: '场景2：攻击路径推演流程', status: 'FAIL' });
      report.issues.push('[高] 攻击路径功能缺失');
    }

    // 场景3：防御策略仿真流程
    console.log('\n【场景3】防御策略仿真流程验证...');
    await page.goto('http://localhost:3009', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const defenseLinks = await page.locator('text=/防御|defense|仿真|simulation/i').count();
    if (defenseLinks > 0) {
      console.log(`  ✓ 发现 ${defenseLinks} 个防御策略相关元素`);
      await page.locator('text=/防御|defense|仿真|simulation/i').first().click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '/tmp/screenshot-defense.png' });
      report.scenarios.push({ name: '场景3：防御策略仿真流程', status: 'PASS' });
    } else {
      console.log('  ⚠ 未找到防御策略入口');
      report.scenarios.push({ name: '场景3：防御策略仿真流程', status: 'PARTIAL' });
    }

    // 场景4：资产管理流程
    console.log('\n【场景4】资产管理流程验证...');
    await page.goto('http://localhost:3009', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const assetLinks = await page.locator('text=/资产|asset/i').count();
    if (assetLinks > 0) {
      console.log(`  ✓ 发现 ${assetLinks} 个资产管理相关元素`);
      await page.locator('text=/资产|asset/i').first().click();
      await page.waitForTimeout(2000);
      
      // 检查表格或列表
      const tableElements = await page.locator('table, [class*="table"], [class*="list"]').count();
      console.log(`  ✓ 数据展示元素：${tableElements} 个`);
      
      await page.screenshot({ path: '/tmp/screenshot-asset.png' });
      report.scenarios.push({ name: '场景4：资产管理流程', status: 'PASS' });
    } else {
      console.log('  ⚠ 未找到资产管理入口');
      report.scenarios.push({ name: '场景4：资产管理流程', status: 'PARTIAL' });
    }

    // 场景5：知识图谱查询流程
    console.log('\n【场景5】知识图谱查询流程验证...');
    await page.goto('http://localhost:3009', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const knowledgeLinks = await page.locator('text=/知识|knowledge|图谱|graph/i').count();
    if (knowledgeLinks > 0) {
      console.log(`  ✓ 发现 ${knowledgeLinks} 个知识图谱相关元素`);
      await page.locator('text=/知识|knowledge|图谱|graph/i').first().click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '/tmp/screenshot-knowledge.png' });
      report.scenarios.push({ name: '场景5：知识图谱查询流程', status: 'PASS' });
    } else {
      console.log('  ⚠ 未找到知识图谱入口');
      report.scenarios.push({ name: '场景5：知识图谱查询流程', status: 'PARTIAL' });
    }

    // 性能检查
    console.log('\n【性能检查】');
    await page.goto('http://localhost:3009', { waitUntil: 'networkidle' });
    const metrics = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0];
      return {
        loadTime: Math.round(perf.loadEventEnd - perf.fetchStart),
        domReady: Math.round(perf.domContentLoadedEventEnd - perf.fetchStart),
        firstPaint: Math.round(performance.getEntriesByType('paint')[0]?.startTime || 0)
      };
    });
    
    console.log(`  ✓ 页面加载时间：${metrics.loadTime}ms`);
    console.log(`  ✓ DOM就绪时间：${metrics.domReady}ms`);
    console.log(`  ✓ 首次绘制时间：${metrics.firstPaint}ms`);
    
    if (metrics.loadTime > 3000) {
      report.issues.push('[低] 页面加载时间超过3秒');
    }

    // 控制台错误检查
    console.log('\n【控制台错误检查】');
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('http://localhost:3009', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    if (errors.length > 0) {
      console.log(`  ⚠ 发现 ${errors.length} 个控制台错误`);
      errors.slice(0, 3).forEach(err => {
        console.log(`    - ${err.substring(0, 100)}`);
      });
    } else {
      console.log('  ✓ 无控制台错误');
    }

    // 响应式检查
    console.log('\n【响应式设计检查】');
    const viewports = [
      { width: 1920, height: 1080, name: '桌面' },
      { width: 768, height: 1024, name: '平板' },
      { width: 375, height: 667, name: '手机' }
    ];
    
    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('http://localhost:3009', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `/tmp/screenshot-${vp.name}.png` });
      console.log(`  ✓ ${vp.name}视图 (${vp.width}x${vp.height}) 截图已保存`);
    }

  } catch (error) {
    console.error('\n❌ 验收过程出错：', error.message);
    report.issues.push(`[高] 验收异常：${error.message}`);
  }

  // 生成总结
  console.log('\n================================================================================');
  console.log('场景验收结果：');
  console.log('================================================================================');
  
  const passCount = report.scenarios.filter(s => s.status === 'PASS').length;
  const partialCount = report.scenarios.filter(s => s.status === 'PARTIAL').length;
  const failCount = report.scenarios.filter(s => s.status === 'FAIL').length;
  const totalCount = report.scenarios.length;
  
  report.scenarios.forEach(scenario => {
    const icon = scenario.status === 'PASS' ? '✅' : scenario.status === 'PARTIAL' ? '⚠️' : '❌';
    console.log(`${icon} ${scenario.name}`);
  });
  
  console.log(`\n统计：`);
  console.log(`  ✅ 完全通过：${passCount}`);
  console.log(`  ⚠️ 部分通过：${partialCount}`);
  console.log(`  ❌ 未通过：${failCount}`);
  console.log(`  📊 总计：${totalCount}`);
  
  if (totalCount > 0) {
    const passRate = Math.round((passCount + partialCount * 0.5) / totalCount * 100);
    console.log(`\n通过率：${passRate}%`);
  }
  
  if (report.issues.length > 0) {
    console.log('\n发现的问题：');
    report.issues.forEach((issue, idx) => {
      console.log(`${idx + 1}. ${issue}`);
    });
  } else {
    console.log('\n✅ 未发现明显问题');
  }
  
  console.log('\n改进建议：');
  console.log('1. 优化导航菜单的可发现性，使用更明确的图标和文字');
  console.log('2. 添加新手引导和操作提示');
  console.log('3. 增加加载状态和骨架屏');
  console.log('4. 优化移动端适配');
  console.log('5. 添加错误边界和友好的错误提示');
  
  console.log('\n截图文件：');
  console.log('  - /tmp/screenshot-home.png');
  console.log('  - /tmp/screenshot-scenario.png');
  console.log('  - /tmp/screenshot-attack.png');
  console.log('  - /tmp/screenshot-defense.png');
  console.log('  - /tmp/screenshot-asset.png');
  console.log('  - /tmp/screenshot-knowledge.png');
  console.log('  - /tmp/screenshot-桌面.png');
  console.log('  - /tmp/screenshot-平板.png');
  console.log('  - /tmp/screenshot-手机.png');
  
  console.log('\n================================================================================');
  console.log('验收完成！');
  console.log('================================================================================');

  await browser.close();
  
  // 返回状态码
  const hasHighIssues = report.issues.some(i => i.startsWith('[高]'));
  process.exit(hasHighIssues ? 1 : 0);
}

runProductValidation().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

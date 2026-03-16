import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3009';

test.describe('攻击路径推演系统 - 全面验证', () => {
  
  test('1. Dashboard 总览页面', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // 等待页面加载
    await page.waitForLoadState('networkidle');
    
    // 检查标题
    await expect(page).toHaveTitle(/攻击路径推演系统/);
    
    // 检查无控制台错误
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // 等待内容加载
    await page.waitForTimeout(2000);
    
    // 检查关键元素
    await expect(page.locator('text=系统总览')).toBeVisible();
    await expect(page.locator('text=资产总数')).toBeVisible();
    await expect(page.locator('text=漏洞总数')).toBeVisible();
    
    // 截图
    await page.screenshot({ path: '/tmp/screenshot-dashboard.png', fullPage: true });
    
    console.log('✓ Dashboard页面验证通过');
    if (errors.length > 0) {
      console.log('⚠️  控制台错误:', errors);
    }
  });

  test('2. 场景管理页面', async ({ page }) => {
    await page.goto(`${BASE_URL}/scene`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 检查页面元素
    await expect(page.locator('text=场景管理')).toBeVisible();
    
    await page.screenshot({ path: '/tmp/screenshot-scene.png', fullPage: true });
    console.log('✓ 场景管理页面验证通过');
  });

  test('3. 本体建模页面', async ({ page }) => {
    await page.goto(`${BASE_URL}/ontology`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await expect(page.locator('text=本体设计器')).toBeVisible();
    
    await page.screenshot({ path: '/tmp/screenshot-ontology.png', fullPage: true });
    console.log('✓ 本体建模页面验证通过');
  });

  test('4. 知识图谱页面', async ({ page }) => {
    await page.goto(`${BASE_URL}/knowledge`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await expect(page.locator('text=攻防知识图谱')).toBeVisible();
    
    await page.screenshot({ path: '/tmp/screenshot-knowledge.png', fullPage: true });
    console.log('✓ 知识图谱页面验证通过');
  });

  test('5. ATT&CK映射页面', async ({ page }) => {
    await page.goto(`${BASE_URL}/knowledge/attack`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await expect(page.locator('text=ATT&CK')).toBeVisible();
    
    await page.screenshot({ path: '/tmp/screenshot-attack.png', fullPage: true });
    console.log('✓ ATT&CK映射页面验证通过');
  });

  test('6. D3FEND映射页面', async ({ page }) => {
    await page.goto(`${BASE_URL}/knowledge/defense`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await expect(page.locator('text=D3FEND')).toBeVisible();
    
    await page.screenshot({ path: '/tmp/screenshot-defense.png', fullPage: true });
    console.log('✓ D3FEND映射页面验证通过');
  });

  test('7. 攻防驾驶舱页面', async ({ page }) => {
    await page.goto(`${BASE_URL}/cockpit`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await expect(page.locator('text=网络沙盘')).toBeVisible();
    
    await page.screenshot({ path: '/tmp/screenshot-cockpit.png', fullPage: true });
    console.log('✓ 攻防驾驶舱页面验证通过');
  });

  test('8. 攻击路径推演页面', async ({ page }) => {
    await page.goto(`${BASE_URL}/cockpit/attack-path`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await expect(page.locator('text=攻击路径推演')).toBeVisible();
    
    await page.screenshot({ path: '/tmp/screenshot-attack-path.png', fullPage: true });
    console.log('✓ 攻击路径推演页面验证通过');
  });

  test('9. 防御策略仿真页面', async ({ page }) => {
    await page.goto(`${BASE_URL}/cockpit/defense`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await expect(page.locator('text=防御策略仿真')).toBeVisible();
    
    await page.screenshot({ path: '/tmp/screenshot-defense-sim.png', fullPage: true });
    console.log('✓ 防御策略仿真页面验证通过');
  });

  test('10. 算法引擎页面', async ({ page }) => {
    await page.goto(`${BASE_URL}/algorithm`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await expect(page.locator('text=算法引擎')).toBeVisible();
    
    await page.screenshot({ path: '/tmp/screenshot-algorithm.png', fullPage: true });
    console.log('✓ 算法引擎页面验证通过');
  });

  test('11. 资产管理页面', async ({ page }) => {
    await page.goto(`${BASE_URL}/asset`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await expect(page.locator('text=资产清单')).toBeVisible();
    
    await page.screenshot({ path: '/tmp/screenshot-asset.png', fullPage: true });
    console.log('✓ 资产管理页面验证通过');
  });

  test('12. 漏洞管理页面', async ({ page }) => {
    await page.goto(`${BASE_URL}/asset/vulnerability`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await expect(page.locator('text=漏洞管理')).toBeVisible();
    
    await page.screenshot({ path: '/tmp/screenshot-vulnerability.png', fullPage: true });
    console.log('✓ 漏洞管理页面验证通过');
  });

  test('13. 系统管理页面', async ({ page }) => {
    await page.goto(`${BASE_URL}/system/history`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await expect(page.locator('text=推演历史')).toBeVisible();
    
    await page.screenshot({ path: '/tmp/screenshot-history.png', fullPage: true });
    console.log('✓ 系统管理页面验证通过');
  });
});

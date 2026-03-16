import { test, expect } from '@playwright/test';

// 测试配置
const PAGES = [
  { path: '/', name: 'Dashboard' },
  { path: '/scene', name: '场景管理' },
  { path: '/ontology', name: '本体建模' },
  { path: '/knowledge', name: '知识图谱' },
  { path: '/cockpit', name: '攻防驾驶舱' },
  { path: '/algorithm', name: '算法配置' },
  { path: '/asset', name: '资产管理' },
  { path: '/system', name: '系统管理' },
];

test.describe('页面加载测试', () => {
  for (const page of PAGES) {
    test(`${page.name} - 页面加载`, async ({ page: p }) => {
      const startTime = Date.now();
      await p.goto(page.path);
      const loadTime = Date.now() - startTime;
      
      // 检查页面加载时间 < 3秒
      expect(loadTime).toBeLessThan(3000);
      
      // 检查页面标题存在
      await expect(p).toHaveTitle(/攻击路径/);
      
      // 等待页面内容加载
      await p.waitForLoadState('networkidle', { timeout: 5000 });
    });
  }
});

test.describe('控制台错误检查', () => {
  for (const page of PAGES) {
    test(`${page.name} - 无控制台错误`, async ({ page: p }) => {
      const consoleErrors: string[] = [];
      
      p.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      await p.goto(page.path);
      await p.waitForLoadState('networkidle', { timeout: 5000 });
      
      // 过滤已知的无害错误
      const criticalErrors = consoleErrors.filter(err =>
        !err.includes('favicon') &&
        !err.includes('[antd:') &&  // 忽略Ant Design警告
        !err.includes('Warning:') && // 忽略React警告
        !err.includes('Accessing element.ref') && // 忽略React 19 ref警告
        !err.includes('ResizeObserver') &&
        !err.includes('DevTools')
      );

      expect(criticalErrors).toHaveLength(0);
    });
  }
});

test.describe('网络请求检查', () => {
  for (const page of PAGES) {
    test(`${page.name} - 无404错误`, async ({ page: p }) => {
      const failedRequests: string[] = [];
      
      p.on('response', response => {
        if (response.status() === 404) {
          failedRequests.push(response.url());
        }
      });
      
      await p.goto(page.path);
      await p.waitForLoadState('networkidle', { timeout: 5000 });
      
      expect(failedRequests).toHaveLength(0);
    });
  }
});

test.describe('导航菜单测试', () => {
  test('侧边栏导航可用', async ({ page }) => {
    await page.goto('/');
    
    // 检查侧边栏存在
    const sidebar = page.locator('.ant-layout-sider');
    await expect(sidebar).toBeVisible();
    
    // 检查菜单项
    const menuItems = page.locator('.ant-menu-item');
    const count = await menuItems.count();
    expect(count).toBeGreaterThan(0);
  });
  
  test('菜单导航功能', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 先展开场景管理分组（如果是折叠的）
    const sceneGroup = page.locator('text=场景管理').first();
    await sceneGroup.click();
    await page.waitForTimeout(500);

    // 点击场景列表
    const sceneList = page.locator('text=场景列表').first();
    if (await sceneList.count() > 0) {
      await sceneList.click();
      await page.waitForURL('**/scene', { timeout: 10000 });
      expect(page.url()).toContain('/scene');
    }
  });
});

test.describe('Dashboard页面功能', () => {
  test('统计卡片渲染', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // 等待React渲染

    // 检查统计卡片
    const statCards = page.locator('.ant-statistic');
    const count = await statCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('图表渲染', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 等待图表容器
    await page.waitForSelector('canvas, svg', { timeout: 10000 });

    // 检查图表元素存在
    const charts = page.locator('canvas, svg');
    const count = await charts.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('场景管理页面功能', () => {
  test('页面内容渲染', async ({ page }) => {
    await page.goto('/scene');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // 等待React渲染

    // 检查卡片布局存在（场景管理使用卡片布局）
    const cards = page.locator('.ant-card');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);
  });
  
  test('新增按钮可点击', async ({ page }) => {
    await page.goto('/scene');
    
    // 查找新增按钮
    const addButton = page.locator('button:has-text("新增"), button:has-text("添加")').first();
    if (await addButton.count() > 0) {
      await expect(addButton).toBeEnabled();
    }
  });
  
  test('搜索功能', async ({ page }) => {
    await page.goto('/scene');
    
    // 查找搜索框
    const searchInput = page.locator('input[placeholder*="搜索"], input[placeholder*="查询"]').first();
    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible();
      await searchInput.fill('测试');
    }
  });
});

test.describe('本体建模页面功能', () => {
  test('图谱容器渲染', async ({ page }) => {
    await page.goto('/ontology');
    
    // 等待图谱容器
    await page.waitForTimeout(2000);
    
    // 检查canvas或svg元素
    const graphContainer = page.locator('canvas, svg').first();
    await expect(graphContainer).toBeVisible();
  });
  
  test('图谱元素存在', async ({ page }) => {
    await page.goto('/ontology');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // 等待React渲染

    // 检查图谱相关元素（canvas或svg）
    const graphElements = page.locator('canvas, svg');
    const count = await graphElements.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('知识图谱页面功能', () => {
  test('图谱渲染', async ({ page }) => {
    await page.goto('/knowledge');
    
    // 等待图谱加载
    await page.waitForTimeout(2000);
    
    // 检查图谱容器
    const graphElement = page.locator('canvas, svg').first();
    await expect(graphElement).toBeVisible();
  });
});

test.describe('攻防驾驶舱页面功能', () => {
  test('驾驶舱布局', async ({ page }) => {
    await page.goto('/cockpit');
    
    // 等待内容加载
    await page.waitForTimeout(2000);
    
    // 检查是否有图表或数据展示
    const hasContent = await page.locator('canvas, svg, .ant-statistic, .ant-card').count();
    expect(hasContent).toBeGreaterThan(0);
  });
});

test.describe('算法配置页面功能', () => {
  test('页面加载完成', async ({ page }) => {
    await page.goto('/algorithm');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // 等待React渲染

    // 检查页面已加载（至少有基本布局）
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // 页面标题正确
    await expect(page).toHaveTitle(/攻击路径/);
  });
});

test.describe('资产管理页面功能', () => {
  test('资产列表渲染', async ({ page }) => {
    await page.goto('/asset');
    
    // 检查表格
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();
  });
  
  test('资产操作按钮', async ({ page }) => {
    await page.goto('/asset');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // 等待React渲染

    // 检查操作按钮
    const buttons = page.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('系统管理页面功能', () => {
  test('页面加载完成', async ({ page }) => {
    await page.goto('/system');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // 等待React渲染

    // 检查页面已加载（至少有基本布局）
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // 页面标题正确
    await expect(page).toHaveTitle(/攻击路径/);
  });
});

test.describe('响应式测试', () => {
  test('移动端视口', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // 检查页面可访问
    await expect(page).toHaveTitle(/攻击路径/);
  });
  
  test('平板视口', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    // 检查页面可访问
    await expect(page).toHaveTitle(/攻击路径/);
  });
});

test.describe('性能测试', () => {
  test('首页性能指标', async ({ page }) => {
    await page.goto('/');
    
    // 获取性能指标
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      };
    });
    
    // DOM加载应该快速
    expect(performanceMetrics.domContentLoaded).toBeLessThan(2000);
  });
});

import { test } from '@playwright/test';

// 检查页面实际布局
test.describe('页面布局检查', () => {
  test('场景管理页面布局', async ({ page }) => {
    await page.goto('/scene');
    await page.waitForLoadState('networkidle');
    
    // 获取页面HTML结构
    const html = await page.content();
    console.log('=== 场景管理页面 ===');
    
    // 检查各种可能的元素
    const hasTable = await page.locator('.ant-table').count();
    const hasCard = await page.locator('.ant-card').count();
    const hasList = await page.locator('.ant-list').count();
    const hasEmpty = await page.locator('.ant-empty').count();
    
    console.log('ant-table:', hasTable);
    console.log('ant-card:', hasCard);
    console.log('ant-list:', hasList);
    console.log('ant-empty:', hasEmpty);
  });
  
  test('本体建模页面布局', async ({ page }) => {
    await page.goto('/ontology');
    await page.waitForTimeout(2000);
    
    console.log('=== 本体建模页面 ===');
    
    const hasButtons = await page.locator('button').count();
    const hasCanvas = await page.locator('canvas').count();
    const hasSvg = await page.locator('svg').count();
    
    console.log('buttons:', hasButtons);
    console.log('canvas:', hasCanvas);
    console.log('svg:', hasSvg);
  });
  
  test('算法配置页面布局', async ({ page }) => {
    await page.goto('/algorithm');
    await page.waitForLoadState('networkidle');
    
    console.log('=== 算法配置页面 ===');
    
    const hasTable = await page.locator('.ant-table').count();
    const hasForm = await page.locator('.ant-form').count();
    const hasCard = await page.locator('.ant-card').count();
    const hasEmpty = await page.locator('.ant-empty').count();
    
    console.log('ant-table:', hasTable);
    console.log('ant-form:', hasForm);
    console.log('ant-card:', hasCard);
    console.log('ant-empty:', hasEmpty);
  });
  
  test('系统管理页面布局', async ({ page }) => {
    await page.goto('/system');
    await page.waitForLoadState('networkidle');
    
    console.log('=== 系统管理页面 ===');
    
    const hasCard = await page.locator('.ant-card').count();
    const hasForm = await page.locator('.ant-form').count();
    const hasTable = await page.locator('.ant-table').count();
    const hasEmpty = await page.locator('.ant-empty').count();
    
    console.log('ant-card:', hasCard);
    console.log('ant-form:', hasForm);
    console.log('ant-table:', hasTable);
    console.log('ant-empty:', hasEmpty);
  });
});

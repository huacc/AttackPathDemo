import { test, expect } from '@playwright/test';

// 快速冒烟测试
test.describe('快速冒烟测试', () => {
  test('首页可访问', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/攻击路径/);
  });
  
  test('所有页面可访问', async ({ page }) => {
    const pages = ['/', '/scene', '/ontology', '/knowledge', '/cockpit', '/algorithm', '/asset', '/system'];
    
    for (const path of pages) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
    }
  });
});

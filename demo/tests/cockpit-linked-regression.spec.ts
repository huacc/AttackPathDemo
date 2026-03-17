import { test, expect, Page } from '@playwright/test';

const COCKPIT_BASE_URL = process.env.COCKPIT_BASE_URL;
const toUrl = (path: string) => (COCKPIT_BASE_URL ? `${COCKPIT_BASE_URL}${path}` : path);

const LAYER_RADIO_TEST_IDS = [
  'cockpit-layer-business-radio',
  'cockpit-layer-network-radio',
  'cockpit-layer-attack-radio'
] as const;

const cycleSelectNext = async (page: Page, testId: string) => {
  const select = page.locator(`[data-testid="${testId}"] .ant-select-selector`).first();
  await expect(select).toBeVisible();
  await select.click({ force: true });
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
};

const openControlPanel = async (page: Page) => {
  await page.getByTestId('cockpit-open-control-panel-btn').click();
  await expect(page.getByTestId('cockpit-control-drawer')).toBeVisible();
};

const assertCanvasNotBlank = async (page: Page) => {
  await page.waitForSelector('canvas', { timeout: 15000 });
  const result = await page.evaluate(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
    if (!canvas) {
      return { ok: false, uniqueColorBuckets: 0, nonLightPixels: 0 };
    }

    const ctx = canvas.getContext('2d');
    if (!ctx || canvas.width === 0 || canvas.height === 0) {
      return { ok: false, uniqueColorBuckets: 0, nonLightPixels: 0 };
    }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const stepX = Math.max(1, Math.floor(canvas.width / 35));
    const stepY = Math.max(1, Math.floor(canvas.height / 25));
    const unique = new Set<string>();
    let nonLight = 0;

    for (let y = 0; y < canvas.height; y += stepY) {
      for (let x = 0; x < canvas.width; x += stepX) {
        const idx = (y * canvas.width + x) * 4;
        const r = imageData[idx];
        const g = imageData[idx + 1];
        const b = imageData[idx + 2];
        const a = imageData[idx + 3];

        const bucket = `${Math.floor(r / 16)}-${Math.floor(g / 16)}-${Math.floor(b / 16)}-${Math.floor(a / 64)}`;
        unique.add(bucket);

        if (!(r > 240 && g > 240 && b > 240)) {
          nonLight += 1;
        }
      }
    }

    return {
      ok: true,
      uniqueColorBuckets: unique.size,
      nonLightPixels: nonLight
    };
  });

  expect(result.ok).toBeTruthy();
  expect(result.uniqueColorBuckets).toBeGreaterThan(5);
  expect(result.nonLightPixels).toBeGreaterThan(20);
};

test.describe('Cockpit Linked Regression', () => {
  test('legacy cockpit routes should redirect to unified cockpit mode', async ({ page }) => {
    await page.goto(toUrl('/cockpit/attack-path'));
    await expect(page).toHaveURL(/\/cockpit\?mode=attack/);

    await page.goto(toUrl('/cockpit/defense'));
    await expect(page).toHaveURL(/\/cockpit\?mode=defense/);
  });

  test('layer and model switching should keep canvas stable (20 cycles)', async ({ page }) => {
    test.setTimeout(120000);

    await page.goto(toUrl('/cockpit?mode=linked'));
    await page.waitForLoadState('networkidle');
    await openControlPanel(page);
    await assertCanvasNotBlank(page);

    for (let i = 0; i < 20; i += 1) {
      await openControlPanel(page);
      const layerRadioTestId = LAYER_RADIO_TEST_IDS[i % LAYER_RADIO_TEST_IDS.length];
      await page.getByTestId(layerRadioTestId).evaluate((el: HTMLInputElement) => el.click());

      if (i % 4 === 0) {
        await cycleSelectNext(page, 'cockpit-model-select');
      }

      if (i % 5 === 0) {
        await page.getByTestId('cockpit-layer-business-checkbox').evaluate((el: HTMLInputElement) => el.click());
        await page.getByTestId('cockpit-layer-business-checkbox').evaluate((el: HTMLInputElement) => el.click());
      }

      await assertCanvasNotBlank(page);
    }
  });

  test('linked simulation should render attack path and defense effect outcomes', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto(toUrl('/cockpit?mode=linked'));
    await page.waitForLoadState('networkidle');
    await openControlPanel(page);

    await expect(page.getByTestId('cockpit-linked-attack-select')).toBeVisible();
    await expect(page.getByTestId('cockpit-linked-defense-select')).toBeVisible();

    await page.getByTestId('cockpit-run-simulation-btn').click();

    await expect(page.getByTestId('cockpit-simulation-summary')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.ant-list-item .ant-tag').first()).toBeVisible({ timeout: 10000 });
    await assertCanvasNotBlank(page);
  });
});

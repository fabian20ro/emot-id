import { test, expect } from '@playwright/test'

test.describe('Mobile layout 393x742', () => {
  test.use({ viewport: { width: 393, height: 742 } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem('emot-id-onboarded', 'true')
      localStorage.setItem('emot-id-language', 'ro')
    })
    await page.reload()
    await page.waitForLoadState('networkidle')
  })

  test('BodyMap keeps head/feet inside visualization and neck connected', async ({ page }) => {
    await page.locator('header').getByRole('button', { name: /Corp|Body/i }).first().click()
    await page.waitForTimeout(350)

    const vizHost = page.locator('div.relative.flex-1.min-h-0').first()
    const head = page.locator('[data-region="head"]').first()
    const feet = page.locator('[data-region="feet"]').first()
    const throat = page.locator('[data-region="throat"]').first()
    const shoulders = page.locator('[data-region="shoulders"]').first()

    await expect(head).toBeVisible()
    await expect(feet).toBeVisible()
    await expect(throat).toBeVisible()
    await expect(shoulders).toBeVisible()

    const vizBox = await vizHost.boundingBox()
    const headBox = await head.boundingBox()
    const feetBox = await feet.boundingBox()
    const throatBox = await throat.boundingBox()
    const shouldersBox = await shoulders.boundingBox()

    expect(vizBox).not.toBeNull()
    expect(headBox).not.toBeNull()
    expect(feetBox).not.toBeNull()
    expect(throatBox).not.toBeNull()
    expect(shouldersBox).not.toBeNull()

    expect(headBox!.y).toBeGreaterThanOrEqual(vizBox!.y - 1)
    expect(feetBox!.y + feetBox!.height).toBeLessThanOrEqual(vizBox!.y + vizBox!.height + 1)

    // Visual continuity: neck should touch/overlap shoulder block.
    expect(throatBox!.y + throatBox!.height).toBeGreaterThanOrEqual(shouldersBox!.y - 1)
  })

  test('Dimensional suggestions render below plot without overlap', async ({ page }) => {
    await page.locator('header').getByRole('button', { name: /Spa(ț|t)iu|Space/i }).first().click()
    await page.waitForTimeout(350)

    const plot = page.locator('[data-testid="dimensional-plot-container"] svg').first()
    await expect(plot).toBeVisible()
    const plotBox = await plot.boundingBox()
    expect(plotBox).not.toBeNull()

    await page.mouse.click(plotBox!.x + plotBox!.width * 0.5, plotBox!.y + plotBox!.height * 0.85)
    await page.waitForTimeout(250)

    const tray = page.getByTestId('dimensional-suggestion-tray')
    await expect(tray).toBeVisible()
    const trayBox = await tray.boundingBox()
    expect(trayBox).not.toBeNull()

    expect(trayBox!.y).toBeGreaterThanOrEqual(plotBox!.y + plotBox!.height)

    const chips = tray.locator('button')
    const count = await chips.count()
    expect(count).toBeGreaterThan(0)

    const firstChip = await chips.first().boundingBox()
    expect(firstChip).not.toBeNull()
    // Browser rounding may return 47.9999 for a 48px CSS min-height.
    expect(firstChip!.height).toBeGreaterThanOrEqual(47.5)
  })
})

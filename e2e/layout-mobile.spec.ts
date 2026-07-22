import { test, expect, type Page } from '@playwright/test'
import { openApp, openArrival } from './helpers'

const viewports = [
  { width: 360, height: 800 },
  { width: 393, height: 742 },
  { width: 430, height: 932 },
]

async function expectNoHorizontalOverflow(page: Page) {
  const metrics = await page.locator('.app-shell').evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    height: element.getBoundingClientRect().height,
  }))
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1)
  expect(metrics.height).toBe(page.viewportSize()!.height)
}

for (const viewport of viewports) {
  test.describe(`mobile ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport })

    test('Today and Arrival keep navigation and controls in bounds', async ({ page }) => {
      await openApp(page)
      await expectNoHorizontalOverflow(page)

      const primary = await page.getByRole('button', { name: 'Start a check-in' }).boundingBox()
      expect(primary!.height).toBeGreaterThanOrEqual(55)

      let nav = await page.locator('.bottom-nav').boundingBox()
      expect(nav!.y + nav!.height).toBeLessThanOrEqual(viewport.height + 1)

      await openArrival(page)
      await expectNoHorizontalOverflow(page)
      nav = await page.locator('.bottom-nav').boundingBox()
      expect(nav!.y + nav!.height).toBeLessThanOrEqual(viewport.height + 1)

      const cards = page.locator('.route-card')
      for (let index = 0; index < await cards.count(); index++) {
        const box = await cards.nth(index).boundingBox()
        expect(box!.width).toBeLessThanOrEqual(viewport.width - 32)
        expect(box!.height).toBeGreaterThanOrEqual(80)
      }
    })

    test('Affect suggestions remain below the plot without overlap', async ({ page }) => {
      await openApp(page)
      await openArrival(page)
      await page.getByTestId('arrival-affect').click()
      const plot = page.getByTestId('dimensional-plot-container').locator('svg')
      const plotBox = await plot.boundingBox()
      expect(plotBox).not.toBeNull()
      await plot.click({ position: { x: plotBox!.width * 0.5, y: plotBox!.height * 0.7 }, force: true })
      const tray = page.getByTestId('dimensional-suggestion-tray')
      await expect(tray).toBeVisible()
      const trayBox = await tray.boundingBox()
      expect(trayBox!.y).toBeGreaterThanOrEqual(plotBox!.y + plotBox!.height - 1)
      await expectNoHorizontalOverflow(page)
    })
  })
}

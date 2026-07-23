import { test, expect } from '@playwright/test'
import { openApp, openArrival } from './helpers'

test.describe('Word Ladder route', () => {
  test('protects the draft and returns one hierarchy level at a time', async ({ page }) => {
    await openApp(page)
    await openArrival(page)
    await page.getByTestId('arrival-words').click()

    await expect(page.getByRole('button', { name: 'Settings' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Back' })).toBeVisible()
    await page.getByRole('button', { name: 'Happy' }).click()
    await page.getByRole('button', { name: 'Playful' }).click()
    await expect(page.getByRole('button', { name: 'Use Happy' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Use Playful' })).toBeVisible()

    await page.getByRole('button', { name: 'Back one level' }).click()
    await expect(page.getByRole('button', { name: 'Use Happy' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Use Playful' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Playful' })).toBeVisible()

    await page.getByRole('button', { name: 'Back one level' }).click()
    await expect(page.getByRole('button', { name: 'Happy' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Back one level' })).toHaveCount(0)
  })

  test('selects a broad path level and keeps Reflection interruption-free', async ({ page }) => {
    await openApp(page)
    await openArrival(page)
    await page.getByTestId('arrival-words').click()
    await page.getByRole('button', { name: 'Happy' }).click()
    await page.getByRole('button', { name: 'Playful' }).click()
    await page.getByRole('button', { name: 'Use Happy' }).click()

    const selected = page.getByRole('region', { name: 'Selected words' })
    await expect(selected).toContainText('Happy')
    const action = page.getByRole('button', { name: 'Use my current choice' })
    await expect(action).toBeEnabled()
    await action.click()

    await expect(page.getByTestId('reflection-screen')).toBeVisible()
    await expect(page.locator('.emotion-heading')).toContainText('Happy')
    await expect(page.getByRole('button', { name: 'Settings' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Back' })).toBeVisible()
  })

  test('localizes hierarchy controls and stays within the mobile viewport', async ({ page }) => {
    await openApp(page, { language: 'ro', theme: 'dark' })
    await openArrival(page)
    await page.getByTestId('arrival-words').click()
    await page.getByRole('button', { name: 'Fericit' }).click()

    await expect(page.getByRole('button', { name: 'Folosiți Fericit' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Înapoi cu un nivel' })).toBeVisible()
    const overflow = await page.locator('.app-shell').evaluate((element) => element.scrollWidth - element.clientWidth)
    expect(overflow).toBeLessThanOrEqual(1)
    const levelBack = await page.getByRole('button', { name: 'Înapoi cu un nivel' }).boundingBox()
    expect(levelBack!.height).toBeGreaterThanOrEqual(44)
  })
})

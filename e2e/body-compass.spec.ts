import { expect, test, type Page } from '@playwright/test'
import { openApp, openArrival } from './helpers'

async function openBodyCompass(page: Page) {
  await openArrival(page)
  await page.getByTestId('arrival-body').click()
  await expect(page.getByTestId('body-screen')).toBeVisible()
}

async function chooseChestSignal(page: Page) {
  await page.locator('[data-region="chest"]').first().click({ force: true })
  await page.getByRole('button', { name: 'Tension' }).click()
  await page.getByRole('button', { name: /moderate/i }).click()
  await expect(page.getByTestId('body-signal-chest')).toContainText('Tension - Moderate')
}

test.describe('Body Compass staged route', () => {
  test.beforeEach(async ({ page }) => openApp(page))

  test('moves through area, sensation, intensity, and review into Reflection', async ({ page }) => {
    await openBodyCompass(page)
    await expect(page.locator('.body-progress [aria-current="step"]')).toContainText('Area')

    await page.locator('[data-region="chest"]').first().click({ force: true })
    await expect(page.getByRole('heading', { name: 'What do you feel here?' })).toBeVisible()
    await expect(page.locator('.body-progress [aria-current="step"]')).toContainText('Sensation')

    await page.getByRole('button', { name: 'Tension' }).click()
    await expect(page.getByRole('heading', { name: 'How intense?' })).toBeVisible()
    await expect(page.locator('.body-progress [aria-current="step"]')).toContainText('Intensity')

    await page.getByRole('button', { name: /moderate/i }).click()
    await expect(page.getByRole('heading', { name: 'Review your body signals' })).toBeVisible()
    await page.getByRole('button', { name: 'See what might fit' }).click()
    await expect(page.getByTestId('reflection-screen')).toBeVisible()
    await expect(page.getByTestId('reflection-screen')).toContainText(/anxiety/i)
  })

  test('supports body side, step back, draft skip, and a no-signal exit', async ({ page }) => {
    await openBodyCompass(page)
    await page.getByRole('button', { name: 'Back', exact: true }).nth(1).click()
    await expect(page.locator('[data-region="upper-back"]')).toHaveCount(1)
    await page.getByRole('button', { name: 'Front', exact: true }).click()

    await page.locator('[data-region="chest"]').first().click({ force: true })
    await page.getByRole('button', { name: 'Tension' }).click()
    await page.locator('.screen-back').click()
    await expect(page.getByRole('heading', { name: 'What do you feel here?' })).toBeVisible()

    await page.getByRole('button', { name: 'Choose another area' }).click()
    await expect(page.getByRole('heading', { name: 'Where do you notice it?' })).toBeVisible()
    await page.getByRole('button', { name: 'I do not notice anything right now' }).click()
    await expect(page.getByTestId('arrival-screen')).toBeVisible()
  })

  test('edits and removes signals without duplicating a body region', async ({ page }) => {
    await openBodyCompass(page)
    await chooseChestSignal(page)

    await page.getByRole('button', { name: 'Edit Chest' }).click()
    await page.getByRole('button', { name: 'Warmth' }).click()
    await page.getByRole('button', { name: /strong/i }).click()
    await expect(page.getByTestId('body-signal-chest')).toContainText('Warmth - Strong')
    await expect(page.locator('[data-testid="body-signal-chest"]')).toHaveCount(1)

    await page.getByRole('button', { name: 'Add another area' }).click()
    await page.getByRole('button', { name: 'Stomach' }).click()
    await page.getByRole('button', { name: 'Tension' }).click()
    await page.getByRole('button', { name: /moderate/i }).click()
    await expect(page.getByTestId('body-signal-stomach')).toBeVisible()

    await page.getByRole('button', { name: 'Remove Stomach' }).click()
    await expect(page.getByTestId('body-signal-stomach')).toHaveCount(0)
    await expect(page.getByTestId('body-signal-chest')).toBeVisible()
  })
})

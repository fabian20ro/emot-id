import { expect, test } from '@playwright/test'
import { openApp } from './helpers'

test.describe('Migrated guided workflows', () => {
  test('uses direct Today copy and routes vocabulary practice as a screen', async ({ page }) => {
    await openApp(page)
    await expect(page.getByRole('heading', { name: 'How are you feeling?' })).toBeVisible()
    await expect(page.getByText('Choose the closest feeling below, or explore it in more detail.')).toBeVisible()

    await page.getByRole('button', { name: 'Explore' }).click()
    await page.getByRole('button', { name: /practice emotional vocabulary/i }).click()
    await expect(page.getByTestId('granularity-screen')).toBeVisible()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.getByText('Step 1 of 5')).toBeVisible()

    const firstOption = page.getByRole('button', { name: 'anxiety' })
    expect((await firstOption.boundingBox())!.height).toBeGreaterThanOrEqual(54)
    await firstOption.click()
    await expect(page.getByRole('status')).toContainText(/You chose anxiety/i)
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByText('Step 2 of 5')).toBeVisible()
    await page.getByRole('button', { name: 'Back' }).click()
    await expect(page.getByTestId('explore-screen')).toBeVisible()
  })

  test('routes Unpack a moment as a screen and preserves step input', async ({ page }) => {
    await openApp(page)
    await page.getByRole('button', { name: 'Journal' }).click()
    await page.getByRole('button', { name: 'Unpack a moment' }).click()
    await expect(page.getByTestId('chain-screen')).toBeVisible()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.getByText('Step 1 of 7')).toBeVisible()

    const previous = page.getByRole('button', { name: 'Previous step' })
    await expect(previous).toBeDisabled()
    await page.getByRole('textbox').fill('A difficult message')
    await page.getByRole('button', { name: 'Next' }).click()
    await expect(page.getByText('Step 2 of 7')).toBeVisible()
    await previous.click()
    await expect(page.getByRole('textbox')).toHaveValue('A difficult message')
    await page.getByRole('button', { name: 'Back' }).click()
    await expect(page.getByTestId('journal-screen')).toBeVisible()
  })

  test('shows the revised Today copy in Romanian', async ({ page }) => {
    await openApp(page, { language: 'ro' })
    await expect(page.getByRole('heading', { name: 'Cum vă simțiți?' })).toBeVisible()
    await expect(page.getByText('Alegeți starea cea mai apropiată de mai jos sau explorați-o mai în detaliu.')).toBeVisible()
  })
})

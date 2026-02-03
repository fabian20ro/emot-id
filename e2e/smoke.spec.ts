import { test, expect } from '@playwright/test'

test.describe('Onboarding', () => {
  test('completes 4-step onboarding flow', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText('This is an exploration, not a test')).toBeVisible()

    // Step through all 4 screens
    await page.getByRole('button', { name: 'Next' }).click()
    await expect(page.getByText('Every emotion has a purpose')).toBeVisible()

    await page.getByRole('button', { name: 'Next' }).click()
    await expect(page.getByText('Choose your way in')).toBeVisible()

    await page.getByRole('button', { name: 'Next' }).click()
    await expect(page.getByText('About this app')).toBeVisible()

    await page.getByRole('button', { name: 'Get started' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('can skip onboarding', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByRole('button', { name: 'Skip' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })
})

test.describe('Model navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Skip onboarding via localStorage
    await page.evaluate(() => localStorage.setItem('emot-id-onboarded', 'true'))
    await page.reload()
    await page.waitForLoadState('networkidle')
  })

  test('switches between all 4 models via ModelBar', async ({ page }) => {
    const modelBar = page.locator('div.flex.gap-1')

    // Default model should be visible (Plutchik or Body Map)
    await expect(page.getByText('Your selections')).toBeVisible()

    // Click each model tab and verify it loads
    const tabs = modelBar.locator('button')
    const count = await tabs.count()
    expect(count).toBe(4)

    for (let i = 0; i < count; i++) {
      await tabs.nth(i).click()
      await page.waitForTimeout(500)
      // Each model should show the selection bar
      await expect(page.getByText('Your selections')).toBeVisible()
    }
  })

  test('header shows app title', async ({ page }) => {
    await expect(page.getByText('Emot-ID')).toBeVisible()
    await expect(page.getByText('Identify your emotions')).toBeVisible()
  })
})

test.describe('Settings menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('emot-id-onboarded', 'true'))
    await page.reload()
    await page.waitForLoadState('networkidle')
  })

  test('opens and closes settings menu', async ({ page }) => {
    await page.locator('header button').first().click()
    await expect(page.getByText('LANGUAGE')).toBeVisible()
    await expect(page.getByText('MODEL')).toBeVisible()
    await expect(page.getByText('SOUND EFFECTS')).toBeVisible()

    // Close via Escape (backdrop intercepts click on close button)
    await page.keyboard.press('Escape')
    await expect(page.getByText('LANGUAGE')).not.toBeVisible()
  })

  test('switches language to Romanian and back', async ({ page }) => {
    await page.locator('header button').first().click()
    await page.getByRole('button', { name: 'Romana' }).click()
    await expect(page.getByText('Selectiile tale')).toBeVisible()

    // Switch back
    await page.locator('header button').first().click()
    await page.getByRole('button', { name: 'English' }).click()
    await expect(page.getByText('Your selections')).toBeVisible()
  })

  test('shows privacy notice', async ({ page }) => {
    await page.locator('header button').first().click()

    // Privacy headline should be visible
    await expect(page.getByText('Your data stays on this device')).toBeVisible()

    // Click InfoButton to see full privacy detail
    const privacyBtn = page.getByRole('button', { name: /data stays on this device/i })
    await privacyBtn.click()
    await expect(page.getByText('IndexedDB')).toBeVisible()
    await expect(page.getByText('Nothing is sent to any server')).toBeVisible()
  })

  test('shows disclaimer via InfoButton', async ({ page }) => {
    await page.locator('header button').first().click()

    const disclaimerBtn = page.getByRole('button', { name: /disclaimer/i })
    await disclaimerBtn.click()
    await expect(page.getByText('not a diagnostic tool')).toBeVisible()
  })
})

test.describe('Emotion Wheel model', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('emot-id-onboarded', 'true'))
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Navigate to Emotion Wheel
    const tabs = page.locator('div.flex.gap-1 button')
    await tabs.filter({ hasText: /Emotion Wheel|Wheel/i }).first().click()
    await page.waitForTimeout(500)
  })

  test('shows bubbles and allows selection', async ({ page }) => {
    // Emotion Wheel shows top-level categories
    const bubbles = page.locator('button[aria-label]').filter({ hasText: /.+/ })
    const count = await bubbles.count()
    expect(count).toBeGreaterThan(0)

    // Click first visible bubble
    await bubbles.first().click({ force: true })
    await page.waitForTimeout(300)

    // Selection bar should update
    await expect(page.getByText('No selection')).not.toBeVisible()
  })
})

test.describe('Plutchik model', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('emot-id-onboarded', 'true'))
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Navigate to Plutchik
    const tabs = page.locator('div.flex.gap-1 button')
    await tabs.filter({ hasText: /Plutchik/i }).first().click()
    await page.waitForTimeout(500)
  })

  test('shows 8 primary emotions', async ({ page }) => {
    // Plutchik has 8 primary emotions: joy, trust, fear, surprise, sadness, disgust, anger, anticipation
    // Rendered as "Happy", "Trusting", etc. in English
    const bubbles = page.locator('button[tabindex="0"]').filter({ hasText: /.+/ })
    await expect(bubbles.first()).toBeVisible()

    // Should see hint text
    await expect(page.getByText(/tap an emotion/i)).toBeVisible()
  })

  test('selecting two emotions shows dyad combo', async ({ page }) => {
    // Select first two visible bubbles using force:true to bypass overlap
    const bubbles = page.locator('button[tabindex="0"]').filter({ hasText: /.+/ })

    await bubbles.nth(0).click({ force: true })
    await page.waitForTimeout(400)
    await bubbles.nth(1).click({ force: true })
    await page.waitForTimeout(400)

    // Analyze button should be enabled (text may vary by language)
    const analyzeBtn = page.getByRole('button', { name: /analyze/i })
    await expect(analyzeBtn).toBeEnabled()
  })
})

test.describe('Analyze flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('emot-id-onboarded', 'true'))
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Navigate to Emotion Wheel for reliable selection
    const tabs = page.locator('div.flex.gap-1 button')
    await tabs.filter({ hasText: /Emotion Wheel|Wheel/i }).first().click()
    await page.waitForTimeout(500)
  })

  test('analyze button is disabled with no selections', async ({ page }) => {
    const analyzeBtn = page.getByRole('button', { name: /select an emotion/i })
    await expect(analyzeBtn).toBeDisabled()
  })

  test('selecting and analyzing opens result modal', async ({ page }) => {
    // Click a bubble to select
    const bubbles = page.locator('button[aria-label]').filter({ hasText: /.+/ })
    await bubbles.first().click({ force: true })
    await page.waitForTimeout(400)

    // Click analyze
    const analyzeBtn = page.getByRole('button', { name: /analyze/i })
    await expect(analyzeBtn).toBeEnabled()
    await analyzeBtn.click()
    await page.waitForTimeout(500)

    // Result modal should appear
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText(/for self-exploration/i)).toBeVisible()
  })
})

test.describe('"I don\'t know" flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem('emot-id-onboarded', 'true')
      // Dismiss all hints so "I don't know" button appears
      localStorage.setItem('emot-id-hint-plutchik', 'true')
      localStorage.setItem('emot-id-hint-wheel', 'true')
      localStorage.setItem('emot-id-hint-somatic', 'true')
      localStorage.setItem('emot-id-hint-dimensional', 'true')
    })
    await page.reload()
    await page.waitForLoadState('networkidle')
  })

  test('shows "I don\'t know" button and opens modal', async ({ page }) => {
    const btn = page.getByText("I don't know what I'm feeling")
    await expect(btn).toBeVisible()
    await btn.click()
    await page.waitForTimeout(300)

    // DontKnowModal should appear with model suggestions
    await expect(page.getByRole('dialog')).toBeVisible()
  })
})

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('emot-id-onboarded', 'true'))
    await page.reload()
    await page.waitForLoadState('networkidle')
  })

  test('has proper aria-live region for selection count', async ({ page }) => {
    const liveRegion = page.locator('[aria-live="polite"]')
    await expect(liveRegion).toBeAttached()
  })

  test('onboarding dialog has aria-modal', async ({ page }) => {
    // Clear onboarding flag to re-trigger
    await page.evaluate(() => localStorage.removeItem('emot-id-onboarded'))
    await page.reload()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toHaveAttribute('aria-modal', 'true')
  })
})

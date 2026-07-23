import { test, expect } from '@playwright/test'
import { completeQuick, finishReflection, openApp, openArrival } from './helpers'

test.describe('First run and shell', () => {
  test('completes onboarding without selecting a theory', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('dialog')).toContainText(/exploration, not a test/i)
    await page.getByRole('button', { name: 'Next' }).click()
    await expect(page.getByRole('dialog')).toContainText(/every emotion has a purpose/i)
    await page.getByRole('button', { name: 'Next' }).click()
    await expect(page.getByRole('heading', { name: 'Privacy & data' })).toBeVisible()
    await expect(page.getByRole('dialog')).not.toContainText(/Plutchik|Emotion Wheel/)
    await page.getByRole('button', { name: 'Get started' }).click()
    await expect(page.getByTestId('today-screen')).toBeVisible()
  })

  test('navigates Today, Explore, Journal and supports browser Back', async ({ page }) => {
    await openApp(page)
    await page.getByRole('button', { name: 'Start a check-in' }).click()
    await expect(page.getByTestId('arrival-screen')).toBeVisible()
    await page.goBack()
    await expect(page.getByTestId('today-screen')).toBeVisible()

    await page.getByRole('button', { name: 'Explore' }).click()
    await expect(page.getByTestId('explore-screen')).toBeVisible()
    await page.getByRole('button', { name: 'Journal', exact: true }).click()
    await expect(page.getByTestId('journal-screen')).toBeVisible()
  })

  test('switches language and shows offline state', async ({ page, context }) => {
    await openApp(page)
    await page.getByRole('button', { name: 'Settings' }).click()
    await page.getByRole('button', { name: 'RO' }).click()
    await expect(page.getByRole('heading', { name: 'Setări' })).toBeVisible()
    await page.getByRole('button', { name: 'Înapoi' }).click()
    await expect(page.getByRole('button', { name: 'Astăzi' })).toBeVisible()

    await context.setOffline(true)
    await expect(page.getByRole('status')).toContainText(/offline/i)
    await context.setOffline(false)
  })
})

test.describe('Primary check-in routes', () => {
  test.beforeEach(async ({ page }) => openApp(page))

  test('quick feeling reaches Meaning + Need and saves to Journal', async ({ page }) => {
    await completeQuick(page, 'anxiety')
    await expect(page.getByRole('heading', { name: 'What may be here' })).toBeVisible()
    await expect(page.getByText(/best judge of what fits/i)).toBeVisible()
    await page.getByRole('button', { name: 'Yes' }).click()
    await finishReflection(page)

    await page.getByRole('button', { name: 'Journal', exact: true }).click()
    await expect(page.getByTestId('journal-screen')).toContainText(/anxiety/i)
    await page.getByRole('button', { name: /open reflection: anxiety/i }).click()
    await expect(page.getByTestId('session-detail-screen')).toContainText(/yes/i)
  })

  test('does not persist when local saving is disabled', async ({ page }) => {
    await page.getByRole('button', { name: 'Settings' }).click()
    await page.getByRole('button', { name: 'Privacy & data' }).click()
    await page.getByRole('switch', { name: 'Save completed check-ins' }).click()
    await page.getByRole('button', { name: 'Back' }).click()
    await page.getByRole('button', { name: 'Back' }).click()
    await completeQuick(page, 'joy')
    await finishReflection(page)
    await page.getByRole('button', { name: 'Journal', exact: true }).click()
    await expect(page.getByText('No saved reflections yet')).toBeVisible()
  })

  test('Body Compass collects region, sensation, intensity and reflects', async ({ page }) => {
    await openArrival(page)
    await page.getByTestId('arrival-body').click()
    await expect(page.getByTestId('body-screen')).toBeVisible()
    expect(await page.locator('.app-content').evaluate((element) => element.scrollTop)).toBe(0)
    await page.getByRole('button', { name: 'Front', exact: true }).click()

    await page.locator('[data-region="chest"]').first().click({ force: true })
    await expect(page.getByRole('heading', { name: 'What do you feel here?' })).toBeVisible()
    await page.getByRole('button', { name: 'Tension' }).click()
    await page.getByRole('button', { name: /moderate/i }).click()
    await expect(page.getByRole('heading', { name: 'Review your body signals' })).toBeVisible()
    await page.getByRole('button', { name: 'See what might fit' }).click()
    await expect(page.getByTestId('reflection-screen')).toBeVisible()
  })

  test('Affect Map reveals suggestions after placement', async ({ page }) => {
    await openArrival(page)
    await page.getByTestId('arrival-affect').click()
    const plot = page.getByTestId('dimensional-plot-container').locator('svg')
    await expect(plot).toBeVisible()
    const box = await plot.boundingBox()
    expect(box).not.toBeNull()
    await plot.click({ position: { x: box!.width * 0.7, y: box!.height * 0.25 }, force: true })
    await expect(page.getByTestId('affect-readout')).toBeVisible()
    const tray = page.getByTestId('dimensional-suggestion-tray')
    await tray.locator('button').first().click()
    await page.getByRole('button', { name: 'Reflect on these words' }).click()
    await expect(page.getByTestId('reflection-screen')).toBeVisible()
  })

  test('Word Ladder moves broad to precise and reflects', async ({ page }) => {
    await openArrival(page)
    await page.getByTestId('arrival-words').click()
    await page.getByRole('listitem').first().click()
    await page.getByRole('listitem').first().click()
    await page.getByRole('listitem').first().click()
    await expect(page.locator('.route-action button')).toBeEnabled()
    await page.locator('.route-action button').click()
    await expect(page.getByTestId('reflection-screen')).toBeVisible()
  })

  test('Plutchik remains available through Explore', async ({ page }) => {
    await page.getByRole('button', { name: 'Explore' }).click()
    await page.getByTestId('explore-plutchik').click()
    const bubbles = page.locator('.model-stage button[tabindex="0"]')
    await expect(bubbles.first()).toBeVisible()
    const stageBox = await page.locator('.model-stage').boundingBox()
    let selected = 0
    for (let index = 0; index < await bubbles.count() && selected < 2; index++) {
      const box = await bubbles.nth(index).boundingBox()
      if (!box || !stageBox) continue
      const fullyVisible = box.x >= stageBox.x && box.y >= stageBox.y
        && box.x + box.width <= stageBox.x + stageBox.width
        && box.y + box.height <= Math.min(stageBox.y + stageBox.height, page.viewportSize()!.height)
      if (fullyVisible) {
        await bubbles.nth(index).click({ force: true })
        selected++
      }
    }
    expect(selected).toBe(2)
    await expect(page.locator('.route-action button')).toBeEnabled()
  })
})

test.describe('Safety behavior through the UI', () => {
  test('tier 4 support is first and gates reflection details', async ({ page }) => {
    await openApp(page)
    await page.evaluate(() => localStorage.setItem('emot-id-allow-external-ai', 'true'))
    await page.reload()
    await openArrival(page)
    await page.getByTestId('arrival-words').click()

    const choose = async (name: RegExp) => page.locator('.word-options > button').filter({ hasText: name }).first().click()

    await choose(/^sad/i)
    await choose(/^despair/i)
    await page.locator('.word-path-actions > button').first().click()

    await choose(/^sad/i)
    await choose(/^depressed/i)
    await choose(/^empty/i)

    await choose(/^fearful/i)
    await choose(/^weak/i)
    await choose(/^worthless/i)

    await page.locator('.route-action button').click()
    const alert = page.getByRole('alert')
    await expect(alert).toBeVisible()
    await expect(page.locator('.emotion-heading')).not.toBeVisible()
    await expect(page.getByRole('link', { name: 'Explore with AI' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /understand.*show my reflection/i })).toBeVisible()

    const alertBox = await alert.boundingBox()
    const ackBox = await page.getByRole('button', { name: /understand.*show my reflection/i }).boundingBox()
    expect(alertBox!.y).toBeLessThan(ackBox!.y)

    await page.getByRole('button', { name: /understand.*show my reflection/i }).click()
    await expect(page.locator('.emotion-heading')).toContainText(/despair/i)
    await expect(page.getByRole('link', { name: 'Explore with AI' })).toBeVisible()
  })
})

test.describe('Privacy and support destinations', () => {
  test('activates the existing Google AI Mode link without changing its query', async ({ page }) => {
    await openApp(page)
    await completeQuick(page, 'anxiety')
    await expect(page.getByRole('link', { name: 'Explore with AI' })).toHaveCount(0)
    await expect(page.getByText(/external AI search is off/i)).toBeVisible()

    await page.getByRole('button', { name: 'Settings' }).click()
    await page.getByRole('button', { name: 'Privacy & data' }).click()
    const aiSwitch = page.getByRole('switch', { name: 'Allow external AI search links' })
    await aiSwitch.click()
    await expect(aiSwitch).toBeChecked()
    await page.getByRole('button', { name: 'Back' }).click()
    await page.getByRole('button', { name: 'Back' }).click()

    const link = page.getByRole('link', { name: 'Explore with AI' })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('target', '_blank')
    const href = await link.getAttribute('href')
    const url = new URL(href!)
    expect(url.origin + url.pathname).toBe('https://www.google.com/search')
    expect(url.searchParams.get('udm')).toBe('50')
    expect(url.searchParams.get('q')).toBe(
      'I feel anxiety. What does this emotion mean and how can I understand it better?',
    )

    await page.reload()
    await completeQuick(page, 'joy')
    await expect(page.getByRole('link', { name: 'Explore with AI' })).toBeVisible()
  })

  test('settings separates privacy and support from product navigation', async ({ page }) => {
    await openApp(page)
    await page.getByRole('button', { name: 'Settings' }).click()
    await page.getByRole('button', { name: 'Dark' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await page.getByRole('button', { name: 'Privacy & data' }).click()
    await expect(page.getByTestId('privacy-screen')).toContainText(/no account, analytics, or cloud sync/i)
    await page.getByRole('button', { name: 'Back' }).click()
    await page.getByRole('button', { name: 'Support' }).click()
    await expect(page.getByTestId('support-screen')).toContainText('116 123')
  })
})

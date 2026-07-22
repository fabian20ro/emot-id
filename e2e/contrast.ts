import { expect, type Page } from '@playwright/test'

interface ContrastFailure {
  selector: string
  text: string
  ratio: number
  required: number
  foreground: string
  background: string
}

export async function expectAccessibleTextContrast(page: Page, state: string) {
  const failures = await page.locator('body').evaluate((root): ContrastFailure[] => {
    type Rgba = { r: number; g: number; b: number; a: number }

    const parseColor = (value: string): Rgba | null => {
      const match = value.match(/rgba?\((\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)(?:\D+(\d+(?:\.\d+)?))?\)/)
      if (!match) return null
      return {
        r: Number(match[1]),
        g: Number(match[2]),
        b: Number(match[3]),
        a: match[4] === undefined ? 1 : Number(match[4]),
      }
    }

    const composite = (front: Rgba, back: Rgba): Rgba => {
      const alpha = front.a + back.a * (1 - front.a)
      if (alpha === 0) return { r: 0, g: 0, b: 0, a: 0 }
      return {
        r: (front.r * front.a + back.r * back.a * (1 - front.a)) / alpha,
        g: (front.g * front.a + back.g * back.a * (1 - front.a)) / alpha,
        b: (front.b * front.a + back.b * back.a * (1 - front.a)) / alpha,
        a: alpha,
      }
    }

    const backgroundFor = (element: Element): Rgba => {
      const layers: Rgba[] = []
      let current: Element | null = element
      while (current) {
        const color = parseColor(getComputedStyle(current).backgroundColor)
        if (color && color.a > 0) layers.push(color)
        current = current.parentElement
      }
      let result: Rgba = { r: 255, g: 255, b: 255, a: 1 }
      for (let index = layers.length - 1; index >= 0; index--) result = composite(layers[index], result)
      return result
    }

    const linear = (channel: number) => {
      const value = channel / 255
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    }
    const luminance = (color: Rgba) => 0.2126 * linear(color.r) + 0.7152 * linear(color.g) + 0.0722 * linear(color.b)
    const ratio = (a: Rgba, b: Rgba) => {
      const first = luminance(a)
      const second = luminance(b)
      return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
    }

    const selectorFor = (element: Element) => {
      const id = element.id ? `#${element.id}` : ''
      const classes = [...element.classList].slice(0, 3).map((name) => `.${name}`).join('')
      return `${element.tagName.toLowerCase()}${id}${classes}`
    }

    return [...root.querySelectorAll('*')].flatMap((element): ContrastFailure[] => {
      if (element.namespaceURI === 'http://www.w3.org/2000/svg') return []
      const hasDirectText = [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim())
      if (!hasDirectText || element.closest('[aria-hidden="true"]')) return []

      const style = getComputedStyle(element)
      const rect = element.getBoundingClientRect()
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0 || rect.width < 1 || rect.height < 1) return []

      const foreground = parseColor(style.color)
      if (!foreground) return []
      const background = backgroundFor(element)
      const renderedForeground = composite({ ...foreground, a: foreground.a * Number(style.opacity) }, background)
      const actual = ratio(renderedForeground, background)
      const fontSize = Number.parseFloat(style.fontSize)
      const fontWeight = Number.parseInt(style.fontWeight, 10) || 400
      const required = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700) ? 3 : 4.5

      if (actual + 0.01 >= required) return []
      return [{
        selector: selectorFor(element),
        text: element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 90) ?? '',
        ratio: Number(actual.toFixed(2)),
        required,
        foreground: style.color,
        background: `rgb(${Math.round(background.r)}, ${Math.round(background.g)}, ${Math.round(background.b)})`,
      }]
    })
  })

  expect(failures, `${state} contains low-contrast visible text:\n${JSON.stringify(failures, null, 2)}`).toEqual([])
}

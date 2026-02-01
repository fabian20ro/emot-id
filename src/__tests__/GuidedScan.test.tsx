import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { GuidedScan } from '../components/GuidedScan'
import { LanguageProvider } from '../context/LanguageContext'
import type { SomaticRegion } from '../models/somatic/types'

vi.mock('framer-motion', async () => {
  const React = await import('react')
  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    motion: {
      div: React.forwardRef((props: Record<string, unknown>, ref: React.Ref<HTMLDivElement>) => {
        const { initial: _i, animate: _a, exit: _e, transition: _t, whileHover: _wh, whileTap: _wt, layout: _l, ...rest } = props
        return React.createElement('div', { ...rest, ref })
      }),
      p: React.forwardRef((props: Record<string, unknown>, ref: React.Ref<HTMLParagraphElement>) => {
        const { initial: _i, animate: _a, exit: _e, transition: _t, ...rest } = props
        return React.createElement('p', { ...rest, ref })
      }),
    },
  }
})

function makeRegion(id: string, label: string, group: 'head' | 'torso' | 'arms' | 'legs'): SomaticRegion {
  return {
    id,
    label: { ro: label, en: label },
    color: '#999',
    svgRegionId: id,
    group,
    commonSensations: ['tension', 'warmth', 'pressure'],
    emotionSignals: [],
  }
}

function buildRegionMap(): Map<string, SomaticRegion> {
  const regions: [string, string, 'head' | 'torso' | 'arms' | 'legs'][] = [
    ['head', 'Head / Face', 'head'],
    ['jaw', 'Jaw', 'head'],
    ['throat', 'Throat', 'head'],
    ['shoulders', 'Shoulders', 'torso'],
    ['upper-back', 'Upper Back', 'torso'],
    ['chest', 'Chest', 'torso'],
    ['stomach', 'Stomach', 'torso'],
    ['lower-back', 'Lower Back', 'torso'],
    ['arms', 'Arms', 'arms'],
    ['hands', 'Hands', 'arms'],
    ['legs', 'Legs', 'legs'],
    ['feet', 'Feet', 'legs'],
  ]
  return new Map(regions.map(([id, label, group]) => [id, makeRegion(id, label, group)]))
}

function renderGuidedScan(overrides: Partial<React.ComponentProps<typeof GuidedScan>> = {}) {
  const defaults: React.ComponentProps<typeof GuidedScan> = {
    regions: buildRegionMap(),
    onRegionSelect: vi.fn(),
    onComplete: vi.fn(),
    onHighlight: vi.fn(),
    ...overrides,
  }
  return {
    ...render(
      <LanguageProvider>
        <GuidedScan {...defaults} />
      </LanguageProvider>
    ),
    onRegionSelect: defaults.onRegionSelect as ReturnType<typeof vi.fn>,
    onComplete: defaults.onComplete as ReturnType<typeof vi.fn>,
    onHighlight: defaults.onHighlight as ReturnType<typeof vi.fn>,
  }
}

/**
 * Helper: skip centering phase by clicking the skip arrow.
 * Uses fireEvent (not userEvent) to avoid fake-timer conflicts.
 */
function skipCentering() {
  fireEvent.click(screen.getByText('→'))
}

describe('GuidedScan', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('centering phase', () => {
    it('starts in centering phase with breathing instructions', () => {
      renderGuidedScan()
      expect(screen.getByText('Take a breath. Notice your body.')).toBeInTheDocument()
    })

    it('shows breathing cues that alternate', () => {
      renderGuidedScan()
      expect(screen.getByText('Breathe in...')).toBeInTheDocument()

      act(() => { vi.advanceTimersByTime(2500) })
      expect(screen.getByText('Breathe out...')).toBeInTheDocument()
    })

    it('auto-advances to scanning after centering duration', () => {
      renderGuidedScan()

      act(() => { vi.advanceTimersByTime(10_100) })

      expect(screen.getByText('Head / Face')).toBeInTheDocument()
    })

    it('extends centering when "Take more time" clicked', () => {
      renderGuidedScan()

      fireEvent.click(screen.getByText('Take more time'))

      // After 10s, should still be centering (extended to 30s)
      act(() => { vi.advanceTimersByTime(10_000) })
      expect(screen.getByText('Take a breath. Notice your body.')).toBeInTheDocument()
      expect(screen.queryByText('Take more time')).not.toBeInTheDocument()
    })

    it('skips centering when skip arrow clicked', () => {
      renderGuidedScan()
      skipCentering()
      expect(screen.getByText('Head / Face')).toBeInTheDocument()
    })
  })

  describe('scanning phase', () => {
    it('shows the first region prompt', () => {
      renderGuidedScan()
      skipCentering()
      expect(screen.getByText('Head / Face')).toBeInTheDocument()
      expect(screen.getByText(/What do you notice/)).toBeInTheDocument()
    })

    it('highlights the current region', () => {
      const { onHighlight } = renderGuidedScan()
      skipCentering()
      expect(onHighlight).toHaveBeenCalledWith('head')
    })

    it('shows sensation buttons for current region', () => {
      renderGuidedScan()
      skipCentering()
      expect(screen.getByText('Tension')).toBeInTheDocument()
      expect(screen.getByText('Warmth')).toBeInTheDocument()
      expect(screen.getByText('Pressure')).toBeInTheDocument()
    })

    it('shows intensity after picking a sensation', () => {
      renderGuidedScan()
      skipCentering()

      fireEvent.click(screen.getByText('Tension'))

      expect(screen.getByText('Mild')).toBeInTheDocument()
      expect(screen.getByText('Moderate')).toBeInTheDocument()
      expect(screen.getByText('Strong')).toBeInTheDocument()
    })

    it('fires onRegionSelect and advances after intensity pick', () => {
      const { onRegionSelect } = renderGuidedScan()
      skipCentering()

      fireEvent.click(screen.getByText('Tension'))
      fireEvent.click(screen.getByText('Moderate'))

      expect(onRegionSelect).toHaveBeenCalledWith('head', 'tension', 2)
      expect(screen.getByText('Jaw')).toBeInTheDocument()
    })

    it('skips region when "Nothing here" clicked', () => {
      const { onRegionSelect } = renderGuidedScan()
      skipCentering()

      fireEvent.click(screen.getByText(/Nothing here/))

      expect(onRegionSelect).not.toHaveBeenCalled()
      expect(screen.getByText('Jaw')).toBeInTheDocument()
    })

    it('skips entire group when group skip clicked', () => {
      renderGuidedScan()
      skipCentering()

      fireEvent.click(screen.getByText(/Skip this area/))

      // Head group = head, jaw → next is throat (neck group)
      expect(screen.getByText('Throat')).toBeInTheDocument()
    })

    it('shows progress bar', () => {
      renderGuidedScan()
      skipCentering()
      const progressBar = document.querySelector('.bg-indigo-500.rounded-full')
      expect(progressBar).toBeInTheDocument()
    })
  })

  describe('completion', () => {
    it('shows complete phase after all regions scanned', () => {
      const { onComplete } = renderGuidedScan()
      skipCentering()

      for (let i = 0; i < 12; i++) {
        fireEvent.click(screen.getByText(/Nothing here/))
      }

      expect(screen.getByText('Body scan complete')).toBeInTheDocument()

      fireEvent.click(screen.getByText('✓'))
      expect(onComplete).toHaveBeenCalledTimes(1)
    })

    it('calls onHighlight(null) when scan completes', () => {
      const { onHighlight } = renderGuidedScan()
      skipCentering()

      for (let i = 0; i < 12; i++) {
        fireEvent.click(screen.getByText(/Nothing here/))
      }

      expect(onHighlight).toHaveBeenCalledWith(null)
    })
  })
})

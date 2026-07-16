import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { SessionHistory } from '../components/SessionHistory'
import { LanguageProvider } from '../context/LanguageContext'
import type { Session } from '../data/types'

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    modelId: 'wheel',
    selections: [{ emotionId: 'joy', label: { ro: 'bucurie', en: 'joy' } }],
    results: [{ id: 'joy', label: { ro: 'bucurie', en: 'joy' }, color: '#fff' }],
    crisisTier: 'none',
    ...overrides,
  }
}

function renderHistory(
  sessions: Session[],
  onClose?: () => void,
  onClearAll?: () => void,
  onExportJSON?: () => Promise<string>,
) {
  return render(
    <LanguageProvider>
      <SessionHistory
        isOpen
        onClose={onClose ?? vi.fn()}
        sessions={sessions}
        loading={false}
        onClearAll={onClearAll ?? vi.fn()}
        onExportJSON={onExportJSON ?? vi.fn().mockResolvedValue('[]')}
      />
    </LanguageProvider>
  )
}

describe('SessionHistory', () => {
  it('shows active/passive vocabulary split and top identified emotions', () => {
    const sessions = [
      makeSession({
        selections: [
          { emotionId: 'joy', label: { ro: 'bucurie', en: 'joy' } },
          { emotionId: 'shame', label: { ro: 'rusine', en: 'shame' } },
        ],
        results: [
          { id: 'joy', label: { ro: 'bucurie', en: 'joy' }, color: '#fff' },
        ],
      }),
      makeSession({
        selections: [
          { emotionId: 'joy', label: { ro: 'bucurie', en: 'joy' } },
          { emotionId: 'anger', label: { ro: 'furie', en: 'anger' } },
        ],
        results: [
          { id: 'joy', label: { ro: 'bucurie', en: 'joy' }, color: '#fff' },
          { id: 'anger', label: { ro: 'furie', en: 'anger' }, color: '#f00' },
        ],
      }),
    ]

    renderHistory(sessions)

    expect(screen.getByText('Your 15 most-identified emotions')).toBeInTheDocument()
    expect(screen.getByText('2 actively identified')).toBeInTheDocument()
    expect(screen.getByText('1 selected but not surfaced')).toBeInTheDocument()
    expect(screen.getAllByText('joy').length).toBeGreaterThan(0)
    expect(screen.getAllByText('anger').length).toBeGreaterThan(0)
  })

  describe('progression nudge', () => {
    it('does not render when fewer than 3 sessions exist', () => {
      const sessions = [makeSession()]
      renderHistory(sessions)
      expect(screen.queryByRole('button', { name: /dismiss suggestion/i })).not.toBeInTheDocument()
    })

    it('renders the correct suggestion text when 3+ sessions use the wheel model', () => {
      const sessions = [
        makeSession({ modelId: 'wheel' }),
        makeSession({ modelId: 'wheel' }),
        makeSession({ modelId: 'wheel' }),
      ]
      renderHistory(sessions)
      expect(screen.getByText("You've been naming emotions. The Body Map can show you where they live in your body.")).toBeInTheDocument()
    })

    it('renders somatic suggestion when 3+ sessions use the somatic model', () => {
      const sessions = [
        makeSession({ modelId: 'somatic' }),
        makeSession({ modelId: 'somatic' }),
        makeSession({ modelId: 'somatic' }),
      ]
      renderHistory(sessions)
      expect(screen.getByText("You've been exploring body sensations. The Emotion Wheel can help you put names to what you've noticed.")).toBeInTheDocument()
    })

    it('hides the nudge after dismiss button is clicked', () => {
      const sessions = [
        makeSession({ modelId: 'wheel' }),
        makeSession({ modelId: 'wheel' }),
        makeSession({ modelId: 'wheel' }),
      ]
      renderHistory(sessions)
      expect(screen.getByText("You've been naming emotions. The Body Map can show you where they live in your body.")).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: /dismiss/i }))
      expect(screen.queryByText("You've been naming emotions. The Body Map can show you where they live in your body.")).not.toBeInTheDocument()
    })

    it('does not render when sessions span multiple models (no single model ≥3)', () => {
      const sessions = [
        makeSession({ modelId: 'wheel' }),
        makeSession({ modelId: 'somatic' }),
        makeSession({ modelId: 'plutchik' }),
      ]
      renderHistory(sessions)
      expect(screen.queryByRole('button', { name: /dismiss suggestion/i })).not.toBeInTheDocument()
    })
  })

  describe('callback invocations', () => {
    const sessions = [makeSession()]

    it('invokes onClose when the close button is clicked', () => {
      const onClose = vi.fn()
      renderHistory(sessions, onClose)
      fireEvent.click(screen.getByLabelText('Close history'))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('invokes onClearAll when "Clear all data" button is clicked', () => {
      const onClearAll = vi.fn()
      renderHistory(sessions, undefined, onClearAll)
      fireEvent.click(screen.getByText('Clear all data'))
      expect(onClearAll).toHaveBeenCalledTimes(1)
    })

    it('invokes onExportJSON when "Export JSON" button is clicked', () => {
      const onExportJSON = vi.fn().mockResolvedValue('[{"id":"s1"}]')
      renderHistory(sessions, undefined, undefined, onExportJSON)
      fireEvent.click(screen.getByText('Export JSON'))
      expect(onExportJSON).toHaveBeenCalledTimes(1)
    })
  })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
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

function renderHistory(sessions: Session[]) {
  return render(
    <LanguageProvider>
      <SessionHistory
        isOpen
        onClose={vi.fn()}
        sessions={sessions}
        loading={false}
        onClearAll={vi.fn()}
        onExportJSON={vi.fn().mockResolvedValue('[]')}
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
})

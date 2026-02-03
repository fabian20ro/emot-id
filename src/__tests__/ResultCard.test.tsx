import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResultCard } from '../components/ResultCard'
import { LanguageProvider } from '../context/LanguageContext'
import type { AnalysisResult } from '../models/types'

const baseResult: AnalysisResult = {
  id: 'joy',
  label: { en: 'Joy', ro: 'Bucurie' },
  color: '#FFD700',
  description: { en: 'A feeling of great pleasure', ro: 'Un sentiment de mare placere' },
  needs: { en: 'celebration and sharing', ro: 'celebrare si impartasire' },
}

function renderCard(overrides: Partial<React.ComponentProps<typeof ResultCard>> = {}) {
  const defaults: React.ComponentProps<typeof ResultCard> = {
    result: baseResult,
    language: 'en',
    expanded: false,
    ...overrides,
  }
  return render(
    <LanguageProvider>
      <ResultCard {...defaults} />
    </LanguageProvider>
  )
}

describe('ResultCard', () => {
  it('renders emotion label', () => {
    renderCard()
    expect(screen.getByText('Joy')).toBeInTheDocument()
  })

  it('shows InfoButton when collapsed (expanded=false)', () => {
    renderCard({ expanded: false })
    expect(screen.getByRole('button', { name: 'Show description' })).toBeInTheDocument()
  })

  it('opens modal with description on InfoButton click when collapsed', async () => {
    const user = userEvent.setup()
    renderCard({ expanded: false })

    await user.click(screen.getByRole('button', { name: 'Show description' }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('A feeling of great pleasure')).toBeInTheDocument()
    expect(screen.getByText(/celebration and sharing/)).toBeInTheDocument()
  })

  it('renders description inline when expanded=true', () => {
    renderCard({ expanded: true })
    expect(screen.getByText('A feeling of great pleasure')).toBeInTheDocument()
    expect(screen.getByText(/celebration and sharing/)).toBeInTheDocument()
    // No InfoButton for description when expanded
    expect(screen.queryByRole('button', { name: 'Show description' })).not.toBeInTheDocument()
  })

  it('renders needs inline when no description exists', () => {
    const noDescResult: AnalysisResult = {
      ...baseResult,
      description: undefined,
    }
    renderCard({ result: noDescResult })
    expect(screen.getByText(/celebration and sharing/)).toBeInTheDocument()
  })

  it('uses readMore label for high-distress emotions', () => {
    const distressResult: AnalysisResult = {
      ...baseResult,
      id: 'despair',
    }
    renderCard({ result: distressResult, expanded: false })
    expect(screen.getByRole('button', { name: 'Would you like to read more about this?' })).toBeInTheDocument()
  })
})

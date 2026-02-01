import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { ResultModal } from '../components/ResultModal'
import { LanguageProvider } from '../context/LanguageContext'
import type { BaseEmotion, AnalysisResult } from '../models/types'

function renderModal(props: Partial<React.ComponentProps<typeof ResultModal>> = {}) {
  const defaults: React.ComponentProps<typeof ResultModal> = {
    isOpen: true,
    onClose: () => {},
    selections: [],
    results: [],
    ...props,
  }
  return render(
    <LanguageProvider>
      <ResultModal {...defaults} />
    </LanguageProvider>
  )
}

const makeEmotion = (id: string, color = '#FF0000'): BaseEmotion => ({
  id,
  label: { ro: `${id}_ro`, en: `${id}_en` },
  color,
})

const makeResult = (id: string, opts: Partial<AnalysisResult> = {}): AnalysisResult => ({
  id,
  label: { ro: `${id}_ro`, en: `${id}_en` },
  color: '#FF0000',
  description: { ro: `desc_${id}_ro`, en: `desc_${id}_en` },
  ...opts,
})

describe('ResultModal', () => {
  it('does not render when closed', () => {
    renderModal({ isOpen: false })
    expect(screen.queryByText('Analysis result')).not.toBeInTheDocument()
  })

  it('renders title when open', () => {
    renderModal({ isOpen: true })
    expect(screen.getByText('Analysis result')).toBeInTheDocument()
  })

  it('shows description for single result', () => {
    const results = [makeResult('joy')]
    renderModal({ results, selections: [makeEmotion('joy')] })
    expect(screen.getByText('desc_joy_en')).toBeInTheDocument()
  })

  it('shows descriptions for two results (no collapsible)', () => {
    const results = [makeResult('joy'), makeResult('trust')]
    const selections = [makeEmotion('joy'), makeEmotion('trust')]
    renderModal({ results, selections })
    expect(screen.getByText('desc_joy_en')).toBeInTheDocument()
    expect(screen.getByText('desc_trust_en')).toBeInTheDocument()
  })

  it('uses collapsible details for 3+ results', () => {
    const results = [makeResult('a'), makeResult('b'), makeResult('c')]
    const selections = results.map((r) => makeEmotion(r.id))
    renderModal({ results, selections })

    // Descriptions should be inside <details> elements (collapsed by default)
    const details = document.querySelectorAll('details')
    expect(details.length).toBe(3)

    // Summary should show "Show description"
    const summaries = screen.getAllByText('Show description')
    expect(summaries.length).toBe(3)
  })

  it('shows no combinations message when results empty', () => {
    renderModal({ results: [], selections: [makeEmotion('joy')] })
    expect(screen.getByText('No combinations found from your selections')).toBeInTheDocument()
  })

  it('renders hierarchy path as breadcrumb', () => {
    const results = [
      makeResult('free', {
        hierarchyPath: [
          { ro: 'Fericit', en: 'Happy' },
          { ro: 'Multumit', en: 'Content' },
          { ro: 'Liber', en: 'Free' },
        ],
      }),
    ]
    renderModal({ results, selections: [makeEmotion('free')] })
    expect(screen.getByText('Happy > Content > Free')).toBeInTheDocument()
  })

  it('renders component labels for dyad results', () => {
    const results = [
      makeResult('love', {
        componentLabels: [
          { ro: 'Bucurie', en: 'Joy' },
          { ro: 'Incredere', en: 'Trust' },
        ],
      }),
    ]
    renderModal({ results, selections: [makeEmotion('joy'), makeEmotion('trust')] })
    expect(screen.getByText('= Joy + Trust')).toBeInTheDocument()
  })

  it('calls onClose when backdrop clicked', async () => {
    let closed = false
    renderModal({ onClose: () => { closed = true } })
    // Click the backdrop (the outermost motion.div)
    const backdrop = document.querySelector('.fixed.inset-0')!
    await userEvent.click(backdrop)
    expect(closed).toBe(true)
  })

  it('renders AI link', () => {
    const results = [makeResult('joy')]
    renderModal({ results, selections: [makeEmotion('joy')] })
    const link = screen.getByText(/Explore with AI/)
    expect(link).toHaveAttribute('href')
    expect(link.getAttribute('href')).toContain('google.com/search')
  })
})

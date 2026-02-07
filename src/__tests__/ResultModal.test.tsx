import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResultModal } from '../components/ResultModal'
import { LanguageProvider } from '../context/LanguageContext'
import { storage } from '../data/storage'
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
  beforeEach(() => {
    vi.restoreAllMocks()
    window.localStorage.clear()
  })

  it('does not render when closed', () => {
    renderModal({ isOpen: false })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders selected emotion chips in header instead of title text', () => {
    renderModal({
      isOpen: true,
      selections: [makeEmotion('joy'), makeEmotion('trust')],
      results: [makeResult('joy')],
    })
    expect(screen.getAllByText('joy_en').length).toBeGreaterThan(1)
    expect(screen.getByText('trust_en')).toBeInTheDocument()
    expect(screen.queryByText('Analysis result')).not.toBeInTheDocument()
  })

  it('shows no left-side fallback text when opened without selections', () => {
    renderModal({ isOpen: true, selections: [], results: [makeResult('joy')] })
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    expect(screen.queryByText('No selection')).not.toBeInTheDocument()
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

  it('uses InfoButton for 3+ results (collapsed descriptions)', () => {
    const results = [makeResult('a'), makeResult('b'), makeResult('c')]
    const selections = results.map((r) => makeEmotion(r.id))
    renderModal({ results, selections })

    // Descriptions should be behind InfoButton (collapsed by default)
    const infoButtons = screen.getAllByRole('button', { name: 'Show description' })
    expect(infoButtons.length).toBe(3)
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

  it('shows reflection prompt', () => {
    const results = [makeResult('joy')]
    renderModal({ results, selections: [makeEmotion('joy')] })
    expect(screen.getByText('Does this resonate with your experience?')).toBeInTheDocument()
  })

  it('uses simplified reflection prompt when simple language mode is enabled', () => {
    vi.spyOn(storage, 'get').mockImplementation((key) => {
      if (key === 'simpleLanguage') return 'true'
      return null
    })
    const results = [makeResult('joy')]
    renderModal({ results, selections: [makeEmotion('joy')] })
    expect(screen.getByText('Does this fit how you feel?')).toBeInTheDocument()
  })

  it('shows crisis resources for high-distress results', () => {
    const results = [makeResult('despair'), makeResult('rage')]
    renderModal({ results, selections: [makeEmotion('despair'), makeEmotion('rage')] })
    expect(screen.getByText(/difficult time/)).toBeInTheDocument()
    expect(screen.getByText(/116 123/)).toBeInTheDocument()
  })

  it('suppresses AI link entirely during crisis', () => {
    const results = [makeResult('despair'), makeResult('rage')]
    renderModal({ results, selections: [makeEmotion('despair'), makeEmotion('rage')] })
    expect(screen.queryByText(/Explore with AI/)).not.toBeInTheDocument()
  })

  it('requires acknowledgement before tier4 results are shown', async () => {
    const user = userEvent.setup()
    const results = [makeResult('despair'), makeResult('worthless'), makeResult('empty')]
    renderModal({ results, selections: [makeEmotion('despair'), makeEmotion('worthless'), makeEmotion('empty')] })

    expect(screen.getByText(/thinking about ending your life/i)).toBeInTheDocument()
    expect(screen.queryByText(/Does this resonate with your experience/)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /show my results/i }))
    expect(screen.queryByRole('button', { name: /show my results/i })).not.toBeInTheDocument()
    expect(screen.getByText(/Does this resonate with your experience/)).toBeInTheDocument()
  })

  it('shows temporal escalation note when escalation flag is true', () => {
    const results = [makeResult('despair')]
    renderModal({ results, selections: [makeEmotion('despair')], escalateCrisis: true })
    expect(screen.getByText(/pattern showing up more often recently/i)).toBeInTheDocument()
  })

  it('does not show crisis resources for non-distress results', () => {
    const results = [makeResult('joy'), makeResult('trust')]
    renderModal({ results, selections: [makeEmotion('joy'), makeEmotion('trust')] })
    expect(screen.queryByText(/difficult time/)).not.toBeInTheDocument()
  })

  it('shows needs when present in result', () => {
    const results = [makeResult('joy', { needs: { ro: 'partajare', en: 'sharing and expression' } })]
    renderModal({ results, selections: [makeEmotion('joy')] })
    expect(screen.getByText('sharing and expression')).toBeInTheDocument()
  })

  it('shows match strength when present', () => {
    const results = [makeResult('anger', { matchStrength: { ro: 'rezonanță puternică', en: 'strong resonance' } })]
    renderModal({ results, selections: [makeEmotion('anger')] })
    expect(screen.getByText('strong resonance')).toBeInTheDocument()
  })

  it('shows reflection link with companion info button', () => {
    const results = [makeResult('joy')]
    renderModal({ results, selections: [makeEmotion('joy')] })
    expect(screen.getByRole('button', { name: 'Does this resonate with your experience?' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Show more context' })).toBeInTheDocument()
  })

  it('shows AI warning text inside the info panel', async () => {
    const user = userEvent.setup()
    const results = [makeResult('joy')]
    renderModal({ results, selections: [makeEmotion('joy')] })
    expect(screen.queryByText(/not a substitute for professional support/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Show more context' }))
    expect(screen.getByText(/not a substitute for professional support/)).toBeInTheDocument()
  })

  it('keeps bridge suggestion out of results and shows it in follow-up for partly', async () => {
    const user = userEvent.setup()
    const results = [makeResult('anger')]
    renderModal({
      results,
      selections: [makeEmotion('anger')],
      currentModelId: 'wheel',
      onSwitchModel: () => {},
    })
    expect(screen.queryByText(/Where do you notice this in your body/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Does this resonate with your experience?' }))
    await user.click(await screen.findByRole('button', { name: 'Somewhat' }))
    expect(await screen.findByText(/Where do you notice this in your body/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try the Body Map' })).toBeInTheDocument()
  })

  it('has proper dialog ARIA attributes', () => {
    renderModal({ selections: [makeEmotion('joy')], results: [makeResult('joy')] })
    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'result-modal-title')
    expect(document.getElementById('result-modal-title')).toHaveTextContent('joy_en')
  })
})

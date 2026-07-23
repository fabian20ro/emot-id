import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReflectionScreen } from '../screens/ReflectionScreen'
import { LanguageProvider } from '../context/LanguageContext'
import { storage } from '../data/storage'
import type { AnalysisResult } from '../models/types'
import type { CheckInCompletion } from '../navigation/types'

function result(id: string, need?: { en: string; ro: string }): AnalysisResult {
  return {
    id,
    label: { en: id, ro: id },
    color: '#176b60',
    description: { en: `${id} description`, ro: `descriere ${id}` },
    needs: need,
  }
}

function completion(results: AnalysisResult[], crisisTier: CheckInCompletion['crisisTier'] = 'none'): CheckInCompletion {
  return {
    route: 'quick',
    modelId: 'test',
    selections: results,
    results,
    crisisTier,
    temporalEscalation: false,
  }
}

function renderReflection(
  results: AnalysisResult[],
  options: { crisisTier?: CheckInCompletion['crisisTier']; language?: 'en' | 'ro'; saveSessions?: boolean } = {},
) {
  storage.set('language', options.language ?? 'en')
  const onSave = vi.fn()
  render(
    <LanguageProvider>
      <ReflectionScreen
        completion={completion(results, options.crisisTier)}
        saveSessions={options.saveSessions ?? true}
        allowExternalAI={false}
        onBack={vi.fn()}
        onSave={onSave}
        onReturn={vi.fn()}
      />
    </LanguageProvider>,
  )
  return { onSave }
}

describe('ReflectionScreen need selection', () => {
  beforeEach(() => localStorage.clear())

  it('omits need selection and saves no need when none are inferred', async () => {
    const user = userEvent.setup()
    const { onSave } = renderReflection([result('calm')])

    expect(screen.queryByRole('group', { name: 'What feels most needed right now?' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Done for now' }))

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ selectedNeed: undefined }))
  })

  it('preselects the only inferred need and persists it', async () => {
    const user = userEvent.setup()
    const need = { en: 'quiet and rest', ro: 'liniște și odihnă' }
    const { onSave } = renderReflection([result('tired', need)])
    const option = screen.getByRole('button', { name: need.en })

    expect(option).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: 'Done for now' }))

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ selectedNeed: need.en }))
  })

  it('requires an explicit choice among deduplicated needs and allows clearing it', async () => {
    const user = userEvent.setup()
    const quiet = { en: 'quiet and rest', ro: 'liniște și odihnă' }
    const support = { en: 'human support', ro: 'sprijin uman' }
    const { onSave } = renderReflection([result('tired', quiet), result('drained', quiet), result('sad', support)])
    const quietOption = screen.getByRole('button', { name: quiet.en })
    const supportOption = screen.getByRole('button', { name: support.en })

    expect(screen.getAllByRole('button', { name: quiet.en })).toHaveLength(1)
    expect(quietOption).toHaveAttribute('aria-pressed', 'false')
    expect(supportOption).toHaveAttribute('aria-pressed', 'false')

    supportOption.focus()
    await user.keyboard('{Enter}')
    expect(supportOption).toHaveAttribute('aria-pressed', 'true')
    expect(quietOption).toHaveAttribute('aria-pressed', 'false')

    await user.click(supportOption)
    expect(supportOption).toHaveAttribute('aria-pressed', 'false')
    await user.click(quietOption)
    await user.click(screen.getByRole('button', { name: 'Try one small step' }))
    expect(screen.getByRole('heading', { name: 'Try one small step' })).toBeInTheDocument()
    expect(screen.getByText(`What you may need: ${quiet.en}`)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Done for now' }))

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ selectedNeed: quiet.en }))
  })

  it('supports Romanian keyboard selection and save-disabled completion', async () => {
    const user = userEvent.setup()
    const first = { en: 'quiet', ro: 'liniște' }
    const second = { en: 'support', ro: 'sprijin' }
    const { onSave } = renderReflection(
      [result('obosit', first), result('trist', second)],
      { language: 'ro', saveSessions: false },
    )
    const option = screen.getByRole('button', { name: second.ro })

    option.focus()
    await user.keyboard('{Enter}')
    await user.click(screen.getByRole('button', { name: 'Gata pentru acum' }))

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ selectedNeed: second.ro }))
    expect(screen.getByText('Această verificare nu a fost salvată')).toBeInTheDocument()
  })

  it('keeps every need control behind tier-4 acknowledgement', async () => {
    const user = userEvent.setup()
    const need = { en: 'immediate support', ro: 'sprijin imediat' }
    renderReflection([result('despair', need)], { crisisTier: 'tier4' })

    expect(screen.queryByRole('group', { name: 'What feels most needed right now?' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'I understand. Show my reflection' }))

    expect(screen.getByRole('group', { name: 'What feels most needed right now?' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: need.en })).toHaveAttribute('aria-pressed', 'true')
  })
})

import { render, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ModalShell } from '../components/ModalShell'

const panelClassName = 'test-panel'

describe('ModalShell ARIA references', () => {
  it('does not warn when its portal children provide the label and description', async () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    render(
      <ModalShell
        onClose={() => {}}
        labelledBy="modal-title"
        describedBy="modal-description"
        panelClassName={panelClassName}
      >
        <h2 id="modal-title">Title</h2>
        <p id="modal-description">Description</p>
      </ModalShell>,
    )

    await waitFor(() => expect(document.getElementById('modal-title')).toBeInTheDocument())
    expect(consoleWarn).not.toHaveBeenCalled()
    consoleWarn.mockRestore()
  })

  it('warns after commit when a referenced label is genuinely absent', async () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    render(
      <ModalShell onClose={() => {}} labelledBy="missing-title" panelClassName={panelClassName}>
        <p>Content without a heading</p>
      </ModalShell>,
    )

    await waitFor(() => {
      expect(consoleWarn).toHaveBeenCalledWith('[ModalShell] labelledBy target not found:', 'missing-title')
    })
    consoleWarn.mockRestore()
  })

  it('sets dialog role and aria-labelledby on the panel', () => {
    render(
      <ModalShell
        onClose={() => {}}
        labelledBy="modal-title"
        describedBy="modal-description"
        panelClassName={panelClassName}
      >
        <h2 id="modal-title">Title</h2>
        <p id="modal-description">Description</p>
      </ModalShell>,
    )

    const panel = document.querySelector(`.${panelClassName}`) as HTMLElement
    expect(panel).toHaveAttribute('role', 'dialog')
    expect(panel).toHaveAttribute('aria-modal', 'true')
    expect(panel).toHaveAttribute('aria-labelledby', 'modal-title')
    expect(panel).toHaveAttribute('aria-describedby', 'modal-description')
  })
})

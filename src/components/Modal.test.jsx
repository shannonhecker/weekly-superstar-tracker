import { render, fireEvent, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Modal from './Modal'

// Modal listens on window — fireEvent.keyDown(window, ...) triggers
// the same handler the user would. We don't need user-event for these
// tests because the focus trap and Escape behaviour are pure keydown logic.

describe('Modal', () => {
  beforeEach(() => {
    // Module-level lockCount in Modal.jsx persists across tests; reset
    // body overflow so test n doesn't see leftover state from test n-1.
    document.body.style.overflow = ''
  })

  afterEach(() => {
    // Just in case a test forgot to close — restore body so subsequent
    // tests aren't observing a locked scroll.
    document.body.style.overflow = ''
  })

  it('renders nothing when open is false', () => {
    const { container } = render(
      <Modal open={false} onClose={() => {}}>
        <button>only-button</button>
      </Modal>
    )
    expect(container.firstChild).toBeNull()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('renders a dialog with role="dialog" and aria-modal="true" when open', () => {
    render(
      <Modal open={true} onClose={() => {}} title="Hello" emoji="👋">
        <button>only-button</button>
      </Modal>
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby')
    // The aria-labelledby target must actually point to the title heading.
    const labelId = dialog.getAttribute('aria-labelledby')
    expect(document.getElementById(labelId)).toHaveTextContent('Hello')
  })

  it('locks body scroll when open and unlocks when unmounted', () => {
    const { unmount } = render(
      <Modal open={true} onClose={() => {}}>
        <button>only-button</button>
      </Modal>
    )
    expect(document.body.style.overflow).toBe('hidden')
    unmount()
    expect(document.body.style.overflow).toBe('')
  })

  it('focuses the first focusable inside the dialog on open', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <button>first</button>
        <button>second</button>
      </Modal>
    )
    expect(document.activeElement).toBe(screen.getByText('first'))
  })

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose}>
        <button>only-button</button>
      </Modal>
    )
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('Tab from the last focusable wraps to the first (focus trap forward)', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <button>first</button>
        <button>middle</button>
        <button>last</button>
      </Modal>
    )
    const last = screen.getByText('last')
    const first = screen.getByText('first')
    act(() => last.focus())
    expect(document.activeElement).toBe(last)

    // Tab from last should preventDefault + move focus to first.
    fireEvent.keyDown(window, { key: 'Tab' })
    expect(document.activeElement).toBe(first)
  })

  it('Shift+Tab from the first focusable wraps to the last (focus trap backward)', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <button>first</button>
        <button>middle</button>
        <button>last</button>
      </Modal>
    )
    const first = screen.getByText('first')
    const last = screen.getByText('last')
    // first is auto-focused on mount, but be explicit so the test
    // documents the precondition.
    act(() => first.focus())
    expect(document.activeElement).toBe(first)

    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(last)
  })

  it('clicking the backdrop calls onClose; clicking inside the dialog does NOT', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose}>
        <button>only-button</button>
      </Modal>
    )

    // Backdrop is the dialog's parent (the role="dialog" element's parent).
    // We can't reliably target by class, so click the dialog itself first
    // (should NOT close) and then the dialog's parent (should close).
    const dialog = screen.getByRole('dialog')
    fireEvent.click(dialog)
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.click(dialog.parentElement)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('restores focus to the previously-focused element when closed', async () => {
    const trigger = document.createElement('button')
    trigger.textContent = 'trigger'
    document.body.appendChild(trigger)
    trigger.focus()
    expect(document.activeElement).toBe(trigger)

    const { rerender } = render(
      <Modal open={true} onClose={() => {}}>
        <button>only-button</button>
      </Modal>
    )
    // First focusable inside dialog stole focus on open.
    expect(document.activeElement).toBe(screen.getByText('only-button'))

    // Close the modal — Modal's effect cleanup uses setTimeout(0) so we
    // wait a microtask for the restore.
    rerender(
      <Modal open={false} onClose={() => {}}>
        <button>only-button</button>
      </Modal>
    )
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(document.activeElement).toBe(trigger)

    document.body.removeChild(trigger)
  })
})

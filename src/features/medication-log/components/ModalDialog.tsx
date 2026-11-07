import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react'

interface ModalDialogProps {
  titleId: string
  descriptionId: string
  onEscape: () => void
  children: ReactNode
}

function ModalDialog({
  titleId,
  descriptionId,
  onEscape,
  children,
}: ModalDialogProps) {
  const dialogRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const previousActiveElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    const previousOverflow = document.body.style.overflow

    dialogRef.current
      ?.querySelector<HTMLButtonElement>('button:not(:disabled)')
      ?.focus()
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
      if (previousActiveElement?.isConnected) {
        previousActiveElement.focus()
      }
    }
  }, [])

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onEscape()
      return
    }

    if (event.key !== 'Tab') {
      return
    }

    const buttons = Array.from(
      dialogRef.current?.querySelectorAll<HTMLButtonElement>(
        'button:not(:disabled)',
      ) ?? [],
    )
    const firstButton = buttons[0]
    const lastButton = buttons.at(-1)
    const activeElement = document.activeElement

    if (!firstButton || !lastButton) {
      event.preventDefault()
    } else if (event.shiftKey && activeElement === firstButton) {
      event.preventDefault()
      lastButton.focus()
    } else if (!event.shiftKey && activeElement === lastButton) {
      event.preventDefault()
      firstButton.focus()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onKeyDown={handleKeyDown}
    >
      <section
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8"
        ref={dialogRef}
        role="alertdialog"
      >
        {children}
      </section>
    </div>
  )
}

export default ModalDialog

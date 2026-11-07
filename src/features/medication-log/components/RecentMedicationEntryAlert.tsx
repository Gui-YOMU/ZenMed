import { useEffect, useRef, type KeyboardEvent } from 'react'
import { AlertTriangle } from 'lucide-react'

interface RecentMedicationEntryAlertProps {
  isSaving: boolean
  onCancel: () => void
  onConfirm: () => void
}

function RecentMedicationEntryAlert({
  isSaving,
  onCancel,
  onConfirm,
}: RecentMedicationEntryAlertProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previousActiveElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    const previousOverflow = document.body.style.overflow

    cancelButtonRef.current?.focus()
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
      if (!isSaving) {
        onCancel()
      }
      return
    }

    if (event.key !== 'Tab') {
      return
    }

    const buttons = [cancelButtonRef.current, confirmButtonRef.current].filter(
      (button): button is HTMLButtonElement => button !== null && !button.disabled,
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
        aria-describedby="recent-entry-warning-description"
        aria-labelledby="recent-entry-warning-title"
        aria-modal="true"
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8"
        role="alertdialog"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
            <AlertTriangle aria-hidden="true" size={24} />
          </span>
          <h2
            className="text-xl font-semibold tracking-tight text-slate-900"
            id="recent-entry-warning-title"
          >
            Prise récente du même traitement
          </h2>
        </div>
        <p
          className="mt-2 text-sm leading-6 text-slate-600"
          id="recent-entry-warning-description"
        >
          Une prise identique est enregistrée dans les quatre dernières heures.
          Vérifiez votre saisie avant de continuer.
        </p>
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-950">
          Ce repère se base sur votre historique et ne constitue pas un avis
          médical.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className="min-h-12 rounded-xl border border-slate-300 px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-28"
            disabled={isSaving}
            onClick={onCancel}
            ref={cancelButtonRef}
            type="button"
          >
            Annuler
          </button>
          <button
            className="min-h-12 rounded-xl bg-zenmed-blue px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSaving}
            onClick={onConfirm}
            ref={confirmButtonRef}
            type="button"
          >
            Enregistrer quand même
          </button>
        </div>
      </section>
    </div>
  )
}

export default RecentMedicationEntryAlert

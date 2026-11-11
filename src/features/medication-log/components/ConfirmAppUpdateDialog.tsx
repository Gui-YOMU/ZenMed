import { TriangleAlert } from 'lucide-react'
import ModalDialog from './ModalDialog'

interface ConfirmAppUpdateDialogProps {
  isApplying: boolean
  onCancel: () => void
  onConfirm: () => void
}

function ConfirmAppUpdateDialog({
  isApplying,
  onCancel,
  onConfirm,
}: ConfirmAppUpdateDialogProps) {
  return (
    <ModalDialog
      descriptionId="app-update-description"
      onEscape={() => {
        if (!isApplying) {
          onCancel()
        }
      }}
      titleId="app-update-title"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-zenmed-blue">
          <TriangleAlert aria-hidden="true" size={24} />
        </span>
        <h2
          className="text-lg font-semibold text-slate-900"
          id="app-update-title"
        >
          Mise à jour disponible
        </h2>
      </div>
      <p
        className="mt-4 text-sm leading-6 text-slate-600"
        id="app-update-description"
      >
        Une nouvelle version de ZenMed est prête. L’application va se recharger
        pour l’installer. Vos prises enregistrées seront conservées.
      </p>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          className="min-h-12 rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue disabled:opacity-50"
          disabled={isApplying}
          onClick={onCancel}
          type="button"
        >
          Plus tard
        </button>
        <button
          className="min-h-12 rounded-xl bg-zenmed-blue px-5 py-3 font-medium text-white transition-colors hover:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue disabled:opacity-50"
          disabled={isApplying}
          onClick={onConfirm}
          type="button"
        >
          {isApplying ? 'Mise à jour…' : 'Mettre à jour'}
        </button>
      </div>
    </ModalDialog>
  )
}

export default ConfirmAppUpdateDialog

import { AlertTriangle } from 'lucide-react'
import ModalDialog from './ModalDialog'

interface DeleteMedicationEntryDialogProps {
  medicationName: string
  isDeleting: boolean
  onCancel: () => void
  onConfirm: () => void
}

function DeleteMedicationEntryDialog({
  medicationName,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteMedicationEntryDialogProps) {
  return (
    <ModalDialog
      descriptionId="delete-entry-dialog-description"
      onEscape={onCancel}
      titleId="delete-entry-dialog-title"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-800">
          <AlertTriangle aria-hidden="true" size={24} />
        </span>
        <h2
          className="text-xl font-semibold tracking-tight text-slate-900"
          id="delete-entry-dialog-title"
        >
          Confirmer la suppression
        </h2>
      </div>
      <p
        className="mt-3 text-sm leading-6 text-slate-600"
        id="delete-entry-dialog-description"
      >
        Supprimer la prise de {medicationName} ? Cette action est irréversible.
      </p>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          className="min-h-12 rounded-xl border border-slate-300 px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-28"
          disabled={isDeleting}
          onClick={onCancel}
          type="button"
        >
          Annuler
        </button>
        <button
          className="min-h-12 rounded-xl bg-red-700 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isDeleting}
          onClick={onConfirm}
          type="button"
        >
          {isDeleting ? 'Suppression…' : 'Supprimer la prise'}
        </button>
      </div>
    </ModalDialog>
  )
}

export default DeleteMedicationEntryDialog

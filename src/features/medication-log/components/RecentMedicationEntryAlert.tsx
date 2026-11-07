import { AlertTriangle } from 'lucide-react'
import ModalDialog from './ModalDialog'

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
  return (
    <ModalDialog
      descriptionId="recent-entry-warning-description"
      onEscape={() => {
        if (!isSaving) {
          onCancel()
        }
      }}
      titleId="recent-entry-warning-title"
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
          type="button"
        >
          Annuler
        </button>
        <button
          className="min-h-12 rounded-xl bg-zenmed-blue px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isSaving}
          onClick={onConfirm}
          type="button"
        >
          Enregistrer quand même
        </button>
      </div>
    </ModalDialog>
  )
}

export default RecentMedicationEntryAlert

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
    <div
      aria-labelledby="recent-entry-warning"
      className="rounded-lg border border-amber-300 bg-amber-50 p-4"
      role="alert"
    >
      <p className="text-sm text-amber-950" id="recent-entry-warning">
        Une prise identique est enregistrée dans les quatre dernières heures.
        Vérifiez votre saisie avant de continuer.
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          className="min-h-11 rounded-lg bg-zenmed-blue px-4 py-2 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue disabled:opacity-50"
          disabled={isSaving}
          onClick={onConfirm}
          type="button"
        >
          Enregistrer quand même
        </button>
        <button
          className="min-h-11 rounded-lg border border-slate-300 px-4 py-2 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
          disabled={isSaving}
          onClick={onCancel}
          type="button"
        >
          Annuler
        </button>
      </div>
    </div>
  )
}

export default RecentMedicationEntryAlert

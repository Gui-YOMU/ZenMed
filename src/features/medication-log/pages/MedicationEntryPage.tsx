import {
  DOSE_UNITS,
  GALENIC_FORMS,
  type MedicationEntry,
} from '../model/medicationEntry.types'
import { useMedicationEntryPageViewModel } from '../hooks/useMedicationEntryPageViewModel'
import RecentMedicationEntryAlert from '../components/RecentMedicationEntryAlert'

interface MedicationEntryPageProps {
  onCancel: () => void
  onSaved: (entry: MedicationEntry) => Promise<void>
}

function MedicationEntryPage({
  onCancel,
  onSaved,
}: MedicationEntryPageProps) {
  const {
    register,
    validationMessage,
    submitError,
    pendingEntry,
    isSaving,
    onCancel: handleCancel,
    handleSubmit,
    confirmSave,
    cancelPendingSave,
  } = useMedicationEntryPageViewModel({ onCancel, onSaved })

  return (
    <main className="min-h-svh bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
          <button
            className="min-h-11 rounded-lg px-2 font-medium text-zenmed-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
            onClick={handleCancel}
            type="button"
          >
            Retour au journal
          </button>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">
            Ajouter une prise
          </h1>
        </div>
      </header>

      <section
        aria-labelledby="add-medication-entry-title"
        className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6"
      >
        <h2 className="sr-only" id="add-medication-entry-title">
          Informations sur la prise
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Médicament
            <input
              autoComplete="off"
              className="min-h-11 rounded-lg border border-slate-300 px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
              {...register('medicationName')}
              required
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Forme
              <select
                className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
                {...register('form')}
              >
                {GALENIC_FORMS.map((galenicForm) => (
                  <option key={galenicForm} value={galenicForm}>
                    {galenicForm}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              <label htmlFor="medication-dose">Dose</label>
              <div className="flex gap-2">
                <input
                  className="min-h-11 min-w-0 flex-1 rounded-lg border border-slate-300 px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
                  id="medication-dose"
                  inputMode="decimal"
                  min="0"
                  {...register('dose')}
                  required
                  step="any"
                  type="number"
                />
                <select
                  aria-label="Unité de dose"
                  className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
                  {...register('doseUnit')}
                >
                  {DOSE_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Date et heure de la prise
            <input
              className="min-h-11 rounded-lg border border-slate-300 px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
              {...register('takenAt')}
              required
              type="datetime-local"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Motif (facultatif)
            <input
              className="min-h-11 rounded-lg border border-slate-300 px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
              {...register('reason')}
            />
          </label>

          {validationMessage ? (
            <p className="text-sm text-red-700" role="alert">
              {validationMessage}
            </p>
          ) : null}
          {submitError ? (
            <p className="text-sm text-red-700" role="alert">
              {submitError}
            </p>
          ) : null}
          {pendingEntry ? (
            <RecentMedicationEntryAlert
              isSaving={isSaving}
              onCancel={cancelPendingSave}
              onConfirm={confirmSave}
            />
          ) : null}

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              className="min-h-11 rounded-lg border border-slate-300 px-4 py-2 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
              disabled={isSaving}
              onClick={handleCancel}
              type="button"
            >
              Fermer
            </button>
            <button
              className="min-h-11 rounded-lg bg-zenmed-blue px-4 py-2 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue disabled:opacity-50"
              disabled={isSaving || pendingEntry !== null}
              type="submit"
            >
              {isSaving ? 'Enregistrement…' : 'Enregistrer la prise'}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}

export default MedicationEntryPage

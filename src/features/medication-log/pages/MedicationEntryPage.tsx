import { ArrowLeft, CalendarClock, ClipboardList, Pill } from 'lucide-react'
import {
  DOSE_UNITS,
  GALENIC_FORMS,
  normalizeMedicationName,
  type MedicationEntry,
  type MedicationEntryRecord,
} from '../model/medicationEntry'
import { useMedicationEntryPageViewModel } from '../hooks/useMedicationEntryPageViewModel'
import RecentMedicationEntryAlert from '../components/RecentMedicationEntryAlert'

interface MedicationEntryPageProps {
  entry?: MedicationEntryRecord
  onCancel: () => void
  onSaved: (entry: MedicationEntry) => Promise<void>
}

function MedicationEntryPage({
  entry,
  onCancel,
  onSaved,
}: MedicationEntryPageProps) {
  const {
    register,
    validationMessage,
    submitError,
    recentMedicationNames,
    recentMedicationError,
    pendingEntry,
    isSaving,
    pageTitle,
    submitLabel,
    onCancel: handleCancel,
    handleSubmit,
    selectRecentMedication,
    confirmSave,
    cancelPendingSave,
  } = useMedicationEntryPageViewModel({
    existingEntry: entry,
    onCancel,
    onSaved,
  })

  return (
    <main className="min-h-svh bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 sm:py-5">
          <button
            className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 font-medium text-zenmed-blue transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
            onClick={handleCancel}
            type="button"
          >
            <ArrowLeft aria-hidden="true" size={18} />
            Retour au journal
          </button>
          <div className="mt-4 flex items-center gap-3">
            <img
              alt=""
              className="size-12 shrink-0 rounded-xl"
              height={48}
              src="/icons/icon-192.png"
              width={48}
            />
            <div>
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {pageTitle}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {entry
                  ? 'Modifiez les informations de cette prise.'
                  : 'Ajoutez les informations de votre prise.'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <section
        aria-labelledby="add-medication-entry-title"
        className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-8"
      >
        <h2 className="sr-only" id="add-medication-entry-title">
          Informations sur la prise
        </h2>
        <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-zenmed-blue">
                <Pill aria-hidden="true" size={20} />
              </span>
              <div>
                <h3 className="font-semibold text-slate-900">Médicament</h3>
                <p className="text-sm text-slate-600">
                  Quel médicament avez-vous pris ?
                </p>
              </div>
            </div>
            <label className="mt-5 flex flex-col gap-2 text-sm font-medium text-slate-700">
              Médicament
              <input
                autoComplete="off"
                className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 text-base transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-zenmed-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
                placeholder="Ex. : Paracétamol"
                {...register('medicationName')}
                required
              />
            </label>
            {recentMedicationError ? (
              <p className="mt-3 text-sm text-red-700" role="alert">
                {recentMedicationError}
              </p>
            ) : recentMedicationNames.length > 0 ? (
              <div aria-label="Médicaments récents" className="mt-5">
                <p className="mb-2 text-sm font-medium text-slate-700">
                  Récemment saisis
                </p>
                <div className="flex flex-wrap gap-2">
                  {recentMedicationNames.map((medicationName) => (
                    <button
                      className="min-h-10 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-zenmed-blue transition-colors hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
                      key={normalizeMedicationName(medicationName)}
                      onClick={() => selectRecentMedication(medicationName)}
                      type="button"
                    >
                      {medicationName}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-zenmed-blue">
                <ClipboardList aria-hidden="true" size={20} />
              </span>
              <div>
                <h3 className="font-semibold text-slate-900">Détails</h3>
                <p className="text-sm text-slate-600">
                  Précisez la forme et la dose.
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Forme galénique
                <select
                  className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 text-base transition-colors hover:border-slate-400 focus:border-zenmed-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
                  {...register('form')}
                >
                  {GALENIC_FORMS.map((galenicForm) => (
                    <option key={galenicForm} value={galenicForm}>
                      {galenicForm}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                <label htmlFor="medication-dose">Dose</label>
                <div className="flex gap-2">
                  <input
                    className="min-h-12 min-w-0 flex-1 rounded-xl border border-slate-300 px-3 text-base transition-colors hover:border-slate-400 focus:border-zenmed-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
                    id="medication-dose"
                    inputMode="decimal"
                    min="0"
                    placeholder="Ex. : 500"
                    {...register('dose')}
                    required
                    step="any"
                    type="number"
                  />
                  <select
                    aria-label="Unité de dose"
                    className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 text-base transition-colors hover:border-slate-400 focus:border-zenmed-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
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
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-zenmed-blue">
                <CalendarClock aria-hidden="true" size={20} />
              </span>
              <div>
                <h3 className="font-semibold text-slate-900">
                  Quand et pourquoi ?
                </h3>
                <p className="text-sm text-slate-600">
                  La date et l’heure sont préremplies.
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Date
                <input
                  className="min-h-12 w-full min-w-0 max-w-full rounded-xl border border-slate-300 bg-white px-1 text-sm transition-colors hover:border-slate-400 focus:border-zenmed-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue sm:px-3 sm:text-base"
                  {...register('takenDate')}
                  required
                  type="date"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Heure
                <input
                  className="min-h-12 w-full min-w-0 max-w-full rounded-xl border border-slate-300 bg-white px-1 text-sm transition-colors hover:border-slate-400 focus:border-zenmed-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue sm:px-3 sm:text-base"
                  {...register('takenTime')}
                  required
                  type="time"
                />
              </label>

              <label className="col-span-2 flex flex-col gap-2 text-sm font-medium text-slate-700">
                Motif{' '}
                <span className="font-normal text-slate-500">(facultatif)</span>
                <input
                  className="min-h-12 rounded-xl border border-slate-300 px-3 text-base transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-zenmed-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
                  placeholder="Ex. : mal de tête"
                  {...register('reason')}
                />
              </label>
            </div>
          </div>

          {validationMessage ? (
            <p
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              role="alert"
            >
              {validationMessage}
            </p>
          ) : null}
          {submitError ? (
            <p
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              role="alert"
            >
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

          <div className="flex flex-col-reverse gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:justify-end sm:gap-3 sm:p-4">
            <button
              className="min-h-12 w-full rounded-xl border border-slate-300 px-4 py-2 font-medium transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue sm:w-auto"
              disabled={isSaving}
              onClick={handleCancel}
              type="button"
            >
              Fermer
            </button>
            <button
              className="min-h-12 w-full rounded-xl bg-zenmed-blue px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              disabled={isSaving || pendingEntry !== null}
              type="submit"
            >
              {isSaving ? 'Enregistrement…' : submitLabel}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}

export default MedicationEntryPage

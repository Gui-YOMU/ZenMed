import { useMedicationLogPageViewModel } from '../hooks/useMedicationLogPageViewModel'

function MedicationLogPage() {
  const {
    errorMessage,
    groups,
    isLoading,
    refresh,
    selectDate,
    selectedDate,
    selectedDateHeading,
    selectedDateText,
  } = useMedicationLogPageViewModel()
  const hasEntries = groups.length > 0

  return (
    <main className="min-h-svh bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 sm:px-6">
          <div>
            <p className="text-sm font-medium text-zenmed-blue">ZenMed</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Mon journal
            </h1>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">{selectedDateHeading}</h2>
              <p className="mt-1 text-sm text-slate-600">{selectedDateText}</p>
            </div>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Choisir une date
              <input
                className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-base shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
                onChange={(event) => selectDate(event.currentTarget.value)}
                type="date"
                value={selectedDate}
              />
            </label>
          </div>
        </div>
      </header>

      <section
        aria-label="Prises de la journée"
        className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6"
      >
        {isLoading ? (
          <p aria-live="polite" className="text-sm text-slate-600" role="status">
            Chargement des prises…
          </p>
        ) : errorMessage ? (
          <div className="rounded-xl border border-red-200 bg-white p-4">
            <p className="text-sm text-red-700" role="alert">
              {errorMessage}
            </p>
            <button
              className="mt-3 rounded-lg bg-zenmed-blue px-4 py-2 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
              onClick={() => void refresh()}
              type="button"
            >
              Réessayer
            </button>
          </div>
        ) : !hasEntries ? (
          <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            Aucune prise enregistrée à cette date.
          </p>
        ) : (
          <p className="text-sm text-slate-600">
            Des prises sont enregistrées à cette date.
          </p>
        )}
      </section>
    </main>
  )
}

export default MedicationLogPage

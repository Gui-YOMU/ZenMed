import { useMedicationStatisticsPageViewModel } from '../hooks/useMedicationStatisticsPageViewModel'

interface MedicationStatisticsPageProps {
  onBack: () => void
  initialMedication: string
}

function MedicationStatisticsPage({
  onBack,
  initialMedication,
}: MedicationStatisticsPageProps) {
  const {
    errorMessage,
    filteredMedicationNames,
    isLoading,
    loadEntries,
    medicationNames,
    searchQuery,
    searchMedication,
    selectedMedication,
    selectMedication,
    statistics,
    recentEntries,
    hasMoreEntries,
    loadMoreEntries,
  } = useMedicationStatisticsPageViewModel(initialMedication || null)

  return (
    <main className="min-h-svh bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 sm:px-6">
          <button
            className="min-h-10 self-start rounded-lg px-3 font-medium text-zenmed-blue hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
            onClick={onBack}
            type="button"
          >
            Retour au journal
          </button>
          <div>
            <p className="text-sm font-medium text-zenmed-blue">ZenMed</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Statistiques
            </h1>
          </div>
        </div>
      </header>

      <section
        aria-label="Statistiques par médicament"
        className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-6"
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
              onClick={() => void loadEntries()}
              type="button"
            >
              Réessayer
            </button>
          </div>
        ) : medicationNames.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            Aucune prise enregistrée pour le moment.
          </p>
        ) : (
          <>
            <div className="space-y-3">
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Rechercher un médicament
                <input
                  autoComplete="off"
                  className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-base shadow-sm placeholder:font-normal placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
                  onChange={(event) =>
                    searchMedication(event.currentTarget.value)
                  }
                  placeholder="Nom du médicament"
                  type="search"
                  value={searchQuery}
                />
              </label>
              {filteredMedicationNames.length > 0 ? (
                <ul
                  aria-label="Médicaments disponibles"
                  className="flex flex-wrap gap-2"
                >
                  {filteredMedicationNames.map((name) => (
                    <li key={name.toLocaleLowerCase('fr-FR')}>
                      <button
                        aria-pressed={selectedMedication === name}
                        className={`min-h-10 rounded-full border px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue ${
                          selectedMedication === name
                            ? 'border-zenmed-blue bg-zenmed-blue text-white'
                            : 'border-blue-200 bg-white text-zenmed-blue hover:bg-blue-50'
                        }`}
                        onClick={() => selectMedication(name)}
                        type="button"
                      >
                        {name}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-600">
                  Aucun médicament ne correspond à cette recherche.
                </p>
              )}
            </div>

            {selectedMedication ? (
              <div>
                <h2 className="text-lg font-semibold">
                  Nombre de prises · {selectedMedication}
                </h2>
                <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                  {statistics.map((statistic) => (
                    <div
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                      key={statistic.period}
                    >
                      <dt className="text-sm text-slate-600">
                        {statistic.label}
                      </dt>
                      <dd className="mt-2 text-3xl font-semibold text-zenmed-blue">
                        {statistic.count}
                      </dd>
                    </div>
                  ))}
                </dl>
                <h3 className="mt-6 text-base font-semibold">
                  Les 5 prises les plus récentes
                </h3>
                {recentEntries.length > 0 ? (
                  <ul
                    aria-label="Prises récentes"
                    className="mt-3 space-y-3"
                  >
                    {recentEntries.map((entry) => (
                      <li
                        className="rounded-xl border border-slate-200 bg-white p-4"
                        key={entry.id ?? entry.takenAt}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <p className="font-medium">
                            {entry.dose} {entry.doseUnit} · {entry.form}
                          </p>
                          <time
                            className="shrink-0 text-sm text-slate-600"
                            dateTime={entry.takenAt}
                          >
                            {new Intl.DateTimeFormat('fr-FR', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            }).format(new Date(entry.takenAt))}
                          </time>
                        </div>
                        {entry.reason ? (
                          <p className="mt-2 text-sm text-slate-600">
                            Motif : {entry.reason}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-600">
                    Aucune prise enregistrée pour ce médicament.
                  </p>
                )}
                {hasMoreEntries ? (
                  <button
                    className="mt-4 min-h-11 rounded-lg border border-zenmed-blue px-5 py-2 font-medium text-zenmed-blue hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
                    onClick={loadMoreEntries}
                    type="button"
                  >
                    Afficher plus de prises
                  </button>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-slate-600">
                Sélectionnez un médicament pour afficher ses statistiques.
              </p>
            )}
          </>
        )}
      </section>
    </main>
  )
}

export default MedicationStatisticsPage

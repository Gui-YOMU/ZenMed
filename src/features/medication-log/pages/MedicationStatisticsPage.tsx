import {
  ArrowLeft,
  BarChart3,
  CalendarClock,
  ClipboardList,
  RotateCw,
} from 'lucide-react'
import GalenicFormIcon from '../components/GalenicFormIcon'
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
    hasEntries,
    isLoading,
    loadEntries,
    selectedMedication,
    statistics,
    recentEntries,
    hasMoreEntries,
    loadMoreEntries,
  } = useMedicationStatisticsPageViewModel(initialMedication || null)

  return (
    <main className="min-h-svh bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 sm:py-5">
          <button
            className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 font-medium text-zenmed-blue transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
            onClick={onBack}
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
                {selectedMedication ?? 'Statistiques'}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Statistiques du traitement
              </p>
            </div>
          </div>
        </div>
      </header>

      <section
        aria-label="Statistiques par médicament"
        className="mx-auto w-full max-w-3xl space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-8"
      >
        {isLoading ? (
          <p aria-live="polite" className="text-sm text-slate-600" role="status">
            Chargement des prises…
          </p>
        ) : errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-red-700" role="alert">
              {errorMessage}
            </p>
            <button
              className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-xl bg-zenmed-blue px-5 py-3 font-medium text-white transition-colors hover:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
              onClick={() => void loadEntries()}
              type="button"
            >
              <RotateCw aria-hidden="true" size={17} />
              Réessayer
            </button>
          </div>
        ) : !hasEntries ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-blue-50 text-zenmed-blue">
              <ClipboardList aria-hidden="true" size={26} />
            </span>
            <h2 className="mt-4 font-semibold text-slate-800">
              Aucune prise enregistrée pour le moment.
            </h2>
            <p className="mt-1 max-w-xs text-sm leading-6 text-slate-600">
              Vos statistiques apparaîtront ici après vos premières prises.
            </p>
          </div>
        ) : (
          <>
            {selectedMedication ? (
              <>
                <section
                  aria-labelledby="medication-statistics-title"
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-zenmed-blue">
                      <BarChart3 aria-hidden="true" size={20} />
                    </span>
                    <div className="min-w-0">
                      <h2
                        className="text-lg font-semibold text-slate-900"
                        id="medication-statistics-title"
                      >
                        Récapitulatif par période
                      </h2>
                    </div>
                  </div>
                  <dl className="mt-5 grid gap-3 sm:grid-cols-3">
                    {statistics.map((statistic) => (
                      <div
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                        key={statistic.period}
                      >
                        <dt className="text-sm font-medium text-slate-600">
                          {statistic.label}
                        </dt>
                        <dd className="mt-2 text-3xl font-semibold tabular-nums text-zenmed-blue">
                          {statistic.count}
                          <span className="sr-only">
                            {' '}
                            {statistic.count === 1 ? 'prise' : 'prises'}
                          </span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-4 text-sm leading-5 text-slate-600">
                    Valeurs calculées à partir de l’historique de l’application,
                    toutes formes galéniques confondues.
                  </p>
                </section>

                <section aria-labelledby="recent-medication-entries-title">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-zenmed-blue">
                      <CalendarClock aria-hidden="true" size={20} />
                    </span>
                    <div>
                      <h2
                        className="font-semibold text-slate-900"
                        id="recent-medication-entries-title"
                      >
                        Les 5 prises les plus récentes
                      </h2>
                    </div>
                  </div>
                  {recentEntries.length > 0 ? (
                    <ul
                      aria-label="Prises récentes"
                      className="mt-4 space-y-3"
                    >
                      {recentEntries.map((entry) => (
                        <li
                          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                          key={entry.id ?? entry.takenAt}
                        >
                          <div className="flex items-center gap-3 sm:gap-4">
                            <GalenicFormIcon form={entry.form} />
                            <div className="min-w-0 flex-1">
                              <h3 className="break-words text-sm font-semibold text-slate-900 sm:text-base">
                                {entry.dose} {entry.doseUnit}
                              </h3>
                              <p className="mt-1 break-words text-sm text-slate-600">
                                {entry.form.charAt(0).toLocaleUpperCase('fr-FR')}
                                {entry.form.slice(1)}
                                {entry.reason ? ` · ${entry.reason}` : ''}
                              </p>
                            </div>
                            <time
                              className="max-w-32 shrink-0 text-right text-xs leading-5 text-slate-600 sm:text-sm"
                              dateTime={entry.takenAt}
                            >
                              {new Intl.DateTimeFormat('fr-FR', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              }).format(new Date(entry.takenAt))}
                            </time>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                      Aucune prise enregistrée pour ce médicament.
                    </p>
                  )}
                  {hasMoreEntries ? (
                    <button
                      className="mt-4 min-h-12 w-full rounded-xl border border-zenmed-blue bg-white px-5 py-3 font-medium text-zenmed-blue transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue sm:w-auto"
                      onClick={loadMoreEntries}
                      type="button"
                    >
                      Afficher plus de prises
                    </button>
                  ) : null}
                </section>
              </>
            ) : (
              <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
                Ouvrez les statistiques depuis la recherche du journal en
                sélectionnant un médicament.
              </p>
            )}
          </>
        )}
      </section>
    </main>
  )
}

export default MedicationStatisticsPage

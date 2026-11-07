import { useState } from 'react'
import MedicationEntryPage from './MedicationEntryPage'
import { useMedicationLogPageViewModel } from '../hooks/useMedicationLogPageViewModel'
import { getMedicationDateKey } from '../model/medicationEntryDates'
import type { MedicationEntryRecord } from '../model/medicationEntry.types'

interface MedicationLogPageProps {
  onShowStatistics?: (medicationName?: string) => void
}

function MedicationLogPage({
  onShowStatistics,
}: MedicationLogPageProps) {
  const [isAddingEntry, setIsAddingEntry] = useState(false)
  const [editingEntry, setEditingEntry] = useState<MedicationEntryRecord | null>(
    null,
  )
  const {
    errorMessage,
    filteredMedicationNames,
    groups,
    isLoading,
    hasMore,
    loadMore,
    removeEntry,
    refresh,
    search,
    searchQuery,
    selectDate,
    selectedDate,
    selectedDateHeading,
    selectedDateText,
  } = useMedicationLogPageViewModel()
  const hasEntries = groups.length > 0

  if (isAddingEntry || editingEntry) {
    return (
      <MedicationEntryPage
        entry={editingEntry ?? undefined}
        key={editingEntry?.id ?? 'new'}
        onCancel={() => {
          setIsAddingEntry(false)
          setEditingEntry(null)
        }}
        onSaved={async (entry) => {
          selectDate(getMedicationDateKey(new Date(entry.takenAt)))
          search('')
          await refresh()
          setIsAddingEntry(false)
          setEditingEntry(null)
        }}
      />
    )
  }

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
          <div className="flex flex-wrap gap-3">
            <button
              className="min-h-11 self-start rounded-lg bg-zenmed-blue px-4 py-2 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
              onClick={() => setIsAddingEntry(true)}
              type="button"
            >
              Ajouter une prise
            </button>
            {onShowStatistics ? (
              <button
                className="min-h-11 self-start rounded-lg border border-zenmed-blue px-4 py-2 font-medium text-zenmed-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
                onClick={() => onShowStatistics()}
                type="button"
              >
                Statistiques
              </button>
            ) : null}
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
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Rechercher par médicament
            <input
              autoComplete="off"
              className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-base shadow-sm placeholder:font-normal placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
              onChange={(event) => search(event.currentTarget.value)}
              placeholder="Nom du médicament"
              type="search"
              value={searchQuery}
            />
          </label>
          {searchQuery.trim() ? (
            filteredMedicationNames.length > 0 ? (
              <ul
                aria-label="Médicaments correspondants pour les statistiques"
                className="flex flex-wrap gap-2"
              >
                {filteredMedicationNames.map((medicationName) => (
                  <li key={medicationName.toLocaleLowerCase('fr-FR')}>
                    <button
                      className="min-h-10 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-zenmed-blue hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
                      onClick={() =>
                        onShowStatistics?.(medicationName)
                      }
                      type="button"
                    >
                      Voir les statistiques de {medicationName}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-600">
                Aucun médicament ne correspond à cette recherche.
              </p>
            )
          ) : null}
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
          <div className="space-y-6">
            {groups.map((group) => (
              <section
                aria-labelledby={`medication-group-${group.dateKey}`}
                key={group.dateKey}
              >
                <h3
                  className="mb-3 text-base font-semibold text-slate-700"
                  id={`medication-group-${group.dateKey}`}
                >
                  {group.label}
                </h3>
                <ul className="space-y-3">
                  {group.entries.map((entry) => (
                    <li
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                      key={entry.id}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-semibold">{entry.medicationName}</h4>
                          <p className="mt-1 text-sm text-slate-600">
                            {entry.dose} {entry.doseUnit} · {entry.form}
                          </p>
                        </div>
                        <time
                          className="shrink-0 text-sm text-slate-600"
                          dateTime={entry.takenAt}
                        >
                          {new Intl.DateTimeFormat('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          }).format(new Date(entry.takenAt))}
                        </time>
                      </div>
                      {entry.reason ? (
                        <p className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-600">
                          Motif : {entry.reason}
                        </p>
                      ) : null}
                      {entry.id !== undefined ? (
                        <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3">
                          <button
                            className="min-h-10 rounded-lg px-3 font-medium text-zenmed-blue hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
                            onClick={() => setEditingEntry(entry)}
                            type="button"
                          >
                            Modifier
                          </button>
                          <button
                            className="min-h-10 rounded-lg px-3 font-medium text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                            onClick={() => {
                              const confirmed = window.confirm(
                                `Supprimer la prise de ${entry.medicationName} ? Cette action est irréversible.`,
                              )
                              if (confirmed && entry.id !== undefined) {
                                void removeEntry(entry.id)
                              }
                            }}
                            type="button"
                          >
                            Supprimer
                          </button>
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            {hasMore ? (
              <div className="text-center">
                <button
                  className="min-h-11 rounded-lg border border-zenmed-blue px-5 py-2 font-medium text-zenmed-blue hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
                  onClick={loadMore}
                  type="button"
                >
                  Afficher plus de prises
                </button>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </main>
  )
}

export default MedicationLogPage

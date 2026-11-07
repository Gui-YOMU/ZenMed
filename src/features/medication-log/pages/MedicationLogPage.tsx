import { useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  MoreVertical,
  Pencil,
  Pill,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import MedicationEntryPage from './MedicationEntryPage'
import GalenicFormIcon from '../components/GalenicFormIcon'
import { useMedicationLogPageViewModel } from '../hooks/useMedicationLogPageViewModel'
import { getMedicationDateKey } from '../model/medicationEntryDates'
import {
  normalizeMedicationName,
  type MedicationEntryRecord,
} from '../model/medicationEntry'

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
  const [openActionsEntryId, setOpenActionsEntryId] = useState<number | null>(
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
    <main
      className={`min-h-svh bg-slate-50 text-slate-900 ${
        searchQuery.trim() ? 'pb-80' : 'pb-28'
      }`}
    >
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex min-w-0 items-center gap-3">
            <img
              alt=""
              className="size-12 shrink-0 rounded-xl"
              height={48}
              src="/icons/icon-192.png"
              width={48}
            />
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Mon journal ZenMed
              </h1>
              <p className="mt-1 text-sm text-slate-600">{selectedDateText}</p>
            </div>
          </div>
          <label className="relative flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-zenmed-blue transition-colors hover:bg-blue-50 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-zenmed-blue">
            <span className="sr-only">Choisir une date</span>
            <CalendarDays aria-hidden="true" size={22} />
            <input
              aria-label="Choisir une date"
              className="absolute inset-0 size-full cursor-pointer opacity-0"
              onChange={(event) => selectDate(event.currentTarget.value)}
              type="date"
              value={selectedDate}
            />
          </label>
        </div>
      </header>

      <section
        aria-label="Prises de la journée"
        className="mx-auto w-full max-w-3xl px-4 py-6 pb-10 sm:px-6 sm:py-8 sm:pb-12"
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
              className="mt-4 min-h-12 rounded-xl bg-zenmed-blue px-5 py-3 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
              onClick={() => void refresh()}
              type="button"
            >
              Réessayer
            </button>
          </div>
        ) : !hasEntries ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-blue-50 text-zenmed-blue">
              <ClipboardList aria-hidden="true" size={26} />
            </span>
            <h3 className="mt-4 font-semibold text-slate-800">
              Aucune prise enregistrée à cette date.
            </h3>
            <p className="mt-1 max-w-xs text-sm leading-6 text-slate-600">
              Ajoutez une prise pour commencer votre journal de santé.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <section
                aria-labelledby={`medication-group-${group.dateKey}`}
                key={group.dateKey}
              >
                <h3
                  className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-700"
                  id={`medication-group-${group.dateKey}`}
                >
                  <CalendarDays aria-hidden="true" size={18} />
                  {group.label}
                </h3>
                <ul className="space-y-3">
                  {group.entries.map((entry) => (
                    <li
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
                      key={entry.id}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <GalenicFormIcon form={entry.form} />
                        <div className="min-w-0 flex-1 self-center">
                          <h4
                            aria-label={`${entry.medicationName} · ${entry.dose} ${entry.doseUnit}`}
                            className="break-words text-sm font-semibold leading-5 text-slate-900 sm:text-base"
                          >
                            {entry.medicationName}
                            <span className="font-normal text-slate-500">
                              {' '}
                              · {entry.dose} {entry.doseUnit}
                            </span>
                          </h4>
                          <p className="mt-1 break-words text-sm leading-5 text-slate-600">
                            {entry.form.charAt(0).toLocaleUpperCase('fr-FR')}
                            {entry.form.slice(1)}
                            {entry.reason ? ` · ${entry.reason}` : ''}
                          </p>
                        </div>
                        <time
                          className="shrink-0 rounded-lg bg-slate-50 px-2 py-1.5 text-xs font-medium tabular-nums text-slate-600 sm:px-2.5 sm:text-sm"
                          dateTime={entry.takenAt}
                        >
                          {new Intl.DateTimeFormat('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          }).format(new Date(entry.takenAt))}
                        </time>
                        {entry.id !== undefined ? (
                          <div
                            aria-label={`Actions pour ${entry.medicationName}`}
                            className="flex shrink-0 flex-col items-center gap-1"
                            role="group"
                          >
                            {openActionsEntryId === entry.id ? (
                              <>
                                <button
                                  aria-label={`Modifier ${entry.medicationName}`}
                                  className="flex size-10 items-center justify-center rounded-xl text-zenmed-blue transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
                                  onClick={() => setEditingEntry(entry)}
                                  type="button"
                                >
                                  <Pencil aria-hidden="true" size={19} />
                                </button>
                                <button
                                  aria-label={`Supprimer ${entry.medicationName}`}
                                  className="flex size-10 items-center justify-center rounded-xl text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                                  onClick={() => {
                                    const confirmed = window.confirm(
                                      `Supprimer la prise de ${entry.medicationName} ? Cette action est irréversible.`,
                                    )
                                    if (confirmed && entry.id !== undefined) {
                                      void removeEntry(entry.id)
                                    }
                                    setOpenActionsEntryId(null)
                                  }}
                                  type="button"
                                >
                                  <Trash2 aria-hidden="true" size={19} />
                                </button>
                              </>
                            ) : (
                              <button
                                aria-label={`Actions pour ${entry.medicationName}`}
                                aria-expanded="false"
                                className="flex size-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
                                onClick={() =>
                                  setOpenActionsEntryId(entry.id ?? null)
                                }
                                type="button"
                              >
                                <MoreVertical aria-hidden="true" size={21} />
                              </button>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            {hasMore ? (
              <div className="text-center">
                <button
                  className="min-h-12 w-full rounded-xl border border-zenmed-blue bg-white px-5 py-3 font-semibold text-zenmed-blue transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue sm:w-auto"
                  onClick={loadMore}
                  type="button"
                >
                  <span className="inline-flex items-center gap-2">
                    <ArrowRight aria-hidden="true" size={18} />
                  Afficher plus de prises
                  </span>
                </button>
              </div>
            ) : null}
          </div>
        )}
      </section>
      <footer className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="mx-auto w-full max-w-3xl px-4 py-3 sm:px-6">
          <div className="flex items-end gap-3">
            <label className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-medium text-slate-700">
              Rechercher par médicament
              <span className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={19}
                />
                <input
                  autoComplete="off"
                  className="min-h-12 w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-3 text-base shadow-sm placeholder:font-normal placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
                  onChange={(event) => search(event.currentTarget.value)}
                  placeholder="Nom du médicament"
                  type="search"
                  value={searchQuery}
                />
              </span>
            </label>
            <button
              aria-label="Ajouter une prise"
              className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-zenmed-blue text-white shadow-sm transition-colors hover:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
              onClick={() => setIsAddingEntry(true)}
              type="button"
            >
              <Plus aria-hidden="true" size={24} />
            </button>
          </div>
          {searchQuery.trim() ? (
            filteredMedicationNames.length > 0 ? (
              <ul
                aria-label="Médicaments correspondants pour les statistiques"
                className="grid max-h-40 gap-2 overflow-y-auto pt-3 sm:grid-cols-2"
              >
                {filteredMedicationNames.map((medicationName) => (
                  <li key={normalizeMedicationName(medicationName)}>
                    <button
                      aria-label={`Voir les statistiques de ${medicationName}`}
                      className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-left font-medium text-zenmed-blue transition-colors hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
                      onClick={() =>
                        onShowStatistics?.(medicationName)
                      }
                      type="button"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <Pill aria-hidden="true" className="shrink-0" size={18} />
                        <span className="truncate">{medicationName}</span>
                      </span>
                      <ArrowRight
                        aria-hidden="true"
                        className="shrink-0"
                        size={18}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="pt-2 text-sm text-slate-600">
                Aucun médicament ne correspond à cette recherche.
              </p>
            )
          ) : null}
        </div>
      </footer>
    </main>
  )
}

export default MedicationLogPage

import { ArrowRight, Pill, Plus, Search } from 'lucide-react'
import { normalizeMedicationName } from '../model/medicationEntry'

interface MedicationLogFooterProps {
  searchQuery: string
  filteredMedicationNames: string[]
  onSearch: (query: string) => void
  onAddEntry: () => void
  onShowStatistics?: (medicationName?: string) => void
}

function MedicationLogFooter({
  searchQuery,
  filteredMedicationNames,
  onSearch,
  onAddEntry,
  onShowStatistics,
}: MedicationLogFooterProps) {
  return (
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
                onChange={(event) => onSearch(event.currentTarget.value)}
                placeholder="Nom du médicament"
                type="search"
                value={searchQuery}
              />
            </span>
          </label>
          <button
            aria-label="Ajouter une prise"
            className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-zenmed-blue text-white shadow-sm transition-colors hover:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
            onClick={onAddEntry}
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
                    onClick={() => onShowStatistics?.(medicationName)}
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
  )
}

export default MedicationLogFooter

import { CalendarClock } from 'lucide-react'
import type { MedicationEntryRecord } from '../model/medicationEntry'
import MedicationEntryCard from './MedicationEntryCard'

interface MedicationRecentEntriesProps {
  entries: MedicationEntryRecord[]
  hasMore: boolean
  onLoadMore: () => void
}

function MedicationRecentEntries({
  entries,
  hasMore,
  onLoadMore,
}: MedicationRecentEntriesProps) {
  return (
    <section aria-labelledby="recent-medication-entries-title">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-zenmed-blue">
          <CalendarClock aria-hidden="true" size={20} />
        </span>
        <h2
          className="font-semibold text-slate-900"
          id="recent-medication-entries-title"
        >
          Les 5 prises les plus récentes
        </h2>
      </div>
      {entries.length > 0 ? (
        <ul aria-label="Prises récentes" className="mt-4 space-y-3">
          {entries.map((entry) => (
            <MedicationEntryCard
              key={entry.id ?? entry.takenAt}
              entry={entry}
              headingLevel={3}
              showMedicationName={false}
              timestampDisplay="date-time"
            />
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Aucune prise enregistrée pour ce médicament.
        </p>
      )}
      {hasMore ? (
        <button
          className="mt-4 min-h-12 w-full rounded-xl border border-zenmed-blue bg-white px-5 py-3 font-medium text-zenmed-blue transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue sm:w-auto"
          onClick={onLoadMore}
          type="button"
        >
          Afficher plus de prises
        </button>
      ) : null}
    </section>
  )
}

export default MedicationRecentEntries

import { useState } from 'react'
import { ClipboardList } from 'lucide-react'
import MedicationEntryPage from './MedicationEntryPage'
import MedicationEntryGroups from '../components/MedicationEntryGroups'
import MedicationLogFooter from '../components/MedicationLogFooter'
import MedicationPageHeader from '../components/MedicationPageHeader'
import { useMedicationLogPageViewModel } from '../hooks/useMedicationLogPageViewModel'
import { getMedicationDateKey } from '../model/medicationEntryDates'
import {
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
      <MedicationPageHeader
        title="Mon journal ZenMed"
        subtitle={selectedDateText}
        selectedDate={selectedDate}
        onDateChange={selectDate}
      />

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
          <MedicationEntryGroups
            groups={groups}
            hasMore={hasMore}
            onEdit={setEditingEntry}
            onLoadMore={loadMore}
            onRemove={(entryId) => void removeEntry(entryId)}
          />
        )}
      </section>
      <MedicationLogFooter
        filteredMedicationNames={filteredMedicationNames}
        onAddEntry={() => setIsAddingEntry(true)}
        onSearch={search}
        onShowStatistics={onShowStatistics}
        searchQuery={searchQuery}
      />
    </main>
  )
}

export default MedicationLogPage

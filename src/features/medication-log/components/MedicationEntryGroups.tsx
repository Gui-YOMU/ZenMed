import { useState } from 'react'
import { ArrowRight, CalendarDays } from 'lucide-react'
import type { MedicationEntryRecord } from '../model/medicationEntry'
import type { MedicationEntryGroup } from '../model/medicationEntryGroups'
import MedicationEntryCard from './MedicationEntryCard'
import DeleteMedicationEntryDialog from './DeleteMedicationEntryDialog'

interface MedicationEntryGroupsProps {
  groups: MedicationEntryGroup[]
  hasMore: boolean
  onLoadMore: () => void
  onEdit: (entry: MedicationEntryRecord) => void
  onRemove: (entryId: number) => Promise<boolean>
}

function MedicationEntryGroups({
  groups,
  hasMore,
  onLoadMore,
  onEdit,
  onRemove,
}: MedicationEntryGroupsProps) {
  const [openActionsEntryId, setOpenActionsEntryId] = useState<number | null>(
    null,
  )
  const [pendingDeletion, setPendingDeletion] =
    useState<MedicationEntryRecord | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const confirmDeletion = async () => {
    if (pendingDeletion?.id === undefined) {
      return
    }

    setIsDeleting(true)
    await onRemove(pendingDeletion.id)
    setIsDeleting(false)
    setPendingDeletion(null)
    setOpenActionsEntryId(null)
  }

  return (
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
            {group.entries.map((entry) => {
              const entryId = entry.id
              const actions =
                entryId === undefined
                  ? undefined
                  : {
                      isOpen: openActionsEntryId === entryId,
                      onToggle: () => setOpenActionsEntryId(entryId),
                      onEdit: () => onEdit(entry),
                      onDelete: () => setPendingDeletion(entry),
                    }

              return (
                <MedicationEntryCard
                  key={entry.id}
                  entry={entry}
                  actions={actions}
                />
              )
            })}
          </ul>
        </section>
      ))}
      {hasMore ? (
        <div className="text-center">
          <button
            className="min-h-12 w-full rounded-xl border border-zenmed-blue bg-white px-5 py-3 font-semibold text-zenmed-blue transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue sm:w-auto"
            onClick={onLoadMore}
            type="button"
          >
            <span className="inline-flex items-center gap-2">
              <ArrowRight aria-hidden="true" size={18} />
              Afficher plus de prises
            </span>
          </button>
        </div>
      ) : null}
      {pendingDeletion ? (
        <DeleteMedicationEntryDialog
          isDeleting={isDeleting}
          medicationName={pendingDeletion.medicationName}
          onCancel={() => setPendingDeletion(null)}
          onConfirm={() => void confirmDeletion()}
        />
      ) : null}
    </div>
  )
}

export default MedicationEntryGroups

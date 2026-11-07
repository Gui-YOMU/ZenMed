import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import type { MedicationEntryRecord } from '../model/medicationEntry'
import GalenicFormIcon from './GalenicFormIcon'

interface MedicationEntryCardActions {
  isOpen: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}

interface MedicationEntryCardProps {
  entry: MedicationEntryRecord
  showMedicationName?: boolean
  timestampDisplay?: 'time' | 'date-time'
  headingLevel?: 3 | 4
  actions?: MedicationEntryCardActions
}

function MedicationEntryCard({
  entry,
  showMedicationName = true,
  timestampDisplay = 'time',
  headingLevel = 4,
  actions,
}: MedicationEntryCardProps) {
  const Heading = headingLevel === 3 ? 'h3' : 'h4'
  const timestamp = new Intl.DateTimeFormat(
    'fr-FR',
    timestampDisplay === 'time'
      ? { hour: '2-digit', minute: '2-digit' }
      : { dateStyle: 'medium', timeStyle: 'short' },
  ).format(new Date(entry.takenAt))

  return (
    <li
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 ${
        actions ? 'transition-shadow hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <GalenicFormIcon form={entry.form} />
        <div className="min-w-0 flex-1 self-center">
          <Heading
            aria-label={
              showMedicationName
                ? `${entry.medicationName} · ${entry.dose} ${entry.doseUnit}`
                : undefined
            }
            className="break-words text-sm font-semibold leading-5 text-slate-900 sm:text-base"
          >
            {showMedicationName ? (
              <>
                {entry.medicationName}
                <span className="font-normal text-slate-500">
                  {' '}
                  · {entry.dose} {entry.doseUnit}
                </span>
              </>
            ) : (
              `${entry.dose} ${entry.doseUnit}`
            )}
          </Heading>
          <p className="mt-1 break-words text-sm leading-5 text-slate-600">
            {entry.form.charAt(0).toLocaleUpperCase('fr-FR')}
            {entry.form.slice(1)}
            {entry.reason ? ` · ${entry.reason}` : ''}
          </p>
        </div>
        <time
          className={
            timestampDisplay === 'time'
              ? 'shrink-0 rounded-lg bg-slate-50 px-2 py-1.5 text-xs font-medium tabular-nums text-slate-600 sm:px-2.5 sm:text-sm'
              : 'max-w-32 shrink-0 text-right text-xs leading-5 text-slate-600 sm:text-sm'
          }
          dateTime={entry.takenAt}
        >
          {timestamp}
        </time>
        {entry.id !== undefined && actions ? (
          <div
            aria-label={`Actions pour ${entry.medicationName}`}
            className="flex shrink-0 flex-col items-center gap-1"
            role="group"
          >
            {actions.isOpen ? (
              <>
                <button
                  aria-label={`Modifier ${entry.medicationName}`}
                  className="flex size-10 items-center justify-center rounded-xl text-zenmed-blue transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
                  onClick={actions.onEdit}
                  type="button"
                >
                  <Pencil aria-hidden="true" size={19} />
                </button>
                <button
                  aria-label={`Supprimer ${entry.medicationName}`}
                  className="flex size-10 items-center justify-center rounded-xl text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                  onClick={actions.onDelete}
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
                onClick={actions.onToggle}
                type="button"
              >
                <MoreVertical aria-hidden="true" size={21} />
              </button>
            )}
          </div>
        ) : null}
      </div>
    </li>
  )
}

export default MedicationEntryCard

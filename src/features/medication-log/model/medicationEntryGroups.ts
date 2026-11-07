import type { MedicationEntryRecord } from './medicationEntry.types'
import {
  getMedicationDateKey,
  getMedicationDateLabel,
} from './medicationEntryDates'

export interface MedicationEntryGroup {
  dateKey: string
  label: string
  entries: MedicationEntryRecord[]
}

export function groupMedicationEntriesByDate(
  entries: MedicationEntryRecord[],
  todayDateKey: string,
): MedicationEntryGroup[] {
  const groups = new Map<string, MedicationEntryGroup>()

  for (const entry of entries) {
    const takenAt = new Date(entry.takenAt)
    const dateKey = getMedicationDateKey(takenAt)
    let group = groups.get(dateKey)

    if (!group) {
      group = {
        dateKey,
        label: getMedicationDateLabel(takenAt, todayDateKey),
        entries: [],
      }
      groups.set(dateKey, group)
    }

    group.entries.push(entry)
  }

  return Array.from(groups.values())
}

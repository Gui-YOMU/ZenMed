import type { MedicationEntryRecord } from './medicationEntry.types'

export interface MedicationEntryGroup {
  dateKey: string
  label: string
  entries: MedicationEntryRecord[]
}

function toLocalDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getGroupLabel(date: Date, dateKey: string, today: Date): string {
  if (dateKey === toLocalDateKey(today)) {
    return 'Aujourd’hui'
  }

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (dateKey === toLocalDateKey(yesterday)) {
    return 'Hier'
  }

  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(date)
}

export function groupMedicationEntriesByDate(
  entries: MedicationEntryRecord[],
  now: Date = new Date(),
): MedicationEntryGroup[] {
  const groups = new Map<string, MedicationEntryGroup>()

  for (const entry of entries) {
    const takenAt = new Date(entry.takenAt)
    const dateKey = toLocalDateKey(takenAt)
    let group = groups.get(dateKey)

    if (!group) {
      group = {
        dateKey,
        label: getGroupLabel(takenAt, dateKey, now),
        entries: [],
      }
      groups.set(dateKey, group)
    }

    group.entries.push(entry)
  }

  return Array.from(groups.values())
}

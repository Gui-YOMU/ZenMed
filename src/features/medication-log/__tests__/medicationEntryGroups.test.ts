import { describe, expect, it } from 'vitest'
import type { MedicationEntryRecord } from '../model/medicationEntry'
import { groupMedicationEntriesByDate } from '../model/medicationEntryGroups'

function localTimestamp(
  year: number,
  month: number,
  day: number,
  hour: number,
): string {
  return new Date(year, month - 1, day, hour).toISOString()
}

function entry(id: number, takenAt: string): MedicationEntryRecord {
  return {
    id,
    medicationName: `Médicament ${id}`,
    form: 'comprimé',
    dose: 500,
    doseUnit: 'mg',
    takenAt,
  }
}

describe('groupMedicationEntriesByDate', () => {
  const now = new Date(2026, 10, 7, 12)
  const todayDateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  it('labels today, yesterday, and earlier dates in French', () => {
    const groups = groupMedicationEntriesByDate(
      [
        entry(1, localTimestamp(2026, 11, 7, 10)),
        entry(2, localTimestamp(2026, 11, 6, 18)),
        entry(3, localTimestamp(2026, 11, 5, 9)),
      ],
      todayDateKey,
    )

    expect(groups.map(({ label }) => label)).toEqual([
      'Aujourd’hui',
      'Hier',
      '5 novembre 2026',
    ])
  })

  it('regroupe les prises par date locale tout en conservant leur ordre initial', () => {
    const laterToday = entry(1, localTimestamp(2026, 11, 7, 20))
    const earlierToday = entry(2, localTimestamp(2026, 11, 7, 8))
    const yesterday = entry(3, localTimestamp(2026, 11, 6, 23))

    const groups = groupMedicationEntriesByDate(
      [laterToday, earlierToday, yesterday],
      todayDateKey,
    )

    expect(groups).toHaveLength(2)
    expect(groups[0].entries).toEqual([laterToday, earlierToday])
    expect(groups[1].entries).toEqual([yesterday])
  })

  it('ne renvoie aucun groupe de dates en l’absence de prises', () => {
    expect(groupMedicationEntriesByDate([], todayDateKey)).toEqual([])
  })

  it('gère correctement les dates du calendrier au passage d’un mois à l’autre', () => {
    const monthEnd = new Date(2026, 11, 1, 10)

    const groups = groupMedicationEntriesByDate(
      [entry(1, localTimestamp(2026, 11, 30, 20))],
      `${monthEnd.getFullYear()}-${String(monthEnd.getMonth() + 1).padStart(2, '0')}-${String(monthEnd.getDate()).padStart(2, '0')}`,
    )

    expect(groups[0].label).toBe('Hier')
  })
})

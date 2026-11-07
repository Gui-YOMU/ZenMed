import {
  normalizeMedicationName,
  type MedicationEntryRecord,
} from './medicationEntry'

export const STATISTICS_PERIODS = [
  { id: '7-days', label: '7 derniers jours', unit: 'days', amount: 7 },
  { id: '30-days', label: '30 derniers jours', unit: 'days', amount: 30 },
  { id: '12-months', label: '12 derniers mois', unit: 'months', amount: 12 },
] as const

export type MedicationStatisticsPeriod =
  (typeof STATISTICS_PERIODS)[number]['id']

export interface MedicationStatistic {
  period: MedicationStatisticsPeriod
  label: string
  count: number
}

function subtractMonths(date: Date, amount: number): Date {
  const result = new Date(date)
  const originalDay = result.getDate()
  result.setDate(1)
  result.setMonth(result.getMonth() - amount)
  const lastDayOfTargetMonth = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0,
  ).getDate()
  result.setDate(Math.min(originalDay, lastDayOfTargetMonth))
  return result
}

function getPeriodStart(
  now: Date,
  period: (typeof STATISTICS_PERIODS)[number],
): Date {
  if (period.unit === 'months') {
    return subtractMonths(now, period.amount)
  }

  const start = new Date(now)
  start.setDate(start.getDate() - period.amount)
  return start
}

export function getMedicationStatistics(
  entries: MedicationEntryRecord[],
  medicationName: string,
  now: Date = new Date(),
): MedicationStatistic[] {
  const normalizedMedicationName = normalizeMedicationName(medicationName)

  return STATISTICS_PERIODS.map((period) => {
    const start = getPeriodStart(now, period).getTime()
    const end = now.getTime()
    const count = entries.filter((entry) => {
      const takenAt = new Date(entry.takenAt).getTime()

      return (
        normalizeMedicationName(entry.medicationName) ===
          normalizedMedicationName &&
        takenAt >= start &&
        takenAt <= end
      )
    }).length

    return { period: period.id, label: period.label, count }
  })
}

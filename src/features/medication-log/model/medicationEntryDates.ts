export function getMedicationDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseMedicationDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatMedicationDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(date)
}

export function getMedicationDateLabel(
  date: Date,
  todayDateKey: string,
): string {
  const dateKey = getMedicationDateKey(date)

  if (dateKey === todayDateKey) {
    return 'Aujourd’hui'
  }

  const yesterday = parseMedicationDateKey(todayDateKey)
  yesterday.setDate(yesterday.getDate() - 1)

  if (dateKey === getMedicationDateKey(yesterday)) {
    return 'Hier'
  }

  return formatMedicationDate(date)
}

import { useMedicationEntries } from './useMedicationEntries'
import { groupMedicationEntriesByDate } from '../model/medicationEntryGroups'
import {
  formatMedicationDate,
  parseMedicationDateKey,
} from '../model/medicationEntryDates'

export function useMedicationLogPageViewModel() {
  const medicationEntries = useMedicationEntries()
  const groups = groupMedicationEntriesByDate(
    medicationEntries.entries,
    medicationEntries.todayDateKey,
  )
  const selectedDateText = medicationEntries.selectedDate
    ? formatMedicationDate(
        parseMedicationDateKey(medicationEntries.selectedDate),
      )
    : 'Toutes les dates'

  return {
    ...medicationEntries,
    groups,
    selectedDateText,
  }
}

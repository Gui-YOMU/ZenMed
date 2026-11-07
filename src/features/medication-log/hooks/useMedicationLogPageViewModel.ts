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
  const selectedDate = parseMedicationDateKey(medicationEntries.selectedDate)
  const selectedDateText = formatMedicationDate(selectedDate)

  return {
    ...medicationEntries,
    groups,
    selectedDateText,
  }
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { listMedicationEntries } from '../data/medicationEntryRepository'
import {
  normalizeMedicationName,
  type MedicationEntryRecord,
} from '../model/medicationEntry'
import { getMedicationStatistics } from '../model/medicationStatistics'

async function readMedicationEntries(): Promise<
  | { entries: MedicationEntryRecord[]; errorMessage: null }
  | { entries: null; errorMessage: string }
> {
  try {
    return { entries: await listMedicationEntries(), errorMessage: null }
  } catch {
    return {
      entries: null,
      errorMessage: 'Impossible de charger les prises enregistrées.',
    }
  }
}

export function useMedicationStatisticsPageViewModel(
  initialMedication: string | null,
) {
  const [entries, setEntries] = useState<MedicationEntryRecord[]>([])
  const selectedMedication = initialMedication
  const [visibleEntryCount, setVisibleEntryCount] = useState(5)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isCurrent = true

    const loadEntries = async () => {
      const result = await readMedicationEntries()
      if (!isCurrent) {
        return
      }

      setEntries(result.entries ?? [])
      setErrorMessage(result.errorMessage)
      setIsLoading(false)
    }

    void loadEntries()
    return () => {
      isCurrent = false
    }
  }, [])

  const loadEntries = useCallback(async () => {
    setIsLoading(true)
    const result = await readMedicationEntries()
    setEntries(result.entries ?? [])
    setErrorMessage(result.errorMessage)
    setIsLoading(false)
  }, [])

  const selectedMedicationEntries = useMemo(
    () =>
      selectedMedication
        ? entries.filter(
            (entry) =>
              normalizeMedicationName(entry.medicationName) ===
              normalizeMedicationName(selectedMedication),
          )
        : [],
    [entries, selectedMedication],
  )
  const statistics = useMemo(
    () =>
      selectedMedication
        ? getMedicationStatistics(entries, selectedMedication)
        : [],
    [entries, selectedMedication],
  )
  const loadMoreEntries = useCallback(() => {
    setVisibleEntryCount((count) =>
      Math.min(count + 5, selectedMedicationEntries.length),
    )
  }, [selectedMedicationEntries.length])

  return {
    errorMessage,
    isLoading,
    loadEntries,
    hasEntries: entries.length > 0,
    selectedMedication,
    statistics,
    recentEntries: selectedMedicationEntries.slice(0, visibleEntryCount),
    hasMoreEntries: visibleEntryCount < selectedMedicationEntries.length,
    loadMoreEntries,
  }
}

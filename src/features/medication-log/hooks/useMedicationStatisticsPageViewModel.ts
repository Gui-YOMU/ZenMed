import { useCallback, useEffect, useMemo, useState } from 'react'
import { listMedicationEntries } from '../data/medicationEntryRepository'
import type { MedicationEntryRecord } from '../model/medicationEntry.types'
import { getMedicationStatistics } from '../model/medicationStatistics'

function normalizeMedicationName(name: string): string {
  return name.trim().toLocaleLowerCase('fr-FR')
}

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
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMedication, setSelectedMedication] =
    useState<string | null>(initialMedication)
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

  const medicationNames = useMemo(() => {
    const seenNames = new Set<string>()
    const names: string[] = []

    for (const entry of entries) {
      const normalizedName = normalizeMedicationName(entry.medicationName)

      if (!seenNames.has(normalizedName)) {
        seenNames.add(normalizedName)
        names.push(entry.medicationName.trim())
      }
    }

    return names
  }, [entries])

  const filteredMedicationNames = useMemo(() => {
    const normalizedQuery = normalizeMedicationName(searchQuery)

    return medicationNames.filter((name) =>
      normalizeMedicationName(name).includes(normalizedQuery),
    )
  }, [medicationNames, searchQuery])

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
  const selectMedication = useCallback((medicationName: string) => {
    setSelectedMedication(medicationName)
    setVisibleEntryCount(5)
  }, [])
  const loadMoreEntries = useCallback(() => {
    setVisibleEntryCount((count) =>
      Math.min(count + 5, selectedMedicationEntries.length),
    )
  }, [selectedMedicationEntries.length])

  return {
    errorMessage,
    filteredMedicationNames,
    isLoading,
    loadEntries,
    medicationNames,
    searchQuery,
    searchMedication: setSearchQuery,
    selectedMedication,
    selectMedication,
    statistics,
    recentEntries: selectedMedicationEntries.slice(0, visibleEntryCount),
    hasMoreEntries: visibleEntryCount < selectedMedicationEntries.length,
    loadMoreEntries,
  }
}

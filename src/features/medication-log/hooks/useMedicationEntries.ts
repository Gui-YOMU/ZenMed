import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  deleteMedicationEntry,
  listMedicationEntries,
} from '../data/medicationEntryRepository'
import type { MedicationEntryRecord } from '../model/medicationEntry.types'

const PAGE_SIZE = 5

function toLocalDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getTodayDateKey(): string {
  return toLocalDateKey(new Date())
}

export function useMedicationEntries() {
  const [entries, setEntries] = useState<MedicationEntryRecord[]>([])
  const [todayDateKey] = useState(getTodayDateKey)
  const [selectedDate, setSelectedDate] = useState(todayDateKey)
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isCurrent = true

    const loadEntries = async () => {
      try {
        const loadedEntries = await listMedicationEntries()

        if (isCurrent) {
          setEntries(loadedEntries)
          setErrorMessage(null)
        }
      } catch {
        if (isCurrent) {
          setErrorMessage('Impossible de charger les prises enregistrées.')
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    void loadEntries()
    return () => {
      isCurrent = false
    }
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)

    try {
      const loadedEntries = await listMedicationEntries()
      setEntries(loadedEntries)
      setErrorMessage(null)
    } catch {
      setErrorMessage('Impossible de charger les prises enregistrées.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const removeEntry = useCallback(
    async (entryId: number) => {
      try {
        const deleted = await deleteMedicationEntry(entryId)

        if (!deleted) {
          setErrorMessage(
            `Impossible de supprimer la prise ${entryId} : elle n’existe pas.`,
          )
          return false
        }

        await refresh()
        return true
      } catch {
        setErrorMessage('Impossible de supprimer cette prise.')
        return false
      }
    },
    [refresh],
  )

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const entryDate = toLocalDateKey(new Date(entry.takenAt))
      return entryDate === selectedDate
    })
  }, [entries, selectedDate])

  const medicationNames = useMemo(() => {
    const seenNames = new Set<string>()
    const names: string[] = []

    for (const entry of entries) {
      const medicationName = entry.medicationName.trim()
      const normalizedName = medicationName.toLocaleLowerCase('fr-FR')

      if (!seenNames.has(normalizedName)) {
        seenNames.add(normalizedName)
        names.push(medicationName)
      }
    }

    return names
  }, [entries])

  const filteredMedicationNames = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase('fr-FR')

    return medicationNames.filter((name) =>
      name.toLocaleLowerCase('fr-FR').includes(normalizedQuery),
    )
  }, [medicationNames, searchQuery])

  const visibleEntries = filteredEntries.slice(0, visibleCount)
  const hasMore = visibleCount < filteredEntries.length

  const selectDate = useCallback((date: string) => {
    setSelectedDate(date)
    setVisibleCount(PAGE_SIZE)
  }, [])

  const search = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const loadMore = useCallback(() => {
    setVisibleCount((count) =>
      Math.min(count + PAGE_SIZE, filteredEntries.length),
    )
  }, [filteredEntries.length])

  return {
    entries: visibleEntries,
    filteredMedicationNames,
    todayDateKey,
    selectedDate,
    searchQuery,
    isLoading,
    errorMessage,
    hasMore,
    selectDate,
    search,
    loadMore,
    removeEntry,
    refresh,
  }
}

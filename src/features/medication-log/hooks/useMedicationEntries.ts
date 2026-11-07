import { useCallback, useEffect, useMemo, useState } from 'react'
import { listMedicationEntries } from '../data/medicationEntryRepository'
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
  const [selectedDate, setSelectedDate] = useState(getTodayDateKey)
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

  const filteredEntries = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase('fr-FR')

    return entries.filter((entry) => {
      const entryDate = toLocalDateKey(new Date(entry.takenAt))
      const matchesDate = entryDate === selectedDate
      const matchesMedication =
        normalizedQuery.length === 0 ||
        entry.medicationName
          .trim()
          .toLocaleLowerCase('fr-FR')
          .includes(normalizedQuery)

      return matchesDate && matchesMedication
    })
  }, [entries, searchQuery, selectedDate])

  const visibleEntries = filteredEntries.slice(0, visibleCount)
  const hasMore = visibleCount < filteredEntries.length

  const selectDate = useCallback((date: string) => {
    setSelectedDate(date)
    setVisibleCount(PAGE_SIZE)
  }, [])

  const search = useCallback((query: string) => {
    setSearchQuery(query)
    setVisibleCount(PAGE_SIZE)
  }, [])

  const loadMore = useCallback(() => {
    setVisibleCount((count) =>
      Math.min(count + PAGE_SIZE, filteredEntries.length),
    )
  }, [filteredEntries.length])

  return {
    entries: visibleEntries,
    selectedDate,
    searchQuery,
    isLoading,
    errorMessage,
    hasMore,
    selectDate,
    search,
    loadMore,
    refresh,
  }
}

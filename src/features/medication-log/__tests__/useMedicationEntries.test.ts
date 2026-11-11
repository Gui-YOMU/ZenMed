import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { createMedicationEntry } from '../data/medicationEntryRepository'
import { useMedicationEntries } from '../hooks/useMedicationEntries'
import type { MedicationEntry } from '../model/medicationEntry'
import { database } from '../../../shared/storage/database'

function localDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function atLocalTime(date: Date, hour: number): string {
  const timestamp = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hour,
  )

  return timestamp.toISOString()
}

function makeEntry(
  medicationName: string,
  takenAt: string,
): MedicationEntry {
  return {
    medicationName,
    form: 'comprimé',
    dose: 500,
    doseUnit: 'mg',
    takenAt,
  }
}

describe('useMedicationEntries', () => {
  beforeEach(async () => {
    await database.delete()
    await database.open()
  })

  it('affiche les cinq prises les plus récentes toutes dates confondues', async () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    for (let hour = 7; hour < 10; hour += 1) {
      await createMedicationEntry(
        makeEntry(`Traitement ${hour}`, atLocalTime(today, hour)),
      )
    }
    for (let hour = 10; hour < 13; hour += 1) {
      await createMedicationEntry(
        makeEntry(`Hier ${hour}`, atLocalTime(yesterday, hour)),
      )
    }

    const { result } = renderHook(() => useMedicationEntries())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.selectedDate).toBeNull()
    expect(result.current.entries).toHaveLength(5)
    expect(result.current.entries.map((entry) => entry.medicationName)).toEqual([
      'Traitement 9',
      'Traitement 8',
      'Traitement 7',
      'Hier 12',
      'Hier 11',
    ])
    expect(result.current.hasMore).toBe(true)

    act(() => result.current.loadMore())

    expect(result.current.entries).toHaveLength(6)
    expect(result.current.hasMore).toBe(false)
    expect(result.current.entries[5].medicationName).toBe('Hier 10')
  })

  it('recherche les médicaments correspondants sans filtrer la liste du journal', async () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    await createMedicationEntry(
      makeEntry('Doliprane', atLocalTime(today, 9)),
    )
    await createMedicationEntry(
      makeEntry('Ibuprofène', atLocalTime(today, 10)),
    )
    await createMedicationEntry(
      makeEntry('Doliprane', atLocalTime(yesterday, 11)),
    )

    const { result } = renderHook(() => useMedicationEntries())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => result.current.search('DOLI'))

    expect(result.current.entries).toHaveLength(3)
    expect(result.current.filteredMedicationNames).toEqual(['Doliprane'])
  })

  it('conserve les prises et la pagination du journal lors de la recherche de médicaments', async () => {
    const today = new Date()
    const selectedDate = new Date(today)
    selectedDate.setDate(selectedDate.getDate() - 1)
    const olderDate = new Date(today)
    olderDate.setDate(olderDate.getDate() - 2)

    for (let hour = 0; hour < 6; hour += 1) {
      await createMedicationEntry(
        makeEntry(`Hier ${hour}`, atLocalTime(selectedDate, hour)),
      )
    }
    await createMedicationEntry(
      makeEntry('Avant-hier', atLocalTime(olderDate, 12)),
    )

    const { result } = renderHook(() => useMedicationEntries())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => result.current.selectDate(localDateKey(selectedDate)))

    expect(result.current.entries).toHaveLength(5)
    expect(result.current.hasMore).toBe(true)

    act(() => result.current.loadMore())
    expect(result.current.entries).toHaveLength(6)

    act(() => result.current.search('Hier 2'))
    expect(result.current.entries).toHaveLength(6)
    expect(result.current.filteredMedicationNames).toEqual(['Hier 2'])
    expect(result.current.hasMore).toBe(false)

    act(() => result.current.search(''))
    expect(result.current.entries).toHaveLength(6)
    expect(result.current.hasMore).toBe(false)
  })
})

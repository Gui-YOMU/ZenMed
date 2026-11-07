import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { database } from '../../../shared/storage/database'
import { createMedicationEntry } from '../data/medicationEntryRepository'
import { useMedicationLogPageViewModel } from '../hooks/useMedicationLogPageViewModel'

function getDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function localTimestamp(date: Date, hour: number): string {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hour,
  ).toISOString()
}

async function addEntry(medicationName: string, takenAt: string) {
  await createMedicationEntry({
    medicationName,
    form: 'comprimé',
    dose: 500,
    doseUnit: 'mg',
    takenAt,
  })
}

describe('useMedicationLogPageViewModel', () => {
  beforeEach(async () => {
    await database.delete()
    await database.open()
  })

  it('exposes today heading, formatted date, and grouped entries', async () => {
    const today = new Date()
    await addEntry('Doliprane', localTimestamp(today, 10))
    await addEntry('Ibuprofène', localTimestamp(today, 9))

    const { result } = renderHook(() => useMedicationLogPageViewModel())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.selectedDateHeading).toBe('Aujourd’hui')
    expect(result.current.selectedDateText).toBe(
      new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(today),
    )
    expect(result.current.groups).toHaveLength(1)
    expect(result.current.groups[0].label).toBe('Aujourd’hui')
    expect(result.current.groups[0].entries.map(({ medicationName }) =>
      medicationName,
    )).toEqual(['Doliprane', 'Ibuprofène'])
  })

  it('updates heading and groups when another date is selected', async () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    await addEntry('Doliprane', localTimestamp(today, 10))
    await addEntry('Ibuprofène', localTimestamp(yesterday, 9))

    const { result } = renderHook(() => useMedicationLogPageViewModel())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => result.current.selectDate(getDateKey(yesterday)))

    expect(result.current.selectedDateHeading).toBe('Hier')
    expect(result.current.groups).toHaveLength(1)
    expect(result.current.groups[0].entries[0].medicationName).toBe(
      'Ibuprofène',
    )
  })

  it('passes medication search, pagination, and refresh actions through the view model', async () => {
    const today = new Date()

    for (let hour = 0; hour < 6; hour += 1) {
      await addEntry(`Traitement ${hour}`, localTimestamp(today, hour))
    }

    const { result } = renderHook(() => useMedicationLogPageViewModel())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.groups[0].entries).toHaveLength(5)
    expect(result.current.hasMore).toBe(true)

    act(() => result.current.loadMore())

    expect(result.current.groups[0].entries).toHaveLength(6)
    expect(result.current.hasMore).toBe(false)

    act(() => result.current.search('Traitement 3'))

    expect(result.current.groups[0].entries).toHaveLength(6)
    expect(result.current.filteredMedicationNames).toEqual(['Traitement 3'])

    await act(async () => {
      await result.current.refresh()
    })

    expect(result.current.groups[0].entries).toHaveLength(6)
    expect(result.current.errorMessage).toBeNull()
  })
})

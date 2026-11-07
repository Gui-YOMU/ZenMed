import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import MedicationLogPage from '../pages/MedicationLogPage'
import { database } from '../../../shared/storage/database'
import { createMedicationEntry } from '../data/medicationEntryRepository'

function getDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

describe('MedicationLogPage', () => {
  beforeEach(async () => {
    await database.delete()
    await database.open()
  })

  afterEach(async () => {
    cleanup()
    await database.delete()
  })

  it('shows today by default and updates the heading when another date is selected', async () => {
    render(<MedicationLogPage />)

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    expect(screen.getByRole('heading', { name: 'Aujourd’hui' })).toBeInTheDocument()

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const dateInput = screen.getByLabelText('Choisir une date')

    act(() => {
      fireEvent.change(dateInput, { target: { value: getDateKey(yesterday) } })
    })

    expect(screen.getByRole('heading', { name: 'Hier' })).toBeInTheDocument()
    expect(dateInput).toHaveValue(getDateKey(yesterday))
  })

  it('indicates that entries exist for the selected date', async () => {
    await createMedicationEntry({
      medicationName: 'Doliprane',
      form: 'comprimé',
      dose: 500,
      doseUnit: 'mg',
      takenAt: new Date().toISOString(),
    })
    render(<MedicationLogPage />)

    expect(
      await screen.findByText('Des prises sont enregistrées à cette date.'),
    ).toBeInTheDocument()
  })
})

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMedicationEntry } from '../data/medicationEntryRepository'
import { database } from '../../../shared/storage/database'
import MedicationLogPage from '../pages/MedicationLogPage'

describe('Medication entry deletion', () => {
  beforeEach(async () => {
    await database.delete()
    await database.open()
  })

  afterEach(async () => {
    cleanup()
    vi.restoreAllMocks()
    await database.delete()
  })

  async function renderEntry() {
    await createMedicationEntry({
      medicationName: 'Doliprane',
      form: 'comprimé',
      dose: 500,
      doseUnit: 'mg',
      takenAt: new Date().toISOString(),
    })
    render(<MedicationLogPage />)
    return screen.findByRole('heading', { name: 'Doliprane' })
  }

  it('keeps the entry when deletion is cancelled', async () => {
    await renderEntry()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

    fireEvent.click(screen.getByRole('button', { name: 'Supprimer' }))

    expect(confirmSpy).toHaveBeenCalledWith(
      'Supprimer la prise de Doliprane ? Cette action est irréversible.',
    )
    expect(await database.medicationEntries.count()).toBe(1)
    expect(screen.getByRole('heading', { name: 'Doliprane' })).toBeInTheDocument()
  })

  it('deletes the entry and refreshes the journal after confirmation', async () => {
    await renderEntry()
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    fireEvent.click(screen.getByRole('button', { name: 'Supprimer' }))

    await waitFor(async () => {
      expect(await database.medicationEntries.count()).toBe(0)
    })
    expect(
      await screen.findByText('Aucune prise enregistrée à cette date.'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Doliprane' }),
    ).not.toBeInTheDocument()
  })

})

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
    return screen.findByRole('heading', { name: 'Doliprane · 500 mg' })
  }

  it('conserve la prise lorsque la suppression est annulée', async () => {
    await renderEntry()

    fireEvent.click(
      screen.getByRole('button', { name: 'Actions pour Doliprane' }),
    )
    const deleteButton = screen.getByRole('button', {
      name: 'Supprimer Doliprane',
    })
    deleteButton.focus()
    fireEvent.click(deleteButton)

    const dialog = screen.getByRole('alertdialog', {
      name: 'Confirmer la suppression',
    })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveTextContent(
      'Supprimer la prise de Doliprane ? Cette action est irréversible.',
    )
    expect(screen.getByRole('button', { name: 'Annuler' })).toHaveFocus()
    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }))

    expect(await database.medicationEntries.count()).toBe(1)
    expect(
      screen.getByRole('heading', { name: 'Doliprane · 500 mg' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Supprimer Doliprane' }),
    ).toHaveFocus()
  })

  it('supprime la prise et actualise le journal après confirmation', async () => {
    await renderEntry()

    fireEvent.click(
      screen.getByRole('button', { name: 'Actions pour Doliprane' }),
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Supprimer Doliprane' }),
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Supprimer la prise' }),
    )

    await waitFor(async () => {
      expect(await database.medicationEntries.count()).toBe(0)
    })
    expect(
      await screen.findByText('Aucune prise enregistrée'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Doliprane · 500 mg' }),
    ).not.toBeInTheDocument()
  })

})

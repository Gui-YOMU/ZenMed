import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createMedicationEntry } from '../data/medicationEntryRepository'
import { database } from '../../../shared/storage/database'
import MedicationLogPage from '../pages/MedicationLogPage'

describe('MedicationEntryPage', () => {
  beforeEach(async () => {
    await database.delete()
    await database.open()
  })

  afterEach(async () => {
    cleanup()
    await database.delete()
  })

  async function openEntryPage() {
    render(<MedicationLogPage />)
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter une prise' }))
  }

  it('opens the entry form as a separate page and returns to the journal', async () => {
    await openEntryPage()

    expect(
      screen.getByRole('heading', { name: 'Ajouter une prise' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Médicament')).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Mon journal ZenMed' }),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Retour au journal' }))

    expect(
      screen.getByRole('heading', { name: 'Mon journal ZenMed' }),
    ).toBeInTheDocument()
  })

  it('shows the five most recent unique medications and selects one into the form', async () => {
    const now = Date.now()
    const medicationNames = [
      'Doliprane',
      'Ibuprofène',
      'doliprane',
      'Aspirine',
      'Cetirizine',
      'Nurofen',
      'Spasfon',
    ]

    for (const [index, medicationName] of medicationNames.entries()) {
      await createMedicationEntry({
        medicationName,
        form: 'comprimé',
        dose: 500,
        doseUnit: 'mg',
        takenAt: new Date(now - index * 60_000).toISOString(),
      })
    }

    await openEntryPage()

    const recentMedicationButtons = await screen.findAllByRole('button', {
      name: /Doliprane|Ibuprofène|Aspirine|Cetirizine|Nurofen|Spasfon/,
    })
    expect(recentMedicationButtons.map((button) => button.textContent)).toEqual([
      'Doliprane',
      'Ibuprofène',
      'Aspirine',
      'Cetirizine',
      'Nurofen',
    ])

    fireEvent.click(screen.getByRole('button', { name: 'Ibuprofène' }))

    expect(screen.getByLabelText('Médicament')).toHaveValue('Ibuprofène')
  })

  it('saves a new entry and returns to the journal', async () => {
    await openEntryPage()

    fireEvent.change(screen.getByLabelText('Médicament'), {
      target: { value: 'Paracétamol' },
    })
    fireEvent.change(screen.getByLabelText('Dose'), {
      target: { value: '500' },
    })
    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: '2026-03-15' },
    })
    fireEvent.change(screen.getByLabelText('Heure'), {
      target: { value: '09:45' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer la prise' }))

    expect(
      await screen.findByRole('heading', { name: 'Mon journal ZenMed' }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: /Paracétamol/ }),
    ).toBeInTheDocument()
    await expect(database.medicationEntries.count()).resolves.toBe(1)
    await expect(database.medicationEntries.toArray()).resolves.toMatchObject([
      { takenAt: new Date('2026-03-15T09:45').toISOString() },
    ])
  })

  it('shows a validation message for a zero dose', async () => {
    await openEntryPage()
    fireEvent.change(screen.getByLabelText('Médicament'), {
      target: { value: 'Paracétamol' },
    })
    fireEvent.change(screen.getByLabelText('Dose'), {
      target: { value: '0' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer la prise' }))

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent('La dose doit être supérieure à zéro.')
    await expect(database.medicationEntries.count()).resolves.toBe(0)
  })

  it('warns about a recent matching medication before saving', async () => {
    await createMedicationEntry({
      medicationName: 'Doliprane',
      form: 'comprimé',
      dose: 500,
      doseUnit: 'mg',
      takenAt: new Date().toISOString(),
    })
    await openEntryPage()
    fireEvent.change(screen.getByLabelText('Médicament'), {
      target: { value: 'Doliprane' },
    })
    fireEvent.change(screen.getByLabelText('Dose'), {
      target: { value: '500' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer la prise' }))

    const warningDialog = await screen.findByRole('alertdialog', {
      name: 'Prise récente du même traitement',
    })
    expect(warningDialog).toHaveAttribute('aria-modal', 'true')
    expect(
      screen.getByText(
        'Ce repère se base sur votre historique et ne constitue pas un avis médical.',
      ),
    ).toBeInTheDocument()
    expect(
      await screen.findByText(
        /Une prise identique est enregistrée dans les quatre dernières heures/,
      ),
    ).toBeInTheDocument()
    expect(await database.medicationEntries.count()).toBe(1)

    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer quand même' }))

    expect(
      await screen.findByRole('heading', { name: 'Mon journal ZenMed' }),
    ).toBeInTheDocument()
    await waitFor(async () => {
      expect(await database.medicationEntries.count()).toBe(2)
    })
  })

  it('closes the recent-entry modal with Escape and preserves the form', async () => {
    await createMedicationEntry({
      medicationName: 'Doliprane',
      form: 'comprimé',
      dose: 500,
      doseUnit: 'mg',
      takenAt: new Date().toISOString(),
    })
    await openEntryPage()
    fireEvent.change(screen.getByLabelText('Médicament'), {
      target: { value: 'Doliprane' },
    })
    fireEvent.change(screen.getByLabelText('Dose'), {
      target: { value: '500' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer la prise' }))

    const warningDialog = await screen.findByRole('alertdialog')
    const cancelButton = screen.getByRole('button', { name: 'Annuler' })
    expect(cancelButton).toHaveFocus()

    fireEvent.keyDown(warningDialog, { key: 'Escape' })

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Médicament')).toHaveValue('Doliprane')
    expect(await database.medicationEntries.count()).toBe(1)
  })

  it('cancels the recent-entry warning when a field changes', async () => {
    await createMedicationEntry({
      medicationName: 'Doliprane',
      form: 'comprimé',
      dose: 500,
      doseUnit: 'mg',
      takenAt: new Date().toISOString(),
    })
    await openEntryPage()
    fireEvent.change(screen.getByLabelText('Médicament'), {
      target: { value: 'Doliprane' },
    })
    fireEvent.change(screen.getByLabelText('Dose'), {
      target: { value: '500' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer la prise' }))
    await screen.findByText(
      /Une prise identique est enregistrée dans les quatre dernières heures/,
    )

    act(() => {
      fireEvent.change(screen.getByLabelText('Médicament'), {
        target: { value: 'Ibuprofène' },
      })
    })

    expect(
      screen.queryByText(
        /Une prise identique est enregistrée dans les quatre dernières heures/,
      ),
    ).not.toBeInTheDocument()
  })
})

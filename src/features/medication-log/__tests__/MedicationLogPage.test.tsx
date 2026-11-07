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

  it('shows medication details and the optional reason', async () => {
    await createMedicationEntry({
      medicationName: 'Doliprane',
      form: 'comprimé',
      dose: 500,
      doseUnit: 'mg',
      takenAt: new Date().toISOString(),
      reason: 'Maux de tête',
    })
    render(<MedicationLogPage />)

    expect(await screen.findByRole('heading', { name: 'Doliprane' })).toBeInTheDocument()
    expect(screen.getByText('500 mg · comprimé')).toBeInTheDocument()
    expect(screen.getByText('Motif : Maux de tête')).toBeInTheDocument()
    expect(screen.getByRole('time')).toHaveAttribute('dateTime')
  })

  it('paginates entries in groups of five', async () => {
    const now = new Date()
    for (let index = 0; index < 6; index += 1) {
      await createMedicationEntry({
        medicationName: `Traitement ${index}`,
        form: 'gélule',
        dose: 1,
        doseUnit: 'g',
        takenAt: new Date(now.getTime() - index * 60_000).toISOString(),
      })
    }

    render(<MedicationLogPage />)

    expect(await screen.findByRole('heading', { name: 'Traitement 0' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Traitement 4' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Traitement 5' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Afficher plus de prises' }))

    expect(await screen.findByRole('heading', { name: 'Traitement 5' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Afficher plus de prises' })).not.toBeInTheDocument()
  })

  it('filters entries by medication name without regard to case or surrounding spaces', async () => {
    const now = new Date()
    for (const [medicationName, minutesAgo] of [
      ['Doliprane', 0],
      ['Ibuprofène', 1],
    ] as const) {
      await createMedicationEntry({
        medicationName,
        form: 'comprimé',
        dose: 500,
        doseUnit: 'mg',
        takenAt: new Date(now.getTime() - minutesAgo * 60_000).toISOString(),
      })
    }

    render(<MedicationLogPage />)

    expect(await screen.findByRole('heading', { name: 'Doliprane' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Ibuprofène' })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Rechercher par médicament'), {
      target: { value: '  DOLI ' },
    })

    expect(screen.getByRole('heading', { name: 'Doliprane' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Ibuprofène' })).not.toBeInTheDocument()
  })

  it('shows a search-specific empty state when no medication matches', async () => {
    render(<MedicationLogPage />)

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
    fireEvent.change(screen.getByLabelText('Rechercher par médicament'), {
      target: { value: 'Doliprane' },
    })

    expect(
      screen.getByText('Aucune prise ne correspond à cette recherche pour cette date.'),
    ).toBeInTheDocument()
  })

  it('opens a prefilled edit page and updates the existing entry', async () => {
    const id = await createMedicationEntry({
      medicationName: 'Doliprane',
      form: 'comprimé',
      dose: 500,
      doseUnit: 'mg',
      takenAt: new Date().toISOString(),
      reason: 'Maux de tête',
    })
    render(<MedicationLogPage />)

    fireEvent.click(
      await screen.findByRole('button', { name: 'Modifier' }),
    )

    expect(
      screen.getByRole('heading', { name: 'Modifier une prise' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Médicament')).toHaveValue('Doliprane')
    expect(screen.getByLabelText('Dose')).toHaveValue(500)
    expect(screen.getByLabelText('Motif (facultatif)')).toHaveValue('Maux de tête')

    fireEvent.change(screen.getByLabelText('Médicament'), {
      target: { value: 'Paracétamol' },
    })
    fireEvent.change(screen.getByLabelText('Dose'), {
      target: { value: '1000' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: 'Enregistrer les modifications' }),
    )

    expect(
      await screen.findByRole('heading', { name: 'Mon journal' }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: 'Paracétamol' }),
    ).toBeInTheDocument()
    expect(await database.medicationEntries.count()).toBe(1)
    expect(await database.medicationEntries.get(id)).toMatchObject({
      id,
      medicationName: 'Paracétamol',
      dose: 1000,
    })
  })
})

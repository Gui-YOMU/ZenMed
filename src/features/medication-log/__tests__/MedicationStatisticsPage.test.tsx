import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MedicationStatisticsPage from '../pages/MedicationStatisticsPage'
import { createMedicationEntry } from '../data/medicationEntryRepository'
import { database } from '../../../shared/storage/database'

describe('MedicationStatisticsPage', () => {
  beforeEach(async () => {
    await database.delete()
    await database.open()
  })

  afterEach(async () => {
    cleanup()
    await database.delete()
  })

  it('shows period counts, paginates recent entries, and returns to the journal', async () => {
    const now = Date.now()
    for (const [medicationName, daysAgo] of [
      ['Doliprane', 2],
      ['doliprane', 20],
      ['Ibuprofène', 0],
      ['Doliprane', 200],
      ['Doliprane', 3],
      ['Doliprane', 4],
      ['Doliprane', 5],
      ['Doliprane', 6],
    ] as const) {
      await createMedicationEntry({
        medicationName,
        form: 'comprimé',
        dose: 500,
        doseUnit: 'mg',
        takenAt: new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
      })
    }
    const onBack = vi.fn()

    render(
      <MedicationStatisticsPage
        initialMedication="Doliprane"
        onBack={onBack}
      />,
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Nombre de prises · Doliprane',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('7 derniers jours').parentElement).toHaveTextContent(
      '5',
    )
    expect(screen.getByText('30 derniers jours').parentElement).toHaveTextContent(
      '6',
    )
    expect(screen.getByText('12 derniers mois').parentElement).toHaveTextContent(
      '7',
    )
    expect(
      within(screen.getByRole('list', { name: 'Prises récentes' })).getAllByRole(
        'listitem',
      ),
    ).toHaveLength(5)
    fireEvent.click(screen.getByRole('button', { name: 'Afficher plus de prises' }))
    expect(
      within(screen.getByRole('list', { name: 'Prises récentes' })).getAllByRole(
        'listitem',
      ),
    ).toHaveLength(7)

    fireEvent.click(screen.getByRole('button', { name: 'Retour au journal' }))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('shows an empty state when no entries exist', async () => {
    render(
      <MedicationStatisticsPage initialMedication="" onBack={() => {}} />,
    )

    expect(
      await screen.findByText('Aucune prise enregistrée pour le moment.'),
    ).toBeInTheDocument()
  })
})

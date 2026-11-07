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

  it('affiche les décomptes par période, pagine les prises récentes et permet de revenir au journal', async () => {
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
        name: 'Doliprane',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Statistiques du traitement'),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: 'Récapitulatif par période' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Valeurs calculées à partir de l’historique de l’application, toutes formes galéniques confondues.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Les 5 prises les plus récentes' }),
    ).toBeInTheDocument()
    expect(screen.queryByLabelText('Rechercher un médicament')).toBeNull()
    expect(screen.queryByText(/Historique de/)).toBeNull()
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

  it('affiche un état vide lorsqu’aucune prise n’existe', async () => {
    render(
      <MedicationStatisticsPage initialMedication="" onBack={() => {}} />,
    )

    expect(
      await screen.findByText('Aucune prise enregistrée pour le moment.'),
    ).toBeInTheDocument()
  })
})

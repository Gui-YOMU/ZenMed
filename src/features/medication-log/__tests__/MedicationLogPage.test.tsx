import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

  it('affiche le jour courant par défaut et met à jour le titre lorsqu’une autre date est sélectionnée', async () => {
    render(<MedicationLogPage />)

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    expect(
      screen.getByText(
        new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date()),
      ),
    ).toBeInTheDocument()

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const dateInput = screen.getByLabelText('Choisir une date')

    act(() => {
      fireEvent.change(dateInput, { target: { value: getDateKey(yesterday) } })
    })

    expect(
      screen.getByText(
        new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(yesterday),
      ),
    ).toBeInTheDocument()
    expect(dateInput).toHaveValue(getDateKey(yesterday))
  })

  it('affiche l’identité de l’application et place le choix de date, la recherche et l’ajout dans leurs zones prévues', async () => {
    render(<MedicationLogPage onShowStatistics={() => {}} />)

    const header = screen.getByRole('banner')
    const entries = screen.getByRole('region', { name: 'Prises de la journée' })
    const searchAndAdd = screen.getByRole('contentinfo')

    expect(
      screen.getByRole('heading', { name: 'Mon journal ZenMed' }),
    ).toBeInTheDocument()
    expect(header.querySelector('img')).toHaveAttribute(
      'src',
      `${import.meta.env.BASE_URL}icons/icon-192.png`,
    )
    expect(
      screen.getByLabelText('Choisir une date'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('searchbox', { name: 'Rechercher par médicament' }),
    ).toBeInTheDocument()
    expect(
      searchAndAdd.contains(
        screen.getByRole('button', { name: 'Ajouter une prise' }),
      ),
    ).toBe(true)
    expect(
      screen.queryByRole('button', { name: 'Statistiques' }),
    ).not.toBeInTheDocument()
    expect(
      entries.compareDocumentPosition(searchAndAdd) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('affiche les détails du médicament et le motif facultatif', async () => {
    await createMedicationEntry({
      medicationName: 'Doliprane',
      form: 'comprimé',
      dose: 500,
      doseUnit: 'mg',
      takenAt: new Date().toISOString(),
      reason: 'Maux de tête',
    })
    render(<MedicationLogPage />)

    expect(await screen.findByRole('heading', { name: /Doliprane/ })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Doliprane · 500 mg' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Comprimé · Maux de tête')).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: 'Forme galénique : comprimé' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('time')).toHaveAttribute('dateTime')
  })

  it('affiche les actions d’une seule prise à la fois', async () => {
    const now = Date.now()
    for (const [index, medicationName] of [
      'Doliprane',
      'Ibuprofène',
    ].entries()) {
      await createMedicationEntry({
        medicationName,
        form: 'comprimé',
        dose: 500,
        doseUnit: 'mg',
        takenAt: new Date(now - index * 60_000).toISOString(),
      })
    }

    render(<MedicationLogPage />)

    await screen.findByRole('heading', { name: /Doliprane/ })
    fireEvent.click(
      screen.getByRole('button', { name: 'Actions pour Doliprane' }),
    )
    expect(
      screen.getByRole('button', { name: 'Modifier Doliprane' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Supprimer Doliprane' }),
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: 'Actions pour Ibuprofène' }),
    )

    expect(
      screen.queryByRole('button', { name: 'Modifier Doliprane' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Modifier Ibuprofène' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Supprimer Ibuprofène' }),
    ).toBeInTheDocument()
  })

  it('utilise une icône distincte pour chaque forme galénique et affiche les détails sur deux lignes', async () => {
    const now = Date.now()
    for (const [index, form] of (
      ['comprimé', 'gélule', 'sachet/poudre'] as const
    ).entries()) {
      await createMedicationEntry({
        medicationName: `Médicament ${index}`,
        form,
        dose: 250,
        doseUnit: 'mg',
        takenAt: new Date(now - index * 60_000).toISOString(),
        reason: index === 1 ? 'Douleur' : undefined,
      })
    }

    render(<MedicationLogPage />)

    expect(
      await screen.findByRole('img', { name: 'Forme galénique : comprimé' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: 'Forme galénique : gélule' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: 'Forme galénique : sachet/poudre' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Gélule · Douleur')).toBeInTheDocument()
    expect(screen.queryByText('Motif : Douleur')).not.toBeInTheDocument()
  })

  it('ouvre le formulaire de prise avec le bouton plus situé à côté de la recherche', async () => {
    render(<MedicationLogPage onShowStatistics={() => {}} />)

    expect(
      screen.queryByRole('button', { name: 'Statistiques' }),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Ajouter une prise' }))

    expect(
      await screen.findByRole('heading', { name: 'Ajouter une prise' }),
    ).toBeInTheDocument()
  })

  it('affiche les prises par pages de cinq', async () => {
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

    expect(await screen.findByRole('heading', { name: /Traitement 0/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Traitement 4/ })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Traitement 5/ })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Afficher plus de prises' }))

    expect(await screen.findByRole('heading', { name: /Traitement 5/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Afficher plus de prises' })).not.toBeInTheDocument()
  })

  it('conserve la liste du journal et ouvre les statistiques du médicament correspondant', async () => {
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

    const showStatistics = vi.fn()
    render(<MedicationLogPage onShowStatistics={showStatistics} />)

    expect(await screen.findByRole('heading', { name: /Doliprane/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Ibuprofène/ })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Rechercher par médicament'), {
      target: { value: '  DOLI ' },
    })

    expect(screen.getByRole('heading', { name: /Doliprane/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Ibuprofène/ })).toBeInTheDocument()
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Voir les statistiques de Doliprane',
      }),
    )
    expect(showStatistics).toHaveBeenCalledWith('Doliprane')
  })

  it('indique lorsqu’aucun médicament ne correspond à la recherche de statistiques', async () => {
    render(<MedicationLogPage onShowStatistics={() => {}} />)

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
    fireEvent.change(screen.getByLabelText('Rechercher par médicament'), {
      target: { value: 'Doliprane' },
    })

    expect(
      screen.getByText('Aucun médicament ne correspond à cette recherche.'),
    ).toBeInTheDocument()
  })

  it('ouvre une page de modification préremplie et met à jour la prise existante', async () => {
    const takenAt = new Date()
    const localTakenAt = new Date(
      takenAt.getTime() - takenAt.getTimezoneOffset() * 60_000,
    )
    const id = await createMedicationEntry({
      medicationName: 'Doliprane',
      form: 'comprimé',
      dose: 500,
      doseUnit: 'mg',
      takenAt: takenAt.toISOString(),
      reason: 'Maux de tête',
    })
    render(<MedicationLogPage />)

    fireEvent.click(
      await screen.findByRole('button', { name: 'Actions pour Doliprane' }),
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Modifier Doliprane' }),
    )

    expect(
      screen.getByRole('heading', { name: 'Modifier une prise' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Médicament')).toHaveValue('Doliprane')
    expect(screen.getByLabelText('Dose')).toHaveValue(500)
    expect(screen.getByLabelText('Date')).toHaveValue(
      localTakenAt.toISOString().slice(0, 10),
    )
    expect(screen.getByLabelText('Heure')).toHaveValue(
      localTakenAt.toISOString().slice(11, 16),
    )
    expect(screen.getByLabelText('Motif (facultatif)')).toHaveValue('Maux de tête')

    fireEvent.change(screen.getByLabelText('Médicament'), {
      target: { value: 'Paracétamol' },
    })
    fireEvent.change(screen.getByLabelText('Dose'), {
      target: { value: '1000' },
    })
    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: '2025-02-15' },
    })
    fireEvent.change(screen.getByLabelText('Heure'), {
      target: { value: '08:45' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: 'Enregistrer les modifications' }),
    )

    expect(
      await screen.findByRole('heading', { name: 'Mon journal ZenMed' }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: /Paracétamol/ }),
    ).toBeInTheDocument()
    expect(await database.medicationEntries.count()).toBe(1)
    expect(await database.medicationEntries.get(id)).toMatchObject({
      id,
      medicationName: 'Paracétamol',
      dose: 1000,
      takenAt: new Date('2025-02-15T08:45').toISOString(),
    })
  })
})

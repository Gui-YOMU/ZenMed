import { beforeEach, describe, expect, it } from 'vitest'
import { database } from '../../../shared/storage/database'
import {
  createMedicationEntry,
  deleteMedicationEntry,
  listMedicationEntries,
  updateMedicationEntry,
} from '../data/medicationEntryRepository'
import type { MedicationEntry } from '../model/medicationEntry'

const firstEntry: MedicationEntry = {
  medicationName: 'Doliprane',
  form: 'comprimé',
  dose: 500,
  doseUnit: 'mg',
  takenAt: '2026-11-07T10:00:00+02:00',
}

describe('medication entry repository', () => {
  beforeEach(async () => {
    await database.delete()
    await database.open()
  })

  it('crée les prises et les classe par heure réelle, de la plus récente à la plus ancienne', async () => {
    const olderId = await createMedicationEntry(firstEntry)
    const newerId = await createMedicationEntry({
      ...firstEntry,
      medicationName: 'Ibuprofène',
      takenAt: '2026-11-07T09:30:00.000Z',
    })

    const entries = await listMedicationEntries()

    expect(entries.map(({ id }) => id)).toEqual([newerId, olderId])
    expect(entries[0].medicationName).toBe('Ibuprofène')
  })

  it('valide une prise avant de l’ajouter', async () => {
    await expect(
      createMedicationEntry({ ...firstEntry, dose: 0 }),
    ).rejects.toThrow()
    await expect(database.medicationEntries.count()).resolves.toBe(0)
  })

  it('modifie une prise existante sans changer son identifiant', async () => {
    const id = await createMedicationEntry(firstEntry)

    await updateMedicationEntry(id, {
      ...firstEntry,
      medicationName: '  Doliprane  ',
      dose: 1000,
    })

    await expect(database.medicationEntries.get(id)).resolves.toEqual({
      ...firstEntry,
      medicationName: 'Doliprane',
      dose: 1000,
      id,
    })
  })

  it('signale explicitement la modification d’une prise inexistante', async () => {
    await expect(updateMedicationEntry(42, firstEntry)).rejects.toThrow(
      'Impossible de modifier la prise 42 : elle n’existe pas.',
    )
  })

  it('supprime une prise existante et signale lorsque son identifiant est absent', async () => {
    const id = await createMedicationEntry(firstEntry)

    await expect(deleteMedicationEntry(id)).resolves.toBe(true)
    await expect(deleteMedicationEntry(id)).resolves.toBe(false)
    await expect(listMedicationEntries()).resolves.toEqual([])
  })
})

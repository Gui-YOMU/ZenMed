import { beforeEach, describe, expect, it } from 'vitest'
import { database } from '../../../shared/storage/database'
import {
  createMedicationEntry,
  deleteMedicationEntry,
  listMedicationEntries,
  updateMedicationEntry,
} from '../data/medicationEntryRepository'
import type { MedicationEntry } from '../model/medicationEntry.types'

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

  it('creates entries and lists them by actual time, newest first', async () => {
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

  it('validates an entry before adding it', async () => {
    await expect(
      createMedicationEntry({ ...firstEntry, dose: 0 }),
    ).rejects.toThrow()
    await expect(database.medicationEntries.count()).resolves.toBe(0)
  })

  it('updates an existing entry without changing its ID', async () => {
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

  it('fails explicitly when updating an entry that does not exist', async () => {
    await expect(updateMedicationEntry(42, firstEntry)).rejects.toThrow(
      'Impossible de modifier la prise 42 : elle n’existe pas.',
    )
  })

  it('deletes an existing entry and reports when the ID is absent', async () => {
    const id = await createMedicationEntry(firstEntry)

    await expect(deleteMedicationEntry(id)).resolves.toBe(true)
    await expect(deleteMedicationEntry(id)).resolves.toBe(false)
    await expect(listMedicationEntries()).resolves.toEqual([])
  })
})

import Dexie from 'dexie'
import { beforeEach, describe, expect, it } from 'vitest'
import type { MedicationEntry } from '../../../features/medication-log/model/medicationEntry'
import { database } from '../database'

const medicationEntry: MedicationEntry = {
  medicationName: 'Doliprane',
  form: 'comprimé',
  dose: 500,
  doseUnit: 'mg',
  takenAt: '2026-11-07T10:15:00.000Z',
}

describe('ZenMed database schema', () => {
  beforeEach(async () => {
    await database.delete()
    await database.open()
  })

  it('enregistre les prises avec un identifiant auto-incrémenté', async () => {
    const id = await database.medicationEntries.add(medicationEntry)

    await expect(database.medicationEntries.get(id)).resolves.toEqual({
      ...medicationEntry,
      id,
    })
  })

  it('met à niveau une base de version 1 et conserve son identifiant PIN', async () => {
    await database.delete()
    const legacyDatabase = new Dexie('zenmed')
    legacyDatabase.version(1).stores({
      pinCredentials: 'id',
    })
    await legacyDatabase.open()
    await legacyDatabase.table('pinCredentials').put({
      id: 'pin',
      salt: 'salt',
      verifier: 'verifier',
    })
    legacyDatabase.close()

    await database.open()

    await expect(database.pinCredentials.get('pin')).resolves.toEqual({
      id: 'pin',
      salt: 'salt',
      verifier: 'verifier',
    })
    await expect(
      database.medicationEntries.add(medicationEntry),
    ).resolves.toBeGreaterThan(0)
  })
})

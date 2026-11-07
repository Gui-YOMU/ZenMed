import Dexie, { type EntityTable } from 'dexie'
import type { MedicationEntryRecord } from '../../features/medication-log/model/medicationEntry'

export interface PinCredential {
  id: 'pin'
  salt: string
  verifier: string
}

class ZenMedDatabase extends Dexie {
  pinCredentials!: EntityTable<PinCredential, 'id'>
  medicationEntries!: EntityTable<MedicationEntryRecord, 'id'>

  constructor() {
    super('zenmed')
    this.version(1).stores({
      pinCredentials: 'id',
    })
    this.version(2).stores({
      pinCredentials: 'id',
      medicationEntries: '++id, medicationName, takenAt',
    })
  }
}

export const database = new ZenMedDatabase()

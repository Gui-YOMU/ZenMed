import Dexie, { type EntityTable } from 'dexie'

export interface PinCredential {
  id: 'pin'
  salt: string
  verifier: string
}

class ZenMedDatabase extends Dexie {
  pinCredentials!: EntityTable<PinCredential, 'id'>

  constructor() {
    super('zenmed')
    this.version(1).stores({
      pinCredentials: 'id',
    })
  }
}

export const database = new ZenMedDatabase()

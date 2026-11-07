import { database } from '../../../../shared/storage/database'

export const accessRepositoryTest = {
  async resetDatabase() {
    await database.delete()
    await database.open()
  },

  async readCredential() {
    return database.pinCredentials.get('pin')
  },
}

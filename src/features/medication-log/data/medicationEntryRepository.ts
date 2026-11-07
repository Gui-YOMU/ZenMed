import { database } from '../../../shared/storage/database'
import { medicationEntrySchema } from '../model/medicationEntry'
import type {
  MedicationEntry,
  MedicationEntryRecord,
} from '../model/medicationEntry'

export async function createMedicationEntry(
  entry: MedicationEntry,
): Promise<number> {
  const validatedEntry = medicationEntrySchema.parse(entry)
  const id = await database.medicationEntries.add(validatedEntry)

  if (id === undefined) {
    throw new Error('La base locale n’a pas attribué d’identifiant à la prise.')
  }

  return id
}

export async function updateMedicationEntry(
  id: number,
  entry: MedicationEntry,
): Promise<void> {
  const validatedEntry = medicationEntrySchema.parse(entry)

  await database.transaction('rw', database.medicationEntries, async () => {
    const existingEntry = await database.medicationEntries.get(id)

    if (!existingEntry) {
      throw new Error(`Impossible de modifier la prise ${id} : elle n’existe pas.`)
    }

    await database.medicationEntries.put({ ...validatedEntry, id })
  })
}

export async function deleteMedicationEntry(id: number): Promise<boolean> {
  return database.transaction('rw', database.medicationEntries, async () => {
    const existingEntry = await database.medicationEntries.get(id)

    if (!existingEntry) {
      return false
    }

    await database.medicationEntries.delete(id)
    return true
  })
}

export async function listMedicationEntries(): Promise<MedicationEntryRecord[]> {
  const entries = await database.medicationEntries.toArray()

  return entries.sort(
    (left, right) =>
      new Date(right.takenAt).getTime() - new Date(left.takenAt).getTime(),
  )
}

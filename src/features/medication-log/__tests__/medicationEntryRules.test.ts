import { describe, expect, it } from 'vitest'
import {
  medicationEntrySchema,
  normalizeMedicationName,
} from '../model/medicationEntry'
import {
  DOSE_UNITS,
  GALENIC_FORMS,
  type MedicationEntry,
} from '../model/medicationEntry'

const validEntry: MedicationEntry = {
  medicationName: 'Doliprane',
  form: 'comprimé',
  dose: 500,
  doseUnit: 'mg',
  takenAt: '2026-11-07T10:15:00.000Z',
}

describe('medicationEntrySchema', () => {
  it('normalise les noms de médicaments de manière cohérente pour ignorer la casse', () => {
    expect(normalizeMedicationName('  DOLIPRANE ')).toBe('doliprane')
  })

  it('accepte une prise valide et supprime les espaces superflus du nom du médicament', () => {
    const result = medicationEntrySchema.parse({
      ...validEntry,
      medicationName: '  Doliprane  ',
    })

    expect(result.medicationName).toBe('Doliprane')
  })

  it('accepte chaque forme galénique et unité de dose prévues pour le MVP', () => {
    for (const form of GALENIC_FORMS) {
      for (const doseUnit of DOSE_UNITS) {
        expect(
          medicationEntrySchema.safeParse({
            ...validEntry,
            form,
            doseUnit,
          }).success,
        ).toBe(true)
      }
    }
  })

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    'refuse une dose négative, nulle ou non finie : %s',
    (dose) => {
      expect(
        medicationEntrySchema.safeParse({ ...validEntry, dose }).success,
      ).toBe(false)
    },
  )

  it.each(['', '   '])('refuse un nom de médicament vide : %j', (medicationName) => {
    expect(
      medicationEntrySchema.safeParse({
        ...validEntry,
        medicationName,
      }).success,
    ).toBe(false)
  })

  it('considère un motif facultatif vide comme absent et supprime les espaces superflus', () => {
    expect(
      medicationEntrySchema.parse({ ...validEntry, reason: '   ' }).reason,
    ).toBeUndefined()
    expect(
      medicationEntrySchema.parse({ ...validEntry, reason: '  Mal de tête  ' })
        .reason,
    ).toBe('Mal de tête')
    expect(medicationEntrySchema.parse(validEntry).reason).toBeUndefined()
  })

  it.each([
    '2026-02-30T10:00:00.000Z',
    'not a date',
    '2026-11-07',
  ])('refuse un horodatage invalide : %s', (takenAt) => {
    expect(
      medicationEntrySchema.safeParse({ ...validEntry, takenAt }).success,
    ).toBe(false)
  })

  it('refuse une forme ou une unité de dose absente des listes du MVP', () => {
    expect(
      medicationEntrySchema.safeParse({
        ...validEntry,
        form: 'sirop',
      }).success,
    ).toBe(false)
    expect(
      medicationEntrySchema.safeParse({
        ...validEntry,
        doseUnit: 'ml',
      }).success,
    ).toBe(false)
  })
})

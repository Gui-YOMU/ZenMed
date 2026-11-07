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
  it('normalizes medication names consistently for case-insensitive matching', () => {
    expect(normalizeMedicationName('  DOLIPRANE ')).toBe('doliprane')
  })

  it('accepts a valid entry and trims the medication name', () => {
    const result = medicationEntrySchema.parse({
      ...validEntry,
      medicationName: '  Doliprane  ',
    })

    expect(result.medicationName).toBe('Doliprane')
  })

  it('accepts every MVP galenic form and dose unit', () => {
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
    'rejects a non-positive or non-finite dose: %s',
    (dose) => {
      expect(
        medicationEntrySchema.safeParse({ ...validEntry, dose }).success,
      ).toBe(false)
    },
  )

  it.each(['', '   '])('rejects an empty medication name: %j', (medicationName) => {
    expect(
      medicationEntrySchema.safeParse({
        ...validEntry,
        medicationName,
      }).success,
    ).toBe(false)
  })

  it('treats a blank optional reason as absent and trims a provided reason', () => {
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
  ])('rejects an invalid timestamp: %s', (takenAt) => {
    expect(
      medicationEntrySchema.safeParse({ ...validEntry, takenAt }).success,
    ).toBe(false)
  })

  it('rejects a form or dose unit outside the MVP lists', () => {
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

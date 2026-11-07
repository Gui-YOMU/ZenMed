export const GALENIC_FORMS = [
  'comprimé',
  'gélule',
  'sachet/poudre',
] as const

export const DOSE_UNITS = ['mg', 'g'] as const

export type GalenicForm = (typeof GALENIC_FORMS)[number]
export type DoseUnit = (typeof DOSE_UNITS)[number]

export interface MedicationEntry {
  medicationName: string
  form: GalenicForm
  dose: number
  doseUnit: DoseUnit
  takenAt: string
  reason?: string
}

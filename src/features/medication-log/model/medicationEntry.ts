import { z } from 'zod'

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

export interface MedicationEntryRecord extends MedicationEntry {
  id?: number
}

export function normalizeMedicationName(name: string): string {
  return name.trim().toLocaleLowerCase('fr-FR')
}

export const medicationEntrySchema = z.object({
  medicationName: z
    .string()
    .trim()
    .min(1, 'Le nom du médicament est obligatoire.'),
  form: z.enum(GALENIC_FORMS),
  dose: z.number().positive('La dose doit être supérieure à zéro.'),
  doseUnit: z.enum(DOSE_UNITS),
  takenAt: z.iso.datetime({ offset: true }),
  reason: z
    .string()
    .trim()
    .optional()
    .transform((reason) => reason || undefined),
}) satisfies z.ZodType<MedicationEntry>

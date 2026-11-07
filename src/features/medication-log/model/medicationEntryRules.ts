import { z } from 'zod'
import { DOSE_UNITS, GALENIC_FORMS, type MedicationEntry } from './medicationEntry.types'

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

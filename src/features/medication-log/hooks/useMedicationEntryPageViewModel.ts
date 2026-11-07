import { useState } from 'react'
import { useForm, type FieldPath } from 'react-hook-form'
import {
  createMedicationEntry,
  listMedicationEntries,
  updateMedicationEntry,
} from '../data/medicationEntryRepository'
import {
  DOSE_UNITS,
  GALENIC_FORMS,
  type DoseUnit,
  type GalenicForm,
  type MedicationEntry,
  type MedicationEntryRecord,
} from '../model/medicationEntry.types'
import { medicationEntrySchema } from '../model/medicationEntryRules'

const RECENT_ENTRY_WINDOW_MS = 4 * 60 * 60 * 1000

interface UseMedicationEntryPageViewModelOptions {
  existingEntry?: MedicationEntryRecord
  onCancel: () => void
  onSaved: (entry: MedicationEntry) => Promise<void>
}

interface MedicationEntryFormValues {
  medicationName: string
  form: GalenicForm
  dose: string
  doseUnit: DoseUnit
  takenAt: string
  reason: string
}

function getLocalDateTimeValue(date: Date): string {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 16)
}

function getDefaultValues(
  entry: MedicationEntryRecord | undefined,
): MedicationEntryFormValues {
  if (!entry) {
    return {
      medicationName: '',
      form: GALENIC_FORMS[0],
      dose: '',
      doseUnit: DOSE_UNITS[0],
      takenAt: getLocalDateTimeValue(new Date()),
      reason: '',
    }
  }

  return {
    medicationName: entry.medicationName,
    form: entry.form,
    dose: String(entry.dose),
    doseUnit: entry.doseUnit,
    takenAt: getLocalDateTimeValue(new Date(entry.takenAt)),
    reason: entry.reason ?? '',
  }
}

function hasRecentMatchingEntry(
  medicationName: string,
  excludedEntryId?: number,
): Promise<boolean> {
  const normalizedName = medicationName.trim().toLocaleLowerCase('fr-FR')

  return listMedicationEntries().then((entries) => {
    const now = Date.now()

    return entries.some((existingEntry) => {
      if (existingEntry.id === excludedEntryId) {
        return false
      }

      const elapsedTime = now - new Date(existingEntry.takenAt).getTime()
      return (
        existingEntry.medicationName.trim().toLocaleLowerCase('fr-FR') ===
          normalizedName &&
        elapsedTime >= 0 &&
        elapsedTime <= RECENT_ENTRY_WINDOW_MS
      )
    })
  })
}

export function useMedicationEntryPageViewModel({
  existingEntry,
  onCancel,
  onSaved,
}: UseMedicationEntryPageViewModelOptions) {
  const [defaultValues] = useState(() => getDefaultValues(existingEntry))
  const [pendingEntry, setPendingEntry] = useState<MedicationEntry | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const {
    clearErrors,
    handleSubmit,
    register,
    setError,
    formState: { errors },
  } = useForm<MedicationEntryFormValues>({
    defaultValues,
  })
  const registerField = (name: FieldPath<MedicationEntryFormValues>) =>
    register(name, {
      onChange: () => {
        setPendingEntry(null)
        clearErrors('root')
      },
    })

  const saveEntry = async (
    entry: MedicationEntry,
    skipRecentEntryCheck = false,
  ) => {
    setIsSaving(true)
    clearErrors('root')

    try {
      if (
        !skipRecentEntryCheck &&
        (await hasRecentMatchingEntry(
          entry.medicationName,
          existingEntry?.id,
        ))
      ) {
        setPendingEntry(entry)
        setIsSaving(false)
        return
      }

      if (existingEntry?.id === undefined) {
        await createMedicationEntry(entry)
      } else {
        await updateMedicationEntry(existingEntry.id, entry)
      }
      await onSaved(entry)
    } catch {
      setError('root.submit', {
        type: 'submit',
        message: 'Impossible d’enregistrer cette prise. Réessayez.',
      })
      setIsSaving(false)
    }
  }

  const submitEntry = async (values: MedicationEntryFormValues) => {
    setPendingEntry(null)
    clearErrors('root')
    const takenAtDate = new Date(values.takenAt)

    if (Number.isNaN(takenAtDate.getTime())) {
      setError('root.validation', {
        type: 'validate',
        message: 'La date et l’heure de la prise sont invalides.',
      })
      return
    }

    const result = medicationEntrySchema.safeParse({
      ...values,
      dose: Number(values.dose),
      takenAt: takenAtDate.toISOString(),
    })

    if (!result.success) {
      setError('root.validation', {
        type: 'validate',
        message:
          result.error.issues[0]?.message ??
          'Vérifiez les informations saisies.',
      })
      return
    }

    await saveEntry(result.data)
  }

  const confirmSave = () => {
    if (pendingEntry) {
      void saveEntry(pendingEntry, true)
    }
  }

  const cancelPendingSave = () => {
    setPendingEntry(null)
  }

  return {
    register: registerField,
    handleSubmit: handleSubmit(submitEntry),
    validationMessage: errors.root?.validation?.message,
    submitError: errors.root?.submit?.message,
    pendingEntry,
    isSaving,
    onCancel,
    pageTitle: existingEntry ? 'Modifier une prise' : 'Ajouter une prise',
    submitLabel: existingEntry
      ? 'Enregistrer les modifications'
      : 'Enregistrer la prise',
    confirmSave,
    cancelPendingSave,
  }
}

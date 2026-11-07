import { useState } from 'react'
import { useForm, type FieldPath } from 'react-hook-form'
import {
  createMedicationEntry,
  listMedicationEntries,
} from '../data/medicationEntryRepository'
import {
  DOSE_UNITS,
  GALENIC_FORMS,
  type DoseUnit,
  type GalenicForm,
  type MedicationEntry,
} from '../model/medicationEntry.types'
import { medicationEntrySchema } from '../model/medicationEntryRules'

const RECENT_ENTRY_WINDOW_MS = 4 * 60 * 60 * 1000

interface UseMedicationEntryPageViewModelOptions {
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

function hasRecentMatchingEntry(medicationName: string): Promise<boolean> {
  const normalizedName = medicationName.trim().toLocaleLowerCase('fr-FR')

  return listMedicationEntries().then((entries) => {
    const now = Date.now()

    return entries.some((existingEntry) => {
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
  onCancel,
  onSaved,
}: UseMedicationEntryPageViewModelOptions) {
  const [defaultTakenAt] = useState(() => getLocalDateTimeValue(new Date()))
  const [pendingEntry, setPendingEntry] = useState<MedicationEntry | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const {
    clearErrors,
    handleSubmit,
    register,
    setError,
    formState: { errors },
  } = useForm<MedicationEntryFormValues>({
    defaultValues: {
      medicationName: '',
      form: GALENIC_FORMS[0],
      dose: '',
      doseUnit: DOSE_UNITS[0],
      takenAt: defaultTakenAt,
      reason: '',
    },
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
        (await hasRecentMatchingEntry(entry.medicationName))
      ) {
        setPendingEntry(entry)
        setIsSaving(false)
        return
      }

      await createMedicationEntry(entry)
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
    confirmSave,
    cancelPendingSave,
  }
}

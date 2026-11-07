import { useEffect, useState } from 'react'
import { useForm, type FieldPath } from 'react-hook-form'
import {
  createMedicationEntry,
  listMedicationEntries,
  updateMedicationEntry,
} from '../data/medicationEntryRepository'
import {
  DOSE_UNITS,
  GALENIC_FORMS,
  normalizeMedicationName,
  type DoseUnit,
  type GalenicForm,
  type MedicationEntry,
  type MedicationEntryRecord,
  medicationEntrySchema,
} from '../model/medicationEntry'

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
  takenDate: string
  takenTime: string
  reason: string
}

function getLocalDateTimeValues(date: Date): Pick<
  MedicationEntryFormValues,
  'takenDate' | 'takenTime'
> {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  const [takenDate, takenTime] = localDate.toISOString().slice(0, 16).split('T')

  return { takenDate, takenTime }
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
      ...getLocalDateTimeValues(new Date()),
      reason: '',
    }
  }

  return {
    medicationName: entry.medicationName,
    form: entry.form,
    dose: String(entry.dose),
    doseUnit: entry.doseUnit,
    ...getLocalDateTimeValues(new Date(entry.takenAt)),
    reason: entry.reason ?? '',
  }
}

function hasRecentMatchingEntry(
  medicationName: string,
  excludedEntryId?: number,
): Promise<boolean> {
  const normalizedName = normalizeMedicationName(medicationName)

  return listMedicationEntries().then((entries) => {
    const now = Date.now()

    return entries.some((existingEntry) => {
      if (existingEntry.id === excludedEntryId) {
        return false
      }

      const elapsedTime = now - new Date(existingEntry.takenAt).getTime()
      return (
        normalizeMedicationName(existingEntry.medicationName) ===
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
    setValue,
    formState: { errors },
  } = useForm<MedicationEntryFormValues>({
    defaultValues,
  })
  const [recentMedicationNames, setRecentMedicationNames] = useState<string[]>([])
  const [recentMedicationError, setRecentMedicationError] = useState<
    string | null
  >(null)

  useEffect(() => {
    let isCurrent = true

    const loadRecentMedicationNames = async () => {
      try {
        const entries = await listMedicationEntries()
        const seenNames = new Set<string>()
        const names: string[] = []

        for (const existingEntry of entries) {
          const normalizedName = normalizeMedicationName(
            existingEntry.medicationName,
          )

          if (!seenNames.has(normalizedName)) {
            seenNames.add(normalizedName)
            names.push(existingEntry.medicationName)
          }

          if (names.length === 5) {
            break
          }
        }

        if (isCurrent) {
          setRecentMedicationNames(names)
          setRecentMedicationError(null)
        }
      } catch {
        if (isCurrent) {
          setRecentMedicationError(
            'Impossible de charger les médicaments récemment saisis.',
          )
        }
      }
    }

    void loadRecentMedicationNames()
    return () => {
      isCurrent = false
    }
  }, [])

  const registerField = (name: FieldPath<MedicationEntryFormValues>) =>
    register(name, {
      onChange: () => {
        setPendingEntry(null)
        clearErrors('root')
      },
    })
  const selectRecentMedication = (medicationName: string) => {
    setPendingEntry(null)
    clearErrors('root')
    setValue('medicationName', medicationName, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

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
    const takenAtDate = new Date(`${values.takenDate}T${values.takenTime}`)

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
    recentMedicationNames,
    recentMedicationError,
    pendingEntry,
    isSaving,
    onCancel,
    pageTitle: existingEntry ? 'Modifier une prise' : 'Ajouter une prise',
    submitLabel: existingEntry
      ? 'Enregistrer les modifications'
      : 'Enregistrer la prise',
    selectRecentMedication,
    confirmSave,
    cancelPendingSave,
  }
}

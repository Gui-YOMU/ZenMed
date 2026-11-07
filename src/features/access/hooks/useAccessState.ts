import { useCallback, useEffect, useState } from 'react'
import {
  createPin,
  hasPin,
  resetLocalData,
  verifyPin,
} from '../data/accessRepository'

export type AccessStatus = 'loading' | 'setup' | 'locked' | 'unlocked' | 'error'

interface UseAccessStateResult {
  status: AccessStatus
  isBusy: boolean
  errorMessage: string | null
  clearError: () => void
  createCredential: (pin: string) => Promise<void>
  unlock: (pin: string) => Promise<boolean>
  reset: () => Promise<void>
}

const ACCESS_ERROR_MESSAGE =
  'Une erreur est survenue lors de la vérification des données locales. Réessayez.'

export function useAccessState(): UseAccessStateResult {
  const [status, setStatus] = useState<AccessStatus>('loading')
  const [isBusy, setIsBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isCurrent = true

    const loadAccessStatus = async () => {
      try {
        const pinIsConfigured = await hasPin()

        if (isCurrent) {
          setStatus(pinIsConfigured ? 'locked' : 'setup')
        }
      } catch {
        if (isCurrent) {
          setStatus('error')
          setErrorMessage(ACCESS_ERROR_MESSAGE)
        }
      }
    }

    void loadAccessStatus()
    return () => {
      isCurrent = false
    }
  }, [])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setStatus((currentStatus) =>
          currentStatus === 'unlocked' ? 'locked' : currentStatus,
        )
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const createCredential = useCallback(async (pin: string) => {
    setIsBusy(true)
    setErrorMessage(null)

    try {
      await createPin(pin)
      setStatus('unlocked')
    } catch {
      setErrorMessage(ACCESS_ERROR_MESSAGE)
    } finally {
      setIsBusy(false)
    }
  }, [])

  const unlock = useCallback(async (pin: string) => {
    setIsBusy(true)
    setErrorMessage(null)

    try {
      const isPinCorrect = await verifyPin(pin)

      if (!isPinCorrect) {
        setErrorMessage('Code PIN incorrect. Réessayez.')
        return false
      }

      setStatus('unlocked')
      return true
    } catch {
      setErrorMessage(ACCESS_ERROR_MESSAGE)
      return false
    } finally {
      setIsBusy(false)
    }
  }, [])

  const reset = useCallback(async () => {
    setIsBusy(true)
    setErrorMessage(null)

    try {
      await resetLocalData()
      setStatus('setup')
    } catch {
      setErrorMessage(
        'Impossible d’effacer les données locales. Réessayez.',
      )
    } finally {
      setIsBusy(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setErrorMessage(null)
  }, [])

  return {
    status,
    isBusy,
    errorMessage,
    clearError,
    createCredential,
    unlock,
    reset,
  }
}

import { useCallback, useRef, useState } from 'react'
import { useAccessState } from './useAccessState'

const PIN_LENGTH = 6

export function useAccessPageViewModel() {
  const {
    status,
    isBusy,
    errorMessage,
    clearError,
    createCredential,
    unlock,
    reset,
  } = useAccessState()
  const [pin, setPin] = useState('')
  const [pinToConfirm, setPinToConfirm] = useState<string | null>(null)
  const [setupError, setSetupError] = useState<string | null>(null)
  const pinRef = useRef('')
  const isSubmittingPinRef = useRef(false)

  const submitPin = useCallback(
    async (enteredPin: string) => {
      pinRef.current = ''
      setPin('')

      try {
        if (status === 'setup') {
          if (pinToConfirm === null) {
            setPinToConfirm(enteredPin)
            setSetupError(null)
            return
          }

          if (enteredPin !== pinToConfirm) {
            setPinToConfirm(null)
            setSetupError('Les codes PIN ne correspondent pas. Recommencez.')
            return
          }

          await createCredential(enteredPin)
          setPinToConfirm(null)
          return
        }

        if (status === 'locked') {
          await unlock(enteredPin)
        }
      } finally {
        isSubmittingPinRef.current = false
      }
    },
    [createCredential, pinToConfirm, status, unlock],
  )

  const handleDigit = useCallback(
    (digit: string) => {
      if (
        isBusy ||
        isSubmittingPinRef.current ||
        pinRef.current.length >= PIN_LENGTH ||
        status === 'loading'
      ) {
        return
      }

      clearError()
      setSetupError(null)
      const nextPin = `${pinRef.current}${digit}`
      pinRef.current = nextPin
      setPin(nextPin)

      if (nextPin.length === PIN_LENGTH) {
        isSubmittingPinRef.current = true
        void submitPin(nextPin)
      }
    },
    [clearError, isBusy, status, submitPin],
  )

  const handleBackspace = useCallback(() => {
    if (isBusy) {
      return
    }

    clearError()
    setSetupError(null)
    pinRef.current = pinRef.current.slice(0, -1)
    setPin(pinRef.current)
  }, [clearError, isBusy])

  const handleForgotPin = useCallback(async () => {
    const confirmed = window.confirm(
      'La réinitialisation effacera toutes les données enregistrées sur cet appareil. Cette action est irréversible. Continuer ?',
    )

    if (confirmed) {
      pinRef.current = ''
      setPin('')
      setPinToConfirm(null)
      await reset()
    }
  }, [reset])

  const retry = useCallback(() => {
    window.location.reload()
  }, [])

  const displayError =
    setupError ?? (pin.length === 0 ? errorMessage : null)
  const isSettingUp = status === 'setup'
  const isConfirmingPin = isSettingUp && pinToConfirm !== null
  const title =
    status === 'unlocked'
      ? 'Accès déverrouillé'
      : isSettingUp
        ? 'Créer un code PIN'
        : 'App verrouillée'
  const instruction = isSettingUp
    ? isConfirmingPin
      ? 'Confirmez votre code PIN'
      : 'Choisissez un code PIN à 6 chiffres'
    : 'Saisissez votre code PIN'

  return {
    status,
    isBusy,
    pin,
    title,
    instruction,
    errorMessage,
    displayError,
    showForgotPin: status === 'locked',
    handleDigit,
    handleBackspace,
    handleForgotPin,
    retry,
  }
}

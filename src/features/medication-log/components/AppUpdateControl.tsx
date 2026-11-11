import { RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import ConfirmAppUpdateDialog from './ConfirmAppUpdateDialog'

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000

function AppUpdateControl() {
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null)
  const [isConfirmingUpdate, setIsConfirmingUpdate] = useState(false)
  const [isApplyingUpdate, setIsApplyingUpdate] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const {
    needRefresh: [isUpdateAvailable],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onNeedRefresh: () => setErrorMessage(null),
    onRegisteredSW: (_serviceWorkerUrl, nextRegistration) => {
      setRegistration(nextRegistration ?? null)
    },
    onRegisterError: () => {
      setErrorMessage(
        'Impossible de vérifier les mises à jour de l’application.',
      )
    },
  })

  useEffect(() => {
    if (!registration) {
      return
    }

    const checkForUpdate = () => {
      void registration
        .update()
        .then(() => setErrorMessage(null))
        .catch(() => {
          setErrorMessage(
            'Impossible de vérifier les mises à jour. Vérifiez votre connexion.',
          )
        })
    }

    checkForUpdate()
    const intervalId = window.setInterval(
      checkForUpdate,
      UPDATE_CHECK_INTERVAL_MS,
    )

    return () => window.clearInterval(intervalId)
  }, [registration])

  const applyUpdate = async () => {
    setIsApplyingUpdate(true)
    setErrorMessage(null)

    try {
      await updateServiceWorker(true)
    } catch {
      setIsApplyingUpdate(false)
      setIsConfirmingUpdate(false)
      setErrorMessage(
        'La mise à jour n’a pas pu être appliquée. Réessayez plus tard.',
      )
    }
  }

  return (
    <>
      <div className="flex flex-col items-end gap-1">
        <button
          aria-label={
            isUpdateAvailable
              ? 'Mettre à jour l’application'
              : 'Aucune mise à jour disponible'
          }
          className="inline-flex min-h-12 w-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-0 text-sm font-medium text-zenmed-blue transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 sm:w-auto sm:px-3"
          disabled={!isUpdateAvailable || isApplyingUpdate}
          onClick={() => setIsConfirmingUpdate(true)}
          title={
            isUpdateAvailable
              ? 'Une mise à jour est disponible'
              : 'Aucune mise à jour disponible'
          }
          type="button"
        >
          <RefreshCw aria-hidden="true" size={18} />
          <span className="sr-only sm:not-sr-only">
            {isUpdateAvailable ? 'Mettre à jour' : 'À jour'}
          </span>
        </button>
        {errorMessage ? (
          <p
            className="max-w-48 text-right text-xs text-red-700"
            role="status"
          >
            {errorMessage}
          </p>
        ) : null}
      </div>

      {isConfirmingUpdate ? (
        <ConfirmAppUpdateDialog
          isApplying={isApplyingUpdate}
          onCancel={() => setIsConfirmingUpdate(false)}
          onConfirm={() => void applyUpdate()}
        />
      ) : null}
    </>
  )
}

export default AppUpdateControl

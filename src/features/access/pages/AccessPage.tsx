import type { ReactNode } from 'react'
import PinEntry from '../components/PinEntry'
import { useAccessPageViewModel } from '../hooks/useAccessPageViewModel'

function AccessPage({ children }: { children?: ReactNode }) {
  const {
    status,
    isBusy,
    pin,
    title,
    instruction,
    errorMessage,
    displayError,
    showForgotPin,
    handleDigit,
    handleBackspace,
    handleForgotPin,
    retry,
  } = useAccessPageViewModel()

  if (status === 'unlocked' && children !== undefined) {
    return <>{children}</>
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-white px-6 py-10 text-slate-900">
      <section
        aria-labelledby="access-title"
        className="flex w-full max-w-sm flex-col items-center"
      >
        <img
          alt=""
          className="mb-5 size-20 rounded-2xl"
          height={80}
          src="/icons/icon-192.png"
          width={80}
        />
        <h1 className="text-3xl font-semibold tracking-tight text-zenmed-blue">
          ZenMed
        </h1>
        <h2
          className="mt-2 text-base font-medium text-slate-600"
          id="access-title"
        >
          {title}
        </h2>

        {status === 'loading' ? (
          <p aria-live="polite" className="mt-12 text-sm text-slate-600">
            Chargement…
          </p>
        ) : status === 'error' ? (
          <div className="mt-8 text-center">
            <p className="text-sm text-red-700" role="alert">
              {errorMessage}
            </p>
            <button
              className="mt-5 rounded-lg bg-zenmed-blue px-5 py-3 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
              onClick={retry}
              type="button"
            >
              Réessayer
            </button>
          </div>
        ) : status === 'unlocked' ? (
          <p aria-live="polite" className="mt-8 text-center text-sm text-slate-600">
            L’accès au journal sera disponible à l’étape suivante.
          </p>
        ) : (
          <>
            <p className="mt-10 text-center text-sm text-slate-600">
              {instruction}
            </p>
            <div className="mt-6 w-full">
              <PinEntry
                disabled={isBusy}
                errorMessage={displayError ?? undefined}
                onBackspace={handleBackspace}
                onDigit={handleDigit}
                value={pin}
              />
            </div>
            {showForgotPin ? (
              <button
                className="mt-8 rounded px-2 py-1 text-sm text-zenmed-blue underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue disabled:opacity-50"
                disabled={isBusy}
                onClick={() => void handleForgotPin()}
                type="button"
              >
                PIN oublié ?
              </button>
            ) : null}
          </>
        )}
      </section>
    </main>
  )
}

export default AccessPage

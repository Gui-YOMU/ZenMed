import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AppUpdateControl from '../components/AppUpdateControl'

const pwaState = vi.hoisted(() => ({
  isUpdateAvailable: false,
  updateServiceWorker: vi.fn<() => Promise<void>>(),
}))

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [pwaState.isUpdateAvailable, vi.fn()],
    offlineReady: [false, vi.fn()],
    updateServiceWorker: pwaState.updateServiceWorker,
  }),
}))

describe('AppUpdateControl', () => {
  beforeEach(() => {
    pwaState.isUpdateAvailable = false
    pwaState.updateServiceWorker.mockReset().mockResolvedValue(undefined)
  })

  afterEach(() => {
    cleanup()
  })

  it('désactive le bouton lorsqu’aucune mise à jour n’est disponible', () => {
    render(<AppUpdateControl />)

    expect(
      screen.getByRole('button', {
        name: 'Aucune mise à jour disponible',
      }),
    ).toBeDisabled()
  })

  it('demande confirmation avant d’appliquer une mise à jour disponible', () => {
    pwaState.isUpdateAvailable = true
    render(<AppUpdateControl />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Mettre à jour l’application' }),
    )

    expect(
      screen.getByRole('alertdialog', { name: 'Mise à jour disponible' }),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Plus tard' }))

    expect(
      screen.queryByRole('alertdialog', { name: 'Mise à jour disponible' }),
    ).not.toBeInTheDocument()
    expect(pwaState.updateServiceWorker).not.toHaveBeenCalled()
  })

  it('applique la mise à jour après confirmation', async () => {
    pwaState.isUpdateAvailable = true
    render(<AppUpdateControl />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Mettre à jour l’application' }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Mettre à jour' }))

    expect(pwaState.updateServiceWorker).toHaveBeenCalledWith(true)
  })

  it('signale une erreur si la mise à jour ne peut pas être appliquée', async () => {
    pwaState.isUpdateAvailable = true
    pwaState.updateServiceWorker.mockRejectedValue(new Error('Update failed'))
    render(<AppUpdateControl />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Mettre à jour l’application' }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Mettre à jour' }))

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(
        'La mise à jour n’a pas pu être appliquée. Réessayez plus tard.',
      )
    })
  })
})

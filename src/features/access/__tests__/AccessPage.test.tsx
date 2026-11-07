import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AccessPage from '../pages/AccessPage'
import { createPin, hasPin } from '../data/accessRepository'
import { database } from '../../../shared/storage/database'

function enterPin(pin: string) {
  act(() => {
    for (const digit of pin) {
      fireEvent.click(screen.getByRole('button', { name: digit }))
    }
  })
}

describe('AccessPage', () => {
  beforeEach(async () => {
    await database.delete()
    await database.open()
  })

  afterEach(async () => {
    cleanup()
    vi.restoreAllMocks()
    await database.delete()
  })

  it('creates a PIN only after the confirmation matches', async () => {
    render(<AccessPage />)

    await screen.findByText('Choisissez un code PIN à 6 chiffres')
    enterPin('123456')
    expect(
      await screen.findByText('Confirmez votre code PIN'),
    ).toBeInTheDocument()
    expect(await hasPin()).toBe(false)

    enterPin('654321')
    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent('Les codes PIN ne correspondent pas.')
    expect(await hasPin()).toBe(false)

    enterPin('123456')
    await screen.findByText('Confirmez votre code PIN')
    enterPin('123456')

    expect(
      await screen.findByText('Accès déverrouillé'),
    ).toBeInTheDocument()
    expect(await hasPin()).toBe(true)
  })

  it('rejects an incorrect PIN and unlocks with the saved PIN', async () => {
    await createPin('123456')
    render(<AccessPage />)

    await screen.findByText('Saisissez votre code PIN')
    enterPin('654321')
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Code PIN incorrect. Réessayez.',
    )

    enterPin('123456')
    expect(
      await screen.findByText('Accès déverrouillé'),
    ).toBeInTheDocument()
  })

  it('removes the last entered digit with the backspace key', async () => {
    render(<AccessPage />)
    await screen.findByText('Choisissez un code PIN à 6 chiffres')

    fireEvent.click(screen.getByRole('button', { name: '1' }))
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    fireEvent.click(screen.getByRole('button', { name: 'Retour arrière' }))

    expect(screen.getByRole('group', { name: '1 chiffre saisi sur 6' }))
      .toBeInTheDocument()
  })

  it('relocks the page after the document is hidden', async () => {
    await createPin('123456')
    render(
      <AccessPage>
        <p>Journal des prises</p>
      </AccessPage>,
    )
    await screen.findByText('Saisissez votre code PIN')
    enterPin('123456')
    expect(await screen.findByText('Journal des prises')).toBeInTheDocument()

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'hidden',
    })
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(await screen.findByText('Saisissez votre code PIN')).toBeInTheDocument()
    expect(screen.queryByText('Journal des prises')).not.toBeInTheDocument()
  })

  it('requires confirmation before resetting all local data', async () => {
    await createPin('123456')
    const confirmSpy = vi.spyOn(window, 'confirm')
    render(<AccessPage />)
    await screen.findByText('Saisissez votre code PIN')

    confirmSpy.mockReturnValue(false)
    fireEvent.click(screen.getByRole('button', { name: 'PIN oublié ?' }))
    expect(confirmSpy).toHaveBeenCalledOnce()
    expect(await hasPin()).toBe(true)
    expect(screen.getByText('Saisissez votre code PIN')).toBeInTheDocument()

    confirmSpy.mockReturnValue(true)
    fireEvent.click(screen.getByRole('button', { name: 'PIN oublié ?' }))

    await waitFor(async () => {
      expect(await hasPin()).toBe(false)
    })
    expect(
      await screen.findByText('Choisissez un code PIN à 6 chiffres'),
    ).toBeInTheDocument()
  })
})

import { beforeEach, describe, expect, it } from 'vitest'
import {
  createPin,
  hasPin,
  resetLocalData,
  verifyPin,
} from '../data/accessRepository'
import { accessRepositoryTest } from './helpers/accessRepositoryTest'

describe('access repository', () => {
  beforeEach(async () => {
    await accessRepositoryTest.resetDatabase()
  })

  it('stores a salted verifier instead of the PIN and verifies it', async () => {
    expect(await hasPin()).toBe(false)
    await createPin('123456')

    const credential = await accessRepositoryTest.readCredential()
    expect(credential).toBeDefined()
    expect(credential?.salt).toHaveLength(32)
    expect(credential?.verifier).toHaveLength(64)
    expect(credential?.verifier).not.toBe('123456')
    expect(await hasPin()).toBe(true)
    expect(await verifyPin('123456')).toBe(true)
    expect(await verifyPin('654321')).toBe(false)
    expect(await verifyPin('12345')).toBe(false)
  })

  it('rejects invalid PINs when creating a credential', async () => {
    await expect(createPin('12345')).rejects.toThrow(
      'Le PIN doit contenir exactement six chiffres.',
    )
    expect(await hasPin()).toBe(false)
  })

  it('deletes the local database when resetting access', async () => {
    await createPin('123456')

    await resetLocalData()

    expect(await hasPin()).toBe(false)
    expect(await verifyPin('123456')).toBe(false)
    await createPin('654321')
    expect(await verifyPin('654321')).toBe(true)
  })
})

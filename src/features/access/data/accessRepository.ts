import { database } from '../../../shared/storage/database'
import { isValidPin } from '../model/pinRules'

const PBKDF2_ITERATIONS = 600_000
const SALT_LENGTH = 16
const VERIFIER_LENGTH = 32

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(hex.length / 2)

  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16)
  }

  return bytes
}

async function deriveVerifier(
  pin: string,
  salt: Uint8Array<ArrayBuffer>,
): Promise<Uint8Array<ArrayBuffer>> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(pin),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations: PBKDF2_ITERATIONS,
    },
    keyMaterial,
    VERIFIER_LENGTH * 8,
  )

  return new Uint8Array(bits)
}

function areBytesEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) {
    return false
  }

  let difference = 0

  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index]
  }

  return difference === 0
}

export async function hasPin(): Promise<boolean> {
  return (await database.pinCredentials.count()) > 0
}

export async function createPin(pin: string): Promise<void> {
  if (!isValidPin(pin)) {
    throw new Error('Le PIN doit contenir exactement six chiffres.')
  }

  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const verifier = await deriveVerifier(pin, salt)

  await database.pinCredentials.put({
    id: 'pin',
    salt: bytesToHex(salt),
    verifier: bytesToHex(verifier),
  })
}

export async function verifyPin(pin: string): Promise<boolean> {
  if (!isValidPin(pin)) {
    return false
  }

  const credential = await database.pinCredentials.get('pin')

  if (!credential) {
    return false
  }

  const verifier = await deriveVerifier(pin, hexToBytes(credential.salt))
  return areBytesEqual(verifier, hexToBytes(credential.verifier))
}

export async function resetLocalData(): Promise<void> {
  await database.delete()
  await database.open()
}

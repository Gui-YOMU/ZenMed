import { describe, expect, it } from 'vitest'
import { isValidPin } from '../model/pinRules'

describe('isValidPin', () => {
  it.each(['000000', '123456', '999999'])('accepte un code PIN à six chiffres : %s', (pin) => {
    expect(isValidPin(pin)).toBe(true)
  })

  it.each(['', '12345', '1234567', '12a456', ' 12345', '１２３４５６'])(
    'refuse un code PIN invalide : %s',
    (pin) => {
      expect(isValidPin(pin)).toBe(false)
    },
  )
})

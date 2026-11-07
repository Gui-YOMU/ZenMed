import { Delete } from 'lucide-react'

interface PinKeypadProps {
  onDigit: (digit: string) => void
  onBackspace: () => void
  disabled?: boolean
}

function PinKeypad({
  onDigit,
  onBackspace,
  disabled = false,
}: PinKeypadProps) {
  return (
    <div
      aria-label="Clavier numérique du code PIN"
      className="mx-auto grid w-full max-w-xs grid-cols-3 gap-3"
      role="group"
    >
      {Array.from({ length: 9 }, (_, index) => {
        const digit = String(index + 1)

        return (
          <button
            className="flex aspect-square items-center justify-center rounded-full bg-blue-50 text-2xl font-medium text-zenmed-blue transition-colors hover:bg-zenmed-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled}
            key={digit}
            onClick={() => onDigit(digit)}
            type="button"
          >
            {digit}
          </button>
        )
      })}
      <span aria-hidden="true" />
      <button
        className="flex aspect-square items-center justify-center rounded-full bg-blue-50 text-2xl font-medium text-zenmed-blue transition-colors hover:bg-zenmed-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
        onClick={() => onDigit('0')}
        type="button"
      >
        0
      </button>
      <button
        aria-label="Retour arrière"
        className="flex aspect-square items-center justify-center rounded-full bg-blue-50 text-zenmed-blue transition-colors hover:bg-zenmed-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
        onClick={onBackspace}
        type="button"
      >
        <Delete aria-hidden="true" size={24} />
      </button>
    </div>
  )
}

export default PinKeypad

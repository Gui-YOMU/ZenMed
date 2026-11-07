import PinDots from './PinDots'
import PinKeypad from './PinKeypad'

interface PinEntryProps {
  value: string
  onDigit: (digit: string) => void
  onBackspace: () => void
  errorMessage?: string
  disabled?: boolean
}

function PinEntry({
  value,
  onDigit,
  onBackspace,
  errorMessage,
  disabled = false,
}: PinEntryProps) {
  return (
    <div className="flex w-full flex-col items-center gap-8">
      <PinDots hasError={Boolean(errorMessage)} value={value} />
      {errorMessage ? (
        <p aria-live="assertive" className="-mb-4 text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <PinKeypad
        disabled={disabled}
        onBackspace={onBackspace}
        onDigit={onDigit}
      />
    </div>
  )
}

export default PinEntry

const PIN_LENGTH = 6

interface PinDotsProps {
  value: string
  hasError?: boolean
}

function PinDots({ value, hasError = false }: PinDotsProps) {
  const statusText = hasError
    ? 'Code PIN incorrect'
    : `${value.length} chiffre${value.length === 1 ? '' : 's'} saisi${
        value.length === 1 ? '' : 's'
      } sur ${PIN_LENGTH}`

  return (
    <div
      aria-label={statusText}
      className="flex items-center justify-center gap-4"
      role="group"
    >
      <span aria-live="polite" className="sr-only">
        {statusText}
      </span>
      {Array.from({ length: PIN_LENGTH }, (_, index) => (
        <span
          aria-hidden="true"
          className={`size-3 rounded-full border-2 ${
            hasError
              ? 'border-red-600'
              : index < value.length
                ? 'border-zenmed-blue bg-zenmed-blue'
                : 'border-zenmed-blue bg-white'
          }`}
          key={index}
        />
      ))}
    </div>
  )
}

export default PinDots

import { Pill } from 'lucide-react'
import type { GalenicForm } from '../model/medicationEntry'

interface GalenicFormIconProps {
  form: GalenicForm
}

function GalenicFormIcon({ form }: GalenicFormIconProps) {
  return (
    <span
      aria-label={`Forme galénique : ${form}`}
      className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-zenmed-blue text-white"
      role="img"
    >
      {form === 'comprimé' ? (
        <svg
          aria-hidden="true"
          fill="none"
          height="23"
          viewBox="0 0 24 24"
          width="23"
        >
          <circle
            cx="12"
            cy="12"
            r="8"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M4 12h16"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      ) : form === 'gélule' ? (
        <Pill aria-hidden="true" size={23} strokeWidth={1.8} />
      ) : (
        <svg
          aria-hidden="true"
          fill="none"
          height="23"
          viewBox="0 0 24 24"
          width="23"
        >
          <path
            d="M7 3.75h10l1 3.5v13H6v-13l1-3.5Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <path
            d="M6.5 7.25h11M9 10.5h6M9 13.5h6"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      )}
    </span>
  )
}

export default GalenicFormIcon

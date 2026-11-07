import { ArrowLeft, CalendarDays } from 'lucide-react'

interface MedicationPageHeaderBaseProps {
  title: string
  subtitle: string
}

type MedicationPageHeaderProps = MedicationPageHeaderBaseProps &
  (
    | {
        onBack: () => void
        selectedDate?: never
        onDateChange?: never
      }
    | {
        onBack?: never
        selectedDate: string
        onDateChange: (date: string) => void
      }
  )

function MedicationPageHeader({
  title,
  subtitle,
  onBack,
  selectedDate,
  onDateChange,
}: MedicationPageHeaderProps) {
  const isJournalHeader = selectedDate !== undefined

  return (
    <header className="border-b border-slate-200 bg-white">
      <div
        className={`mx-auto w-full max-w-3xl px-4 sm:px-6 ${
          isJournalHeader
            ? 'flex items-center justify-between gap-4 py-5 sm:py-6'
            : 'py-4 sm:py-5'
        }`}
      >
        <div>
          {onBack ? (
            <button
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 font-medium text-zenmed-blue transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
              onClick={onBack}
              type="button"
            >
              <ArrowLeft aria-hidden="true" size={18} />
              Retour au journal
            </button>
          ) : null}
          <div
            className={`flex items-center gap-3 ${
              onBack ? 'mt-4' : ''
            }`}
          >
            <img
              alt=""
              className="size-12 shrink-0 rounded-xl"
              height={48}
              src="/icons/icon-192.png"
              width={48}
            />
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {title}
              </h1>
              <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
            </div>
          </div>
        </div>
        {isJournalHeader ? (
          <label className="relative flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-zenmed-blue transition-colors hover:bg-blue-50 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-zenmed-blue">
            <span className="sr-only">Choisir une date</span>
            <CalendarDays aria-hidden="true" size={22} />
            <input
              aria-label="Choisir une date"
              className="absolute inset-0 size-full cursor-pointer opacity-0"
              onChange={(event) => onDateChange(event.currentTarget.value)}
              type="date"
              value={selectedDate}
            />
          </label>
        ) : null}
      </div>
    </header>
  )
}

export default MedicationPageHeader

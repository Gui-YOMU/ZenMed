import { BarChart3 } from 'lucide-react'
import type { MedicationStatistic } from '../model/medicationStatistics'

interface MedicationStatisticsSummaryProps {
  statistics: MedicationStatistic[]
}

function MedicationStatisticsSummary({
  statistics,
}: MedicationStatisticsSummaryProps) {
  return (
    <section
      aria-labelledby="medication-statistics-title"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-zenmed-blue">
          <BarChart3 aria-hidden="true" size={20} />
        </span>
        <h2
          className="text-lg font-semibold text-slate-900"
          id="medication-statistics-title"
        >
          Récapitulatif par période
        </h2>
      </div>
      <dl className="mt-5 grid gap-3 sm:grid-cols-3">
        {statistics.map((statistic) => (
          <div
            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            key={statistic.period}
          >
            <dt className="text-sm font-medium text-slate-600">
              {statistic.label}
            </dt>
            <dd className="mt-2 text-3xl font-semibold tabular-nums text-zenmed-blue">
              {statistic.count}
              <span className="sr-only">
                {' '}
                {statistic.count === 1 ? 'prise' : 'prises'}
              </span>
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-sm leading-5 text-slate-600">
        Valeurs calculées à partir de l’historique de l’application, toutes
        formes galéniques confondues.
      </p>
    </section>
  )
}

export default MedicationStatisticsSummary

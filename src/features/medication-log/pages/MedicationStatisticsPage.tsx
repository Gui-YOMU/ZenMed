import {
  ClipboardList,
  RotateCw,
} from 'lucide-react'
import MedicationPageHeader from '../components/MedicationPageHeader'
import MedicationRecentEntries from '../components/MedicationRecentEntries'
import MedicationStatisticsSummary from '../components/MedicationStatisticsSummary'
import { useMedicationStatisticsPageViewModel } from '../hooks/useMedicationStatisticsPageViewModel'

interface MedicationStatisticsPageProps {
  onBack: () => void
  initialMedication: string
}

function MedicationStatisticsPage({
  onBack,
  initialMedication,
}: MedicationStatisticsPageProps) {
  const {
    errorMessage,
    hasEntries,
    isLoading,
    loadEntries,
    selectedMedication,
    statistics,
    recentEntries,
    hasMoreEntries,
    loadMoreEntries,
  } = useMedicationStatisticsPageViewModel(initialMedication || null)

  return (
    <main className="min-h-svh bg-slate-50 text-slate-900">
      <MedicationPageHeader
        onBack={onBack}
        subtitle="Statistiques du traitement"
        title={selectedMedication ?? 'Statistiques'}
      />

      <section
        aria-label="Statistiques par médicament"
        className="mx-auto w-full max-w-3xl space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-8"
      >
        {isLoading ? (
          <p aria-live="polite" className="text-sm text-slate-600" role="status">
            Chargement des prises…
          </p>
        ) : errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-red-700" role="alert">
              {errorMessage}
            </p>
            <button
              className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-xl bg-zenmed-blue px-5 py-3 font-medium text-white transition-colors hover:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zenmed-blue"
              onClick={() => void loadEntries()}
              type="button"
            >
              <RotateCw aria-hidden="true" size={17} />
              Réessayer
            </button>
          </div>
        ) : !hasEntries ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-blue-50 text-zenmed-blue">
              <ClipboardList aria-hidden="true" size={26} />
            </span>
            <h2 className="mt-4 font-semibold text-slate-800">
              Aucune prise enregistrée pour le moment.
            </h2>
            <p className="mt-1 max-w-xs text-sm leading-6 text-slate-600">
              Vos statistiques apparaîtront ici après vos premières prises.
            </p>
          </div>
        ) : (
          <>
            {selectedMedication ? (
              <>
                <MedicationStatisticsSummary statistics={statistics} />
                <MedicationRecentEntries
                  entries={recentEntries}
                  hasMore={hasMoreEntries}
                  onLoadMore={loadMoreEntries}
                />
              </>
            ) : (
              <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
                Ouvrez les statistiques depuis la recherche du journal en
                sélectionnant un médicament.
              </p>
            )}
          </>
        )}
      </section>
    </main>
  )
}

export default MedicationStatisticsPage

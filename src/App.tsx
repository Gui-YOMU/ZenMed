import { useState } from 'react'
import AccessPage from './features/access/pages/AccessPage'
import MedicationLogPage from './features/medication-log/pages/MedicationLogPage'
import MedicationStatisticsPage from './features/medication-log/pages/MedicationStatisticsPage'

function App() {
  const [statisticsRequest, setStatisticsRequest] = useState<{
    medicationName?: string
  } | null>(null)

  return (
    <AccessPage>
      {statisticsRequest !== null ? (
        <MedicationStatisticsPage
          initialMedication={statisticsRequest.medicationName ?? ''}
          onBack={() => setStatisticsRequest(null)}
        />
      ) : (
        <MedicationLogPage
          onShowStatistics={(medicationName) =>
            setStatisticsRequest({ medicationName })
          }
        />
      )}
    </AccessPage>
  )
}

export default App

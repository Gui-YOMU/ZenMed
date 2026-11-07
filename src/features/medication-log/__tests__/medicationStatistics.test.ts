import { describe, expect, it } from 'vitest'
import { getMedicationStatistics } from '../model/medicationStatistics'

describe('getMedicationStatistics', () => {
  it('counts selected medication entries within rolling periods', () => {
    const now = new Date('2026-11-07T12:00:00')
    const entries = [
      {
        medicationName: 'Doliprane',
        form: 'comprimé' as const,
        dose: 500,
        doseUnit: 'mg' as const,
        takenAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        medicationName: 'doliprane',
        form: 'comprimé' as const,
        dose: 500,
        doseUnit: 'mg' as const,
        takenAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        medicationName: 'Doliprane',
        form: 'comprimé' as const,
        dose: 500,
        doseUnit: 'mg' as const,
        takenAt: new Date(now.getTime() - 200 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        medicationName: 'Ibuprofène',
        form: 'gélule' as const,
        dose: 200,
        doseUnit: 'mg' as const,
        takenAt: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
      },
      {
        medicationName: 'Doliprane',
        form: 'comprimé' as const,
        dose: 500,
        doseUnit: 'mg' as const,
        takenAt: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
      },
    ]

    expect(getMedicationStatistics(entries, ' doliprane ', now)).toEqual([
      { period: '7-days', label: '7 derniers jours', count: 1 },
      { period: '30-days', label: '30 derniers jours', count: 2 },
      { period: '12-months', label: '12 derniers mois', count: 3 },
    ])
  })

  it('includes an entry exactly at the start of each period', () => {
    const now = new Date('2026-11-07T12:00:00')
    const entry = {
      medicationName: 'Doliprane',
      form: 'comprimé' as const,
      dose: 500,
      doseUnit: 'mg' as const,
      takenAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    }

    expect(getMedicationStatistics([entry], 'Doliprane', now)[0].count).toBe(1)
  })
})

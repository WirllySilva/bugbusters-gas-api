import { analyzeConsumption } from './ConsumptionAnalysis'
import { AlertRepository } from './AlertRepository'

export class AlertService {
  async checkForLeak(data: {
    providerId: string
    previousLevel: number
    currentLevel: number
    minutesBetween: number
  }) {
    const analysis = analyzeConsumption(data)

    if (!analysis.isAbnormal) {
      return null
    }

    const severity =
      analysis.drop > analysis.expectedDrop * 6 ? 'high' : 'medium'

    return AlertRepository.create({
      providerId: data.providerId,
      type: 'gas_leak',
      severity,
      message: `Queda anormal detectada: ${analysis.drop}%`,
    })
  }
}
